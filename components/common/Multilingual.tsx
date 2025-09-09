import React, { useState } from 'react';
import type { MultilingualString, MultilingualStringArray } from '../../types';
import { Button } from './Button';

type LocaleKey = 'es' | 'en' | 'fr';

const LanguageTabs: React.FC<{ activeTab: LocaleKey; onTabClick: (tab: LocaleKey) => void }> = ({ activeTab, onTabClick }) => (
  <div className="flex border-b">
    {(['es', 'en', 'fr'] as LocaleKey[]).map(lang => (
      <button
        key={lang}
        type="button"
        onClick={() => onTabClick(lang)}
        className={`px-4 py-2 text-sm font-medium flex-1 ${activeTab === lang ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-500 hover:bg-gray-50'}`}
      >
        {lang.toUpperCase()}
      </button>
    ))}
  </div>
);

interface MultilingualInputProps {
  label: string;
  value: MultilingualString;
  onChange: (newValue: MultilingualString) => void;
  name: string;
}

export const MultilingualInput: React.FC<MultilingualInputProps> = ({ label, value, onChange, name }) => {
  const [activeLang, setActiveLang] = useState<LocaleKey>('es');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, [activeLang]: e.target.value });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 border rounded-md">
        <LanguageTabs activeTab={activeLang} onTabClick={setActiveLang} />
        <div className="p-2">
          <input
            type="text"
            name={`${name}-${activeLang}`}
            value={value[activeLang] || ''}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
};

interface MultilingualTextareaProps {
  label: string;
  value: MultilingualString;
  onChange: (newValue: MultilingualString) => void;
  name: string;
  rows?: number;
}

export const MultilingualTextarea: React.FC<MultilingualTextareaProps> = ({ label, value, onChange, name, rows = 4 }) => {
  const [activeLang, setActiveLang] = useState<LocaleKey>('es');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...value, [activeLang]: e.target.value });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 border rounded-md">
        <LanguageTabs activeTab={activeLang} onTabClick={setActiveLang} />
        <div className="p-2">
          <textarea
            name={`${name}-${activeLang}`}
            value={value[activeLang] || ''}
            onChange={handleChange}
            rows={rows}
            className="w-full border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
};

interface MultilingualListManagerProps {
    label: string;
    value: MultilingualStringArray;
    onChange: (newValue: MultilingualStringArray) => void;
}

export const MultilingualListManager: React.FC<MultilingualListManagerProps> = ({ label, value, onChange }) => {
    const [activeLang, setActiveLang] = useState<LocaleKey>('es');

    const handleItemChange = (index: number, itemValue: string) => {
        const newItems = [...(value[activeLang] || [])];
        newItems[index] = itemValue;
        onChange({ ...value, [activeLang]: newItems });
    };

    const handleAddItem = () => {
        const newItems = [...(value[activeLang] || []), ''];
        onChange({ ...value, [activeLang]: newItems });
    };
    
    const handleRemoveItem = (index: number) => {
        const newItems = [...(value[activeLang] || [])].filter((_, i) => i !== index);
        onChange({ ...value, [activeLang]: newItems });
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
             <div className="mt-1 border rounded-md">
                <LanguageTabs activeTab={activeLang} onTabClick={setActiveLang} />
                <div className="p-2 space-y-2">
                    {(value[activeLang] || []).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => handleItemChange(index, e.target.value)}
                                className="flex-grow w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-primary focus:border-primary"
                            />
                            <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveItem(index)}>
                                Remove
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="light" size="sm" onClick={handleAddItem}>
                        Add Item
                    </Button>
                </div>
             </div>
        </div>
    );
};
