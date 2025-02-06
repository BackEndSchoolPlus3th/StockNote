import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionCard = ({ note }) => (
    <div className="p-4 border rounded-lg space-y-2 bg-white">
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
        <div className="text-sm">
            <div>{note.amount}주</div>
            <div>{note.price.toLocaleString()}원</div>
        </div>
    </div>
);

const TotalTransactionHistory = ({ accessToken }) => {
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotes = async () => {
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
                    setNotes(response.data.data);
                }
            } catch (err) {
                console.error('매매일지 조회 중 오류 발생:', err);
                setError('매매일지를 불러오는데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        if (accessToken) {
            fetchNotes();
        }
    }, [accessToken]);

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className="space-y-4">
            {notes.map((note, index) => (
                <TransactionCard key={index} note={note} />
            ))}
        </div>
    );
};

export default TotalTransactionHistory;
