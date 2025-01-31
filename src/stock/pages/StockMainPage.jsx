import React, { useState, useEffect } from "react";
import StockList from "./StockList";
import StockSearch from "./StockSearch";
import { Button } from "@/components/ui/button";

const StockMainPage = () => {
  const [stocks, setStocks] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ✅ 주식 리스트를 가져오는 함수 (중앙 관리)
  const fetchStocks = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('로그인이 필요합니다.');
        return;
      }

      const response = await fetch("/api/v1/stocks/list", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data?.data) {
        setStocks(data.data);
      }
    } catch (error) {
      console.error("❌ 주식 데이터를 가져오는 중 오류 발생:", error);
    }
  };

  // ✅ 최초 1회 실행
  useEffect(() => {
    fetchStocks();
  }, []);

  // ✅ 주식 추가 후 리스트 새로고침
  const handleAddStock = async () => {
    await fetchStocks();  // ✅ 강제로 리스트 새로고침
    setIsSearchOpen(false); // ✅ 모달 닫기
  };

  return (
    <div className="w-full p-4">
      <div className="flex flex-col items-center">
        <div className="w-[805px] flex justify-end mb-2">
          <Button 
            variant="outline"
            onClick={() => setIsSearchOpen(true)}
          >
            추가
          </Button>
        </div>
        
        <div className="flex justify-center w-full">
          <div className="w-[805px] bg-[#b9dafc1a] rounded-[20px] border p-8 space-y-6">
            <StockList stocks={stocks} /> {/* ✅ stocks을 props로 전달 */}
          </div>
        </div>
      </div>

      <StockSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onAddStock={handleAddStock} // ✅ 주식 추가 후 fetchStocks 실행
      />
    </div>
  );
};

export default StockMainPage;
