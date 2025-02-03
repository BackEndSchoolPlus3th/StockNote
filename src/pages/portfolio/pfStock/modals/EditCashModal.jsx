import React, { useState, useEffect } from 'react';
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import axios from 'axios';

export const EditCashModal = ({
    isOpen,
    onClose,
    currentCash,
    onUpdate,
    portfolioId,  // portfolioId 추가
    accessToken   // accessToken 추가
}) => {
    const [cashAmount, setCashAmount] = useState(currentCash || 0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCashAmount(currentCash || 0);
        }
    }, [isOpen, currentCash]);

    const handleSubmit = async () => {
        setIsLoading(true);
        console.log("Sending request with token:", accessToken); // 디버깅용
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}/cash`,
                Number(cashAmount),  // 객체가 아닌 숫자 값으로 직접 전송
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`  // 헤더에 토큰 추가
                    }
                }
            );

            if (response.status === 200) {
                onUpdate(Number(cashAmount));
                onClose();
            }
        } catch (error) {
            console.error('현금 수정 중 오류 발생:', error);
            if (error.response?.status === 401) {
                alert('인증이 만료되었습니다. 다시 로그인해주세요.');
            } else {
                alert('현금 수정에 실패했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[400px]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">현금 수정</h2>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="p-3 border rounded-lg bg-gray-50">
                        <div className="font-medium">현금</div>
                        <div className="text-sm text-gray-500">KRW</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            금액
                        </label>
                        <Input
                            type="number"
                            value={cashAmount}
                            onChange={(e) => setCashAmount(e.target.value)}
                            placeholder="금액을 입력하세요"
                            className="w-full"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            취소
                        </Button>
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? "처리중..." : "수정"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
