import React, { useState, useEffect } from 'react';
// FIX: Use namespace import for react-router-dom to resolve module export issues.
import * as ReactRouterDOM from 'react-router-dom';
const { useParams, Link, useNavigate } = ReactRouterDOM;
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Button } from '../../components/common/Button';
import { api } from '../../services/api';
import type { Job, Company } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { SocialLinksDisplay } from '../../components/common/SocialLinks';

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, t_dynamic, locale } = useI18n();
  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;
      setLoading(true);
      setError(null);
      try {
        const jobData = await api.getJobById(jobId);
        if (jobData) {
          setJob(jobData);
          const companyData = await api.getCompanyById(jobData.companyId);
          setCompany(companyData || null);

          if (user && user.role === 'candidate') {
              const applied = await api.hasUserApplied(jobId, user.id);
              setHasApplied(applied);
          }
        } else {
          setError(t('jobDetail.jobNotFound'));
        }
      } catch (e) {
        setError(t('jobDetail.fetchError'));
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [jobId, user, t]);

  const handleApply = async () => {
      if (!user) {
          navigate('/login');
          return;
      }
      if (user.role !== 'candidate' || !jobId) return;

      setIsApplying(true);
      try {
          const application = await api.applyForJob(jobId, user.id);
          if (application) {
              setHasApplied(true);
          } else {
              alert('Failed to submit application. Please try again.');
          }
      } catch (error) {
           alert('An error occurred while applying.');
      } finally {
          setIsApplying(false);
      }
  }

  const renderApplyButton = () => {
      if (user?.role === 'company' || user?.role === 'admin') {
          return null;
      }
      return (
          <Button onClick={handleApply} disabled={hasApplied || isApplying} isLoading={isApplying}>
              {hasApplied ? t('jobDetail.applied') : t('jobDetail.applyNow')}
          </Button>
      );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{t('jobDetail.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center bg-white p-10 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600">{t('jobDetail.errorTitle')}</h2>
            <p className="mt-4 text-gray-600">{error}</p>
            <Link to="/">
              <Button className="mt-6">{t('jobDetail.goBackHome')}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  if (!job) {
      return null;
  }
  
  const requirements = job.requirements[locale] || job.requirements.es;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                {job.imageUrl && <img className="w-full h-64 object-cover" src={job.imageUrl} alt={t_dynamic(job.title)} />}
                <div className="p-8">
                    <div className="sm:flex sm:items-start sm:justify-between">
                        <div className="flex items-start space-x-5">
                            {company && <img className="h-20 w-20 rounded-full" src={company.logo} alt={`${t_dynamic(company.name)} logo`} />}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{t_dynamic(job.title)}</h1>
                                <p className="text-xl font-medium text-primary mt-1">{company ? t_dynamic(company.name) : '...'}</p>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0">
                             <SocialLinksDisplay links={company?.socialLinks} />
                        </div>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center text-md text-gray-600 gap-x-6 gap-y-2">
                        <span>{t_dynamic(job.location)}</span>
                        <span className="text-gray-400">|</span>
                        <span>{job.type}</span>
                         <span className="text-gray-400">|</span>
                        <span className="font-semibold">{job.salary}</span>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-gray-800">{t('jobDetail.jobDescription')}</h2>
                        <p className="mt-3 text-gray-600 whitespace-pre-wrap">{t_dynamic(job.description)}</p>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-gray-800">{t('jobDetail.requirements')}</h2>
                        <ul className="mt-3 list-disc list-inside text-gray-600 space-y-2">
                            {requirements.map((req, index) => (
                                <li key={index}>{req}</li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="mt-10 text-center">
                        {renderApplyButton()}
                        <p className="text-xs text-gray-500 mt-2">{t('jobDetail.postedOn')} {new Date(job.postedDate).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetailPage;