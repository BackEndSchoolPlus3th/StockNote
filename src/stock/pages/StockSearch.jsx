import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const StockSearch = ({ isOpen, onClose, onAddStock }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get("/api/v1/stocks", {
        params: { name: searchTerm },
      });
      setSearchResults(response.data.data);
    } catch (error) {
      console.error("Error searching stock:", error);
    }
  };

  const handleSelectStock = (stock) => {
    onAddStock(stock);
    onClose();
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>종목 검색</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mt-4">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="종목명을 입력하세요"
            className="flex-1"
          />
          <Button onClick={handleSearch}>검색</Button>
        </div>
        <div className="mt-4">
          {searchResults.map((stock) => (
            <div
              key={stock.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectStock(stock)}
            >
              {stock.name}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default StockSearch;