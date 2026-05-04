import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
  Pencil,
  Trash2,
  Check,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const Calendar = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'de' ? 'de-DE' : 'en-GB';

  const fetchShifts = async () => {
    const token = localStorage.getItem('token');
    const res = await api.get('/shifts/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setShifts(res.data);
  };

  useEffect(() => {
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

  return (
    <div className='pb-24'>
      <div className='flex items-center justify-between mb-5'>
        <div className='bg-slate-200 dark:bg-slate-800 rounded-full p-1 flex'>
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
        </div>

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
      </div>

      {view === 'week' ? (
        <WeekView
          shifts={shifts}
          setShifts={setShifts}
          startOfWeek={startOfWeek}
          locale={locale}
        />
      ) : (
        <MonthView
          shifts={shifts}
          setShifts={setShifts}
          currentDate={currentDate}
          locale={locale}
        />
      )}
    </div>
  );
};

export default Calendar;

// =======================
// 🔧 SHIFT MODAL (shared)
// =======================
const ShiftModal = ({
  selectedDay,
  onClose,
  shifts,
  setShifts,
  locale,
}: any) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/shifts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShifts((prev: any[]) => prev.filter((s) => s._id !== id));
      toast.success('Shift deleted');
    } catch {
      toast.error('Could not delete shift');
    }
  };

  const startEdit = (shift: any) => {
    setEditingId(shift._id);
    setEditStart(shift.startTime);
    setEditEnd(shift.endTime);
  };

  const handleSave = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.patch(
        `/shifts/${id}`,
        { startTime: editStart, endTime: editEnd },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setShifts((prev: any[]) =>
        prev.map((s) =>
          s._id === id ? { ...s, startTime: editStart, endTime: editEnd } : s,
        ),
      );
      setEditingId(null);
      toast.success('Shift updated');
    } catch {
      toast.error('Could not update shift');
    }
  };

  const dayShifts = shifts.filter((s: any) => {
    const d = new Date(s.date);
    return d.toDateString() === selectedDay.toDateString();
  });

  return (
    <div
      className='fixed inset-0 bg-black/40 z-50 flex items-end justify-center'
      onClick={onClose}
    >
      <div
        className='bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl p-6 pb-10'
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className='flex items-center justify-between mb-4'>
          <div>
            <p className='text-xs text-slate-400 uppercase tracking-wide font-medium'>
              {selectedDay.toLocaleDateString(locale, { weekday: 'long' })}
            </p>
            <p className='text-xl font-bold text-slate-900 dark:text-white'>
              {selectedDay.toLocaleDateString(locale, {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className='bg-slate-100 dark:bg-slate-800 p-2 rounded-full'
          >
            <X size={18} className='text-slate-500' />
          </button>
        </div>

        {/* CONTENT */}
        {dayShifts.length === 0 ? (
          <div className='bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 text-center text-slate-400 text-sm'>
            No shift scheduled
          </div>
        ) : (
          <div className='space-y-2'>
            {dayShifts.map((shift: any) => (
              <div
                key={shift._id}
                className='bg-slate-100 dark:bg-slate-800 rounded-2xl p-4'
              >
                {editingId === shift._id ? (
                  // EDIT MODE
                  <div className='space-y-3'>
                    <div className='flex gap-2'>
                      <input
                        type='time'
                        value={editStart}
                        onChange={(e) => setEditStart(e.target.value)}
                        className='w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
                      />
                      <input
                        type='time'
                        value={editEnd}
                        onChange={(e) => setEditEnd(e.target.value)}
                        className='w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
                      />
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleSave(shift._id)}
                        className='flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1'
                      >
                        <Check size={14} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className='flex-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-2 rounded-xl text-sm font-medium'
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // VIEW MODE
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <CalendarDays size={20} className='text-green-500' />
                      <div>
                        <p className='text-lg font-bold text-slate-900 dark:text-white tracking-tight'>
                          {shift.startTime} – {shift.endTime}
                        </p>
                        <p className='text-xs text-slate-400 mt-0.5'>Shift</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => startEdit(shift)}
                        className='bg-white dark:bg-slate-900 p-2 rounded-xl text-slate-400 hover:text-green-500 transition-colors'
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(shift._id)}
                        className='bg-white dark:bg-slate-900 p-2 rounded-xl text-slate-400 hover:text-red-400 transition-colors'
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// =======================
// 📅 WEEK VIEW
// =======================
const WeekView = ({ shifts, setShifts, startOfWeek, locale }: any) => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

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
                      Today
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

// =======================
// 📅 MONTH VIEW
// =======================
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
