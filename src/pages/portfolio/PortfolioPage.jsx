import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import unlockIcon from '../../assets/flat-color-icons-unlock.svg';
import plusIcon from '../../assets/ic-baseline-plus.svg';
import arrowIcon from '../../assets/weui-arrow-filled.svg';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from '../../contexts/AuthContext'; //useAuth 훅 가져오기
import axios from 'axios';

const PortfolioPage = () => {
    const navigate = useNavigate();
    const { accessToken } = useAuth(); //useAuth 훅 사용해서 accessToken 가져오기
    const [portfolios, setPortfolios] = useState([]);
    const [totalStats, setTotalStats] = useState({
        totalAssets: 0,
        totalProfits: 0
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPortfolio, setNewPortfolio] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        if (accessToken) {
            fetchPortfolios();
        }
    }, [accessToken]); // accessToken이 변경될 때마다 실행

    useEffect(() => {
        const total = portfolios.reduce((acc, portfolio) => ({
            totalAssets: acc.totalAssets + (portfolio.totalAsset || 0),
            totalProfits: acc.totalProfits + (portfolio.totalProfit || 0)
        }), { totalAssets: 0, totalProfits: 0 });

        setTotalStats(total);
    }, [portfolios]);

    const fetchPortfolios = async () => {
        try {
            console.log("get 요청 ")
            const result = await axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            // 백엔드 응답 구조에 맞게 데이터 추출
            if (result.data && result.data.data) {
                setPortfolios(result.data.data);
            } else {
                setPortfolios([]); // 데이터가 없는 경우 빈 배열로 설정
            }

            // 디버깅을 위한 로그
            console.log("받은 데이터:", result.data);
        } catch (error) {
            console.error('포트폴리오 목록을 불러오는데 실패했습니다:', error);
            setPortfolios([]); // 에러 발생시 빈 배열로 설정
        }
    };

    const handleAddPortfolio = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/portfolios`, newPortfolio, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}` // 다 axios로 변경하고 accessToken 추가
                }
            });

            if (response.status === 200) { // 201 Created
                setIsModalOpen(false);
                setNewPortfolio({ name: '', description: '' });
                await fetchPortfolios();
            } else {
                console.error('포트폴리오 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('포트폴리오 추가 중 오류 발생:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 w-1/2">
            <div className="frame-427318266 bg-white rounded-lg shadow-lg p-6">
                <div className="frame-427318265 space-y-6">
                    {/* 상단 아이콘 영역 */}
                    <div className="frame-427318254 flex justify-between items-center">
                        <div className="frame-427318257">
                            <img
                                className="flat-color-icons-unlock w-6 h-6"
                                src={unlockIcon}
                                alt="unlock"
                            />
                        </div>
                        <div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <img
                                    className="w-6 h-6"
                                    src={plusIcon}
                                    alt="add"
                                />
                            </Button>
                        </div>
                    </div>

                    {/* 금액 표시 영역 */}
                    <div className="frame-427318255">
                        <div className="frame-427318260">
                            <div className="frame-427318258 flex items-center space-x-2">
                                <div className="_3-100-000 text-2xl font-bold">
                                    {totalStats.totalAssets.toLocaleString()}원
                                </div>
                                <img
                                    className="weui-arrow-filled w-5 h-5"
                                    src={arrowIcon}
                                    alt="arrow"
                                />
                            </div>
                            <div className="frame-427318259">
                                <div className="_500-00 text-green-500">
                                    총 수익 ({totalStats.totalProfits >= 0 ? '+' : ''}{totalStats.totalProfits.toLocaleString()}원)
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 매매일지 영역 */}
                    <div className="frame-427318256">
                        <div className="frame-427318263 flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <div className="frame-427318262">
                                <div className="text-lg font-medium">매매일지</div>
                            </div>
                            <img
                                className="weui-arrow-filled2 w-5 h-5"
                                src={arrowIcon}
                                alt="arrow"
                            />
                        </div>
                    </div>

                    {/* 포트폴리오 목록 */}
                    <div className="mt-6 space-y-4">
                        {portfolios.map((portfolio) => (
                            <button
                                key={portfolio.id}
                                className="w-full p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors flex justify-between items-center"
                                onClick={() => navigate(`/portfolio/${portfolio.id}`)}
                            >
                                <div>
                                    <h3 className="text-lg font-medium text-left">{portfolio.name}</h3>
                                    <p className="text-gray-500 text-sm text-left">{portfolio.description}</p>
                                </div>
                                <img
                                    className="w-5 h-5"
                                    src={arrowIcon}
                                    alt="arrow"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 포트폴리오 추가 모달 */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h2 className="text-xl font-bold mb-4">새 포트폴리오 추가</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">포트폴리오 이름</label>
                                <Input
                                    type="text"
                                    value={newPortfolio.name}
                                    onChange={(e) => setNewPortfolio({ ...newPortfolio, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">설명</label>
                                <Input
                                    type="text"
                                    value={newPortfolio.description}
                                    onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    취소
                                </Button>
                                <Button
                                    onClick={handleAddPortfolio}
                                >
                                    추가
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioPage;