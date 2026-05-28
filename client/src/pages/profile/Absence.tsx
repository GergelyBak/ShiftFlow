import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/axios';
import { ChevronLeft, Plus, X, Trash2, Check, Clock, FileCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const TYPE_LABELS: Record<string, string> = {
  vacation: 'Urlaub',
  sick: 'Krank',
  personal: 'Persönlich',
};

const TYPE_COLORS: Record<string, string> = {
  vacation: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  sick: 'bg-red-500/10 border-red-500/30 text-red-400',
  personal: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
};

const Absence = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [absences, setAbsences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState<'vacation' | 'sick' | 'personal'>('vacation');
  const [hasCertificate, setHasCertificate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = async () => {
    try {
      const endpoint = isAdmin ? '/absences/all' : '/absences/my';
      const res = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAbsences(res.data);
    } catch {
      toast.error(t('toastFailedLoadAbsences'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setReason('');
    setType('vacation');
    setHasCertificate(false);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason) {
      toast.error(t('fillRequired'));
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error(t('endDateAfterStart'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(
        '/absences',
        { startDate, endDate, reason, type, hasCertificate },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAbsences((prev) => [res.data, ...prev]);
      toast.success(t('absenceSubmitted'));
      resetForm();
    } catch {
      toast.error(t('toastFailedSubmit'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(
        `/absences/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAbsences((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: 'approved' } : a)),
      );
      toast.success(t('toastApproved'));
    } catch {
      toast.error(t('toastFailedApprove'));
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(
        `/absences/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAbsences((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: 'rejected' } : a)),
      );
      toast.success(t('toastRejected'));
    } catch {
      toast.error(t('toastFailedReject'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/absences/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAbsences((prev) => prev.filter((a) => a._id !== id));
      toast.success(t('toastDeleted'));
    } catch {
      toast.error(t('toastFailedDelete'));
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const calcDays = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.round(diff / 1000 / 60 / 60 / 24) + 1;
  };

  const statusBadge = (status: string) => {
    if (status === 'approved')
      return (
        <span className='flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-semibold'>
          <Check size={11} /> {t('approved')}
        </span>
      );
    if (status === 'rejected')
      return (
        <span className='flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold'>
          <X size={11} /> {t('rejected')}
        </span>
      );
    return (
      <span className='flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold'>
        <Clock size={11} /> {t('pending')}
      </span>
    );
  };

  const typeBadge = (absenceType: string) => (
    <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${TYPE_COLORS[absenceType] || TYPE_COLORS.vacation}`}>
      {TYPE_LABELS[absenceType] || absenceType}
    </span>
  );

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
          {t('absences')}
        </h1>
      </div>

      {/* ADD BUTTON */}
      <button
        onClick={() => setShowForm(!showForm)}
        className='w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-green-400 hover:text-green-500 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors text-sm font-medium mb-3'
      >
        {showForm ? <X size={16} /> : <Plus size={16} />}
        {showForm ? t('cancel') : t('requestAbsence')}
      </button>

      {/* FORM */}
      {showForm && (
        <div className='bg-slate-200/60 dark:bg-slate-800 rounded-2xl p-4 space-y-3 mb-3'>
          {/* Type selector */}
          <div>
            <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
              Typ *
            </label>
            <div className='grid grid-cols-3 gap-2'>
              {(['vacation', 'sick', 'personal'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setType(t);
                    if (t !== 'sick') setHasCertificate(false);
                  }}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    type === t
                      ? TYPE_COLORS[t] + ' ring-1 ring-inset ring-current'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className='flex items-center gap-2 bg-white dark:bg-slate-900 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-500'>
            <span className='text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0'>
              {t('from')} *
            </span>
            <input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='flex-1 min-w-0 bg-transparent text-slate-900 dark:text-white py-2.5 text-sm outline-none'
            />
          </div>
          <div className='flex items-center gap-2 bg-white dark:bg-slate-900 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-500'>
            <span className='text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0'>
              {t('to')} *
            </span>
            <input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='flex-1 min-w-0 bg-transparent text-slate-900 dark:text-white py-2.5 text-sm outline-none'
            />
          </div>

          <div>
            <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
              {t('reason')} *
            </label>
            <input
              type='text'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='Grund der Abwesenheit...'
              className='w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
            />
          </div>

          {/* Certificate checkbox — only for sick */}
          {type === 'sick' && (
            <label className='flex items-center gap-3 cursor-pointer select-none'>
              <div
                onClick={() => setHasCertificate(!hasCertificate)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  hasCertificate
                    ? 'bg-green-500 border-green-500'
                    : 'border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900'
                }`}
              >
                {hasCertificate && <Check size={12} className='text-white' />}
              </div>
              <div>
                <p className='text-sm font-medium text-slate-800 dark:text-white'>
                  Ärztliches Attest vorhanden
                </p>
                <p className='text-xs text-slate-400'>Krankschreibung liegt vor</p>
              </div>
            </label>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className='w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors'
          >
            {submitting ? t('submitting') : t('submitRequest')}
          </button>
        </div>
      )}

      {/* LIST */}
      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <p className='text-slate-400 text-sm'>{t('loading')}</p>
        </div>
      ) : absences.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 gap-2'>
          <Clock size={32} className='text-slate-400' />
          <p className='text-slate-400 text-sm'>{t('noAbsenceRequests')}</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {absences.map((absence) => (
            <div
              key={absence._id}
              className='bg-slate-200/60 dark:bg-slate-800 rounded-2xl p-4'
            >
              {isAdmin && absence.userId && (
                <div className='flex items-center gap-2 mb-2'>
                  <div className='w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold text-white'>
                    {absence.userId?.firstName?.[0]}
                    {absence.userId?.lastName?.[0]}
                  </div>
                  <p className='text-sm font-semibold text-slate-800 dark:text-white'>
                    {absence.userId?.firstName} {absence.userId?.lastName}
                  </p>
                </div>
              )}

              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2 mb-1 flex-wrap'>
                    {typeBadge(absence.type || 'vacation')}
                    {absence.type === 'sick' && absence.hasCertificate && (
                      <span className='flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-semibold'>
                        <FileCheck size={11} /> Attest
                      </span>
                    )}
                    {absence.type === 'sick' && !absence.hasCertificate && (
                      <span className='flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/30 text-slate-400 text-xs'>
                        Kein Attest
                      </span>
                    )}
                  </div>
                  <p className='text-sm font-semibold text-slate-800 dark:text-white'>
                    {formatDate(absence.startDate)}
                    {absence.startDate !== absence.endDate &&
                      ` – ${formatDate(absence.endDate)}`}
                    <span className='ml-2 text-xs text-slate-400 font-normal'>
                      ({calcDays(absence.startDate, absence.endDate)} day
                      {calcDays(absence.startDate, absence.endDate) > 1 ? 's' : ''})
                    </span>
                  </p>
                  <p className='text-xs text-slate-400 mt-0.5'>{absence.reason}</p>
                </div>
                <div className='flex items-center gap-2 shrink-0'>
                  {statusBadge(absence.status)}
                </div>
              </div>

              {isAdmin && absence.status === 'pending' && (
                <div className='flex gap-2 mt-3'>
                  <button
                    onClick={() => handleApprove(absence._id)}
                    className='flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-semibold hover:bg-green-500/20 transition-colors'
                  >
                    <Check size={13} /> {t('approve')}
                  </button>
                  <button
                    onClick={() => handleReject(absence._id)}
                    className='flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors'
                  >
                    <X size={13} /> {t('reject')}
                  </button>
                </div>
              )}

              {!isAdmin && absence.status === 'pending' && (
                <div className='flex justify-end mt-2'>
                  <button
                    onClick={() => handleDelete(absence._id)}
                    className='p-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors'
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Absence;
