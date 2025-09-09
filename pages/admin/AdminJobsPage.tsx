
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import type { Job, Company, Application, SiteSettings, MultilingualString, MultilingualStringArray } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import * as ReactRouterDOM from 'react-router-dom';
import { ImageUploader } from '../../components/common/ImageUploader';
import { Modal } from '../../components/common/Modal';
import { MultilingualInput, MultilingualTextarea, MultilingualListManager } from '../../components/common/Multilingual';
import { useI18n } from '../../contexts/I18nContext';
import { PROFESSIONAL_AREAS } from '../../constants';
import { Pagination } from '../../components/common/Pagination';
const { Link } = ReactRouterDOM;

// Form component for creating/editing jobs
const JobForm: React.FC<{ job: Partial<Job>, companies: Company[], onSave: (data: any) => void, onCancel: () => void }> = ({ job, companies, onSave, onCancel }) => {
    const [formData, setFormData] = useState(job);
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const { t, t_dynamic } = useI18n();

    useEffect(() => {
        api.getSiteSettings().then(setSiteSettings);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'location') {
            setFormData(prev => ({ ...prev, [name]: { es: value, en: value, fr: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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
            <MultilingualInput 
                label={t('admin.jobs.form.title')}
                name="title"
                value={formData.title || { es: '', en: '', fr: '' }}
                onChange={(value) => handleMultilingualChange('title', value)}
            />
            <div>
                <label className="block text-sm font-medium">{t('admin.jobs.form.company')}</label>
                <select name="companyId" value={formData.companyId} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-primary focus:border-primary">
                    {companies.map(c => <option key={c.id} value={c.id}>{t_dynamic(c.name)}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium">{t('admin.jobs.form.location')}</label>
                <select name="location" value={formData.location?.es || ''} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-primary focus:border-primary">
                    <option value="">{t('admin.jobs.form.selectLocation')}</option>
                    {siteSettings?.availableLocations?.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium">Área Profesional</label>
                <select name="professionalArea" value={formData.professionalArea} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-primary focus:border-primary">
                    {PROFESSIONAL_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium">{t('admin.jobs.form.type')}</label>
                <select name="type" value={formData.type} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-primary focus:border-primary">
                    {siteSettings?.jobTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium">{t('admin.jobs.form.salary')}</label>
                <input type="text" name="salary" value={formData.salary} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-primary focus:border-primary" />
            </div>
             <div>
                <label className="block text-sm font-medium">{t('admin.jobs.form.image')}</label>
                <ImageUploader 
                    initialValue={formData.imageUrl || ''}
                    onValueChange={handleImageChange}
                />
            </div>
            <MultilingualTextarea 
                label={t('admin.jobs.form.description')}
                name="description"
                value={formData.description || { es: '', en: '', fr: '' }}
                onChange={(value) => handleMultilingualChange('description', value)}
                rows={5}
            />
             <MultilingualListManager 
                label={t('admin.jobs.form.requirements')}
                value={formData.requirements || { es: [], en: [], fr: [] }}
                onChange={(value) => handleMultilingualChange('requirements', value)}
            />
            <div className="flex items-center">
                <input type="checkbox" id="isInternal" name="isInternal" checked={!!formData.isInternal} onChange={handleChange} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
                <label htmlFor="isInternal" className="ml-2 block text-sm text-gray-900">
                    {t('admin.jobs.form.isInternal')}
                </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <Button type="button" variant="light" onClick={onCancel}>{t('admin.jobs.form.cancel')}</Button>
                <Button type="submit">{t('admin.jobs.form.save')}</Button>
            </div>
        </form>
    );
};


const AdminJobsPage: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Partial<Job> | null>(null);
    const { t, t_dynamic } = useI18n();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const ITEMS_PER_PAGE = 10;

    const fetchJobsAndApps = useCallback(async () => {
        setLoading(true);
        try {
            const [jobsResponse, companiesData, appsData] = await Promise.all([
                api.getJobs({ page: currentPage, limit: ITEMS_PER_PAGE, searchTerm }),
                api.getCompanies(),
                api.getAllApplications(),
            ]);
            setJobs(jobsResponse.jobs);
            setTotalJobs(jobsResponse.total);
            setTotalPages(Math.ceil(jobsResponse.total / ITEMS_PER_PAGE));
            setCompanies(companiesData);
            setApplications(appsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm]);
    
    useEffect(() => {
        fetchJobsAndApps();
    }, [fetchJobsAndApps]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    }
    
    const getApplicantCount = (jobId: string) => {
        return applications.filter(app => app.jobId === jobId).length;
    };
    
    const handleCreateNew = () => {
        setEditingJob({ 
            title: { es: '', en: '', fr: '' }, 
            companyId: companies[0]?.id || '', 
            location: { es: '', en: '', fr: '' }, 
            professionalArea: 'Sin clasificar',
            type: 'Full-time', 
            salary: '', 
            description: { es: '', en: '', fr: '' }, 
            requirements: { es: [''], en: [''], fr: [''] }, 
            isInternal: false, 
            status: 'active', 
            imageUrl: '' 
        });
        setIsModalOpen(true);
    };
    
    const handleEdit = (job: Job) => {
        setEditingJob(job);
        setIsModalOpen(true);
    };

    const handleDelete = async (jobId: string) => {
        if (window.confirm(t('admin.jobs.confirmDelete'))) {
            await api.deleteJob(jobId);
            fetchJobsAndApps();
        }
    };

    const handleDuplicate = async (job: Job) => {
        if (window.confirm(t('admin.jobs.confirmDuplicate'))) {
            const { id, postedDate, ...jobToDuplicate } = job; // Remove id and postedDate
            await api.saveJob({
                ...jobToDuplicate,
                status: 'paused', // Set as paused by default
                title: { // Add (Copy) to title
                    es: `${t_dynamic(job.title)} (Copia)`,
                    en: `${t_dynamic(job.title)} (Copy)`,
                    fr: `${t_dynamic(job.title)} (Copie)`,
                }
            });
            fetchJobsAndApps();
        }
    };

    const handleSave = async (jobData: Omit<Job, 'id' | 'postedDate'> & { id?: string }) => {
        await api.saveJob(jobData);
        fetchJobsAndApps();
        setIsModalOpen(false);
        setEditingJob(null);
    };

    const handleToggleStatus = async (job: Job) => {
        const newStatus = job.status === 'active' ? 'paused' : 'active';
        await api.updateJobStatus(job.id, newStatus);
        fetchJobsAndApps();
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-gray-800">{t('admin.jobs.title')}</h1>
                <Button onClick={handleCreateNew}>{t('admin.jobs.createNew')}</Button>
            </div>
             <div className="mb-4">
                <input
                    type="text"
                    placeholder={t('admin.jobs.searchPlaceholder')}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                />
            </div>
            
            {loading ? (
                <p>{t('admin.jobs.loading')}</p>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.jobs.tableTitle')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.jobs.tableCompany')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.jobs.tableApplicants')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.jobs.tableStatus')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.jobs.tableActions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {jobs.map(job => (
                                    <tr key={job.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{t_dynamic(job.title)}</td>
                                        <td className="p-4 text-gray-600">{t_dynamic(companies.find(c => c.id === job.companyId)?.name)}</td>
                                        <td className="p-4 text-gray-600">
                                            <Link to={`/admin/jobs/${job.id}/applicants`} className="text-primary hover:underline">
                                                {getApplicantCount(job.id)}
                                            </Link>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Button variant="light" size="sm" onClick={() => handleToggleStatus(job)}>
                                                    {job.status === 'active' ? t('admin.jobs.pause') : t('admin.jobs.activate')}
                                                </Button>
                                                <Button variant="secondary" size="sm" onClick={() => handleEdit(job)}>{t('admin.jobs.edit')}</Button>
                                                <Button variant="light" size="sm" onClick={() => handleDuplicate(job)}>{t('admin.jobs.duplicate')}</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(job.id)}>{t('admin.jobs.delete')}</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

             <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={totalJobs}
            />

            {editingJob && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingJob.id ? t('admin.jobs.modalEditTitle') : t('admin.jobs.modalCreateTitle')}>
                    <JobForm job={editingJob} companies={companies} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

export default AdminJobsPage;
