import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import type { Job, Company } from '../../types';
import { Card } from '../../components/common/Card';
import JobCard from '../../components/job/JobCard';
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM;

const CandidateDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { t, t_dynamic } = useI18n();
    const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([]);
    const [allCompanies, setAllCompanies] = useState<Company[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);
    
    const [companySearch, setCompanySearch] = useState('');
    const [companyResults, setCompanyResults] = useState<Company[]>([]);
    const [isCompanySearching, setIsCompanySearching] = useState(false);

    useEffect(() => {
        if (user) {
            api.getSuggestedJobs(user.id).then(setSuggestedJobs).finally(() => setLoadingSuggestions(false));
            api.getCompanies().then(setAllCompanies);
        }
    }, [user]);

    useEffect(() => {
        if (companySearch.trim() === '') {
            setCompanyResults([]);
            return;
        }

        setIsCompanySearching(true);
        const debounce = setTimeout(() => {
            api.getCompanies({ searchTerm: companySearch }).then(results => {
                setCompanyResults(results);
                setIsCompanySearching(false);
            });
        }, 300);

        return () => clearTimeout(debounce);
    }, [companySearch]);

    const getCompanyById = (id: string) => allCompanies.find(c => c.id === id);

    return (
        <div className="space-y-8">
            {/* Job Suggestions */}
            <section>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('candidate.dashboard.suggestedJobs')}</h1>
                <p className="text-gray-600 mb-6">{t('candidate.dashboard.suggestedForYou')}</p>
                <Card>
                    <div className="p-6">
                        {loadingSuggestions ? (
                            <p>{t('candidate.profile.loading')}</p>
                        ) : suggestedJobs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {suggestedJobs.map(job => (
                                    <JobCard key={job.id} job={job} company={getCompanyById(job.companyId)} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">{t('candidate.dashboard.noSuggestions')}</p>
                        )}
                    </div>
                </Card>
            </section>

            {/* Search by Company */}
            <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('candidate.dashboard.searchByCompany')}</h2>
                <p className="text-gray-600 mb-4">{t('candidate.dashboard.searchByCompanySubtitle')}</p>
                <Card>
                    <div className="p-6">
                        <div className="relative">
                            <input
                                type="text"
                                value={companySearch}
                                onChange={e => setCompanySearch(e.target.value)}
                                placeholder={t('candidate.dashboard.searchPlaceholder')}
                                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-primary focus:border-primary"
                            />
                            {isCompanySearching && <p className="text-sm text-gray-500 mt-2">Searching...</p>}
                            {companyResults.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                    {companyResults.map(company => (
                                        <li key={company.id}>
                                            <Link to={`/companies/${company.id}/jobs`} className="block px-4 py-2 hover:bg-gray-100">{t_dynamic(company.name)}</Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    );
};

export default CandidateDashboardPage;
