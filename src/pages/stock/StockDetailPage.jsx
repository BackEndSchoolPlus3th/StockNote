import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StockChart from '@/components/StockChart';

const StockDetailPage = () => {
  const [stockData, setStockData] = useState(null);
  const [voteStats, setVoteStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [periodType, setPeriodType] = useState('TIME');
  const [voteMessage, setVoteMessage] = useState('');
  const { stockCode } = useParams();

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const priceRes = await axios.get(`/api/v1/stocks/price?stockCode=${stockCode}`);
        setStockData(priceRes.data);

        const voteRes = await axios.get(`/api/v1/stocks/${stockCode}/vote-statistics`);
        setVoteStats(voteRes.data);

        const now = new Date();
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));

        const chartRes = await axios.get('/api/v1/stocks/chart', {
          params: {
            stockCode,
            periodType: 'DAILY',
            startDate: monthAgo.toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          }
        });
        setChartData(chartRes.data);
        // 차트 데이터 로드
        if (periodType === 'TIME') {
          const timeRes = await axios.get(`/api/v1/stockApis/time-prices?stockCode=${stockCode}`, { headers });
          setChartData(timeRes.data); // API 응답 그대로 설정
        } else {
          const now = new Date();
          const endDate = now.toISOString().split('T')[0];
          let startDate = new Date(now);

          switch(periodType) {
            case 'DAILY': startDate.setMonth(now.getMonth() - 1); break;
            case 'WEEKLY': startDate.setMonth(now.getMonth() - 2); break;
            case 'MONTHLY': startDate.setFullYear(now.getFullYear() - 1); break;
            case 'YEARLY': startDate.setFullYear(now.getFullYear() - 5); break;
          }

          const chartRes = await axios.get('/api/v1/stockApis/chart', {
            headers,
            params: {
              stockCode,
              periodType,
              startDate: startDate.toISOString().split('T')[0],
              endDate
            }
          });

          setChartData(chartRes.data);
        }
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      }
    };

    fetchStockData();
  }, [stockCode, periodType]);

  const handleVote = async (voteType) => {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await axios.post(
        `/api/v1/stocks/${stockCode}/vote`,
        {
          buy: voteType === 'BUY',
          sell: voteType === 'SELL'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setVoteMessage('투표가 성공적으로 완료되었습니다.');
        setTimeout(() => setVoteMessage(''), 2000);

        // 투표 통계 갱신
        const voteRes = await axios.get(
          `/api/v1/stocks/${stockCode}/vote-statistics`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setVoteStats(voteRes.data);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setVoteMessage('로그인하고 투표해주세요!');
      } else {
        setVoteMessage('투표가 이미 완료되었습니다.');
      }
      setTimeout(() => setVoteMessage(''), 2000);
    }
  };

  // 로딩 상태 표시
  if (!stockData || !voteStats || !chartData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const buyPercentage = voteStats.buyPercentage || 0;
  const sellPercentage = voteStats.sellPercentage || 0;
  const stockName = stockData.stockName || chartData.stockName || stockData.output?.hts_kor_isnm || stockCode;

  return (
    <div className="container mx-auto p-4">
      {voteMessage && (
        <div className="mb-4 p-4 bg-green-200 text-green-800 rounded-md">
          {voteMessage}
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">{stockName}</h1>
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
            <Button
              onClick={() => setPeriodType('TIME')}
              className={`text-white ${periodType === 'TIME' ? 'bg-gray-800' : 'bg-gray-500'}`}
            >
              시간
            </Button>
            <Button
              onClick={() => setPeriodType('DAILY')}
              className={`text-white ${periodType === 'DAILY' ? 'bg-blue-600' : 'bg-blue-500'}`}
            >
              일별
            </Button>
            <Button
              onClick={() => setPeriodType('WEEKLY')}
              className={`text-white ${periodType === 'WEEKLY' ? 'bg-green-600' : 'bg-green-500'}`}
            >
              주별
            </Button>
            <Button
              onClick={() => setPeriodType('MONTHLY')}
              className={`text-white ${periodType === 'MONTHLY' ? 'bg-orange-600' : 'bg-orange-500'}`}
            >
              월별
            </Button>
            <Button
              onClick={() => setPeriodType('YEARLY')}
              className={`text-white ${periodType === 'YEARLY' ? 'bg-red-600' : 'bg-red-500'}`}
            >
              연도별
            </Button>
          </div>

          <Card className="mb-6">
            <StockChart chartData={chartData} periodType={periodType} />
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
