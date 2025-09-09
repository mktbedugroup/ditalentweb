import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import type { Company } from '../../types';
import { Card } from '../../components/common/Card';
import { useI18n } from '../../contexts/I18nContext';

// Add type definition for Leaflet to avoid TypeScript errors
declare const L: any;

const AdminMapPage: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const { t, t_dynamic } = useI18n();

    useEffect(() => {
        setLoading(true);
        api.getCompanies()
            .then(setCompanies)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!loading && mapContainerRef.current && !mapRef.current) {
            // Initialize map
            mapRef.current = L.map(mapContainerRef.current).setView([18.7357, -70.1627], 8); // Centered on Dominican Republic

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);
        }

        // Add markers
        if (mapRef.current && companies.length > 0) {
            companies.forEach(company => {
                if (company.latitude && company.longitude) {
                    L.marker([company.latitude, company.longitude])
                        .addTo(mapRef.current)
                        .bindPopup(`<b>${t_dynamic(company.name)}</b><br>${company.address || ''}`);
                }
            });
        }
    }, [loading, companies, t_dynamic]);

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">{t('admin.map.title')}</h1>
            <Card>
                <div 
                    ref={mapContainerRef} 
                    id="company-map" 
                    style={{ height: '70vh', width: '100%' }}
                    className="rounded-lg"
                >
                    {loading && <p className="p-4">Loading map data...</p>}
                </div>
            </Card>
        </div>
    );
};

export default AdminMapPage;