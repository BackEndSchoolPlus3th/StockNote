
import React from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import portfolioIcon from "@/assets/portfolio-icon.svg";

export const PortfolioHeader = ({
    portfolioName,
    onAddClick,
    onEditClick,
    onDeleteClick,
}) => {
    return (
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <img src={portfolioIcon} alt="Portfolio" className="w-10 h-10" />
                <span className="font-medium text-lg">
                    {portfolioName || "포트폴리오"}
                </span>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-gray-100"
                    onClick={onAddClick}
                >
                    <Plus className="h-5 w-5 text-gray-600" />
                </Button>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                            <MoreHorizontal className="h-5 w-5 text-gray-600" />
                        </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            className="min-w-[200px] bg-white rounded-lg shadow-lg p-2 z-50"
                            sideOffset={5}
                            align="end"
                            side="bottom"
                        >
                            <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md outline-none"
                                onSelect={onEditClick}
                            >
                                <Pencil className="h-4 w-4" />
                                <span>포트폴리오 수정</span>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md text-red-600 outline-none"
                                onSelect={onDeleteClick}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>삭제하기</span>
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>
        </div>
    );
};