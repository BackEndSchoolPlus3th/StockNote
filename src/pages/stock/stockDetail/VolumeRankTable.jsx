import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import axios from 'axios';

const VolumeRankTable = () => {
  const [volumeData, setVolumeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolumeData = async () => {
      try {
        const response = await axios.get('/api/v1/stockApis/volume');
        setVolumeData(response.data.output);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch volume data:', error);
        setLoading(false);
      }
    };

    fetchVolumeData();
    // 1분마다 데이터 갱신
    const interval = setInterval(fetchVolumeData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="w-[600px] shadow-lg bg-white">
        <CardContent className="p-4">
          <div className="flex justify-center items-center h-[400px]">
            <div className="text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[600px] shadow-lg bg-white">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">실시간 거래량 순위 30</h3>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleTimeString()} 기준
          </span>
        </div>
        
        {/* Header */}
        <div className="grid grid-cols-4 text-sm text-gray-500 mb-2 px-2">
          <div>종목</div>
          <div className="text-right">현재가</div>
          <div className="text-right">등락률</div>
          <div className="text-right">거래대금</div>
        </div>

        {/* Stock List */}
        <div className="space-y-1">
          {volumeData.map((stock, index) => (
            <div 
              key={stock.stck_shrn_iscd}
              className={`grid grid-cols-4 items-center py-3 px-2 hover:bg-gray-50 cursor-pointer
                ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
            >
              {/* 종목명 & 순위 */}
              <div className="flex items-start gap-2">
                <span className="text-blue-500 w-6 mt-1">{index + 1}</span>
                <span className="font-medium text-base break-words">
                  {stock.hts_kor_isnm}
                </span>
              </div>

              {/* 현재가 */}
              <div className="text-right">
                {parseInt(stock.stck_prpr).toLocaleString()}원
              </div>

              {/* 등락률 */}
              <div className={`text-right ${
                parseFloat(stock.prdy_ctrt) > 0 
                  ? 'text-red-500' 
                  : parseFloat(stock.prdy_ctrt) < 0 
                    ? 'text-blue-500' 
                    : 'text-gray-500'
              }`}>
                {parseFloat(stock.prdy_vrss) > 0 ? '+' : ''}
                {parseInt(stock.prdy_vrss).toLocaleString()}원
                <br />
                <span className="text-sm">
                  ({parseFloat(stock.prdy_ctrt) > 0 ? '+' : ''}
                  {stock.prdy_ctrt}%)
                </span>
              </div>

              {/* 거래대금 */}
              <div className="text-right text-gray-600">
                {(parseInt(stock.acml_tr_pbmn) / 100000000).toFixed(1)}억원
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VolumeRankTable;