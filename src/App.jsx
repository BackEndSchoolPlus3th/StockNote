import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import PortfolioPage from './pages/portfolio/portfolio/PortfolioPage';
import PortfolioDetailPage from './pages/portfolio/pfStock/PortfolioDetailPage';
import MainPage from './pages/stock/MainPage';
import Login from './pages/Login';
import Community from './pages/community/articles/Article';
import CreateArticle from './pages/community/articles/CreateArticle';
import UpdateArticle from './pages/community/articles/UpdateArticle';
import CommunityList from './pages/community/articles/Articles';
import MyPage from './pages/mypage/MyPage';

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<MainPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/portfolio/:portfolioId" element={<PortfolioDetailPage />} />
                <Route path="/community/article/:id" element={<Community />} />
                <Route path="/community/articles" element={<CommunityList />} />
                <Route path="/community/editor" element={<CreateArticle />} />
                <Route path="/community/article/:id/editor" element={<UpdateArticle />} />
                <Route path="/mypage" element={<MyPage/>} />
                <Route path="/stocks" element={<div>종목 정보 페이지</div>} />
            </Route>
            <Route path="/login" element={<Login />} />
        </Routes>
    );
}

export default App;
