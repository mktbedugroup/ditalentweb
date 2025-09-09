import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '../../services/api';
import type { Job, Application, SiteSettings, MultilingualString, MultilingualStringArray, Company } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import * as ReactRouterDOM from 'react-router-dom';
import { ImageUploader } from '../../components/common/ImageUploader';
import { MultilingualInput, MultilingualTextarea, MultilingualListManager } from '../../components/common/Multilingual';
import { useI18n } from '../../contexts/I18nContext';
import { Modal } from '../../components/common/Modal';
import { PROFESSIONAL_AREAS } from '../../constants';
const { Link } = ReactRouterDOM;

const JobForm: React.FC<{ job: Partial<Job>, onSave: (data: any) => void, onCancel: () => void }> = ({ job, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Job>>(job);
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const { t } = useI18n();

    useEffect(() => {
        setFormData(job);
        api.getSiteSettings().then(setSiteSettings);
    }, [job]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultilingualChange = (fieldName: keyof Job, value: MultilingualString | MultilingualStringArray) => {
      setFormData(prev => ({ ...prev, [fieldName]: value }));
    };
    
    const handleImageChange = (value: string) => {
        setFormData(prev => ({ ...prev, imageUrl: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <MultilingualInput label={t('company.jobs.form.title')} name="title" value={formData.title || { es: '', en: '', fr: '' }} onChange={(value) => handleMultilingualChange('title', value)} />
            <MultilingualInput label={t('company.jobs.form.location')} name="location" value={formData.location || { es: '', en: '', fr: '' }} onChange={(value) => handleMultilingualChange('location', value)} />
             <div>
                <label className="block text-sm font-medium">{t('company.jobs.form.professionalArea')}</label>
                <select name="professionalArea" value={formData.professionalArea} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-primary focus:border-primary">
                    {PROFESSIONAL_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium">{t('company.jobs.form.type')}</label>
                <select name="type" value={formData.type || ''} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900">
                    {siteSettings?.jobTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium">{t('company.jobs.form.salary')}</label>
                <input type="text" name="salary" value={formData.salary || ''} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
            </div>
            <div>
                <label className="block text-sm font-medium">{t('company.jobs.form.image')}</label>
                <ImageUploader initialValue={formData.imageUrl || ''} onValueChange={handleImageChange} />
            </div>
            <MultilingualTextarea label={t('company.jobs.form.description')} name="description" value={formData.description || { es: '', en: '', fr: '' }} onChange={(value) => handleMultilingualChange('description', value)} rows={5} />
             <MultilingualListManager label={t('company.jobs.form.requirements')} value={formData.requirements || { es: [], en: [], fr: [] }} onChange={(value) => handleMultilingualChange('requirements', value)} />
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="light" onClick={onCancel}>{t('company.jobs.form.cancel')}</Button>
                <Button type="submit">{t('company.jobs.form.save')}</Button>
            </div>
        </form>
    );
};

const statusStyles: { [key in Job['status']]: string } = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-red-100 text-red-800',
};

const OptionsDropdown: React.FC<{
    job: Job;
    onEdit: () => void;
    onDuplicate: () => void;
    onRepost: () => void;
    onDelete: () => void;
}> = ({ job, onEdit, onDuplicate, onRepost, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useI18n();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

    const handleToggle = () => {
        if (!isOpen) {
            const rect = buttonRef.current?.getBoundingClientRect();
            if (rect) {
                setMenuPosition({ top: rect.bottom + 5, right: window.innerWidth - rect.right });
                setIsOpen(true);
            }
        } else {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleActionClick = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <Button ref={buttonRef} variant="light" size="sm" onClick={handleToggle}>
                {t('company.jobs.table.options')}
                 <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </Button>
            {isOpen && menuPosition && (
                <div
                    ref={menuRef}
                    className="w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                    style={{
                        position: 'fixed',
                        top: `${menuPosition.top}px`,
                        right: `${menuPosition.right}px`,
                        zIndex: 100,
                    }}
                >
                    <div className="py-1">
                        <button onClick={() => handleActionClick(onEdit)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('company.jobs.edit')}</button>
                        <button onClick={() => handleActionClick(onDuplicate)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('company.jobs.duplicate')}</button>
                        {job.status !== 'active' && <button onClick={() => handleActionClick(onRepost)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('company.jobs.repost')}</button>}
                        <button onClick={() => handleActionClick(onDelete)} className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50">{t('company.jobs.delete')}</button>
                    </div>
                </div>
            )}
        </div>
    );
}

const CompanyJobsPage: React.FC = () => {
    const { user } = useAuth();
    const [company, setCompany] = useState<Company | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Partial<Job> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { t, t_dynamic } = useI18n();
    const [saveError, setSaveError] = useState('');

    const canPostJob = company ? (company.jobPostingsRemaining ?? 0) !== 0 : false;

    const fetchCompanyData = useCallback(async () => {
        if (!user || !user.companyId) return;
        setLoading(true);
        try {
            const companyData = await api.getCompanyById(user.companyId);
            setCompany(companyData || null);
            const jobsData = await api.getJobsByCompanyId(user.companyId);
            setJobs(jobsData);
            const allApps = await Promise.all(jobsData.map(job => api.getApplicantsByJobId(job.id)));
            setApplications(allApps.flat());
        } catch (error) {
            console.error("Failed to fetch company jobs", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCompanyData();
    }, [fetchCompanyData]);
    
    const filteredJobs = useMemo(() => {
        const sortedJobs = [...jobs].sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
        if (!searchTerm) return sortedJobs;
        return sortedJobs.filter(job => t_dynamic(job.title).toLowerCase().includes(searchTerm.toLowerCase()));
    }, [jobs, searchTerm, t_dynamic]);

    const getApplicantCount = (jobId: string) => applications.filter(app => app.jobId === jobId).length;
    
    const getNewApplicantCount = (jobId: string) => applications.filter(app => {
        const twentyFourHoursAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
        return app.jobId === jobId && new Date(app.appliedDate).getTime() > twentyFourHoursAgo;
    }).length;

    const handleCreateNew = () => {
        setSaveError('');
        setEditingJob({ 
            title: { es: '', en: '', fr: '' }, 
            location: { es: '', en: '', fr: '' }, 
            description: { es: '', en: '', fr: '' },
            professionalArea: 'Sin clasificar',
            type: 'Full-time',
            salary: '',
            requirements: { es: [''], en: [''], fr: [''] },
            companyId: user?.companyId,
            imageUrl: '',
        });
        setIsModalOpen(true);
    };
    
    const handleEdit = (job: Job) => {
        setSaveError('');
        setEditingJob(job);
        setIsModalOpen(true);
    };

    const handleDuplicate = (jobToDuplicate: Job) => {
        if (!canPostJob) {
            alert(t('company.jobs.limitReachedBody'));
            return;
        }
        const { id, postedDate, status, ...jobData } = jobToDuplicate;
        setEditingJob({
            ...jobData,
            title: {
                es: `${jobData.title.es} (Copia)`,
                en: `${jobData.title.en} (Copy)`,
                fr: `${jobData.title.fr} (Copie)`,
            },
            companyId: user?.companyId,
        });
        setIsModalOpen(true);
    };

    const handleRepost = async (jobToRepost: Job) => {
        if (!canPostJob) {
            alert(t('company.jobs.limitReachedBody'));
            return;
        }
        if (window.confirm(t('company.jobs.confirmRepost'))) {
            const { id, postedDate, expiryDate, ...jobData } = jobToRepost;
            await api.saveJob({
                ...jobData,
                companyId: user?.companyId,
            } as any);
            fetchCompanyData();
        }
    };

    const handleToggleStatus = async (job: Job) => {
        const newStatus = job.status === 'active' ? 'paused' : 'active';
        await api.updateJobStatus(job.id, newStatus);
        fetchCompanyData();
    };

    const handleDelete = async (jobId: string) => {
        if (window.confirm(t('company.jobs.confirmDelete'))) {
            await api.deleteJob(jobId);
            fetchCompanyData();
        }
    };
    
    const handleSave = async (jobData: Omit<Job, 'id' | 'postedDate'> & { id?: string }) => {
        setSaveError('');
        try {
            await api.saveJob(jobData);
            fetchCompanyData();
            setIsModalOpen(false);
            setEditingJob(null);
        } catch(error: any) {
            setSaveError(error.message || 'An error occurred.');
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">{t('company.jobs.title')}</h1>
                <Button onClick={handleCreateNew} disabled={!canPostJob} className="w-full sm:w-auto">{t('company.jobs.postNew')}</Button>
            </div>
            {!canPostJob && !loading && (
                <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                    <p className="font-bold">{t('company.jobs.limitReachedTitle')}</p>
                    <p>{t('company.jobs.limitReachedBody')} <Link to="/company/plans" className="font-bold underline">{t('company.jobs.upgradePlan')}</Link></p>
                </div>
            )}
            
            <Card>
                <div className="p-4 border-b">
                    <input
                        type="text"
                        placeholder={t('company.jobs.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    />
                </div>
                {loading ? (
                    <p className="p-4">{t('company.jobs.loading')}</p>
                ) : filteredJobs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('company.jobs.table.postedDate')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('company.jobs.table.jobTitle')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 text-center">{t('company.jobs.table.newApplicants')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 text-center">{t('company.jobs.table.totalApplicants')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 text-center">{t('company.jobs.table.expiresIn')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('company.jobs.table.status')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('company.jobs.table.options')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredJobs.map(job => (
                                    <tr key={job.id} className="hover:bg-gray-50">
                                        <td className="p-4 text-sm text-gray-600">{new Date(job.postedDate).toLocaleDateString()}</td>
                                        <td className="p-4 font-medium"><Link to={`/company/jobs/${job.id}/applicants`} className="hover:text-primary">{t_dynamic(job.title)}</Link></td>
                                        <td className="p-4 text-center text-gray-600">{getNewApplicantCount(job.id)}</td>
                                        <td className="p-4 text-center text-gray-600">{getApplicantCount(job.id)}</td>
                                        <td className="p-4 text-center text-gray-600">
                                            {(() => {
                                                if (job.status === 'closed') return <span className="text-red-600">Expired</span>;
                                                const daysRemaining = job.expiryDate ? Math.ceil((new Date(job.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;
                                                if (daysRemaining === null) return '-';
                                                if (daysRemaining > 1) {
                                                    return `${daysRemaining} ${t('common.days')}`;
                                                }
                                                if (daysRemaining === 1) {
                                                    return `1 ${t('common.day')}`;
                                                }
                                                return <span className="text-yellow-600">Today</span>;
                                            })()}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[job.status]}`}>{job.status}</span>
                                        </td>
                                        <td className="p-4">
                                             <OptionsDropdown
                                                job={job}
                                                onEdit={() => handleEdit(job)}
                                                onDuplicate={() => handleDuplicate(job)}
                                                onRepost={() => handleRepost(job)}
                                                onDelete={() => handleDelete(job.id)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6 text-center">
                        <p className="text-gray-600">{t('company.jobs.noJobs')}</p>
                    </div>
                )}
            </Card>

            {editingJob && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingJob.id ? t('company.jobs.modalEditTitle') : t('company.jobs.modalCreateTitle')}>
                    {saveError && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{saveError}</p>}
                    <JobForm job={editingJob} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

export default CompanyJobsPage;