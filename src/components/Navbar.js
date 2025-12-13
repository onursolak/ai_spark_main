import React, { useEffect, useState } from 'react';
import '../style/Navbar.css';

export default function Navbar({ currentView, onViewChange, onPageChange, currentPage, favoritesCount }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            {/* Logo ve Branding */}
            <div className="navbar-brand" onClick={() => onPageChange('home')}>
                <div className="logo-container">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f27f0e" />
                                <stop offset="100%" stopColor="#d96d0b" />
                            </linearGradient>
                        </defs>
                        <path d="M20 5L35 12.5V27.5L20 35L5 27.5V12.5L20 5Z" fill="url(#logoGradient)" />
                        <circle cx="20" cy="20" r="5" fill="white" opacity="0.9" />
                    </svg>
                </div>
                <div className="brand-text">
                    <span className="brand-name">Ai-Spark</span>
                    <span className="brand-tagline">Emlak Asistanı</span>
                </div>
            </div>

            {/* Navigation Menu */}
            {currentPage === 'home' && (
                <div className="navbar-menu">
                    <button 
                        onClick={() => onViewChange('list')} 
                        className={`nav-link ${currentView === 'list' ? 'active' : ''}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span>Liste</span>
                    </button>
                    <button 
                        onClick={() => onViewChange('map')} 
                        className={`nav-link ${currentView === 'map' ? 'active' : ''}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>Harita</span>
                    </button>
                </div>
            )}

            {/* Right Side Actions */}
            <div className="navbar-actions">
                <button className="action-btn notification-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span className="notification-badge">3</span>
                </button>
                
                <button 
                    className={`action-btn ${currentPage === 'favorites' ? 'active-page' : ''}`}
                    onClick={() => onPageChange('favorites')}
                    title="Beğendiklerim"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={currentPage === 'favorites' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    {favoritesCount > 0 && (
                        <span className="favorites-count">{favoritesCount}</span>
                    )}
                </button>
            </div>
        </nav>
    )
}