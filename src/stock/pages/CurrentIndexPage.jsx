import React from 'react';
import { Link } from 'react-router-dom';
import MarketChart from './MarketChart';

const CurrentIndexPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto">
        <Link 
          to="/" 
          className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 mb-4"
        >
          ← 메인으로 돌아가기
        </Link>
        <MarketChart />
      </div>
    </div>
  );
};

export default CurrentIndexPage;