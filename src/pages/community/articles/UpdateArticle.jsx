import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UpdateArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    hashtags: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const hashtagContainerRef = useRef(null);

  const categories = [
    { value: "ALL", label: "전체" },
    { value: "FREE", label: "자유토론" },
    { value: "TIP", label: "투자분석" },
    { value: "QNA", label: "질문" },
    { value: "NEWS", label: "뉴스분석" }
  ];

  // Fetch existing article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );
        const article = response.data.data;
        setFormData({
          title: article.title,
          content: article.content,
          category: article.category,
          hashtags: article.hashtags ? article.hashtags.join(',') : ''
        });
        setSelectedTags(article.hashtags || []);
        setIsLoading(false);
      } catch (error) {
        console.error('게시글 조회 실패:', error);
        navigate(-1);
      }
    };
    fetchArticle();
  }, [id]);

  // Rest of the code same as CreateArticle...
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_CORE_API_BASE_URL}/hashtag/search/${query}`
        );
        setSuggestions(response.data);
      } catch (error) {
        console.error('해시태그 검색 실패:', error);
      }
    }, 300),
    []
  );

  // Update handleSubmit for PUT request
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${id}`,
        {
          ...formData,
          hashtags: formData.hashtags.split(',').map(tag => tag.trim())
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      navigate(`/community/article/${id}`);
    } catch (error) {
      console.error('게시글 수정 실패:', error);
    }
  };

  // Rest of the handlers same as CreateArticle...
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleTagSelect = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setInputValue('');
    setSuggestions([]);
    setFormData(prev => ({
      ...prev,
      hashtags: [...selectedTags, tag].join(',')
    }));
  };

  const removeTag = (tagToRemove) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    setFormData(prev => ({
      ...prev,
      hashtags: newTags.join(',')
    }));
  };

    // Add handleKeyDown function
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault(); // Stop form submission
        if (inputValue.trim()) {
          if (suggestions.length > 0) {
            handleTagSelect(suggestions[0]);
          } else {
            const newTag = inputValue.trim();
            if (!selectedTags.includes(newTag)) {
              handleTagSelect(newTag);
            }
          }
        }
      }
    };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
                  defaultValue={formData.category}
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
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                />
              </div>
              <div className="mb-4" ref={hashtagContainerRef}>
                <label className="block text-sm font-medium mb-2">해시태그</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map(tag => (
                    <span 
                      key={tag} 
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      #{tag}
                      <button 
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyDown}
                    placeholder="해시태그 입력..."
                    className="w-full p-2 border rounded"
                  />
                  {suggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg">
                      {suggestions.map((tag) => (
                        <div
                          key={tag}
                          onClick={() => handleTagSelect(tag)}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          #{tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  취소
                </Button>
                <Button type="submit">수정하기</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpdateArticle;