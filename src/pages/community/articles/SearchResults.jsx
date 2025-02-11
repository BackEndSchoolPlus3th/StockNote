import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Calendar } from "lucide-react";

const SearchResults = ({ posts, onPostClick }) => {
  if (!posts || posts.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">검색 결과가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {posts.map((post) => (
        <Card 
          key={post.id} 
          className="bg-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onPostClick(post.id)}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={post.profile || '/default-avatar.png'} 
                    alt="User profile" 
                  />
                  <AvatarFallback>{post.username?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium truncate max-w-[500px]">{post.title}</h3>
                  <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <span className="font-medium text-gray-700">{post.username}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-600 line-clamp-2 overflow-hidden mb-4">
              {post.body}
            </p>
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                {post.hashtags?.map((tag, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">{post.likeCount || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">{post.commentCount || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SearchResults;