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
  const [showPassword, setShowPassword] = useState(false);
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
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 px-4 py-3 pr-11 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((prev) => !prev)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                >
                  {showPassword ? (
                    <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21' />
                    </svg>
                  ) : (
                    <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                    </svg>
                  )}
                </button>
              </div>
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
                {t('forgotPassword')}
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
