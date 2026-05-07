import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { CalendarDays, X, Pencil, Trash2, Check } from 'lucide-react';
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
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'save';
    id: string;
  } | null>(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin'; // ✅

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
        addNotification('Shift deleted');
        toast.success('Shift deleted');
        onClose();
      } catch {
        toast.error('Could not delete shift');
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

        // colleagues frissítése is ha admin szerkesztett
        setColleagues((prev: any[]) =>
          prev.map((s) =>
            s._id === confirmAction.id
              ? { ...s, startTime: editStart, endTime: editEnd }
              : s,
          ),
        );

        setEditingId(null);
        addNotification(`Shift updated: ${editStart} – ${editEnd}`);
        toast.success('Shift updated');
      } catch {
        toast.error('Could not update shift');
      }
    }

    setConfirmAction(null);
  };

  const dayShifts = shifts.filter((s: any) => {
    const d = new Date(s.date);
    return d.toDateString() === selectedDay.toDateString();
  });

  // 🔧 reusable shift card
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
            My Shift
          </p>

          {dayShifts.length === 0 ? (
            <div className='bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 text-center text-slate-400 text-sm mb-4'>
              No shift scheduled
            </div>
          ) : (
            <div className='space-y-2 mb-4'>
              {dayShifts.map((shift: any) => (
                <ShiftCard
                  key={shift._id}
                  shift={shift}
                  showControls={true} // own shifts always editable
                />
              ))}
            </div>
          )}

          {/* COLLEAGUES */}
          {colleagues.length > 0 && (
            <>
              <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2'>
                {isAdmin ? 'Team shifts' : 'Also working'}
              </p>
              <div className='space-y-2'>
                {colleagues.map((s: any) => (
                  <div key={s._id}>
                    {/* naam van de collega */}
                    <div className='flex items-center gap-2 mb-1 px-1'>
                      <div className='w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xs font-semibold text-green-600 dark:text-green-400'>
                        {s.userId?.firstName?.[0]}
                        {s.userId?.lastName?.[0]}
                      </div>
                      <p className='text-xs font-medium text-slate-600 dark:text-slate-400'>
                        {s.userId?.firstName} {s.userId?.lastName}
                      </p>
                    </div>
                    <ShiftCard
                      shift={s}
                      showControls={isAdmin} // ✅ csak admin szerkesztheti
                    />
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
                ? 'Delete shift?'
                : 'Save changes?'}
            </p>
            <p className='text-sm text-slate-400 mb-5'>
              {confirmAction.type === 'delete'
                ? 'This action cannot be undone.'
                : `Update shift to ${editStart} – ${editEnd}?`}
            </p>
            <div className='flex gap-2'>
              <button
                onClick={() => setConfirmAction(null)}
                className='flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-2.5 rounded-2xl text-sm font-medium'
              >
                Cancel
              </button>
              <button
                onClick={confirmExecute}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-medium text-white transition-colors ${
                  confirmAction.type === 'delete'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {confirmAction.type === 'delete' ? 'Delete' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShiftModal;
