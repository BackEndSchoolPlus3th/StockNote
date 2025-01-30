import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

export const AssetDistribution = ({ stockRatios, cashRatio }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A3AED0'];

    const data = [
        ...stockRatios,
        { name: '현금', ratio: cashRatio, amount: cashRatio, fill: '#A3AED0' }
    ];

    return (
        <>
            <div className="flex gap-8">
                <div className="w-[200px] h-[200px]">
                    <PieChart width={200} height={200}>
                        <Pie
                            data={data}
                            dataKey="amount"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
                            strokeWidth={2}
                            stroke="#fff"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </div>
                <div className="flex-1 space-y-4">
                    {data.map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center gap-2">
                            <div className="w-3 h-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <div>{entry.name}: {entry.ratio}%</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};