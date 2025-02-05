import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const HistoryModal = ({ onClose, accessToken }) => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleBackdropClick = (e) => {
        // backdrop을 클릭했을 때만 모달 닫기
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/allNote`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    }
                );

                if (response.data && response.data.data) {
                    setTransactions(response.data.data);
                }
            } catch (error) {
                console.error('매매일지 조회 실패:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, [accessToken]);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}  // 외부 클릭 이벤트 추가
        >
            <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] ">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">전체 매매일지</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-4">로딩 중...</div>
                ) : (
                    <div className="space-y-1 overflow-y-auto max-h-[60vh]">
                        {transactions.map((note, index) => (
                            <div key={index} className="px-5 py-2 border rounded-lg space-y-1 bg-white">
                                <div className="flex flex-col">
                                    <div className="text-lage text-black-600 mb-1 font-semibold">
                                        {note.portfolioName}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="font-medium">
                                            <span className={`
                                                ${note.type === '매수' ? 'text-red-600' : ''}
                                                ${note.type === '매도' ? 'text-blue-600' : ''}
                                                ${note.type === '수정' ? 'text-yellow-600' : ''}
                                                ${note.type === '삭제' ? 'text-gray-600' : ''}
                                            `}>
                                                [{note.type}]
                                            </span> {note.stockName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(note.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm">
                                    <div>{note.amount}주</div>
                                    <div>{note.price.toLocaleString()}원</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryModal;
