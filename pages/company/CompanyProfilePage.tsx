import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { Company, MultilingualString, SocialLink } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ImageUploader } from '../../components/common/ImageUploader';
import { MultilingualInput, MultilingualTextarea } from '../../components/common/Multilingual';
import { useI18n } from '../../contexts/I18nContext';
import { SocialLinksManager } from '../../components/common/SocialLinks';

const CompanyProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});
  const { t } = useI18n();
  const employeeCountOptions = ['1-10', '11-50', '51-200', '201-500', '501+'];

  useEffect(() => {
    if (user && user.role === 'company') {
      const fetchProfile = async () => {
        setLoading(true);
        const companyData = await api.getCompanyByUserId(user.id);
        setCompany(companyData || null);
        setFormData(companyData || {});
        setLoading(false);
      };
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultilingualChange = (fieldName: keyof Company, value: MultilingualString) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleImageChange = (value: string) => {
    setFormData(prev => ({ ...prev, logo: value }));
  };

  const handleSocialLinksChange = (newLinks: SocialLink[]) => {
    setFormData(prev => ({ ...prev, socialLinks: newLinks }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (company) {
      setSaving(true);
      const updatedCompany = { ...company, ...formData };
      const savedData = await api.saveCompany(updatedCompany);
      setCompany(savedData);
      setFormData(savedData);
      setSaving(false);
    }
  };

  if (loading) {
    return <p>{t('company.profile.loading')}</p>;
  }

  if (!company) {
    return <p>{t('company.profile.notFound')}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('company.profile.title')}</h1>
      <Card>
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium">{t('company.profile.logo')}</label>
            <ImageUploader 
              initialValue={formData.logo || ''}
              onValueChange={handleImageChange}
            />
          </div>
          <MultilingualInput
              label={t('company.profile.name')}
              name="name"
              value={formData.name || { es: '', en: '', fr: '' }}
              onChange={(value) => handleMultilingualChange('name', value)}
          />
          <MultilingualTextarea
              label={t('company.profile.description')}
              name="description"
              value={formData.description || { es: '', en: '', fr: '' }}
              onChange={(value) => handleMultilingualChange('description', value)}
              rows={5}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div><label className="block text-sm font-medium">{t('company.profile.address')}</label><input type="text" name="address" value={formData.address || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
            <div><label className="block text-sm font-medium">{t('company.profile.phone')}</label><input type="text" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
            <div><label className="block text-sm font-medium">{t('company.profile.rnc')}</label><input type="text" name="rnc" value={formData.rnc || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
            <div><label className="block text-sm font-medium">{t('company.profile.industry')}</label><input type="text" name="industry" value={formData.industry || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
            <div>
                <label className="block text-sm font-medium">{t('company.profile.employeeCount')}</label>
                <select name="employeeCount" value={formData.employeeCount} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900">
                    {employeeCountOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
            <div></div> {/* Spacer */}
            <div><label className="block text-sm font-medium">{t('admin.companies.form.latitude')}</label><input type="number" step="any" name="latitude" value={formData.latitude || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
            <div><label className="block text-sm font-medium">{t('admin.companies.form.longitude')}</label><input type="number" step="any" name="longitude" value={formData.longitude || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
          </div>
          
           <div className="pt-4 border-t">
             <SocialLinksManager value={formData.socialLinks || []} onChange={handleSocialLinksChange} />
          </div>

          <div className="flex justify-end pt-4 border-t">
              <Button type="submit" isLoading={saving}>{t('company.profile.save')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CompanyProfilePage;