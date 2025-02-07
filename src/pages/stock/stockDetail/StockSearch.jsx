import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import axios from 'axios';

const StockSearch = ({ isOpen, onClose, onAddStock }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);

  const handleSearch = async (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length >= 1) {
      setIsLoading(true);
      try {
        // 토큰 없이 검색 요청
        const response = await axios.post(
          `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/searchDocs/stock`,
          { keyword: e.target.value },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200 && response.data?.data) {
          setSearchResults(response.data.data);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('주식 검색 중 오류 발생:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectStock = async (stock) => {
    if (selecting) return;

    setSelecting(true);
    try {
      // 종목 추가할 때만 토큰 사용
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요한 기능입니다.');
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/stocks`,
        { stockName: stock.name },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        await onAddStock();
        onClose();
        setSearchQuery("");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Failed to add stock:", error);
      alert('종목 추가에 실패했습니다.');
    } finally {
      setSelecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      onClose();
      setSearchQuery("");
      setSearchResults([]);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>종목 검색</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <Input
              placeholder="종목명을 입력하세요..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">검색중...</div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchQuery ? "검색 결과가 없습니다." : "종목명을 입력하세요."}
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((stock) => (
                  <button
                    key={stock.code}
                    onClick={() => handleSelectStock(stock)}
                    disabled={selecting}
                    className="w-full p-3 bg-white hover:bg-gray-100 rounded-lg cursor-pointer transition-all duration-200 
                             border border-gray-200 flex justify-between items-center group
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-left">
                      <div className="font-medium text-lg">{stock.name}</div>
                      <div className="text-sm text-gray-500">{stock.code} | {stock.market}</div>
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