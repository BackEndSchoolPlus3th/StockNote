import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

const TradeVolumePage = () => {
    const [volumeData, setVolumeData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdateDate, setLastUpdateDate] = useState(null);
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
                setLastUpdateDate(targetDate);
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
    }, []);

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
        <div className="space-y-4">
            {lastUpdateDate && (
                <div className="px-4 py-2 bg-gray-100 text-sm text-gray-600 rounded-lg">
                    마지막 업데이트: {lastUpdateDate.toLocaleDateString('ko-KR')}
                </div>
            )}
            
            <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                    <h3 className="font-medium">
                        {startIndex + 1}-{Math.min(endIndex, volumeData.length)} 위
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2"
                    >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {isExpanded ? '접기' : '더보기'}
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="px-4 h-12 bg-blue-500 text-white border font-medium text-center whitespace-nowrap">순위</th>
                                <th className="px-4 h-12 bg-blue-500 text-white border font-medium text-center whitespace-nowrap">종목명</th>
                                <th className="px-4 h-12 bg-blue-500 text-white border font-medium text-center whitespace-nowrap">현재가</th>
                                <th className="px-4 h-12 bg-blue-500 text-white border font-medium text-center whitespace-nowrap">전일대비</th>
                                <th className="px-4 h-12 bg-blue-500 text-white border font-medium text-center whitespace-nowrap">등락률</th>
                                <th className="px-4 h-12 bg-blue-500 text-white border font-medium text-center whitespace-nowrap">거래량</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item) => (
                                <tr key={item.data_rank} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 border text-center">{item.data_rank}</td>
                                    <td className="px-4 py-3 border">{item.hts_kor_isnm}</td>
                                    <td className="px-4 py-3 border text-right">
                                        {Number(item.stck_prpr).toLocaleString()}
                                    </td>
                                    <td className={`px-4 py-3 border text-right ${
                                        item.prdyVrssSign === '2' ? 'text-red-500' : 
                                        item.prdyVrssSign === '5' ? 'text-blue-500' : ''
                                    }`}>
                                        {item.prdyVrssSign === '2' ? '+' : 
                                         item.prdyVrssSign === '5' ? '-' : ''}
                                        {Number(item.prdy_vrss).toLocaleString()}
                                    </td>
                                    <td className={`px-4 py-3 border text-right ${
                                        item.prdyVrssSign === '2' ? 'text-red-500' : 
                                        item.prdyVrssSign === '5' ? 'text-blue-500' : ''
                                    }`}>
                                        {item.prdyVrssSign === '2' ? '+' : 
                                         item.prdyVrssSign === '5' ? '-' : ''}
                                        {item.prdy_ctrt}%
                                    </td>
                                    <td className="px-4 py-3 border text-right">
                                        {Number(item.acml_vol).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-center items-center gap-2">
                <Button
                    variant="outline"
                    onClick={handlePrevGroup}
                    disabled={currentGroupIndex === 0}
                >
                    <ChevronLeft className="w-4 h-4" />
                    이전
                </Button>
                <span className="mx-4">
                    {currentGroupIndex + 1} / {totalGroups}
                </span>
                <Button
                    variant="outline"
                    onClick={handleNextGroup}
                    disabled={currentGroupIndex >= totalGroups - 1}
                >
                    다음
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export default TradeVolumePage;