
import React from 'react';
import { PieChart, Pie } from 'recharts';

export const AssetDistribution = ({ stockRatios, sectorRatios }) => {
    return (
        <>
            <div className="flex gap-8">
                <div className="w-[200px] h-[200px]">
                    <PieChart width={200} height={200}>
                        <Pie
                            data={stockRatios}
                            dataKey="amount"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
                            strokeWidth={2}
                            stroke="#fff"
                        />
                    </PieChart>
                </div>
                <div className="flex-1 space-y-4">
                    {/* Stock ratios content */}
                </div>
            </div>
            <div>
                <h3 className="font-medium mb-4 text-gray-900">분야별 비중</h3>
                {/* Sector ratios content */}
            </div>
        </>
    );
};