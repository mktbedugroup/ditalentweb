import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import type { CVSubmission } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useI18n } from '../../contexts/I18nContext';
import { FaDownload, FaEye, FaEyeSlash } from 'react-icons/fa';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, read, unread
    const [selected, setSelected] = useState<string[]>([]);
    const { t } = useI18n();

    const fetchSubmissions = () => {
        setLoading(true);
        api.getCvSubmissions()
            .then(data => setSubmissions(data.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            const updatedSubmission = await api.markCvAsRead(id);
            setSubmissions(subs => subs.map(s => s.id === id ? updatedSubmission : s));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const handleDownload = (sub: CVSubmission) => {
        downloadBase64File(sub.cvBase64, sub.fileName);
        if (!sub.isRead) {
            handleMarkAsRead(sub.id);
        }
    };

    const filteredSubmissions = useMemo(() => {
        return submissions
            .filter(sub => {
                if (filter === 'read') return sub.isRead;
                if (filter === 'unread') return !sub.isRead;
                return true;
            })
            .filter(sub => {
                const search = searchTerm.toLowerCase();
                return (
                    sub.name.toLowerCase().includes(search) ||
                    sub.email.toLowerCase().includes(search) ||
                    (sub.subject && sub.subject.toLowerCase().includes(search)) ||
                    sub.fileName.toLowerCase().includes(search)
                );
            });
    }, [submissions, searchTerm, filter]);

    const handleSelect = (id: string) => {
        setSelected(prev => 
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelected(filteredSubmissions.map(s => s.id));
        } else {
            setSelected([]);
        }
    };

    const handleBulkDownload = () => {
        const selectedSubs = submissions.filter(s => selected.includes(s.id));
        selectedSubs.forEach(sub => handleDownload(sub));
    };

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-4">{t('admin.cvSubmissions.title')}</h1>
            <p className="mb-6 text-gray-600">{t('admin.cvSubmissions.description')}</p>

            <Card className="mb-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                        type="text"
                        placeholder={t('admin.cvSubmissions.searchPlaceholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    />
                    <select 
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    >
                        <option value="all">{t('admin.cvSubmissions.filterAll')}</option>
                        <option value="unread">{t('admin.cvSubmissions.filterUnread')}</option>
                        <option value="read">{t('admin.cvSubmissions.filterRead')}</option>
                    </select>
                    <Button onClick={handleBulkDownload} disabled={selected.length === 0}>
                        <FaDownload className="mr-2"/>
                        {t('admin.cvSubmissions.downloadSelected')} ({selected.length})
                    </Button>
                </div>
            </Card>

            {loading ? (
                <p>{t('admin.cvSubmissions.loading')}</p>
            ) : filteredSubmissions.length === 0 ? (
                <Card><p className="p-6 text-center">{t('admin.cvSubmissions.noSubmissions')}</p></Card>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 w-4">
                                        <input type="checkbox" onChange={handleSelectAll} checked={selected.length > 0 && selected.length === filteredSubmissions.length} />
                                    </th>
                                    <th className="p-4 w-4"></th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.cvSubmissions.date')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.cvSubmissions.name')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.cvSubmissions.email')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.cvSubmissions.subject')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.cvSubmissions.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredSubmissions.map(sub => (
                                    <tr key={sub.id} className={`${sub.isRead ? 'bg-white' : 'bg-blue-50'} hover:bg-gray-50`}>
                                        <td className="p-4">
                                            <input type="checkbox" checked={selected.includes(sub.id)} onChange={() => handleSelect(sub.id)} />
                                        </td>
                                        <td className="p-4">
                                            {sub.isRead ? <FaEye className='text-gray-400' title={t('admin.cvSubmissions.read')}/> : <FaEyeSlash className='text-blue-500' title={t('admin.cvSubmissions.unread')}/>}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{new Date(sub.submittedAt).toLocaleString()}</td>
                                        <td className="p-4 font-medium">{sub.name}</td>
                                        <td className="p-4 text-gray-600">{sub.email}</td>
                                        <td className="p-4 text-gray-600 text-sm">{sub.subject}</td>
                                        <td className="p-4">
                                            <Button 
                                                variant="light" 
                                                size="sm"
                                                onClick={() => handleDownload(sub)}
                                            >
                                                <FaDownload className="mr-2"/>
                                                {t('admin.cvSubmissions.download')}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AdminCvSubmissionsPage;