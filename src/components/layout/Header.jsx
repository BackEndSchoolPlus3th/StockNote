import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import HeaderSearch from './HeaderSearch';

const navigationItems = [
  { label: "포트폴리오", href: "/portfolio" },
  { label: "관심종목", href: "/stocks" },
  { label: "커뮤니티", href: "/community/articles" }
];

export default function Frame() {
  const { isAuthenticated, user, logout } = useAuth();
  console.log(user);
  const navigate = useNavigate();
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
          <NavigationMenuList className="flex gap-8"> 
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.label}>
                <Link
                  to={item.href}
                  className="px-[5px] py-2.5 text-black hover:bg-gray-100 rounded-[5px] font-h4 text-[16px]"
                >
                  {item.label}
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <HeaderSearch />

        {/* User Section - Conditional Rendering */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <div className="flex items-center gap-2 hover:opacity-80">
                      <Avatar className="w-[35px] h-[35px]">
                        <AvatarImage src={user?.profile || "https://github.com/shadcn.png"} alt="User avatar" />
                        <AvatarFallback>{user?.name?.[0] || 'UN'}</AvatarFallback>
                      </Avatar>
                      <span className="font-h4 text-[16px]">{user?.name || "사용자"}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/mypage')}>
                      마이페이지
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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