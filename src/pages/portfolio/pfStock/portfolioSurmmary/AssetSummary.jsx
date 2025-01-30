import React from 'react';

export const AssetSummary = ({ totalAsset, totalProfit, totalStock }) => {
    const profitPercent = totalAsset > 0 ? (totalProfit / totalStock * 100).toFixed(1) : 0;

    return (
        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">총자산</div>
            <div className="text-2xl font-bold">{totalAsset.toLocaleString()}원</div>
            <div className={`font-medium ${totalProfit >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                평가 손익 {totalProfit >= 0 ? '+' : ''}{totalProfit?.toLocaleString()}원 ({totalProfit >= 0 ? '+' : ''}{profitPercent}%)
            </div>
        </div>
    );
};