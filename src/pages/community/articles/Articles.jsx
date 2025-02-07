import { Avatar, AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Heart, Plus, MessageCircle } from "lucide-react";
import CommunitySidebar from "@/components/sidebar/CommunitySidebar";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CommunityList = () => {
  const categoryMapping = {
    "전체": "ALL",
    "자유토론": "FREE",
    "투자분석": "TIP",
    "질문": "QNA",
    "뉴스분석": "NEWS"
  };

  const {  user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "전체");
  const [posts, setPosts] = useState([]);
  const categories = ["전체", "자유토론", "투자분석", "질문", "뉴스분석"];
  const navigate = useNavigate();

  const fetchPosts = async (category) => {
    try {
      const mappedCategory = categoryMapping[category];
      const url = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts?category=${mappedCategory}`;
      
      const response = await axios.get(url);
      const postsData = response.data.data.content;

      // 로그인한 사용자의 경우 좋아요 상태 확인
      if (user) {
        const postsWithLikeStatus = await Promise.all(
          postsData.map(async (post) => {
            try {
              const likeResponse = await axios.get(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${post.id}/likes/check`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                  }
                }
              );
              return { ...post, liked: likeResponse.data.data };
            // eslint-disable-next-line no-unused-vars
            } catch (error) {
              return { ...post, liked: false };
            }
          })
        );
        setPosts(postsWithLikeStatus);
      } else {
        setPosts(postsData);
      }
    } catch (error) {
      console.error('게시글 조회 실패:', error);
    }
  };

  // handleSearch 함수 추가
const handleSearch = async (searchKeyword) => {
  if (!searchKeyword.trim()) {
    fetchPosts(selectedCategory);
    return;
  }

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/search`,
      {
        params: {
          keyword: searchKeyword,
          searchType: 'ALL',
          category: selectedCategory !== "전체" ? categoryMapping[selectedCategory] : null
        }
      }
    );
    setPosts(response.data.data.content);
  } catch (error) {
    console.error('검색 실패:', error);
  }
};

  useEffect(() => {
    fetchPosts(selectedCategory);
  }, [selectedCategory, user]); // user 의존성 추가

  const handlePostClick = (postId) => {
    navigate(`/community/article/${postId}`);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchParams({ category: category });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left: Community Posts Section */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">커뮤니티</h1>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full  hover:bg-blue-200 text-bg-blue-200 w-12 h-12 p-2"
                onClick={() => navigate('/community/editor')}
                >
                <Plus className="h-9 w-9" />
                </Button>
            </div>
            <div className="flex gap-3 mb-8">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-full font-medium ${
                    selectedCategory === category 
                      ? "bg-blue-500 text-white" 
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                  }`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="space-y-4">
              {posts.map((post) => (
                <Card 
                  key={post.id} 
                  className="bg-white hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handlePostClick(post.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={post.profile || '/default-avatar.png'} 
                            alt="User profile" 
                          />
                          <AvatarFallback>
                            {post.username?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{post.title}</h3>
                          <div className="flex items-center gap-4 text-gray-500 text-sm">
                            <span className="font-medium text-gray-700">{post.username}</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {post.authorId === user?.id && (
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click event
                              navigate(`/community/article/${post.id}/editor`, {
                                state: {
                                  title: post.title,
                                  body: post.body,
                                  hashtags: post.hashtags,
                                  isEditing: true
                                }
                              });
                            }}
                          >
                            수정
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add delete logic here
                            }}
                          >
                            삭제
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600">{post.body}</p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex gap-2">
                        {post.hashtags?.map((tag, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Heart 
                            className={`h-4 w-4 ${
                              post.liked ? 'fill-red-500 text-red-500' : 'text-gray-500'
                            }`}
                          />
                          <span className={`${post.liked ? 'text-red-500' : 'text-gray-500'}`}>
                            {post.likeCount || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-500">{post.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div>
            <CommunitySidebar onSearch={handleSearch} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommunityList;
