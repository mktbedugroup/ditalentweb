

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Job, Company, User, ContactSubmission, MultilingualString } from '../../types';
import { Card } from '../../components/common/Card';
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM;
import { Button } from '../../components/common/Button';
import { useI18n } from '../../contexts/I18nContext';

const LiveUsersIcon = () => ( <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> );
const JobsIcon = () => ( <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> );
const CompanyIcon = () => ( <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg> );
const UsersIcon = () => ( <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg> );
const SubmissionsIcon = () => ( <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> );

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; linkTo?: string; isLive?: boolean }> = ({ title, value, icon, linkTo, isLive = false }) => {
    const cardContent = (
        <Card>
            <div className="p-5 flex items-center">
                <div className="p-3 rounded-full bg-primary/10 relative">
                    {icon}
                    {isLive && (
                        <span className="absolute top-1 right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    )}
                </div>
                <div className="ml-4">
                    <p className="text-2xl font-semibold text-gray-700">{value}</p>
                    <p className="text-sm text-gray-500">{title}</p>
                </div>
            </div>
        </Card>
    );

    return linkTo ? (
        <Link to={linkTo} className="block transition-transform transform hover:-translate-y-1">{cardContent}</Link>
    ) : (
        <div>{cardContent}</div>
    );
};

const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState({ jobs: 0, companies: 0, users: 0, submissions: 0 });
    const [activeUsers, setActiveUsers] = useState(0);
    const [recentJobs, setRecentJobs] = useState<Job[]>([]);
    const [recentSubmissions, setRecentSubmissions] = useState<ContactSubmission[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, t_dynamic } = useI18n();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [jobsData, companiesData, usersData, submissionsData] = await Promise.all([
                    api.getAllJobs(),
                    api.getCompanies(),
                    api.getUsers(),
                    api.getContactSubmissions(),
                ]);
                setStats({
                    jobs: jobsData.length,
                    companies: companiesData.length,
                    users: usersData.length,
                    submissions: submissionsData.length,
                });
                setRecentJobs(jobsData.slice(0, 5));
                setRecentSubmissions(submissionsData.slice(0, 5));
                setCompanies(companiesData);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);
    
    useEffect(() => {
        const fetchActiveUsers = async () => {
            try {
                const count = await api.getActiveUserCount();
                setActiveUsers(count);
            } catch (error) {
                console.error("Failed to fetch active users", error);
            }
        };

        fetchActiveUsers();
        const intervalId = setInterval(fetchActiveUsers, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const getCompanyName = (companyId: string): MultilingualString | undefined => {
        return companies.find(c => c.id === companyId)?.name;
    };

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">{t('admin.dashboard.title')}</h1>
            {loading ? (
                <p>{t('admin.dashboard.loading')}</p>
            ) : (
                <div className="space-y-8">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title={t('admin.dashboard.liveUsers')} value={activeUsers} icon={<LiveUsersIcon />} isLive />
                        <StatCard title={t('admin.dashboard.totalJobs')} value={stats.jobs} icon={<JobsIcon />} linkTo="/admin/jobs" />
                        <StatCard title={t('admin.dashboard.totalCompanies')} value={stats.companies} icon={<CompanyIcon />} linkTo="/admin/companies" />
                        <StatCard title={t('admin.dashboard.totalUsers')} value={stats.users} icon={<UsersIcon />} linkTo="/admin/users" />
                        <StatCard title={t('admin.dashboard.submissions')} value={stats.submissions} icon={<SubmissionsIcon />} linkTo="/admin/submissions" />
                    </div>
                    
                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Recent Jobs */}
                            <Card>
                                <div className="p-5">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('admin.dashboard.recentJobs')}</h2>
                                    <ul className="divide-y divide-gray-200">
                                        {recentJobs.map(job => (
                                            <li key={job.id} className="py-3 flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-gray-800">{t_dynamic(job.title)}</p>
                                                    <p className="text-sm text-gray-500">{t_dynamic(getCompanyName(job.companyId))} - {t_dynamic(job.location)}</p>
                                                </div>
                                                <Link to="/admin/jobs" className="text-sm font-medium text-secondary hover:text-secondary-700">{t('admin.dashboard.view')}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        </div>
                        <div className="lg:col-span-1 space-y-6">
                             {/* Quick Actions */}
                             <Card>
                                <div className="p-5">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('admin.dashboard.quickActions')}</h2>
                                    <div className="space-y-3">
                                        <Link to="/admin/jobs"><Button className="w-full">{t('admin.dashboard.addVacancy')}</Button></Link>
                                        <Link to="/admin/companies"><Button variant="light" className="w-full">{t('admin.dashboard.addCompany')}</Button></Link>
                                        <Link to="/admin/blog"><Button variant="light" className="w-full">{t('admin.dashboard.manageContent')}</Button></Link>
                                    </div>
                                </div>
                            </Card>
                            {/* Recent Submissions */}
                            <Card>
                                <div className="p-5">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('admin.dashboard.recentSubmissions')}</h2>
                                    <ul className="space-y-3">
                                        {recentSubmissions.map(sub => (
                                            <li key={sub.id} className="border-l-4 border-secondary pl-3">
                                                <p className="font-medium text-sm text-gray-800 truncate">{sub.subject}</p>
                                                <p className="text-xs text-gray-500">{sub.name} - {new Date(sub.submittedAt).toLocaleDateString()}</p>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link to="/admin/submissions" className="mt-4 inline-block text-sm font-medium text-secondary hover:text-secondary-700">{t('admin.dashboard.viewAllSubmissions')} &rarr;</Link>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;