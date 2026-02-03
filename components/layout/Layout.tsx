
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { supabase } from '../../lib/supabaseClient';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isHeaderVisible, setIsHeaderVisible] = React.useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const isTripDetailsPage = location.pathname.startsWith('/trip/') || location.pathname.startsWith('/trek/');
    const isAdminPage = location.pathname.startsWith('/admin');

    // Global Auth Listener for Magic Link Redirects
    React.useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                // Check if we have a pending booking and we are NOT on the checkout page
                const pendingBooking = localStorage.getItem('pendingBooking');
                if (pendingBooking && location.pathname !== '/booking/checkout') {
                    console.log("Detected pending booking after login, redirecting to checkout...");
                    navigate('/booking/checkout');
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [location.pathname, navigate]);

    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child) && isTripDetailsPage) {
            return React.cloneElement(child as React.ReactElement<{ setIsHeaderVisible: (visible: boolean) => void }>, { setIsHeaderVisible });
        }
        return child;
    });

    React.useEffect(() => {
        if (!isTripDetailsPage) {
            setIsHeaderVisible(true);
        }
    }, [location.pathname, isTripDetailsPage]);
    
    React.useEffect(() => {
        document.body.classList.remove('bg-admin-background');
        document.body.classList.add('dark', 'bg-background-dark');
    }, []);


    return (
        <div className="relative flex flex-col min-h-screen w-full">
            <div className={`sticky top-0 z-[100] transition-all duration-300 pointer-events-none ${isHeaderVisible ? 'opacity-100' : 'opacity-0 -translate-y-4'}`}>
                 <Header />
            </div>
            <div id="tour-info-portal" className="absolute top-0 left-0 w-full z-20 pointer-events-none"></div>
            <div className="flex-grow">
                {isTripDetailsPage ? childrenWithProps : children}
            </div>
            {!isAdminPage && <Footer />}
        </div>
    );
};

export default Layout;