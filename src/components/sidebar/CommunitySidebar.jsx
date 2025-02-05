import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import { useEffect, useState } from 'react';
import axios from 'axios';

const popularPosts = Array(4).fill({
  title: "좀 봐주세요",
  date: "2025. 01. 18  22:01",
  author: "주식은 못 말려",
});

const votingItems = Array(3).fill({
  stock: "삼성전자",
  sellPercentage: 63.8,
  buyPercentage: 36.2,
});

const CommunitySidebar = () => {
  const [popularVotes, setPopularVotes] = useState([]);

  useEffect(() => {
    const fetchPopularVotes = async () => {
      try {
        const response = await axios.get('/api/v1/votes/popular');
        console.log('🔥 인기 투표 데이터:', response.data);
        
        if (response.data.data) {
          setPopularVotes(response.data.data.stockVoteList);
        } else {
          console.warn('⚠ 인기 투표 데이터가 없음:', response.data);
        }
      } catch (error) {
        console.error('인기 투표 데이터 로딩 실패:', error);
      }
    };

    fetchPopularVotes();
  }, []);


  return (
  <div className="bg-blue-100 p-4 rounded-lg">
    <div className="w-[406px]">
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            <span className="text-gray-500">게시글 검색</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-xl">실시간 인기 투표</CardTitle>
        </CardHeader>
        <CardContent>
          {popularVotes.map((item, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg mb-2">{item.stockName}</h3>
              <div className="flex items-center gap-2 flex-nowrap">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  매수
                </span>
                <span className="whitespace-nowrap">{item.buyPercentage.toFixed(1)}%</span>
                
                <div className="relative flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${item.buyPercentage}%` }}
                  />
                  <div
                    className="absolute top-0 right-0 h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${item.sellPercentage}%` }}
                  />
                </div>

                <span className="whitespace-nowrap">{item.sellPercentage.toFixed(1)}%</span>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">
                  매도
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle className="text-xl pt-2">인기 게시글</CardTitle>
        </CardHeader>
        <CardContent>
          {popularPosts.map((post, index) => (
            <div key={index} className="py-0">
              <div className="flex justify-between items-center">
                <h3 className="text-lg">{post.title}</h3>
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9">
                    <img src="" alt="User" />
                  </Avatar>
                  <span>{post.author}</span>
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {post.date}
              </div>
              {index < popularPosts.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
    </div>
  );
};

export default CommunitySidebar;