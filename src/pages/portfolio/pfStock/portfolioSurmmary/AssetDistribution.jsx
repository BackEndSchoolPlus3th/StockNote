import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

export const AssetDistribution = ({ stockRatios, sectorRatios }) => {
    const COLORS = ['#4318FF', '#6AD2FF', '#2B3674', '#A3AED0', '#B0C4FF'];

    return (
        <div className="flex gap-8">
            <div className="w-[300px] h-[300px] relative">
                <PieChart width={300} height={300}>
                    <Pie
                        data={sectorRatios}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        strokeWidth={2}
                        stroke="#fff"
                    >
                        {sectorRatios.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => `${value.toLocaleString()}원`}
                    />
                </PieChart>
            </div>
            <div className="flex-1">
                <h3 className="font-medium mb-4">자산 분포</h3>
                <div className="space-y-2">
                    {sectorRatios.map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span>{entry.name}</span>
                            </div>
                            <div className="flex gap-4">
                                <span>{entry.ratio}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};