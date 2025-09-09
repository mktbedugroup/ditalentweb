import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Job, Application, CandidateProfile, User, Company, SubscriptionPlan } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM;
import { Button } from '../../components/common/Button';
import { useI18n } from '../../contexts/I18nContext';

const JobsIcon = () => ( <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> );
const ApplicantsIcon = () => ( <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg> );
const PlanIcon = () => ( <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg> );


const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; linkTo?: string }> = ({ title, value, icon, linkTo }) => {
    const cardContent = (
        <Card>
            <div className="p-5 flex items-center">
                <div className="p-3 rounded-full bg-primary/10">{icon}</div>
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

interface EnrichedApplication extends Application {
    candidateName?: string;
    jobTitle?: string;
}

const CompanyDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [company, setCompany] = useState<Company | null>(null);
    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [stats, setStats] = useState({ activeJobs: 0, totalJobs: 0, totalApplicants: 0 });
    const [recentApps, setRecentApps] = useState<EnrichedApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, t_dynamic } = useI18n();

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user || !user.companyId) return;
            setLoading(true);
            try {
                const companyData = await api.getCompanyById(user.companyId);
                setCompany(companyData || null);

                if (companyData?.planId) {
                    const planData = await api.getSubscriptionPlanById(companyData.planId);
                    setPlan(planData || null);
                }

                const [jobsData, appsData] = await Promise.all([
                    api.getJobsByCompanyId(user.companyId),
                    api.getApplicationsByCompanyId(user.companyId),
                ]);

                setStats({
                    activeJobs: jobsData.filter(j => j.status === 'active').length,
                    totalJobs: jobsData.length,
                    totalApplicants: appsData.length,
                });

                const sortedApps = appsData.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()).slice(0, 5);
                const enrichedApps = await Promise.all(sortedApps.map(async (app) => {
                    const profile = await api.getProfileById(app.profileId);
                    const job = jobsData.find(j => j.id === app.jobId);
                    return { ...app, candidateName: profile?.fullName, jobTitle: job ? t_dynamic(job.title) : 'N/A' };
                }));
                setRecentApps(enrichedApps);

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, t_dynamic]);
    
    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">{t('company.dashboard.title')}</h1>
            {loading ? (
                <p>Loading dashboard...</p>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard title={t('company.dashboard.activeJobs')} value={stats.activeJobs} icon={<JobsIcon />} linkTo="/company/jobs" />
                        <StatCard title={t('company.dashboard.totalApplicants')} value={stats.totalApplicants} icon={<ApplicantsIcon />} />
                         <StatCard title={t('company.dashboard.currentPlan')} value={plan ? t_dynamic(plan.name) : 'N/A'} icon={<PlanIcon />} linkTo="/company/plans" />
                    </div>

                     <Card>
                        <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-700">{t('company.dashboard.subscriptionStatus')}</h3>
                                <p className="text-gray-600">{t('company.dashboard.postsRemaining')}: <span className="font-bold text-secondary">{company?.jobPostingsRemaining === -1 ? 'Unlimited' : company?.jobPostingsRemaining}</span></p>
                                <p className="text-gray-500 text-sm">{t('company.dashboard.planRenews')}: {company?.subscriptionEndDate ? new Date(company.subscriptionEndDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                             <Link to="/pricing">
                                <Button variant="secondary">{t('company.dashboard.upgradePlan')}</Button>
                            </Link>
                        </div>
                    </Card>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                             <Card>
                                <div className="p-5">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('company.dashboard.recentApps')}</h2>
                                    {recentApps.length > 0 ? (
                                        <ul className="divide-y divide-gray-200">
                                            {recentApps.map(app => (
                                                <li key={app.id} className="py-3 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{app.candidateName}</p>
                                                        <p className="text-sm text-gray-500">Applied for: {app.jobTitle}</p>
                                                    </div>
                                                    <Link to={`/company/applicants/${app.profileId}/profile`}>
                                                        <Button variant="light" size="sm">{t('company.dashboard.viewProfile')}</Button>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">{t('company.dashboard.noRecentApps')}</p>
                                    )}
                                </div>
                            </Card>
                        </div>
                         <div className="lg:col-span-1">
                             <Card>
                                <div className="p-5">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('company.dashboard.quickActions')}</h2>
                                    <div className="space-y-3">
                                        <Link to="/company/jobs"><Button className="w-full">{t('company.dashboard.postJob')}</Button></Link>
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

export default CompanyDashboardPage;