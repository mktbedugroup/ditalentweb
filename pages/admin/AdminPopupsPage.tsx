import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import type { PopupAd, MultilingualString } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { useI18n } from '../../contexts/I18nContext';
import { ImageUploader } from '../../components/common/ImageUploader';
import { MultilingualInput, MultilingualTextarea } from '../../components/common/Multilingual';

const PopupForm: React.FC<{ popup: Partial<PopupAd>, onSave: (data: any) => void, onCancel: () => void }> = ({ popup, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<PopupAd>>(popup);
    const { t } = useI18n();

    const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNestedChange = (category: keyof PopupAd, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [category]: {
                // @ts-ignore
                ...prev[category],
                [field]: value,
            },
        }));
    };
    
    const handleMultiNestedChange = (cat1: keyof PopupAd, cat2: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [cat1]: {
                // @ts-ignore
                ...prev[cat1],
                [cat2]: {
                    // @ts-ignore
                    ...prev[cat1][cat2],
                    [field]: value
                }
            }
        }))
    }

    const handleListChange = (category: keyof PopupAd, field: string, value: string, isChecked: boolean) => {
        setFormData(prev => {
            // @ts-ignore
            const currentList = prev[category]?.[field] || [];
            let newList;
            if (isChecked) {
                newList = [...currentList, value];
            } else {
                newList = currentList.filter((item: string) => item !== value);
            }
            return {
                ...prev,
                [category]: {
                    // @ts-ignore
                    ...prev[category],
                    [field]: newList,
                }
            };
        });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-4">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">{t('admin.popups.form.mainSettings')}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">{t('admin.popups.form.name')}</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleSimpleChange} required className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900" />
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" id="isActive" name="isActive" checked={!!formData.isActive} onChange={handleSimpleChange} className="h-4 w-4 text-primary rounded" />
                        <label htmlFor="isActive" className="ml-2 text-sm font-medium">{t('admin.popups.form.isActive')}</label>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">{t('admin.popups.form.content')}</h3>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium">{t('admin.popups.form.image')}</label><ImageUploader initialValue={formData.content?.imageUrl || ''} onValueChange={(v) => handleNestedChange('content', 'imageUrl', v)} /></div>
                    <MultilingualInput label={t('admin.popups.form.title')} name="title" value={formData.content?.title || {es:'',en:'',fr:''}} onChange={(v) => handleNestedChange('content', 'title', v)} />
                    <MultilingualTextarea label={t('admin.popups.form.text')} name="text" value={formData.content?.text || {es:'',en:'',fr:''}} onChange={(v) => handleNestedChange('content', 'text', v)} rows={3}/>
                    <div className="p-3 border rounded-md">
                        <h4 className="text-sm font-medium mb-2">{t('admin.popups.form.ctaButton')}</h4>
                        <MultilingualInput label={t('admin.popups.form.buttonText')} name="ctaText" value={formData.content?.ctaButton?.text || {es:'',en:'',fr:''}} onChange={(v) => handleMultiNestedChange('content', 'ctaButton', 'text', v)} />
                        <div><label className="block text-sm font-medium mt-2">{t('admin.popups.form.buttonLink')}</label><input type="text" value={formData.content?.ctaButton?.link || ''} onChange={(e) => handleMultiNestedChange('content', 'ctaButton', 'link', e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900" /></div>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                 <h3 className="text-lg font-semibold border-b pb-2 mb-4">{t('admin.popups.form.appearance')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium">{t('admin.popups.form.size')}</label><select value={formData.appearance?.size} onChange={(e) => handleNestedChange('appearance', 'size', e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"><option value="sm">{t('admin.popups.form.sizes.sm')}</option><option value="md">{t('admin.popups.form.sizes.md')}</option><option value="lg">{t('admin.popups.form.sizes.lg')}</option></select></div>
                    <div><label className="block text-sm font-medium">{t('admin.popups.form.position')}</label><select value={formData.appearance?.position} onChange={(e) => handleNestedChange('appearance', 'position', e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"><option value="center">{t('admin.popups.form.positions.center')}</option><option value="bottom-right">{t('admin.popups.form.positions.bottom-right')}</option><option value="bottom-left">{t('admin.popups.form.positions.bottom-left')}</option></select></div>
                    <div className="col-span-2"><label className="block text-sm font-medium">{t('admin.popups.form.overlayOpacity')} ({Math.round((formData.appearance?.overlayOpacity || 0) * 100)}%)</label><input type="range" min="0" max="1" step="0.05" value={formData.appearance?.overlayOpacity} onChange={(e) => handleNestedChange('appearance', 'overlayOpacity', parseFloat(e.target.value))} className="mt-1 w-full"/></div>
                </div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">{t('admin.popups.form.triggers')}</h3>
                    <div><label className="block text-sm font-medium">{t('admin.popups.form.triggerType')}</label><select value={formData.triggers?.type} onChange={(e) => handleNestedChange('triggers', 'type', e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"><option value="delay">{t('admin.popups.form.triggerTypes.delay')}</option><option value="scroll">{t('admin.popups.form.triggerTypes.scroll')}</option><option value="exit-intent">{t('admin.popups.form.triggerTypes.exit-intent')}</option></select></div>
                    <div><label className="block text-sm font-medium mt-2">{t('admin.popups.form.triggerValue')}</label><input type="number" value={formData.triggers?.value} onChange={(e) => handleNestedChange('triggers', 'value', parseInt(e.target.value) || 0)} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
                </Card>
                <Card className="p-4">
                     <h3 className="text-lg font-semibold border-b pb-2 mb-4">{t('admin.popups.form.frequency')}</h3>
                    <div><label className="block text-sm font-medium">{t('admin.popups.form.frequencyType')}</label><select value={formData.frequency?.type} onChange={(e) => handleNestedChange('frequency', 'type', e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"><option value="session">{t('admin.popups.form.frequencyTypes.session')}</option><option value="days">{t('admin.popups.form.frequencyTypes.days')}</option><option value="always">{t('admin.popups.form.frequencyTypes.always')}</option></select></div>
                    {formData.frequency?.type === 'days' && <div><label className="block text-sm font-medium mt-2">{t('admin.popups.form.frequencyValue')}</label><input type="number" value={formData.frequency?.value} onChange={(e) => handleNestedChange('frequency', 'value', parseInt(e.target.value) || 1)} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>}
                </Card>
            </div>

            <Card className="p-4">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">{t('admin.popups.form.targeting')}</h3>
                <div><label className="block text-sm font-medium">{t('admin.popups.form.pages')}</label><input type="text" value={formData.targeting?.pages.join(', ')} onChange={e => handleNestedChange('targeting', 'pages', e.target.value.split(',').map(s => s.trim()))} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/></div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium">{t('admin.popups.form.devices')}</label>
                        <div className="mt-1 space-y-1">
                            {(['desktop', 'mobile'] as const).map(d => <div key={d} className="flex items-center"><input type="checkbox" id={`device-${d}`} checked={formData.targeting?.devices.includes(d)} onChange={e => handleListChange('targeting', 'devices', d, e.target.checked)} className="h-4 w-4"/> <label htmlFor={`device-${d}`} className="ml-2 text-sm">{t(`admin.popups.form.devicesList.${d}`)}</label></div>)}
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('admin.popups.form.users')}</label>
                        <div className="mt-1 space-y-1">
                            {/* FIX: Add 'admin' to the list of user roles that can be targeted for popups. */}
                            {(['guest', 'candidate', 'company', 'admin'] as const).map(u => <div key={u} className="flex items-center"><input type="checkbox" id={`user-${u}`} checked={formData.targeting?.users.includes(u)} onChange={e => handleListChange('targeting', 'users', u, e.target.checked)} className="h-4 w-4"/> <label htmlFor={`user-${u}`} className="ml-2 text-sm">{t(`admin.popups.form.usersList.${u}`)}</label></div>)}
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button type="button" variant="light" onClick={onCancel}>{t('admin.popups.form.cancel')}</Button>
                <Button type="submit">{t('admin.popups.form.save')}</Button>
            </div>
        </form>
    );
};

const AdminPopupsPage: React.FC = () => {
    const [popups, setPopups] = useState<PopupAd[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPopup, setEditingPopup] = useState<Partial<PopupAd> | null>(null);
    const { t } = useI18n();

    const fetchPopups = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getPopupAds();
            setPopups(data);
        } catch (error) {
            console.error("Failed to fetch pop-ups", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPopups();
    }, [fetchPopups]);

    const handleCreateNew = () => {
        setEditingPopup({
            name: '', isActive: true,
            content: { imageUrl: '', title: {es:'',en:'',fr:''}, text: {es:'',en:'',fr:''}, ctaButton: { text: {es:'',en:'',fr:''}, link: '' } },
            appearance: { size: 'md', position: 'center', overlayOpacity: 0.5 },
            triggers: { type: 'delay', value: 3 },
            frequency: { type: 'session' },
            targeting: { pages: ['/'], devices: ['desktop', 'mobile'], users: ['guest'] }
        });
        setIsModalOpen(true);
    };

    const handleEdit = (popup: PopupAd) => {
        setEditingPopup(popup);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('admin.popups.confirmDelete'))) {
            await api.deletePopupAd(id);
            fetchPopups();
        }
    };

    const handleSave = async (data: Omit<PopupAd, 'id'> & { id?: string }) => {
        await api.savePopupAd(data);
        fetchPopups();
        setIsModalOpen(false);
        setEditingPopup(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-gray-800">{t('admin.popups.title')}</h1>
                <Button onClick={handleCreateNew}>{t('admin.popups.add')}</Button>
            </div>
            {loading ? (
                <p>{t('admin.popups.loading')}</p>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.popups.table.name')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.popups.table.status')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.popups.table.triggers')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.popups.table.targeting')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.popups.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {popups.map(popup => (
                                    <tr key={popup.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{popup.name}</td>
                                        <td className="p-4"><span className={`px-2 py-1 text-xs rounded-full ${popup.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{popup.isActive ? 'Active' : 'Inactive'}</span></td>
                                        <td className="p-4 text-sm text-gray-600">{popup.triggers.type} ({popup.triggers.value}{popup.triggers.type === 'delay' ? 's' : '%'})</td>
                                        <td className="p-4 text-sm text-gray-600">{popup.targeting.pages.join(', ')}</td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Button variant="secondary" size="sm" onClick={() => handleEdit(popup)}>{t('admin.popups.edit')}</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(popup.id)}>{t('admin.popups.delete')}</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {editingPopup && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPopup.id ? t('admin.popups.modalEditTitle') : t('admin.popups.modalCreateTitle')}>
                    <PopupForm popup={editingPopup} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

export default AdminPopupsPage;
