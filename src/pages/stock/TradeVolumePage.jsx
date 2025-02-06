import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

const TradeVolumePage = ({ onUpdateDate }) => {
    const [volumeData, setVolumeData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    const ITEMS_PER_GROUP = 5;
    const EXPANDED_ITEMS = 10;

    const formatDateForAPI = (date) => {
        return date.toISOString().slice(0, 10).replace(/-/g, '');
    };

    const fetchData = async (targetDate) => {
        try {
            const formattedDate = formatDateForAPI(targetDate);
            const response = await axios.get('/api/v1/stockApis/volume', {
                params: { date: formattedDate }
            });

            if (response.data?.output?.length > 0) {
                setVolumeData(response.data.output);
                onUpdateDate(targetDate); 
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error details:', err.response || err);
            return false;
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);

            const now = new Date();
            const kstOffset = 9 * 60;
            const localOffset = now.getTimezoneOffset();
            const totalOffset = kstOffset + localOffset;
            let targetDate = new Date(now.getTime() + totalOffset * 60 * 1000);

            let success = false;
            let attempts = 0;
            const maxAttempts = 5;

            while (!success && attempts < maxAttempts) {
                const day = targetDate.getDay();
                if (day === 0) {
                    targetDate.setDate(targetDate.getDate() - 2);
                } else if (day === 6) {
                    targetDate.setDate(targetDate.getDate() - 1);
                }

                success = await fetchData(targetDate);
                
                if (!success) {
                    targetDate.setDate(targetDate.getDate() - 1);
                    attempts++;
                }
            }


            if (!success) {
                setError('최근 5일간의 거래 데이터를 찾을 수 없습니다.');
            }

            setIsLoading(false);
        };

        loadData();
    }, [onUpdateDate]);


    const handleNextGroup = () => {
        setCurrentGroupIndex(prev => prev + 1);
        setIsExpanded(false);
    };

    const handlePrevGroup = () => {
        setCurrentGroupIndex(prev => prev - 1);
        setIsExpanded(false);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"/>
                <span className="ml-2">거래량 데이터를 불러오는 중...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-4">
                <div className="text-red-500 mb-2">{error}</div>
                {lastUpdateDate && (
                    <div className="text-gray-600">
                        마지막 업데이트: {lastUpdateDate.toLocaleDateString('ko-KR')}
                    </div>
                )}
            </div>
        );
    }

    const startIndex = currentGroupIndex * ITEMS_PER_GROUP;
    const endIndex = startIndex + (isExpanded ? EXPANDED_ITEMS : ITEMS_PER_GROUP);
    const totalGroups = Math.ceil(volumeData.length / ITEMS_PER_GROUP);
    const currentItems = volumeData.slice(startIndex, endIndex);

    return (

<div className="space-y-6 pb-2">
    <div className="rounded-2xl overflow-hidden bg-white">
        <div className="px-4 py-3 flex justify-between items-center">
            <h3 className="font-medium text-gray-800">
                실시간 거래량 {startIndex + 1}-{Math.min(endIndex, volumeData.length)}위
            </h3>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {isExpanded ? '접기' : '더보기'}
            </Button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-gray-500 text-sm bg-gray-50">
                    <th className="w-16 px-4 py-3 font-medium text-left whitespace-nowrap">순위</th>
                    <th className="w-1/4 px-4 py-3 font-medium text-left whitespace-nowrap">종목명</th>
                    <th className="w-32 px-4 py-3 font-medium text-right whitespace-nowrap">현재가</th>
                    <th className="w-32 px-4 py-3 font-medium text-right whitespace-nowrap">전일대비</th>
                    <th className="w-28 px-4 py-3 font-medium text-right whitespace-nowrap">등락률</th>
                    <th className="w-32 px-4 py-3 font-medium text-right whitespace-nowrap">거래량</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((item) => (
                        <tr key={item.data_rank} className="hover:bg-gray-50 border-t border-gray-100">
                            <td className="w-16 px-4 py-3 text-blue-500 font-medium">
                                {item.data_rank}
                            </td>
                            <td className="w-1/4 px-4 py-3">
                                <div className="font-medium text-gray-900">{item.hts_kor_isnm}</div>
                            </td>
                            <td className="w-32 px-4 py-3 text-right font-medium text-gray-900">
                                {Number(item.stck_prpr).toLocaleString()}원
                            </td>
                            <td className={`w-32 px-4 py-3 text-right font-medium ${
                                item.prdyVrssSign === '2' ? 'text-red-500' : 
                                item.prdyVrssSign === '5' ? 'text-blue-500' : 'text-gray-900'
                            }`}>
                                {item.prdyVrssSign === '2' ? '+' : 
                                item.prdyVrssSign === '5' ? '-' : ''}
                                {Number(item.prdy_vrss).toLocaleString()}원
                            </td>
                            <td className={`w-28 px-4 py-3 text-right font-medium ${
                                item.prdyVrssSign === '2' ? 'text-red-500' : 
                                item.prdyVrssSign === '5' ? 'text-blue-500' : 'text-gray-900'
                            }`}>
                                {item.prdyVrssSign === '2' ? '+' : 
                                item.prdyVrssSign === '5' ? '-' : ''}
                                {item.prdy_ctrt}%
                            </td>
                            <td className="w-32 px-4 py-3 text-right text-gray-600">
                                {Number(item.acml_vol).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>

    <div className="flex justify-center items-center gap-3 mt-8">
        <Button
            variant="outline"
            onClick={handlePrevGroup}
            disabled={currentGroupIndex === 0}
            className="text-gray-600"
        >
            <ChevronLeft className="w-4 h-4" />
            이전
        </Button>
        <span className="text-gray-600">
            {currentGroupIndex + 1} / {totalGroups}
        </span>
        <Button
            variant="outline"
            onClick={handleNextGroup}
            disabled={currentGroupIndex >= totalGroups - 1}
            className="text-gray-600"
        >
            다음
            <ChevronRight className="w-4 h-4" />
        </Button>
    </div>
</div>
    );
};

export default TradeVolumePage;