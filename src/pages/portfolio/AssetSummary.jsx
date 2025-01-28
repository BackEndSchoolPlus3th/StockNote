
import React from 'react';

export const AssetSummary = ({ totalAsset }) => {
    return (
        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">총자산</div>
            <div className="text-2xl font-bold">{totalAsset.toLocaleString()}원</div>
            <div className="text-green-500 font-medium">평가 손익 + 300,000원(+19.7%)</div>
        </div>
    );
};