import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { MultilingualString, SiteSettings } from '../types';

type Locale = 'en' | 'es' | 'fr';
type Translations = { [key: string]: any };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  t_dynamic: (field: MultilingualString | undefined) => string;
  siteSettings: SiteSettings | null;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('es');
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const initLocale = async () => {
      setLoading(true);
      try {
        const settings = await api.getSiteSettings();
        setSiteSettings(settings);

        const savedLocale = localStorage.getItem('locale') as Locale;
        const initialLocale = (savedLocale && settings.availableLanguages?.includes(savedLocale)) 
            ? savedLocale 
            : settings.defaultLanguage || 'es';
        
        setLocaleState(initialLocale);
      } catch (e) {
        console.error("Failed to load site settings for locale", e);
        setLocaleState('es');
      } finally {
        setLoading(false);
      }
    };
    initLocale();
  }, []);

  useEffect(() => {
    if (loading) return; // Wait for initial locale to be set

    const fetchTranslations = async (lang: Locale) => {
      try {
        const response = await fetch(`./translations/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Could not load translations for ${lang}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error(error);
        if (locale !== 'es') {
          // Fallback to Spanish if the selected language file fails to load
          setLocale('es');
        }
      }
    };
    fetchTranslations(locale);
  }, [locale, loading]);

  const setLocale = (newLocale: Locale) => {
      if (siteSettings?.availableLanguages?.includes(newLocale)) {
        localStorage.setItem('locale', newLocale);
        setLocaleState(newLocale);
      }
  };

  const t = useCallback((key: string): string => {
    if (!translations) {
      return key;
    }
    const keys = key.split('.');
    let result: any = translations;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key;
      }
    }
    return typeof result === 'string' ? result : key;
  }, [translations]);

  const t_dynamic = useCallback((field: MultilingualString | undefined): string => {
    if (!field) return '';
    const translated = field[locale] || field.es || ''; // Fallback to Spanish, then empty
    console.log('t_dynamic - field:', field, 'locale:', locale, 'translated:', translated);
    return translated;
  }, [locale]);
  
  if (loading || !translations) {
      return <div className="flex justify-center items-center h-screen"><div>Loading...</div></div>;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, t_dynamic, siteSettings }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};