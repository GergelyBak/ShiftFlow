import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { ChevronLeft, ChevronRight, Clock, Star } from 'lucide-react';
import { toast } from 'react-toastify';

const SummaryView = () => {
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('month');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSummary();
  }, [currentDate, view]);

  const getRange = () => {
    if (view === 'month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0); // utolsó nap
      const fmt = (d: Date) => d.toISOString().split('T')[0];
      return { start: fmt(start), end: fmt(end) };
    } else {
      const d = new Date(currentDate);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(d.setDate(diff));
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      };
    }
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const { start, end } = getRange();
      const res = await api.get(
        `/attendance/summary?start=${start}&end=${end}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSummary(res.data);
    } catch {
      toast.error('Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

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

  const rangeLabel = () => {
    if (view === 'month') {
      return currentDate.toLocaleString('de-DE', {
        month: 'long',
        year: 'numeric',
      });
    } else {
      const { start, end } = getRange();
      const fmt = (s: string) =>
        new Date(s).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
        });
      return `${fmt(start)} – ${fmt(end)}`;
    }
  };

  const formatHours = (h: number) => {
    const hours = Math.floor(h);
    const minutes = Math.round((h - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className='pb-24'>
      {/* NAV */}
      <div className='flex items-center justify-between mb-4'>
        <div className='bg-slate-200 dark:bg-slate-800 rounded-full p-1 flex'>
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              view === 'week'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              view === 'month'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Month
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
            {rangeLabel()}
          </span>
          <button
            onClick={next}
            className='text-slate-600 dark:text-slate-300 p-0.5'
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <p className='text-slate-400 text-sm'>Loading...</p>
        </div>
      ) : summary.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 gap-2'>
          <Clock size={32} className='text-slate-400' />
          <p className='text-slate-400 text-sm'>
            No approved records for this period
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {summary.map((s) => (
            <div
              key={s.user.id}
              className='bg-slate-200/60 dark:bg-slate-800 rounded-2xl p-4'
            >
              {/* User header */}
              <div className='flex items-center gap-3 mb-3'>
                <div className='w-10 h-10 rounded-full bg-green-600 dark:bg-green-700 flex items-center justify-center text-sm font-bold text-white shrink-0'>
                  {s.user.firstName?.[0]}
                  {s.user.lastName?.[0]}
                </div>
                <div>
                  <p className='text-sm font-semibold text-slate-800 dark:text-white'>
                    {s.user.firstName} {s.user.lastName}
                  </p>
                  <p className='text-xs text-slate-400'>{s.user.email}</p>
                </div>
              </div>

              {/* Hours grid */}
              <div className='grid grid-cols-3 gap-2'>
                {/* Normal hours */}
                <div className='bg-white dark:bg-slate-900 rounded-xl p-3 text-center'>
                  <p className='text-xs text-slate-400 mb-1'>Normal</p>
                  <p className='text-sm font-bold text-slate-800 dark:text-white'>
                    {formatHours(s.normalHours)}
                  </p>
                </div>

                {/* Holiday hours */}
                <div
                  className={`rounded-xl p-3 text-center ${
                    s.holidayHours > 0
                      ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                      : 'bg-white dark:bg-slate-900'
                  }`}
                >
                  <p className='text-xs text-slate-400 mb-1 flex items-center justify-center gap-1'>
                    <Star
                      size={10}
                      className={s.holidayHours > 0 ? 'text-amber-500' : ''}
                    />
                    Holiday
                  </p>
                  <p
                    className={`text-sm font-bold ${
                      s.holidayHours > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-800 dark:text-white'
                    }`}
                  >
                    {formatHours(s.holidayHours)}
                  </p>
                </div>

                {/* Total */}
                <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-center'>
                  <p className='text-xs text-slate-400 mb-1'>Total</p>
                  <p className='text-sm font-bold text-green-700 dark:text-green-400'>
                    {formatHours(s.totalHours)}
                  </p>
                </div>
              </div>

              {/* Holiday bonus */}
              {s.holidayBonus > 0 && (
                <div className='mt-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 flex items-center justify-between'>
                  <span className='text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1'>
                    🎉 Holiday bonus (+50%)
                  </span>
                  <span className='text-xs font-bold text-amber-600 dark:text-amber-400'>
                    +{formatHours(s.holidayBonus)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SummaryView;
