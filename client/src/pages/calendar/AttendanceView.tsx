import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { Check, Clock, Trash2, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const AttendanceView = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { t } = useTranslation();

  const [selectedUserId, setSelectedUserId] = useState('');
  const [date, setDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [breakMinutes, setBreakMinutes] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAttendance();
    fetchUsers();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(res.data);
    } catch {
      toast.error(t('toastFailedLoad'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      if (res.data.length > 0) setSelectedUserId(res.data[0]._id);
    } catch {
      console.error(t('toastFailedLoadUsers'));
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(
        `/attendance/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRecords((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: 'approved' } : r)),
      );
      toast.success(t('toastApproved'));
    } catch {
      toast.error(t('toastFailedApprove'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/attendance/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords((prev) => prev.filter((r) => r._id !== id));
      toast.success(t('toastDeleted'));
    } catch {
      toast.error(t('toastFailedDelete'));
    }
  };

  const handleManualAdd = async () => {
    if (!selectedUserId || !date || !checkInTime) {
      toast.error(t('fillRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(
        '/attendance/manual',
        {
          userId: selectedUserId,
          date,
          checkInTime,
          checkOutTime: checkOutTime || undefined,
          breakMinutes: parseInt(breakMinutes) || 0,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRecords((prev) => [res.data, ...prev]);
      toast.success(t('toastAttendanceAdded'));
      setShowForm(false);
      setDate('');
      setCheckInTime('');
      setCheckOutTime('');
      setBreakMinutes('0');
    } catch {
      toast.error(t('toastFailedAdd'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const calcDuration = (
    checkIn: string,
    checkOut?: string,
    breakMins?: number,
  ) => {
    if (!checkOut) return '—';
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const breakMs = (breakMins || 0) * 60 * 1000;
    const total = diff - breakMs;
    const hours = Math.floor(total / 1000 / 60 / 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-slate-400 text-sm'>{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className='space-y-3 pb-24'>
      {/* ADD BUTTON */}
      <button
        onClick={() => setShowForm(!showForm)}
        className='w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-green-400 hover:text-green-500 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors text-sm font-medium'
      >
        {showForm ? <X size={16} /> : <Plus size={16} />}
        {showForm ? t('cancel') : t('addManually')}
      </button>

      {/* MANUAL ADD FORM */}
      {showForm && (
        <div className='bg-slate-200/60 dark:bg-slate-800 rounded-2xl p-4 space-y-3'>
          <div>
            <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
              {t('employee')}
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className='w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
              {t('dateRequired')}
            </label>
            <input
              type='date'
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className='w-full min-w-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
            />
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <div>
              <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
                {t('checkInRequired')}
              </label>
              <input
                type='time'
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className='w-full min-w-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
              />
            </div>
            <div>
              <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
                {t('checkOutLabel2')}
              </label>
              <input
                type='time'
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className='w-full min-w-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
              />
            </div>
          </div>

          <div>
            <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
              {t('breakMinutes')}
            </label>
            <input
              type='number'
              min='0'
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(e.target.value)}
              className='w-full min-w-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
              placeholder='0'
            />
          </div>

          <button
            onClick={handleManualAdd}
            disabled={submitting}
            className='w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors'
          >
            {submitting ? t('saving') : t('saveAttendance')}
          </button>
        </div>
      )}

      {/* RECORDS */}
      {records.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 gap-2'>
          <Clock size={32} className='text-slate-400' />
          <p className='text-slate-400 text-sm'>{t('noAttendanceRecords')}</p>
        </div>
      ) : (
        records.map((record) => {
          const isPending = record.status === 'pending';
          const user = record.userId;

          return (
            <div
              key={record._id}
              className={`bg-slate-200/60 dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 ${
                record.isHoliday
                  ? 'border border-amber-300 dark:border-amber-700'
                  : ''
              }`}
            >
              <div className='flex items-center gap-3 min-w-0'>
                <div className='w-9 h-9 rounded-full bg-green-600 dark:bg-green-700 flex items-center justify-center text-xs font-bold text-white shrink-0'>
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
                <div className='min-w-0'>
                  <p className='text-sm font-semibold text-slate-800 dark:text-white truncate'>
                    {user?.firstName} {user?.lastName}
                    {record.isHoliday && <span className='ml-1'>🎉</span>}
                  </p>
                  <p className='text-xs text-slate-400'>
                    {formatDate(record.checkIn)}
                  </p>
                  <p className='text-xs font-mono text-slate-500 dark:text-slate-400 sm:hidden'>
                    {formatTime(record.checkIn)} —{' '}
                    {record.checkOut ? formatTime(record.checkOut) : '?'}
                  </p>
                </div>
              </div>

              <div className='text-center hidden sm:block'>
                <p className='text-xs font-mono text-slate-700 dark:text-slate-200'>
                  {formatTime(record.checkIn)} —{' '}
                  {record.checkOut ? formatTime(record.checkOut) : '?'}
                </p>
                <p className='text-xs text-slate-400'>
                  {calcDuration(
                    record.checkIn,
                    record.checkOut,
                    record.breakMinutes,
                  )}
                  {record.breakMinutes > 0 && (
                    <span className='ml-1 text-slate-300'>
                      ({record.breakMinutes}m break)
                    </span>
                  )}
                </p>
              </div>

              <div className='flex items-center gap-2 shrink-0'>
                {isPending ? (
                  <button
                    onClick={() => handleApprove(record._id)}
                    className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-semibold hover:bg-green-500/20 transition-colors'
                  >
                    <Check size={13} />
                    {t('approve')}
                  </button>
                ) : (
                  <span className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 text-xs font-semibold'>
                    <Check size={13} />
                    {t('approved')}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(record._id)}
                  className='p-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors'
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AttendanceView;
