import { useState } from 'react';
import ShiftModal from './ShiftModal';

const MonthView = ({ shifts, setShifts, currentDate, locale }: any) => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getShiftsForDay = (day: number) => {
    return shifts.filter((shift: any) => {
      const d = new Date(shift.date);
      return (
        d.getDate() === day &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });
  };

  const weekDayLabels =
    locale === 'de-DE'
      ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
      : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <>
      <div className='grid grid-cols-7 mb-2'>
        {weekDayLabels.map((d) => (
          <div
            key={d}
            className='text-center text-xs font-medium text-slate-400'
          >
            {d}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-1.5'>
        {days.map((day, index) => {
          if (!day) return <div key={index} />;

          const cellDate = new Date(year, month, day);
          cellDate.setHours(0, 0, 0, 0);
          const dayShifts = getShiftsForDay(day);
          const hasShift = dayShifts.length > 0;
          const isToday = cellDate.toDateString() === today.toDateString();
          const isPast = cellDate < today;

          return (
            <div
              key={index}
              onClick={() => setSelectedDay(cellDate)}
              className={`rounded-xl h-14 p-1.5 flex flex-col justify-between cursor-pointer active:scale-95 transition-transform ${
                isToday
                  ? 'bg-green-500'
                  : isPast
                    ? 'bg-slate-200/80 dark:bg-slate-800/60'
                    : 'bg-white dark:bg-slate-900'
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  isToday
                    ? 'text-white'
                    : isPast
                      ? 'text-slate-400 dark:text-slate-500'
                      : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                {day}
              </span>

              {hasShift && (
                <div
                  className={`rounded-full h-1.5 w-full ${
                    isToday
                      ? 'bg-white/60'
                      : isPast
                        ? 'bg-slate-400 dark:bg-slate-500'
                        : 'bg-green-500'
                  }`}
                />
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

export default MonthView;
