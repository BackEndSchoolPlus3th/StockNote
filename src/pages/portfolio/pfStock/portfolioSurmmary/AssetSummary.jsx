import React from 'react';

export const AssetSummary = ({ totalAsset, totalProfit, totalStock }) => {
    // totalStock이 0이거나 없을 때 0을 반환하도록 수정
    const profitPercent = (totalStock && totalStock !== 0)
        ? (totalProfit / totalStock * 100).toFixed(1)
        : 0;

    // totalProfit이 undefined나 null일 때 0으로 처리
    const displayProfit = totalProfit || 0;

    return (
        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">총자산</div>
            <div className="text-2xl font-bold">{totalAsset.toLocaleString()}원</div>
            <div className={`font-medium ${displayProfit >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                평가 손익 {displayProfit > 0 ? '+' : ''}{displayProfit.toLocaleString()}원
                {displayProfit !== 0 && `(${displayProfit > 0 ? '+' : ''}${profitPercent}%)`}
            </div>
        </div>
    );
};