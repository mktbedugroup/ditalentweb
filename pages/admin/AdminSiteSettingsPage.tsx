import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { SiteSettings, MultilingualString, FooterLink } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { MultilingualInput, MultilingualTextarea } from '../../components/common/Multilingual';
import { useI18n } from '../../contexts/I18nContext';

const DynamicListManager: React.FC<{
    title: string;
    items: string[];
    onItemsChange: (newItems: string[]) => void;
}> = ({ title, items, onItemsChange }) => {
    const { t } = useI18n();

    const handleItemChange = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = value;
        onItemsChange(newItems);
    };

    const handleAddItem = () => {
        onItemsChange([...items, '']);
    };

    const handleRemoveItem = (index: number) => {
        onItemsChange(items.filter((_, i) => i !== index));
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange(index, e.target.value)}
                            className="flex-grow border border-gray-300 rounded-md p-2 bg-white text-gray-900"
                        />
                        <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveItem(index)}>
                            {t('admin.settings.remove')}
                        </Button>
                    </div>
                ))}
            </div>
            <Button type="button" variant="light" size="sm" onClick={handleAddItem} className="mt-2">
                {t('admin.settings.addOption')}
            </Button>
        </div>
    );
};


const AdminSiteSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<Partial<SiteSettings>>({ jobTypes: [], educationLevels: [], footerLinks: [], paymentGateways: { stripe: { publicKey: '', secretKey: '' }, paypal: { clientId: '', clientSecret: '' } }, availableLanguages: [], defaultLanguage: 'es', availableLocations: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const { t } = useI18n();

    useEffect(() => {
        setLoading(true);
        api.getSiteSettings()
            .then(data => setSettings(data || { jobTypes: [], educationLevels: [], footerLinks: [], paymentGateways: { stripe: { publicKey: '', secretKey: '' }, paypal: { clientId: '', clientSecret: '' } }, availableLanguages: [], defaultLanguage: 'es' }))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setSettings(prev => ({ ...prev, [name]: checked }));
            return;
        }

        if (name === 'contactLatitude' || name === 'contactLongitude') {
            const numValue = value === '' ? null : Number(value);
            setSettings(prev => ({ ...prev, [name]: numValue }));
        } else if (name.startsWith('paymentGateways.')) {
            const [parent, child, key] = name.split('.');
            setSettings(prev => ({
                ...prev,
                paymentGateways: {
                    ...prev.paymentGateways,
                    [child]: {
                        // @ts-ignore
                        ...prev.paymentGateways[child],
                        [key]: value
                    }
                } as any
            }));
        } else {
            setSettings(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleMultilingualChange = (fieldName: keyof SiteSettings, value: MultilingualString) => {
        setSettings(prev => ({...prev, [fieldName]: value}));
    }

    const handleListChange = (listName: 'jobTypes' | 'educationLevels', newItems: string[]) => {
        setSettings(prev => ({ ...prev, [listName]: newItems }));
    };

    const handleAvailableLanguageChange = (lang: 'es' | 'en' | 'fr', isChecked: boolean) => {
        setSettings(prev => {
            const currentLangs = prev.availableLanguages || [];
            if (isChecked) {
                return { ...prev, availableLanguages: [...currentLangs, lang].sort() };
            } else {
                if (currentLangs.length <= 1) {
                    alert('At least one language must be available.');
                    return prev;
                }
                if (prev.defaultLanguage === lang) {
                    alert('You cannot disable the default language.');
                    return prev;
                }
                return { ...prev, availableLanguages: currentLangs.filter(l => l !== lang) };
            }
        });
    };
    
    const handleFooterLinkChange = (index: number, field: keyof FooterLink, value: string | MultilingualString) => {
        setSettings(prev => {
            const newLinks = [...(prev.footerLinks || [])];
            newLinks[index] = { ...newLinks[index], [field as any]: value };
            return { ...prev, footerLinks: newLinks };
        });
    };

    const handleFooterLinkAdd = () => {
        setSettings(prev => {
            const newLinks = [...(prev.footerLinks || [])];
            newLinks.push({
                id: `fl${Date.now()}`,
                title: { es: 'Nuevo Enlace', en: 'New Link', fr: 'Nouveau Lien' },
                url: '/'
            });
            return { ...prev, footerLinks: newLinks };
        });
    };

    const handleFooterLinkRemove = (index: number) => {
        setSettings(prev => {
            const newLinks = (prev.footerLinks || []).filter((_, i) => i !== index);
            return { ...prev, footerLinks: newLinks };
        });
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await api.saveSiteSettings(settings as SiteSettings);
            setMessage(t('admin.settings.successMsg'));
            setTimeout(() => {
              setMessage('');
              // Force a reload to apply new language settings globally
              window.location.reload();
            }, 1500);
        } catch (error) {
            setMessage(t('admin.settings.errorMsg'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p>{t('admin.settings.loading')}</p>;
    }

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">{t('admin.settings.title')}</h1>
            <Card>
                <form onSubmit={handleSubmit} className="p-6 space-y-8 divide-y divide-gray-200">
                    {/* Language Settings Section */}
                    <section className="pt-6 first:pt-0">
                        <h2 className="text-xl font-semibold text-gray-700 pb-2 mb-4">{t('admin.settings.languageSettings')}</h2>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="enableLanguageSwitcher" 
                                    name="enableLanguageSwitcher" 
                                    checked={!!settings.enableLanguageSwitcher} 
                                    onChange={handleChange}
                                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <label htmlFor="enableLanguageSwitcher" className="ml-2 block text-sm font-medium text-gray-900">
                                    {t('admin.settings.enableLanguageSwitcher')}
                                </label>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('admin.settings.availableLanguages')}</label>
                                <div className="mt-2 flex space-x-4">
                                    {(['es', 'en', 'fr'] as const).map(lang => (
                                        <div key={lang} className="flex items-center">
                                            <input 
                                                type="checkbox" 
                                                id={`lang-${lang}`} 
                                                checked={settings.availableLanguages?.includes(lang) || false}
                                                onChange={e => handleAvailableLanguageChange(lang, e.target.checked)}
                                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                            />
                                            <label htmlFor={`lang-${lang}`} className="ml-2 text-sm">{lang.toUpperCase()}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700">{t('admin.settings.defaultLanguage')}</label>
                                <select 
                                    id="defaultLanguage" 
                                    name="defaultLanguage" 
                                    value={settings.defaultLanguage} 
                                    onChange={handleChange} 
                                    className="mt-1 block w-full max-w-xs border border-gray-300 rounded-md p-2 bg-white text-gray-900"
                                >
                                    <option value="es">Español (es)</option>
                                    <option value="en">English (en)</option>
                                    <option value="fr">Français (fr)</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* About Page Section */}
                    <section className="pt-6 first:pt-0">
                        <h2 className="text-xl font-semibold text-gray-700 pb-2 mb-4">{t('admin.settings.aboutContent')}</h2>
                        <div className="space-y-4">
                            <MultilingualTextarea label={t('admin.settings.mission')} name="mission" value={settings.mission || { es: '', en: '', fr: '' }} onChange={value => handleMultilingualChange('mission', value)} rows={3} />
                            <MultilingualTextarea label={t('admin.settings.vision')} name="vision" value={settings.vision || { es: '', en: '', fr: '' }} onChange={value => handleMultilingualChange('vision', value)} rows={3} />
                            <MultilingualTextarea label={t('admin.settings.values')} name="values" value={settings.values || { es: '', en: '', fr: '' }} onChange={value => handleMultilingualChange('values', value)} rows={4} />
                        </div>
                    </section>

                    {/* Careers Page Section */}
                    <section className="pt-6 first:pt-0">
                        <h2 className="text-xl font-semibold text-gray-700 pb-2 mb-4">{t('admin.settings.careersContent')}</h2>
                        <div className="space-y-4">
                            <MultilingualInput label={t('admin.settings.pageTitle')} name="careersPageTitle" value={settings.careersPageTitle || { es: '', en: '', fr: '' }} onChange={value => handleMultilingualChange('careersPageTitle', value)} />
                            <MultilingualTextarea label={t('admin.settings.pageSubtitle')} name="careersPageSubtitle" value={settings.careersPageSubtitle || { es: '', en: '', fr: '' }} onChange={value => handleMultilingualChange('careersPageSubtitle', value)} rows={2} />
                            <MultilingualInput label={t('admin.settings.ctaTitle')} name="careersPageCtaTitle" value={settings.careersPageCtaTitle || { es: '', en: '', fr: '' }} onChange={value => handleMultilingualChange('careersPageCtaTitle', value)} />
                            <MultilingualTextarea label={t('admin.settings.ctaText')} name="careersPageCtaText" value={settings.careersPageCtaText || { es: '', en: '', fr: '' }} onChange={value => handleMultilingualChange('careersPageCtaText', value)} rows={2} />
                        </div>
                    </section>
                    
                    {/* Form Options Section */}
                     <section className="pt-6 first:pt-0">
                        <h2 className="text-xl font-semibold text-gray-700 pb-2 mb-4">{t('admin.settings.formOptions')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <DynamicListManager
                                title={t('admin.settings.jobTypes')}
                                items={settings.jobTypes || []}
                                onItemsChange={(newItems) => handleListChange('jobTypes', newItems)}
                           />
                           <DynamicListManager
                                title={t('admin.settings.educationLevels')}
                                items={settings.educationLevels || []}
                                onItemsChange={(newItems) => handleListChange('educationLevels', newItems)}
                           />
                           <DynamicListManager
                                title={t('admin.settings.availableLocations')}
                                items={settings.availableLocations || []}
                                onItemsChange={(newItems) => handleListChange('availableLocations', newItems)}
                           />
                        </div>
                    </section>

                    {/* Contact Info Section */}
                    <section className="pt-6 first:pt-0">
                        <h2 className="text-xl font-semibold text-gray-700 pb-2 mb-4">{t('admin.settings.contactInfo')}</h2>
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="contactAddress" className="block text-sm font-medium text-gray-700">{t('admin.settings.address')}</label>
                                <input type="text" id="contactAddress" name="contactAddress" value={settings.contactAddress || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
                            </div>
                             <div>
                                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">{t('admin.settings.phone')}</label>
                                <input type="text" id="contactPhone" name="contactPhone" value={settings.contactPhone || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
                            </div>
                             <div>
                                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">{t('admin.settings.email')}</label>
                                <input type="email" id="contactEmail" name="contactEmail" value={settings.contactEmail || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="contactLatitude" className="block text-sm font-medium text-gray-700">{t('admin.settings.latitude')}</label>
                                    <input type="number" step="any" id="contactLatitude" name="contactLatitude" value={settings.contactLatitude || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label htmlFor="contactLongitude" className="block text-sm font-medium text-gray-700">{t('admin.settings.longitude')}</label>
                                    <input type="number" step="any" id="contactLongitude" name="contactLongitude" value={settings.contactLongitude || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    {/* Payment Gateways Section */}
                    <section className="pt-6 first:pt-0">
                        <h2 className="text-xl font-semibold text-gray-700 pb-2 mb-4">{t('admin.settings.paymentGateways')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 p-4 border rounded-md">
                                <h3 className="font-medium">Stripe</h3>
                                <div><label className="block text-sm font-medium text-gray-700">{t('admin.settings.stripePublicKey')}</label><input type="text" name="paymentGateways.stripe.publicKey" value={settings.paymentGateways?.stripe.publicKey || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white text-gray-900" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">{t('admin.settings.stripeSecretKey')}</label><input type="text" name="paymentGateways.stripe.secretKey" value={settings.paymentGateways?.stripe.secretKey || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white text-gray-900" /></div>
                            </div>
                            <div className="space-y-4 p-4 border rounded-md">
                                <h3 className="font-medium">PayPal</h3>
                                <div><label className="block text-sm font-medium text-gray-700">{t('admin.settings.paypalClientId')}</label><input type="text" name="paymentGateways.paypal.clientId" value={settings.paymentGateways?.paypal.clientId || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white text-gray-900" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">{t('admin.settings.paypalClientSecret')}</label><input type="text" name="paymentGateways.paypal.clientSecret" value={settings.paymentGateways?.paypal.clientSecret || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white text-gray-900" /></div>
                            </div>
                        </div>
                    </section>


                    {/* Footer Content Section */}
                    <section className="pt-6 first:pt-0">
                        <h2 className="text-xl font-semibold text-gray-700 pb-2 mb-4">{t('admin.settings.footerContent')}</h2>
                        <div className="space-y-4">
                            <MultilingualInput label={t('admin.settings.copyrightText')} name="footerCopyright" value={settings.footerCopyright || { es: '', en: '', fr: '' }} onChange={value => handleMultilingualChange('footerCopyright', value)} />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('admin.settings.footerLinks')}</h3>
                                <div className="space-y-2">
                                    {(settings.footerLinks || []).map((link, index) => (
                                        <div key={link.id || index} className="p-4 border rounded-md space-y-2 relative bg-gray-50">
                                            <Button type="button" variant="danger" size="sm" className="absolute top-2 right-2" onClick={() => handleFooterLinkRemove(index)}>&times;</Button>
                                            <MultilingualInput label={t('admin.settings.linkTitle')} name={`footerLinkTitle-${index}`} value={link.title} onChange={value => handleFooterLinkChange(index, 'title', value)} />
                                            <div>
                                                <label className="block text-sm font-medium">{t('admin.settings.linkUrl')}</label>
                                                <input type="text" value={link.url} onChange={e => handleFooterLinkChange(index, 'url', e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"/>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="light" size="sm" onClick={handleFooterLinkAdd} className="mt-2">
                                    {t('admin.settings.addFooterLink')}
                                </Button>
                            </div>
                        </div>
                    </section>


                    <div className="flex items-center justify-end pt-6">
                        {message && <p className={`text-sm mr-4 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
                        <Button type="submit" isLoading={saving}>{t('admin.settings.save')}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AdminSiteSettingsPage;