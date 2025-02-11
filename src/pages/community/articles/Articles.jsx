import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Heart, Plus, MessageCircle } from "lucide-react";
import CommunitySidebar from "@/pages/community/sidebar/CommunitySidebar";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoginForm } from '@/components/login-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const CommunityList = () => {
  const categoryMapping = {
    "전체": "ALL",
    "자유토론": "FREE",
    "투자분석": "TIP",
    "질문": "QNA",
    "뉴스분석": "NEWS"
  };

  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "전체");
  const [posts, setPosts] = useState([]);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const categories = ["전체", "자유토론", "투자분석", "질문", "뉴스분석"];
  const navigate = useNavigate();
  const [sortType, setSortType] = useState('latest');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPosts = async (category, sort = sortType, page = currentPage) => {
    try {
      const mappedCategory = categoryMapping[category];
      const pageParam = `page=${page}&size=10`;
      let url;

      switch (sort) {
        case 'likes':
          url = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/popular/likes?${pageParam}`;
          break;
        case 'comments':
          url = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/popular/comments?${pageParam}`;
          break;
        case 'popular':
          url = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/popular?${pageParam}`;
          break;
        default: // 'latest'
          url = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts?category=${mappedCategory}&${pageParam}`;
      }

      const response = await axios.get(url);
      const postsData = response.data.data.content;
      setTotalPages(response.data.data.totalPages);

      if (user) {
        const headers = {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        };

        const postsWithStatus = await Promise.all(
          postsData.map(async (post) => {
            try {
              const [likeResponse, commentResponse] = await Promise.all([
                axios.get(
                  `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${post.id}/likes/check`,
                  { headers }
                ),
                axios.get(
                  `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${post.id}/comments/check`,
                  { headers }
                )
              ]);

              console.log(`Post ${post.id} - liked: ${likeResponse.data.data}, hasCommented: ${commentResponse.data.data}`);

              return {
                ...post,
                liked: likeResponse.data.data,
                hasCommented: commentResponse.data.data
              };
            } catch (error) {
              console.error(`Error checking post ${post.id}:`, error);
              return { ...post, liked: false, hasCommented: false };
            }
          })
        );
        setPosts(postsWithStatus);
      } else {
        setPosts(postsData.map(post => ({ ...post, liked: false, hasCommented: false })));
      }
    } catch (error) {
      console.error('게시글 조회 실패:', error);
    }
  };

  // Articles.jsx의 handleSearch 함수 부분만 발췌
const handleSearch = async (searchKeyword, searchType = 'ALL') => {
  if (!searchKeyword.trim()) {
    fetchPosts(selectedCategory);
    return;
  }

  try {
    // 먼저 엘라스틱서치로 검색 결과를 가져옴
    const searchResponse = await axios.get(
      `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/searchDocs/post/search`,
      {
        params: {
          keyword: searchKeyword,
          searchType: searchType,
          category: selectedCategory !== "전체" ? categoryMapping[selectedCategory] : null
        }
      }
    );

    // 검색된 각 게시글의 상세 정보를 가져옴 (hashtags 포함)
    const postsWithDetails = await Promise.all(
      searchResponse.data.data.content.map(async (post) => {
        try {
          const detailResponse = await axios.get(
            `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${post.id}`
          );
          return {
            ...post,
            hashtags: detailResponse.data.data.hashtags || []
          };
        } catch (error) {
          console.error(`Error fetching details for post ${post.id}:`, error);
          return { ...post, hashtags: [] };
        }
      })
    );

    // 사용자가 로그인한 경우 좋아요와 댓글 상태도 함께 가져옴
    if (user) {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      };

      const postsWithStatus = await Promise.all(
        postsWithDetails.map(async (post) => {
          try {
            const [likeResponse, commentResponse] = await Promise.all([
              axios.get(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${post.id}/likes/check`,
                { headers }
              ),
              axios.get(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${post.id}/comments/check`,
                { headers }
              )
            ]);

            return {
              ...post,
              liked: likeResponse.data.data,
              hasCommented: commentResponse.data.data
            };
          } catch (error) {
            console.error(`Error checking status for post ${post.id}:`, error);
            return { ...post, liked: false, hasCommented: false };
          }
        })
      );
      setPosts(postsWithStatus);
    } else {
      setPosts(postsWithDetails.map(post => ({ ...post, liked: false, hasCommented: false })));
    }
  } catch (error) {
    console.error('검색 실패:', error);
    setPosts([]);
  }
};

  const handleSortChange = (newSortType) => {
    setSortType(newSortType);
    setCurrentPage(0);
    fetchPosts(selectedCategory, newSortType, 0);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchPosts(selectedCategory, sortType, newPage);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    fetchPosts(selectedCategory, sortType, currentPage);
  }, [selectedCategory, user, sortType]);

  const handlePostClick = (postId) => {
    navigate(`/community/article/${postId}`);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchParams({ category: category });
  };

  const handleCreateArticle = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    navigate('/community/editor');
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
                onClick={handleCreateArticle}
              >
                <Plus className="h-9 w-9" />
              </Button>
            </div>

            <div className="flex justify-between items-center mb-8">
              <div className="flex gap-3">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-full font-medium ${selectedCategory === category
                      ? "bg-blue-500 text-white"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full px-4">
                    {sortType === 'latest' && '최신순'}
                    {sortType === 'likes' && '좋아요순'}
                    {sortType === 'comments' && '댓글순'}
                    {sortType === 'popular' && '인기순'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSortChange('latest')}>
                    최신순
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('likes')}>
                    좋아요순
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('comments')}>
                    댓글순
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('popular')}>
                    인기순
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                          <h3 className="font-medium truncate max-w-[500px]">{post.title}</h3>
                          <div className="flex items-center gap-4 text-gray-500 text-sm">
                            <span className="font-medium text-gray-700">{post.username}</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 line-clamp-2 overflow-hidden mb-4 max-h-[48px] max-w-[700px] whitespace-pre-wrap break-words">
                      {post.body.length > 150 ? `${post.body}...` : post.body}
                    </p>
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
                            className={`h-4 w-4 ${post.liked ? 'fill-red-500 text-red-500' : 'text-gray-500'
                              }`}
                          />
                          <span className={`${post.liked ? 'text-red-500' : 'text-gray-500'}`}>
                            {post.likeCount || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle
                            className={`h-4 w-4 ${post.hasCommented ? 'fill-blue-500 text-blue-500' : 'text-gray-500'
                              }`}
                          />
                          <span className={`${post.hasCommented ? 'text-blue-500' : 'text-gray-500'}`}>
                            {post.commentCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2"
                >
                  이전
                </Button>

                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index ? "default" : "outline"}
                    onClick={() => handlePageChange(index)}
                    className={`w-10 h-10 ${currentPage === index ? "bg-blue-500 text-white" : ""}`}
                  >
                    {index + 1}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2"
                >
                  다음
                </Button>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div>
            <CommunitySidebar onSearch={handleSearch} />
          </div>
        </div>
      </main>
      <LoginForm
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
    </div>
  );
};

export default CommunityList;