import React, { useState } from 'react';
// FIX: Use namespace import for react-router-dom to resolve module export issues.
import * as ReactRouterDOM from 'react-router-dom';
const { NavLink, useNavigate } = ReactRouterDOM;
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const SidebarLink: React.FC<{ to: string, children: React.ReactNode, icon: React.ReactNode, onClick?: () => void }> = ({ to, children, icon, onClick }) => {
    const baseClasses = "flex items-center px-4 py-2 text-gray-300 hover:bg-primary-900 hover:text-white rounded-md";
    const activeClasses = "bg-black/20 text-white";
    return (
        <NavLink 
            to={to} 
            end
            onClick={onClick}
            className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ''}`}
        >
            {icon}
            <span className="mx-4 font-medium">{children}</span>
        </NavLink>
    );
}

const LanguageSwitcher: React.FC<{ availableLanguages: ('es' | 'en' | 'fr')[] }> = ({ availableLanguages }) => {
    const { locale, setLocale } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const allLocales: { code: 'es' | 'en' | 'fr', name: string }[] = [
        { code: 'es', name: 'Español' },
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'Français' },
    ];

    const locales = allLocales.filter(l => availableLanguages.includes(l.code));

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-full text-gray-400 hover:text-white focus:outline-none"
                aria-label="Change language"
            >
                 <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" />
                </svg>
            </button>
            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="py-1">
                        {locales.map(l => (
                             <button
                                key={l.code}
                                onClick={() => {
                                    setLocale(l.code);
                                    setIsOpen(false);
                                }}
                                className={`block w-full text-left px-4 py-2 text-sm ${locale === l.code ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100 hover:text-gray-900`}
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

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout, hasPermission } = useAuth();
    const navigate = useNavigate();
    const { t, siteSettings } = useI18n();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const sidebarContent = (
        <div>
            <div className="flex items-center justify-center mt-8">
                <img src="https://ditalentrh.com/wp-content/uploads/2025/02/logo.svg" alt="Ditalent Logo" className="h-12 w-auto filter brightness-0 invert" />
            </div>
            <nav className="mt-10 px-2 space-y-1">
                {hasPermission('view_dashboard') && <SidebarLink to="/admin" icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}>{t('admin.sidebar.dashboard')}</SidebarLink>}
                {hasPermission('view_analytics') && <SidebarLink to="/admin/analytics" icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}>{t('admin.sidebar.analytics')}</SidebarLink>}
                {hasPermission('view_map') && <SidebarLink to="/admin/map" icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>{t('admin.sidebar.map')}</SidebarLink>}
                
                {(hasPermission('manage_jobs') || hasPermission('manage_companies') || hasPermission('manage_submissions')) && <p className="px-4 pt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('admin.sidebar.recruitment')}</p>}
                {hasPermission('manage_jobs') && <SidebarLink to="/admin/jobs" icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}>{t('admin.sidebar.jobs')}</SidebarLink>}
                {hasPermission('manage_companies') && <SidebarLink to="/admin/companies" icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>}>{t('admin.sidebar.companies')}</SidebarLink>}
                {hasPermission('manage_submissions') && <SidebarLink to="/admin/submissions" icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}>{t('admin.sidebar.contactForms')}</SidebarLink>}
                {hasPermission('manage_submissions') && <SidebarLink to="/admin/cv-submissions" icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}>{t('admin.sidebar.cvSubmissions')}</SidebarLink>}
                
                {(hasPermission('manage_users') || hasPermission('manage_roles')) && <p className="px-4 pt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('admin.sidebar.userManagement')}</p>}
                {hasPermission('manage_users') && <SidebarLink to="/admin/users" icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}>{t('admin.sidebar.users')}</SidebarLink>}
                {hasPermission('manage_roles') && <SidebarLink to="/admin/roles" icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5 5 0 019 10a5 5 0 014.242 2.158M12 4.354V10m0 0l-3.75-3.75M12 10l3.75-3.75" /></svg>}>{t('admin.sidebar.roles')}</SidebarLink>}

                {(hasPermission('manage_content') || hasPermission('manage_banners') || hasPermission('manage_popups')) && <p className="px-4 pt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('admin.sidebar.content')}</p>}
                {hasPermission('manage_banners') && <SidebarLink to="/admin/banner" icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>{t('admin.sidebar.homepageBanner')}</SidebarLink>}
                {hasPermission('manage_popups') && <SidebarLink to="/admin/popups" icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>}>{t('admin.sidebar.popups')}</SidebarLink>}
                {hasPermission('manage_content') && <SidebarLink to="/admin/services" icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" /></svg>}>{t('admin.sidebar.services')}</SidebarLink>}
                {hasPermission('manage_content') && <SidebarLink to="/admin/team" icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5 5 0 019 10a5 5 0 014.242 2.158M12 4.354V10m0 0l-3.75-3.75M12 10l3.75-3.75" /></svg>}>{t('admin.sidebar.team')}</SidebarLink>}
                {hasPermission('manage_content') && <SidebarLink to="/admin/testimonials" icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}>{t('admin.sidebar.testimonials')}</SidebarLink>}
                {hasPermission('manage_content') && <SidebarLink to="/admin/blog" icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 11a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2v13a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}>{t('admin.sidebar.blog')}</SidebarLink>}
                {hasPermission('manage_content') && <SidebarLink to="/admin/resources" icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>{t('admin.sidebar.resources')}</SidebarLink>}
                
                {hasPermission('manage_plans') && <p className="px-4 pt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('admin.sidebar.monetization')}</p>}
                {hasPermission('manage_plans') && <SidebarLink to="/admin/plans" icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>{t('admin.sidebar.plans')}</SidebarLink>}

                {hasPermission('manage_settings') && <p className="px-4 pt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('admin.sidebar.settings')}</p>}
                {hasPermission('manage_settings') && <SidebarLink to="/admin/settings" icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>{t('admin.sidebar.siteSettings')}</SidebarLink>}
            </nav>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-shrink-0 w-64">
                <div className="flex flex-col w-64 bg-primary text-white overflow-y-auto">
                    {sidebarContent}
                </div>
            </aside>
            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 flex z-40 md:hidden">
                    <div className="fixed inset-0 bg-black opacity-30" onClick={() => setSidebarOpen(false)}></div>
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary text-white">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            >
                                <svg className="h-6 w-6 text-white" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="overflow-y-auto">
                            {sidebarContent}
                        </div>
                    </div>
                    <div className="flex-shrink-0 w-14"></div>
                </div>
            )}

            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
                    >
                        <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <div className="flex-1 px-4 flex justify-end items-center">
                        {siteSettings?.enableLanguageSwitcher && siteSettings.availableLanguages.length > 1 && (
                            <LanguageSwitcher availableLanguages={siteSettings.availableLanguages} />
                        )}
                        <div className="ml-4 flex items-center md:ml-6">
                            <span className="text-gray-600 mr-3">{t('admin.header.welcome')}, {user?.email}</span>
                            <button onClick={handleLogout} className="text-gray-500 hover:text-primary" title={t('admin.header.logout')}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;