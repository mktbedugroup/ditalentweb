import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { CandidateProfile, Company, SubscriptionPlan } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useI18n } from '../../contexts/I18nContext';
import { Link } from 'react-router-dom';
import { PROFESSIONAL_AREAS } from '../../constants';

const CandidateSearchPage: React.FC = () => {
    const { user } = useAuth();
    const { t, t_dynamic } = useI18n();
    const [company, setCompany] = useState<Company | null>(null);
    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [areaFilter, setAreaFilter] = useState('');
    const [results, setResults] = useState<CandidateProfile[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            if (!user?.companyId) {
                setLoading(false);
                return;
            }
            try {
                const companyData = await api.getCompanyById(user.companyId);
                setCompany(companyData || null);
                if (companyData?.planId) {
                    const planData = await api.getSubscriptionPlanById(companyData.planId);
                    setPlan(planData || null);
                    if (planData?.features.includes('search_candidates')) {
                        setHasAccess(true);
                    }
                }
            } catch (error) {
                console.error("Failed to verify access", error);
            } finally {
                setLoading(false);
            }
        };
        checkAccess();
    }, [user]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        const searchResults = await api.searchCandidates({ searchTerm, professionalArea: areaFilter });
        setResults(searchResults);
        setIsSearching(false);
    };

    if (loading) {
        return <p>{t('company.candidateSearch.loading')}</p>;
    }

    if (!hasAccess) {
        return (
            <Card className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800">{t('company.candidateSearch.noAccessTitle')}</h1>
                <p className="mt-4 text-gray-600">{t('company.candidateSearch.noAccessBody')}</p>
                <Link to="/company/plans" className="mt-6 inline-block">
                    <Button variant="secondary">{t('company.dashboard.upgradePlan')}</Button>
                </Link>
            </Card>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('company.candidateSearch.title')}</h1>
            <p className="text-gray-600 mb-6">{t('company.candidateSearch.subtitle')}</p>
            <Card className="p-6 mb-8">
                 <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                         <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700">{t('company.candidateSearch.searchLabel')}</label>
                         <input
                            id="searchTerm"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('company.candidateSearch.searchPlaceholder')}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        />
                    </div>
                    <div>
                        <label htmlFor="areaFilter" className="block text-sm font-medium text-gray-700">{t('company.candidateSearch.areaLabel')}</label>
                        <select
                            id="areaFilter"
                            value={areaFilter}
                            onChange={(e) => setAreaFilter(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        >
                            <option value="">{t('home.allAreas')}</option>
                            {PROFESSIONAL_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                        </select>
                    </div>
                     <div className="md:col-span-3 text-right">
                        <Button type="submit" isLoading={isSearching}>{t('home.searchButton')}</Button>
                    </div>
                </form>
            </Card>
            
            {isSearching ? (
                 <p>{t('company.candidateSearch.searching')}</p>
            ) : (
                <div className="space-y-4">
                    {results.map(profile => (
                        <Card key={profile.id} className="p-4 flex items-center space-x-4">
                             <img src={profile.photoUrl} alt={profile.fullName} className="w-16 h-16 rounded-full object-cover" />
                             <div className="flex-grow">
                                <h3 className="text-lg font-bold text-primary">{profile.fullName}</h3>
                                <p className="text-gray-600">{t_dynamic(profile.headline)}</p>
                                <p className="text-sm text-gray-500">{t_dynamic(profile.location)}</p>
                             </div>
                             <div>
                                <Link to={`/company/applicants/${profile.id}/profile`}>
                                    <Button variant="light">{t('company.dashboard.viewProfile')}</Button>
                                </Link>
                             </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CandidateSearchPage;
