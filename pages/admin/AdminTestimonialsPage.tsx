

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import type { Testimonial, MultilingualString } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { MultilingualInput, MultilingualTextarea } from '../../components/common/Multilingual';
import { useI18n } from '../../contexts/I18nContext';

const TestimonialForm: React.FC<{ testimonial: Partial<Testimonial>, onSave: (data: any) => void, onCancel: () => void }> = ({ testimonial, onSave, onCancel }) => {
    const [formData, setFormData] = useState(testimonial);
    const { t } = useI18n();

    const handleMultilingualChange = (fieldName: keyof Testimonial, value: MultilingualString) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <MultilingualTextarea
                label={t('admin.testimonials.form.quote')}
                name="quote"
                value={formData.quote || { es: '', en: '', fr: '' }}
                onChange={(value) => handleMultilingualChange('quote', value)}
                rows={4}
            />
            <MultilingualInput
                label={t('admin.testimonials.form.author')}
                name="author"
                value={formData.author || { es: '', en: '', fr: '' }}
                onChange={(value) => handleMultilingualChange('author', value)}
            />
            <MultilingualInput
                label={t('admin.testimonials.form.company')}
                name="company"
                value={formData.company || { es: '', en: '', fr: '' }}
                onChange={(value) => handleMultilingualChange('company', value)}
            />
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <Button type="button" variant="light" onClick={onCancel}>{t('admin.testimonials.form.cancel')}</Button>
                <Button type="submit">{t('admin.testimonials.form.save')}</Button>
            </div>
        </form>
    );
};

const AdminTestimonialsPage: React.FC = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
    const { t, t_dynamic } = useI18n();

    const fetchTestimonials = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getTestimonials();
            setTestimonials(data);
        } catch (error) {
            console.error("Failed to fetch testimonials", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTestimonials();
    }, [fetchTestimonials]);

    const handleCreateNew = () => {
        setEditingTestimonial({ quote: { es: '', en: '', fr: '' }, author: { es: '', en: '', fr: '' }, company: { es: '', en: '', fr: '' } });
        setIsModalOpen(true);
    };
    
    const handleEdit = (testimonial: Testimonial) => {
        setEditingTestimonial(testimonial);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('admin.testimonials.confirmDelete'))) {
            await api.deleteTestimonial(id);
            fetchTestimonials();
        }
    };

    const handleSave = async (data: Omit<Testimonial, 'id'> & { id?: string }) => {
        await api.saveTestimonial(data);
        fetchTestimonials();
        setIsModalOpen(false);
        setEditingTestimonial(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-gray-800">{t('admin.testimonials.title')}</h1>
                <Button onClick={handleCreateNew}>{t('admin.testimonials.add')}</Button>
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
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.testimonials.quote')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.testimonials.author')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.testimonials.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {testimonials.map(testimonial => (
                                    <tr key={testimonial.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-sm text-gray-600 italic max-w-lg">"{t_dynamic(testimonial.quote)}"</td>
                                        <td className="p-4 text-gray-800">{t_dynamic(testimonial.author)}, <span className="text-primary">{t_dynamic(testimonial.company)}</span></td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Button variant="secondary" size="sm" onClick={() => handleEdit(testimonial)}>{t('admin.testimonials.edit')}</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(testimonial.id)}>{t('admin.testimonials.delete')}</Button>
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
                            {testimonials.map(testimonial => (
                                <Card key={testimonial.id} className="p-4 border">
                                    <p className="italic text-gray-700">"{t_dynamic(testimonial.quote)}"</p>
                                    <p className="text-right font-semibold mt-2">- {t_dynamic(testimonial.author)}, <span className="text-primary">{t_dynamic(testimonial.company)}</span></p>
                                    <div className="mt-4 pt-2 border-t flex justify-end space-x-2">
                                        <Button variant="secondary" size="sm" onClick={() => handleEdit(testimonial)}>{t('admin.testimonials.edit')}</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(testimonial.id)}>{t('admin.testimonials.delete')}</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {editingTestimonial && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTestimonial.id ? t('admin.testimonials.modalEditTitle') : t('admin.testimonials.modalCreateTitle')}>
                    <TestimonialForm testimonial={editingTestimonial} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

export default AdminTestimonialsPage;