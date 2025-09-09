

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import type { TeamMember, MultilingualString } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ImageUploader } from '../../components/common/ImageUploader';
import { Modal } from '../../components/common/Modal';
import { MultilingualInput } from '../../components/common/Multilingual';
import { useI18n } from '../../contexts/I18nContext';

const TeamMemberForm: React.FC<{ member: Partial<TeamMember>, onSave: (data: any) => void, onCancel: () => void }> = ({ member, onSave, onCancel }) => {
    const [formData, setFormData] = useState(member);
    const { t } = useI18n();

    const handleMultilingualChange = (fieldName: keyof TeamMember, value: MultilingualString) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };
    
    const handleImageChange = (value: string) => {
        setFormData(prev => ({ ...prev, photoUrl: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <MultilingualInput
                label={t('admin.team.form.name')}
                name="name"
                value={formData.name || { es: '', en: '', fr: '' }}
                onChange={(value) => handleMultilingualChange('name', value)}
            />
            <MultilingualInput
                label={t('admin.team.form.title')}
                name="title"
                value={formData.title || { es: '', en: '', fr: '' }}
                onChange={(value) => handleMultilingualChange('title', value)}
            />
             <div>
                <label className="block text-sm font-medium">{t('admin.team.form.photo')}</label>
                <ImageUploader 
                    initialValue={formData.photoUrl || ''}
                    onValueChange={handleImageChange}
                />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <Button type="button" variant="light" onClick={onCancel}>{t('admin.team.form.cancel')}</Button>
                <Button type="submit">{t('admin.team.form.save')}</Button>
            </div>
        </form>
    );
};

const AdminTeamPage: React.FC = () => {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Partial<TeamMember> | null>(null);
    const { t, t_dynamic } = useI18n();

    const fetchTeam = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getTeamMembers();
            setTeam(data);
        } catch (error) {
            console.error("Failed to fetch team", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeam();
    }, [fetchTeam]);

    const handleCreateNew = () => {
        setEditingMember({ name: { es: '', en: '', fr: '' }, title: { es: '', en: '', fr: '' }, photoUrl: 'https://i.pravatar.cc/150' });
        setIsModalOpen(true);
    };
    
    const handleEdit = (member: TeamMember) => {
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('admin.team.confirmDelete'))) {
            await api.deleteTeamMember(id);
            fetchTeam();
        }
    };

    const handleSave = async (data: Omit<TeamMember, 'id'> & { id?: string }) => {
        await api.saveTeamMember(data);
        fetchTeam();
        setIsModalOpen(false);
        setEditingMember(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-gray-800">{t('admin.team.title')}</h1>
                <Button onClick={handleCreateNew}>{t('admin.team.add')}</Button>
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
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.team.photo')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.team.name')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.team.memberTitle')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.team.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {team.map(member => (
                                    <tr key={member.id} className="hover:bg-gray-50">
                                        <td className="p-4"><img src={member.photoUrl} alt={t_dynamic(member.name)} className="w-10 h-10 rounded-full object-cover" /></td>
                                        <td className="p-4 font-medium">{t_dynamic(member.name)}</td>
                                        <td className="p-4 text-gray-600">{t_dynamic(member.title)}</td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Button variant="secondary" size="sm" onClick={() => handleEdit(member)}>{t('admin.team.edit')}</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(member.id)}>{t('admin.team.delete')}</Button>
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
                            {team.map(member => (
                                <Card key={member.id} className="p-4 border">
                                    <div className="flex items-center space-x-4">
                                        <img src={member.photoUrl} alt={t_dynamic(member.name)} className="w-16 h-16 rounded-full object-cover" />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{t_dynamic(member.name)}</h3>
                                            <p className="text-sm text-primary">{t_dynamic(member.title)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-2 border-t flex justify-end space-x-2">
                                        <Button variant="secondary" size="sm" onClick={() => handleEdit(member)}>{t('admin.team.edit')}</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(member.id)}>{t('admin.team.delete')}</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {editingMember && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMember.id ? t('admin.team.modalEditTitle') : t('admin.team.modalCreateTitle')}>
                    <TeamMemberForm member={editingMember} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

export default AdminTeamPage;