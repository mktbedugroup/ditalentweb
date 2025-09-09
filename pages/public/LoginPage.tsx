


import React, { useState } from 'react';
// FIX: Use namespace import for react-router-dom to resolve module export issues.
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate, Link } = ReactRouterDOM;
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@hrportal.com');
  const [password, setPassword] = useState('password'); // Dummy password for demo
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginResult = await login(email, password);
      if (loginResult && loginResult.user) {
        if (loginResult.user.role === 'admin') {
          navigate('/admin');
        } else if (loginResult.user.role === 'company') {
          navigate('/company');
        } else {
          navigate('/candidate');
        }
      } else {
        setError(t('login.invalidCredentials'));
      }
    } catch (err) {
      setError(t('login.unexpectedError'));
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
              {t('login.title')}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
                {t('login.demoHint')} <br/>
                <span className="font-medium">admin@hrportal.com</span> / <span className="font-medium">password</span><br/>
                <span className="font-medium">candidate@example.com</span> / <span className="font-medium">password</span><br/>
                <span className="font-medium">company@example.com</span> / <span className="font-medium">password</span>
            </p>
          </div>
          <Card className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('login.emailLabel')}
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
                  {t('login.passwordLabel')}
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-gray-900"
                  />
                </div>
              </div>
              
              {error && <p className="text-sm text-red-600">{error}</p>}

              <div>
                <Button type="submit" className="w-full" isLoading={loading}>
                  {t('login.signInButton')}
                </Button>
              </div>
            </form>
          </Card>
           <p className="mt-2 text-center text-sm text-gray-600">
               {t('register.or')}{' '}
                <Link to="/register" className="font-medium text-secondary hover:text-secondary-700">
                    {t('register.title')}
                </Link>
            </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;