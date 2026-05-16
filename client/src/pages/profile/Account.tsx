import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/axios';
import { ChevronLeft, Plane, Check, Clock } from 'lucide-react';

const TOTAL_HOLIDAY_DAYS = 24;

const Account = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [absences, setAbsences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/absences/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAbsences(res.data);
      } catch {
        console.error('Failed to load absences');
      } finally {
        setLoading(false);
      }
    };
    fetchAbsences();
  }, []);

  const currentYear = new Date().getFullYear();

  const approvedThisYear = absences.filter((a) => {
    const year = new Date(a.startDate).getFullYear();
    return a.status === 'approved' && year === currentYear;
  });

  const usedDays = approvedThisYear.reduce((acc, a) => {
    const diff = new Date(a.endDate).getTime() - new Date(a.startDate).getTime();
    return acc + Math.round(diff / 1000 / 60 / 60 / 24) + 1;
  }, 0);

  const remainingDays = TOTAL_HOLIDAY_DAYS - usedDays;
  const percentage = Math.min((usedDays / TOTAL_HOLIDAY_DAYS) * 100, 100);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const calcDays = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.round(diff / 1000 / 60 / 60 / 24) + 1;
  };

  return (
    <div className='pb-24'>
      {/* HEADER */}
      <div className='flex items-center gap-3 mb-6'>
        <button
          onClick={() => navigate('/profile')}
          className='w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center'
        >
          <ChevronLeft size={18} className='text-slate-600 dark:text-slate-300' />
        </button>
        <h1 className='text-xl font-semibold text-slate-900 dark:text-white'>
          {t('holidayAccount')}
        </h1>
      </div>

      {/* OVERVIEW CARD */}
      <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-4 mb-4'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1'>
              {currentYear} {t('holidayBalance')}
            </p>
            <p className='text-3xl font-bold text-slate-900 dark:text-white'>
              {remainingDays}
              <span className='text-base font-normal text-slate-400 ml-1'>/ {TOTAL_HOLIDAY_DAYS} days</span>
            </p>
            <p className='text-xs text-slate-400 mt-1'>{t('remaining')}</p>
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            remainingDays > 5
              ? 'bg-green-500/10 border-2 border-green-500'
              : remainingDays > 0
                ? 'bg-amber-500/10 border-2 border-amber-500'
                : 'bg-red-500/10 border-2 border-red-500'
          }`}>
            <Plane size={24} className={
              remainingDays > 5 ? 'text-green-500'
              : remainingDays > 0 ? 'text-amber-500'
              : 'text-red-400'
            } />
          </div>
        </div>

        {/* Progress bar */}
        <div className='bg-slate-300 dark:bg-slate-700 rounded-full h-2 overflow-hidden'>
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              remainingDays > 5 ? 'bg-green-500'
              : remainingDays > 0 ? 'bg-amber-500'
              : 'bg-red-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Stats row */}
        <div className='grid grid-cols-3 gap-2 mt-4'>
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-3 text-center'>
            <p className='text-xs text-slate-400 mb-1'>{t('total')}</p>
            <p className='text-lg font-bold text-slate-800 dark:text-white'>{TOTAL_HOLIDAY_DAYS}</p>
          </div>
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-3 text-center'>
            <p className='text-xs text-slate-400 mb-1'>{t('approved')}</p>
            <p className='text-lg font-bold text-slate-800 dark:text-white'>{usedDays}</p>
          </div>
          <div className={`rounded-2xl p-3 text-center ${
            remainingDays > 5 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : remainingDays > 0 ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <p className='text-xs text-slate-400 mb-1'>{t('remaining')}</p>
            <p className={`text-lg font-bold ${
              remainingDays > 5 ? 'text-green-600 dark:text-green-400'
              : remainingDays > 0 ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-500'
            }`}>{remainingDays}</p>
          </div>
        </div>
      </div>

      {/* APPROVED ABSENCES THIS YEAR */}
      <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-1.5'>
        <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-3 pt-2 pb-2'>
          {t('usedThisYear')}
        </p>

        {loading ? (
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-6 text-center text-slate-400 text-sm'>
            {t('loading')}
          </div>
        ) : approvedThisYear.length === 0 ? (
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-6 flex flex-col items-center gap-2'>
            <Clock size={28} className='text-slate-300' />
            <p className='text-sm text-slate-400'>{t('noApprovedAbsences')}</p>
          </div>
        ) : (
          <div className='space-y-1'>
            {approvedThisYear.map((a) => (
              <div
                key={a._id}
                className='bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 flex items-center justify-between first:rounded-t-2xl last:rounded-b-2xl'
              >
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center'>
                    <Check size={14} className='text-green-500' />
                  </div>
                  <div>
                    <p className='text-sm font-medium text-slate-800 dark:text-white'>
                      {formatDate(a.startDate)}
                      {a.startDate !== a.endDate && ` – ${formatDate(a.endDate)}`}
                    </p>
                    <p className='text-xs text-slate-400 mt-0.5'>{a.reason}</p>
                  </div>
                </div>
                <span className='text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0'>
                  {calcDays(a.startDate, a.endDate)}d
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
