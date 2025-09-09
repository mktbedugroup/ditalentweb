import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useParams } = ReactRouterDOM;
import { api } from '../../services/api';
import type { Company, Job } from '../../types';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import JobCard from '../../components/job/JobCard';
import { useI18n } from '../../contexts/I18nContext';
import { SocialLinksDisplay } from '../../components/common/SocialLinks';

const CompanyJobsPublicPage: React.FC = () => {
    const { companyId } = useParams<{ companyId: string }>();
    const { t, t_dynamic } = useI18n();
    const [company, setCompany] = useState<Company | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (companyId) {
            setLoading(true);
            Promise.all([
                api.getCompanyById(companyId),
                api.getJobs({ companyId, onlyActive: true, isInternal: false })
            ]).then(([companyData, jobsResponse]) => {
                setCompany(companyData || null);
                setJobs(jobsResponse.jobs);
            }).catch(console.error)
            .finally(() => setLoading(false));
        }
    }, [companyId]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
    }

    if (!company) {
        return <div className="flex justify-center items-center h-screen"><p>Company not found.</p></div>;
    }
    
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow">
                {/* Company Header */}
                <div className="bg-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <img src={company.logo} alt={`${t_dynamic(company.name)} logo`} className="w-32 h-32 rounded-lg object-cover shadow-md flex-shrink-0" />
                            <div className="flex-grow">
                                <h1 className="text-4xl font-extrabold text-gray-900">{`${t('publicCompanyJobs.jobsAt')} ${t_dynamic(company.name)}`}</h1>
                                <p className="mt-4 text-lg text-gray-600">{t_dynamic(company.description)}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <SocialLinksDisplay links={company.socialLinks} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Job Listings */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                     {jobs.length > 0 ? (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {jobs.map(job => (
                                <JobCard key={job.id} job={job} company={company} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white rounded-lg shadow">
                            <p className="text-lg text-gray-600">{t('publicCompanyJobs.noJobs')}</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CompanyJobsPublicPage;