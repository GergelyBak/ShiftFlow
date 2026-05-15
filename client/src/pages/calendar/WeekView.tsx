import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ShiftModal from './ShiftModal';

const WeekView = ({ shifts, setShifts, startOfWeek, locale }: any) => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const { t } = useTranslation();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const getShiftsForDay = (date: Date) => {
    return shifts.filter((shift: any) => {
      const d = new Date(shift.date);
      return d.toDateString() === date.toDateString();
    });
  };

  return (
    <>
      <div className='space-y-2'>
        {weekDays.map((day, i) => {
          const dayShifts = getShiftsForDay(day);
          const isToday = day.toDateString() === today.toDateString();
          const isPast = day < today;

          const dayLabel = day.toLocaleDateString(locale, {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
          });

          return (
            <div
              key={i}
              className='bg-slate-200/60 dark:bg-slate-800 rounded-2xl overflow-hidden cursor-pointer'
              onClick={() => setSelectedDay(day)}
            >
              <div
                className={`px-4 py-2.5 ${isToday ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
              >
                <span
                  className={`font-semibold text-sm ${
                    isToday
                      ? 'text-green-600 dark:text-green-400'
                      : isPast
                        ? 'text-slate-400 dark:text-slate-500'
                        : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {dayLabel}
                  {isToday && (
                    <span className='ml-2 text-xs font-normal opacity-70'>
                      {t('today')}
                    </span>
                  )}
                </span>
              </div>

              {dayShifts.length > 0 && (
                <div className='px-3 pb-3 space-y-2'>
                  {dayShifts.map((shift: any) => (
                    <div
                      key={shift._id}
                      className={`rounded-xl p-3 flex items-center gap-3 ${
                        isPast
                          ? 'bg-slate-100 dark:bg-slate-700/50'
                          : 'bg-white dark:bg-slate-900'
                      }`}
                    >
                      <CalendarDays
                        size={18}
                        className={isPast ? 'text-slate-400' : 'text-green-500'}
                      />
                      <p
                        className={`text-base font-bold tracking-tight ${
                          isPast
                            ? 'text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-white'
                        }`}
                      >
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
