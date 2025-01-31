import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";

export const SellStockModal = ({
    isOpen,
    onClose,
    stock,
    onSell,
    portfolioId,
    accessToken
}) => {
    const [sellData, setSellData] = useState({
        pfstockCount: '',
        pfstockPrice: ''
    });
    const [error, setError] = useState('');  // 에러 메시지 상태 추가

    const handleSellDataChange = (e) => {
        const { name, value } = e.target;
        const numValue = Number(value);

        if (name === 'pfstockCount') {
            if (numValue > stock?.pfstockCount) {
                setError('매도수량을 초과했습니다');
            } else {
                setError('');
            }
        }

        setSellData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 매도 버튼 활성화 조건
    const isValid = sellData.pfstockCount &&
        sellData.pfstockPrice &&
        Number(sellData.pfstockCount) <= stock?.pfstockCount &&
        Number(sellData.pfstockCount) > 0;

    const handleSell = async () => {
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}/stocks/${stock.id}/sellStock`,
                {
                    pfstockCount: parseInt(sellData.pfstockCount),
                    pfstockPrice: parseInt(sellData.pfstockPrice)
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            if (response.status === 200) {
                onSell(response.data);
                onClose();
            }
        } catch (error) {
            console.error('매도 중 오류 발생:', error);
            alert('매도 처리 중 오류가 발생했습니다.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[400px]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">매도</h2>
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
                        <div className="text-sm text-gray-500">보유수량: {stock?.pfstockCount.toLocaleString()}주</div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                매도 수량
                            </label>
                            <Input
                                type="number"
                                name="pfstockCount"
                                value={sellData.pfstockCount}
                                onChange={handleSellDataChange}
                                placeholder="수량을 입력하세요"
                                max={stock?.pfstockCount}
                            />
                            {error && (
                                <p className="text-sm text-red-500 mt-1">{error}</p>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                매도 가격
                            </label>
                            <Input
                                type="number"
                                name="pfstockPrice"
                                value={sellData.pfstockPrice}
                                onChange={handleSellDataChange}
                                placeholder="가격을 입력하세요"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            취소
                        </Button>
                        <Button
                            onClick={handleSell}
                            disabled={!isValid}
                        >
                            매도
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
