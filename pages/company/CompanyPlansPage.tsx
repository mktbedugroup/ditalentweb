import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { SubscriptionPlan, Company } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useI18n } from '../../contexts/I18nContext';
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM;

const CheckIcon = () => <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;

const PlanCard: React.FC<{ plan: SubscriptionPlan, isCurrent: boolean }> = ({ plan, isCurrent }) => {
    const { t, t_dynamic } = useI18n();
    return (
        <Card className={`flex flex-col ${plan.isFeatured ? 'border-2 border-secondary' : ''} ${isCurrent ? 'bg-primary/5' : ''}`}>
            {isCurrent && <div className="bg-primary text-white text-center py-1 font-semibold">{t('pricing.currentPlan')}</div>}
            <div className="p-8 flex-grow">
                <h3 className="text-2xl font-bold text-center">{t_dynamic(plan.name)}</h3>
                <p className="mt-4 text-center text-gray-600 h-16">{t_dynamic(plan.description)}</p>
                <div className="mt-6 text-center">
                    <span className="text-4xl font-extrabold">${plan.price}</span>
                    <span className="text-base font-medium text-gray-500">/{plan.currency}</span>
                </div>
                <ul className="mt-8 space-y-4">
                    <li className="flex items-start">
                        <CheckIcon />
                        <span className="ml-3 text-gray-700">{plan.jobPostingsLimit === 0 ? 'No job postings' : `${plan.jobPostingsLimit === -1 ? 'Unlimited' : plan.jobPostingsLimit} job posting(s)`}</span>
                    </li>
                </ul>
            </div>
            <div className="p-8 pt-0">
                {!isCurrent && (
                     <Link to={`/company/upgrade/${plan.id}`} className="block w-full">
                        <Button variant={plan.isFeatured ? 'secondary' : 'primary'} className="w-full">{t('company.plans.upgrade')}</Button>
                    </Link>
                )}
            </div>
        </Card>
    );
};


const CompanyPlansPage: React.FC = () => {
    const { user } = useAuth();
    const [company, setCompany] = useState<Company | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useI18n();

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.companyId) return;
            setLoading(true);
            try {
                const [companyData, plansData] = await Promise.all([
                    api.getCompanyById(user.companyId),
                    api.getSubscriptionPlans()
                ]);
                setCompany(companyData || null);
                setPlans(plansData.filter(p => p.isActive));
            } catch (error) {
                console.error("Failed to fetch plans", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('company.plans.title')}</h1>
            
            {loading ? (
                <p>Loading plans...</p>
            ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map(plan => (
                        <PlanCard key={plan.id} plan={plan} isCurrent={plan.id === company?.planId} />
                    ))}
                </div>
            )}

        </div>
    );
};

export default CompanyPlansPage;
