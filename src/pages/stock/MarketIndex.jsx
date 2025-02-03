import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MarketIndex = () => {
  const [indexData, setIndexData] = useState({
    kospi: { name: '코스피', value: '2,522.13', change: '+25.32', changeRate: '+1.01' },
    kosdaq: { name: '코스닥', value: '742.02', change: '+25.32', changeRate: '+1.01' },
    kospi200: { name: '코스피 200', value: '335.27', change: '+25.32', changeRate: '+1.01' }
  });

  const renderIndexItem = (data, key) => (
    <div key={key} className="flex flex-col space-y-2 p-4 border-b last:border-b-0">
      <div className="flex items-center justify-between">
        <span className="text-gray-600 text-lg">{data.name}</span>
        <ChevronUp className="w-5 h-5 text-red-500" />
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold">{data.value}</span>
        <span className="text-red-500">
          {data.change} ({data.changeRate}%)
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-xl font-bold">오늘의 증시</h2>
      </div>
      <div className="divide-y">
        {Object.entries(indexData).map(([key, data]) => renderIndexItem(data, key))}
      </div>
    </div>
  );
};

export default MarketIndex;