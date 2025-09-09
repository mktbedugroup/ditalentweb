import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import type { SubscriptionPlan, MultilingualString } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { MultilingualInput, MultilingualTextarea } from '../../components/common/Multilingual';
import { useI18n } from '../../contexts/I18nContext';

const PlanForm: React.FC<{ plan: Partial<SubscriptionPlan>, onSave: (data: any) => void, onCancel: () => void }> = ({ plan, onSave, onCancel }) => {
    const [formData, setFormData] = useState(plan);
    const { t } = useI18n();

    const handleMultilingualChange = (fieldName: keyof SubscriptionPlan, value: MultilingualString) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
         if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (['price', 'jobPostingsLimit', 'durationValue'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleFeatureChange = (feature: 'search_candidates', isChecked: boolean) => {
        setFormData(prev => {
            const currentFeatures = prev.features || [];
            if (isChecked) {
                return { ...prev, features: [...currentFeatures, feature] };
            } else {
                return { ...prev, features: currentFeatures.filter(f => f !== feature) };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <MultilingualInput label={t('admin.plans.form.name')} name="name" value={formData.name || { es: '', en: '', fr: '' }} onChange={value => handleMultilingualChange('name', value)} />
            <MultilingualTextarea label={t('admin.plans.form.description')} name="description" value={formData.description || { es: '', en: '', fr: '' }} onChange={value => handleMultilingualChange('description', value)} rows={3}/>
            
            <div><label className="block text-sm font-medium">{t('admin.plans.form.type')}</label><select name="type" value={formData.type} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"><option value="subscription">Subscription</option><option value="package">Package</option></select></div>
            
            {formData.type === 'subscription' && (
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                    <h3 className="col-span-2 text-sm font-medium">{t('admin.plans.form.duration')}</h3>
                    <div><label className="block text-xs">{t('admin.plans.form.value')}</label><input type="number" name="durationValue" value={formData.durationValue || 1} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
                    <div><label className="block text-xs">{t('admin.plans.form.unit')}</label><select name="durationUnit" value={formData.durationUnit} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"><option value="week">Week(s)</option><option value="month">Month(s)</option><option value="year">Year(s)</option></select></div>
                </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">{t('admin.plans.form.price')}</label><input type="number" name="price" value={formData.price || 0} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
                <div><label className="block text-sm font-medium">{t('admin.plans.form.currency')}</label><select name="currency" value={formData.currency || 'DOP'} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"><option value="DOP">DOP</option></select></div>
            </div>
            <div><label className="block text-sm font-medium">{t('admin.plans.form.postLimit')}</label><input type="number" name="jobPostingsLimit" value={formData.jobPostingsLimit ?? 0} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
            
            <div>
                 <label className="block text-sm font-medium">{t('admin.plans.form.features')}</label>
                 <div className="mt-2 p-3 border rounded-md space-y-2">
                    <div className="flex items-center"><input type="checkbox" id="search_candidates" checked={!!formData.features?.includes('search_candidates')} onChange={e => handleFeatureChange('search_candidates', e.target.checked)} className="h-4 w-4" /><label htmlFor="search_candidates" className="ml-2 text-sm">{t('features.search_candidates')}</label></div>
                 </div>
            </div>

             <div className="flex items-center space-x-4">
                <div className="flex items-center"><input type="checkbox" id="isActive" name="isActive" checked={!!formData.isActive} onChange={handleChange} className="h-4 w-4" /><label htmlFor="isActive" className="ml-2 text-sm">{t('admin.plans.form.isActive')}</label></div>
                <div className="flex items-center"><input type="checkbox" id="isFeatured" name="isFeatured" checked={!!formData.isFeatured} onChange={handleChange} className="h-4 w-4" /><label htmlFor="isFeatured" className="ml-2 text-sm">{t('admin.plans.form.isFeatured')}</label></div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <Button type="button" variant="light" onClick={onCancel}>{t('admin.plans.form.cancel')}</Button>
                <Button type="submit">{t('admin.plans.form.save')}</Button>
            </div>
        </form>
    );
};

const AdminPlansPage: React.FC = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan> | null>(null);
    const { t, t_dynamic } = useI18n();

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getSubscriptionPlans();
            setPlans(data);
        } catch (error) {
            console.error("Failed to fetch plans", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleCreateNew = () => {
        setEditingPlan({ name: { es: '', en: '', fr: '' }, description: { es: '', en: '', fr: '' }, price: 0, currency: 'DOP', type: 'subscription', durationUnit: 'month', durationValue: 1, jobPostingsLimit: 1, features: [], isActive: true, isFeatured: false });
        setIsModalOpen(true);
    };
    
    const handleEdit = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('admin.plans.confirmDelete'))) {
            await api.deleteSubscriptionPlan(id);
            fetchPlans();
        }
    };

    const handleSave = async (data: Omit<SubscriptionPlan, 'id'> & { id?: string }) => {
        await api.saveSubscriptionPlan(data);
        fetchPlans();
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-gray-800">{t('admin.plans.title')}</h1>
                <Button onClick={handleCreateNew}>{t('admin.plans.add')}</Button>
            </div>
             {loading ? (
                <p>Loading...</p>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.plans.name')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.plans.price')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.plans.limit')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.plans.status')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.plans.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {plans.map(plan => (
                                    <tr key={plan.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{t_dynamic(plan.name)}</td>
                                        <td className="p-4 text-gray-600">{plan.price.toLocaleString('en-US')} {plan.currency}</td>
                                        <td className="p-4 text-gray-600">{plan.jobPostingsLimit === -1 ? t('admin.plans.unlimited') : plan.jobPostingsLimit}</td>
                                        <td className="p-4"><span className={`px-2 py-1 text-xs rounded-full ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{plan.isActive ? 'Active' : 'Inactive'}</span></td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Button variant="secondary" size="sm" onClick={() => handleEdit(plan)}>{t('admin.plans.edit')}</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(plan.id)}>{t('admin.plans.delete')}</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {editingPlan && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPlan.id ? t('admin.plans.modalEditTitle') : t('admin.plans.modalCreateTitle')}>
                    <PlanForm plan={editingPlan} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

export default AdminPlansPage;