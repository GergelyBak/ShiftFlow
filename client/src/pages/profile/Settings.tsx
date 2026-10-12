import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setTheme } from '../../utils/theme';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Moon,
  Globe,
  LogOut,
  ChevronLeft,
  ChevronDown,
  KeyRound,
} from 'lucide-react';
import { api } from '../../api/axios';

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    onClick={onChange}
    className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
      checked ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
        checked ? 'translate-x-6' : 'translate-x-0'
      }`}
    />
  </button>
);

const Settings = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') !== 'light',
  );
  const [language, setLanguage] = useState(
    localStorage.getItem('lang') || 'en',
  );

  const toggleTheme = () => {
    const newMode = darkMode ? 'light' : 'dark';
    setDarkMode(!darkMode);
    setTheme(newMode);
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword)
      return toast.error(t('fillAllFields'));
    if (newPassword.length < 6) return toast.error(t('passwordMinLength'));
    if (newPassword !== confirmPassword)
      return toast.error(t('passwordsMismatch'));

    setSavingPassword(true);
    try {
      const token = localStorage.getItem('token');
      await api.post(
        '/auth/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(t('passwordUpdated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (error: any) {
      toast.error(
        error.response?.status === 400 &&
          error.response?.data?.message === 'Current password is incorrect'
          ? t('currentPasswordIncorrect')
          : t('passwordChangeFailed'),
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const inputClass =
    'w-full text-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl px-3 py-2.5 border-none outline-none focus:ring-2 focus:ring-green-500';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success(t('loggedOut'));
    navigate('/');
  };

  return (
    <div className='pb-24'>
      <div className='flex items-center gap-3 mb-5'>
        <button
          onClick={() => navigate('/profile')}
          className='w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center'
        >
          <ChevronLeft
            size={18}
            className='text-slate-600 dark:text-slate-300'
          />
        </button>
        <h1 className='text-2xl font-semibold text-slate-900 dark:text-white'>
          {t('settings')}
        </h1>
      </div>

      <div className='space-y-3'>
        {/* PREFERENCES */}
        <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-1.5'>
          {/* NOTIFICATIONS */}
          <div className='bg-white dark:bg-slate-900 flex items-center justify-between px-4 py-3.5 rounded-t-2xl border-b border-slate-100 dark:border-slate-800'>
            <div className='flex items-center gap-3'>
              <Bell size={19} className='text-slate-500 dark:text-slate-400' />
              <span className='text-sm font-medium text-slate-800 dark:text-white'>
                {t('notifications')}
              </span>
            </div>
            <Toggle
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
          </div>

          {/* DARK MODE */}
          <div className='bg-white dark:bg-slate-900 flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800'>
            <div className='flex items-center gap-3'>
              <Moon size={19} className='text-slate-500 dark:text-slate-400' />
              <span className='text-sm font-medium text-slate-800 dark:text-white'>
                {t('darkMode')}
              </span>
            </div>
            <Toggle checked={darkMode} onChange={toggleTheme} />
          </div>

          {/* LANGUAGE */}
          <div className='bg-white dark:bg-slate-900 flex items-center justify-between px-4 py-3.5 rounded-b-2xl'>
            <div className='flex items-center gap-3'>
              <Globe size={19} className='text-slate-500 dark:text-slate-400' />
              <span className='text-sm font-medium text-slate-800 dark:text-white'>
                {t('language')}
              </span>
            </div>
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className='text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 border-none outline-none'
            >
              <option value='en'>English</option>
              <option value='de'>Deutsch</option>
            </select>
          </div>
        </div>

        {/* CHANGE PASSWORD */}
        <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-1.5'>
          <div className='bg-white dark:bg-slate-900 rounded-2xl'>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className='w-full flex items-center justify-between px-4 py-3.5'
            >
              <div className='flex items-center gap-3'>
                <KeyRound
                  size={19}
                  className='text-slate-500 dark:text-slate-400'
                />
                <span className='text-sm font-medium text-slate-800 dark:text-white'>
                  {t('changePassword')}
                </span>
              </div>
              <ChevronDown
                size={18}
                className={`text-slate-400 transition-transform ${
                  showPasswordForm ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showPasswordForm && (
              <form
                onSubmit={handleChangePassword}
                className='px-4 pb-4 space-y-2.5'
              >
                <input
                  type='password'
                  autoComplete='current-password'
                  placeholder={t('currentPassword')}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                />
                <input
                  type='password'
                  autoComplete='new-password'
                  placeholder={`${t('newPassword')} (${t('passwordMinChars')})`}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                />
                <input
                  type='password'
                  autoComplete='new-password'
                  placeholder={t('confirmPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
                <button
                  type='submit'
                  disabled={savingPassword}
                  className='w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors'
                >
                  {savingPassword ? t('saving') : t('changePassword')}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* LOGOUT */}
        <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-1.5'>
          <button
            onClick={handleLogout}
            className='bg-white dark:bg-slate-900 w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors'
          >
            <LogOut size={18} />
            {t('logout')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
