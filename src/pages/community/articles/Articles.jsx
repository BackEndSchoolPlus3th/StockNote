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
    "전체": "",
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
      const url = category === "전체" 
        ? `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts`
        : `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts?category=${mappedCategory}`;
        
      const response = await axios.get(url);
      console.log(url);
      console.log(response.data.data.content);
      setPosts(response.data.data.content);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchPosts(selectedCategory);
  }, [selectedCategory]);

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

            {posts.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500 text-lg mb-2">아직 게시글이 없습니다.</p>
        <p className="text-gray-400">첫 게시글의 주인공이 되어보세요!</p>
      </div>
    ) : (
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
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post.comments.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{post.body}</p>
                    <div className="flex gap-2 mt-4">
                      {post.hashtags?.map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
    )}
          </div>
           

          {/* Right: Sidebar */}
          <div>
            <CommunitySidebar />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommunityList;
