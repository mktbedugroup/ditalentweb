import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import type { User, Role } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useI18n } from '../../contexts/I18nContext';
import { Modal } from '../../components/common/Modal';

const UserForm: React.FC<{ user: Partial<User>, roles: Role[], onSave: (data: any) => void, onCancel: () => void }> = ({ user, roles, onSave, onCancel }) => {
    const [formData, setFormData] = useState(user);
    const { t } = useI18n();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('admin.users.email')}</label>
                <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/>
            </div>
            
            <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">{t('admin.users.role')}</label>
                <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900">
                    <option value="admin">Admin</option>
                    <option value="company">Company</option>
                    <option value="candidate">Candidate</option>
                </select>
            </div>

            {formData.role === 'admin' && (
                <div>
                    <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">{t('admin.roles.title')}</label>
                    <select id="roleId" name="roleId" value={formData.roleId || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900">
                        <option value="">{t('admin.users.superAdmin')}</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <Button type="button" variant="light" onClick={onCancel}>{t('admin.users.form.cancel')}</Button>
                <Button type="submit">{t('admin.users.form.save')}</Button>
            </div>
        </form>
    );
};

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
    const { t } = useI18n();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersData, rolesData] = await Promise.all([
                api.getUsers(),
                api.getRoles()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleToggleActive = async (userId: string, isActive: boolean) => {
        if (window.confirm(isActive ? t('admin.users.confirmActivate') : t('admin.users.confirmDeactivate'))) {
            try {
                await api.updateUserStatus(userId, isActive);
                fetchData(); // Refresh data
            } catch (error: any) {
                alert(error.message);
            }
        }
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm(t('admin.users.confirmDelete'))) {
            try {
                await api.deleteUser(userId);
                fetchData();
            } catch (error: any) {
                alert(error.message);
            }
        }
    };

    const handleSave = async (userData: Omit<User, 'id'> & { id?: string }) => {
        // If role is not admin, ensure roleId is unset.
        if (userData.role !== 'admin') {
            userData.roleId = undefined;
        }
        await api.saveUser(userData);
        fetchData();
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const getRoleName = (roleId?: string) => {
        if (!roleId) return t('admin.users.superAdmin');
        return roles.find(r => r.id === roleId)?.name || 'Unknown Role';
    };

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">{t('admin.users.title')}</h1>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.users.email')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.users.role')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.users.status')}</th> {/* New column */}
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.users.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{user.email}</td>
                                        <td className="p-4 text-gray-600 capitalize">
                                            {user.role === 'admin' ? getRoleName(user.roleId) : user.role}
                                        </td>
                                        <td className="p-4"> {/* New cell for status */}
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.isActive ? t('admin.users.active') : t('admin.users.inactive')}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Button variant="secondary" size="sm" onClick={() => handleEdit(user)}>
                                                    {t('admin.users.edit')}
                                                </Button>
                                                <Button 
                                                    variant={user.isActive ? "danger" : "success"} // Change variant based on status
                                                    size="sm"
                                                    onClick={() => handleToggleActive(user.id, !user.isActive)} // New handler
                                                    disabled={user.email === 'admin@hrportal.com'} // Prevent deactivating super admin
                                                    title={user.email === 'admin@hrportal.com' ? t('admin.users.cannotToggleAdmin') : (user.isActive ? t('admin.users.deactivate') : t('admin.users.activate'))}
                                                >
                                                    {user.isActive ? t('admin.users.deactivate') : t('admin.users.activate')}
                                                </Button>
                                                <Button 
                                                    variant="danger" 
                                                    size="sm"
                                                    onClick={() => handleDelete(user.id)}
                                                    disabled={user.email === 'admin@hrportal.com'}
                                                    title={user.email === 'admin@hrportal.com' ? t('admin.users.cannotDeleteAdmin') : t('admin.users.delete')}
                                                >
                                                    {t('admin.users.delete')}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
             {editingUser && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('admin.users.modalEditTitle')}>
                    <UserForm user={editingUser} roles={roles} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

export default AdminUsersPage;