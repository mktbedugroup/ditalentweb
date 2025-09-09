import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import type { Application, CandidateProfile, Job } from '../../types';
import * as ReactRouterDOM from 'react-router-dom';
const { useParams, Link } = ReactRouterDOM;
import { useI18n } from '../../contexts/I18nContext';
import { ApplicantCard } from '../../components/applicants/ApplicantCard';

const StatCard: React.FC<{ title: string; count: number }> = ({ title, count }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
        <p className="text-2xl font-bold text-primary">{count}</p>
        <p className="text-sm text-gray-500">{title}</p>
    </div>
);


const JobApplicantsPage: React.FC = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const [job, setJob] = useState<Job | null>(null);
    const [applicants, setApplicants] = useState<Application[]>([]);
    const [profiles, setProfiles] = useState<Map<string, CandidateProfile>>(new Map());
    const [loading, setLoading] = useState(true);
    const { t, t_dynamic } = useI18n();
    const [draggedOverColumn, setDraggedOverColumn] = useState<Application['status'] | null>(null);

    const hiringStages: Application['status'][] = ['Submitted', 'In Review', 'Interviewing', 'Hired', 'Rejected'];

    const fetchApplicants = useCallback(async () => {
        if (!jobId) return;
        setLoading(true);
        try {
            const [jobData, applicantsData] = await Promise.all([
                api.getJobById(jobId),
                api.getApplicantsByJobId(jobId)
            ]);
            setJob(jobData || null);
            setApplicants(applicantsData);

            const profileMap = new Map<string, CandidateProfile>();
            for (const app of applicantsData) {
                const profile = await api.getProfileById(app.profileId);
                if (profile) {
                    profileMap.set(app.profileId, profile);
                }
            }
            setProfiles(profileMap);

        } catch (error) {
            console.error("Failed to fetch applicants", error);
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    const handleStatusChange = async (applicationId: string, newStatus: Application['status']) => {
        await api.updateApplicationStatus(applicationId, newStatus);
        // We do an optimistic update, but can refetch if needed
        // fetchApplicants();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: Application['status']) => {
        e.preventDefault();
        const applicationId = e.dataTransfer.getData('applicationId');
        setDraggedOverColumn(null);
        if (applicationId) {
            const movedApp = applicants.find(app => app.id === applicationId);
            if(movedApp && movedApp.status !== newStatus){
                // Optimistic UI update
                setApplicants(prev => prev.map(app => app.id === applicationId ? { ...app, status: newStatus } : app));
                // API call
                handleStatusChange(applicationId, newStatus);
            }
        }
    };
    
    const applicantsByStage = (status: Application['status']) => {
        return applicants.filter(app => app.status === status);
    };

    const stageCounts = useMemo(() => {
        return hiringStages.reduce((acc, stage) => {
            acc[stage] = applicants.filter(app => app.status === stage).length;
            return acc;
        }, {} as Record<Application['status'], number>);
    }, [applicants, hiringStages]);

    if (loading) return <p>{t('company.applicants.loading')}</p>;
    if (!job) return <p>{t('company.applicants.notFound')}</p>;

    return (
        <div>
            <Link to="/company/jobs" className="text-primary hover:underline mb-4 inline-block">&larr; {t('company.applicants.back')}</Link>
            <h1 className="text-3xl font-bold text-gray-800">{t('company.applicants.kanbanTitle')}</h1>
            <p className="text-gray-600 mb-6">{t('company.applicants.title')} {t_dynamic(job.title)} ({applicants.length} {t('company.applicants.total')})</p>

            <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {hiringStages.map(stage => (
                    <StatCard key={stage} title={t(`status.${stage}`)} count={stageCounts[stage]} />
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {hiringStages.map(stage => (
                    <div
                        key={stage}
                        onDragOver={(e) => { e.preventDefault(); setDraggedOverColumn(stage); }}
                        onDragLeave={() => setDraggedOverColumn(null)}
                        onDrop={(e) => handleDrop(e, stage)}
                        className={`p-3 rounded-lg bg-gray-100/80 transition-colors duration-300 ${draggedOverColumn === stage ? 'bg-primary/10' : ''}`}
                    >
                        <h3 className="font-bold text-gray-700 pb-2 border-b mb-4 flex justify-between items-center text-sm uppercase tracking-wider">
                            {t(`status.${stage}`)}
                            <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full" title={t('company.applicants.totalInStage')}>{applicantsByStage(stage).length}</span>
                        </h3>
                        <div className="min-h-[400px] space-y-3">
                            {applicantsByStage(stage).map(app => {
                                const profile = profiles.get(app.profileId);
                                if (!profile) return null;
                                return (
                                    <ApplicantCard
                                        key={app.id}
                                        application={app}
                                        profile={profile}
                                        linkPrefix="/company"
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobApplicantsPage;
