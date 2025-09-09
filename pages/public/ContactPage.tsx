

import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { api } from '../../services/api';
import type { SiteSettings } from '../../types';
import { useI18n } from '../../contexts/I18nContext';

declare const L: any;

const ContactPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { t } = useI18n();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  
  useEffect(() => {
    api.getSiteSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (settings && settings.contactLatitude && settings.contactLongitude && mapContainerRef.current && !mapRef.current) {
        // Initialize map
        const map = L.map(mapContainerRef.current).setView([settings.contactLatitude, settings.contactLongitude], 15);
        mapRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add marker
        L.marker([settings.contactLatitude, settings.contactLongitude]).addTo(map)
            .bindPopup(settings.contactAddress)
            .openPopup();
    }
    
    // Cleanup function to prevent map re-initialization issues in React StrictMode
    return () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, [settings]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        await api.saveContactSubmission(formData);
        setSubmitted(true);
      } catch (error) {
        console.error("Failed to submit form", error);
        alert("There was an error submitting your message. Please try again.");
      } finally {
        setLoading(false);
      }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow">
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
                    {t('contact.title').split(' ')[0]} {t('contact.title').split(' ')[1]} <span className="text-secondary">{t('contact.title').split(' ')[2]}</span>
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
                   {t('contact.subtitle')}
                </p>
            </div>
        </div>
        
        <div className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 bg-white p-8 rounded-lg shadow-md space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">{t('contact.info')}</h2>
                        <div className="flex items-start space-x-3">
                            <svg className="w-6 h-6 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <div>
                                <h3 className="font-semibold">{t('contact.address')}</h3>
                                <p className="text-gray-600">{settings?.contactAddress || t('contact.loading')}</p>
                            </div>
                        </div>
                         <div className="flex items-start space-x-3">
                            <svg className="w-6 h-6 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                             <div>
                                <h3 className="font-semibold">{t('contact.phone')}</h3>
                                <p className="text-gray-600">{settings?.contactPhone || t('contact.loading')}</p>
                            </div>
                        </div>
                         <div className="flex items-start space-x-3">
                            <svg className="w-6 h-6 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                             <div>
                                <h3 className="font-semibold">{t('contact.email')}</h3>
                                <p className="text-gray-600">{settings?.contactEmail || t('contact.loading')}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t">
                            <div
                                ref={mapContainerRef}
                                id="contact-map"
                                style={{ height: '300px' }}
                                className="bg-gray-200 rounded-md z-0"
                            >
                                {/* Map will be rendered here by Leaflet */}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="p-8">
                        {submitted ? (
                            <div className="text-center py-10">
                                <h2 className="text-2xl font-bold text-green-600">{t('contact.thanks')}</h2>
                                <p className="mt-4 text-gray-700">{t('contact.messageReceived')}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-800">{t('contact.sendMessage')}</h2>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('contact.fullName')}</label>
                                    <input type="text" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('contact.email')}</label>
                                    <input type="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">{t('contact.subject')}</label>
                                    <input type="text" id="subject" value={formData.subject} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">{t('contact.message')}</label>
                                    <textarea id="message" rows={5} value={formData.message} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"></textarea>
                                </div>
                                <div>
                                    <Button type="submit" className="w-full" isLoading={loading}>{t('contact.submitButton')}</Button>
                                </div>
                            </form>
                        )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;