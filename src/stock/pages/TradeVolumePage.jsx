import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TradeVolumePage = () => {
    const [volumeData, setVolumeData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/volume');
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

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="p-3 bg-blue-500 text-white border">순위</th>
                        <th className="p-3 bg-blue-500 text-white border">종목명</th>
                        <th className="p-3 bg-blue-500 text-white border">종목코드</th>
                        <th className="p-3 bg-blue-500 text-white border">현재가</th>
                        <th className="p-3 bg-blue-500 text-white border">전일대비</th>
                        <th className="p-3 bg-blue-500 text-white border">등락률</th>
                        <th className="p-3 bg-blue-500 text-white border">거래량</th>
                    </tr>
                </thead>
                <tbody>
                    {volumeData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                            <td className="p-3 border text-center">{item.data_rank}</td>
                            <td className="p-3 border">{item.hts_kor_isnm}</td>
                            <td className="p-3 border">{item.mksc_shrn_iscd}</td>
                            <td className="p-3 border text-right">
                                {Number(item.stck_prpr).toLocaleString()}
                            </td>
                            <td className={`p-3 border text-right ${
                                item.prdyVrssSign === '2' ? 'text-red-500' : 
                                item.prdyVrssSign === '5' ? 'text-blue-500' : ''
                            }`}>
                                {item.prdyVrssSign === '2' ? '+' : 
                                 item.prdyVrssSign === '5' ? '-' : ''}
                                {Number(item.prdy_vrss).toLocaleString()}
                            </td>
                            <td className={`p-3 border text-right ${
                                item.prdyVrssSign === '2' ? 'text-red-500' : 
                                item.prdyVrssSign === '5' ? 'text-blue-500' : ''
                            }`}>
                                {item.prdyVrssSign === '2' ? '+' : 
                                 item.prdyVrssSign === '5' ? '-' : ''}
                                {item.prdy_ctrt}%
                            </td>
                            <td className="p-3 border text-right">
                                {Number(item.acml_vol).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TradeVolumePage;