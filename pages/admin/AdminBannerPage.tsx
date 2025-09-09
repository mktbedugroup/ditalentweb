import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import type { Banner, Slide, MultilingualString, CTAButton } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { ImageUploader } from '../../components/common/ImageUploader';
import { MultilingualInput, MultilingualTextarea } from '../../components/common/Multilingual';
import { useI18n } from '../../contexts/I18nContext';

// Form for a single slide
const SlideForm: React.FC<{ slide: Partial<Slide>, onUpdate: (field: keyof Slide, value: any) => void, onRemove: () => void }> = ({ slide, onUpdate, onRemove }) => {
    const { t } = useI18n();

    const handleButtonUpdate = (buttonIndex: number, field: keyof CTAButton, value: any) => {
        const newButtons = [...(slide.ctaButtons || [])];
        newButtons[buttonIndex] = { ...newButtons[buttonIndex], [field]: value };
        onUpdate('ctaButtons', newButtons);
    };

    const handleAddButton = () => {
        const newButton: CTAButton = {
            id: `new_btn_${Date.now()}`,
            text: { es: 'Botón', en: 'Button', fr: 'Bouton' },
            link: '#',
            size: 'md',
            backgroundColor: '#1b355d',
            textColor: '#ffffff',
            borderRadius: 'md',
        };
        const newButtons = [...(slide.ctaButtons || []), newButton];
        onUpdate('ctaButtons', newButtons);
    };
    
    const handleRemoveButton = (buttonIndex: number) => {
        const newButtons = (slide.ctaButtons || []).filter((_, i) => i !== buttonIndex);
        onUpdate('ctaButtons', newButtons);
    };

    return (
        <div className="p-4 border rounded-lg space-y-3 relative bg-gray-50">
            <Button type="button" variant="danger" size="sm" onClick={onRemove} className="absolute top-2 right-2 z-10">&times;</Button>
            <div>
                <label className="block text-sm font-medium">{t('admin.banners.form.slideImage')}</label>
                <ImageUploader initialValue={slide.imageUrl} onValueChange={(v) => onUpdate('imageUrl', v)} />
            </div>
            <MultilingualInput label={t('admin.banners.form.slideTitle')} name={`title-${slide.id}`} value={slide.title || { es: '', en: '', fr: '' }} onChange={(v) => onUpdate('title', v)} />
            <MultilingualTextarea label={t('admin.banners.form.slideSubtitle')} name={`subtitle-${slide.id}`} value={slide.subtitle || { es: '', en: '', fr: '' }} onChange={(v) => onUpdate('subtitle', v)} rows={2} />
            
            <div className="pt-2">
                <h4 className="text-sm font-semibold mb-2">{t('admin.banners.form.ctaButtons')}</h4>
                <div className="space-y-3">
                    {(slide.ctaButtons || []).map((button, index) => (
                        <div key={button.id || index} className="p-3 border rounded-md bg-white relative space-y-2">
                             <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveButton(index)} className="absolute top-1 right-1 z-10 text-xs px-1.5 py-0.5">&times;</Button>
                             <MultilingualInput label={t('admin.banners.form.buttonText')} name={`cta-text-${button.id}`} value={button.text} onChange={(v) => handleButtonUpdate(index, 'text', v)} />
                             <div>
                                <label className="block text-sm font-medium">{t('admin.banners.form.buttonLink')}</label>
                                <input type="text" value={button.link} onChange={(e) => handleButtonUpdate(index, 'link', e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">{t('admin.banners.form.buttonSize')}</label>
                                    <select value={button.size} onChange={(e) => handleButtonUpdate(index, 'size', e.target.value as CTAButton['size'])} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900">
                                        <option value="sm">Pequeño</option>
                                        <option value="md">Mediano</option>
                                        <option value="lg">Grande</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('admin.banners.form.buttonBorderRadius')}</label>
                                    <select value={button.borderRadius} onChange={(e) => handleButtonUpdate(index, 'borderRadius', e.target.value as CTAButton['borderRadius'])} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900">
                                        <option value="none">Ninguno</option>
                                        <option value="sm">Pequeño (sm)</option>
                                        <option value="md">Mediano (md)</option>
                                        <option value="lg">Grande (lg)</option>
                                        <option value="full">Redondo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('admin.banners.form.buttonBgColor')}</label>
                                    <input type="color" value={button.backgroundColor} onChange={(e) => handleButtonUpdate(index, 'backgroundColor', e.target.value)} className="mt-1 w-full p-1 h-10 border rounded-md"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('admin.banners.form.buttonTextColor')}</label>
                                    <input type="color" value={button.textColor} onChange={(e) => handleButtonUpdate(index, 'textColor', e.target.value)} className="mt-1 w-full p-1 h-10 border rounded-md"/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="light" size="sm" onClick={handleAddButton} className="mt-2">{t('admin.banners.form.addButton')}</Button>
            </div>
        </div>
    );
};


// Form for the entire banner (settings + slides)
const BannerForm: React.FC<{ banner: Partial<Banner>, onSave: (data: any) => void, onCancel: () => void }> = ({ banner, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Banner>>(banner);
    const { t } = useI18n();

    const fontFamilies = [
        { value: 'sans', name: 'Inter (Sans-Serif)' },
        { value: 'montserrat', name: 'Montserrat (Sans-Serif)' },
        { value: 'roboto-slab', name: 'Roboto Slab (Serif)' }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, config: { ...prev?.config, [name]: checked } as any }));
        } else if (['interval', 'height_px'].includes(name)) {
             setFormData(prev => ({ ...prev, config: { ...prev?.config, [name]: parseInt(value, 10) || 0 } as any }));
        } else if (name === 'overlayOpacity') {
            setFormData(prev => ({ ...prev, config: { ...prev?.config, [name]: parseFloat(value) } as any }));
        } else if (['transition', 'fontFamily', 'overlayColor'].includes(name)) {
            setFormData(prev => ({ ...prev, config: { ...prev?.config, [name]: value } as any }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSlideUpdate = (index: number, field: keyof Slide, value: any) => {
        const newSlides = [...(formData.slides || [])];
        newSlides[index] = { ...newSlides[index], [field]: value };
        setFormData(prev => ({ ...prev, slides: newSlides }));
    };

    const handleAddSlide = () => {
        const newSlide: Partial<Slide> = { 
            id: `new_${Date.now()}`,
            imageUrl: 'https://picsum.photos/seed/newslide/1920/1080',
            title: { es: 'Nuevo Título', en: 'New Title', fr: 'Nouveau Titre' },
            subtitle: { es: '', en: '', fr: '' },
            ctaButtons: []
        };
        setFormData(prev => ({ ...prev, slides: [...(prev.slides || []), newSlide as Slide] }));
    };

    const handleRemoveSlide = (index: number) => {
        setFormData(prev => ({ ...prev, slides: (prev.slides || []).filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card><div className="p-4 space-y-4">
                <h3 className="text-lg font-semibold">{t('admin.banners.form.mainSettings')}</h3>
                <div><label className="block text-sm font-medium">{t('admin.banners.form.name')}</label><input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
                <div><label className="block text-sm font-medium">{t('admin.banners.form.location')}</label><input type="text" name="location" value={formData.location || ''} onChange={handleInputChange} required placeholder="e.g., homepage" className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
            </div></Card>

            <Card><div className="p-4 space-y-4">
                <h3 className="text-lg font-semibold">{t('admin.banners.form.carouselConfig')}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium">{t('admin.banners.form.transition')}</label><select name="transition" value={formData.config?.transition} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"><option value="slide">Slide</option><option value="fade">Fade</option></select></div>
                    <div>
                      <label className="block text-sm font-medium">{t('admin.banners.form.height')}</label>
                      <div className="flex items-center">
                        <input type="number" name="height_px" value={formData.config?.height_px || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/>
                        <span className="ml-2 text-gray-500">px</span>
                      </div>
                    </div>
                    <div><label className="block text-sm font-medium">{t('admin.banners.form.interval')}</label><input type="number" name="interval" value={formData.config?.interval} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
                    <div>
                        <label className="block text-sm font-medium">{t('admin.banners.form.fontFamily')}</label>
                        <select name="fontFamily" value={formData.config?.fontFamily} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900">
                            {fontFamilies.map(font => <option key={font.value} value={font.value}>{font.name}</option>)}
                        </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                    <div>
                        <label className="block text-sm font-medium">{t('admin.banners.form.overlayColor')}</label>
                        <input type="color" name="overlayColor" value={formData.config?.overlayColor || '#000000'} onChange={handleInputChange} className="mt-1 w-full p-1 h-10 border rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('admin.banners.form.overlayOpacity')} ({Math.round((formData.config?.overlayOpacity || 0) * 100)}%)</label>
                        <input type="range" name="overlayOpacity" min="0" max="1" step="0.05" value={formData.config?.overlayOpacity || 0} onChange={handleInputChange} className="mt-1 w-full"/>
                    </div>
                </div>
                 <div className="flex flex-wrap gap-x-6 gap-y-4 pt-4 border-t">
                    <div className="flex items-center"><input type="checkbox" name="autoplay" id="autoplay" checked={!!formData.config?.autoplay} onChange={handleInputChange} className="h-4 w-4" /><label htmlFor="autoplay" className="ml-2 text-sm">{t('admin.banners.form.autoplay')}</label></div>
                    <div className="flex items-center"><input type="checkbox" name="loop" id="loop" checked={!!formData.config?.loop} onChange={handleInputChange} className="h-4 w-4" /><label htmlFor="loop" className="ml-2 text-sm">{t('admin.banners.form.loop')}</label></div>
                    <div className="flex items-center"><input type="checkbox" name="showArrows" id="showArrows" checked={!!formData.config?.showArrows} onChange={handleInputChange} className="h-4 w-4" /><label htmlFor="showArrows" className="ml-2 text-sm">{t('admin.banners.form.showArrows')}</label></div>
                    <div className="flex items-center"><input type="checkbox" name="showDots" id="showDots" checked={!!formData.config?.showDots} onChange={handleInputChange} className="h-4 w-4" /><label htmlFor="showDots" className="ml-2 text-sm">{t('admin.banners.form.showDots')}</label></div>
                    <div className="flex items-center"><input type="checkbox" name="textShadow" id="textShadow" checked={!!formData.config?.textShadow} onChange={handleInputChange} className="h-4 w-4" /><label htmlFor="textShadow" className="ml-2 text-sm">{t('admin.banners.form.textShadow')}</label></div>
                 </div>
            </div></Card>

            <Card><div className="p-4">
                <h3 className="text-lg font-semibold mb-4">{t('admin.banners.form.slides')}</h3>
                <div className="space-y-4">
                    {(formData.slides || []).map((slide, index) => (
                        <SlideForm key={slide.id || index} slide={slide} onUpdate={(f, v) => handleSlideUpdate(index, f, v)} onRemove={() => handleRemoveSlide(index)} />
                    ))}
                </div>
                <Button type="button" variant="light" onClick={handleAddSlide} className="mt-4">{t('admin.banners.form.addSlide')}</Button>
            </div></Card>
            
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <Button type="button" variant="light" onClick={onCancel}>{t('admin.banners.form.cancel')}</Button>
                <Button type="submit">{t('admin.banners.form.save')}</Button>
            </div>
        </form>
    );
};


const AdminBannerPage: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
    const { t } = useI18n();

    const fetchBanners = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getBanners();
            setBanners(data);
        } catch (error) {
            console.error("Failed to fetch banners", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

    const handleCreateNew = () => {
        setEditingBanner({ 
            name: 'New Banner',
            location: '',
            slides: [],
            config: {
                transition: 'slide',
                interval: 5000,
                autoplay: true,
                loop: true,
                showArrows: true,
                showDots: true,
                height_px: 600,
                fontFamily: 'sans',
                overlayColor: '#1b355d',
                overlayOpacity: 0.5,
                textShadow: true,
            }
        });
        setIsModalOpen(true);
    };
    
    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('admin.banners.confirmDelete'))) {
            await api.deleteBanner(id);
            fetchBanners();
        }
    };

    const handleSave = async (data: Omit<Banner, 'id'> & { id?: string }) => {
        await api.saveBanner(data);
        fetchBanners();
        setIsModalOpen(false);
        setEditingBanner(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-gray-800">{t('admin.banners.title')}</h1>
                <Button onClick={handleCreateNew}>{t('admin.banners.add')}</Button>
            </div>
             {loading ? (
                <p>{t('admin.banners.loading')}</p>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.banners.table.name')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.banners.table.location')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.banners.table.slides')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.banners.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {banners.map(banner => (
                                    <tr key={banner.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{banner.name}</td>
                                        <td className="p-4 text-gray-600"><code className="bg-gray-200 px-2 py-1 rounded">{banner.location}</code></td>
                                        <td className="p-4 text-gray-600">{banner.slides.length}</td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Button variant="secondary" size="sm" onClick={() => handleEdit(banner)}>{t('admin.banners.edit')}</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(banner.id)}>{t('admin.banners.delete')}</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {editingBanner && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBanner.id ? t('admin.banners.modalEditTitle') : t('admin.banners.modalCreateTitle')}>
                    <BannerForm banner={editingBanner} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

export default AdminBannerPage;