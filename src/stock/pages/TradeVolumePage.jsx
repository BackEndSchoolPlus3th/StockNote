import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

const TradeVolumePage = () => {
    const [volumeData, setVolumeData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/v1/stockApis');
                if (response.data && response.data.output) {
                    setVolumeData(response.data.output);
                }
                setIsLoading(false);
            } catch (err) {
                setError('데이터를 불러오는데 실패했습니다.');
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) return <div className="flex justify-center items-center p-4">로딩 중...</div>;
    if (error) return <div className="flex justify-center items-center p-4 text-red-500">{error}</div>;

    const totalPages = Math.ceil(volumeData.length / itemsPerPage);
    const startIndex = isExpanded ? (currentPage - 1) * itemsPerPage : 0;
    const displayData = isExpanded 
        ? volumeData.slice(startIndex, startIndex + itemsPerPage)
        : volumeData.slice(0, 2);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="p-2 bg-blue-500 text-white border text-sm">순위</th>
                            <th className="p-2 bg-blue-500 text-white border text-sm">종목명</th>
                            <th className="p-2 bg-blue-500 text-white border text-sm">현재가</th>
                            <th className="p-2 bg-blue-500 text-white border text-sm">등락률</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="p-2 border text-center text-sm">{item.data_rank}</td>
                                <td className="p-2 border text-sm">{item.hts_kor_isnm}</td>
                                <td className="p-2 border text-right text-sm">
                                    {Number(item.stck_prpr).toLocaleString()}
                                </td>
                                <td className={`p-2 border text-right text-sm ${
                                    item.prdyVrssSign === '2' ? 'text-red-500' : 
                                    item.prdyVrssSign === '5' ? 'text-blue-500' : ''
                                }`}>
                                    {item.prdyVrssSign === '2' ? '+' : 
                                     item.prdyVrssSign === '5' ? '-' : ''}
                                    {item.prdy_ctrt}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-col items-center p-2 gap-2">
                <div 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                    ) : (
                        <ChevronDown className="w-5 h-5" />
                    )}
                </div>
                {isExpanded && (
                    <div className="flex items-center space-x-2">
                        <ChevronLeft 
                            className={`w-5 h-5 cursor-pointer ${currentPage === 1 ? 'text-gray-300' : 'hover:text-blue-500'}`}
                            onClick={() => handlePageChange(currentPage - 1)}
                        />
                        <span className="text-sm">{currentPage} / {totalPages}</span>
                        <ChevronRight 
                            className={`w-5 h-5 cursor-pointer ${currentPage === totalPages ? 'text-gray-300' : 'hover:text-blue-500'}`}
                            onClick={() => handlePageChange(currentPage + 1)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TradeVolumePage;