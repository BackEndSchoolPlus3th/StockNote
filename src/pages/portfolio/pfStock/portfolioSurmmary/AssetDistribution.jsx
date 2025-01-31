import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

export const AssetDistribution = ({ stockRatios, portfolioData }) => {
    const COLORS = ['#4318FF', '#6AD2FF', '#2B3674', '#A3AED0', '#B0C4FF'];

    // portfolioData가 없으면 로딩 상태나 빈 상태 표시
    if (!portfolioData || !portfolioData.totalAsset) {
        return (
            <div className="flex gap-8">
                <div className="w-[300px] h-[300px] relative">
                    <h3 className="font-medium mb-4">자산 비중</h3>
                    <div className="flex items-center justify-center h-full">
                        <span className="text-gray-500">자산 정보가 없습니다.</span>
                    </div>
                </div>
            </div>
        );
    }

    // 주식 데이터 계산
    const stockData = stockRatios.map((stock, index) => ({
        name: stock.name,
        amount: stock.amount,
        ratio: ((stock.amount / portfolioData.totalAsset) * 100).toFixed(1),
        fill: COLORS[index % COLORS.length]
    }));

    // 총 주식 비율 계산
    const totalStockRatio = stockData.reduce((sum, item) => sum + parseFloat(item.ratio), 0);

    // 데이터 배열 생성 (주식 데이터 + 현금)
    const chartData = [
        ...stockData,
        {
            name: '현금',
            amount: portfolioData.cash,
            ratio: (100 - totalStockRatio).toFixed(1),
            fill: '#E2E8F0'  // 현금 색상
        }
    ].sort((a, b) => parseFloat(b.ratio) - parseFloat(a.ratio));  // 비율 기준 내림차순 정렬

    return (
        <div className="flex gap-8">
            <div className="w-[300px] h-[300px] relative">
                <h3 className="font-medium mb-4">자산 비중</h3>
                <PieChart width={300} height={300}>
                    <Pie
                        data={chartData}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        strokeWidth={2}
                        stroke="#fff"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
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
                    {chartData.map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.fill }}
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