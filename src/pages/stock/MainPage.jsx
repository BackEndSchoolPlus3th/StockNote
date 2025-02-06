import React, { useState } from 'react';
import MarketChart from './MarketChart';
import TradeVolumePage from './TradeVolumePage';

const MainPage = () => {
    const [lastUpdateDate, setLastUpdateDate] = useState(null);

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl mx-auto">
                <div>
                    <MarketChart />
                </div>
                <div>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold">거래량 순위</h2>
                            {lastUpdateDate && (
                                <span className="text-sm text-gray-500">
                                    {lastUpdateDate.toLocaleDateString('ko-KR')} 기준
                                </span>
                            )}
                        </div>
                        <TradeVolumePage onUpdateDate={setLastUpdateDate} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;