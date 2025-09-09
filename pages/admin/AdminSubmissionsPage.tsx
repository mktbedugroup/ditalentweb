

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { ContactSubmission } from '../../types';
import { Card } from '../../components/common/Card';
import { useI18n } from '../../contexts/I18nContext';

const AdminSubmissionsPage: React.FC = () => {
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useI18n();

    useEffect(() => {
        setLoading(true);
        api.getContactSubmissions()
            .then(setSubmissions)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">{t('admin.submissions.title')}</h1>
            
            {loading ? (
                <p>{t('admin.submissions.loading')}</p>
            ) : submissions.length === 0 ? (
                <Card><p className="p-6 text-center">{t('admin.submissions.noSubmissions')}</p></Card>
            ) : (
                <Card>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.submissions.date')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.submissions.name')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.submissions.email')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.submissions.subject')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.submissions.message')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {submissions.map(sub => (
                                    <tr key={sub.id} className="hover:bg-gray-50">
                                        <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{new Date(sub.submittedAt).toLocaleString()}</td>
                                        <td className="p-4 font-medium">{sub.name}</td>
                                        <td className="p-4 text-gray-600">{sub.email}</td>
                                        <td className="p-4 text-gray-600">{sub.subject}</td>
                                        <td className="p-4 text-gray-600 text-sm max-w-sm truncate" title={sub.message}>{sub.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden">
                         <div className="p-4 space-y-4">
                            {submissions.map(sub => (
                                <Card key={sub.id} className="p-4 border">
                                    <p className="font-bold">{sub.subject}</p>
                                    <p className="text-sm text-gray-600">{sub.name} ({sub.email})</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(sub.submittedAt).toLocaleString()}</p>
                                    <p className="mt-2 pt-2 border-t text-sm text-gray-700">{sub.message}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AdminSubmissionsPage;
