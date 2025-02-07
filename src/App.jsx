import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import PortfolioPage from './pages/portfolio/portfolio/PortfolioPage';
import PortfolioDetailPage from './pages/portfolio/pfStock/PortfolioDetailPage';
import MainPage from './pages/stock/MainPage';
import Login from './pages/Login';
import StockMainPage from './pages/stock/stockDetail/StockMainPage';
import StockDetailPage from './pages/stock/stockDetail/StockDetailPage';
import Community from './pages/community/articles/Article';
import CreateArticle from './pages/community/articles/CreateArticle';
import UpdateArticle from './pages/community/articles/UpdateArticle';
import CommunityList from './pages/community/articles/Articles';
import MyPage from './pages/mypage/MyPage';
import TotalPortfolioDetail from './pages/portfolio/portfolio/totalPortfolio/TotalPortfolioDetail';

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<MainPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/portfolio/:portfolioId" element={<PortfolioDetailPage />} />
                <Route path="/portfolio/total" element={<TotalPortfolioDetail />} />
                <Route path="/community" element={<div>커뮤니티 페이지</div>} />
                <Route path="/stocks" element={<StockMainPage />} />
                <Route path="/stocks/:stockCode" element={<StockDetailPage />} />
                <Route path="/community/article/:id" element={<Community />} />
                <Route path="/community/articles" element={<CommunityList />} />
                <Route path="/community/editor" element={<CreateArticle />} />
                <Route path="/community/article/:id/editor" element={<UpdateArticle />} />
                <Route path="/mypage" element={<MyPage />} />

            </Route>
            <Route path="/login" element={<Login />} />
        </Routes>
    );
}

export default App;
