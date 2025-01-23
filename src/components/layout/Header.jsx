import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Bell, Search } from "lucide-react";
import React from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const navigationItems = [
  { label: "포트폴리오", href: "#" },
  { label: "커뮤니티", href: "#" },
  { label: "종목 정보", href: "#" },
];

export default function Frame() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  console.log(user);
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="w-full h-[131px] bg-white">
      <div className="max-w-[1512px] mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center cursor-pointer">
          <h1 className="text-[32px] font-h1 font-extrabold">Stock Note</h1>
        </Link>

        <NavigationMenu className="ml-8">
        <NavigationMenuList className="flex gap-8">  {/* 여기에 gap 추가 */}
          {navigationItems.map((item) => (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuLink
                className="px-[5px] py-2.5 text-black hover:bg-gray-100 rounded-[5px] font-h4 text-[16px]"
                href={item.href}
              >
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-[430px] mx-4">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-[25px] h-[25px] text-gray-400" />
            <Input
              className="h-[38px] pl-14 rounded-[20px] border-black shadow-[0px_4px_4px_#00000040]"
              placeholder="주식 종목 검색"
            />
          </div>
        </div>

        {/* User Section - Conditional Rendering */}
        <div className="flex items-center gap-4">
        {isAuthenticated ? (
    <>
      <div className="flex items-center gap-2">
        <Avatar className="w-[35px] h-[35px]">
          <AvatarImage src={user?.profile|| "https://github.com/shadcn.png"} alt="User avatar" />
          <AvatarFallback>{user?.name?.[0] || 'UN'}</AvatarFallback>
        </Avatar>
        <span className="font-h4 text-[16px]">{user?.name || "사용자"}</span>
      </div>

      <Button variant="ghost" size="icon" className="relative">
        <Bell className="w-[25px] h-[27px]" />
      </Button>

      <Button 
        onClick={handleLogout}
        className="bg-variable-collection-primary text-white rounded-[5px] px-[15px] py-2.5"
      >
        로그아웃
      </Button>
    </>
  ) : (
    // 여기가 실행되어야 로그인 버튼이 보임
    <Button 
  className="bg-[#3B82F6] text-white rounded-lg px-4 py-2"
  onClick={() => navigate('/login')} 
>
  로그인 
</Button>
  )}
        </div>
      </div>
    </header>
  );
}