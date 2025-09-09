import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { api } from '../../services/api';
import type { SiteSettings } from '../../types';
const { Link } = ReactRouterDOM;

const Footer: React.FC = () => {
  const { t_dynamic } = useI18n();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
      api.getSiteSettings().then(setSettings);
  }, []);

  if (!settings) {
    return (
        <footer className="bg-white mt-12 border-t">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center text-sm text-gray-500 animate-pulse">
                    Loading footer...
                </div>
            </div>
        </footer>
    );
  }

  return (
    <footer className="bg-white mt-12 border-t">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-500">
          <p>{t_dynamic(settings.footerCopyright)}</p>
          {settings.footerLinks && settings.footerLinks.length > 0 && (
            <div className="mt-4 flex justify-center flex-wrap gap-x-6 gap-y-2">
                {settings.footerLinks.map(link => (
                    <Link key={link.id} to={link.url} className="hover:text-gray-900">{t_dynamic(link.title)}</Link>
                ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;