import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import type { Company, MultilingualString, SocialLink, SubscriptionPlan } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ImageUploader } from '../../components/common/ImageUploader';
import { MultilingualInput, MultilingualTextarea } from '../../components/common/Multilingual';
import { useI18n } from '../../contexts/I18nContext';
import { Modal } from '../../components/common/Modal';
import { SocialLinksManager } from '../../components/common/SocialLinks';

const CompanyForm: React.FC<{ company: Partial<Company>, onSave: (data: any) => void, onCancel: () => void }> = ({ company, onSave, onCancel }) => {
    const [formData, setFormData] = useState(company);
    const { t } = useI18n();
    const employeeCountOptions = ['1-10', '11-50', '51-200', '201-500', '501+'];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <MultilingualInput
                label={t('admin.companies.form.name')}
                name="name"
                value={formData.name || { es: '', en: '', fr: '' }}
                onChange={(value) => handleMultilingualChange('name', value)}
            />
            <div>
                <label className="block text-sm font-medium">{t('admin.companies.form.logo')}</label>
                <ImageUploader 
                    initialValue={formData.logo || ''}
                    onValueChange={handleImageChange}
                />
            </div>
            <MultilingualTextarea
                label={t('admin.companies.form.description')}
                name="description"
                value={formData.description || { es: '', en: '', fr: '' }}
                onChange={(value) => handleMultilingualChange('description', value)}
                rows={4}
            />
            <div><label className="block text-sm font-medium">{t('admin.companies.form.address')}</label><input type="text" name="address" value={formData.address || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
            <div><label className="block text-sm font-medium">{t('admin.companies.form.phone')}</label><input type="text" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
            <div><label className="block text-sm font-medium">{t('admin.companies.form.rnc')}</label><input type="text" name="rnc" value={formData.rnc || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
            <div><label className="block text-sm font-medium">{t('admin.companies.form.industry')}</label><input type="text" name="industry" value={formData.industry || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
            <div>
                <label className="block text-sm font-medium">{t('admin.companies.form.employeeCount')}</label>
                <select name="employeeCount" value={formData.employeeCount} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900">
                    {employeeCountOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">{t('admin.companies.form.latitude')}</label><input type="number" step="any" name="latitude" value={formData.latitude || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
                <div><label className="block text-sm font-medium">{t('admin.companies.form.longitude')}</label><input type="number" step="any" name="longitude" value={formData.longitude || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
            </div>
            
            <div className="pt-2">
                 <SocialLinksManager value={formData.socialLinks || []} onChange={handleSocialLinksChange} />
            </div>

             <div className="flex items-center pt-2 border-t">
                <input type="checkbox" id="isRecruitmentClient" name="isRecruitmentClient" checked={!!formData.isRecruitmentClient} onChange={handleInputChange} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
                <label htmlFor="isRecruitmentClient" className="ml-2 block text-sm font-medium text-gray-900">
                    {t('admin.companies.form.isRecruitmentClient')}
                </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <Button type="button" variant="light" onClick={onCancel}>{t('admin.companies.form.cancel')}</Button>
                <Button type="submit">{t('admin.companies.form.save')}</Button>
            </div>
        </form>
    );
};

const ChangePlanModal: React.FC<{ company: Company, plans: SubscriptionPlan[], onSave: (planId: string) => void, onCancel: () => void }> = ({ company, plans, onSave, onCancel }) => {
    const [selectedPlanId, setSelectedPlanId] = useState(company.planId || '');
    const { t, t_dynamic } = useI18n();

    const handleSave = () => {
        onSave(selectedPlanId);
    };

    return (
        <div>
            <div className="mb-4">
                <label htmlFor="plan-select" className="block text-sm font-medium text-gray-700">{t('admin.companies.changePlanModal.selectPlan')}</label>
                <select 
                    id="plan-select"
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white text-gray-900"
                >
                    <option value="">{t('admin.companies.changePlanModal.noPlan')}</option>
                    {plans.map(plan => (
                        <option key={plan.id} value={plan.id}>{t_dynamic(plan.name)}</option>
                    ))}
                </select>
            </div>
            <div className="flex justify-end space-x-3">
                <Button variant="light" onClick={onCancel}>{t('admin.companies.changePlanModal.cancel')}</Button>
                <Button onClick={handleSave}>{t('admin.companies.changePlanModal.save')}</Button>
            </div>
        </div>
    );
};

const AdminCompaniesPage: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Partial<Company> | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const { t, t_dynamic } = useI18n();

    const fetchCompaniesAndPlans = useCallback(async () => {
        setLoading(true);
        try {
            const [companiesData, plansData] = await Promise.all([
                api.getCompanies(),
                api.getSubscriptionPlans()
            ]);
            setCompanies(companiesData);
            setPlans(plansData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompaniesAndPlans();
    }, [fetchCompaniesAndPlans]);

    const handleCreateNew = () => {
        setEditingCompany({ name: { es: '', en: '', fr: '' }, logo: 'https://picsum.photos/seed/new/100', description: { es: '', en: '', fr: '' }, socialLinks: [] });
        setIsModalOpen(true);
    };
    
    const handleEdit = (company: Company) => {
        setEditingCompany(company);
        setIsModalOpen(true);
    };

    const handleChangePlan = (company: Company) => {
        setSelectedCompany(company);
        setIsPlanModalOpen(true);
    };

    const handleDelete = async (companyId: string) => {
        if (window.confirm(t('admin.companies.confirmDelete'))) {
            await api.deleteCompany(companyId);
            fetchCompaniesAndPlans();
        }
    };

    const handleSave = async (companyData: Omit<Company, 'id'> & { id?: string }) => {
        await api.saveCompany(companyData);
        fetchCompaniesAndPlans();
        setIsModalOpen(false);
        setEditingCompany(null);
    };

    const handlePlanChangeSave = async (planId: string) => {
        if (selectedCompany) {
            await api.upgradeCompanyPlan(selectedCompany.id, planId);
            fetchCompaniesAndPlans();
            setIsPlanModalOpen(false);
            setSelectedCompany(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-gray-800">{t('admin.companies.title')}</h1>
                <Button onClick={handleCreateNew}>{t('admin.companies.add')}</Button>
            </div>
             {loading ? (
                <p>Loading...</p>
            ) : (
                <Card>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.companies.logo')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.companies.name')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.companies.plan')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.companies.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {companies.map(company => {
                                    const plan = plans.find(p => p.id === company.planId);
                                    return (
                                        <tr key={company.id} className="hover:bg-gray-50">
                                            <td className="p-4"><img src={company.logo} alt={t_dynamic(company.name)} className="w-10 h-10 rounded-md object-cover" /></td>
                                            <td className="p-4 font-medium">{t_dynamic(company.name)}</td>
                                            <td className="p-4 text-gray-600">{plan ? t_dynamic(plan.name) : t('admin.companies.noPlan')}</td>
                                            <td className="p-4">
                                                <div className="flex space-x-2">
                                                    <Button variant="secondary" size="sm" onClick={() => handleEdit(company)}>{t('admin.companies.edit')}</Button>
                                                    <Button variant="light" size="sm" onClick={() => handleChangePlan(company)}>{t('admin.companies.changePlan')}</Button>
                                                    <Button variant="danger" size="sm" onClick={() => handleDelete(company.id)}>{t('admin.companies.delete')}</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden">
                        <div className="p-4 space-y-4">
                            {companies.map(company => {
                                const plan = plans.find(p => p.id === company.planId);
                                return (
                                    <Card key={company.id} className="p-4 border">
                                        <div className="flex items-center space-x-4">
                                            <img src={company.logo} alt={t_dynamic(company.name)} className="w-12 h-12 rounded-md object-cover" />
                                            <div>
                                                <h3 className="font-bold text-lg flex-1">{t_dynamic(company.name)}</h3>
                                                <p className="text-sm text-gray-500">{t('admin.companies.plan')}: {plan ? t_dynamic(plan.name) : t('admin.companies.noPlan')}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-2 border-t flex justify-end space-x-2">
                                            <Button variant="secondary" size="sm" onClick={() => handleEdit(company)}>{t('admin.companies.edit')}</Button>
                                            <Button variant="light" size="sm" onClick={() => handleChangePlan(company)}>{t('admin.companies.changePlan')}</Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(company.id)}>{t('admin.companies.delete')}</Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            )}

            {editingCompany && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCompany.id ? t('admin.companies.modalEditTitle') : t('admin.companies.modalCreateTitle')}>
                    <CompanyForm company={editingCompany} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}

            {isPlanModalOpen && selectedCompany && (
                <Modal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} title={`${t('admin.companies.changePlanModal.title')} - ${t_dynamic(selectedCompany.name)}`}>
                    <ChangePlanModal company={selectedCompany} plans={plans} onSave={handlePlanChangeSave} onCancel={() => setIsPlanModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

export default AdminCompaniesPage;
