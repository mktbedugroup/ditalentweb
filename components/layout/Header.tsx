import React, { useState, useEffect, useRef } from 'react';
// FIX: Use namespace import for react-router-dom to resolve module export issues.
import * as ReactRouterDOM from 'react-router-dom';
const { Link, NavLink, useNavigate } = ReactRouterDOM;
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from '../common/Button';

type Locale = 'es' | 'en' | 'fr';

// Updated LanguageSwitcher with dropdown and globe icon
const LanguageSwitcher: React.FC<{ availableLanguages: Locale[] }> = ({ availableLanguages }) => {
    const { locale, setLocale } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const allLocales: { code: Locale, name: string }[] = [
        { code: 'es', name: 'Español' },
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'Français' },
    ];
    const availableLocales = allLocales.filter(l => availableLanguages.includes(l.code));

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                aria-label="Change language"
            >
                 <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" />
                </svg>
            </button>
            {isOpen && (
                <div 
                    className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"
                >
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {availableLocales.map(l => (
                             <button
                                key={l.code}
                                onClick={() => {
                                    setLocale(l.code);
                                    setIsOpen(false);
                                }}
                                className={`block w-full text-left px-4 py-2 text-sm ${locale === l.code ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-700'} hover:bg-gray-100 hover:text-gray-900`}
                                role="menuitem"
                            >
                                {l.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t, siteSettings } = useI18n();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node) && !isMobileMenuOpen) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [userMenuRef, isMobileMenuOpen]);


    const navLinks = [
        { name: t('nav.home'), href: '/' },
        { name: t('nav.about'), href: '/about' },
        { name: t('nav.services'), href: '/services' },
        { name: t('nav.findJobs'), href: '/jobs' },
        { name: t('nav.blog'), href: '/blog' },
        { name: t('nav.careers'), href: '/career' },
        { name: t('nav.contact'), href: '/contact' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
    }

    const navLinkClasses = "text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors";
    const activeNavLinkClasses = "text-primary bg-primary/10";

    const mobileNavLinkClasses = "block text-gray-600 hover:text-primary hover:bg-gray-100 px-3 py-2 rounded-md text-base font-medium transition-colors";
    const activeMobileNavLinkClasses = "text-primary bg-primary/5";

    const renderUserActions = () => {
        if (user) {
            return (
                <div className="relative" ref={userMenuRef}>
                    <Button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                        {t('header.myAccount')}
                        <svg className="w-5 h-5 ml-2 -mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </Button>
                    {isUserMenuOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                            {user.role === 'admin' && (
                                <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleLinkClick}>{t('header.adminPanel')}</Link>
                            )}
                            {user.role === 'candidate' && (
                                <>
                                    <Link to="/candidate/applications" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleLinkClick}>{t('header.myApplications')}</Link>
                                    <Link to="/candidate/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleLinkClick}>{t('header.myProfile')}</Link>
                                </>
                            )}
                            {user.role === 'company' && (
                                <Link to="/company/jobs" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleLinkClick}>{t('header.companyPanel')}</Link>
                            )}
                            <button onClick={() => { handleLogout(); handleLinkClick(); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('header.logout')}</button>
                        </div>
                    )}
                </div>
            )
        }
        return (
            <div className="flex items-center space-x-1">
                <Link to="/login" className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors" title={t('header.login')} onClick={handleLinkClick}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                </Link>
                <Link to="/register" className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors" title={t('header.signUp')} onClick={handleLinkClick}>
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                </Link>
            </div>
        )
    }
    
     const renderMobileUserActions = () => {
        if (user) {
            return (
                 <div className="pt-4 pb-3 border-t border-gray-200">
                    <div className="flex items-center px-5">
                        <div className="ml-3">
                            <div className="text-base font-medium leading-none text-gray-800">{user.email}</div>
                            <div className="text-sm font-medium leading-none text-gray-500 capitalize">{user.role}</div>
                        </div>
                    </div>
                    <div className="mt-3 px-2 space-y-1">
                         {user.role === 'admin' && (
                            <Link to="/admin" className={mobileNavLinkClasses} onClick={handleLinkClick}>{t('header.adminPanel')}</Link>
                        )}
                        {user.role === 'candidate' && (
                            <>
                                <Link to="/candidate/applications" className={mobileNavLinkClasses} onClick={handleLinkClick}>{t('header.myApplications')}</Link>
                                <Link to="/candidate/profile" className={mobileNavLinkClasses} onClick={handleLinkClick}>{t('header.myProfile')}</Link>
                            </>
                        )}
                        {user.role === 'company' && (
                             <Link to="/company/jobs" className={mobileNavLinkClasses} onClick={handleLinkClick}>{t('header.companyPanel')}</Link>
                        )}
                        <button onClick={() => { handleLogout(); handleLinkClick(); }} className={`${mobileNavLinkClasses} w-full text-left`}>{t('header.logout')}</button>
                    </div>
                </div>
            )
        }
        return (
             <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="px-2 space-y-2">
                   <Link to="/login" className="block" onClick={handleLinkClick}>
                        <Button variant="light" className="w-full">{t('header.login')}</Button>
                    </Link>
                    <Link to="/register" className="block" onClick={handleLinkClick}>
                        <Button variant="secondary" className="w-full">{t('header.signUp')}</Button>
                    </Link>
                </div>
            </div>
        )
     }

    return (
        <header className="bg-white shadow-sm sticky top-0 z-20">
            <nav className="mx-auto px-4 sm:px-6 lg:px-12 relative">
                <div className="flex items-center justify-between h-20">
                    {/* Left Slot: Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" onClick={handleLinkClick}>
                            <img src="https://ditalentrh.com/wp-content/uploads/2025/02/logo.svg" alt="Ditalent Logo" className="h-12 w-auto" />
                        </Link>
                    </div>

                    {/* Center Slot: Desktop Navigation */}
                    <div className="hidden md:flex justify-center flex-grow">
                        <div className="flex items-baseline space-x-4">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.name}
                                    to={link.href}
                                    className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                    
                    {/* Right Slot: Actions (Desktop) & Mobile Menu Button Wrapper */}
                    <div className="flex items-center justify-end">
                        <div className="hidden md:flex items-center space-x-2">
                           {siteSettings?.enableLanguageSwitcher && siteSettings.availableLanguages.length > 1 && (
                                <LanguageSwitcher availableLanguages={siteSettings.availableLanguages} />
                           )}
                           {renderUserActions()}
                        </div>
                        {/* Mobile menu button */}
                        <div className="-mr-2 flex md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                type="button"
                                className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                aria-controls="mobile-menu"
                                aria-expanded={isMobileMenuOpen}
                            >
                                <span className="sr-only">Open main menu</span>
                                <svg className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                <svg className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay & Panel */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-30 md:hidden">
                    {/* Overlay */}
                    <div 
                        className="absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>

                    {/* Sliding panel */}
                    <div className="absolute right-0 top-0 h-full w-full max-w-xs bg-white shadow-lg transition-transform duration-300 ease-in-out transform translate-x-0">
                        <div className="p-5 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-gray-800">Menú</h2>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                                    <svg className="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex-grow overflow-y-auto">
                                <div className="space-y-2">
                                    {navLinks.map((link) => (
                                        <NavLink
                                            key={link.name}
                                            to={link.href}
                                            onClick={handleLinkClick}
                                            className={({ isActive }) =>
                                                `${mobileNavLinkClasses} ${isActive ? activeMobileNavLinkClasses : ''}`
                                            }
                                        >
                                            {link.name}
                                        </NavLink>
                                    ))}
                                </div>
                                {siteSettings?.enableLanguageSwitcher && siteSettings.availableLanguages.length > 1 && (
                                    <div className="py-4 border-t border-gray-200 mt-4">
                                        <LanguageSwitcher availableLanguages={siteSettings.availableLanguages} />
                                    </div>
                                )}
                            </div>
                            {renderMobileUserActions()}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;