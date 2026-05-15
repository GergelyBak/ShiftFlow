import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { ChevronLeft, Plus, X, Trash2, Check, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const Absence = () => {
  const navigate = useNavigate();
  const [absences, setAbsences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
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
      toast.error('Failed to load absences');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason) {
      toast.error('Please fill in all fields');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date must be after start date');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(
        '/absences',
        { startDate, endDate, reason },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAbsences((prev) => [res.data, ...prev]);
      toast.success('Absence request submitted!');
      setShowForm(false);
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch {
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(
        `/absences/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAbsences((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: 'approved' } : a)),
      );
      toast.success('Approved!');
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(
        `/absences/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAbsences((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: 'rejected' } : a)),
      );
      toast.success('Rejected!');
    } catch {
      toast.error('Failed to reject');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/absences/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAbsences((prev) => prev.filter((a) => a._id !== id));
      toast.success('Deleted!');
    } catch {
      toast.error('Failed to delete');
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
          <Check size={11} /> Approved
        </span>
      );
    if (status === 'rejected')
      return (
        <span className='flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold'>
          <X size={11} /> Rejected
        </span>
      );
    return (
      <span className='flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold'>
        <Clock size={11} /> Pending
      </span>
    );
  };

  return (
    <div className='pb-24'>
      {/* HEADER */}
      <div className='flex items-center gap-3 mb-6'>
        <button
          onClick={() => navigate('/profile')}
          className='w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center'
        >
          <ChevronLeft
            size={18}
            className='text-slate-600 dark:text-slate-300'
          />
        </button>
        <h1 className='text-xl font-semibold text-slate-900 dark:text-white'>
          Absences
        </h1>
      </div>

      {/* ADD BUTTON — csak employee */}
      {
        <button
          onClick={() => setShowForm(!showForm)}
          className='w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slateate-400 hover:border-green-400 hover:text-green-500 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors text-sm font-medium mb-3'
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Request absence'}
        </button>
      }

      {/* FORM */}
      {showForm && (
        <div className='bg-slate-200/60 dark:bg-slate-800 rounded-2xl p-4 space-y-3 mb-3'>
          <div className='grid grid-cols-2 gap-2'>
            <div>
              <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
                From *
              </label>
              <input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
              />
            </div>
            <div>
              <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
                To *
              </label>
              <input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
              />
            </div>
          </div>

          <div>
            <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
              Reason *
            </label>
            <input
              type='text'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='e.g. Urlaub, Krankheit...'
              className='w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className='w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors'
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      )}

      {/* LIST */}
      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <p className='text-slate-400 text-sm'>Loading...</p>
        </div>
      ) : absences.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 gap-2'>
          <Clock size={32} className='text-slate-400' />
          <p className='text-slate-400 text-sm'>No absence requests yet</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {absences.map((absence) => (
            <div
              key={absence._id}
              className='bg-slate-200/60 dark:bg-slate-800 rounded-2xl p-4'
            >
              {/* Admin: user neve */}
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
                  <p className='text-sm font-semibold text-slate-800 dark:text-white'>
                    {formatDate(absence.startDate)}
                    {absence.startDate !== absence.endDate &&
                      ` – ${formatDate(absence.endDate)}`}
                    <span className='ml-2 text-xs text-slate-400 font-normal'>
                      ({calcDays(absence.startDate, absence.endDate)} day
                      {calcDays(absence.startDate, absence.endDate) > 1
                        ? 's'
                        : ''}
                      )
                    </span>
                  </p>
                  <p className='text-xs text-slate-400 mt-0.5'>
                    {absence.reason}
                  </p>
                </div>
                <div className='flex items-center gap-2 shrink-0'>
                  {statusBadge(absence.status)}
                </div>
              </div>

              {/* Admin actions */}
              {isAdmin && absence.status === 'pending' && (
                <div className='flex gap-2 mt-3'>
                  <button
                    onClick={() => handleApprove(absence._id)}
                    className='flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-semibold hover:bg-green-500/20 transition-colors'
                  >
                    <Check size={13} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(absence._id)}
                    className='flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors'
                  >
                    <X size={13} /> Reject
                  </button>
                </div>
              )}

              {/* Employee: delete pending */}
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
