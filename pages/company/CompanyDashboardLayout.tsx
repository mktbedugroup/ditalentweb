import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { NavLink } = ReactRouterDOM;
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useI18n } from '../../contexts/I18nContext';

interface CompanyDashboardLayoutProps {
  children: React.ReactNode;
}

const SidebarLink: React.FC<{ to: string, children: React.ReactNode }> = ({ to, children }) => {
    const baseClasses = "block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md";
    const activeClasses = "bg-primary/10 text-primary font-semibold";
    return (
        <NavLink 
            to={to} 
            end
            className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ''}`}
        >
            {children}
        </NavLink>
    );
}

const CompanyDashboardLayout: React.FC<CompanyDashboardLayoutProps> = ({ children }) => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-sm sticky top-24">
              <h2 className="text-lg font-bold mb-4">{t('company.sidebar.title')}</h2>
              <nav className="space-y-2">
                <SidebarLink to="/company/dashboard">{t('company.sidebar.dashboard')}</SidebarLink>
                <SidebarLink to="/company/jobs">{t('company.sidebar.jobs')}</SidebarLink>
                <SidebarLink to="/company/candidate-search">{t('company.sidebar.searchCandidates')}</SidebarLink>
                <SidebarLink to="/company/profile">{t('company.sidebar.profile')}</SidebarLink>
                <SidebarLink to="/company/plans">{t('company.sidebar.plans')}</SidebarLink>
              </nav>
            </div>
          </aside>
          <div className="md:col-span-3">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CompanyDashboardLayout;
