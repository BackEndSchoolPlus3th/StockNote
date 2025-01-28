import React, { useState } from "react";
import StockList from "./StockList";
import StockSearch from "./StockSearch";
import { Button } from "@/components/ui/button";

const StockMainPage = () => {
  const [stocks, setStocks] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleAddStock = (stock) => {
    setStocks([...stocks, stock]);
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
            <StockList stocks={stocks} />
          </div>
        </div>
      </div>

      <StockSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onAddStock={handleAddStock}
      />
    </div>
  );
};

export default StockMainPage;