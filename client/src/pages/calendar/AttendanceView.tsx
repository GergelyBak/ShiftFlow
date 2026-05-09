import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { Check, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const AttendanceView = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(res.data);
    } catch {
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(
        `/attendance/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setRecords((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: 'approved' } : r)),
      );
      toast.success('Approved!');
    } catch {
      toast.error('Failed to approve');
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

  const calcDuration = (checkIn: string, checkOut?: string) => {
    if (!checkOut) return '—';
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-slate-400 text-sm'>Loading...</div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 gap-2'>
        <Clock size={32} className='text-slate-400' />
        <p className='text-slate-400 text-sm'>No attendance records yet</p>
      </div>
    );
  }

  return (
    <div className='space-y-2 pb-24'>
      {records.map((record) => {
        const isPending = record.status === 'pending';
        const user = record.userId;

        return (
          <div
            key={record._id}
            className='bg-slate-200/60 dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3'
          >
            {/* Left — user + date */}
            <div className='flex items-center gap-3 min-w-0'>
              <div className='w-9 h-9 rounded-full bg-green-600 dark:bg-green-700 flex items-center justify-center text-xs font-bold text-white shrink-0'>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <div className='min-w-0'>
                <p className='text-sm font-semibold text-slate-800 dark:text-white truncate'>
                  {user?.firstName} {user?.lastName}
                </p>
                <p className='text-xs text-slate-400'>
                  {formatDate(record.checkIn)}
                </p>
              </div>
            </div>

            {/* Middle — times + duration */}
            <div className='text-center hidden sm:block'>
              <p className='text-xs font-mono text-slate-700 dark:text-slate-200'>
                {formatTime(record.checkIn)} —{' '}
                {record.checkOut ? formatTime(record.checkOut) : '?'}
              </p>
              <p className='text-xs text-slate-400'>
                {calcDuration(record.checkIn, record.checkOut)}
              </p>
            </div>

            {/* Right — status / approve button */}
            <div className='shrink-0'>
              {isPending ? (
                <button
                  onClick={() => handleApprove(record._id)}
                  className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-semibold hover:bg-green-500/20 transition-colors'
                >
                  <Check size={13} />
                  Approve
                </button>
              ) : (
                <span className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 text-xs font-semibold'>
                  <Check size={13} />
                  Approved
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttendanceView;
