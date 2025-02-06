import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from 'react';

const popularPosts = Array(4).fill({
  title: "좀 봐주세요",
  date: "2025. 01. 18  22:01",
  author: "주식은 못 말려",
});

const votingItems = Array(3).fill({
  stock: "삼성전자",
  sellPercentage: 63.8,
  buyPercentage: 36.2,
});

const CommunitySidebar = ({ onSearch }) => {
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(searchKeyword);
    }
  };

  return (
    <div className="bg-blue-100 p-4 rounded-lg">
      <div className="w-[406px]">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="게시글 검색"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
              <Search 
                className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => onSearch(searchKeyword)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-xl">실시간 투표</CardTitle>
          </CardHeader>
          <CardContent>
            {votingItems.map((item, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-lg mb-2">{item.stock}</h3>
                <div className="flex items-center gap-2">
                  <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200">매수</button>
                  <span>{item.buyPercentage}%</span>
                  <Progress value={item.sellPercentage} className="flex-1" />
                  <span>{item.sellPercentage}%</span>
                  <button className="bg-red-100 text-red-800 px-3 py-1 rounded-full hover:bg-red-200">매도</button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl pt-2">인기 게시글</CardTitle>
          </CardHeader>
          <CardContent>
            {popularPosts.map((post, index) => (
              <div key={index} className="py-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg">{post.title}</h3>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                      <img src="" alt="User" />
                    </Avatar>
                    <span>{post.author}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {post.date}
                </div>
                {index < popularPosts.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunitySidebar;