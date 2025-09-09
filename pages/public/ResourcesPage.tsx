import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { api } from '../../services/api';
import type { Resource } from '../../types';
import { useI18n } from '../../contexts/I18nContext';

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
    const { t, t_dynamic } = useI18n();
    return (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800">{t_dynamic(resource.title)}</h3>
            <p className="mt-2 text-gray-600">{t_dynamic(resource.description)}</p>
            <a 
                href={resource.fileUrl} 
                download 
                className="mt-4 inline-flex items-center text-primary hover:text-primary-700 font-medium"
            >
                {t('resources.download')}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            </a>
        </div>
    );
};

const ResourcesPage: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useI18n();

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const data = await api.getResources();
                setResources(data);
            } catch (error) {
                console.error("Failed to fetch resources", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">{t('resources.title')}</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            {t('resources.subtitle')}
          </p>
        </div>

        {loading ? (
            <p className="text-center">{t('resources.loading')}</p>
        ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {resources.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                ))}
            </div>
        ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow">
                <p className="text-lg text-gray-600">{t('resources.noResources')}</p>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ResourcesPage;