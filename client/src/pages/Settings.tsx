import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Moon, Globe, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';
import { setTheme } from '../utils/theme';

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

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') !== 'light',
  );
  const [language, setLanguage] = useState('en');

const toggleTheme = () => {
  const newMode = darkMode ? 'light' : 'dark';
  console.log('toggleTheme called, newMode:', newMode);
  setDarkMode(!darkMode);
  setTheme(newMode);
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  toast.success('Logged out successfully');
  navigate('/');
};

return (
    <div className='pb-24'>
      <h1 className='text-2xl font-semibold mb-5'>Settings</h1>

      <div className='space-y-3'>
        {/* PREFERENCES */}
        <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-1.5'>
          {/* NOTIFICATIONS */}
          <div className='bg-white dark:bg-slate-900 flex items-center justify-between px-4 py-3.5 rounded-t-2xl border-b border-slate-100 dark:border-slate-800'>
            <div className='flex items-center gap-3'>
              <Bell size={19} className='text-slate-500 dark:text-slate-400' />
              <span className='text-sm font-medium text-slate-800 dark:text-white'>
                Notifications
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
                Dark Mode
              </span>
            </div>
            <Toggle checked={darkMode} onChange={toggleTheme} />
          </div>

          {/* LANGUAGE */}
          <div className='bg-white dark:bg-slate-900 flex items-center justify-between px-4 py-3.5 rounded-b-2xl'>
            <div className='flex items-center gap-3'>
              <Globe size={19} className='text-slate-500 dark:text-slate-400' />
              <span className='text-sm font-medium text-slate-800 dark:text-white'>
                Language
              </span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className='text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 border-none outline-none'
            >
              <option value='en'>English</option>
              <option value='de'>Deutsch</option>
            </select>
          </div>
        </div>

        {/* LOGOUT */}
        <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-1.5'>
          <button
            onClick={handleLogout}
            className='bg-white dark:bg-slate-900 w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors'
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
