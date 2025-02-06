import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CreateArticle = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '', 
    hashtags: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setIsLoading(true);
    debouncedSearch(value);
  };

  const handleTagSelect = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setInputValue('');
    setSuggestions([]); // Immediate reset
    debouncedSearch.cancel(); // Cancel any pending searches
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        hashtags: formData.hashtags.split(',').map(tag => tag.trim())
      };
      console.log('Request payload:', payload);
      const response = await axios.post(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts`,
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
      navigate(`/community/article/${response.data.data}`);
    } catch (error) {
      console.error('게시글 작성 실패:', error);
    }
  };

  // Add validation check function
  const isFormValid = () => {
    console.log(formData);
    return (
      formData.title.trim() !== '' &&
      formData.content.trim() !== '' &&
      formData.category !== ''
    );
  };

  // Update ref handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hashtagContainerRef.current && !hashtagContainerRef.current.contains(event.target)) {
        setSuggestions([]);
        setInputValue('');  // Clear input
        debouncedSearch.cancel(); // Cancel pending searches
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <h1 className="text-2xl font-bold">새 게시글 작성</h1>
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
                    onKeyDown={handleKeyDown}  // Add this
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
                <button
                  type="submit"
                  disabled={!isFormValid()}
                  className={`px-4 py-2 rounded ${
                    isFormValid()
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  작성하기
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateArticle;