import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import MainPage from './stock/pages/MainPage';
import TradeVolumePage from './stock/pages/TradeVolumePage';
import CurrentIndexPage from './stock/pages/CurrentIndexPage';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/trade-volume" element={<TradeVolumePage />} />
                    <Route path="/current-index" element={<CurrentIndexPage />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;