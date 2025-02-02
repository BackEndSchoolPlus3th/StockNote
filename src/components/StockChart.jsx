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

  // 시간별 데이터 파싱 (9:00 ~ 15:30)
  const parseTimeData = (candles) => {
    const uniqueData = {};
    const lastValidData = { time: null, close: null };
    
    // 장 시작(9:00)부터 장 마감(15:30)까지의 모든 시간 초기화
    for (let hour = 9; hour <= 15; hour++) {
      const maxMinute = hour === 15 ? 30 : 59;
      for (let minute = 0; minute <= maxMinute; minute++) {
        const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        uniqueData[formattedTime] = { 
          time: formattedTime,
          close: null,
          volume: 0
        };
      }
    }

    

    // API 데이터 반영
    candles.forEach(item => {
      const formattedTime = `${item.time.slice(0, 2)}:${item.time.slice(2, 4)}`;
      if (uniqueData[formattedTime]) {
        uniqueData[formattedTime] = {
          time: formattedTime,
          close: parseFloat(item.close),
          volume: parseInt(item.volume) || 0
        };
        lastValidData.time = formattedTime;
        lastValidData.close = parseFloat(item.close);
      }
    });

    // 빈 데이터를 마지막 유효 데이터로 채우기
    Object.keys(uniqueData).forEach(time => {
      if (uniqueData[time].close === null && lastValidData.close !== null) {
        uniqueData[time].close = lastValidData.close;
      }
    });

    return Object.values(uniqueData);
  };

  const formatDateLabel = (dateStr, type) => {
    if (!dateStr) return '';
    
    let date;
    try {
      // YYYYMMDD 형식 체크
      if (typeof dateStr === 'string' && dateStr.length === 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        date = new Date(year, parseInt(month) - 1, day);
      } else {
        date = new Date(dateStr);
      }

      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateStr);
        return dateStr;
      }

      switch (type) {
        case 'TIME':
          return dateStr; // HH:mm 형식 유지
        case 'DAILY':
          return `${date.getMonth() + 1}/${date.getDate()}`;
        case 'WEEKLY':
          return `${date.getMonth() + 1}/${date.getDate()}`;
        case 'MONTHLY':
          return `${date.getFullYear()}/${date.getMonth() + 1}`;
        case 'YEARLY':
          return date.getFullYear().toString();
        default:
          return dateStr;
      }
    } catch (e) {
      console.error('날짜 포맷 에러:', e);
      return dateStr;
    }
  };

  const parsePeriodData = (candles) => {
    if (!candles || candles.length === 0) return [];
  
    const parsedData = candles.map(item => ({
      time: formatDateLabel(item.time, periodType),
      close: parseFloat(item.close),
      volume: parseInt(item.volume) || 0
    }));
  
    // 날짜를 반대로 출력하려면 이곳에서 배열을 뒤집기
    parsedData.reverse();
  
    return parsedData;
  };
  

  const formatPrice = (value) => {
    if (!value && value !== 0) return '';
    return new Intl.NumberFormat('ko-KR', {
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatVolume = (value) => {
    if (!value && value !== 0) return '';
    return new Intl.NumberFormat('ko-KR', {
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  };

  useEffect(() => {
    if (chartData && chartData.candles && chartData.candles.length > 0) {
      const parsedData = periodType === 'TIME' 
        ? parseTimeData(chartData.candles)
        : parsePeriodData(chartData.candles);

      // 가격 범위 계산
      const prices = parsedData.map(item => item.close).filter(price => price !== null);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setPriceRange({ min: minPrice, max: maxPrice });

      // 차트 데이터 구성
      const chartConfig = {
        labels: parsedData.map(item => item.time),
        datasets: [{
          label: chartData.stockName || chartData.stockCode,
          data: parsedData.map(item => item.close),
          borderColor: prices[prices.length - 1] >= prices[0] ? "#FF4560" : "#2E93FA",
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            const isPositive = prices[prices.length - 1] >= prices[0];
            gradient.addColorStop(0, isPositive ? "rgba(255, 69, 96, 0.1)" : "rgba(46, 147, 250, 0.1)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            return gradient;
          },
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
        }],
      };

      setData(chartConfig);
    }
  }, [chartData, periodType]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        displayColors: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold',
          family: "'Pretendard', sans-serif"
        },
        bodyFont: {
          size: 12,
          family: "'Pretendard', sans-serif"
        },
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (context) => {
            return `${formatPrice(context.raw)}원`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: periodType === 'TIME' ? 6 : 8,
          font: {
            size: 11,
            family: "'Pretendard', sans-serif"
          },
          color: '#999'
        }
      },
      y: {
        position: 'right',
        grid: {
          color: '#f0f0f0',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Pretendard', sans-serif"
          },
          color: '#999',
          callback: formatPrice
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }), [periodType]);

  const renderPriceSummary = () => {
    if (!chartData || !chartData.summary) return null;
    
    const isPositive = chartData.summary.changeRate >= 0;
    const changeSymbol = isPositive ? '▲' : '▼';
    const changeColor = isPositive ? 'text-red-500' : 'text-blue-500';
    const currentPrice = chartData.candles[chartData.candles.length - 1]?.close;

    return (
      <div className="space-y-1">
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-bold ${changeColor}`}>
            {formatPrice(currentPrice)}
          </span>
          <span className="text-sm text-gray-600">원</span>
        </div>
        <div className={`flex items-center space-x-2 text-sm ${changeColor}`}>
          <span>{changeSymbol} {formatPrice(Math.abs(chartData.summary.changePrice))}원</span>
          <span>({Math.abs(chartData.summary.changeRate).toFixed(2)}%)</span>
        </div>
      </div>
    );
  };

  if (!data) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-400">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="mb-6">
        {renderPriceSummary()}
      </div>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
      <div className="flex justify-between mt-4 text-xs text-gray-500">
        <div>최저 {formatPrice(priceRange.min)}원</div>
        <div>최고 {formatPrice(priceRange.max)}원</div>
      </div>
    </div>
  );
};

export default StockChart;