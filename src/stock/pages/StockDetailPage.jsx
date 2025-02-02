import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StockChart from '@/components/StockChart';


const StockDetailPage = () => {
  const [stockData, setStockData] = useState({ output: {} });
  const [voteStats, setVoteStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [periodType, setPeriodType] = useState('TIME');
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
        console.log("📊 주식 데이터 응답:", priceRes.data);
        console.log("📊 주식 현재가:", priceRes.data?.output?.stck_prpr); // 🛠️ 값 확인
        setStockData(priceRes.data);
        
        const voteRes = await axios.get(`/api/v1/stocks/${stockCode}/vote-statistics`, { headers });
        setVoteStats(voteRes.data);
  
        const now = new Date();
        let startDate;
        const endDate = new Date().toISOString().split('T')[0];
        if (periodType === 'TIME') {
          startDate = now.toISOString().split('T')[0]; // 당일 데이터
        } else if (periodType === 'DAILY') {
          startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0]; // 1달
        } else if (periodType === 'WEEKLY') {
          startDate = new Date(now.setMonth(now.getMonth() - 2)).toISOString().split('T')[0];
        } else if (periodType === 'MONTHLY') {
          startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0]; // 1년
        } else if (periodType === 'YEARLY') {
          startDate = new Date(now.setFullYear(now.getFullYear() - 5)).toISOString().split('T')[0]; // 5년
        }

        const chartRes = await axios.get('/api/v1/stockApis/chart', {
          headers,
          params: { stockCode, periodType, startDate, endDate }
        });
        
        let candles = chartRes.data?.candles || [];
    
        // 📌 주말 또는 공휴일인 경우, 마지막으로 거래된 날짜 데이터 가져오기
        if (candles.length === 0) {
          console.warn("⚠️ 거래 데이터가 없음. 마지막 거래일 데이터 사용");
    
          const backupChartRes = await axios.get('/api/v1/stockApis/chart', {
            headers,
            params: { stockCode, periodType, startDate: getLastTradingDay(), endDate }
          });
    
          candles = backupChartRes.data?.candles || [];
        }
    
        console.log("📈 API 응답 차트 데이터:", chartRes.data);
        setChartData({ ...chartRes.data, candles });
    
      } catch (error) {
        console.error('❌ 주식 데이터를 가져오는 중 오류 발생:', error);
      }
    };
    
    // 📌 가장 최근 거래일 가져오기 함수 (주말/공휴일 체크)
    const getLastTradingDay = () => {
      let date = new Date();
      const day = date.getDay(); // 0: 일요일, 1: 월요일 ... 6: 토요일
    
      if (day === 0) {
        // 일요일이면 금요일(이틀 전)
        date.setDate(date.getDate() - 2);
      } else if (day === 6) {
        // 토요일이면 금요일(하루 전)
        date.setDate(date.getDate() - 1);
      }
      
      return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식 반환
    };

    fetchStockData();
  }, [stockCode, periodType]);

  const handleVote = async (voteType) => {
    try {
      await axios.post(`/api/v1/stocks/${stockCode}/vote`, {
        buy: voteType === 'BUY',
        sell: voteType === 'SELL'
      });
      
      // Refresh vote statistics
      const voteRes = await axios.get(`/api/v1/stocks/${stockCode}/vote-statistics`);
      setVoteStats(voteRes.data);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (!stockData || !voteStats || !chartData) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const buyPercentage = voteStats.buyPercentage || 0;
  const sellPercentage = voteStats.sellPercentage || 0;

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
          <div className="flex gap-2 mb-4">
            <Button onClick={() => setPeriodType('TIME')} className={`text-white ${periodType === 'TIME' ? 'bg-gray-800' : 'bg-gray-500'}`}>시간</Button>
            <Button onClick={() => setPeriodType('DAILY')} className={`text-white ${periodType === 'DAILY' ? 'bg-blue-600' : 'bg-blue-500'}`}>일별</Button>
            <Button onClick={() => setPeriodType('WEEKLY')} className={`text-white ${periodType === 'WEEKLY' ? 'bg-green-600' : 'bg-green-500'}`}>주별</Button>
            <Button onClick={() => setPeriodType('MONTHLY')} className={`text-white ${periodType === 'MONTHLY' ? 'bg-orange-600' : 'bg-orange-500'}`}>월별</Button>
            <Button onClick={() => setPeriodType('YEARLY')} className={`text-white ${periodType === 'YEARLY' ? 'bg-red-600' : 'bg-red-500'}`}>연도별</Button>
          </div>
          <Card className="mb-6">
            <StockChart chartData={chartData} periodType={periodType} />  {/* ✅ periodType 추가 */}
          </Card>
        </CardContent>
      </Card>

      <Card className="mb-6">
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
      </Card>
    </div>
  );
};

export default StockDetailPage;