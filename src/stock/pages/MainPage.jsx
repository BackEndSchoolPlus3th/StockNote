import React from 'react';
import MarketChart from './MarketChart';
import TradeVolumePage from './TradeVolumePage';

const MainPage = () => {
    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-7xl mx-auto">
                <div>
                    <MarketChart />
                </div>
                <div>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b">
                            <h2 className="text-xl font-bold">거래량 순위</h2>
                        </div>
                        <TradeVolumePage />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;