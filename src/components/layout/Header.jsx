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

const navigationItems = [
  { label: "포트폴리오", href: "#" },
  { label: "커뮤니티", href: "#" },
  { label: "종목 정보", href: "#" },
];

export default function Frame() {
  return (
    <header className="w-full h-[131px] bg-white">
      <div className="max-w-[1512px] mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-[32px] font-h1 font-extrabold">Stock Note</h1>
        </div>

        {/* Navigation */}
        <NavigationMenu className="ml-8">
          <NavigationMenuList>
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

        {/* User Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="w-[35px] h-[35px]">
              <AvatarImage src="" alt="User avatar" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <span className="font-h4 text-[16px]">주식은 못 말려</span>
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-[25px] h-[27px]" />
          </Button>

          <Button className="bg-variable-collection-primary text-white rounded-[5px] px-[15px] py-2.5">
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  );
}