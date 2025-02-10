import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PortfolioSummary from "../../pfStock/portfolioSurmmary/PortfolioSummary";  // 경로 수정
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import TotalTransactionHistory from './TotalTransactionHistory';

const TotalPortfolioDetail = () => {
    const navigate = useNavigate();
    const { accessToken } = useAuth();
    const [stocks, setStocks] = useState([]);
    const [portfolio, setPortfolio] = useState(null);
    const [activeTab, setActiveTab] = useState('종합자산');
    const [isEditMode, setIsEditMode] = useState(false);
    const [sortType, setSortType] = useState('자산가치 순');

    const tabs = ['종합자산', '코스피', '코스닥', '매매일지'];
    const [shouldRefresh, setShouldRefresh] = useState(false);

    useEffect(() => {
        if (accessToken) {
            fetchTotalPortfolio();
        }
    }, [accessToken]);

    const fetchTotalPortfolio = async () => {
        try {
            // Mysql DB에서 데이터를 불러오는 코드
            // const response = await axios.get(
            //     `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/my`,
            //     {
            //         headers: { 'Authorization': `Bearer ${accessToken}` }
            //     }
            // );

            // elasticsearch에서 데이터를 불러오는 코드
            const response = await axios.get(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/searchDocs/myPortfolio`,
                {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                }
            );

            if (response.data && response.data.data) {
                setPortfolio(response.data.data);
                setStocks(response.data.data.pfStocks || []);
            }
            console.log("총 자산 포트폴리오 응답:", response.data);
        } catch (error) {
            console.error('데이터를 불러오는데 실패했습니다:', error);
            setStocks([]);
        }
    };

    // 현재 탭에 따른 주식 목록 필터링
    const getFilteredStocks = () => {
        switch (activeTab) {
            case '코스피':
                return stocks.filter(stock => stock.market === 'KOSPI');
            case '코스닥':
                return stocks.filter(stock => stock.market === 'KOSDAQ');
            default:
                return stocks;
        }
    };

    // 정렬된 주식 목록을 반환하는 함수
    const getSortedStocks = (stocks) => {
        return [...stocks].sort((a, b) => {
            switch (sortType) {
                case '자산가치 순':
                    return (b.currentPrice * b.pfstockCount) - (a.currentPrice * a.pfstockCount);
                case '수익률 순':
                    const profitRateA = ((a.currentPrice - a.pfstockPrice) / a.pfstockPrice) * 100;
                    const profitRateB = ((b.currentPrice - b.pfstockPrice) / b.pfstockPrice) * 100;
                    return profitRateB - profitRateA;
                case '종목명 순':
                    return a.stockName.localeCompare(b.stockName);
                default:
                    return 0;
            }
        });
    };

    // 현재 선택된 탭의 총 자산 계산
    const getFilteredTotalAsset = () => {
        const filteredStocks = getFilteredStocks();
        const stocksTotal = filteredStocks.reduce((sum, stock) =>
            sum + (stock.pfstockCount * stock.currentPrice), 0);
        return activeTab === '종합자산' ? portfolio?.totalAsset : stocksTotal;
    };

    // 주식 목록 또는 매매일지 렌더링
    const renderContent = () => {
        if (activeTab === '매매일지') {
            return <TotalTransactionHistory accessToken={accessToken} />;
        }

        const sortedStocks = getSortedStocks(getFilteredStocks());

        return (
            <div className="space-y-4">
                {/* 필터링된 주식 목록 */}
                {sortedStocks.map((stock) => (
                    <div key={stock.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                                <div>
                                    <div className="font-medium">{stock.stockName}</div>
                                    <div className="text-sm text-gray-500">{stock.market}</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-gray-500 w-20">수량</span>
                                        <span className="font-medium text-right w-24">
                                            {stock.pfstockCount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-gray-500 w-20">수익률</span>
                                        <span className={`${(stock.currentPrice - stock.pfstockPrice) > 0
                                            ? 'text-red-600'
                                            : 'text-blue-600'} text-right w-24`}>
                                            {((stock.currentPrice - stock.pfstockPrice) / stock.pfstockPrice * 100).toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">자산가치</span>
                                    <span>{(stock.currentPrice * stock.pfstockCount).toLocaleString()}원</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">수익</span>
                                    <span className={`${(stock.currentPrice - stock.pfstockPrice) > 0
                                        ? 'text-red-600'
                                        : 'text-blue-600'}`}>
                                        {((stock.currentPrice - stock.pfstockPrice) * stock.pfstockCount).toLocaleString()}원
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">평균단가</span>
                                    <span>{stock.pfstockPrice.toLocaleString()}원</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">현재가</span>
                                    <span>{stock.currentPrice.toLocaleString()}원</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* 왼쪽 컨테이너 */}
            <div className="w-1/2 p-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {portfolio && (
                        <PortfolioSummary
                            stocks={getFilteredStocks()}
                            portfolioName="총 자산 포트폴리오"
                            portfolioData={{
                                ...portfolio,
                                totalAsset: getFilteredTotalAsset(),
                                cash: activeTab === '종합자산' ? portfolio.cash : 0
                            }}
                            activeTab={activeTab}
                        />
                    )}
                </div>
            </div>

            {/* 오른쪽 컨테이너 */}
            <div className="w-1/2 p-6">
                <div className="bg-white h-full rounded-lg shadow-sm p-6 space-y-6 overflow-auto">
                    {/* 헤더 영역 */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        {sortType}
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setSortType('자산가치 순')}>
                                        자산가치 순
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortType('수익률 순')}>
                                        수익률 순
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortType('종목명 순')}>
                                        종목명 순
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default TotalPortfolioDetail;
