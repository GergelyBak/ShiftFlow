import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { CalendarDays, X, Pencil, Trash2, Check, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { addNotification } from '../../utils/notifications';

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
  const [colleagues, setColleagues] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'save';
    id: string;
  } | null>(null);
  const { t } = useTranslation();

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    const fetchColleagues = async () => {
      try {
        const token = localStorage.getItem('token');
        const dateStr = selectedDay.toISOString().split('T')[0];
        const res = await api.get(`/shifts/by-date/${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const others = res.data.filter(
          (s: any) => s.userId?._id !== currentUser.id,
        );
        setColleagues(others);
      } catch (err) {
        console.error(err);
      }
    };
    fetchColleagues();
  }, [selectedDay]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/attendance/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dayAttendance = res.data.find((a: any) => {
          const d = new Date(a.checkIn);
          return (
            d.toDateString() === selectedDay.toDateString() &&
            a.status === 'approved'
          );
        });
        setAttendance(dayAttendance || null);
      } catch {
        // silent fail
      }
    };
    fetchAttendance();
  }, [selectedDay]);

  const handleDelete = (id: string) => {
    setConfirmAction({ type: 'delete', id });
  };

  const startEdit = (shift: any) => {
    setEditingId(shift._id);
    setEditStart(shift.startTime);
    setEditEnd(shift.endTime);
  };

  const handleSave = (id: string) => {
    setConfirmAction({ type: 'save', id });
  };

  const confirmExecute = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'delete') {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/shifts/${confirmAction.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShifts((prev: any[]) =>
          prev.filter((s) => s._id !== confirmAction.id),
        );
        addNotification(t('toastShiftDeleted'));
        toast.success(t('toastShiftDeleted'));
        onClose();
      } catch {
        toast.error(t('toastCouldNotDelete'));
      }
    }

    if (confirmAction.type === 'save') {
      try {
        const token = localStorage.getItem('token');
        await api.patch(
          `/shifts/${confirmAction.id}`,
          { startTime: editStart, endTime: editEnd },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setShifts((prev: any[]) =>
          prev.map((s) =>
            s._id === confirmAction.id
              ? { ...s, startTime: editStart, endTime: editEnd }
              : s,
          ),
        );
        setColleagues((prev: any[]) =>
          prev.map((s) =>
            s._id === confirmAction.id
              ? { ...s, startTime: editStart, endTime: editEnd }
              : s,
          ),
        );
        setEditingId(null);
        addNotification(`${t('toastShiftUpdated')}: ${editStart} – ${editEnd}`);
        toast.success(t('toastShiftUpdated'));
      } catch {
        toast.error(t('toastCouldNotUpdate'));
      }
    }

    setConfirmAction(null);
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calcDuration = (checkIn: string, checkOut?: string) => {
    if (!checkOut) return null;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    return `${hours}h ${minutes}m`;
  };

  const dayShifts = shifts.filter((s: any) => {
    const d = new Date(s.date);
    return d.toDateString() === selectedDay.toDateString();
  });

  const ShiftCard = ({
    shift,
    showControls,
  }: {
    shift: any;
    showControls: boolean;
  }) => (
    <div className='bg-slate-100 dark:bg-slate-800 rounded-2xl p-4'>
      {editingId === shift._id ? (
        <div className='space-y-3'>
          <div className='flex gap-2'>
            <input
              type='time'
              value={editStart}
              onChange={(e) => setEditStart(e.target.value)}
              className='w-full min-w-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
            />
            <input
              type='time'
              value={editEnd}
              onChange={(e) => setEditEnd(e.target.value)}
              className='w-full min-w-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
            />
          </div>
          <div className='flex gap-2'>
            <button
              onClick={() => handleSave(shift._id)}
              className='flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1'
            >
              <Check size={14} />
              {t('save')}
            </button>
            <button
              onClick={() => setEditingId(null)}
              className='flex-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-2 rounded-xl text-sm font-medium'
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <CalendarDays size={20} className='text-green-500' />
            <div>
              <p className='text-lg font-bold text-slate-900 dark:text-white tracking-tight'>
                {shift.startTime} – {shift.endTime}
              </p>
              <p className='text-xs text-slate-400 mt-0.5'>{t('shift')}</p>
            </div>
          </div>
          {showControls && (
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
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
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

          {/* MY SHIFTS */}
          <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2'>
            {t('myShift')}
          </p>

          {dayShifts.length === 0 ? (
            <div className='bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 text-center text-slate-400 text-sm mb-4'>
              {t('noShiftScheduled')}
            </div>
          ) : (
            <div className='space-y-2 mb-4'>
              {dayShifts.map((shift: any) => (
                <ShiftCard key={shift._id} shift={shift} showControls={true} />
              ))}
            </div>
          )}

          {/* ATTENDANCE */}
          {attendance && (
            <>
              <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2'>
                {t('attendance')}
              </p>
              <div className='bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-4'>
                <div className='flex items-center gap-3'>
                  <Clock size={20} className='text-blue-400' />
                  <div>
                    <p className='text-lg font-bold text-slate-900 dark:text-white tracking-tight'>
                      {formatTime(attendance.checkIn)}
                      {attendance.checkOut &&
                        ` – ${formatTime(attendance.checkOut)}`}
                    </p>
                    <div className='flex items-center gap-2 mt-0.5'>
                      <span className='text-xs text-slate-400'>
                        {calcDuration(attendance.checkIn, attendance.checkOut) ||
                          t('stillWorking')}
                      </span>
                      <span className='text-xs font-medium text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full'>
                        ✓ {t('approved')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* COLLEAGUES */}
          {colleagues.length > 0 && (
            <>
              <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2'>
                {isAdmin ? t('teamShifts') : t('alsoWorking')}
              </p>
              <div className='space-y-2'>
                {colleagues.map((s: any) => (
                  <div key={s._id}>
                    <div className='flex items-center gap-2 mb-1 px-1'>
                      <div className='w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xs font-semibold text-green-600 dark:text-green-400'>
                        {s.userId?.firstName?.[0]}
                        {s.userId?.lastName?.[0]}
                      </div>
                      <p className='text-xs font-medium text-slate-600 dark:text-slate-400'>
                        {s.userId?.firstName} {s.userId?.lastName}
                      </p>
                    </div>
                    <ShiftCard shift={s} showControls={isAdmin} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {confirmAction && (
        <div
          className='fixed inset-0 bg-black/60 z-60 flex items-center justify-center px-6'
          onClick={() => setConfirmAction(null)}
        >
          <div
            className='bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm'
            onClick={(e) => e.stopPropagation()}
          >
            <p className='text-base font-semibold text-slate-900 dark:text-white mb-1'>
              {confirmAction.type === 'delete'
                ? t('deleteShiftConfirm')
                : t('saveChangesConfirm')}
            </p>
            <p className='text-sm text-slate-400 mb-5'>
              {confirmAction.type === 'delete'
                ? t('deleteConfirmMsg')
                : t('updateShiftMsg', { start: editStart, end: editEnd })}
            </p>
            <div className='flex gap-2'>
              <button
                onClick={() => setConfirmAction(null)}
                className='flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-2.5 rounded-2xl text-sm font-medium'
              >
                {t('cancel')}
              </button>
              <button
                onClick={confirmExecute}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-medium text-white transition-colors ${
                  confirmAction.type === 'delete'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {confirmAction.type === 'delete' ? t('delete') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShiftModal;
