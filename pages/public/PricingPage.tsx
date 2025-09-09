import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { api } from '../../services/api';
import type { SubscriptionPlan } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useI18n } from '../../contexts/I18nContext';
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM;

const CheckIcon = () => <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;

const PlanCard: React.FC<{ plan: SubscriptionPlan }> = ({ plan }) => {
    const { t, t_dynamic } = useI18n();

    const getPriceSubtitle = () => {
        if (plan.type === 'package') {
            return ` / ${t('pricing.oneTime')}`;
        }
        if (plan.durationUnit) {
            return ` / ${t(`duration.${plan.durationUnit}`)}`;
        }
        return ` / ${plan.currency}`;
    };

    return (
        <Card className={`flex flex-col ${plan.isFeatured ? 'border-2 border-secondary' : ''}`}>
            {plan.isFeatured && <div className="bg-secondary text-white text-center py-1 font-semibold">{t('pricing.featured')}</div>}
            <div className="p-8 flex-grow">
                <h3 className="text-2xl font-bold text-center">{t_dynamic(plan.name)}</h3>
                <p className="mt-4 text-center text-gray-600 h-16">{t_dynamic(plan.description)}</p>
                <div className="mt-6 text-center">
                    <span className="text-4xl font-extrabold">RD${plan.price.toLocaleString('en-US')}</span>
                    <span className="text-base font-medium text-gray-500">{getPriceSubtitle()}</span>
                </div>
                <ul className="mt-8 space-y-4">
                    <li className="flex items-start">
                        <CheckIcon />
                        <span className="ml-3 text-gray-700">{plan.jobPostingsLimit === 0 ? t('pricing.noPosts') : `${plan.jobPostingsLimit === -1 ? t('pricing.unlimitedPosts') : `${plan.jobPostingsLimit} ${t('pricing.posts')}`}`}</span>
                    </li>
                    {plan.features.map(feature => (
                        <li key={feature} className="flex items-start">
                           <CheckIcon />
                           <span className="ml-3 text-gray-700">{t(`features.${feature}`)}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="p-8 pt-0">
                <Link to={`/register`} className="block w-full">
                     <Button variant={plan.isFeatured ? 'secondary' : 'primary'} className="w-full">{t('pricing.choosePlan')}</Button>
                </Link>
            </div>
        </Card>
    );
};

const PricingPage: React.FC = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useI18n();

    useEffect(() => {
        const fetchPlans = async () => {
            setLoading(true);
            try {
                const plansData = await api.getSubscriptionPlans();
                setPlans(plansData.filter(p => p.isActive));
            } catch (error) {
                console.error("Failed to fetch plans", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow">
                <div className="bg-white">
                    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
                            {t('pricing.title')}
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
                           {t('pricing.subtitle')}
                        </p>
                    </div>
                </div>

                <div className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <p className="text-center">Loading plans...</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                                {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PricingPage;