import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";
import { BiBell } from 'react-icons/bi'
import { useAuth } from '@/contexts/AuthContext';
import HeaderSearch from './HeaderSearch';
import { FiMenu } from 'react-icons/fi';

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
import axios from 'axios';

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

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [eventSource, setEventSource] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      // SSE 연결
      const sse = new EventSource(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/sse/connect?memberId=${user.id}`
      );
      
      sse.addEventListener('notification', event => {
        const notification = JSON.parse(event.data);
        console.log(notification);
        setNotifications(prev => [notification, ...prev]);
        console.log(notifications);
      });

      setEventSource(sse);

      // 기존 알림 목록 가져오기
      fetchNotifications();

      return () => {
        sse.close();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/notifications/user`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      console.log("응답데이터:"+ response.data);
      setNotifications(response.data);
    } catch (error) {
      console.error('알림 조회 실패:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/notifications/${notification.id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      setNotifications(prev => 
        prev.map(note => 
          note.id === notification.id 
            ? {...note, isRead: true} 
            : note
        )
      );
  
      // Navigate to post
      if (notification.postId) {
        navigate(`/community/article/${notification.postId}`);
        setShowNotifications(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  const unreadNotifications = notifications.filter(note => !note.isRead);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  return (
    <header className="w-full h-[110px] bg-white">
    <div className="max-w-[1512px] mx-auto px-6 h-full flex items-center">
        {/* Logo */}

        <Link to="/" className="flex items-center cursor-pointer mr-8">
          <h1 className="text-[32px] font-h1 font-extrabold">Stock Note</h1>
        </Link>

        <button 
          className="md:hidden focus:outline-none"
          onClick={toggleMobileMenu}
        >
          <FiMenu size={24} />
        </button>

        <NavigationMenu className="ml-8 hidden md:block ">
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
        <HeaderSearch className="hidden md:block flex-1 max-w-[430px]"  />
        
      </NavigationMenuList>
    </NavigationMenu>
    <div className="ml-auto"></div>
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center gap-2 hover:opacity-80">
                    <Avatar className="w-[35px] h-[35px]">
                      <AvatarImage src={user?.profile || "https://github.com/shadcn.png"} alt="User avatar" />
                      <AvatarFallback>{user?.name?.[0] || 'UN'}</AvatarFallback>
                    </Avatar>
                  <span className="font-h4 text-[16px] hidden md:inline gap-8">{user?.name || "사용자"}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/mypage')}>
                    마이페이지
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
        {isAuthenticated && (
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2"
            >
              <span className="relative">
                <BiBell size={24} />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                <div className="p-4">
                  {unreadNotifications.length === 0 ? (
                    <p className="text-gray-500">읽지 않은 알림이 없습니다.</p>
                  ) : (
                    unreadNotifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <p className="text-sm">{notification.content}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isMobileMenuOpen && (
    <div className="md:hidden">
    {isMobileMenuOpen && (
      <div className="fixed top-20 left-0 right-0 z-40 bg-white/95 shadow-lg max-h-[calc(100vh-5rem)] rounded-b-xl overflow-y-auto">
      <HeaderSearch className="xp-4 border-t border-gray-100" />
        <NavigationMenu>
          <NavigationMenuList className="flex flex-col gap-2 p-4"> 
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.label} className="w-full">
                <Link
                  to={item.href}
                  className="block w-full px-4 py-3 text-black hover:bg-gray-100 rounded-[8px] font-medium text-[16px] transition-colors duration-200 text-left "
                  onClick={toggleMobileMenu}
                >
                  {item.label}
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

      </div>

  )}
    </div>)}
</header>
  );
}