import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import CommunitySidebar from "@/components/sidebar/CommunitySidebar";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Community = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const navigate = useNavigate();

  const fetchArticle = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/post/${id}`
      );
      setArticle(response.data.data);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/post/${id}/comments`
      );
      console.log(response.data.data.content);
      setComments(response.data.data.content);
    } catch (error) {
      console.error('댓글 조회 실패:', error);
    }
  };

  const handleAddComment = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/post/${id}/comments`,
        {
          body: newComment
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/post/${id}/comments/${commentId}`,
        { body: editContent },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      setEditingCommentId(null);
      fetchComments();
    } catch (error) {
      console.error('댓글 수정 실패:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/post/${id}/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      fetchComments();
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  if (!article) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-6">
              <Button 
                variant="ghost" 
                className="flex items-center gap-3 text-lg font-bold px-6 py-3 h-auto"
                onClick={() => navigate('/community/articles')}
              >
                <ArrowLeft className="h-8 w-8" />
                타임라인
              </Button>
            </div>

            <Card className="p-6">
              <CardHeader className="px-4">
                <CardTitle>{article.title}</CardTitle>
                <div className="flex items-center gap-2 pt-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={article.profile} alt="User" />
                    <AvatarFallback>{article.userId?.toString().charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{article.username}</span>
                  <span className="text-gray-500">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-4">
                <p className="text-xl leading-relaxed mb-8">{article.body}</p>
                <div className="flex gap-2">
                  {article.hashtags?.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-semibold">댓글 {comments.length}개</span>
                </div>
                
                {/* Comment List */}
                <div className="space-y-4 mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{comment.userId?.toString().charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{comment.userId}</span>
                          <span className="text-gray-500 text-sm">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {/* Comment Actions */}
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditContent(comment.body);
                            }}
                          >
                            수정
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                      
                      {editingCommentId === comment.id ? (
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                          />
                          <Button onClick={() => handleEditComment(comment.id)}>
                            저장
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-2">{comment.body}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="flex gap-2">
                  <Input
                    placeholder="댓글 내용을 입력하세요"
                    className="flex-1"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button onClick={handleAddComment}>
                    댓글 등록
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
            <CommunitySidebar />
    
        </div>
      </main>
    </div>
  );
};

export default Community;