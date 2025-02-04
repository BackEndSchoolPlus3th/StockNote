import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

const StockSearch = ({ isOpen, onClose, onAddStock }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    const fetchStocks = async () => {
      if (searchTerm.length < 1) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.log('로그인이 필요합니다.');
          setSearchResults([]);
          return;
        }
        console.log('encodeURIComponent:', searchTerm);
        
        console.log('encodeURIComponent:', encodeURIComponent(searchTerm));
        const response = await fetch(`/api/v1/stocks?name=${encodeURIComponent(searchTerm)}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        console.log('Search response:', data);

        if (data.statusCode === 200 && data.data) {
          setSearchResults([data.data]);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Failed to fetch stocks:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchStocks, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelectStock = async (stockName) => {
    if (selecting) return;

    setSelecting(true);
    try {
      const token = localStorage.getItem('accessToken'); // 'token'에서 'accessToken'으로 변경
      if (!token) {
        console.log('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('/api/v1/stocks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stockName }) // Request Body로 변경
      });

      const data = await response.json();
      console.log('Add stock response:', data);
      
      if (data?.statusCode === 200) {
        console.log("✅ 주식 추가 성공");
  
        // ✅ 주식 리스트 새로고침 실행
        await onAddStock(); 
  
        // ✅ 모달 닫기
        onClose();
      } else {
        console.error("❌ 주식 추가 실패. 서버 응답이 올바르지 않습니다.", data);
      }
    } catch (error) {
      console.error("Failed to add stock:", error);
    } finally {
      setSelecting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>종목 검색</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <Input
              placeholder="종목명을 입력하세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">검색중...</div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchTerm ? "검색 결과가 없습니다." : "종목명을 입력하세요."}
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((stock) => (
                  <button
                    key={stock.code}
                    onClick={() => handleSelectStock(stock.name)}
                    disabled={selecting}
                    className="w-full p-3 bg-white hover:bg-gray-100 rounded-lg cursor-pointer transition-all duration-200 
                             border border-gray-200 flex justify-between items-center group
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-left">
                      <div className="font-medium text-lg">{stock.name}</div>
                      <div className="text-sm text-gray-500">{stock.code}</div>
                    </div>
                    <Plus className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockSearch;