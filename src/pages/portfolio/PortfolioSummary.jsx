import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AddAssetModal } from './AddAssetModal';
import { EditPortfolioModal } from './EditPortfolioModal';
import { PortfolioHeader } from './PortfolioHeader';
import { AssetSummary } from './AssetSummary';
import { AssetDistribution } from './AssetDistribution';
import axios from 'axios';

// 파란색 계열의 색상 팔레트
const BLUE_COLORS = [
    '#4318FF', // 진한 파란색
    '#6AD2FF', // 밝은 파란색
    '#2B3674', // 어두운 파란색
    '#A3AED0', // 회색빛 파란색
    '#B0C4FF', // 연한 파란색
];

const PortfolioSummary = ({ stocks, portfolioId, portfolioName, portfolioDescription }) => {
    const { accessToken } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [totalAsset, setTotalAsset] = useState(0);
    const [stockRatios, setStockRatios] = useState([]);
    const [sectorRatios, setSectorRatios] = useState([
        { name: "제약/의료", ratio: "44.9", color: "bg-[#4318FF]" },
        { name: "전자", ratio: "35.1", color: "bg-[#6AD2FF]" },
        { name: "현금", ratio: "20.0", color: "bg-[#A3AED0]" }
    ]);

    useEffect(() => {
        const total = stocks.reduce((sum, stock) => sum + stock.pfstockTotalPrice, 0);
        setTotalAsset(total);

        const ratios = stocks.map((stock, index) => ({
            name: stock.stockName,
            ratio: (stock.pfstockTotalPrice / total * 100).toFixed(1),
            amount: stock.pfstockTotalPrice,
            fill: BLUE_COLORS[index % BLUE_COLORS.length]
        }));
        setStockRatios(ratios);
    }, [stocks]);

    const handleAddStock = async ({ selectedStock, quantity, averagePrice }) => {
        if (!selectedStock || !quantity || !averagePrice) {
            alert('종목, 수량, 평균단가를 모두 입력해주세요.');
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}/stocks/AddStock`,
                {
                    pfstockCount: parseInt(quantity),
                    pfstockPrice: parseInt(averagePrice),
                    stockName: selectedStock.name,
                    stockCode: selectedStock.code
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            if (response.status === 200) { // 200 OK
                alert('종목이 추가되었습니다.');
                setIsAddModalOpen(false);
                window.location.reload(); // 페이지 새로고침
            } else {
                alert('종목 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('종목 추가 중 오류 발생:', error);
            alert('종목 추가 중 오류가 발생했습니다.');
        }
    };

    const handleAddCash = async (cashAmount) => {
        if (!cashAmount) {
            alert('금액을 입력해주세요.');
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}/Cash`,
                parseInt(cashAmount),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            if (response.status === 200) {
                alert('현금이 추가되었습니다.');
                setIsAddModalOpen(false);
                window.location.reload(); // 페이지 새로고침
            } else {
                alert('현금 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('현금 추가 중 오류 발생:', error);
            alert('현금 추가 중 오류가 발생했습니다.');
        }
    };

    const handleEditPortfolio = async (editPortfolio) => {
        try {
            const response = await axios.patch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}`, {
                name: editPortfolio.name,
                description: editPortfolio.description
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.status === 200) { // 200 OK
                setIsEditModalOpen(false);
                window.location.reload(); // 수정 후 페이지 새로고침
            } else {
                console.error('포트폴리오 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('포트폴리오 수정 중 오류 발생:', error);
        }
    };

    const handleDeletePortfolio = async () => {
        if (!window.confirm('정말로 이 포트폴리오를 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await axios.delete(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.status === 200) { // 204 No Content
                window.location.href = '/portfolio'; // 삭제 후 포트폴리오 페이지로 이동
            } else {
                console.error('포트폴리오 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('포트폴리오 삭제 중 오류 발생:', error);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <PortfolioHeader
                portfolioName={portfolioName}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={() => setIsEditModalOpen(true)}
                onDeleteClick={handleDeletePortfolio}
            />

            {isAddModalOpen && (
                <AddAssetModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onAddStock={handleAddStock}
                    onAddCash={handleAddCash}
                    accessToken={accessToken}
                />
            )}

            {isEditModalOpen && (
                <EditPortfolioModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    portfolioData={{ name: portfolioName, description: portfolioDescription }}
                    onEdit={handleEditPortfolio}
                />
            )}

            <AssetSummary totalAsset={totalAsset} />

            <div className="flex gap-4 border-b">
                {/* ... 탭 버튼들 */}
            </div>

            <AssetDistribution
                stockRatios={stockRatios}
                sectorRatios={sectorRatios}
            />
        </div>
    );
};

export default PortfolioSummary;
