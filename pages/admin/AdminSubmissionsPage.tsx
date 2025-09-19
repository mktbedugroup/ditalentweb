import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import type { ContactSubmission } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useI18n } from '../../contexts/I18nContext';
import { FaCheck, FaSpinner, FaEnvelope, FaEnvelopeOpen, FaEye } from 'react-icons/fa';
import { Modal } from '../../components/common/Modal';

const STATUS_OPTIONS = ['New', 'In Progress', 'Resolved'];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    const statusClasses = {
        New: 'bg-blue-100 text-blue-800',
        'In Progress': 'bg-yellow-100 text-yellow-800',
        Resolved: 'bg-green-100 text-green-800',
    };
    return <span className={`${baseClasses} ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};

const AdminSubmissionsPage: React.FC = () => {
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
    const { t } = useI18n();

    const fetchSubmissions = () => {
        setLoading(true);
        api.getContactSubmissions()
            .then(data => setSubmissions(data.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleStatusChange = async (id: string, status: string) => {
        try {
            const updatedSubmission = await api.updateContactSubmissionStatus(id, status);
            setSubmissions(subs => subs.map(s => s.id === id ? updatedSubmission : s));
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleViewDetails = (submission: ContactSubmission) => {
        setSelectedSubmission(submission);
        setIsModalOpen(true);
    };

    const filteredSubmissions = useMemo(() => {
        return submissions
            .filter(sub => filter === 'All' || sub.status === filter)
            .filter(sub => {
                const search = searchTerm.toLowerCase();
                return (
                    sub.name.toLowerCase().includes(search) ||
                    sub.email.toLowerCase().includes(search) ||
                    sub.subject.toLowerCase().includes(search) ||
                    sub.message.toLowerCase().includes(search)
                );
            });
    }, [submissions, searchTerm, filter]);

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-4">{t('admin.submissions.title')}</h1>
            <p className="mb-6 text-gray-600">{t('admin.submissions.description')}</p>

            <Card className="mb-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        type="text"
                        placeholder={t('admin.submissions.searchPlaceholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    />
                    <select 
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    >
                        <option value="All">{t('admin.submissions.filterAll')}</option>
                        {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{t(`admin.submissions.statuses.${status}`)}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {loading ? (
                <p>{t('admin.submissions.loading')}</p>
            ) : filteredSubmissions.length === 0 ? (
                <Card><p className="p-6 text-center">{t('admin.submissions.noSubmissions')}</p></Card>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.submissions.status')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.submissions.date')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.submissions.name')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.submissions.subject')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.submissions.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredSubmissions.map(sub => (
                                    <tr key={sub.id} className={`hover:bg-gray-50 ${sub.status === 'New' ? 'bg-blue-50' : 'bg-white'}`}>
                                        <td className="p-4"><StatusBadge status={sub.status} /></td>
                                        <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{new Date(sub.submittedAt).toLocaleString()}</td>
                                        <td className="p-4 font-medium">{sub.name}<br/><span className='text-xs text-gray-500'>{sub.email}</span></td>
                                        <td className="p-4 text-gray-600">{sub.subject}</td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Button 
                                                    variant="light" 
                                                    size="sm"
                                                    onClick={() => handleViewDetails(sub)}
                                                >
                                                    <FaEye className="mr-1"/> {t('admin.submissions.viewDetails')}
                                                </Button>
                                                <select 
                                                    value={sub.status}
                                                    onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                                                    className="p-1 border border-gray-300 rounded-md bg-white text-gray-900 text-xs"
                                                >
                                                    {STATUS_OPTIONS.map(status => (
                                                        <option key={status} value={status}>{t(`admin.submissions.statuses.${status}`)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {selectedSubmission && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('admin.submissions.modalTitle')}>
                    <div className="space-y-4 text-gray-700">
                        <p><strong>{t('admin.submissions.date')}:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                        <p><strong>{t('admin.submissions.name')}:</strong> {selectedSubmission.name}</p>
                        <p><strong>{t('admin.submissions.email')}:</strong> {selectedSubmission.email}</p>
                        <p><strong>{t('admin.submissions.subject')}:</strong> {selectedSubmission.subject}</p>
                        <p><strong>{t('admin.submissions.status')}:</strong> <StatusBadge status={selectedSubmission.status} /></p>
                        <div>
                            <strong>{t('admin.submissions.message')}:</strong>
                            <p className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 whitespace-pre-wrap">{selectedSubmission.message}</p>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button onClick={() => setIsModalOpen(false)}>{t('common.close')}</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminSubmissionsPage;
