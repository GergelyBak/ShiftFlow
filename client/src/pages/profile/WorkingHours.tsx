import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/axios';
import { ChevronLeft, ChevronRight, Clock, Star, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { exportAttendancePdf } from '../../utils/exportPdf';

type View = 'week' | 'month';

const WorkingHours = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchSummary();
  }, [currentDate, view]);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const getRange = () => {
    if (view === 'month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      return {
        start: fmt(new Date(year, month, 1)),
        end: fmt(new Date(year, month + 1, 0)),
      };
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
      const mine = res.data.find((s: any) => s.user.id === user.id);
      setSummary(mine || null);
    } catch {
      toast.error(t('toastFailedWorkingHours'));
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!summary) return;
    setExporting(true);
    try {
      const { start, end } = getRange();
      const res = await api.get(
        `/attendance/detail?userId=${user.id}&start=${start}&end=${end}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const label =
        view === 'month'
          ? currentDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' })
          : rangeLabel();
      exportAttendancePdf(summary.user, res.data, label, summary);
      toast.success(t('toastPdfExported'));
    } catch {
      toast.error(t('toastFailedPdf'));
    } finally {
      setExporting(false);
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
      return currentDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
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

  const totalWithBonus = summary ? summary.totalHours : 0;

  return (
    <div className='pb-24'>
      {/* HEADER */}
      <div className='flex items-center gap-3 mb-6'>
        <button
          onClick={() => navigate('/profile')}
          className='w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center'
        >
          <ChevronLeft size={18} className='text-slate-600 dark:text-slate-300' />
        </button>
        <h1 className='text-xl font-semibold text-slate-900 dark:text-white'>
          {t('workingHours')}
        </h1>
      </div>

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

      {/* CONTENT */}
      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <p className='text-slate-400 text-sm'>{t('loading')}</p>
        </div>
      ) : !summary ? (
        <div className='flex flex-col items-center justify-center py-12 gap-2'>
          <Clock size={32} className='text-slate-400' />
          <p className='text-slate-400 text-sm'>{t('noApprovedRecords')}</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {/* HOURS GRID */}
          <div className='bg-slate-200/60 dark:bg-slate-800 rounded-2xl p-4'>
            <div className='grid grid-cols-2 gap-2 mb-2'>
              <div className='bg-white dark:bg-slate-900 rounded-xl p-3 text-center'>
                <p className='text-xs text-slate-400 mb-1'>{t('normal')}</p>
                <p className='text-lg font-bold text-slate-800 dark:text-white'>
                  {formatHours(summary.normalHours)}
                </p>
              </div>

              <div
                className={`rounded-xl p-3 text-center ${
                  summary.holidayHours > 0
                    ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                    : 'bg-white dark:bg-slate-900'
                }`}
              >
                <p className='text-xs text-slate-400 mb-1 flex items-center justify-center gap-1'>
                  <Star size={10} className={summary.holidayHours > 0 ? 'text-amber-500' : ''} />
                  {t('holiday')}
                </p>
                <p className={`text-lg font-bold ${
                  summary.holidayHours > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-800 dark:text-white'
                }`}>
                  {formatHours(summary.holidayHours)}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-2'>
              <div
                className={`rounded-xl p-3 text-center ${
                  summary.holidayBonus > 0
                    ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                    : 'bg-white dark:bg-slate-900'
                }`}
              >
                <p className='text-xs text-slate-400 mb-1 flex items-center justify-center gap-1'>
                  🎉 {t('bonus')}
                </p>
                <p className={`text-lg font-bold ${
                  summary.holidayBonus > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-800 dark:text-white'
                }`}>
                  +{formatHours(summary.holidayBonus)}
                </p>
              </div>

              <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-center'>
                <p className='text-xs text-slate-400 mb-1'>{t('total')}</p>
                <p className='text-lg font-bold text-green-700 dark:text-green-400'>
                  {formatHours(totalWithBonus)}
                </p>
              </div>
            </div>
          </div>

          {/* EXPORT PDF */}
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className='w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold text-sm transition-colors'
          >
            <Download size={16} />
            {exporting ? t('exporting') : t('exportPdf')}
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkingHours;
