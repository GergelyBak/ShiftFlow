import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ClipboardList,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import WeekView from './calendar/WeekView';
import MonthView from './calendar/MonthView';
import AttendanceView from './calendar/AttendanceView';
import ScheduleView from './calendar/SceduleView';

const Calendar = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<
    'week' | 'month' | 'attendance' | 'schedule'
  >('week');
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'de' ? 'de-DE' : 'en-GB';

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    const fetchShifts = async () => {
      const token = localStorage.getItem('token');
      const res = await api.get('/shifts/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShifts(res.data);
    };
    fetchShifts();
  }, []);

  const prev = () => {
    const d = new Date(currentDate);
    view === 'week' ? d.setDate(d.getDate() - 7) : d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const next = () => {
    const d = new Date(currentDate);
    view === 'week' ? d.setDate(d.getDate() + 7) : d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weekLabel = `${startOfWeek.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
  })} - ${endOfWeek.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
  })}`;

  const monthLabel = currentDate.toLocaleString(locale, {
    month: 'long',
    year: 'numeric',
  });

  const showNav = view === 'week' || view === 'month';

  return (
    <div className='pb-24'>
      {/* HEADER */}
      <div className='flex items-center justify-between mb-5'>
        <div className='bg-slate-200 dark:bg-slate-800 rounded-full p-1 flex gap-1'>
          <button
            onClick={() => setView('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              view === 'week'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <CalendarDays size={14} />
            {t('week')}
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              view === 'month'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('month')}
          </button>
          {isAdmin && (
            <button
              onClick={() => setView('attendance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                view === 'attendance'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <ClipboardList size={14} />
              Attendance
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setView('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                view === 'schedule'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Schedule
            </button>
          )}
        </div>

        {/* Nav arrows — csak week/month nézetben */}
        {showNav && (
          <div className='flex items-center gap-1 bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-full'>
            <button
              onClick={prev}
              className='text-slate-600 dark:text-slate-300 p-0.5'
            >
              <ChevronLeft size={16} />
            </button>
            <span className='text-sm font-medium text-slate-700 dark:text-slate-200 px-1'>
              {view === 'week' ? weekLabel : monthLabel}
            </span>
            <button
              onClick={next}
              className='text-slate-600 dark:text-slate-300 p-0.5'
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* VIEW */}
      {view === 'week' && (
        <WeekView
          shifts={shifts}
          setShifts={setShifts}
          startOfWeek={startOfWeek}
          locale={locale}
        />
      )}
      {view === 'month' && (
        <MonthView
          shifts={shifts}
          setShifts={setShifts}
          currentDate={currentDate}
          locale={locale}
        />
      )}
      {view === 'attendance' && <AttendanceView />}
      {view === 'schedule' && <ScheduleView />}
    </div>
  );
};

export default Calendar;
