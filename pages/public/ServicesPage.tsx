import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Card } from '../../components/common/Card';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Service } from '../../types';
import { useI18n } from '../../contexts/I18nContext';

const ServiceDetailCard: React.FC<{ title: string, description: string, icon: React.ReactNode }> = ({ title, description, icon }) => (
    <Card className="p-8">
        <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-primary text-white">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            </div>
        </div>
        <p className="mt-4 text-gray-600">{description}</p>
    </Card>
);

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const { t, t_dynamic } = useI18n();

  useEffect(() => {
    const fetchServices = async () => {
        try {
            const data = await api.getServices();
            setServices(data);
        } catch (error) {
            console.error("Failed to fetch services", error);
        } finally {
            setLoading(false);
        }
    };
    fetchServices();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.subscribeToNewsletter(newsletterEmail);
      setNewsletterMessage(t('services.newsletterSuccess'));
      setNewsletterEmail('');
    } catch (error: any) {
      console.error('Failed to subscribe to newsletter:', error);
      setNewsletterMessage(error.message || t('services.newsletterError'));
    }
  };

  const icons = [
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5 5 0 019 10a5 5 0 014.242 2.158M12 4.354V10m0 0l-3.75-3.75M12 10l3.75-3.75" /></svg>,
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.5M17 18h-1m-1 0h-1m-1 0h-1m-1 0h-1m-1 0h-1" /></svg>
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow">
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
                    {t('services.title').split(' ')[0]} <span className="text-secondary">{t('services.title').split(' ')[1]}</span>
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
                    {t('services.subtitle')}
                </p>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                    {t('services.heroDescription')}
                </p>
                <div className="mt-8 flex justify-center">
                    <Link to="/contact" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark">
                        {t('services.requestServiceCta')}
                    </Link>
                </div>
            </div>
        </div>

        <div className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <p className="text-center">{t('services.loading')}</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <ServiceDetailCard 
                                key={service.id} 
                                title={t_dynamic(service.title)} 
                                description={t_dynamic(service.description)} 
                                icon={icons[index % icons.length]} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="bg-gray-100 py-16">
            <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">{t('services.newsletterTitle')}</h2>
                <p className="mt-4 text-lg text-gray-600">{t('services.newsletterSubtitle')}</p>
                <form onSubmit={handleNewsletterSubmit} className="mt-8 flex flex-col sm:flex-row sm:justify-center">
                    <input
                        type="email"
                        placeholder={t('services.newsletterPlaceholder')}
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="w-full sm:w-auto px-5 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:max-w-xs"
                        required
                    />
                    <button
                        type="submit"
                        className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-secondary hover:bg-secondary-dark"
                    >
                        {t('services.newsletterCta')}
                    </button>
                </form>
                {newsletterMessage && <p className="mt-4 text-sm text-gray-600">{newsletterMessage}</p>}
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;