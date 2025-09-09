import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { CandidateProfile, Company, Education, Experience, Reference, VolunteerExperience, TeachingExperience, SocialLink, Language, SiteSettings, MultilingualString } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ImageUploader } from '../../components/common/ImageUploader';
import { useI18n } from '../../contexts/I18nContext';
import { MultilingualInput, MultilingualTextarea } from '../../components/common/Multilingual';
import ProfileCompleteness from '../../components/candidate/ProfileCompleteness';
import { SocialLinksDisplay, SocialLinksManager } from '../../components/common/SocialLinks';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CandidateProfile>>({});
  const { t, t_dynamic } = useI18n();

  const fetchProfileData = useCallback(async () => {
    if (user && user.role === 'candidate') {
      setLoading(true);
      try {
        const [profileData, companiesData, settingsData] = await Promise.all([
            api.getProfileByUserId(user.id),
            api.getCompanies(),
            api.getSiteSettings()
        ]);
        setProfile(profileData || null);
        setFormData(profileData || {});
        setCompanies(companiesData);
        setSiteSettings(settingsData);
      } catch (error) {
          console.error("Failed to load profile data", error);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultilingualChange = (fieldName: keyof CandidateProfile, value: MultilingualString) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };
  
  const handleListChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const {name, value} = e.target;
      setFormData(prev => ({...prev, [name]: value.split(',').map(s => s.trim())}));
  }
  
  const handleDynamicListChange = (
    listName: keyof CandidateProfile,
    index: number,
    field: string,
    value: string | MultilingualString
  ) => {
    setFormData(prev => {
        const list = (prev[listName] as any[] | undefined) || [];
        const newList = [...list];
        newList[index] = { ...newList[index], [field]: value };
        return { ...prev, [listName]: newList };
    });
  };

  const addDynamicListItem = <T extends { id: string }>(listName: keyof CandidateProfile, newItem: T) => {
      setFormData(prev => {
          const list = (prev[listName] as unknown as T[] | undefined) || [];
          return {...prev, [listName]: [...list, newItem] };
      });
  };

  const removeDynamicListItem = (listName: keyof CandidateProfile, index: number) => {
      setFormData(prev => {
          const list = (prev[listName] as any[] | undefined) || [];
          const newList = list.filter((_, i) => i !== index);
          return { ...prev, [listName]: newList };
      });
  };

  const handleBlockedCompanyChange = (companyId: string, isChecked: boolean) => {
      setFormData(prev => {
          const currentBlocked = prev.blockedCompanyIds || [];
          if (isChecked) {
              return { ...prev, blockedCompanyIds: [...currentBlocked, companyId] };
          } else {
              return { ...prev, blockedCompanyIds: currentBlocked.filter(id => id !== companyId) };
          }
      });
  };

  const handleImageChange = (value: string) => {
    setFormData(prev => ({ ...prev, photoUrl: value }));
  };

  const handleSave = async () => {
    if (profile) {
      setLoading(true);
      const updatedProfile = { ...profile, ...formData };
      await api.saveProfile(updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      setLoading(false);
    }
  };

  if (loading && !isEditing) {
    return <p>{t('candidate.profile.loading')}</p>;
  }

  if (!profile && !loading) {
    return <p>{t('candidate.profile.notFound')}</p>;
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
  
  const renderViewMode = () => (
    <div className="p-6 space-y-8">
        <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
                <img src={profile!.photoUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                <div>
                    <h2 className="text-2xl font-bold">{profile!.fullName}</h2>
                    <p className="text-gray-600">{t_dynamic(profile!.headline)}</p>
                    <p className="text-sm text-gray-500">{t_dynamic(profile!.location)} | {profile!.educationLevel}</p>
                </div>
            </div>
            <SocialLinksDisplay links={profile!.socialLinks} />
        </div>

        <Card><div className="p-4">
            <h3 className="text-lg font-semibold border-b pb-2">{t('candidate.profile.summary')}</h3>
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{t_dynamic(profile!.summary)}</p>
        </div></Card>

        <Card><div className="p-4">
            <h3 className="text-lg font-semibold border-b pb-2">{t('candidate.profile.workLife')}</h3>
            <div className="mt-2 space-y-4">
                {profile!.workLife.map(item => renderItem(item, ['company', 'location', 'startDate', 'endDate', 'description'], t_dynamic(item.title)))}
            </div>
        </div></Card>

        <Card><div className="p-4">
            <h3 className="text-lg font-semibold border-b pb-2">{t('candidate.profile.academicLife')}</h3>
             <div className="mt-2 space-y-4">
                {profile!.academicLife.map(item => renderItem(item, ['institution', 'fieldOfStudy', 'startDate', 'endDate'], t_dynamic(item.degree)))}
            </div>
        </div></Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card><div className="p-4">
                <h3 className="text-lg font-semibold border-b pb-2">{t('candidate.profile.skillsAndCompetencies')}</h3>
                <div className="mt-2 space-y-2">
                    <p><strong>{t('candidate.profile.aptitudes')}:</strong> {profile!.skills.join(', ')}</p>
                    <p><strong>{t('candidate.profile.competencies')}:</strong> {profile!.competencies.join(', ')}</p>
                    <p><strong>{t('candidate.profile.socialSkills')}:</strong> {profile!.socialSkills.join(', ')}</p>
                </div>
            </div></Card>

             <Card><div className="p-4">
                <h3 className="text-lg font-semibold border-b pb-2">{t('candidate.profile.preferences')}</h3>
                 <div className="mt-2 space-y-2">
                    <p><strong>{t('candidate.profile.desiredSalary')}:</strong> ${profile!.desiredSalary?.toLocaleString()}</p>
                    <p><strong>{t('candidate.profile.desiredContracts')}:</strong> {profile!.desiredContractTypes.join(', ')}</p>
                </div>
            </div></Card>
        </div>
        
         <Card><div className="p-4">
            <h3 className="text-lg font-semibold border-b pb-2">{t('candidate.profile.references')}</h3>
             <div className="mt-2 space-y-4">
                {profile!.references.map(item => renderItem(item, ['type', 'company', 'phone'], item.name))}
            </div>
        </div></Card>

         <Card><div className="p-4">
            <h3 className="text-lg font-semibold border-b pb-2">{t('candidate.profile.coverLetter')}</h3>
            <p className="mt-2 text-gray-700 italic">"{t_dynamic(profile!.coverLetter)}"</p>
        </div></Card>

    </div>
  );
  
  const renderEditMode = () => (
    <div className="p-6 space-y-6">
        <Card><div className="p-4">
             <h3 className="text-lg font-semibold border-b pb-2 mb-4">{t('candidate.profile.edit.general')}</h3>
            <div className="space-y-4">
                <div><label className="block text-sm font-medium">{t('candidate.profile.edit.photo')}</label><ImageUploader initialValue={formData.photoUrl || ''} onValueChange={handleImageChange}/></div>
                <div><label className="block text-sm font-medium">{t('candidate.profile.edit.fullName')}</label><input type="text" name="fullName" value={formData.fullName || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
                <MultilingualInput label={t('candidate.profile.edit.headline')} name="headline" value={formData.headline || {es:'',en:'',fr:''}} onChange={(value) => handleMultilingualChange('headline', value)} />
                <MultilingualTextarea label={t('candidate.profile.edit.summary')} name="summary" value={formData.summary || {es:'',en:'',fr:''}} onChange={(value) => handleMultilingualChange('summary', value)} rows={5} />
                <MultilingualInput label="Location" name="location" value={formData.location || {es:'',en:'',fr:''}} onChange={(value) => handleMultilingualChange('location', value)} />
                <div><label className="block text-sm font-medium">{t('candidate.profile.edit.educationLevel')}</label>
                    <select name="educationLevel" value={formData.educationLevel} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900">
                        {siteSettings?.educationLevels.map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                </div>
            </div>
        </div></Card>
        
        <Card><div className="p-4">
            <SocialLinksManager 
                value={formData.socialLinks || []}
                onChange={(newLinks) => setFormData(prev => ({...prev, socialLinks: newLinks}))}
            />
        </div></Card>


        <Card><div className="p-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">{t('candidate.profile.edit.workLife')}</h3>
            <div className="space-y-4">
                {(formData.workLife || []).map((item, index) => (
                    <div key={item.id || index} className="p-4 border rounded-md space-y-2 relative">
                        <MultilingualInput label="Title" name="title" value={item.title} onChange={(value) => handleDynamicListChange('workLife', index, 'title', value)} />
                        <MultilingualInput label="Company" name="company" value={item.company} onChange={(value) => handleDynamicListChange('workLife', index, 'company', value)} />
                        <MultilingualInput label="Location" name="location" value={item.location} onChange={(value) => handleDynamicListChange('workLife', index, 'location', value)} />
                        <div><label className="block text-xs font-medium text-gray-500">Start Date</label><input type="date" value={item.startDate} onChange={e => handleDynamicListChange('workLife', index, 'startDate', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" /></div>
                        <div><label className="block text-xs font-medium text-gray-500">End Date</label><input type="text" value={item.endDate} onChange={e => handleDynamicListChange('workLife', index, 'endDate', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" /></div>
                        <MultilingualTextarea label="Description" name="description" value={item.description} onChange={(value) => handleDynamicListChange('workLife', index, 'description', value)} />
                         <Button type="button" variant="danger" size="sm" className="absolute top-2 right-2" onClick={() => removeDynamicListItem('workLife', index)}>&times;</Button>
                    </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => addDynamicListItem('workLife', { id: `new${Date.now()}`, title: {es:'',en:'',fr:''}, company: {es:'',en:'',fr:''}, location: {es:'',en:'',fr:''}, startDate: '', endDate: '', description: {es:'',en:'',fr:''} } as unknown as Experience)}>{t('candidate.profile.edit.add')}</Button>
            </div>
        </div></Card>

        <Card><div className="p-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">{t('candidate.profile.edit.academicLife')}</h3>
            <div className="space-y-4">
                {(formData.academicLife || []).map((item, index) => (
                    <div key={item.id || index} className="p-4 border rounded-md space-y-2 relative">
                        <MultilingualInput label="Institution" name="institution" value={item.institution} onChange={(value) => handleDynamicListChange('academicLife', index, 'institution', value)} />
                        <MultilingualInput label="Degree" name="degree" value={item.degree} onChange={(value) => handleDynamicListChange('academicLife', index, 'degree', value)} />
                        <MultilingualInput label="Field of Study" name="fieldOfStudy" value={item.fieldOfStudy} onChange={(value) => handleDynamicListChange('academicLife', index, 'fieldOfStudy', value)} />
                        <div><label className="block text-xs font-medium text-gray-500">Start Date</label><input type="date" value={item.startDate} onChange={e => handleDynamicListChange('academicLife', index, 'startDate', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" /></div>
                        <div><label className="block text-xs font-medium text-gray-500">End Date</label><input type="date" value={item.endDate} onChange={e => handleDynamicListChange('academicLife', index, 'endDate', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" /></div>
                         <Button type="button" variant="danger" size="sm" className="absolute top-2 right-2" onClick={() => removeDynamicListItem('academicLife', index)}>&times;</Button>
                    </div>
                ))}
                 <Button type="button" variant="secondary" onClick={() => addDynamicListItem('academicLife', { id: `new${Date.now()}`, institution: {es:'',en:'',fr:''}, degree: {es:'',en:'',fr:''}, fieldOfStudy: {es:'',en:'',fr:''}, startDate: '', endDate: '' } as unknown as Education)}>{t('candidate.profile.edit.add')}</Button>
            </div>
        </div></Card>
        
        <Card><div className="p-4">
             <h3 className="text-lg font-semibold border-b pb-2 mb-4">{t('candidate.profile.edit.skills')}</h3>
            <div className="space-y-4">
                <div><label className="block text-sm font-medium">{t('candidate.profile.aptitudes')} ({t('candidate.profile.edit.skillsPlaceholder')})</label><input type="text" name="skills" value={formData.skills?.join(', ') || ''} onChange={handleListChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
                <div><label className="block text-sm font-medium">{t('candidate.profile.competencies')} ({t('candidate.profile.edit.competenciesPlaceholder')})</label><input type="text" name="competencies" value={formData.competencies?.join(', ') || ''} onChange={handleListChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
                <div><label className="block text-sm font-medium">{t('candidate.profile.socialSkills')} ({t('candidate.profile.edit.socialSkillsPlaceholder')})</label><input type="text" name="socialSkills" value={formData.socialSkills?.join(', ') || ''} onChange={handleListChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
            </div>
        </div></Card>

        <Card><div className="p-4">
             <h3 className="text-lg font-semibold border-b pb-2 mb-4">{t('candidate.profile.edit.jobPreferences')}</h3>
            <div className="space-y-4">
                 <div><label className="block text-sm font-medium">{t('candidate.profile.edit.desiredSalary')}</label><input type="number" name="desiredSalary" value={formData.desiredSalary || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
                 <div><label className="block text-sm font-medium">{t('candidate.profile.desiredContracts')} ({t('candidate.profile.edit.desiredContractsPlaceholder')})</label><input type="text" name="desiredContractTypes" value={formData.desiredContractTypes?.join(', ') || ''} onChange={handleListChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
            </div>
        </div></Card>
        
        <Card><div className="p-4">
             <h3 className="text-lg font-semibold border-b pb-2 mb-4">{t('candidate.profile.edit.additionalInfo')}</h3>
            <div className="space-y-4">
                <MultilingualTextarea label={t('candidate.profile.edit.coverLetter')} name="coverLetter" value={formData.coverLetter || {es:'',en:'',fr:''}} onChange={(value) => handleMultilingualChange('coverLetter', value)} rows={5} />
            </div>
        </div></Card>

        <Card><div className="p-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">{t('candidate.profile.edit.references')}</h3>
            <div className="space-y-4">
                {(formData.references || []).map((item, index) => (
                    <div key={item.id || index} className="p-4 border rounded-md space-y-2 relative">
                        <div><label className="block text-xs font-medium text-gray-500">Name</label><input type="text" value={item.name} onChange={e => handleDynamicListChange('references', index, 'name', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" /></div>
                        <div><label className="block text-xs font-medium text-gray-500">Type (personal/professional)</label><input type="text" value={item.type} onChange={e => handleDynamicListChange('references', index, 'type', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" /></div>
                        <MultilingualInput label="Company (optional)" name="company" value={item.company || {es:'',en:'',fr:''}} onChange={value => handleDynamicListChange('references', index, 'company', value)} />
                        <div><label className="block text-xs font-medium text-gray-500">Phone</label><input type="text" value={item.phone} onChange={e => handleDynamicListChange('references', index, 'phone', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" /></div>
                         <Button type="button" variant="danger" size="sm" className="absolute top-2 right-2" onClick={() => removeDynamicListItem('references', index)}>&times;</Button>
                    </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => addDynamicListItem('references', { id: `new${Date.now()}`, name: '', type: 'professional', company: {es:'',en:'',fr:''}, phone: '' } as unknown as Reference)}>{t('candidate.profile.edit.add')}</Button>
            </div>
        </div></Card>

        <Card><div className="p-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">{t('candidate.profile.edit.blockCompanies')}</h3>
            <p className="text-sm text-gray-500 mb-2">{t('candidate.profile.edit.blockCompaniesDesc')}</p>
            <div className="space-y-2">
            {companies.map(company => (
                <div key={company.id} className="flex items-center">
                    <input
                        type="checkbox"
                        id={`company-${company.id}`}
                        checked={formData.blockedCompanyIds?.includes(company.id) || false}
                        onChange={e => handleBlockedCompanyChange(company.id, e.target.checked)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor={`company-${company.id}`} className="ml-2 text-gray-700">{t_dynamic(company.name)}</label>
                </div>
            ))}
            </div>
        </div></Card>

        <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => { setIsEditing(false); setFormData(profile!); }}>{t('candidate.profile.edit.cancel')}</Button>
            <Button onClick={handleSave} isLoading={loading}>{t('candidate.profile.edit.save')}</Button>
        </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('candidate.profile.myProfile')}</h1>
        {!isEditing && <Button onClick={() => setIsEditing(true)}>{t('candidate.profile.editProfile')}</Button>}
      </div>
      
      {profile && !isEditing && (
          <ProfileCompleteness profile={profile} />
      )}

      <Card>
        {isEditing ? renderEditMode() : renderViewMode()}
      </Card>
    </div>
  );
};

export default ProfilePage;