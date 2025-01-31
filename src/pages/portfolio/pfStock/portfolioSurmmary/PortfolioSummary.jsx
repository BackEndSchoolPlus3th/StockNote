import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { AddAssetModal } from './AddAssetModal';
import { EditPortfolioModal } from '../../portfolio/EditPortfolioModal';
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

const PortfolioSummary = ({
    stocks,
    portfolioId,
    portfolioName,
    portfolioDescription,
    shouldRefresh,
    onAddClick,  // 추가
    onPortfolioUpdate  // 추가: 콜백 prop
}) => {
    const { accessToken } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [portfolioData, setPortfolioData] = useState(null);
    const [totalAsset, setTotalAsset] = useState(0);
    const [stockRatios, setStockRatios] = useState([]);
    const [sectorRatios, setSectorRatios] = useState([  // sectorRatios state 추가
        { name: "IT/소프트웨어", ratio: "35.0", color: "bg-[#4318FF]" },
        { name: "금융", ratio: "25.0", color: "bg-[#6AD2FF]" },
        { name: "제조/화학", ratio: "20.0", color: "bg-[#2B3674]" },
        { name: "에너지", ratio: "15.0", color: "bg-[#A3AED0]" },
        { name: "기타", ratio: "5.0", color: "bg-[#B0C4FF]" }
    ]);

    useEffect(() => {
        fetchPortfolioData();
    }, [portfolioId, stocks, shouldRefresh]); // shouldRefresh 의존성 추가

    const fetchPortfolioData = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}`,
                {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                }
            );
            if (response.data && response.data.data) {
                setPortfolioData(response.data.data);
                setTotalAsset(response.data.data.totalAsset || 0); // totalAsset 설정
            }
        } catch (error) {
            console.error('포트폴리오 데이터 조회 실패:', error);
        }
    };

    useEffect(() => {
        if (portfolioData) {
            const total = portfolioData.totalAsset;
            const cash = portfolioData.cash || 0;

            const stockRatios = stocks.map((stock, index) => ({
                name: stock.stockName,
                ratio: ((stock.pfstockCount * stock.currentPrice / total) * 100).toFixed(1),
                amount: stock.pfstockTotalPrice,
                fill: BLUE_COLORS[index % BLUE_COLORS.length]
            }));

            // 현금이 0보다 클 때만 현금 항목을 추가
            const ratiosWithCash = cash > 0
                ? [...stockRatios, {
                    name: "현금",
                    ratio: ((cash / total) * 100).toFixed(1),
                    amount: cash,
                    fill: "#A3AED0"
                }]
                : stockRatios;

            setStockRatios(stockRatios);
            setSectorRatios(ratiosWithCash);
        }
    }, [stocks, portfolioData]);

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
                await fetchPortfolioData(); // window.location.reload() 대신 fetchPortfolioData 호출
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
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios/${portfolioId}/cash`,
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
                await fetchPortfolioData(); // window.location.reload() 대신 fetchPortfolioData 호출
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
                await fetchPortfolioData(); // window.location.reload() 대신 fetchPortfolioData 호출
                onPortfolioUpdate();  // 추가: 상위 컴포넌트에 변경 알림
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
                onAddClick={onAddClick}  // 전달
                onEditClick={() => setIsEditModalOpen(true)}
                onDeleteClick={handleDeletePortfolio}
            />

            {/* isAddModalOpen이 true일 때만 모달을 렌더링하도록 수정
            {isAddModalOpen && (
                <AddAssetModal
                    isOpen={true}  // setIsAddModalOpen 대신 true 값을 전달
                    onClose={() => setIsAddModalOpen(false)}
                    onAddStock={handleAddStock}
                    onAddCash={handleAddCash}
                    accessToken={accessToken}
                    onAssetAdded={onDataRefresh}
                    portfolioId={portfolioId}  // portfolioId도 필요
                />
            )} */}

            {isEditModalOpen && (
                <EditPortfolioModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    portfolioData={{ name: portfolioName, description: portfolioDescription }}
                    onEdit={handleEditPortfolio}
                />
            )}

            {/* portfolioData가 있을 때만 AssetSummary를 렌더링 */}
            {portfolioData && (
                <AssetSummary
                    totalAsset={portfolioData.totalAsset}
                    totalProfit={portfolioData.totalProfit}
                    totalStock={portfolioData.totalStock}
                />
            )}

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
