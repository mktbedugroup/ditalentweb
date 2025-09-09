import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import type { Role, Permission } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { useI18n } from '../../contexts/I18nContext';
import { PERMISSION_GROUPS } from '../../constants';

const RoleForm: React.FC<{ role: Partial<Role>, onSave: (data: any) => void, onCancel: () => void }> = ({ role, onSave, onCancel }) => {
    const [formData, setFormData] = useState(role);
    const { t } = useI18n();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionChange = (permission: Permission, isChecked: boolean) => {
        setFormData(prev => {
            const currentPermissions = prev.permissions || [];
            if (isChecked) {
                return { ...prev, permissions: [...currentPermissions, permission] };
            } else {
                return { ...prev, permissions: currentPermissions.filter(p => p !== permission) };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('admin.roles.form.name')}</label>
                <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">{t('admin.roles.form.permissions')}</label>
                <div className="mt-2 space-y-4">
                    {PERMISSION_GROUPS.map(group => (
                        <div key={group.name} className="p-3 border rounded-md">
                            <h4 className="font-semibold text-gray-800">{t(`permissions.groups.${group.name}`)}</h4>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {group.permissions.map(permission => (
                                    <div key={permission} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={permission}
                                            checked={formData.permissions?.includes(permission) || false}
                                            onChange={e => handlePermissionChange(permission, e.target.checked)}
                                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                        />
                                        <label htmlFor={permission} className="ml-2 text-sm text-gray-600">{t(`permissions.${permission}`)}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <Button type="button" variant="light" onClick={onCancel}>{t('admin.roles.form.cancel')}</Button>
                <Button type="submit">{t('admin.roles.form.save')}</Button>
            </div>
        </form>
    );
};

const AdminRolesPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);
    const { t } = useI18n();

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getRoles();
            setRoles(data);
        } catch (error) {
            console.error("Failed to fetch roles", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleCreateNew = () => {
        setEditingRole({ name: '', permissions: [] });
        setIsModalOpen(true);
    };
    
    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('admin.roles.confirmDelete'))) {
            await api.deleteRole(id);
            fetchRoles();
        }
    };

    const handleSave = async (data: Omit<Role, 'id'> & { id?: string }) => {
        await api.saveRole(data);
        fetchRoles();
        setIsModalOpen(false);
        setEditingRole(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-gray-800">{t('admin.roles.title')}</h1>
                <Button onClick={handleCreateNew}>{t('admin.roles.add')}</Button>
            </div>
             {loading ? (
                <p>Loading...</p>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.roles.name')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.roles.permissionsCount')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.roles.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {roles.map(role => (
                                    <tr key={role.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{role.name}</td>
                                        <td className="p-4 text-gray-600">{role.permissions.length}</td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Button variant="secondary" size="sm" onClick={() => handleEdit(role)}>{t('admin.roles.edit')}</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(role.id)}>{t('admin.roles.delete')}</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {editingRole && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRole.id ? t('admin.roles.modalEditTitle') : t('admin.roles.modalCreateTitle')}>
                    <RoleForm role={editingRole} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

export default AdminRolesPage;