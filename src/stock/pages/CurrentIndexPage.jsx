import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CurrentIndexPage = () => {
  const [indexData, setIndexData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllIndexData = async () => {
      try {
        const indices = ['kospi', 'kosdaq', 'kospi200'];
        const promises = indices.map(index => 
          axios.get(`/api/filtered/${index}`)
        );

        const responses = await Promise.all(promises);
        const data = responses.map(response => response.data);
        setIndexData(data);
        setIsLoading(false);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        setIsLoading(false);
      }
    };

    fetchAllIndexData();
  }, []);

  if (isLoading) return <div className="text-center p-4">로딩 중...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-7xl mx-auto bg-white p-5 rounded-lg shadow-md">
        <Link 
          to="/" 
          className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 mb-4"
        >
          ← 메인으로 돌아가기
        </Link>
        <h1 className="text-2xl text-gray-800 mb-6">현재 지수</h1>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-3 bg-blue-500 text-white border">지수명</th>
                <th className="p-3 bg-blue-500 text-white border">현재가</th>
                <th className="p-3 bg-blue-500 text-white border">전일대비</th>
                <th className="p-3 bg-blue-500 text-white border">등락률</th>
              </tr>
            </thead>
            <tbody>
              {indexData.map((item, index) => {
                const changeClass = item.changeDirection === '▲' ? 'text-red-500' : 'text-blue-500';
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3 border text-center">{item.indexName}</td>
                    <td className="p-3 border text-center">
                      {Number(item.currentValue).toLocaleString()}
                    </td>
                    <td className={`p-3 border text-center ${changeClass}`}>
                      {item.changeDirection} {Math.abs(Number(item.changeAmount)).toLocaleString()}
                    </td>
                    <td className={`p-3 border text-center ${changeClass}`}>
                      {item.changeDirection} {Math.abs(Number(item.changeRate))}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CurrentIndexPage;