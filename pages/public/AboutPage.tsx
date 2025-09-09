import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Card } from '../../components/common/Card';
import { api } from '../../services/api';
import type { TeamMember, SiteSettings } from '../../types';
import { useI18n } from '../../contexts/I18nContext';

const AboutPage: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, t_dynamic } = useI18n();

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const [teamData, settingsData] = await Promise.all([
                api.getTeamMembers(),
                api.getSiteSettings(),
            ]);
            setTeam(teamData);
            setSettings(settingsData);
        } catch (error) {
            console.error("Failed to fetch page data", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const getValuesList = () => {
      if (!settings) return [];
      const valuesString = t_dynamic(settings.values);
      return valuesString.split('\n');
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
                    {t('about.title').split(' Ditalent')[0]} <span className="text-secondary">Ditalent</span>
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
                    {t('about.subtitle')}
                </p>
            </div>
        </div>

        {/* Mission, Vision, Values Section */}
        <div className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800">{t('about.mission')}</h2>
                        <p className="mt-4 text-lg text-gray-600">
                            {settings ? t_dynamic(settings.mission) : t('about.loading')}
                        </p>
                    </div>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800">{t('about.vision')}</h2>
                        <p className="mt-4 text-lg text-gray-600">
                            {settings ? t_dynamic(settings.vision) : t('about.loading')}
                        </p>
                    </div>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800">{t('about.values')}</h2>
                        <ul className="mt-4 text-lg text-gray-600 space-y-2">
                           {settings ? getValuesList().map((value, index) => (
                               <li key={index}>{value}</li>
                           )) : <li>{t('about.loading')}</li>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Team Section */}
        <div className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">{t('about.teamTitle')}</h2>
                {loading ? (
                    <p className="text-center">{t('about.loadingTeam')}</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {team.map(member => (
                            <Card key={member.id} className="text-center">
                                <img className="w-32 h-32 rounded-full mx-auto mt-6 object-cover" src={member.photoUrl} alt={t_dynamic(member.name)} />
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold">{t_dynamic(member.name)}</h3>
                                    <p className="text-primary">{t_dynamic(member.title)}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;