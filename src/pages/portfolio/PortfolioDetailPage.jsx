import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import PortfolioSummary from "./PortfolioSummary";
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const PortfolioDetailPage = () => {
    const { accessToken } = useAuth();
    const { portfolioId } = useParams();
    const [stocks, setStocks] = useState([]);
    const [portfolio, setPortfolio] = useState(null);
    const [activeTab, setActiveTab] = useState('종합자산');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStock, setEditingStock] = useState(null);
    const [editingStockData, setEditingStockData] = useState({
        pfstockCount: '',
        pfstockPrice: ''
    });

    const tabs = ['종합자산', '코스피', '코스닥', '매매일지'];

    useEffect(() => {
        if (accessToken) {
            fetchPortfolioAndStocks();
        }
    }, [accessToken, portfolioId]);

    const fetchPortfolioAndStocks = async () => {
        try {
            const [portfolioResponse, stocksResponse] = await Promise.all([
                axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                }),
                axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                })
            ]);

            const currentPortfolio = portfolioResponse.data.data.find(p => p.id === parseInt(portfolioId));
            if (currentPortfolio) {
                setPortfolio(currentPortfolio);
            }

            if (stocksResponse.data.data) {
                setStocks(stocksResponse.data.data);
            }
        } catch (error) {
            console.error('데이터를 불러오는데 실패했습니다:', error);
        }
    };

    const handleDeleteStock = async (portfolioId, stockId) => {
        if (!window.confirm('정말 이 종목을 삭제하시겠습니까?')) return;

        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}/stocks/${stockId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            if (response.status === 200) {
                fetchPortfolioAndStocks();
            } else {
                alert('종목 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('종목 삭제 중 오류 발생:', error);
        }
    };

    const handleEditClick = (stock) => {
        setEditingStock(stock);
        setEditingStockData({
            pfstockCount: stock.pfstockCount,
            pfstockPrice: stock.pfstockPrice
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateStock = async () => {
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}/stocks/${editingStock.id}`,
                {
                    pfstockCount: parseInt(editingStockData.pfstockCount),
                    pfstockPrice: parseInt(editingStockData.pfstockPrice)
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            if (response.status === 200) {
                alert('종목이 수정되었습니다.');
                setIsEditModalOpen(false);
                setEditingStock(null);
                fetchPortfolioAndStocks();
            } else {
                alert('종목 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('종목 수정 중 오류 발생:', error);
            alert('종목 수정 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* 왼쪽 컨테이너 */}
            <div className="w-1/2 p-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {portfolio && (
                        <PortfolioSummary
                            stocks={stocks}
                            portfolioId={portfolioId}
                            portfolioName={portfolio.name}
                            portfolioDescription={portfolio.description}
                        />
                    )}
                </div>
            </div>

            {/* 오른쪽 컨테이너 */}
            <div className="w-1/2 p-6">
                <div className="bg-white h-full rounded-lg shadow-sm p-6 space-y-6 overflow-auto">
                    {/* 탭 영역 */}
                    <div className="flex gap-3">
                        {tabs.map((tab) => (
                            <Button
                                key={tab}
                                variant={activeTab === tab ? "default" : "outline"}
                                onClick={() => setActiveTab(tab)}
                                className="px-6"
                            >
                                {tab}
                            </Button>
                        ))}
                    </div>

                    {/* 정렬 및 편집 영역 */}
                    <div className="flex justify-between items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    정렬기준
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>자산가치 순</DropdownMenuItem>
                                <DropdownMenuItem>수익률 순</DropdownMenuItem>
                                <DropdownMenuItem>종목명 순</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={isEditMode ? "bg-blue-100" : ""}
                        >
                            {isEditMode ? "완료" : "편집"}
                        </Button>
                    </div>

                    {/* 주식 목록 */}
                    <div className="space-y-4">
                        {stocks.map((stock) => (
                            <div key={stock.id} className="p-4 border rounded-lg space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                                        <div>
                                            <div className="font-medium">{stock.stockName}</div>
                                            <div className="text-sm text-gray-500">코스피</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">수량</span>
                                        <span className="font-medium">{stock.pfstockCount.toLocaleString()}</span>
                                    </div>
                                </div>

                                {isEditMode && (
                                    <div className="flex gap-2 border-b pb-2">
                                        <button className="flex-1 py-1 px-3 text-sm rounded hover:bg-gray-100">매수</button>
                                        <button className="flex-1 py-1 px-3 text-sm rounded hover:bg-gray-100">매도</button>
                                        <button
                                            className="flex-1 py-1 px-3 text-sm rounded hover:bg-gray-100"
                                            onClick={() => handleEditClick(stock)}
                                        >수정</button>
                                        <button
                                            className="flex-1 py-1 px-3 text-sm rounded text-red-600 hover:bg-red-50"
                                            onClick={() => handleDeleteStock(portfolioId, stock.id)}
                                        >삭제</button>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">자산가치</span>
                                            <span>{stock.pfstockTotalPrice.toLocaleString()}원</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">수익</span>
                                            <span className="text-green-600">+300,000원</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">평균단가</span>
                                            <span>{stock.pfstockPrice.toLocaleString()}원</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">현재가</span>
                                            <span>45,000원</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 수정 모달 */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">종목 수정</h2>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditingStock(null);
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 border rounded-lg bg-gray-50">
                                <div className="font-medium">{editingStock?.stockName}</div>
                                <div className="text-sm text-gray-500">코스피</div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        수량
                                    </label>
                                    <Input
                                        type="number"
                                        value={editingStockData.pfstockCount}
                                        onChange={(e) => setEditingStockData({
                                            ...editingStockData,
                                            pfstockCount: e.target.value
                                        })}
                                        placeholder="수량을 입력하세요"
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        평균단가
                                    </label>
                                    <Input
                                        type="number"
                                        value={editingStockData.pfstockPrice}
                                        onChange={(e) => setEditingStockData({
                                            ...editingStockData,
                                            pfstockPrice: e.target.value
                                        })}
                                        placeholder="평균단가를 입력하세요"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingStock(null);
                                    }}
                                >
                                    취소
                                </Button>
                                <Button onClick={handleUpdateStock}>
                                    수정
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioDetailPage;