import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import PortfolioPage from './pages/portfolio/PortfolioPage';
import PortfolioDetailPage from './pages/portfolio/PortfolioDetailPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<div>메인 페이지</div>} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/portfolio/:portfolioId" element={<PortfolioDetailPage />} />
                <Route path="/community" element={<div>커뮤니티 페이지</div>} />
                <Route path="/stocks" element={<div>종목 정보 페이지</div>} />
            </Route>
        </Routes>
    );
}

export default App;
