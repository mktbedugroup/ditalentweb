

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import type { Resource, MultilingualString } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { MultilingualInput, MultilingualTextarea } from '../../components/common/Multilingual';
import { useI18n } from '../../contexts/I18nContext';

const ResourceForm: React.FC<{ resource: Partial<Resource>, onSave: (data: any) => void, onCancel: () => void }> = ({ resource, onSave, onCancel }) => {
    const [formData, setFormData] = useState(resource);
    const { t } = useI18n();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleMultilingualChange = (fieldName: keyof Resource, value: MultilingualString) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <MultilingualInput
                label={t('admin.resources.form.title')}
                name="title"
                value={formData.title || { es: '', en: '', fr: '' }}
                onChange={(value) => handleMultilingualChange('title', value)}
            />
            <div>
                <label className="block text-sm font-medium">{t('admin.resources.form.fileUrl')}</label>
                <input type="text" name="fileUrl" value={formData.fileUrl || ''} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
            </div>
            <MultilingualTextarea
                label={t('admin.resources.form.description')}
                name="description"
                value={formData.description || { es: '', en: '', fr: '' }}
                onChange={(value) => handleMultilingualChange('description', value)}
                rows={3}
            />
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <Button type="button" variant="light" onClick={onCancel}>{t('admin.resources.form.cancel')}</Button>
                <Button type="submit">{t('admin.resources.form.save')}</Button>
            </div>
        </form>
    );
};

const AdminResourcesPage: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Partial<Resource> | null>(null);
    const { t, t_dynamic } = useI18n();

    const fetchResources = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getResources();
            setResources(data);
        } catch (error) {
            console.error("Failed to fetch resources", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const handleCreateNew = () => {
        setEditingResource({ title: { es: '', en: '', fr: '' }, description: { es: '', en: '', fr: '' }, fileUrl: '' });
        setIsModalOpen(true);
    };
    
    const handleEdit = (resource: Resource) => {
        setEditingResource(resource);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('admin.resources.confirmDelete'))) {
            await api.deleteResource(id);
            fetchResources();
        }
    };

    const handleSave = async (data: Omit<Resource, 'id'> & { id?: string }) => {
        await api.saveResource(data);
        fetchResources();
        setIsModalOpen(false);
        setEditingResource(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-gray-800">{t('admin.resources.title')}</h1>
                <Button onClick={handleCreateNew}>{t('admin.resources.add')}</Button>
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
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.resources.resourceTitle')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.resources.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {resources.map(resource => (
                                    <tr key={resource.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{t_dynamic(resource.title)}</td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Button variant="secondary" size="sm" onClick={() => handleEdit(resource)}>{t('admin.resources.edit')}</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(resource.id)}>{t('admin.resources.delete')}</Button>
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
                            {resources.map(resource => (
                                <Card key={resource.id} className="p-4 border">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg flex-1 pr-2">{t_dynamic(resource.title)}</h3>
                                        <div className="flex space-x-2 flex-shrink-0">
                                            <Button variant="secondary" size="sm" onClick={() => handleEdit(resource)}>{t('admin.resources.edit')}</Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(resource.id)}>{t('admin.resources.delete')}</Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {editingResource && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingResource.id ? t('admin.resources.modalEditTitle') : t('admin.resources.modalCreateTitle')}>
                    <ResourceForm resource={editingResource} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

export default AdminResourcesPage;