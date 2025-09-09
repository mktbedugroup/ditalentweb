import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { SubscriptionPlan, Company } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useI18n } from '../../contexts/I18nContext';
import * as ReactRouterDOM from 'react-router-dom';
const { useParams, useNavigate, Link } = ReactRouterDOM;

const CompanyUpgradePage: React.FC = () => {
    const { planId } = useParams<{ planId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const { t, t_dynamic } = useI18n();
    
    useEffect(() => {
        const fetchData = async () => {
            if (!planId || !user?.companyId) return;
            setLoading(true);
            try {
                const [planData, companyData] = await Promise.all([
                    api.getSubscriptionPlanById(planId),
                    api.getCompanyById(user.companyId)
                ]);
                setPlan(planData || null);
                setCompany(companyData || null);
            } catch (error) {
                console.error("Failed to fetch upgrade data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [planId, user]);
    
    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company || !plan) return;
        setProcessing(true);
        setMessage(null);

        // Simulate payment processing
        await new Promise(res => setTimeout(res, 1500));
        
        try {
            const updatedCompany = await api.upgradeCompanyPlan(company.id, plan.id);
            if (updatedCompany) {
                setMessage({ type: 'success', text: t('company.plans.upgradeSuccess') });
                setTimeout(() => navigate('/company/dashboard'), 2000);
            } else {
                throw new Error('Upgrade failed');
            }
        } catch (error) {
            setMessage({ type: 'error', text: t('company.plans.upgradeError') });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!plan || !company) return <p>Could not load plan details.</p>;
    
    return (
        <div>
            <Link to="/company/plans" className="text-primary hover:underline mb-4 inline-block">&larr; Back to Plans</Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('company.plans.paymentTitle')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">{t('company.plans.paymentDetails')}</h2>
                        <form onSubmit={handlePayment} className="space-y-4">
                            {/* Dummy Payment Form */}
                            <div><label className="block text-sm font-medium">{t('company.plans.cardName')}</label><input type="text" className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900" defaultValue="John Doe" /></div>
                            <div><label className="block text-sm font-medium">{t('company.plans.cardNumber')}</label><input type="text" className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900" defaultValue="**** **** **** 1234" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium">{t('company.plans.expiry')}</label><input type="text" className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900" defaultValue="12/25"/></div>
                                <div><label className="block text-sm font-medium">{t('company.plans.cvc')}</label><input type="text" className="mt-1 w-full p-2 border rounded-md bg-white text-gray-900" defaultValue="123" /></div>
                            </div>
                            <Button type="submit" className="w-full" isLoading={processing}>{processing ? t('company.plans.processing') : t('company.plans.confirmPayment')}</Button>
                            {message && <p className={`mt-2 text-sm text-center ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>}
                        </form>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                     <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">{t('company.plans.orderSummary')}</h2>
                        <div className="space-y-2 border-b pb-2">
                            <div className="flex justify-between"><span>{t('company.plans.plan')}:</span><span className="font-semibold">{t_dynamic(plan.name)}</span></div>
                            <div className="flex justify-between"><span>{t('company.plans.price')}:</span><span className="font-semibold">RD${plan.price.toLocaleString('en-US')}</span></div>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2">
                            <span>Total:</span>
                            <span>RD${plan.price.toLocaleString('en-US')}</span>
                        </div>
                     </Card>
                </div>
            </div>
        </div>
    );
};

export default CompanyUpgradePage;