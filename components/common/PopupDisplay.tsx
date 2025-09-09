import React from 'react';
import type { PopupAd } from '../../types';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from './Button';

interface PopupDisplayProps {
  popup: PopupAd;
  onClose: () => void;
}

export const PopupDisplay: React.FC<PopupDisplayProps> = ({ popup, onClose }) => {
    const { t_dynamic } = useI18n();

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
    };

    const positionClasses = {
        center: 'items-center justify-center',
        'bottom-right': 'items-end justify-end',
        'bottom-left': 'items-end justify-start',
    };

    return (
        <div 
            className={`fixed inset-0 z-50 flex p-4 ${positionClasses[popup.appearance.position]}`}
            style={{ backgroundColor: `rgba(0, 0, 0, ${popup.appearance.overlayOpacity})` }}
            onClick={onClose}
        >
            <div 
                className={`bg-white rounded-lg shadow-2xl w-full ${sizeClasses[popup.appearance.size]} overflow-hidden transform transition-all duration-300 animate-fade-in-up relative`}
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 z-10 text-2xl leading-none">&times;</button>
                {popup.content.imageUrl && <img src={popup.content.imageUrl} alt={t_dynamic(popup.content.title)} className="w-full h-48 object-cover" />}
                <div className="p-6 text-center">
                    <h3 className="text-2xl font-bold text-gray-800">{t_dynamic(popup.content.title)}</h3>
                    <p className="mt-2 text-gray-600">{t_dynamic(popup.content.text)}</p>
                    <div className="mt-6">
                        <a href={popup.content.ctaButton.link}>
                            <Button>{t_dynamic(popup.content.ctaButton.text)}</Button>
                        </a>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
