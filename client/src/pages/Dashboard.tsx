import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Clock, Timer, Trash2 } from 'lucide-react';
import { deleteShift } from '../api/shifts';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'de' ? 'de-DE' : 'en-GB';

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/shifts/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShifts(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchShifts();
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const name = user?.firstName ?? 'User';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const next5Days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteShift(id);
      setShifts((prev) => prev.filter((s) => s._id !== id));
      toast.success('Shift deleted');
    } catch (err) {
      toast.error('Could not delete shift');
    }
  };

  const getShiftForDay = (date: Date) => {
    return shifts.find((s) => {
      const d = new Date(s.date);
      return d.toDateString() === date.toDateString();
    });
  };

  const calcHours = (shift: any) => {
    const [sh, sm] = shift.startTime.split(':').map(Number);
    const [eh, em] = shift.endTime.split(':').map(Number);
    const totalMinutes = eh * 60 + em - (sh * 60 + sm);

    let breakMinutes = 0;
    if (totalMinutes >= 8 * 60) {
      breakMinutes = 30;
    } else if (totalMinutes >= 6 * 60) {
      breakMinutes = 15;
    }

    return (totalMinutes - breakMinutes) / 60;
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const getWeekStart = () => {
    const d = new Date(today);
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return d;
  };
  const weekStart = getWeekStart();

  const weeklyHours = shifts
    .filter((s) => {
      const d = new Date(s.date);
      return d >= weekStart && d <= today;
    })
    .reduce((acc, s) => acc + calcHours(s), 0);

  const monthlyHours = shifts
    .filter((s) => {
      const d = new Date(s.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, s) => acc + calcHours(s), 0);

  const lastMonthHours = shifts
    .filter((s) => {
      const d = new Date(s.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    })
    .reduce((acc, s) => acc + calcHours(s), 0);

  const formatHours = (h: number) => {
    const hours = Math.floor(h);
    const mins = Math.round((h - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const pastShifts = shifts.filter((s) => new Date(s.date) < today);
  const futureShifts = shifts.filter((s) => new Date(s.date) >= today);
  const lastShift = pastShifts[pastShifts.length - 1];
  const nextShift = futureShifts[0];

  const currentMonthName = now.toLocaleString(locale, { month: 'long' });
  const lastMonthName = new Date(lastMonthYear, lastMonth).toLocaleString(
    locale,
    { month: 'long' },
  );

  return (
    <div className='pb-28 space-y-3'>
      {/* HEADER */}
      <h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
        {t('greeting', { name })}
      </h1>

      {/* 5-DAY PREVIEW */}
      <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-3'>
        <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 px-1'>
          5-Day Preview
        </p>
        <div className='grid grid-cols-5 gap-2'>
          {next5Days.map((day, i) => {
            const shift = getShiftForDay(day);
            const isToday = i === 0;
            return (
              <div
                key={i}
                className={`rounded-2xl p-2 flex flex-col items-center gap-1 ${
                  isToday
                    ? 'bg-slate-200 dark:bg-slate-700'
                    : 'bg-white dark:bg-slate-900'
                }`}
              >
                <p className='text-xs text-slate-400'>
                  {isToday
                    ? 'Today'
                    : day.toLocaleDateString(locale, { weekday: 'short' })}
                </p>
                <p className='text-base font-bold text-slate-800 dark:text-white'>
                  {day.getDate()}
                </p>
                {shift ? (
                  <CalendarDays size={14} className='text-green-500' />
                ) : (
                  <span className='text-slate-300 text-xs'>–</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* LAST + NEXT SHIFT */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-3'>
          <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2'>
            Last Shift
          </p>
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-3'>
            {lastShift ? (
              <>
                <p className='text-xs text-slate-400 mb-1'>
                  {new Date(lastShift.date).toLocaleDateString(locale, {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </p>
                <p className='text-xl font-bold text-slate-900 dark:text-white'>
                  {formatHours(calcHours(lastShift))}
                </p>
                <div className='flex items-center justify-between mt-1'>
                  <p className='text-xs text-slate-400'>Hours</p>
                  <Timer size={14} className='text-slate-300' />
                </div>
              </>
            ) : (
              <p className='text-xs text-slate-400'>No shifts yet</p>
            )}
          </div>
        </div>

        <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-3'>
          <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2'>
            Next Shift
          </p>
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-3'>
            {nextShift ? (
              <>
                <p className='text-xs text-slate-400 mb-1'>
                  {new Date(nextShift.date).toLocaleDateString(locale, {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </p>
                <p className='text-lg font-bold text-slate-900 dark:text-white leading-tight'>
                  {nextShift.startTime}–{nextShift.endTime}
                </p>
                <div className='flex items-center justify-between mt-1'>
                  <p className='text-xs text-slate-400'>Clock</p>
                  <CalendarDays size={14} className='text-slate-300' />
                </div>
              </>
            ) : (
              <p className='text-xs text-slate-400'>No upcoming</p>
            )}
          </div>
        </div>
      </div>

      {/* WORKING HOURS */}
      <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-3'>
        <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 px-1'>
          Working Hours
        </p>
        <div className='grid grid-cols-3 gap-2'>
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-3'>
            <p className='text-xs text-slate-400 mb-1'>This week</p>
            <p className='text-lg font-bold text-slate-900 dark:text-white'>
              {formatHours(weeklyHours)}
            </p>
            <div className='flex items-center justify-between mt-1'>
              <p className='text-xs text-slate-400'>Hours</p>
              <Clock size={14} className='text-slate-300' />
            </div>
          </div>

          <div className='bg-white dark:bg-slate-900 rounded-2xl p-3'>
            <p className='text-xs text-slate-400 mb-1'>{currentMonthName}</p>
            <p className='text-lg font-bold text-slate-900 dark:text-white'>
              {formatHours(monthlyHours)}
            </p>
            <div className='flex items-center justify-between mt-1'>
              <p className='text-xs text-slate-400'>Hours</p>
              <Clock size={14} className='text-slate-300' />
            </div>
          </div>

          <div className='bg-white dark:bg-slate-900 rounded-2xl p-3'>
            <p className='text-xs text-slate-400 mb-1'>{lastMonthName}</p>
            <p className='text-lg font-bold text-slate-900 dark:text-white'>
              {formatHours(lastMonthHours)}
            </p>
            <div className='flex items-center justify-between mt-1'>
              <p className='text-xs text-slate-400'>Hours</p>
              <Clock size={14} className='text-slate-300' />
            </div>
          </div>
        </div>
      </div>

      {/* MY SHIFTS */}
      <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-3'>
        <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 px-1'>
          {t('myShifts')}
        </p>

        {shifts.length === 0 ? (
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-6 text-center text-slate-400 text-sm'>
            {t('noShifts')}
          </div>
        ) : (
          <div className='space-y-2'>
            {shifts.map((shift) => (
              <div
                key={shift._id}
                className='bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 flex justify-between items-center'
              >
                <div>
                  <p className='text-xs text-slate-400'>
                    {new Date(shift.date).toLocaleDateString(locale, {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </p>
                  <p className='text-base font-semibold text-slate-900 dark:text-white tracking-tight'>
                    {shift.startTime} – {shift.endTime}
                  </p>
                </div>

                <div className='flex items-center gap-3'>
                  <p className='text-sm font-medium text-slate-400'>
                    {formatHours(calcHours(shift))}h
                  </p>
                  <button
                    onClick={() => handleDelete(shift._id)}
                    className='text-slate-300 hover:text-red-400 transition-colors p-1'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
