import React from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import portfolioIcon from '../assets/portfolio-icon.svg';
import { PieChart, Pie } from 'recharts';

// 파란색 계열의 색상 팔레트
const BLUE_COLORS = [
    '#4318FF', // 진한 파란색
    '#6AD2FF', // 밝은 파란색
    '#2B3674', // 어두운 파란색
    '#A3AED0', // 회색빛 파란색
    '#B0C4FF', // 연한 파란색
];

const PortfolioSummary = ({ stocks }) => {
    // 총 자산 계산
    const totalAsset = stocks.reduce((sum, stock) => sum + stock.pfstockTotalPrice, 0);
    
    // 종목별 비중 계산
    const stockRatios = stocks.map((stock, index) => ({
        name: stock.stockName,
        ratio: (stock.pfstockTotalPrice / totalAsset * 100).toFixed(1),
        amount: stock.pfstockTotalPrice,
        fill: BLUE_COLORS[index % BLUE_COLORS.length]
    }));

    // 분야별 비중 계산 (임시 데이터)
    const sectorRatios = [
        { name: "제약/의료", ratio: "44.9", color: "bg-[#4318FF]" },
        { name: "전자", ratio: "35.1", color: "bg-[#6AD2FF]" },
        { name: "현금", ratio: "20.0", color: "bg-[#A3AED0]" }
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* 헤더 영역 */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img src={portfolioIcon} alt="Portfolio" className="w-10 h-10" />
                    <span className="font-medium text-lg">주식은 못 말려</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                        <Plus className="h-5 w-5 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                        <MoreHorizontal className="h-5 w-5 text-gray-600" />
                    </Button>
                </div>
            </div>

            {/* 총자산 정보 */}
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">총자산</div>
                <div className="text-2xl font-bold">{totalAsset.toLocaleString()}원</div>
                <div className="text-green-500 font-medium">평가 손익 + 300,000원(+19.7%)</div>
            </div>

            {/* 자산 구성 탭 */}
            <div className="flex gap-4 border-b">
                <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-medium">자산구성</button>
                <button className="px-4 py-2 text-gray-500 hover:text-gray-700">코스피</button>
                <button className="px-4 py-2 text-gray-500 hover:text-gray-700">코스닥</button>
            </div>

            {/* 종목별 비중과 파이 차트 */}
            <div className="flex gap-8">
                {/* 파이 차트 */}
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

                {/* 종목별 비중 */}
                <div className="flex-1 space-y-4">
                    <div className="flex gap-2">
                        {stockRatios.map((stock, index) => (
                            <div key={index} className="w-2 h-2 rounded-full" style={{
                                backgroundColor: stock.fill
                            }}></div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        {stockRatios.map((stock, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded" style={{
                                        backgroundColor: stock.fill
                                    }}></div>
                                    <span className="text-gray-700">{stock.name}</span>
                                </div>
                                <span className="font-medium">{stock.ratio}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 분야별 비중 */}
            <div>
                <h3 className="font-medium mb-4 text-gray-900">분야별 비중</h3>
                <div className="space-y-3">
                    {sectorRatios.map((sector, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded ${sector.color}`}></div>
                                <span className="text-gray-700">{sector.name}</span>
                            </div>
                            <span className="font-medium">{sector.ratio}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PortfolioSummary;
