import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";

export const BuyStockModal = ({
    isOpen,
    onClose,
    stock,
    onBuy,
    portfolioId,
    accessToken
}) => {
    const [buyData, setBuyData] = useState({
        pfstockCount: '',
        pfstockPrice: ''
    });

    const handleBuy = async () => {
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}/stocks/${stock.id}/buyStock`,
                {
                    pfstockCount: parseInt(buyData.pfstockCount),
                    pfstockPrice: parseInt(buyData.pfstockPrice)
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            if (response.status === 200) {
                onBuy(response.data);
                onClose();
            }
        } catch (error) {
            console.error('매수 중 오류 발생:', error);
            alert('매수 처리 중 오류가 발생했습니다.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[400px]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">매수</h2>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="p-3 border rounded-lg bg-gray-50">
                        <div className="font-medium">{stock?.stockName}</div>
                        <div className="text-sm text-gray-500">현재가: {stock?.currentPrice?.toLocaleString()}원</div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                매수 수량
                            </label>
                            <Input
                                type="number"
                                value={buyData.pfstockCount}
                                onChange={(e) => setBuyData({
                                    ...buyData,
                                    pfstockCount: e.target.value
                                })}
                                placeholder="수량을 입력하세요"
                                min="1"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                매수 가격
                            </label>
                            <Input
                                type="number"
                                value={buyData.pfstockPrice}
                                onChange={(e) => setBuyData({
                                    ...buyData,
                                    pfstockPrice: e.target.value
                                })}
                                placeholder="가격을 입력하세요"
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="pt-2">
                        <div className="text-sm text-gray-600">
                            총 매수금액: {(buyData.pfstockCount * buyData.pfstockPrice || 0).toLocaleString()}원
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            취소
                        </Button>
                        <Button
                            onClick={handleBuy}
                            disabled={!buyData.pfstockCount || !buyData.pfstockPrice}
                        >
                            매수
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
