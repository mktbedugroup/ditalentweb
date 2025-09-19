import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Job, Company, User, ContactSubmission, MultilingualString } from '../../types';
import { Card } from '../../components/common/Card';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { useI18n } from '../../contexts/I18nContext';
import { FaBell, FaBriefcase, FaBuilding, FaUsers, FaEnvelope, FaFileAlt } from 'react-icons/fa';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; linkTo?: string; }> = ({ title, value, icon, linkTo }) => {
    const cardContent = (
        <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/30">
            <div className="p-5 flex items-center">
                <div className="p-3 rounded-full bg-primary/10">
                    {icon}
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
    const [stats, setStats] = useState({ jobs: 0, companies: 0, users: 0, contactSubmissions: 0, cvSubmissions: 0 });
    const [alerts, setAlerts] = useState({ newContact: 0, newCvs: 0 });
    const [recentJobs, setRecentJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, t_dynamic } = useI18n();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [jobsData, companiesData, usersData, dashboardStats] = await Promise.all([
                    api.getJobs({ limit: 5 }),
                    api.getCompanies(),
                    api.getUsers(),
                    api.getDashboardStats(),
                ]);
                setStats({
                    jobs: jobsData.total,
                    companies: companiesData.length,
                    users: usersData.length,
                    contactSubmissions: dashboardStats.contactSubmissionsCount,
                    cvSubmissions: dashboardStats.cvSubmissionsCount,
                });
                setAlerts({
                    newContact: dashboardStats.newContactSubmissionsCount,
                    newCvs: dashboardStats.newCvSubmissionsCount,
                });
                setRecentJobs(jobsData.jobs);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">{t('admin.dashboard.title')}</h1>
            {loading ? (
                <p>{t('admin.dashboard.loading')}</p>
            ) : (
                <div className="space-y-8">
                    {/* Alerts for New Submissions */}
                    {(alerts.newContact > 0 || alerts.newCvs > 0) && (
                        <Card className="bg-secondary/10 border-l-4 border-secondary">
                            <div className="p-4 flex items-center">
                                <FaBell className="w-6 h-6 text-secondary mr-4"/>
                                <div>
                                    <h2 className="font-semibold text-secondary-800">{t('admin.dashboard.recentSubmissions')}</h2>
                                    <div className="flex space-x-4 text-sm">
                                        {alerts.newContact > 0 && (
                                            <Link to="/admin/submissions" className="text-secondary-700 hover:underline">
                                                {alerts.newContact} {t('admin.dashboard.newContactSubmissions')}
                                            </Link>
                                        )}
                                        {alerts.newCvs > 0 && (
                                            <Link to="/admin/cv-submissions" className="text-secondary-700 hover:underline">
                                                {alerts.newCvs} {t('admin.dashboard.newCvSubmissions')}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        <StatCard title={t('admin.dashboard.totalJobs')} value={stats.jobs} icon={<FaBriefcase className="w-8 h-8 text-primary" />} linkTo="/admin/jobs" />
                        <StatCard title={t('admin.dashboard.totalCompanies')} value={stats.companies} icon={<FaBuilding className="w-8 h-8 text-primary" />} linkTo="/admin/companies" />
                        <StatCard title={t('admin.dashboard.totalUsers')} value={stats.users} icon={<FaUsers className="w-8 h-8 text-primary" />} linkTo="/admin/users" />
                        <StatCard title={t('admin.submissions.title')} value={`${alerts.newContact} / ${stats.contactSubmissions}`} icon={<FaEnvelope className="w-8 h-8 text-primary" />} linkTo="/admin/submissions" />
                        <StatCard title={t('admin.cvSubmissions.title')} value={`${alerts.newCvs} / ${stats.cvSubmissions}`} icon={<FaFileAlt className="w-8 h-8 text-primary" />} linkTo="/admin/cv-submissions" />
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
                                                    <p className="text-sm text-gray-500">{job.company?.name ? t_dynamic(job.company.name as MultilingualString) : 'N/A'} - {t_dynamic(job.location)}</p>
                                                </div>
                                                <Link to={`/admin/jobs`} className="text-sm font-medium text-secondary hover:text-secondary-700">{t('admin.dashboard.view')}</Link>
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;