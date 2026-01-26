
import React from 'react';
import { Link } from 'react-router-dom';
import SiteLogo from '../common/SiteLogo';

const FacebookIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
);

const TwitterIcon = () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
);

const InstagramIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
);

const Footer: React.FC = () => {
    return (
        <footer className="bg-[#030e1c] pt-20 pb-10 border-t border-white/5">
            <div className="container mx-auto px-4 md:px-8 lg:px-16 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 lg:col-span-1">
                        <div className="mb-6">
                            <Link to="/">
                                <SiteLogo alt="Nepal Visuals Logo" className="h-10" />
                            </Link>
                        </div>
                        <p className="text-text-secondary text-sm mb-6">
                            We curate the best trekking experiences around the globe. Join us to explore the unseen.
                        </p>
                        <div className="flex gap-4">
                            <a aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center transition-all text-white group" href="#">
                                <FacebookIcon />
                            </a>
                            <a aria-label="Twitter" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center transition-all text-white group" href="#">
                                <TwitterIcon />
                            </a>
                            <a aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center transition-all text-white group" href="#">
                                <InstagramIcon />
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4">
                            <li><Link className="text-text-secondary hover:text-primary text-sm transition-colors" to="/about">About Us</Link></li>
                            <li><a className="text-text-secondary hover:text-primary text-sm transition-colors" href="#">Careers</a></li>
                            <li><a className="text-text-secondary hover:text-primary text-sm transition-colors" href="#">Blog</a></li>
                            <li><a className="text-text-secondary hover:text-primary text-sm transition-colors" href="#">Press</a></li>
                            <li><a className="text-text-secondary hover:text-primary text-sm transition-colors" href="#">Sustainability</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Contact Us</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">location_on</span>
                                <span className="text-text-secondary text-sm leading-relaxed">123 Adventure Marg, Thamel,<br/>Kathmandu 44600, Nepal</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[20px]">call</span>
                                <a className="text-text-secondary hover:text-primary text-sm transition-colors" href="tel:+97714423456">+977 1 442 3456</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[20px]">mail</span>
                                <a className="text-text-secondary hover:text-primary text-sm transition-colors" href="mailto:hello@nepalvisuals.com">hello@nepalvisuals.com</a>
                            </li>
                             <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[20px]">link</span>
                                <Link className="text-text-secondary hover:text-primary text-sm transition-colors" to="/contact">Contact Page</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="col-span-1 lg:col-span-1">
                        <h4 className="text-white font-bold mb-6">Newsletter</h4>
                        <p className="text-text-secondary text-sm mb-4">Subscribe for travel inspiration and exclusive offers.</p>
                        <form className="flex flex-col gap-3">
                            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:ring-1 focus:ring-primary focus:border-primary text-sm outline-none transition-all" placeholder="Your email address" type="email" />
                            <button className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-text-secondary text-xs">© 2024 Nepal Visuals Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a className="text-text-secondary text-xs hover:text-white" href="#">Privacy Policy</a>
                        <a className="text-text-secondary text-xs hover:text-white" href="#">Terms of Service</a>
                        <a className="text-text-secondary text-xs hover:text-white" href="#">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
