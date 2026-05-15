import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      return setError(t('fillAllFields'));
    }

    try {
      setLoading(true);
      setError('');

      const res = await api.post('/auth/login', { email, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      toast.success(t('loggedIn'));

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className='min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center px-4 transition-colors duration-300'>
      <div className='w-full max-w-sm'>
        {/* LOGO / TITLE */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
            ShiftFlow
          </h1>
          <p className='text-slate-500 dark:text-slate-400 text-sm mt-1'>
            {t('welcomeBack')}
          </p>
        </div>

        {/* CARD */}
        <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-1.5'>
          <div className='bg-white dark:bg-slate-900 rounded-2xl px-5 py-6 space-y-3'>
            {error && (
              <div className='bg-red-50 dark:bg-red-950/30 text-red-500 text-sm px-3 py-2 rounded-xl'>
                {error}
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
                {t('email')}
              </label>
              <input
                type='email'
                placeholder={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
                {t('password')}
              </label>
              <input
                type='password'
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
              />
            </div>

            {/* BUTTON */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className='w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors mt-2'
            >
              {loading ? t('loading') : t('login')}
            </button>

            <p className='text-center text-xs text-slate-400 dark:text-slate-500'>
              <span
                onClick={() => navigate('/forgot-password')}
                className='text-green-500 cursor-pointer hover:underline'
              >
                Forgot password?
              </span>
            </p>
          </div>
        </div>

        {/* REGISTER LINK */}
        <p className='text-center text-sm text-slate-500 dark:text-slate-400 mt-4'>
          {t('noAccount')}{' '}
          <span
            onClick={() => navigate('/register')}
            className='text-green-500 font-medium cursor-pointer'
          >
            {t('register')}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
