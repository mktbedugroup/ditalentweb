import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate, Link } = ReactRouterDOM;
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';

const RegisterPage: React.FC = () => {
  // User fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'company'>('candidate');
  
  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [rnc, setRnc] = useState('');
  const [employeeCount, setEmployeeCount] = useState<'1-10' | '11-50' | '51-200' | '201-500' | '501+'>('1-10');
  const [industry, setIndustry] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const employeeCountOptions: typeof employeeCount[] = ['1-10', '11-50', '51-200', '201-500', '501+'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('register.passwordsDoNotMatch'));
      return;
    }
    
    setLoading(true);

    try {
      const companyData = role === 'company' ? {
        name: companyName,
        description: companyDescription,
        address,
        phone,
        rnc,
        employeeCount,
        industry,
      } : undefined;

      const user = await register(email, password, role, companyData);
      
      if (user) {
        if (user.role === 'company') {
          navigate('/company');
        } else {
          navigate('/candidate');
        }
      } else {
        setError(t('register.emailExists'));
      }
    } catch (err) {
      setError(t('register.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {t('register.title')}
            </h2>
             <p className="mt-2 text-center text-sm text-gray-600">
                {t('register.or')}{' '}
                <Link to="/login" className="font-medium text-secondary hover:text-secondary-700">
                    {t('register.signInLink')}
                </Link>
            </p>
          </div>
          <Card className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('register.iAmA')}</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setRole('candidate')} className={`px-4 py-2 text-sm font-medium rounded-md border ${role === 'candidate' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'}`}>
                        {t('register.candidate')}
                    </button>
                    <button type="button" onClick={() => setRole('company')} className={`px-4 py-2 text-sm font-medium rounded-md border ${role === 'company' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'}`}>
                        {t('register.company')}
                    </button>
                </div>
              </div>

              <hr />

              {role === 'company' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-center text-gray-800">{t('register.companyDetails')}</h3>
                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">{t('register.companyName')}</label>
                        <input id="companyName" type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/>
                    </div>
                     <div>
                        <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700">{t('register.companyDescription')}</label>
                        <textarea id="companyDescription" value={companyDescription} onChange={e => setCompanyDescription(e.target.value)} required rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/>
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">{t('register.address')}</label>
                        <input id="address" type="text" value={address} onChange={e => setAddress(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('register.phone')}</label>
                            <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/>
                        </div>
                         <div>
                            <label htmlFor="rnc" className="block text-sm font-medium text-gray-700">{t('register.rnc')}</label>
                            <input id="rnc" type="text" value={rnc} onChange={e => setRnc(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700">{t('register.employeeCount')}</label>
                            <select id="employeeCount" value={employeeCount} onChange={e => setEmployeeCount(e.target.value as any)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900">
                                {employeeCountOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">{t('register.industry')}</label>
                            <input id="industry" type="text" value={industry} onChange={e => setIndustry(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/>
                        </div>
                    </div>
                     <hr />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('register.emailLabel')}
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('register.passwordLabel')}
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  {t('register.confirmPasswordLabel')}
                </label>
                <div className="mt-1">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-gray-900"
                  />
                </div>
              </div>
              
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}

              <div>
                <Button type="submit" className="w-full" isLoading={loading}>
                  {t('register.signUpButton')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;