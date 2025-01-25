import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const MarketChart = () => {
  const [expanded, setExpanded] = useState({
    kospi: true,
    kosdaq: false,
    kospi200: false
  });

  const [indexData, setIndexData] = useState({
    kospi: null,
    kosdaq: null,
    kospi200: null
  });

  const [detailData, setDetailData] = useState({
    kospi: null,
    kosdaq: null,
    kospi200: null
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kospiRes, kosdaqRes, kospi200Res] = await Promise.all([
          axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/filtered/kospi`),
          axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/filtered/kosdaq`),
          axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/filtered/kospi200`)
        ]);

        setIndexData({
          kospi: kospiRes.data,
          kosdaq: kosdaqRes.data,
          kospi200: kospi200Res.data
        });

        const [kospiDetailRes, kosdaqDetailRes, kospi200DetailRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/kospi`),
          axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/kosdaq`),
          axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/kospi200`)
        ]);

        setDetailData({
          kospi: kospiDetailRes.data,
          kosdaq: kosdaqDetailRes.data,
          kospi200: kospi200DetailRes.data
        });

      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderInvestorData = (key) => {
    const data = detailData[key]?.output;
    if (!data) return null;

    return (
      <div className="mt-4 space-y-2">
        <div className="grid grid-cols-4 text-sm border rounded-lg overflow-hidden">
          <div className="p-2 bg-gray-50">구분</div>
          <div className="col-span-3 grid grid-cols-3 divide-x">
            <div className="p-2 bg-gray-50 text-center">개인</div>
            <div className="p-2 bg-gray-50 text-center">외국인</div>
            <div className="p-2 bg-gray-50 text-center">기관</div>
          </div>
          <div className="p-2">순매수</div>
          <div className="col-span-3 grid grid-cols-3 divide-x">
            <div className="p-2 text-center text-blue-500">
              {Number(data.total_askp_rsqn).toLocaleString()}
            </div>
            <div className="p-2 text-center text-red-500">
              {Number(data.total_bidp_rsqn).toLocaleString()}
            </div>
            <div className="p-2 text-center text-blue-500">
              {Number(data.ntby_rsqn).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChart = (key) => {
    const data = detailData[key]?.output;
    if (!data) return null;

    const chartData = [
      { time: '시가', value: Number(data.bstp_nmix_oprc) },
      { time: '현재가', value: Number(data.bstp_nmix_prpr) },
      { time: '고가', value: Number(data.bstp_nmix_hgpr) },
      { time: '저가', value: Number(data.bstp_nmix_lwpr) }
    ];

    const isPositive = data.prdy_vrss_sign === '2';
    const chartColor = isPositive ? "#ef4444" : "#3b82f6";

    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.1} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              orientation="right"
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              fillOpacity={1}
              fill={`url(#color${key})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderIndex = (key, data) => {
    if (!data) return null;

    const isPositive = data.changeDirection === "▲";
    const changeColor = isPositive ? "text-red-500" : "text-blue-500";

    return (
      <div key={key} className="border-b last:border-b-0">
        <div
          className="p-4 cursor-pointer"
          onClick={() => setExpanded({ ...expanded, [key]: !expanded[key] })}
        >
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{data.indexName}</span>
            {expanded[key] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold">{Number(data.currentValue).toLocaleString()}</span>
            <span className={changeColor}>
              {data.changeDirection} {Number(data.changeAmount).toLocaleString()} ({data.changeRate}%)
            </span>
          </div>
        </div>

        {expanded[key] && (
          <div className="px-4 pb-4">
            {renderChart(key)}
            {renderInvestorData(key)}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-xl font-bold">오늘의 증시</h2>
      </div>
      <div>
        {Object.entries(indexData).map(([key, data]) => renderIndex(key, data))}
      </div>
    </div>
  );
};

export default MarketChart;