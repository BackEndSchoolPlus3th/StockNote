import React from 'react';

const COLORS = [
    'bg-[#4318FF]',  // 진한 파란색
    'bg-[#6AD2FF]',  // 밝은 파란색
    'bg-[#2B3674]',  // 어두운 파란색
    'bg-[#A3AED0]',  // 회색빛 파란색
    'bg-[#B0C4FF]',  // 연한 파란색
    'bg-[#8884d8]',  // 보라색
    'bg-[#82ca9d]',  // 초록색
    'bg-[#ffc658]',  // 노란색
    'bg-[#ff7c7c]'   // 빨간색
];

export const SectorBarChart = ({ stocks, totalAsset }) => {
    // 데이터가 없는 경우 처리
    if (stocks.length === 0) {
        return (
            <div>
                <h3 className="font-medium mb-4 text-gray-900">분야별 비중</h3>
                <div className="text-gray-500 text-center p-4">
                    보유한 자산이 없습니다.
                </div>
            </div>
        );
    }

    // 업종별 데이터 집계
    const sectorData = stocks.reduce((acc, stock) => {
        const sector = stock.idxBztpSclsCdName || '기타';
        const amount = (stock.pfstockCount * stock.currentPrice);

        if (!acc[sector]) {
            acc[sector] = { amount: 0, ratio: 0 };
        }
        acc[sector].amount += amount;
        return acc;
    }, {});

    // 비율 계산 및 데이터 포맷팅
    let sectors = Object.entries(sectorData).map(([name, data], index) => ({
        name,
        ratio: ((data.amount / totalAsset) * 100).toFixed(1),
        amount: data.amount,
        color: COLORS[index % COLORS.length]  // 색상 순환
    }));

    // 총 비중 계산
    const totalRatio = sectors.reduce((sum, sector) => sum + parseFloat(sector.ratio), 0);

    // 현금 비중 추가 (100%에서 나머지)
    if (totalRatio < 100) {
        const cashRatio = (100 - totalRatio).toFixed(1);
        sectors = [...sectors, {
            name: '현금',
            ratio: cashRatio,
            amount: (totalAsset * (cashRatio / 100)),
            color: 'bg-gray-300'  // 현금 색상
        }];
    }

    // 비율 순으로 정렬
    sectors = sectors.sort((a, b) => parseFloat(b.ratio) - parseFloat(a.ratio));

    return (
        <div>
            <h3 className="font-medium mb-4 text-gray-900">분야별 비중</h3>

            {/* 단일 라인 차트 */}
            <div className="mb-6">
                <div className="flex h-6 w-full rounded-lg overflow-hidden mb-2">
                    {sectors.map((sector, index) => (
                        <div
                            key={index}
                            className={`${sector.color} transition-all`}
                            style={{ width: `${sector.ratio}%` }}
                        />
                    ))}
                </div>
                <div className="flex flex-wrap gap-4">
                    {sectors.map((sector, index) => (
                        <div key={index} className="flex items-center">
                            <div className={`w-3 h-3 rounded ${sector.color} mr-2`}></div>
                            <span className="text-sm">{sector.name} ({sector.ratio}%)</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 목록형 표시 */}
            <div className="space-y-3">
                {sectors.map((sector, index) => (
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
    );
};
