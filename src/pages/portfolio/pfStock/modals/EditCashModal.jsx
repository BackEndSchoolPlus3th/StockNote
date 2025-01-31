import React from 'react';
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";

export const EditCashModal = ({
    isOpen,
    onClose,
    cashAmount,
    setCashAmount,
    onUpdate
}) => {
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
                        <Button variant="outline" onClick={onClose}>
                            취소
                        </Button>
                        <Button onClick={onUpdate}>
                            수정
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
