import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Heart, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';

const CommunitySidebar = ({ onSearch }) => {
  const { user } = useAuth();
  const [popularPosts, setPopularPosts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();

  const handlePostClick = (postId) => {
    navigate(`/community/article/${postId}`);
  };

  const fetchPopularPosts = async () => {
    try {
      const headers = user ? {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      } : {};

      const response = await axios.get(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/popular`,
        { headers }
      );

      const postsWithLikeStatus = await Promise.all(
        response.data.data.content.map(async (post) => {
          if (!user) return { ...post, liked: false };
          try {
            const likeResponse = await axios.get(
              `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${post.id}/likes/check`,
              { headers }
            );
            return { ...post, liked: likeResponse.data.data };
          } catch (error) {
            return { ...post, liked: false };
          }
        })
      );
      setPopularPosts(postsWithLikeStatus);
    } catch (error) {
      console.error('인기 게시글 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchPopularPosts();
  }, [user]);

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(searchKeyword);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffMs = now - targetDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else if (diffDays === 1) {
      return '어제';
    } else {
      return `${diffDays}일 전`;
    }
  };

  return (
    <div className="bg-blue-100 p-4 rounded-lg">
      <div className="w-[406px]">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              <span className="text-gray-500">게시글 검색</span>
            </div>
            <div className="relative">
              <Input
                type="search"
                placeholder="게시글 검색"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
              <Search 
                className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                onClick={() => onSearch(searchKeyword)}
              />
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
            <CardTitle className="text-xl pt-2">인기 Top 5🔥</CardTitle>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString()} 기준
            </p>
          </CardHeader>
          <CardContent>
            {popularPosts.map((post, index) => (
              <div key={index} 
                className="cursor-pointer" 
                onClick={() => handlePostClick(post.id)}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <div className="text-lg font-medium hover:text-blue-600 truncate max-w-[300px]">
                        {post.title}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate max-w-[300px]">
                        {post.body}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 ml-2 shrink-0">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage 
                          src={post.profile || '/default-avatar.png'} 
                          alt="User profile" 
                        />
                        <AvatarFallback>{post.username?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-700">{post.username}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Heart 
                          className={`w-4 h-4 ${
                            post.liked ? 'fill-red-500 text-red-500' : 'text-gray-500'
                          }`}
                        />
                        <span className={`text-sm ${post.liked ? 'text-red-500' : 'text-gray-500'}`}>
                          {post.likeCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">{post.commentCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {index < popularPosts.length - 1 && <Separator className="my-3" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunitySidebar;