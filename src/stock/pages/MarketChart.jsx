import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MarketChart = () => {
  const [expanded, setExpanded] = useState({
    kospi: true,
    kosdaq: false,
    kospi200: false
  });

  // 샘플 데이터
  const chartData = [
    { time: '10:00', value: 2525 },
    { time: '11:00', value: 2530 },
    { time: '12:00', value: 2528 },
    { time: '13:00', value: 2520 },
    { time: '14:00', value: 2522 }
  ];

  const indexData = {
    kospi: {
      name: '코스피',
      value: '2,522.13',
      change: '25.32',
      changeRate: '1.01',
      isUp: true,
      investorData: {
        individual: { value: -4417, subValue: 0 },
        foreign: { value: 4156, subValue: 561 },
        institution: { value: -241, subValue: 331 }
      }
    },
    kosdaq: {
      name: '코스닥',
      value: '742.02',
      change: '25.32',
      changeRate: '1.01',
      isUp: true
    },
    kospi200: {
      name: '코스피 200',
      value: '335.27',
      change: '25.32',
      changeRate: '1.01',
      isUp: true
    }
  };

  const renderInvestorData = () => (
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
          <div className="p-2 text-center text-blue-500">-4,417</div>
          <div className="p-2 text-center text-red-500">+4,156</div>
          <div className="p-2 text-center text-blue-500">-241</div>
        </div>
        <div className="p-2">프로그램</div>
        <div className="col-span-3 grid grid-cols-3 divide-x">
          <div className="p-2 text-center">0</div>
          <div className="p-2 text-center text-red-500">561</div>
          <div className="p-2 text-center text-blue-500">331</div>
        </div>
      </div>
    </div>
  );

  const renderIndex = (key, data) => (
    <div key={key} className="border-b last:border-b-0">
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded({ ...expanded, [key]: !expanded[key] })}
      >
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{data.name}</span>
          {expanded[key] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-2xl font-bold">{data.value}</span>
          <span className={data.isUp ? "text-red-500" : "text-blue-500"}>
            {data.isUp ? "▲" : "▼"} {data.change} ({data.changeRate}%)
          </span>
        </div>
      </div>
      
      {expanded[key] && key === 'kospi' && (
        <div className="px-4 pb-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {renderInvestorData()}
        </div>
      )}
    </div>
  );

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