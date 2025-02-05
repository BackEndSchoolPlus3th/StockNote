import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from 'axios';

const HeaderSearch = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchQuery("");
                setSearchResults([]);
                setIsDropdownVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.length >= 1) {
            setIsLoading(true);
            setIsDropdownVisible(true);
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/stocks/search-stocks`,
                    { keyword: value },
                    {
                        headers: { 'Content-Type': 'application/json' }
                    }
                );

                if (response.status === 200 && response.data?.data) {
                    setSearchResults(response.data.data);
                } else {
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('주식 검색 중 오류 발생:', error);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        } else {
            setSearchResults([]);
            setIsDropdownVisible(false);
        }
    };

    const handleSelectStock = (stock) => {
        navigate(`/stocks/${stock.code}`);
        setSearchQuery("");
        setSearchResults([]);
        setIsDropdownVisible(false);
    };

    return (
        <div ref={searchRef} className="relative flex-1 max-w-[430px] mx-4">
            <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-[25px] h-[25px] text-gray-400" />
                <Input
                    className="h-[38px] pl-14 rounded-[20px] border-black shadow-[0px_4px_4px_#00000040]"
                    placeholder="주식 종목 검색"
                    value={searchQuery}
                    onChange={handleSearch}
                    onFocus={() => setIsDropdownVisible(true)}
                />
            </div>

            {isDropdownVisible && (
                <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center py-2 text-gray-500">검색중...</div>
                    ) : searchResults.length === 0 ? (
                        <div className="text-center py-2 text-gray-500">
                            {searchQuery ? "검색 결과가 없습니다." : "종목명을 입력하세요."}
                        </div>
                    ) : (
                        <div className="space-y-0.5 p-1">
                            {searchResults.map((stock) => (
                                <button
                                    key={stock.code}
                                    onClick={() => handleSelectStock(stock)}
                                    className="w-full px-3 py-1.5 bg-white hover:bg-gray-100 rounded cursor-pointer transition-all duration-200 
                                             flex justify-between items-center group"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">{stock.name}</span>
                                            <span className="text-gray-500 mx-1">|</span>
                                            <span className="text-gray-500">{stock.code}</span>
                                        </div>
                                        <div className="text-gray-500 uppercase">{stock.market}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HeaderSearch;
