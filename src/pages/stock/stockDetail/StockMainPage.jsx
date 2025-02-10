// StockMainPage.jsx
import React, { useState, useEffect } from "react";
import axios from 'axios'; // axios로 변경
import StockList from "./StockList";
import StockSearch from "./StockSearch";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/login-form';
import { useLocation } from "react-router-dom";


const StockMainPage = () => {
  const [stocks, setStocks] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const { isAuthenticated } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const location = useLocation();
  const fetchStocks = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/stocks/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();  // ✅ 여기서 data를 선언
      console.log("📌 받은 데이터:", data);

      if (data?.data) { 
        setStocks(data.data);
      }

    } catch (error) {
      console.error("❌ 주식 데이터를 가져오는 중 오류 발생:", error);
    }
  };

  const handleDeleteStock = async (stockCode) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.delete(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/stocks`, {
        params: { stockCode: stockCode },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      

      if (response.status === 200) {
        await fetchStocks();
      }
    } catch (error) {
      console.error("❌ 주식 삭제 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleAddStock = async () => {
    await fetchStocks(); 
    setIsSearchOpen(false);
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
  };

  const handleStockSearchClick = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    setIsSearchOpen(true);
  };

  return (
    <div className="w-full p-2">
    <div className="flex justify-center w-full">
      <div className="flex flex-col min-h-screen">
        {location.pathname === "/stocks" && (
          <>
            <div className="w-full sm:w-[500px] flex justify-start sm:justify-start mb-2">
              <h2 className="text-3xl font-bold">관심 종목</h2>
            </div>
          
            <div className="w-full sm:w-[500px] flex justify-end sm:justify-end mb-2">
            {stocks.length > 0 ? (
              <div className="space-x-1">
                <Button 
                  variant="outline"
                  onClick={handleStockSearchClick}
                >
                  추가
                </Button>
                <Button 
                  variant="outline"
                  onClick={toggleDeleteMode}
                >
                  {isDeleteMode ? '취소' : '삭제'}
                </Button>
              </div>
            
            ) :              
            <Button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={handleStockSearchClick}
              >
              종목 추가하기
              </Button>
            }</div>
        <StockList 
          stocks={stocks} 
          onAdd={fetchStocks}  // ✅ 올바르게 전달!
          onDelete={handleDeleteStock}
          isDeleteMode={isDeleteMode}
          setIsDeleteMode={setIsDeleteMode}
        />
          </>
        )}
          </div>
      </div>
      <StockSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onAdd={fetchStocks}  // ✅ StockSearch에서 `onAdd`을 받으므로 수정!
      />

      {/* Add LoginForm Dialog */}
      <LoginForm 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog}
      />
    </div>
  );
};

export default StockMainPage;