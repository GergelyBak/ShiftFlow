import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { ChevronLeft, ChevronRight, Clock, Star, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { exportAttendancePdf } from '../../utils/exportPdf';

const SummaryView = () => {
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('month');
  const { t } = useTranslation();

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSummary();
  }, [currentDate, view]);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const getRange = () => {
    if (view === 'month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return { start: fmt(start), end: fmt(end) };
    } else {
      const d = new Date(currentDate);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(d.setDate(diff));
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start: fmt(start), end: fmt(end) };
    }
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const { start, end } = getRange();
      const res = await api.get(
        `/attendance/summary?start=${start}&end=${end}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSummary(res.data);
    } catch {
      toast.error(t('toastFailedSummary'));
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async (s: any) => {
    setExportingId(s.user.id);
    try {
      const { start, end } = getRange();
      const [detailRes, balanceRes] = await Promise.all([
        api.get(`/attendance/detail?userId=${s.user.id}&start=${start}&end=${end}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/attendance/overtime-total?userId=${s.user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const monthLabel = currentDate.toLocaleString('de-DE', {
        month: 'long',
        year: 'numeric',
      });
      exportAttendancePdf(s.user, detailRes.data, monthLabel, {
        ...s,
        overtimeBalance: balanceRes.data.totalOvertime,
      });
      toast.success(t('toastPdfExported'));
    } catch {
      toast.error(t('toastFailedPdf'));
    } finally {
      setExportingId(null);
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
      const fmtLabel = (s: string) =>
        new Date(s + 'T12:00:00').toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
        });
      return `${fmtLabel(start)} – ${fmtLabel(end)}`;
    }
  };

  const formatHours = (h: number) => {
    const hours = Math.floor(h);
    const minutes = Math.round((h - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className='pb-24'>
      <div className='flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='bg-slate-200 dark:bg-slate-800 rounded-full p-1 flex'>
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              view === 'week'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
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

        <div className='flex items-center gap-1 bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-full self-start sm:self-auto'>
          <button onClick={prev} className='text-slate-600 dark:text-slate-300 p-0.5'>
            <ChevronLeft size={16} />
          </button>
          <span className='text-sm font-medium text-slate-700 dark:text-slate-200 px-1'>
            {rangeLabel()}
          </span>
          <button onClick={next} className='text-slate-600 dark:text-slate-300 p-0.5'>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <p className='text-slate-400 text-sm'>{t('loading')}</p>
        </div>
      ) : summary.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 gap-2'>
          <Clock size={32} className='text-slate-400' />
          <p className='text-slate-400 text-sm'>{t('noApprovedRecords')}</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {summary.map((s) => (
            <div
              key={s.user.id}
              className='bg-slate-200/60 dark:bg-slate-800 rounded-2xl p-4'
            >
              <div className='flex items-center justify-between gap-3 mb-3'>
                <div className='flex items-center gap-3'>
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
                <button
                  onClick={() => handleExportPdf(s)}
                  disabled={exportingId === s.user.id}
                  className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-green-500/10 hover:text-green-500 disabled:opacity-40 transition-colors shrink-0'
                >
                  <Download size={13} />
                  {exportingId === s.user.id ? t('exporting') : t('pdf')}
                </button>
              </div>

              <div className='grid grid-cols-3 gap-2'>
                <div className='bg-white dark:bg-slate-900 rounded-xl p-3 text-center'>
                  <p className='text-xs text-slate-400 mb-1'>{t('normal')}</p>
                  <p className='text-sm font-bold text-slate-800 dark:text-white'>
                    {formatHours(s.normalHours)}
                  </p>
                </div>

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
                    {t('holiday')}
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

                <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-center'>
                  <p className='text-xs text-slate-400 mb-1'>{t('total')}</p>
                  <p className='text-sm font-bold text-green-700 dark:text-green-400'>
                    {formatHours(s.totalHours)}
                  </p>
                </div>
              </div>

              {s.overtime != null && (
                <div className={`mt-2 rounded-xl px-3 py-2 flex items-center justify-between border ${
                  s.overtime >= 0
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <span className={`text-xs font-medium flex items-center gap-1 ${
                    s.overtime >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                  }`}>
                    {s.overtime >= 0
                      ? <TrendingUp size={12} />
                      : <TrendingDown size={12} />}
                    {t('overtime')} ({t('expected')}: {formatHours(s.expectedHours)})
                  </span>
                  <span className={`text-xs font-bold ${
                    s.overtime >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                  }`}>
                    {s.overtime >= 0 ? '+' : ''}{formatHours(Math.abs(s.overtime))}
                  </span>
                </div>
              )}

              {s.holidayBonus > 0 && (
                <div className='mt-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 flex items-center justify-between'>
                  <span className='text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1'>
                    🎉 {t('holidayBonus')}
                  </span>
                  <span className='text-xs font-bold text-amber-600 dark:text-amber-400'>
                    +{formatHours(s.holidayBonus)}
                  </span>
                </div>
              )}

              {(s.vacationDays > 0 || s.sickDays > 0 || s.timeOffDays > 0) && (
                <div className='mt-2 grid grid-cols-3 gap-2'>
                  {s.vacationDays > 0 && (
                    <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2 flex items-center justify-between'>
                      <span className='text-xs text-blue-600 dark:text-blue-400 font-medium'>
                        {t('typePaidVacation')}
                      </span>
                      <span className='text-xs font-bold text-blue-600 dark:text-blue-400'>
                        {s.vacationDays}d
                      </span>
                    </div>
                  )}
                  {s.sickDays > 0 && (
                    <div className='bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-3 py-2 flex items-center justify-between'>
                      <span className='text-xs text-orange-600 dark:text-orange-400 font-medium'>
                        {t('typeSickLeave')}
                      </span>
                      <span className='text-xs font-bold text-orange-600 dark:text-orange-400'>
                        {s.sickDays}d
                      </span>
                    </div>
                  )}
                  {s.timeOffDays > 0 && (
                    <div className='bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-2 flex items-center justify-between'>
                      <span className='text-xs text-purple-600 dark:text-purple-400 font-medium'>
                        {t('typeTimeOff')}
                      </span>
                      <span className='text-xs font-bold text-purple-600 dark:text-purple-400'>
                        {s.timeOffDays}d
                      </span>
                    </div>
                  )}
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
