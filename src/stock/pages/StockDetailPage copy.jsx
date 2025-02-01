import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StockChart from "@/components/StockChart";

const StockDetailPage = () => {
  const [stockData, setStockData] = useState(null);
  // const [voteStats, setVoteStats] = useState(null);
  // const [chartData, setChartData] = useState(null);
  const { stockCode } = useParams();

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.log('로그인이 필요합니다.');
          return;
        }
  
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
  
        const priceRes = await axios.get(`/api/v1/stockApis/price?stockCode=${stockCode}`, { headers });
        console.log('📊 주식 데이터:', priceRes.data);
        setStockData(priceRes.data);
        
        // const voteRes = await axios.get(`/api/v1/stock/${stockCode}/vote-statistics`, { headers });
        // setVoteStats(voteRes.data);
  
        // const now = new Date();
        // const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        
        // const chartRes = await axios.get('/api/v1/stockApis/chart', {
        //   headers,
        //   params: {
        //     stockCode,
        //     periodType: 'DAILY',
        //     startDate: monthAgo.toISOString().split('T')[0],
        //     endDate: new Date().toISOString().split('T')[0]
        //   }
        // });
  
        // setChartData(chartRes.data);
      } catch (error) {
        console.error('❌ 주식 데이터를 가져오는 중 오류 발생:', error);
      }
    };
  
    fetchStockData();
  }, [stockCode]);
  // const handleVote = async (voteType) => {
  //   try {
  //     await axios.post(`/api/v1/stocks/${stockCode}/vote`, {
  //       buy: voteType === 'BUY',
  //       sell: voteType === 'SELL'
  //     });
      
  //     // Refresh vote statistics
  //     const voteRes = await axios.get(`/api/v1/stocks/${stockCode}/vote-statistics`);
  //     setVoteStats(voteRes.data);
  //   } catch (error) {
  //     console.error('Error voting:', error);
  //   }
  // };

  // if (!stockData || !voteStats || !chartData) {
  //   return <div className="flex justify-center items-center h-screen">Loading...</div>;
  // }

  // const buyPercentage = voteStats.buyPercentage || 0;
  // const sellPercentage = voteStats.sellPercentage || 0;

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">{chartData.stockName}</h1>
              <p className="text-3xl font-bold text-blue-600">
                {stockData.output?.stck_prpr || 0}원
              </p>
            </div>
            <Button
              variant="outline"
              className="hover:bg-blue-50"
              onClick={() => {/* Add to portfolio logic */}}
            >
              관심종목
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">커뮤니티 투표</h2>
          <div className="flex gap-4 mb-4">
            <Button 
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              onClick={() => handleVote('BUY')}
            >
              매수
            </Button>
            <Button 
              className="flex-1 bg-red-500 hover:bg-red-600"
              onClick={() => handleVote('SELL')}
            >
              매도
            </Button>
          </div>
          <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-blue-500"
              style={{ width: `${buyPercentage}%` }}
            />
            <div
              className="absolute h-full bg-red-500 right-0"
              style={{ width: `${sellPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-blue-500">{buyPercentage.toFixed(1)}%</span>
            <span className="text-red-500">{sellPercentage.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default StockDetailPage;