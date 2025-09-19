import React, { useState, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useLocation } = ReactRouterDOM;
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { PopupAd, User } from '../../types';
import { PopupDisplay } from './PopupDisplay';

const getDeviceType = (): 'desktop' | 'mobile' => {
    return window.innerWidth < 768 ? 'mobile' : 'desktop';
};

export const PopupManager: React.FC = () => {
    const location = useLocation();
    const { user } = useAuth();
    const [activePopup, setActivePopup] = useState<PopupAd | null>(null);
    const [isExiting, setIsExiting] = useState(false);
    
    const userRole: User['role'] | 'guest' = user ? user.role : 'guest';
    const deviceType = getDeviceType();

    const shouldShowPopup = useCallback((popup: PopupAd): boolean => {
        const key = `popup_${popup.id}_shown`;
        if (popup.frequency.type === 'session') {
            return sessionStorage.getItem(key) !== 'true';
        }
        if (popup.frequency.type === 'days') {
            const lastShown = localStorage.getItem(key);
            if (lastShown) {
                const days = popup.frequency.value || 1;
                const msSinceShown = Date.now() - parseInt(lastShown, 10);
                if (msSinceShown < days * 24 * 60 * 60 * 1000) {
                    return false;
                }
            }
        }
        return true;
    }, []);

    const markPopupAsShown = (popup: PopupAd) => {
        const key = `popup_${popup.id}_shown`;
        if (popup.frequency.type === 'session') {
            sessionStorage.setItem(key, 'true');
        }
        if (popup.frequency.type === 'days') {
            localStorage.setItem(key, Date.now().toString());
        }
    };

    const triggerPopup = useCallback((popup: PopupAd) => {
        if (shouldShowPopup(popup)) {
            setActivePopup(popup);
        }
    }, [shouldShowPopup]);

    useEffect(() => {
        // Reset on route change
        setActivePopup(null);
        setIsExiting(false);
        
        // Don't show popups on private routes
        const isPrivateRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/candidate') || location.pathname.startsWith('/company');
        if (isPrivateRoute) return;

        const fetchAndSetPopups = async () => {
            const popups = await api.getActivePopupsForRoute(location.pathname, deviceType, userRole);
            console.log('Fetched popups:', popups);
            const listeners: (() => void)[] = [];

            for (const popup of popups) {
                if (!shouldShowPopup(popup)) continue;

                if (popup.triggers.type === 'delay') {
                    const timer = setTimeout(() => triggerPopup(popup), popup.triggers.value * 1000);
                    listeners.push(() => clearTimeout(timer));
                }
                
                if (popup.triggers.type === 'scroll') {
                    const handleScroll = () => {
                        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                        if (scrollPercent >= popup.triggers.value) {
                            triggerPopup(popup);
                            window.removeEventListener('scroll', handleScroll);
                        }
                    };
                    window.addEventListener('scroll', handleScroll);
                    listeners.push(() => window.removeEventListener('scroll', handleScroll));
                }

                if (popup.triggers.type === 'exit-intent' && deviceType === 'desktop') {
                    const handleMouseOut = (e: MouseEvent) => {
                        if (e.clientY <= 0 && !isExiting) {
                            setIsExiting(true);
                            triggerPopup(popup);
                        }
                    };
                    document.addEventListener('mouseout', handleMouseOut);
                    listeners.push(() => document.removeEventListener('mouseout', handleMouseOut));
                }
                
                // Only handle the first valid popup
                if (listeners.length > 0) break;
            }

            return () => {
                listeners.forEach(cleanup => cleanup());
            };
        };

        const cleanupPromise = fetchAndSetPopups();
        return () => {
             cleanupPromise.then(cleanup => {
                if(cleanup) cleanup();
             });
        }
    }, [location.pathname, deviceType, userRole, isExiting, shouldShowPopup, triggerPopup]);
    
    const handleClose = () => {
        if (activePopup) {
            markPopupAsShown(activePopup);
        }
        setActivePopup(null);
    };

    if (!activePopup) {
        return null;
    }
    
    return <PopupDisplay popup={activePopup} onClose={handleClose} />;
};
