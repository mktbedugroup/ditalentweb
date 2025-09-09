import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useParams, Link } = ReactRouterDOM;
import { api } from '../../services/api';
import type { CandidateProfile, MultilingualString } from '../../types';
import { Card } from '../../components/common/Card';
import { useI18n } from '../../contexts/I18nContext';

const ViewCandidateProfilePage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { t_dynamic } = useI18n();

  useEffect(() => {
    if (profileId) {
      const fetchProfile = async () => {
        setLoading(true);
        const profileData = await api.getProfileById(profileId);
        setProfile(profileData || null);
        setLoading(false);
      };
      fetchProfile();
    }
  }, [profileId]);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!profile) {
    return <p>Could not load profile.</p>;
  }

  const renderItem = <T extends {}>(item: T, fields: (keyof T)[], title: string) => {
    return (
        <div className="border-l-4 border-indigo-500 pl-4 py-2">
            <h4 className="font-bold">{title}</h4>
            {fields.map(field => {
                const value = item[field as keyof T];
                const displayValue = (typeof value === 'object' && value !== null && 'es' in value) 
                    ? t_dynamic(value as unknown as MultilingualString) 
                    : String(value);

                 return <p key={String(field)} className="text-gray-600 text-sm"><span className="capitalize font-medium">{String(field).replace(/([A-Z])/g, ' $1')}:</span> {displayValue}</p>
            })}
        </div>
    );
  };

  return (
    <div>
      <button onClick={() => window.history.back()} className="text-indigo-600 hover:underline mb-4 inline-block">&larr; Back to Applicants</button>
      <Card>
        <div className="p-6 space-y-8">
            <div className="flex items-center space-x-4">
                <img src={profile.photoUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{profile.fullName}</h1>
                    <p className="text-gray-600 text-lg">{t_dynamic(profile.headline)}</p>
                    <p className="text-sm text-gray-500">{t_dynamic(profile.location)} | {profile.educationLevel}</p>
                </div>
            </div>

            <Card><div className="p-4">
                <h3 className="text-lg font-semibold border-b pb-2">Summary</h3>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">{t_dynamic(profile.summary)}</p>
            </div></Card>

            <Card><div className="p-4">
                <h3 className="text-lg font-semibold border-b pb-2">Vida Laboral</h3>
                <div className="mt-2 space-y-4">
                    {profile.workLife.map(item => renderItem(item, ['company', 'location', 'startDate', 'endDate', 'description'], t_dynamic(item.title)))}
                </div>
            </div></Card>

            <Card><div className="p-4">
                <h3 className="text-lg font-semibold border-b pb-2">Vida Académica</h3>
                <div className="mt-2 space-y-4">
                    {profile.academicLife.map(item => renderItem(item, ['institution', 'fieldOfStudy', 'startDate', 'endDate'], t_dynamic(item.degree)))}
                </div>
            </div></Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card><div className="p-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Habilidades y Competencias</h3>
                    <div className="mt-2 space-y-2">
                        <p><strong>Aptitudes:</strong> {profile.skills.join(', ')}</p>
                        <p><strong>Competencias:</strong> {profile.competencies.join(', ')}</p>
                        <p><strong>Habilidades Sociales:</strong> {profile.socialSkills.join(', ')}</p>
                    </div>
                </div></Card>

                <Card><div className="p-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Preferencias</h3>
                    <div className="mt-2 space-y-2">
                        <p><strong>Sueldo Deseado:</strong> ${profile.desiredSalary?.toLocaleString()}</p>
                        <p><strong>Contratos deseados:</strong> {profile.desiredContractTypes.join(', ')}</p>
                    </div>
                </div></Card>
            </div>
            
            <Card><div className="p-4">
                <h3 className="text-lg font-semibold border-b pb-2">Referencias</h3>
                <div className="mt-2 space-y-4">
                    {profile.references.map(item => renderItem(item, ['type', 'company', 'phone'], item.name))}
                </div>
            </div></Card>

            <Card><div className="p-4">
                <h3 className="text-lg font-semibold border-b pb-2">Carta de Presentación</h3>
                <p className="mt-2 text-gray-700 italic">"{t_dynamic(profile.coverLetter)}"</p>
            </div></Card>
        </div>
      </Card>
    </div>
  );
};

export default ViewCandidateProfilePage;