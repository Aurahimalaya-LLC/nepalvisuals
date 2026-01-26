
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SiteLogo from '../common/SiteLogo';
import { MegaMenu } from './MegaMenu';

const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.38 1.25 4.81L2 22l5.3-1.38c1.37.74 2.93 1.18 4.59 1.18h.12c5.45 0 9.9-4.45 9.9-9.91s-4.45-9.9-9.9-9.9zM17.1 15.3c-.28-.14-1.68-.83-1.94-.93-.26-.1-.45-.14-.64.14-.19.28-.73.93-.9 1.12-.17.19-.34.22-.63.07-.29-.15-1.21-.45-2.3-1.42-.85-.76-1.42-1.7-1.59-1.99-.17-.29-.02-.45.12-.59.13-.13.28-.34.42-.51.14-.17.19-.28.28-.47.1-.19.05-.36-.02-.51s-.64-1.53-.87-2.1c-.23-.56-.47-.48-.64-.48-.17 0-.36-.02-.55-.02s-.5.07-.76.36c-.26.28-.98 1-1.2 2.38-.22 1.38.28 2.76.5 2.95.22.2.98 1.58 2.38 2.2a7.6 7.6 0 002.66 1.05c.82.23 1.3.18 1.69.05.47-.16 1.35-.9 1.54-1.76.19-.86.19-1.6.14-1.76-.05-.17-.19-.26-.42-.4z" />
    </svg>
);

const Header: React.FC = () => {
    const location = useLocation();
    const isConfirmationPage = location.pathname === '/booking/confirmed';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    if (location.pathname.startsWith('/admin')) {
        return null; // Don't render the main header on any admin page
    }

    return (
        <nav className="sticky top-0 left-0 right-0 z-50 w-full px-4 py-6 md:px-8 lg:px-16 pointer-events-none">
            <div className="relative mx-auto flex max-w-7xl items-center justify-between rounded-full bg-background-dark/80 backdrop-blur-md border border-white/10 px-6 py-3 shadow-lg shadow-black/10 pointer-events-auto">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-3 group">
                        <SiteLogo alt="Nepal Visuals Logo" className="h-8" />
                    </Link>
                </div>
                <div className="hidden md:flex items-center gap-6 xl:gap-8 flex-1 justify-center">
                    <div className="relative group px-2">
                        <Link 
                            className="text-sm font-medium text-white hover:text-primary transition-colors py-2 inline-flex items-center gap-1" 
                            to="/region/everest"
                        >
                            Treks
                            <span className="material-symbols-outlined text-lg transition-transform group-hover:rotate-180">expand_more</span>
                        </Link>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 w-max">
                            <MegaMenu />
                        </div>
                    </div>
                    <Link className="text-sm font-medium text-white hover:text-primary transition-colors" to="/about">About</Link>
                    <Link className="text-sm font-medium text-white hover:text-primary transition-colors" to="/contact">Contact</Link>
                    <Link className="text-sm font-medium text-white hover:text-primary transition-colors" to="/admin">Admin Panel</Link>
                </div>
                <div className="flex items-center gap-4">
                    {isConfirmationPage ? (
                         <div className="hidden md:flex items-center gap-2 text-sm font-bold text-text-secondary">
                            <span className="material-symbols-outlined text-green-500 text-lg">lock</span>
                            <span>Secure Booking</span>
                        </div>
                    ) : (
                         <a 
                            href="https://wa.me/9779800000000" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hidden md:flex bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all items-center gap-2 shadow-lg shadow-[#25D366]/20"
                        >
                            <WhatsAppIcon />
                            <span>Talk with Us</span>
                        </a>
                    )}
                    <button className="md:hidden text-white p-1 z-20" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden absolute top-0 left-0 right-0 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="mt-[72px] bg-surface-dark/95 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-4 mx-4 animate-fadeIn">
                        <div className="flex flex-col gap-2">
                            <Link className="text-lg font-medium text-white hover:text-primary transition-colors p-3 rounded-lg hover:bg-white/5" to="/region/everest">Treks</Link>
                            <Link className="text-lg font-medium text-white hover:text-primary transition-colors p-3 rounded-lg hover:bg-white/5" to="/about">About</Link>
                            <Link className="text-lg font-medium text-white hover:text-primary transition-colors p-3 rounded-lg hover:bg-white/5" to="/contact">Contact</Link>
                            <Link className="text-lg font-medium text-white hover:text-primary transition-colors p-3 rounded-lg hover:bg-white/5" to="/admin">Admin Panel</Link>
                            <div className="w-full h-px bg-white/10 my-2"></div>
                             <a 
                                href="https://wa.me/9779800000000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-3 rounded-lg text-lg font-bold transition-all items-center gap-2 shadow-lg shadow-[#25D366]/20 flex justify-center"
                            >
                                <WhatsAppIcon />
                                <span>Talk with Us</span>
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </nav>
    );
};

export default Header;