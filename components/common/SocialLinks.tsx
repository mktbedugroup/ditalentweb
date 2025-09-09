import React from 'react';
import type { SocialLink } from '../../types';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from './Button';

type Platform = SocialLink['platform'];

const SocialIcon: React.FC<{ platform: Platform, className?: string }> = ({ platform, className = "h-6 w-6" }) => {
    const icons: Record<Platform, React.ReactNode> = {
        LinkedIn: <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>,
        GitHub: <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>,
        Twitter: <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.295 1.616 4.22 3.766 4.66-1.073.284-2.24.174-3.251.096.606 1.956 2.356 3.337 4.432 3.374-1.758 1.457-3.921 2.332-6.2 2.332-.42 0-.833-.025-1.245-.073 2.289 1.547 5.076 2.42 8.1 2.42 9.7 0 15-8.283 14.6-15.615.965-.694 1.798-1.562 2.457-2.54z"></path></svg>,
        Facebook: <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>,
        Instagram: <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.148-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44c0-.795-.645-1.44-1.441-1.44z"></path></svg>,
        Website: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>,
        Portfolio: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>,
        Other: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>,
    };
    return icons[platform] || icons['Other'];
};

export const SocialLinksDisplay: React.FC<{ links?: SocialLink[] }> = ({ links }) => {
  if (!links || links.length === 0) return null;

  return (
    <div className="flex items-center space-x-4">
      {links.map(link => (
        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" title={link.platform} className="text-gray-500 hover:text-primary transition-colors">
          <SocialIcon platform={link.platform} />
        </a>
      ))}
    </div>
  );
};

export const SocialLinksManager: React.FC<{
  value: SocialLink[];
  onChange: (newValue: SocialLink[]) => void;
}> = ({ value, onChange }) => {
  const { t } = useI18n();
  const platforms: Platform[] = ['LinkedIn', 'GitHub', 'Portfolio', 'Website', 'Facebook', 'Twitter', 'Instagram', 'Other'];

  const handleLinkChange = (index: number, field: keyof SocialLink, fieldValue: string) => {
    const newLinks = [...value];
    newLinks[index] = { ...newLinks[index], [field]: fieldValue };
    onChange(newLinks);
  };

  const handleAddLink = () => {
    const newLink: SocialLink = {
      id: `new_${Date.now()}`,
      platform: 'Website',
      url: '',
    };
    onChange([...value, newLink]);
  };

  const handleRemoveLink = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
       <h3 className="text-lg font-semibold border-b pb-2">{t('candidate.profile.socialLinks')}</h3>
      {value.map((link, index) => (
        <div key={link.id || index} className="p-3 border rounded-md bg-gray-50 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end relative">
           <div className="sm:col-span-1">
                <label className="block text-sm font-medium">{t('socialLinks.platform')}</label>
                <select 
                    value={link.platform} 
                    onChange={e => handleLinkChange(index, 'platform', e.target.value)}
                    className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"
                >
                    {platforms.map(p => <option key={p} value={p}>{t(`socialLinks.platforms.${p}`)}</option>)}
                </select>
            </div>
           <div className="sm:col-span-2">
                <label className="block text-sm font-medium">{t('socialLinks.url')}</label>
                 <input 
                    type="url" 
                    value={link.url}
                    onChange={e => handleLinkChange(index, 'url', e.target.value)}
                    className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900"
                    placeholder="https://..."
                />
            </div>
          <button type="button" onClick={() => handleRemoveLink(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold">&times;</button>
        </div>
      ))}
       <Button type="button" variant="light" size="sm" onClick={handleAddLink}>
            {t('socialLinks.add')}
       </Button>
    </div>
  );
};