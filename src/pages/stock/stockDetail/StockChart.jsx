import React, { useEffect, useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockChart = ({ chartData, periodType }) => {
  const [data, setData] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [basePrice, setBasePrice] = useState(0);

  const formatTimeStr = (timeStr) => {
    // HHMMSS -> HH:MM
    if (!timeStr || timeStr.length < 4) return null;
    return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}`;
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      // YYYYMMDD 형식 체크
      if (typeof dateStr === 'string' && dateStr.length === 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
  
        switch (periodType) {
          case 'DAILY':
            return `${month}/${day}`;
          case 'WEEKLY':
            return `${month}/${day}`;
          case 'MONTHLY':
            return `${year}.${month}`;
          case 'YEARLY':
            return year;
          default:
            return `${month}/${day}`;
        }
      }
      return dateStr;
    } catch (e) {
      console.error('날짜 포맷 에러:', e);
      return dateStr;
    }
  };

  const parseTimeData = (rawData) => {
    if (!rawData?.output1 || !rawData?.output2 || !Array.isArray(rawData.output2)) {
      console.log('Invalid time data structure:', rawData);
      return null;
    }
  
    // 전일 종가 설정
    const currentPrice = parseFloat(rawData.output1?.stck_prpr || 0);
    const priceChange = parseFloat(rawData.output1?.prdy_vrss || 0);
    setBasePrice(currentPrice - priceChange);
  
    // output2 데이터 가공
    const timeData = [...rawData.output2]
      .map(item => {
        const hour = item.stck_cntg_hour.slice(0, 2);
        const minute = item.stck_cntg_hour.slice(2, 4);
        return {
          time: `${hour}:${minute}`,
          price: parseFloat(item.stck_prpr)
        };
      })
      .reverse();  // 시간 순서대로 정렬하기 위해 역순으로 변경
  
    return timeData;
  };


  const parsePeriodData = (rawData) => {
    if (!rawData?.candles || !Array.isArray(rawData.candles) || rawData.candles.length === 0) {
      console.log('Invalid period data structure:', rawData);
      return null;
    }

    // 첫 번째 캔들의 종가를 기준가로 설정
    setBasePrice(rawData.candles[0].close);

    // 기간별 데이터는 역순으로 정렬 (최신 데이터가 앞으로)
    return [...rawData.candles]
        .reverse()
        .map(candle => ({
          time: formatDateLabel(candle.time),
          price: candle.close
        }));
    };
   
    
  const formatPrice = (value) => {
    if (!value && value !== 0) return '';
    return new Intl.NumberFormat('ko-KR', {
      maximumFractionDigits: 0
    }).format(value);
  };

  useEffect(() => {
    if (!chartData) return;
    
    console.log('Chart data received:', chartData);
    
    // 데이터 파싱
    const parsedData = periodType === 'TIME' ? 
      parseTimeData(chartData) : 
      parsePeriodData(chartData);

    if (!parsedData || parsedData.length === 0) return;

    // 가격 범위 계산
    const prices = parsedData
      .map(item => item.price)
      .filter(price => price !== null && !isNaN(price));
    
    if (prices.length === 0) return;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceMargin = periodType === 'TIME' 
    ? maxPrice * 0.02  // 현재가 기준 ±2%
    : (maxPrice - minPrice) * 0.1;
  
  setPriceRange({ 
    min: Math.floor((minPrice - priceMargin) / 100) * 100,
    max: Math.ceil((maxPrice + priceMargin) / 100) * 100
  });

    // 상승/하락 여부 확인
    const isPositive = periodType === 'TIME' ?
      parseFloat(chartData.output1?.prdy_vrss || 0) >= 0 :
      (chartData.summary?.changePrice ?? 0) >= 0;

    // 차트 설정
    const chartConfig = {
      labels: parsedData.map(item => item.time),
      datasets: [
        {
          label: '주가',
          data: parsedData.map(item => item.price),
          borderColor: isPositive ? "#d24f45" : "#1261c4",
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, isPositive ? "rgba(210, 79, 69, 0.1)" : "rgba(18, 97, 196, 0.1)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            return gradient;
          },
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.1,
          fill: true,
        }
      ],
    };

    setData(chartConfig);
  }, [chartData, periodType]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 0
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: {
          top: 8,
          right: 12,
          bottom: 8,
          left: 12
        },
        displayColors: false,
        callbacks: {
          title: (items) => items[0].label,
          label: (context) => {
            const value = context.raw;
            const diff = value - basePrice;
            const diffPercent = ((diff / basePrice) * 100).toFixed(2);
            const sign = diff >= 0 ? '+' : '';
            
            return [
              `현재가: ${formatPrice(value)}`,
              `전일대비: ${sign}${formatPrice(diff)} (${sign}${diffPercent}%)`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: periodType === 'TIME' ? 6 : 8,
          color: '#666',
          font: {
            size: 11,
          }
        }
      },
      y: {
        position: 'right',
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        border: {
          display: false
        },
        ticks: {
          color: '#666',
          font: {
            size: 11,
          },
          callback: formatPrice,
          padding: 8,
        },
        min: priceRange.min,
        max: priceRange.max,
      }
    }
  }), [priceRange, basePrice, periodType]);

  if (!chartData || !data) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-400">데이터를 불러오는 중...</p>
      </div>
    );
  }

  // 현재가 정보 계산
  let currentPrice, priceChange, changePercent;

  if (periodType === 'TIME') {
    currentPrice = parseFloat(chartData.output1?.stck_prpr || 0);
    priceChange = parseFloat(chartData.output1?.prdy_vrss || 0);
    changePercent = parseFloat(chartData.output1?.prdy_ctrt || 0);
  } else if (chartData.candles && chartData.candles.length > 0) {
    currentPrice = chartData.candles[0].close;
    priceChange = chartData.summary?.changePrice || 0;
    changePercent = chartData.summary?.changeRate || 0;
  }

  const isPositive = priceChange >= 0;
  const changeColor = isPositive ? 'text-red-500' : 'text-blue-500';

  return (
    <div className="bg-white rounded-xl p-4 space-y-4">
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${changeColor}`}>
            {formatPrice(currentPrice)}
          </span>
          <span className="text-sm text-gray-600">KRW</span>
        </div>
        <div className={`flex items-center gap-2 ${changeColor}`}>
          <span className="text-sm">
            {isPositive ? '▲' : '▼'} {Math.abs(priceChange).toLocaleString()}
          </span>
          <span className="text-sm">
            ({Math.abs(changePercent)}%)
          </span>
        </div>
      </div>

      <div className="h-64">
        <Line data={data} options={options} />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <div>최저 {formatPrice(priceRange.min)}</div>
        <div>최고 {formatPrice(priceRange.max)}</div>
      </div>
    </div>
  );
};

export default StockChart;