import React from 'react';
import type { Job, Company } from '../../types';
import { Card } from '../common/Card';
import { useI18n } from '../../contexts/I18nContext';
// FIX: Use namespace import for react-router-dom to resolve module export issues.
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM;

interface JobCardProps {
  job: Job;
  company?: Company;
}

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const JobCard: React.FC<JobCardProps> = ({ job, company }) => {
  const { t_dynamic } = useI18n();

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
        {job.imageUrl && <img src={job.imageUrl} alt={t_dynamic(job.title)} className="h-40 w-full object-cover" />}
        <div className="p-6 flex-grow flex flex-col">
            <div className="flex items-start space-x-4">
                {company && <img src={company.logo} alt={`${t_dynamic(company.name)} logo`} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />}
                <div className="flex-1">
                    <p className="text-sm font-medium text-secondary">{company ? t_dynamic(company.name) : '...'}</p>
                    <Link to={`/jobs/${job.id}`} className="block mt-1">
                        <p className="text-xl font-semibold text-gray-900 hover:text-primary">{t_dynamic(job.title)}</p>
                    </Link>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-grow">{t_dynamic(job.description)}</p>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center text-sm text-gray-600 gap-x-4 gap-y-2 pt-4 border-t">
                <div className="flex items-center">
                   <LocationIcon/>
                    {t_dynamic(job.location)}
                </div>
                <div className="flex items-center">
                    <ClockIcon />
                    {job.type}
                </div>
                 <span className="font-semibold">{job.salary}</span>
            </div>
        </div>
    </Card>
  );
};

export default JobCard;