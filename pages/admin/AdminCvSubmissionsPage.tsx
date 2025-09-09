
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { CVSubmission } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useI18n } from '../../contexts/I18nContext';

const downloadBase64File = (base64Data: string, fileName: string) => {
  try {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to download file:", error);
    alert("Could not download the file.");
  }
};

const AdminCvSubmissionsPage: React.FC = () => {
    const [submissions, setSubmissions] = useState<CVSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useI18n();

    useEffect(() => {
        setLoading(true);
        api.getCvSubmissions()
            .then(setSubmissions)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">{t('admin.cvSubmissions.title')}</h1>
            
            {loading ? (
                <p>{t('admin.cvSubmissions.loading')}</p>
            ) : submissions.length === 0 ? (
                <Card><p className="p-6 text-center">{t('admin.cvSubmissions.noSubmissions')}</p></Card>
            ) : (
                <Card>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.cvSubmissions.date')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.cvSubmissions.name')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.cvSubmissions.email')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.cvSubmissions.fileName')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.cvSubmissions.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {submissions.map(sub => (
                                    <tr key={sub.id} className="hover:bg-gray-50">
                                        <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{new Date(sub.submittedAt).toLocaleString()}</td>
                                        <td className="p-4 font-medium">{sub.name}</td>
                                        <td className="p-4 text-gray-600">{sub.email}</td>
                                        <td className="p-4 text-gray-600 text-sm">{sub.fileName}</td>
                                        <td className="p-4">
                                            <Button 
                                                variant="light" 
                                                size="sm"
                                                onClick={() => downloadBase64File(sub.cvBase64, sub.fileName)}
                                            >
                                                {t('admin.cvSubmissions.download')}
                                            </Button>
                                        </td>
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
                                    <p className="font-bold">{sub.name}</p>
                                    <p className="text-sm text-gray-600">{sub.email}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(sub.submittedAt).toLocaleString()}</p>
                                    <p className="mt-2 text-sm text-gray-700 truncate">File: {sub.fileName}</p>
                                    <div className="mt-2 pt-2 border-t">
                                        <Button 
                                            variant="light" 
                                            size="sm"
                                            onClick={() => downloadBase64File(sub.cvBase64, sub.fileName)}
                                            className="w-full"
                                        >
                                            {t('admin.cvSubmissions.download')}
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AdminCvSubmissionsPage;
