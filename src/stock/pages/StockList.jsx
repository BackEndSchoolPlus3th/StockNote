import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";
import React from "react";

const stockData = [
  {
    name: "삼성전자",
    price: "1,000,000원",
    change: "+9.79%",
    isPositive: true,
  },
  {
    name: "한화생명",
    price: "1,000,000원",
    change: "-9.79%",
    isPositive: false,
  },
  {
    name: "어쩌구저쩌구",
    price: "1,000,000원",
    change: "+9.79%",
    isPositive: true,
  },
];

const StockList = () => {
  return (
    <div className="flex justify-center w-full">
    <div className="w-[805px] bg-[#b9dafc1a] rounded-[20px] border p-8 space-y-6">
      <div className="space-y-4">
        <h1 className="font-h1 text-[32px] font-bold">관심종목</h1>

        <div className="flex justify-between items-center">
          <span className="font-h4 text-black">총 {stockData.length}개</span>

          <Select defaultValue="alphabetical">
            <SelectTrigger className="w-[127px]">
              <SelectValue placeholder="정렬 방식" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alphabetical">가나다순</SelectItem>
              <SelectItem value="price">가격순</SelectItem>
              <SelectItem value="change">변동순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2.5">
          {stockData.map((stock, index) => (
            <Card
              key={index}
              className="border border-variable-collection-gray shadow-[4px_4px_4px_#00000040]"
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-h3 text-black p-2.5">{stock.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-h3 text-black p-2.5">
                        {stock.price}
                      </span>
                      <span
                        className={`font-h4 p-2.5 ${
                          stock.isPositive
                            ? "text-variable-collection-error"
                            : "text-variable-collection-primaryvariant"
                        }`}
                      >
                        ({stock.change})
                      </span>
                    </div>
                  </div>
                  <button className="p-2">
                    <Star className="w-[22px] h-[21px] text-gray-400" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export default StockList;
