import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import type { Job, User, Application } from '../../types';
import { Card } from '../../components/common/Card';
import { useI18n } from '../../contexts/I18nContext';

// Add type definition for Chart.js to avoid TypeScript errors
declare const Chart: any;

const StatCard: React.FC<{ title: string; value: number }> = ({ title, value }) => (
    <Card className="text-center p-4">
        <p className="text-3xl font-bold text-primary">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
    </Card>
);

const AdminAnalyticsPage: React.FC = () => {
    const [stats, setStats] = useState({ jobs: 0, companies: 0, candidates: 0, applications: 0 });
    const [loading, setLoading] = useState(true);
    const { t } = useI18n();
    
    const jobsByAreaChartRef = useRef<HTMLCanvasElement>(null);
    const userRolesChartRef = useRef<HTMLCanvasElement>(null);
    const appStatusChartRef = useRef<HTMLCanvasElement>(null);
    const chartInstances = useRef<{ [key: string]: any }>({});

    useEffect(() => {
        const fetchDataAndRenderCharts = async () => {
            setLoading(true);
            try {
                const [jobsData, usersData, appsData] = await Promise.all([
                    api.getAllJobs(),
                    api.getUsers(),
                    api.getAllApplications(),
                ]);

                // Set overall stats
                const companyCount = usersData.filter(u => u.role === 'company').length;
                const candidateCount = usersData.filter(u => u.role === 'candidate').length;
                setStats({
                    jobs: jobsData.length,
                    companies: companyCount,
                    candidates: candidateCount,
                    applications: appsData.length,
                });
                
                // Destroy previous charts if they exist
                Object.values(chartInstances.current).forEach(chart => chart.destroy());

                // Process and render Jobs by Professional Area Chart
                if (jobsByAreaChartRef.current) {
                    const jobsByArea: { [key: string]: number } = {};
                    jobsData.forEach(job => {
                        jobsByArea[job.professionalArea] = (jobsByArea[job.professionalArea] || 0) + 1;
                    });
                    const sortedAreas = Object.entries(jobsByArea).sort((a, b) => b[1] - a[1]).slice(0, 10);
                    chartInstances.current.jobsByArea = new Chart(jobsByAreaChartRef.current, {
                        type: 'bar',
                        data: {
                            labels: sortedAreas.map(item => item[0]),
                            datasets: [{
                                label: t('admin.analytics.jobsByArea'),
                                data: sortedAreas.map(item => item[1]),
                                backgroundColor: 'rgba(27, 53, 93, 0.7)',
                            }]
                        },
                        options: { indexAxis: 'y', responsive: true }
                    });
                }
                
                // Process and render User Roles Chart
                if (userRolesChartRef.current) {
                     const userRoles = { 'Admin': 0, 'Company': 0, 'Candidate': 0 };
                     usersData.forEach(user => {
                         if (user.role === 'admin') userRoles.Admin++;
                         if (user.role === 'company') userRoles.Company++;
                         if (user.role === 'candidate') userRoles.Candidate++;
                     });
                     chartInstances.current.userRoles = new Chart(userRolesChartRef.current, {
                         type: 'doughnut',
                         data: {
                             labels: Object.keys(userRoles),
                             datasets: [{
                                 data: Object.values(userRoles),
                                 backgroundColor: ['#ff6b00', '#1b355d', '#7b9dff']
                             }]
                         },
                         options: { responsive: true, plugins: { legend: { position: 'top' } } }
                     });
                }

                // Process and render Application Status Chart
                if (appStatusChartRef.current) {
                    const appStatus: { [key: string]: number } = {};
                    appsData.forEach(app => {
                        appStatus[app.status] = (appStatus[app.status] || 0) + 1;
                    });
                     chartInstances.current.appStatus = new Chart(appStatusChartRef.current, {
                         type: 'pie',
                         data: {
                             labels: Object.keys(appStatus).map(s => t(`status.${s}`)),
                             datasets: [{
                                 data: Object.values(appStatus),
                                  backgroundColor: ['#c7d9ff', '#a3beff', '#7b9dff', '#3b66f8', '#ffbb80']
                             }]
                         },
                          options: { responsive: true, plugins: { legend: { position: 'top' } } }
                     });
                }

            } catch (error) {
                console.error("Failed to fetch analytics data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDataAndRenderCharts();
        
        // Cleanup function
        return () => {
             Object.values(chartInstances.current).forEach(chart => chart.destroy());
        }

    }, [t]);

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">{t('admin.analytics.title')}</h1>
            {loading ? (
                <p>{t('admin.analytics.loading')}</p>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title={t('admin.analytics.totalJobs')} value={stats.jobs} />
                        <StatCard title={t('admin.analytics.totalCompanies')} value={stats.companies} />
                        <StatCard title={t('admin.analytics.totalCandidates')} value={stats.candidates} />
                        <StatCard title={t('admin.analytics.totalApplications')} value={stats.applications} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-5">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">{t('admin.analytics.userRoles')}</h2>
                            <canvas ref={userRolesChartRef}></canvas>
                        </Card>
                        <Card className="p-5">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">{t('admin.analytics.applicationStatus')}</h2>
                             <canvas ref={appStatusChartRef}></canvas>
                        </Card>
                    </div>

                    <Card className="p-5">
                         <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">{t('admin.analytics.top10Areas')}</h2>
                         <canvas ref={jobsByAreaChartRef}></canvas>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminAnalyticsPage;