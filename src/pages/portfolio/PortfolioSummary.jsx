import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Pencil, Copy, Trash2, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import portfolioIcon from '../../assets/portfolio-icon.svg';
import { PieChart, Pie } from 'recharts';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// 파란색 계열의 색상 팔레트
const BLUE_COLORS = [
    '#4318FF', // 진한 파란색
    '#6AD2FF', // 밝은 파란색
    '#2B3674', // 어두운 파란색
    '#A3AED0', // 회색빛 파란색
    '#B0C4FF', // 연한 파란색
];

const PortfolioSummary = ({ stocks, portfolioId, portfolioName, portfolioDescription }) => {
    const { accessToken } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState('stock'); // 'stock' or 'cash'
    const [editPortfolio, setEditPortfolio] = useState({
        name: portfolioName || "",
        description: portfolioDescription || ""
    });
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [averagePrice, setAveragePrice] = useState('');

    useEffect(() => {
        console.log('portfolioName:', portfolioName); // 디버깅용
        setEditPortfolio({
            name: portfolioName || "",
            description: portfolioDescription || ""
        });
    }, [portfolioName, portfolioDescription]);

    // 총 자산 계산
    const totalAsset = stocks.reduce((sum, stock) => sum + stock.pfstockTotalPrice, 0);

    // 종목별 비중 계산
    const stockRatios = stocks.map((stock, index) => ({
        name: stock.stockName,
        ratio: (stock.pfstockTotalPrice / totalAsset * 100).toFixed(1),
        amount: stock.pfstockTotalPrice,
        fill: BLUE_COLORS[index % BLUE_COLORS.length]
    }));

    // 분야별 비중 계산 (임시 데이터)
    const sectorRatios = [
        { name: "제약/의료", ratio: "44.9", color: "bg-[#4318FF]" },
        { name: "전자", ratio: "35.1", color: "bg-[#6AD2FF]" },
        { name: "현금", ratio: "20.0", color: "bg-[#A3AED0]" }
    ];

    const fetchStockList = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/tempStock`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.status === 200) {
                const data = response.data;
                console.log('API 응답 전체:', data.data); // 전체 응답 구조 확인

                if (data.data) {
                    const filteredResults = data.data.filter(stock =>
                        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        stock.code.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    setSearchResults(filteredResults);
                } else {
                    console.log('유효하지 않은 응답 데이터:', data);
                    setSearchResults([]);
                }
            } else {
                console.error('주식 목록 조회에 실패했습니다.');
                setSearchResults([]);
            }
        } catch (error) {
            console.error('API 호출 중 오류 발생:', error);
            setSearchResults([]);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value.length >= 1) {
            fetchStockList();
        } else {
            setSearchResults([]);
        }
    };

    const handleEditPortfolio = async () => {
        try {
            const response = await axios.patch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}`, {
                name: editPortfolio.name,
                description: editPortfolio.description
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
    
            if (response.status === 200) { // 200 OK
                setIsEditModalOpen(false);
                window.location.reload(); // 수정 후 페이지 새로고침
            } else {
                console.error('포트폴리오 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('포트폴리오 수정 중 오류 발생:', error);
        }
    };

    const handleDeletePortfolio = async () => {
        if (!window.confirm('정말로 이 포트폴리오를 삭제하시겠습니까?')) {
            return;
        }
    
        try {
            const response = await axios.delete(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
    
            if (response.status === 204) { // 204 No Content
                window.location.href = '/portfolio'; // 삭제 후 포트폴리오 페이지로 이동
            } else {
                console.error('포트폴리오 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('포트폴리오 삭제 중 오류 발생:', error);
        }
    };

    // 검색 결과에서 주식 선택 시 호출되는 함수
    const handleStockSelect = (stock) => {
        setSelectedStock(stock);
        setSearchQuery('');
        setSearchResults([]);
    };

    // 종목 추가 처리 함수
    const handleAddStock = async () => {
        if (!selectedStock || !quantity || !averagePrice) {
            alert('종목, 수량, 평균단가를 모두 입력해주세요.');
            return;
        }
    
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}/stocks/AddStock`,
                {
                    pfstockCount: parseInt(quantity),
                    pfstockPrice: parseInt(averagePrice),
                    stockName: selectedStock.name,
                    stockCode: selectedStock.code
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
    
            if (response.status === 200) { // 200 OK
                alert('종목이 추가되었습니다.');
                setIsAddModalOpen(false);
                setSelectedStock(null);
                setQuantity('');
                setAveragePrice('');
                setSearchQuery('');
                window.location.reload(); // 페이지 새로고침
            } else {
                alert('종목 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('종목 추가 중 오류 발생:', error);
            alert('종목 추가 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* 헤더 영역 */}
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
                        onClick={() => {
                            console.log('Opening modal...');
                            setIsAddModalOpen(true);
                        }}
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
                                    onSelect={() => setIsEditModalOpen(true)}
                                >
                                    <Pencil className="h-4 w-4" />
                                    <span>포트폴리오 수정</span>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md outline-none">
                                    <Copy className="h-4 w-4" />
                                    <span>포트폴리오 복사</span>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md text-red-600 outline-none"
                                    onSelect={handleDeletePortfolio}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>삭제하기</span>
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            </div>

            {/* 주식/현금 추가 모달 */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[500px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">자산 추가</h2>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => {
                                    console.log('Closing modal...');
                                    setIsAddModalOpen(false);
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* 탭 버튼 */}
                        <div className="flex gap-2 mb-4">
                            <Button
                                variant={selectedTab === 'stock' ? 'default' : 'outline'}
                                onClick={() => setSelectedTab('stock')}
                            >
                                주식
                            </Button>
                            <Button
                                variant={selectedTab === 'cash' ? 'default' : 'outline'}
                                onClick={() => setSelectedTab('cash')}
                            >
                                현금
                            </Button>
                        </div>

                        {/* 검색 입력창 및 선택된 주식 정보 표시 */}
                        {selectedTab === 'stock' && (
                            <div className="space-y-4">

                                {/* 검색 입력창 */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        type="text"
                                        placeholder="종목명 또는 종목코드를 입력하세요"
                                        value={searchQuery}
                                        onChange={handleSearch}
                                        className="pl-10"
                                    />
                                </div>

                                {/* 선택된 주식 정보 표시 */}
                                {selectedStock && (
                                    <div className="p-3 border rounded-lg bg-gray-50">
                                        <div className="font-medium">{selectedStock.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {selectedStock.code} | {selectedStock.category}
                                        </div>
                                    </div>
                                )}

                                {/* 검색 결과 목록 */}
                                {searchQuery && (
                                    <div className="mt-2 border rounded-lg divide-y max-h-60 overflow-auto">
                                        {searchResults && searchResults.length > 0 ? (
                                            searchResults.map((stock, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3 hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => handleStockSelect(stock)}
                                                >
                                                    <div className="font-medium">{stock.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {stock.code} | {stock.category}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-3 text-center text-gray-500">
                                                검색 결과가 없습니다
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 수량 입력창 - 항상 표시 */}
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                수량
                                            </label>
                                            <Input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                placeholder="수량을 입력하세요"
                                                className="w-full"
                                                disabled={!selectedStock}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                평균단가
                                            </label>
                                            <Input
                                                type="number"
                                                value={averagePrice}
                                                onChange={(e) => setAveragePrice(e.target.value)}
                                                placeholder="평균단가를 입력하세요"
                                                className="w-full"
                                                disabled={!selectedStock}
                                            />
                                        </div>
                                    </div>
                                    {!selectedStock && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            종목을 선택해주세요
                                        </p>
                                    )}
                                </div>
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        수량
                                    </label>
                                    <Input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="수량을 입력하세요"
                                        className="w-full"
                                        disabled={!selectedStock}
                                    />
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        평균단가
                                    </label>
                                    <Input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="평균단가를 입력하세요"
                                        className="w-full"
                                        disabled={!selectedStock}
                                    />
                                    {!selectedStock && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            종목을 선택해주세요
                                        </p>
                                    )}
                                </div> */}
                            </div>
                        )}

                        {/* 현금 입력 폼 */}
                        {selectedTab === 'cash' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        현금 금액
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="금액을 입력하세요"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        메모
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="메모를 입력하세요 (선택)"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 하단 버튼 */}
                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setSelectedStock(null);
                                    setQuantity('');
                                    setAveragePrice('');
                                    setSearchQuery('');
                                }}
                            >
                                취소
                            </Button>
                            <Button
                                disabled={selectedTab === 'stock' && (!selectedStock || !quantity || !averagePrice)}
                                onClick={() => {
                                    if (selectedTab === 'stock') {
                                        handleAddStock();
                                    } else {
                                        // 현금 추가 로직
                                    }
                                }}
                            >
                                {selectedTab === 'stock' ? '종목 추가' : '현금 추가'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 포트폴리오 수정 모달 */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h2 className="text-xl font-bold mb-4">포트폴리오 수정</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">포트폴리오 이름</label>
                                <Input
                                    type="text"
                                    value={editPortfolio.name}
                                    onChange={(e) => setEditPortfolio({ ...editPortfolio, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">설명</label>
                                <Input
                                    type="text"
                                    value={editPortfolio.description}
                                    onChange={(e) => setEditPortfolio({ ...editPortfolio, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    취소
                                </Button>
                                <Button
                                    onClick={handleEditPortfolio}
                                >
                                    수정
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 총자산 정보 */}
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">총자산</div>
                <div className="text-2xl font-bold">{totalAsset.toLocaleString()}원</div>
                <div className="text-green-500 font-medium">평가 손익 + 300,000원(+19.7%)</div>
            </div>

            {/* 자산 구성 탭 */}
            <div className="flex gap-4 border-b">
                <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-medium">자산구성</button>
                <button className="px-4 py-2 text-gray-500 hover:text-gray-700">코스피</button>
                <button className="px-4 py-2 text-gray-500 hover:text-gray-700">코스닥</button>
            </div>

            {/* 종목별 비중과 파이 차트 */}
            <div className="flex gap-8">
                {/* 파이 차트 */}
                <div className="w-[200px] h-[200px]">
                    <PieChart width={200} height={200}>
                        <Pie
                            data={stockRatios}
                            dataKey="amount"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
                            strokeWidth={2}
                            stroke="#fff"
                        />
                    </PieChart>
                </div>

                {/* 종목별 비중 */}
                <div className="flex-1 space-y-4">
                    <div className="flex gap-2">
                        {stockRatios.map((stock, index) => (
                            <div key={index} className="w-2 h-2 rounded-full" style={{
                                backgroundColor: stock.fill
                            }}></div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        {stockRatios.map((stock, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded" style={{
                                        backgroundColor: stock.fill
                                    }}></div>
                                    <span className="text-gray-700">{stock.name}</span>
                                </div>
                                <span className="font-medium">{stock.ratio}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 분야별 비중 */}
            <div>
                <h3 className="font-medium mb-4 text-gray-900">분야별 비중</h3>
                <div className="space-y-3">
                    {sectorRatios.map((sector, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded ${sector.color}`}></div>
                                <span className="text-gray-700">{sector.name}</span>
                            </div>
                            <span className="font-medium">{sector.ratio}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PortfolioSummary;
