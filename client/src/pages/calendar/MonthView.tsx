import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import ShiftModal from './ShiftModal';

const MonthView = ({ shifts, setShifts, currentDate, locale }: any) => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);

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

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance/my', { headers: { Authorization: `Bearer ${token}` } });
        setAttendance(res.data);
      } catch {}
    };
    const fetchAvailability = async () => {
      try {
        const start = fmt(new Date(year, month, 1));
        const end = fmt(new Date(year, month + 1, 0));
        const res = await api.get(`/availability/my?start=${start}&end=${end}`, { headers: { Authorization: `Bearer ${token}` } });
        setAvailability(res.data);
      } catch {}
    };
    fetchAttendance();
    fetchAvailability();
  }, [currentDate]);

  const getShiftsForDay = (day: number) =>
    shifts.filter((s: any) => {
      const d = new Date(s.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });

  const getApprovedAttendanceForDay = (day: number) =>
    attendance.find((a: any) => {
      const d = new Date(a.checkIn);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year && a.status === 'approved';
    });

  const getAvailabilityForDay = (day: number) =>
    availability.find((a: any) => {
      const d = new Date(a.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });

  const weekDayLabels = locale === 'de-DE'
    ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <>
      <div className='grid grid-cols-7 mb-2'>
        {weekDayLabels.map((d) => (
          <div key={d} className='text-center text-xs font-medium text-slate-400'>{d}</div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-1.5'>
        {days.map((day, index) => {
          if (!day) return <div key={index} />;

          const cellDate = new Date(year, month, day);
          cellDate.setHours(0, 0, 0, 0);
          const hasShift = getShiftsForDay(day).length > 0;
          const approvedAttendance = getApprovedAttendanceForDay(day);
          const avail = getAvailabilityForDay(day);
          const isToday = cellDate.toDateString() === today.toDateString();
          const isPast = cellDate < today;

          let cellClass = 'bg-white dark:bg-slate-900';
          let textClass = 'text-slate-700 dark:text-slate-200';

          if (isToday) {
            cellClass = 'bg-green-500';
            textClass = 'text-white';
          } else if (isPast) {
            cellClass = 'bg-slate-200/80 dark:bg-slate-800/60';
            textClass = 'text-slate-400 dark:text-slate-500';
          } else if (avail) {
            if (avail.type === 'available') {
              cellClass = 'bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700';
              textClass = 'text-green-700 dark:text-green-300';
            } else {
              cellClass = 'bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700';
              textClass = 'text-red-600 dark:text-red-400';
            }
          }

          return (
            <div key={index} onClick={() => setSelectedDay(cellDate)}
              className={`rounded-xl h-14 p-1.5 flex flex-col justify-between cursor-pointer active:scale-95 transition-transform ${cellClass}`}>
              <span className={`text-xs font-medium ${textClass}`}>{day}</span>
              <div className='flex flex-col gap-0.5'>
                {hasShift && (
                  <div className={`rounded-full h-1.5 w-full ${isToday ? 'bg-white/60' : isPast ? 'bg-slate-400 dark:bg-slate-500' : 'bg-green-500'}`} />
                )}
                {approvedAttendance && (
                  <div className={`rounded-full h-1.5 w-full ${isToday ? 'bg-white/40' : 'bg-blue-400'}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <ShiftModal selectedDay={selectedDay} onClose={() => setSelectedDay(null)} shifts={shifts} setShifts={setShifts} locale={locale} />
      )}
    </>
  );
};

export default MonthView;