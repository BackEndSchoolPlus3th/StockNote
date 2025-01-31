import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import PortfolioSummary from "./portfolioSurmmary/PortfolioSummary";
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import { EditStockModal } from './modals/EditStockModal';
import { BuyStockModal } from './modals/BuyStockModal';
import { SellStockModal } from './modals/SellStockModal';
import { EditCashModal } from './modals/EditCashModal';
import { AddAssetModal } from './portfolioSurmmary/AddAssetModal';  // AddAssetModal import 추가

const PortfolioDetailPage = () => {
    const { accessToken } = useAuth();
    const { portfolioId } = useParams();
    const [stocks, setStocks] = useState([]);
    const [portfolio, setPortfolio] = useState(null);
    const [activeTab, setActiveTab] = useState('종합자산');
    const [isEditMode, setIsEditMode] = useState(false);
    const [cash, setCash] = useState(0);

    // 모달 상태 관리
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [isCashEditModalOpen, setIsCashEditModalOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);  // 상태 추가

    const tabs = ['종합자산', '코스피', '코스닥', '매매일지'];
    const [shouldRefresh, setShouldRefresh] = useState(false);

    const handleDataRefresh = () => {
        setShouldRefresh(prev => !prev);
    };

    useEffect(() => {
        if (accessToken) {
            fetchPortfolioAndStocks();
        }
    }, [accessToken, portfolioId]);

    const fetchPortfolioAndStocks = async () => {
        try {
            const portfolioResponse = await axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (portfolioResponse.data && portfolioResponse.data.data) {
                setPortfolio(portfolioResponse.data.data);
                // pfStocks 배열을 설정
                setStocks(portfolioResponse.data.data.pfStocks || []);
                setCash(portfolioResponse.data.data.cash || 0);
            }
            console.log("포트폴리오 응답:", portfolioResponse.data);
        } catch (error) {
            console.error('데이터를 불러오는데 실패했습니다:', error);
            setStocks([]); // 에러 시 빈 배열로 초기화
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
        setSelectedStock(stock);
        setIsEditModalOpen(true);
    };

    const handleBuyClick = (stock) => {
        setSelectedStock(stock);
        setIsBuyModalOpen(true);
    };

    const handleSellClick = (stock) => {
        setSelectedStock(stock);
        setIsSellModalOpen(true);
    };

    const handleEditCash = () => {
        setIsCashEditModalOpen(true);
    };

    const handleDeleteCash = async () => {
        if (!window.confirm('현금을 삭제하시겠습니까?')) return;

        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}/cash`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            if (response.status === 200) {
                fetchPortfolioAndStocks();
                handleDataRefresh();
            } else {
                alert('현금 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('현금 삭제 중 오류 발생:', error);
            alert('현금 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleModalAction = async (type, data) => {
        try {
            // API 호출 및 데이터 갱신 로직
            await fetchPortfolioAndStocks();
            handleDataRefresh();
        } catch (error) {
            console.error(`${type} 처리 중 오류 발생:`, error);
            alert(`${type} 처리 중 오류가 발생했습니다.`);
        }
    };

    const handleAssetAdded = () => {
        fetchPortfolioAndStocks();  // 종목이 추가되면 데이터 다시 불러오기
        handleDataRefresh();  // 필요한 경우 다른 컴포넌트 갱신 트리거
    };

    const handleAddClick = () => {
        setIsAddAssetModalOpen(true);
    };

    // 거래 내역 더미 데이터
    const transactionHistory = [
        { type: '매수', stockName: '삼성전자', amount: 10, price: 70000, date: '2024-01-30' },
        { type: '매도', stockName: 'LG전자', amount: 5, price: 120000, date: '2024-01-29' },
        { type: '수정', stockName: 'SK하이닉스', before: { amount: 3, price: 130000 }, after: { amount: 5, price: 125000 }, date: '2024-01-28' },
        { type: '삭제', stockName: '현대차', amount: 2, price: 180000, date: '2024-01-27' },
    ];

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

    // 현재 선택된 탭의 총 자산 계산
    const getFilteredTotalAsset = () => {
        const filteredStocks = getFilteredStocks();
        const stocksTotal = filteredStocks.reduce((sum, stock) =>
            sum + (stock.pfstockCount * stock.currentPrice), 0);
        return activeTab === '종합자산' ? portfolio?.totalAsset : stocksTotal;
    };

    // 매매일지 카드 컴포넌트
    const TransactionCard = ({ transaction }) => (
        <div className="p-4 border rounded-lg space-y-2 bg-white">
            <div className="flex justify-between items-center">
                <div className="font-medium">
                    <span className={`
                        ${transaction.type === '매수' ? 'text-red-600' : ''}
                        ${transaction.type === '매도' ? 'text-blue-600' : ''}
                        ${transaction.type === '수정' ? 'text-yellow-600' : ''}
                        ${transaction.type === '삭제' ? 'text-gray-600' : ''}
                    `}>
                        [{transaction.type}]
                    </span> {transaction.stockName}
                </div>
                <div className="text-sm text-gray-500">{transaction.date}</div>
            </div>
            {transaction.type === '수정' ? (
                <div className="text-sm">
                    <div className="text-gray-500">
                        수정 전: {transaction.before.amount}주 / {transaction.before.price.toLocaleString()}원
                    </div>
                    <div>
                        수정 후: {transaction.after.amount}주 / {transaction.after.price.toLocaleString()}원
                    </div>
                </div>
            ) : (
                <div className="text-sm">
                    <div>{transaction.amount}주</div>
                    <div>{transaction.price.toLocaleString()}원</div>
                </div>
            )}
        </div>
    );

    // 주식 목록 또는 매매일지 렌더링
    const renderContent = () => {
        if (activeTab === '매매일지') {
            return (
                <div className="space-y-4">
                    {transactionHistory.map((transaction, index) => (
                        <TransactionCard key={index} transaction={transaction} />
                    ))}
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* 현금 항목 */}
                {cash !== 0 && activeTab === '종합자산' && (
                    <div className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                                <div>
                                    <div className="font-medium">현금</div>
                                    <div className="text-sm text-gray-500">KRW</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">금액</span>
                                <span className="font-medium">{cash.toLocaleString()}원</span>
                            </div>
                        </div>
                        {isEditMode && (
                            <div className="flex gap-2 border-b pb-2">
                                <button
                                    className="flex-1 py-1 px-3 text-sm rounded bg-gray-100 hover:bg-gray-200"
                                    onClick={handleEditCash}
                                >수정</button>
                                <button
                                    className="flex-1 py-1 px-3 text-sm rounded bg-gray-100 hover:bg-gray-200"
                                    onClick={handleDeleteCash}
                                >삭제</button>
                            </div>
                        )}
                    </div>
                )}

                {/* 필터링된 주식 목록 */}
                {getFilteredStocks().map((stock) => (
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
                                        <span className="font-medium text-right w-24">{stock.pfstockCount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-gray-500 w-20">수익률</span>
                                        <span className={`${(stock.currentPrice - stock.pfstockPrice) > 0
                                            ? 'text-red-600'
                                            : (stock.currentPrice - stock.pfstockPrice) < 0
                                                ? 'text-blue-600'
                                                : 'text-gray-600'
                                            } text-right w-24`}>
                                            {(stock.currentPrice - stock.pfstockPrice) > 0 ? '+' : ''}
                                            {Number(((stock.currentPrice - stock.pfstockPrice) / stock.pfstockPrice * 100).toFixed(1)).toLocaleString()}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isEditMode && (
                            <div className="flex gap-2 border-b pb-2">
                                <button
                                    className="flex-1 py-1 px-3 text-sm rounded text-red-600 bg-red-100 hover:bg-red-200"
                                    onClick={() => handleBuyClick(stock)}
                                >매수</button>
                                <button
                                    className="flex-1 py-1 px-3 text-sm rounded text-blue-600 bg-blue-100 hover:bg-blue-200"
                                    onClick={() => handleSellClick(stock)}
                                >매도</button>
                                <button
                                    className="flex-1 py-1 px-3 text-sm rounded bg-gray-100 hover:bg-gray-200"
                                    onClick={() => handleEditClick(stock)}
                                >수정</button>
                                <button
                                    className="flex-1 py-1 px-3 text-sm rounded bg-gray-100 hover:bg-gray-200"
                                    onClick={() => handleDeleteStock(portfolioId, stock.id)}
                                >삭제</button>
                            </div>
                        )}

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
                                        : (stock.currentPrice - stock.pfstockPrice) < 0
                                            ? 'text-blue-600'
                                            : 'text-gray-600'
                                        }`}>
                                        {(stock.currentPrice - stock.pfstockPrice) > 0 ? '+' : ''}
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
                            stocks={activeTab === '매매일지' ? stocks : getFilteredStocks()}  // 매매일지 탭일 때는 전체 stocks 전달
                            portfolioId={portfolioId}
                            portfolioName={portfolio.name}
                            portfolioDescription={portfolio.description}
                            shouldRefresh={shouldRefresh} // 갱신 트리거 prop 추가
                            onAddClick={handleAddClick}  // 추가
                            onPortfolioUpdate={fetchPortfolioAndStocks}  // 추가: 포트폴리오 업데이트 콜백
                            portfolioData={{
                                ...portfolio,
                                totalAsset: activeTab === '매매일지' ? portfolio?.totalAsset : getFilteredTotalAsset(),  // 매매일지 탭일 때는 전체 자산 표시
                                cash: activeTab === '매매일지' || activeTab === '종합자산' ? portfolio.cash : 0
                            }}
                            activeTab={activeTab === '매매일지' ? '종합자산' : activeTab}  // 매매일지 탭일 때는 종합자산 뷰 표시
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

                    {renderContent()}
                </div>
            </div>

            <EditStockModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedStock(null);
                }}
                stock={selectedStock}
                onUpdate={(data) => handleModalAction('수정', data)}
                portfolioId={portfolioId}
                accessToken={accessToken}
            />

            <BuyStockModal
                isOpen={isBuyModalOpen}
                onClose={() => {
                    setIsBuyModalOpen(false);
                    setSelectedStock(null);
                }}
                stock={selectedStock}
                onBuy={(data) => handleModalAction('매수', data)}
                portfolioId={portfolioId}
                accessToken={accessToken}
            />

            <SellStockModal
                isOpen={isSellModalOpen}
                onClose={() => {
                    setIsSellModalOpen(false);
                    setSelectedStock(null);
                }}
                stock={selectedStock}
                onSell={(data) => handleModalAction('매도', data)}
                portfolioId={portfolioId}
                accessToken={accessToken}
            />

            <EditCashModal
                isOpen={isCashEditModalOpen}
                onClose={() => setIsCashEditModalOpen(false)}
                currentCash={cash}
                onUpdate={(amount) => handleModalAction('현금수정', amount)}
            />

            <AddAssetModal
                isOpen={isAddAssetModalOpen}
                onClose={() => setIsAddAssetModalOpen(false)}
                portfolioId={portfolioId}
                accessToken={accessToken}
                onAssetAdded={handleAssetAdded}  // 콜백 함수 전달
            />
        </div>
    );
};

export default PortfolioDetailPage;