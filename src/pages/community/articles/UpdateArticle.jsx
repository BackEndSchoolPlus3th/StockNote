import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const UpdateArticle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    hashtags: '',
    category: '' 
  });

  const categories = [
    { value: "FREE", label: "자유토론" },
    { value: "TIP", label: "투자분석" },
    { value: "NEWS", label: "뉴스정보" },
    { value: "QNA", label: "질문" }
  ];

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${id}`
        );
        const post = response.data.data;
        console.log(post.category);
        setFormData({
          title: post.title,
          body: post.body,
          hashtags: post.hashtags.join(', '),
          category: post.category
        });
        setLoading(false);
      } catch (error) {
        console.error('게시글 조회 실패:', error);
      }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${id}`,
        {
          ...formData,
          hashtags: formData.hashtags.split(',').map(tag => tag.trim())
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(response);
      navigate(`/community/article/${id}`);
    } catch (error) {
      console.error('게시글 작성 실패:', error);
    }
  };

  const isFormValid = () => {
    return formData.title.trim() !== '' && 
           formData.body.trim() !== '' && 
           formData.category !== '';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <h1 className="text-2xl font-bold">게시글 수정</h1>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Select 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="게시글 주제 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  placeholder="제목"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <Textarea
                  placeholder="내용을 입력하세요"
                  className="min-h-[200px]"
                  value={formData.body}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                />
              </div>
              <div>
                <Input
                  placeholder="해시태그 (쉼표로 구분)"
                  value={formData.hashtags}
                  onChange={(e) => setFormData({...formData, hashtags: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  취소
                </Button>
                <Button 
                  type="submit" 
                  disabled={!isFormValid()}
                  className={!isFormValid() ? "opacity-50 cursor-not-allowed" : ""}
                >
                  작성하기
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpdateArticle;