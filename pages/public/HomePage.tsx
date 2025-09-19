
import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import JobCard from '../../components/job/JobCard';
import { api } from '../../services/api';
import type { Job, Company, Service, Testimonial, User, Banner } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { PROFESSIONAL_AREAS } from '../../constants';
import { BannerCarousel } from '../../components/common/BannerCarousel';


const ServiceCard: React.FC<{icon: React.ReactNode, title: string, children: React.ReactNode}> = ({icon, title, children}) => (
    <Card className="text-center p-6">
        <div className="flex justify-center items-center h-16 w-16 rounded-full bg-secondary/10 text-secondary mx-auto">
            {icon}
        </div>
        <h3 className="mt-4 text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-gray-600">{children}</p>
    </Card>
);

const TestimonialCard: React.FC<{quote: string, author: string, company: string}> = ({quote, author, company}) => (
    <Card className="p-6">
        <p className="text-gray-700 italic">"{quote}"</p>
        <p className="mt-4 font-semibold text-right">- {author}, <span className="text-primary">{company}</span></p>
    </Card>
)

const HomePage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, t_dynamic, locale } = useI18n();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobsResponse, companiesData, servicesData, testimonialsData, bannersData, allJobsResponse] = await Promise.all([
          api.getJobs({ isInternal: false, onlyActive: true, page: 1, limit: 6 }),
          api.getCompanies(),
          api.getServices(),
          api.getTestimonials(),
          api.getBannersByLocation('homepage'),
          api.getJobs({ isInternal: false, onlyActive: true }),
        ]);
        setJobs(jobsResponse.jobs); 
        setCompanies(companiesData);
        setServices(servicesData);
        setTestimonials(testimonialsData);
        if (bannersData.length > 0) {
            setBanner(bannersData[0]);
        }
         if (allJobsResponse.jobs.length > 0) {
            const locations = new Set(allJobsResponse.jobs.map(job => t_dynamic(job.location)));
            setUniqueLocations(Array.from(locations).sort());
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [locale, t_dynamic]);

  const getCompanyById = (id: string) => companies.find(c => c.id === id);

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      navigate(`/jobs?search=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(locationFilter)}&area=${encodeURIComponent(areaFilter)}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section with integrated Search */}
        <div className="relative">
            {banner ? <BannerCarousel banner={banner} /> : <div style={{ height: '600px' }} className="bg-primary"></div>}
          
          {/* Search and Filter Section */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-full max-w-5xl px-4 z-20">
            <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-4">
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
                onChange={(e) => setLocationFilter(e.target.value)}
                aria-label="Filter by location"
              >
                <option value="">{t('home.allLocations')}</option>
                {uniqueLocations.map(location => <option key={location} value={location}>{location}</option>)}
              </select>
              <select
                className="p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white text-gray-900"
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                aria-label="Filter by area"
              >
                <option value="">{t('home.allAreas')}</option>
                {PROFESSIONAL_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
              </select>
              <Button type="submit" className="md:px-8">{t('home.searchButton')}</Button>
            </form>
          </div>
        </div>

        {/* Job Listings Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
           <h2 className="text-3xl font-bold text-center mb-8">{t('home.recentVacancies')} (v2)</h2>
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
                    <div className="text-center mt-12">
                        <Link to="/jobs">
                            <Button variant="secondary">{t('home.viewAllJobs')}</Button>
                        </Link>
                    </div>
              </>
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow">
                 <p className="text-lg text-gray-600">{t('home.noVacanciesFound')}</p>
              </div>
            )}
        </div>

        {/* Services Section */}
        <div className="bg-gray-50 mt-16 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12">{t('home.mainServices')}</h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {services.slice(0,3).map(service => (
                        <ServiceCard key={service.id} title={t_dynamic(service.title)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}>
                            {t_dynamic(service.description)}
                        </ServiceCard>
                    ))}
                </div>
            </div>
        </div>

        {/* Testimonials Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
            <h2 className="text-3xl font-bold text-center mb-12">{t('home.whatClientsSay')}</h2>
            <div className="grid gap-8 md:grid-cols-2">
                {testimonials.map(testimonial => (
                    <TestimonialCard 
                      key={testimonial.id} 
                      quote={t_dynamic(testimonial.quote)} 
                      author={t_dynamic(testimonial.author)}
                      company={t_dynamic(testimonial.company)}
                    />
                ))}
            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
