import Header from './Header'
import Footer from './Footer'

function Layout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header className="fixed top-0 left-0 right-0 h-16 z-50" />
            <main className="flex-1 mt-16 mb-14">{children}</main>
            <Footer className="fixed bottom-0 left-0 right-0 h-14" />
        </div>
    )
}

export default Layout