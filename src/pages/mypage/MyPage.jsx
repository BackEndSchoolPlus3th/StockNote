import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { LoginForm } from '@/components/login-form';

const MyPage = () => {
  const navigate = useNavigate();
  const { user, updateUser, accessToken, isAuthenticated } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
    }
  }, [isAuthenticated]);

  const updateUserName = async (newName) => {
    try {
      console.log(newName);
      const response = await axios.patch(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/user/profile/name`,
        { name: newName },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '닉네임 변경 실패');
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/user/posts`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );
      setPosts(response.data.data.content);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
    }
  };

  const fetchUserComments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/user/comments`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );
      console.log(response.data.data.content);
      setComments(response.data.data.content);
    } catch (error) {
      console.error('댓글 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchUserPosts();
    fetchUserComments();
  }, [accessToken]);

  const handleEdit = async () => {
    if (isEditing) {
      if (newName.length > 10) {
        setError('닉네임은 10자 이하여야 합니다.');
        return;
      }
      try {
        await updateUserName(newName);
        setError('');
        setIsEditing(false);
        updateUser({
          ...user,
          name: newName
        });
      } catch (error) {
        setError(error.message);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setNewName(value);
    if (value.length > 10) {
      setError('닉네임은 10자 이하여야 합니다.');
    } else {
      setError('');
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/community/article/${postId}`);
  };

  const handleCommentClick = (postId) => {
    navigate(`/community/article/${postId}`);
  };

  return (
    <>
      <LoginForm 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog}
      />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center flex-col items-center gap-6">
            {/* Profile Card */}
            <div className="max-w-[900px] w-full bg-[#b9dafc30] rounded-[20px] border p-12 shadow-lg">
              <div className="flex items-start gap-6">
                <Avatar className="w-[82px] h-[82px]">
                  <AvatarImage src={user?.profile || "https://github.com/shadcn.png"} alt="User avatar" />
                  <AvatarFallback>{user?.name?.[0] || 'UN'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-[82px] text-right text-sm font-semibold">
                        이메일
                      </div>
                      <div className="text-sm">{user?.email}</div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-[82px] text-right text-sm font-semibold">
                        닉네임 
                      </div>
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <Input 
                                value={newName}
                                onChange={handleNameChange}
                                className="w-[281px] pr-16"
                                maxLength={10} 
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                {newName.length}/10
                              </span>
                            </div>
                            <Button 
                              variant="default" 
                              className="bg-slate-900" 
                              onClick={handleEdit}
                              disabled={!!error || newName.length === 0}
                            >
                              입력
                            </Button>
                          </div>
                          {error && <div className="text-red-500 text-sm">{error}</div>}
                        </div>
                      ) : (
                        <>
                          <div className="text-sm">{user?.name}</div>
                          <Button variant="default" className="bg-slate-900" onClick={handleEdit}>
                            수정
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Card */}
            <div className="max-w-[900px] w-full bg-[#b9dafc30] rounded-[20px] border p-12 shadow-lg">
              <Tabs defaultValue="posts" className="w-full">
                <TabsList>
                  <TabsTrigger value="posts">내가 쓴 글</TabsTrigger>
                  <TabsTrigger value="comments">내가 쓴 댓글</TabsTrigger>
                </TabsList>
                <div className="mt-6">
                  <TabsContent value="posts">
                    <ScrollArea className="h-[330px] bg-white rounded-lg p-4">
                      <div className="space-y-4">
                        {posts.map((post) => (
                          <div 
                            key={post.id} 
                            onClick={() => handlePostClick(post.id)} 
                            className="p-4 border-b cursor-pointer hover:bg-gray-50"
                          >
                            <h3 className="font-medium">{post.title}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                      <ScrollBar orientation="vertical" />
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="comments">
                    <ScrollArea className="h-[330px] bg-white rounded-lg p-4">
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div 
                            key={comment.id} 
                            onClick={() => handleCommentClick(comment.postId)} 
                            className="p-4 border-b cursor-pointer hover:bg-gray-50"
                          >
                            <p>{comment.body}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                      <ScrollBar orientation="vertical" />
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyPage;