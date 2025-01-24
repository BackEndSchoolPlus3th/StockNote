import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function Layout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="pt-4">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default Layout;