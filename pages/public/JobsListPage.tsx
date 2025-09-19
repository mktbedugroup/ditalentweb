
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import JobCard from '../../components/job/JobCard';
import { api } from '../../services/api';
import type { Job, Company } from '../../types';
import { useI18n } from '../../contexts/I18nContext';
import { PROFESSIONAL_AREAS } from '../../constants';
import { Pagination } from '../../components/common/Pagination';

const JOBS_PER_PAGE = 9;

const JobsListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');

  // New useEffect to update state when searchParams change
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setLocationFilter(searchParams.get('location') || '');
    setAreaFilter(searchParams.get('area') || '');
  }, [searchParams]);

  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  
  const { t, t_dynamic, locale } = useI18n();

  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const jobsResponse = await api.getJobs({
        isInternal: false,
        onlyActive: true,
        page: currentPage,
        limit: JOBS_PER_PAGE,
        searchTerm: searchParams.get('search') || '',
        location: searchParams.get('location') || '',
        professionalArea: searchParams.get('area') || '',
      });
      setJobs(jobsResponse.jobs);
      setTotalJobs(jobsResponse.total);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchParams]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  useEffect(() => {
    // Fetch all companies once
    api.getCompanies().then(setCompanies);
    
    // Fetch all jobs once to populate filters
    api.getJobs({ isInternal: false, onlyActive: true, limit: 1000 }).then(allJobsResponse => {
        if (allJobsResponse.jobs.length > 0) {
            const locations = new Set(allJobsResponse.jobs.map(job => t_dynamic(job.location)));
            setUniqueLocations(Array.from(locations).sort());
        }
    });
  }, [locale, t_dynamic]);
  
  const getCompanyById = (id: string) => companies.find(c => c.id === id);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(searchTerm, locationFilter, areaFilter);
  };

  const applyFilters = useCallback((newSearchTerm: string, newLocationFilter: string, newAreaFilter: string) => {
    setCurrentPage(1);
    const params = new URLSearchParams();
    if(newSearchTerm) params.set('search', newSearchTerm);
    if(newLocationFilter) params.set('location', newLocationFilter);
    if(newAreaFilter) params.set('area', newAreaFilter);
    setSearchParams(params);
  }, [setSearchParams]);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocation = e.target.value;
    setLocationFilter(newLocation);
    applyFilters(searchTerm, newLocation, areaFilter);
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newArea = e.target.value;
    setAreaFilter(newArea);
    applyFilters(searchTerm, locationFilter, newArea);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow">
        <div className="bg-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-gray-900 text-center">{t('jobsList.title')}</h1>
                <p className="mt-4 text-xl text-gray-500 text-center">{t('jobsList.subtitle')}</p>
                
                {/* Search and Filter Section */}
                <form onSubmit={handleSearch} className="mt-8 bg-gray-50 rounded-lg shadow p-6 flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder={t('home.searchPlaceholder')}
                        className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white text-gray-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search jobs"
                    />
                    <select
                        className="p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white text-gray-900"
                        value={locationFilter}
                        onChange={handleLocationChange}
                        aria-label="Filter by location"
                    >
                        <option value="">{t('home.allLocations')}</option>
                        {uniqueLocations.map(location => <option key={location} value={location}>{location}</option>)}
                    </select>
                    <select
                        className="p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white text-gray-900"
                        value={areaFilter}
                        onChange={handleAreaChange}
                        aria-label="Filter by area"
                    >
                        <option value="">{t('home.allAreas')}</option>
                        {PROFESSIONAL_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                    </select>
                     <button type="submit" className="px-6 py-3 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        {t('home.searchButton')}
                    </button>
                </form>
            </div>
        </div>

        {/* Job Listings Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {loading ? (
              <div className="text-center py-10">
                <p className="text-lg text-gray-600">{t('home.loadingOpportunities')}</p>
              </div>
            ) : jobs.length > 0 ? (
                <>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.map(job => (
                        <JobCard key={job.id} job={job} company={getCompanyById(job.companyId)} />
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={JOBS_PER_PAGE}
                        totalItems={totalJobs}
                    />
                </>
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow">
                 <p className="text-lg text-gray-600">{t('home.noVacanciesFound')}</p>
              </div>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobsListPage;
