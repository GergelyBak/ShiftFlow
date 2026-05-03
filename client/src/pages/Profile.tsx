import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  BarChart,
  Clock,
  Plane,
  FileText,
  Heart,
  Key,
  Settings,
  Info,
  ChevronRight,
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`;

  const sections = [
    {
      items: [{ label: t('personalData'), icon: User }],
    },
    {
      items: [
        { label: t('accounts'), icon: BarChart },
        { label: t('workingHours'), icon: Clock },
        { label: t('absences'), icon: Plane },
        { label: t('documents'), icon: FileText },
      ],
    },
    {
      items: [
        { label: t('timeTracking'), icon: Clock },
        { label: t('desiredTimes'), icon: Heart },
      ],
    },
    {
      items: [
        { label: t('accessData'), icon: Key },
        {
          label: t('settings'),
          icon: Settings,
          onClick: () => navigate('/settings'),
        },
        { label: t('helpFeedback'), icon: Info },
      ],
    },
  ];

  return (
    <div className='pb-24'>
      {/* HEADER */}
      <div className='flex items-center gap-4 mb-6'>
        <div className='w-14 h-14 rounded-full bg-green-600 dark:bg-green-700 flex items-center justify-center text-lg font-semibold text-white'>
          {user.firstName?.[0]}
          {user.lastName?.[0]}
        </div>
        <div>
          <h1 className='text-xl font-semibold text-slate-900 dark:text-white'>
            {fullName}
          </h1>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            {t('yourCompany')}
          </p>
        </div>
      </div>

      {/* SECTIONS */}
      <div className='space-y-3'>
        {sections.map((section, i) => (
          <div
            key={i}
            className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-1.5'
          >
            {section.items.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  onClick={item.onClick}
                  className='bg-white dark:bg-slate-900 flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors first:rounded-t-2xl last:rounded-b-2xl border-b border-slate-100 dark:border-slate-800 last:border-none'
                >
                  <div className='flex items-center gap-3'>
                    <Icon
                      size={19}
                      className='text-slate-500 dark:text-slate-400'
                    />
                    <span className='text-sm font-medium text-slate-800 dark:text-white'>
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    className='text-slate-300 dark:text-slate-600'
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <p className='text-center text-xs text-slate-400 mt-6'>
        © shiftflow 2026
      </p>
    </div>
  );
};

export default Profile;
