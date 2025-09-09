
import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import JobCard from '../../components/job/JobCard';
import { api } from '../../services/api';
import type { Job, Company, SiteSettings } from '../../types';
import { Button } from '../../components/common/Button';
import CVUploadModal from '../../components/cv/CVUploadModal';
import { useI18n } from '../../contexts/I18nContext';

const CareerPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ditalentCompany, setDitalentCompany] = useState<Company | undefined>();
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const { t, t_dynamic } = useI18n();

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const [jobsResponse, companiesData, settingsData] = await Promise.all([
                api.getJobs({ isInternal: true, onlyActive: true }),
                api.getCompanies(),
                api.getSiteSettings()
            ]);
            setJobs(jobsResponse.jobs);
            setDitalentCompany(companiesData.find(c => c.id === 'c-ditalent'));
            setSettings(settingsData);
        } catch (error) {
            console.error("Failed to fetch career data", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const handleCvSubmit = async (data: { name: string, email: string, cvBase64: string, fileName: string }) => {
      try {
          await api.saveCvSubmission(data);
          setIsCvModalOpen(false);
          setSubmissionMessage(t('careers.cvReceived'));
          setTimeout(() => setSubmissionMessage(''), 5000);
      } catch (error) {
          console.error("CV Submission failed", error);
          alert(t('careers.cvSubmitError'));
      }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow">
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
                    {settings.careersPageTitle ? t_dynamic(settings.careersPageTitle) : t('careers.pageTitle')}
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
                    {settings.careersPageSubtitle ? t_dynamic(settings.careersPageSubtitle) : '...'}
                </p>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">{t('home.recentVacancies')}</h2>
            {loading ? (
                <p className="text-center">{t('careers.loadingVacancies')}</p>
            ) : jobs.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2">
                    {jobs.map(job => (
                        <JobCard key={job.id} job={job} company={ditalentCompany} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <p className="text-lg text-gray-600">{t('careers.noVacancies')}</p>
                </div>
            )}
             <div className="mt-12 bg-primary/5 p-8 rounded-lg text-center">
                <h3 className="text-xl font-semibold text-gray-800">{settings.careersPageCtaTitle ? t_dynamic(settings.careersPageCtaTitle) : t('careers.noVacancyForYou')}</h3>
                <p className="mt-2 text-gray-600">{settings.careersPageCtaText ? t_dynamic(settings.careersPageCtaText) : ''}</p>
                <Button onClick={() => setIsCvModalOpen(true)} className="mt-4">
                    {t('careers.sendCV')}
                </Button>
                 {submissionMessage && <p className="mt-4 text-green-600 font-semibold">{submissionMessage}</p>}
            </div>
        </div>
      </main>
      <Footer />
      <CVUploadModal 
        isOpen={isCvModalOpen}
        onClose={() => setIsCvModalOpen(false)}
        onSubmit={handleCvSubmit}
      />
    </div>
  );
};

export default CareerPage;
