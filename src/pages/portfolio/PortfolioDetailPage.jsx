import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import PortfolioSummary from "../../components/PortfolioSummary";

const PortfolioDetailPage = () => {
    const { portfolioId } = useParams();
    const [stocks, setStocks] = useState([]);
    const [portfolio, setPortfolio] = useState(null);
    const [activeTab, setActiveTab] = useState('종합자산');

    useEffect(() => {
        fetchPortfolioAndStocks();
    }, [portfolioId]);

    const fetchPortfolioAndStocks = async () => {
        try {
            // 포트폴리오 정보 가져오기
            const portfolioResponse = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios`);
            const portfolioResult = await portfolioResponse.json();
            const currentPortfolio = portfolioResult.data.find(p => p.id === parseInt(portfolioId));
            if (currentPortfolio) {
                setPortfolio(currentPortfolio);
            }

            // 주식 목록 가져오기
            const stocksResponse = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}`);
            const stocksResult = await stocksResponse.json();
            if (stocksResult.data) {
                setStocks(stocksResult.data);
            }
        } catch (error) {
            console.error('데이터를 불러오는데 실패했습니다:', error);
        }
    };

    const tabs = ['종합자산', '코스피', '코스닥', '매매일지'];

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
                        <Button variant="outline">편집</Button>
                    </div>

                    {/* 주식 목록 */}
                    <div className="space-y-4">
                        {stocks.map((stock) => (
                            <div key={stock.id} className="p-4 border rounded-lg space-y-4">
                                {/* 상단 영역: 종목명, 수량 */}
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

                                {/* 하단 영역: 자산가치, 수익, 평균단가, 현재가 */}
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
        </div>
    );
};

export default PortfolioDetailPage;
