import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Clock, Timer, Trash2 } from 'lucide-react';
import { deleteShift } from '../api/shifts';
import { toast } from 'react-toastify';
import { addNotification } from '../utils/notifications';

const Dashboard = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'de' ? 'de-DE' : 'en-GB';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [shiftsRes, attendanceRes, availabilityRes] = await Promise.all([
          api.get('/shifts/me', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get('/attendance/my', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get('/availability/my', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const sorted = shiftsRes.data.sort(
          (a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        setShifts(sorted);
        setAttendance(
          attendanceRes.data.filter(
            (a: any) => a.status === 'approved' && a.checkOut,
          ),
        );
        setAvailability(availabilityRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      addNotification(t('toastShiftDeleted'));
      toast.success(t('toastShiftDeleted'));
    } catch {
      toast.error(t('toastCouldNotDelete'));
    }
  };

  const getShiftForDay = (date: Date) => {
    return shifts.find((s) => {
      const d = new Date(s.date);
      return d.toDateString() === date.toDateString();
    });
  };

  const getAvailabilityForDay = (date: Date) => {
    return availability.find(
      (a: any) => new Date(a.date).toDateString() === date.toDateString(),
    );
  };

  const calcAttendanceHours = (record: any) => {
    const diff =
      new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime();
    const breakMs = (record.breakMinutes || 0) * 60 * 1000;
    return (diff - breakMs) / 1000 / 60 / 60;
  };

  const formatHours = (h: number) => {
    const hours = Math.floor(h);
    const mins = Math.round((h - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
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

  const weeklyHours = attendance
    .filter((a) => {
      const d = new Date(a.checkIn);
      return d >= weekStart && d <= new Date();
    })
    .reduce((acc, a) => acc + calcAttendanceHours(a), 0);

  const monthlyHours = attendance
    .filter((a) => {
      const d = new Date(a.checkIn);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, a) => acc + calcAttendanceHours(a), 0);

  const lastMonthHours = attendance
    .filter((a) => {
      const d = new Date(a.checkIn);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    })
    .reduce((acc, a) => acc + calcAttendanceHours(a), 0);

  const futureShifts = shifts
    .filter((s) => {
      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextShift = futureShifts[0];
  const lastAttendance = attendance[0];

  const currentMonthName = now.toLocaleString(locale, { month: 'long' });
  const lastMonthName = new Date(lastMonthYear, lastMonth).toLocaleString(
    locale,
    { month: 'long' },
  );

  const calcShiftHours = (shift: any) => {
    const [sh, sm] = shift.startTime.split(':').map(Number);
    const [eh, em] = shift.endTime.split(':').map(Number);
    return (eh * 60 + em - (sh * 60 + sm)) / 60;
  };

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center gap-4'>
        <div className='w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-green-500 animate-spin' />
        <p className='text-sm text-slate-400 dark:text-slate-500'>
          {t('loading')}
        </p>
      </div>
    );
  }

  return (
    <div className='pb-28 space-y-3'>
      {/* HEADER */}
      <h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
        {t('greeting', { name })}
      </h1>

      {/* 5-DAY PREVIEW */}
      <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-3'>
        <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 px-1'>
          {t('fiveDayPreview')}
        </p>
        <div className='grid grid-cols-5 gap-2'>
          {next5Days.map((day, i) => {
            const shift = getShiftForDay(day);
            const avail = getAvailabilityForDay(day);
            const isToday = i === 0;
            return (
              <div
                key={i}
                className={`rounded-2xl p-2 flex flex-col items-center gap-1 ${
                  isToday
                    ? 'bg-slate-200 dark:bg-slate-700'
                    : avail?.type === 'available'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : avail?.type === 'unavailable'
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-white dark:bg-slate-900'
                }`}
              >
                <p
                  className={`text-xs ${
                    avail?.type === 'available'
                      ? 'text-green-600 dark:text-green-400'
                      : avail?.type === 'unavailable'
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-slate-400'
                  }`}
                >
                  {isToday
                    ? t('today')
                    : day.toLocaleDateString(locale, { weekday: 'short' })}
                </p>
                <p
                  className={`text-base font-bold ${
                    avail?.type === 'available'
                      ? 'text-green-700 dark:text-green-300'
                      : avail?.type === 'unavailable'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-slate-800 dark:text-white'
                  }`}
                >
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
            {t('lastWorked')}
          </p>
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-3'>
            {lastAttendance ? (
              <>
                <p className='text-xs text-slate-400 mb-1'>
                  {new Date(lastAttendance.checkIn).toLocaleDateString(locale, {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </p>
                <p className='text-xl font-bold text-slate-900 dark:text-white'>
                  {formatHours(calcAttendanceHours(lastAttendance))}
                </p>
                <div className='flex items-center justify-between mt-1'>
                  <p className='text-xs text-slate-400'>{t('approved')}</p>
                  <Timer size={14} className='text-green-400' />
                </div>
              </>
            ) : (
              <p className='text-xs text-slate-400'>{t('noRecords')}</p>
            )}
          </div>
        </div>

        <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-3'>
          <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2'>
            {t('nextShift')}
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
                  <p className='text-xs text-slate-400'>{t('clock')}</p>
                  <CalendarDays size={14} className='text-slate-300' />
                </div>
              </>
            ) : (
              <p className='text-xs text-slate-400'>{t('noUpcoming')}</p>
            )}
          </div>
        </div>
      </div>

      {/* WORKING HOURS */}
      <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-3'>
        <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 px-1'>
          {t('approvedHours')}
        </p>
        <div className='grid grid-cols-3 gap-2'>
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-3'>
            <p className='text-xs text-slate-400 mb-1'>{t('thisWeek')}</p>
            <p className='text-lg font-bold text-slate-900 dark:text-white'>
              {formatHours(weeklyHours)}
            </p>
            <div className='flex items-center justify-between mt-1'>
              <p className='text-xs text-slate-400'>{t('hours')}</p>
              <Clock size={14} className='text-slate-300' />
            </div>
          </div>
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-3'>
            <p className='text-xs text-slate-400 mb-1'>{currentMonthName}</p>
            <p className='text-lg font-bold text-slate-900 dark:text-white'>
              {formatHours(monthlyHours)}
            </p>
            <div className='flex items-center justify-between mt-1'>
              <p className='text-xs text-slate-400'>{t('hours')}</p>
              <Clock size={14} className='text-slate-300' />
            </div>
          </div>
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-3'>
            <p className='text-xs text-slate-400 mb-1'>{lastMonthName}</p>
            <p className='text-lg font-bold text-slate-900 dark:text-white'>
              {formatHours(lastMonthHours)}
            </p>
            <div className='flex items-center justify-between mt-1'>
              <p className='text-xs text-slate-400'>{t('hours')}</p>
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
        {futureShifts.length === 0 ? (
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-6 text-center text-slate-400 text-sm'>
            {t('noShifts')}
          </div>
        ) : (
          <div className='space-y-2'>
            {futureShifts.map((shift) => (
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
                    {formatHours(calcShiftHours(shift))}h
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
