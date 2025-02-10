import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Enum-like object for post categories
const POST_CATEGORIES = {
  ALL: '전체체',
  FREE: '자유토론',
  TIP: '투자분석',
  QNA: '질문',
  NEWS: '뉴스분석',
};

const KeywordPopup = () => {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Fetch initial keywords
  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/keywords`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );
        console.log(response);
        setKeywords(response.data.keywords);
      } catch (error) {
        console.error('키워드 조회 실패:', error);
      }
    };

    if (isOpen) {
      fetchKeywords();
    }
  }, [isOpen]);

  // Save keywords
  const handleSave = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/keywords`,
        { keywords },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      setIsOpen(false);
    } catch (error) {
      console.error('키워드 저장 실패:', error);
    }
  };

  const isDuplicateKeyword = (newKeyword, newCategory) => {
    return keywords.some(k => 
      k.keyword === newKeyword.trim() && 
      k.postCategory === newCategory
    );
  };

  // Add keyword with category
  const handleAddKeyword = () => {
    const trimmedKeyword = newKeyword.trim();
    if (!trimmedKeyword || !newCategory) return;

    if (isDuplicateKeyword(trimmedKeyword, newCategory)) {
      alert('이미 동일한 키워드와 카테고리가 존재합니다.');
      return;
    }

    setKeywords(prev => [
      ...prev, 
      { keyword: trimmedKeyword, postCategory: newCategory }
    ]);
    setNewKeyword('');
    setNewCategory('');
  };

  // Delete keyword
  const handleDeleteKeyword = useCallback((keywordToDelete) => {
    setKeywords(prev => prev.filter(k => 
      k.keyword !== keywordToDelete.keyword || 
      k.postCategory !== keywordToDelete.postCategory
    ));
  }, []);

  // Render category name
  const getCategoryName = (categoryKey) => {
    return POST_CATEGORIES[categoryKey] || categoryKey;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setNewKeyword('');
        setNewCategory('');
      }
    }}>
      <AlertDialogTrigger asChild>
        <button 
          className="w-full text-left" 
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(true);
          }}
        >
          키워드 알림 설정
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>키워드 알림 설정</AlertDialogTitle>
          <AlertDialogDescription>
            관심있는 키워드와 카테고리를 등록하면 관련 게시물이 올라올 때 알림을 받을 수 있습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex gap-2 mb-4">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="키워드 입력"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newKeyword.trim() && newCategory) {
                e.preventDefault();
                handleAddKeyword();
              }
            }}
          />
          <Select 
            value={newCategory} 
            onValueChange={setNewCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(POST_CATEGORIES).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={handleAddKeyword}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            type="button"
            disabled={!newKeyword.trim() || !newCategory}
          >
            <Plus />
          </button>
        </div>

        <div className="max-h-[200px] overflow-y-auto">
          {keywords.map((keywordObj, index) => (
            <div 
              key={`${keywordObj.keyword}-${keywordObj.postCategory}-${index}`} 
              className="flex justify-between items-center p-2 border-b"
            >
              <div className="flex-grow">
                <span className="mr-2">{keywordObj.keyword}</span>
                <span className="text-sm text-gray-500">
                  ({getCategoryName(keywordObj.postCategory)})
                </span>
              </div>
              <button
                onClick={() => handleDeleteKeyword(keywordObj)}
                className="text-red-500 hover:text-red-600 transition-colors"
                type="button"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleSave}>
            저장
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default KeywordPopup;
