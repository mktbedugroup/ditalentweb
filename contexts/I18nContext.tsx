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
    const initLocaleAndTranslations = async () => {
      setLoading(true);
      try {
        const settings = await api.getSiteSettings();
        setSiteSettings(settings);

        const savedLocale = localStorage.getItem('locale') as Locale;
        const initialLocale = (savedLocale && settings.availableLanguages?.includes(savedLocale)) 
            ? savedLocale 
            : settings.defaultLanguage || 'es';
        
        const response = await fetch(`./translations/${initialLocale}.json`);
        if (!response.ok) {
            throw new Error(`Could not load translations for ${initialLocale}`);
        }
        const data = await response.json();
        console.log(`[i18n Debug] Loaded translations for ${initialLocale}:`, data); // NEW CONSOLE.LOG
        setTranslations(data);

        setLocaleState(initialLocale);
      } catch (e) {
        console.error("Failed to load initial data (settings or translations)", e);
        setLocaleState('es');
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };
    initLocaleAndTranslations();
  }, []);

  

  const setLocale = useCallback(async (newLocale: Locale) => {
      if (siteSettings?.availableLanguages?.includes(newLocale)) {
        localStorage.setItem('locale', newLocale);
        setLocaleState(newLocale);

        try {
            const response = await fetch(`./translations/${newLocale}.json`);
            if (!response.ok) {
                throw new Error(`Could not load translations for ${newLocale}`);
            }
            const data = await response.json();
            setTranslations(data);
        } catch (error) {
            console.error(`Failed to load translations for ${newLocale}`, error);
            setTranslations({});
        }
      }
  }, [siteSettings]);

  const t = useCallback((key: string): string => {
    console.log(`[i18n Debug] Attempting to translate key: ${key}`);
    console.log(`[i18n Debug] Current translations object:`, translations);

    if (!translations) {
      console.log(`[i18n Debug] Translations object is null or empty for key: ${key}`);
      return key;
    }
    const keys = key.split('.');
    let result: any = translations;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        console.log(`[i18n Debug] Key part "${k}" not found in current result for key: ${key}`);
        return key;
      }
    }
    console.log(`[i18n Debug] Successfully translated key: ${key} to: ${result}`);
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