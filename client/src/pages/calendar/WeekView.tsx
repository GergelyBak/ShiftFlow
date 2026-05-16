import { useState, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/axios';
import ShiftModal from './ShiftModal';

const WeekView = ({ shifts, setShifts, startOfWeek, locale }: any) => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const { t } = useTranslation();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const token = localStorage.getItem('token');
        const start = fmt(weekDays[0]);
        const end = fmt(weekDays[6]);
        const res = await api.get(`/availability/my?start=${start}&end=${end}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailability(res.data);
      } catch { console.error('Failed to load availability'); }
    };
    fetchAvailability();
  }, [startOfWeek]);

  const getShiftsForDay = (date: Date) => {
    return shifts.filter((shift: any) => {
      const d = new Date(shift.date);
      return d.toDateString() === date.toDateString();
    });
  };

  const getAvailabilityForDay = (date: Date) => {
    return availability.find((a: any) => {
      const d = new Date(a.date);
      return d.toDateString() === date.toDateString();
    });
  };

  return (
    <>
      <div className='space-y-2'>
        {weekDays.map((day, i) => {
          const dayShifts = getShiftsForDay(day);
          const avail = getAvailabilityForDay(day);
          const isToday = day.toDateString() === today.toDateString();
          const isPast = day < today;

          const dayLabel = day.toLocaleDateString(locale, {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
          });

          let cardBg = 'bg-slate-200/60 dark:bg-slate-800';
          let headerBg = '';
          let labelColor = isPast
            ? 'text-slate-400 dark:text-slate-500'
            : 'text-slate-700 dark:text-slate-200';

          if (isToday) {
            headerBg = 'bg-green-50 dark:bg-green-900/20';
            labelColor = 'text-green-600 dark:text-green-400';
          } else if (avail && !isPast) {
            if (avail.type === 'available') {
              cardBg = 'bg-green-100 dark:bg-green-900/30';
              headerBg = 'bg-green-200/60 dark:bg-green-900/40';
              labelColor = 'text-green-700 dark:text-green-300';
            } else {
              cardBg = 'bg-red-100 dark:bg-red-900/30';
              headerBg = 'bg-red-200/60 dark:bg-red-900/40';
              labelColor = 'text-red-600 dark:text-red-400';
            }
          }

          return (
            <div
              key={i}
              className={`${cardBg} rounded-2xl overflow-hidden cursor-pointer transition-colors`}
              onClick={() => setSelectedDay(day)}
            >
              <div className={`px-4 py-2.5 ${headerBg}`}>
                <div className='flex items-center justify-between'>
                  <span className={`font-semibold text-sm ${labelColor}`}>
                    {dayLabel}
                    {isToday && (
                      <span className='ml-2 text-xs font-normal opacity-70'>
                        {t('today')}
                      </span>
                    )}
                  </span>
                  {avail && !isPast && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      avail.type === 'available'
                        ? 'text-green-700 dark:text-green-200 bg-green-200/80 dark:bg-green-800/60'
                        : 'text-red-600 dark:text-red-200 bg-red-200/80 dark:bg-red-800/60'
                    }`}>
                      {avail.type === 'available' ? '✓' : '✗'} {avail.startTime}–{avail.endTime}
                    </span>
                  )}
                </div>
              </div>

              {dayShifts.length > 0 && (
                <div className='px-3 pb-3 space-y-2'>
                  {dayShifts.map((shift: any) => (
                    <div
                      key={shift._id}
                      className={`rounded-xl p-3 flex items-center gap-3 ${
                        isPast
                          ? 'bg-slate-100 dark:bg-slate-700/50'
                          : avail?.type === 'available'
                            ? 'bg-green-50 dark:bg-green-900/20'
                            : avail?.type === 'unavailable'
                              ? 'bg-red-50 dark:bg-red-900/20'
                              : 'bg-white dark:bg-slate-900'
                      }`}
                    >
                      <CalendarDays
                        size={18}
                        className={isPast ? 'text-slate-400' : avail?.type === 'unavailable' ? 'text-red-400' : 'text-green-500'}
                      />
                      <p className={`text-base font-bold tracking-tight ${
                        isPast
                          ? 'text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-white'
                      }`}>
                        {shift.startTime} - {shift.endTime}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <ShiftModal
          selectedDay={selectedDay}
          onClose={() => setSelectedDay(null)}
          shifts={shifts}
          setShifts={setShifts}
          locale={locale}
        />
      )}
    </>
  );
};

export default WeekView;