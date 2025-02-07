import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StockChart from '@/pages/stock/stockDetail/StockChart';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback,AvatarImage } from "@/components/ui/avatar";

const StockDetailPage = () => {
  const [stockData, setStockData] = useState(null);
  const [voteStats, setVoteStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [periodType, setPeriodType] = useState('TIME');
  const [voteMessage, setVoteMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);  // 이 부분이 빠져있었습니다
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();
  const { stockCode } = useParams();
  const { sName } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);

    const fetchStockData = async () => {
      try {
        // 비로그인 상태에서도 호출 가능한 API 요청
        const priceRes = await axios.get(`/api/v1/stockApis/price?stockCode=${stockCode}`);
        setStockData(priceRes.data);

        const voteRes = await axios.get(`/api/v1/votes/${stockCode}/vote-statistics`);
        console.log('🔄 최신 투표 데이터 (새로고침 후):', voteRes.data);
        setVoteStats(voteRes.data.data);

        const now = new Date();
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));

        // 토큰 선택적 사용
        const chartOptions = token 
          ? { 
              headers: { 'Authorization': `Bearer ${token}` },
              params: {
                stockCode,
                periodType: 'DAILY',
                startDate: monthAgo.toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
              }
            }
          : {
              params: {
                stockCode,
                periodType: 'DAILY',
                startDate: monthAgo.toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
              }
            };

        const chartRes = await axios.get('/api/v1/stockApis/chart', chartOptions);
        setChartData(chartRes.data);

        // 차트 데이터 로드 로직 (기존과 동일)
        if (periodType === 'TIME') {
          const timeRes = await axios.get(`/api/v1/stockApis/time-prices?stockCode=${stockCode}`);
          setChartData(timeRes.data);
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

          const chartOptions = token
            ? {
                headers: { 'Authorization': `Bearer ${token}` },
                params: {
                  stockCode,
                  periodType,
                  startDate: startDate.toISOString().split('T')[0],
                  endDate
                }
              }
            : {
                params: {
                  stockCode,
                  periodType,
                  startDate: startDate.toISOString().split('T')[0],
                  endDate
                }
              };

          const chartRes = await axios.get('/api/v1/stockApis/chart', chartOptions);
          setChartData(chartRes.data);
        }
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      }
    };

    fetchStockData();
  }, [stockCode, periodType]);

  const handleVote = async (voteType) => {
    if (!isLoggedIn) {
      setVoteMessage('로그인이 필요한 기능입니다.');
      setTimeout(() => setVoteMessage(''), 2000);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');

      const response = await axios.post(
        `/api/v1/votes/${stockCode}`,
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
          `/api/v1/votes/${stockCode}/vote-statistics`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        console.log('🔄 최신 투표 데이터:', voteRes.data);
        localStorage.setItem(`voteStats_${stockCode}`, JSON.stringify(voteRes.data.data));
        setVoteStats(voteRes.data.data);
        console.log('🔄 voteStats 변경됨:', voteStats);
        
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
  useEffect(() => {
    const savedVoteStats = localStorage.getItem(`voteStats_${stockCode}`);
    if (savedVoteStats) {
      console.log('🔄 로컬 스토리지에서 투표 데이터 복원:', JSON.parse(savedVoteStats));
      setVoteStats(JSON.parse(savedVoteStats));
    }
  }, [stockCode]);

  useEffect(() => {
    const fetchPosts = async () => {
      const sName = chartData.stockName;
      try {
        const response = await axios.get(`/api/v1/stocks/posts`, {
          params: {
            sName: sName,
            page: currentPage,
            size: 3
          }
        });
        console.log('게시글 이름:',sName );
       console.log('게시글 로딩:', response.data);
        setPosts(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      } catch (error) {
        console.error('게시글 로딩 실패:', error);
      }
    };
    if (stockData) {
    fetchPosts();
    } // useEffect 내부에서 호출
  }, [stockData, chartData, currentPage]); // stockData 의존성 추가

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="md:col-span-2">
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
              +
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
    </div>
      <div className="md:col-span-1">
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
          {!isLoggedIn && (
            <div className="text-center text-gray-600 mt-2">
              투표 기능은 로그인 후 사용할 수 있습니다.
            </div>
          )}
          <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-blue-500"
              style={{ width: `${voteStats?.buyPercentage || 0}%` }}
            />
            <div
              className="absolute h-full bg-red-500 right-0"
              style={{ width: `${voteStats?.sellPercentage || 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-blue-500">{buyPercentage.toFixed(1)}%</span>
            <span className="text-red-500">{sellPercentage.toFixed(1)}%</span>
          </div>
          
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">커뮤니티</h2>
            <Button 
              onClick={() => navigate('/community/articles')}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
             게시글 작성하기
            </Button>
          </div>
          
          <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div 
                key={post.id} 
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/community/article/${post.id}`)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={post.profile || '/default-avatar.png'} 
                            alt="User profile" 
                          />
                          <AvatarFallback>
                            {post.username?.[0]}
                          </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{post.authorName}</span>
                  <span className="text-gray-500 text-sm">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-medium mb-2">{post.title}</h3>
                <p className="text-gray-600 line-clamp-2">{post.content}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <span>좋아요 {post.likeCount}</span>
                  <span>댓글 {post.commentCount}</span>
                </div>
              </div>
            ))
          ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <p className="mb-2">아직 작성된 게시글이 없습니다.</p>
            <p className="text-sm">첫 번째 게시글의 주인공이 되어보세요!</p>
          </div>
          
          )}
          </div>

        {posts.length > 0 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              이전
            </Button>
            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index ? "default" : "outline"}
                onClick={() => setCurrentPage(index)}
              >
                {index + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
            >
              다음
            </Button>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
    </div>
  </div>
  );
};

export default StockDetailPage;
