import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios'; // axios import 추가

const StockForm = ({
    searchQuery,
    selectedStock,
    quantity,
    averagePrice,
    onSearch,
    onStockSelect,
    onQuantityChange,
    onAveragePriceChange,
    searchResults
}) => {
    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    type="text"
                    placeholder="종목명 또는 종목코드를 입력하세요"
                    value={searchQuery}
                    onChange={onSearch}
                    className="pl-10"
                />
            </div>

            {selectedStock && (
                <div className="p-3 border rounded-lg bg-gray-50">
                    <div className="font-medium">{selectedStock.name}</div>
                    <div className="text-sm text-gray-500">
                        {selectedStock.code} | {selectedStock.market}
                    </div>
                </div>
            )}

            {searchQuery && (
                <div className="mt-2 border rounded-lg divide-y max-h-60 overflow-auto">
                    {searchResults && searchResults.length > 0 ? (
                        searchResults.map((stock, index) => (
                            <div
                                key={index}
                                className="p-3 hover:bg-gray-50 cursor-pointer"
                                onClick={() => onStockSelect(stock)}
                            >
                                <div className="font-medium">{stock.name}</div>
                                <div className="text-sm text-gray-500">
                                    {stock.code} | {stock.market}
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

            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            수량
                        </label>
                        <Input
                            type="number"
                            value={quantity}
                            onChange={(e) => onQuantityChange(e.target.value)}
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
                            onChange={(e) => onAveragePriceChange(e.target.value)}
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
        </div>
    );
};

const CashForm = ({ cashAmount, onCashAmountChange }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    현금 금액
                </label>
                <Input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => onCashAmountChange(e.target.value)}
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
    );
};

export const AddAssetModal = ({
    isOpen,
    onClose,
    onAddStock,
    onAddCash,
    accessToken
}) => {
    const [selectedTab, setSelectedTab] = useState('stock');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [averagePrice, setAveragePrice] = useState('');
    const [cashAmount, setCashAmount] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = async (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value.length >= 1) {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/search-stocks`,
                    { keyword: e.target.value },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        }
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
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleStockSelect = (stock) => {
        setSelectedStock(stock);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleClose = () => {
        setSelectedStock(null);
        setQuantity('');
        setAveragePrice('');
        setSearchQuery('');
        setCashAmount('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">자산 추가</h2>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={handleClose}
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

                {selectedTab === 'stock' ? (
                    <StockForm
                        searchQuery={searchQuery}
                        selectedStock={selectedStock}
                        quantity={quantity}
                        averagePrice={averagePrice}
                        onSearch={handleSearch}
                        onStockSelect={handleStockSelect}
                        onQuantityChange={setQuantity}
                        onAveragePriceChange={setAveragePrice}
                        searchResults={searchResults}
                    />
                ) : (
                    <CashForm
                        cashAmount={cashAmount}
                        onCashAmountChange={setCashAmount}
                    />
                )}

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={handleClose}>
                        취소
                    </Button>
                    <Button
                        disabled={selectedTab === 'stock' && (!selectedStock || !quantity || !averagePrice)}
                        onClick={() => {
                            if (selectedTab === 'stock') {
                                onAddStock({ selectedStock, quantity, averagePrice });
                            } else {
                                onAddCash(cashAmount);
                            }
                        }}
                    >
                        {selectedTab === 'stock' ? '종목 추가' : '현금 추가'}
                    </Button>
                </div>
            </div>
        </div>
    );
};