import React from 'react';
import { Link } from 'react-router-dom';

const MainPage = () => {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="space-y-4 w-full max-w-xs px-4">
                <Link 
                    to="/trade-volume" 
                    className="block w-full py-3 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition-colors"
                >
                    거래량 순위 보기
                </Link>
                <Link 
                    to="/current-index" 
                    className="block w-full py-3 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition-colors"
                >
                    현재 지수 보기
                </Link>
            </div>
        </div>
    );
};

export default MainPage;