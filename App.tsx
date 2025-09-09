
import React from 'react';
// FIX: Use namespace import for react-router-dom to resolve module export issues.
import * as ReactRouterDOM from 'react-router-dom';
const { HashRouter, Routes, Route, Navigate } = ReactRouterDOM;
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { I18nProvider, useI18n } from './contexts/I18nContext';
import HomePage from './pages/public/HomePage';
import JobsListPage from './pages/public/JobsListPage';
import JobDetailPage from './pages/public/JobDetailPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import CareerPage from './pages/public/CareerPage';

import AdminLayout from './components/layout/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRolesPage from './pages/admin/AdminRolesPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminTeamPage from './pages/admin/AdminTeamPage';
import AdminTestimonialsPage from './pages/admin/AdminTestimonialsPage';
import AdminBlogPage from './pages/admin/AdminBlogPage';
import AdminResourcesPage from './pages/admin/AdminResourcesPage';
import AdminBannerPage from './pages/admin/AdminBannerPage';
import AdminSubmissionsPage from './pages/admin/AdminSubmissionsPage';
import AdminSiteSettingsPage from './pages/admin/AdminSiteSettingsPage';
import AdminJobApplicantsPage from './pages/admin/AdminJobApplicantsPage';
import AdminViewCandidateProfilePage from './pages/admin/AdminViewCandidateProfilePage';
import AdminCvSubmissionsPage from './pages/admin/AdminCvSubmissionsPage';
import AdminPlansPage from './pages/admin/AdminPlansPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminMapPage from './pages/admin/AdminMapPage';
import AdminPopupsPage from './pages/admin/AdminPopupsPage';


import CandidateDashboardLayout from './pages/candidate/CandidateDashboardLayout';
import CandidateDashboardPage from './pages/candidate/CandidateDashboardPage';
import ProfilePage from './pages/candidate/ProfilePage';
import MyApplicationsPage from './pages/candidate/MyApplicationsPage';

import CompanyDashboardLayout from './pages/company/CompanyDashboardLayout';
import CompanyDashboardPage from './pages/company/CompanyDashboardPage';
import CompanyJobsPage from './pages/company/CompanyJobsPage';
import JobApplicantsPage from './pages/company/JobApplicantsPage';
import ViewCandidateProfilePage from './pages/company/ViewCandidateProfilePage';
import CompanyProfilePage from './pages/company/CompanyProfilePage';
import CompanyPlansPage from './pages/company/CompanyPlansPage';
import CompanyUpgradePage from './pages/company/CompanyUpgradePage';
import CandidateSearchPage from './pages/company/CandidateSearchPage';

import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import ResourcesPage from './pages/public/ResourcesPage';
import BlogPage from './pages/public/BlogPage';
import BlogDetailPage from './pages/public/BlogDetailPage';
import ContactPage from './pages/public/ContactPage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsPage from './pages/legal/TermsPage';
import PricingPage from './pages/public/PricingPage';
import CompanyJobsPublicPage from './pages/public/CompanyJobsPublicPage';
import type { Permission } from './types';
import { PopupManager } from './components/common/PopupManager';


const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PermissionGuard: React.FC<{ children: React.ReactElement, permission: Permission }> = ({ children, permission }) => {
    const { hasPermission } = useAuth();
    const { t } = useI18n();

    if (!hasPermission(permission)) {
        return (
            <div className="p-8 text-center bg-red-50 border-l-4 border-red-500">
                <h2 className="text-2xl font-bold text-red-800">{t('errors.accessDenied.title')}</h2>
                <p className="mt-2 text-red-700">{t('errors.accessDenied.message')}</p>
            </div>
        );
    }

    return children;
};

const CandidateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'candidate') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const CompanyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'company') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRoutes: React.FC = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:postId" element={<BlogDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/career" element={<CareerPage />} />
        <Route path="/jobs" element={<JobsListPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/companies/:companyId/jobs" element={<CompanyJobsPublicPage />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<PermissionGuard permission="view_dashboard"><AdminDashboardPage /></PermissionGuard>} />
                  <Route path="/analytics" element={<PermissionGuard permission="view_analytics"><AdminAnalyticsPage /></PermissionGuard>} />
                  <Route path="/map" element={<PermissionGuard permission="view_map"><AdminMapPage /></PermissionGuard>} />
                  <Route path="/jobs" element={<PermissionGuard permission="manage_jobs"><AdminJobsPage /></PermissionGuard>} />
                  <Route path="/jobs/:jobId/applicants" element={<PermissionGuard permission="manage_jobs"><AdminJobApplicantsPage /></PermissionGuard>} />
                  <Route path="/applicants/:profileId/profile" element={<PermissionGuard permission="manage_jobs"><AdminViewCandidateProfilePage /></PermissionGuard>} />
                  <Route path="/companies" element={<PermissionGuard permission="manage_companies"><AdminCompaniesPage /></PermissionGuard>} />
                  <Route path="/users" element={<PermissionGuard permission="manage_users"><AdminUsersPage /></PermissionGuard>} />
                  <Route path="/roles" element={<PermissionGuard permission="manage_roles"><AdminRolesPage /></PermissionGuard>} />
                  <Route path="/submissions" element={<PermissionGuard permission="manage_submissions"><AdminSubmissionsPage /></PermissionGuard>} />
                  <Route path="/cv-submissions" element={<PermissionGuard permission="manage_submissions"><AdminCvSubmissionsPage /></PermissionGuard>} />
                  <Route path="/services" element={<PermissionGuard permission="manage_content"><AdminServicesPage /></PermissionGuard>} />
                  <Route path="/team" element={<PermissionGuard permission="manage_content"><AdminTeamPage /></PermissionGuard>} />
                  <Route path="/testimonials" element={<PermissionGuard permission="manage_content"><AdminTestimonialsPage /></PermissionGuard>} />
                  <Route path="/blog" element={<PermissionGuard permission="manage_content"><AdminBlogPage /></PermissionGuard>} />
                  <Route path="/resources" element={<PermissionGuard permission="manage_content"><AdminResourcesPage /></PermissionGuard>} />
                  <Route path="/banner" element={<PermissionGuard permission="manage_banners"><AdminBannerPage /></PermissionGuard>} />
                  <Route path="/popups" element={<PermissionGuard permission="manage_popups"><AdminPopupsPage /></PermissionGuard>} />
                  <Route path="/plans" element={<PermissionGuard permission="manage_plans"><AdminPlansPage /></PermissionGuard>} />
                  <Route path="/settings" element={<PermissionGuard permission="manage_settings"><AdminSiteSettingsPage /></PermissionGuard>} />
                </Routes>
              </AdminLayout>
            </AdminRoute>
          }
        />
        
        {/* Candidate Routes */}
        <Route 
          path="/candidate/*"
          element={
            <CandidateRoute>
              <CandidateDashboardLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="dashboard" replace />} />
                  <Route path="/dashboard" element={<CandidateDashboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/applications" element={<MyApplicationsPage />} />
                </Routes>
              </CandidateDashboardLayout>
            </CandidateRoute>
          }
        />

        {/* Company Routes */}
        <Route
          path="/company/*"
          element={
            <CompanyRoute>
              <CompanyDashboardLayout>
                  <Routes>
                      <Route path="/" element={<Navigate to="dashboard" replace />} />
                      <Route path="/dashboard" element={<CompanyDashboardPage />} />
                      <Route path="/jobs" element={<CompanyJobsPage />} />
                      <Route path="/jobs/:jobId/applicants" element={<JobApplicantsPage />} />
                      <Route path="/applicants/:profileId/profile" element={<ViewCandidateProfilePage />} />
                      <Route path="/profile" element={<CompanyProfilePage />} />
                      <Route path="/plans" element={<CompanyPlansPage />} />
                      <Route path="/upgrade/:planId" element={<CompanyUpgradePage />} />
                      <Route path="/candidate-search" element={<CandidateSearchPage />} />
                  </Routes>
              </CompanyDashboardLayout>
            </CompanyRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <PopupManager />
    </>
  );
};

const App: React.FC = () => {
  return (
    <I18nProvider>
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </I18nProvider>
  );
};

export default App;