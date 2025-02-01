import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";

export const EditStockModal = ({
    isOpen,
    onClose,
    stock,
    onUpdate,
    portfolioId,
    accessToken
}) => {
    const [editingData, setEditingData] = useState({
        pfstockCount: stock?.pfstockCount || '',
        pfstockPrice: stock?.pfstockPrice || ''
    });

    const handleUpdate = async () => {
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}/stocks/${stock.id}`,
                {
                    pfstockCount: parseInt(editingData.pfstockCount),
                    pfstockPrice: parseInt(editingData.pfstockPrice)
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            if (response.status === 200) {
                onUpdate(response.data);
                onClose();
            }
        } catch (error) {
            console.error('종목 수정 중 오류 발생:', error);
            alert('종목 수정 중 오류가 발생했습니다.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[400px]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">종목 수정</h2>
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
                        <div className="text-sm text-gray-500">{stock?.market}</div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                수량
                            </label>
                            <Input
                                type="number"
                                value={editingData.pfstockCount}
                                onChange={(e) => setEditingData({
                                    ...editingData,
                                    pfstockCount: e.target.value
                                })}
                                placeholder="수량을 입력하세요"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                평균단가
                            </label>
                            <Input
                                type="number"
                                value={editingData.pfstockPrice}
                                onChange={(e) => setEditingData({
                                    ...editingData,
                                    pfstockPrice: e.target.value
                                })}
                                placeholder="평균단가를 입력하세요"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            취소
                        </Button>
                        <Button onClick={handleUpdate}>
                            수정
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
