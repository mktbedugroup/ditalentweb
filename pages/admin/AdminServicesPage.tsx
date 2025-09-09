

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import type { Service, MultilingualString } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { MultilingualInput, MultilingualTextarea } from '../../components/common/Multilingual';
import { useI18n } from '../../contexts/I18nContext';

const ServiceForm: React.FC<{ service: Partial<Service>, onSave: (data: any) => void, onCancel: () => void }> = ({ service, onSave, onCancel }) => {
    const [formData, setFormData] = useState(service);
    const { t } = useI18n();

    const handleMultilingualChange = (fieldName: keyof Service, value: MultilingualString) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <MultilingualInput
                label={t('admin.services.form.title')}
                name="title"
                value={formData.title || { es: '', en: '', fr: '' }}
                onChange={(value) => handleMultilingualChange('title', value)}
            />
            <MultilingualTextarea
                label={t('admin.services.form.description')}
                name="description"
                value={formData.description || { es: '', en: '', fr: '' }}
                onChange={(value) => handleMultilingualChange('description', value)}
                rows={4}
            />
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <Button type="button" variant="light" onClick={onCancel}>{t('admin.services.form.cancel')}</Button>
                <Button type="submit">{t('admin.services.form.save')}</Button>
            </div>
        </form>
    );
};

const AdminServicesPage: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
    const { t, t_dynamic } = useI18n();

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getServices();
            setServices(data);
        } catch (error) {
            console.error("Failed to fetch services", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleCreateNew = () => {
        setEditingService({ title: { es: '', en: '', fr: '' }, description: { es: '', en: '', fr: '' } });
        setIsModalOpen(true);
    };
    
    const handleEdit = (service: Service) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleDelete = async (serviceId: string) => {
        if (window.confirm(t('admin.services.confirmDelete'))) {
            await api.deleteService(serviceId);
            fetchServices();
        }
    };

    const handleSave = async (serviceData: Omit<Service, 'id'> & { id?: string }) => {
        await api.saveService(serviceData);
        fetchServices();
        setIsModalOpen(false);
        setEditingService(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-gray-800">{t('admin.services.title')}</h1>
                <Button onClick={handleCreateNew}>{t('admin.services.add')}</Button>
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
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.services.serviceTitle')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.services.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {services.map(service => (
                                    <tr key={service.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{t_dynamic(service.title)}</td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Button variant="secondary" size="sm" onClick={() => handleEdit(service)}>{t('admin.services.edit')}</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(service.id)}>{t('admin.services.delete')}</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden">
                        <div className="p-4 space-y-4">
                            {services.map(service => (
                                <Card key={service.id} className="p-4 border">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg flex-1 pr-2">{t_dynamic(service.title)}</h3>
                                        <div className="flex space-x-2 flex-shrink-0">
                                            <Button variant="secondary" size="sm" onClick={() => handleEdit(service)}>{t('admin.services.edit')}</Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(service.id)}>{t('admin.services.delete')}</Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {editingService && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingService.id ? t('admin.services.modalEditTitle') : t('admin.services.modalCreateTitle')}>
                    <ServiceForm service={editingService} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

export default AdminServicesPage;