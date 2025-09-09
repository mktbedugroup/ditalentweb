import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Application, Job, Company, User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ChatModal } from '../../components/common/ChatModal';
import { useI18n } from '../../contexts/I18nContext';

const statusStyles: { [key in Application['status']]: string } = {
  Submitted: 'bg-blue-100 text-blue-800',
  'In Review': 'bg-yellow-100 text-yellow-800',
  Interviewing: 'bg-purple-100 text-purple-800',
  Hired: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

const MyApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { t, t_dynamic } = useI18n();

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [appsData, jobsData, companiesData] = await Promise.all([
            api.getApplicationsByUserId(user.id),
            // FIX: api.getJobs() returns a paginated object. Use api.getAllJobs() to get the full job list.
            api.getAllJobs(),
            api.getCompanies(),
          ]);
          setApplications(appsData);
          setJobs(jobsData);
          setCompanies(companiesData);
        } catch (error) {
          console.error("Failed to fetch applications", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  const getJobDetails = (jobId: string) => jobs.find(j => j.id === jobId);
  const getCompanyDetails = (companyId: string) => companies.find(c => c.id === companyId);

  const openChat = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('candidate.applications.title')}</h1>
      {loading ? (
        <p>{t('candidate.applications.loading')}</p>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map(app => {
            const job = getJobDetails(app.jobId);
            const company = job ? getCompanyDetails(job.companyId) : undefined;
            if (!job || !company) return null;

            return (
              <Card key={app.id}>
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-primary">{t_dynamic(job.title)}</h2>
                      <p className="text-gray-700">{t_dynamic(company.name)}</p>
                      <p className="text-sm text-gray-500">{t('candidate.applications.appliedOn')} {new Date(app.appliedDate).toLocaleDateString()}</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row sm:items-center gap-4">
                      <span className={`px-3 py-1 text-sm text-center font-semibold rounded-full ${statusStyles[app.status]}`}>
                        {t(`status.${app.status}`)}
                      </span>
                      <Button variant="light" onClick={() => openChat(app.conversationId)}>{t('candidate.applications.messages')}</Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="p-6 text-center">
            <p className="text-gray-600">{t('candidate.applications.noApps')}</p>
          </div>
        </Card>
      )}

      {selectedConversationId && user && (
        <ChatModal 
          isOpen={!!selectedConversationId}
          onClose={() => setSelectedConversationId(null)}
          conversationId={selectedConversationId}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default MyApplicationsPage;
