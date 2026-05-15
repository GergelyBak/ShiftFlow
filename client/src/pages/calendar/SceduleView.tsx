import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { ChevronLeft, ChevronRight, Check, X, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

type View = 'week' | 'month';

const ScheduleView = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('week');
  const [editingCell, setEditingCell] = useState<{
    userId: string;
    date: string;
  } | null>(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [currentDate, view]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch {
      toast.error('Failed to load users');
    }
  };

  const fetchShifts = async () => {
    try {
      const days = getDays();
      const start = days[0].toISOString().split('T')[0];
      const end = days[days.length - 1].toISOString().split('T')[0];
      const res = await api.get(`/shifts/range?start=${start}&end=${end}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShifts(res.data);
    } catch {
      toast.error('Failed to load shifts');
    }
  };

  // ── Date helpers ──────────────────────────────────────────
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getDays = (): Date[] => {
    if (view === 'week') {
      const start = getStartOfWeek(currentDate);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      });
    } else {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return Array.from(
        { length: daysInMonth },
        (_, i) => new Date(year, month, i + 1),
      );
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
    if (view === 'week') {
      const days = getDays();
      const fmt = (d: Date) =>
        d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      return `${fmt(days[0])} – ${fmt(days[6])}`;
    } else {
      return currentDate.toLocaleString('de-DE', {
        month: 'long',
        year: 'numeric',
      });
    }
  };

  // ── Shift helpers ─────────────────────────────────────────
  const getShiftForCell = (userId: string, date: Date) => {
    return shifts.find((s: any) => {
      const sDate = new Date(s.date);
      return (
        s.userId?._id === userId && sDate.toDateString() === date.toDateString()
      );
    });
  };

  const openEdit = (userId: string, date: Date, shift?: any) => {
    const dateStr = date.toISOString().split('T')[0];
    setEditingCell({ userId, date: dateStr });
    setEditStart(shift?.startTime || '');
    setEditEnd(shift?.endTime || '');
  };

  const closeEdit = () => {
    setEditingCell(null);
    setEditStart('');
    setEditEnd('');
  };

  const handleSave = async () => {
    if (!editingCell || !editStart || !editEnd) return;
    setLoading(true);
    try {
      const existing = shifts.find((s: any) => {
        const sDate = new Date(s.date);
        const cellDate = new Date(editingCell.date);
        return (
          s.userId?._id === editingCell.userId &&
          sDate.toDateString() === cellDate.toDateString()
        );
      });

      if (existing) {
        await api.patch(
          `/shifts/${existing._id}`,
          { startTime: editStart, endTime: editEnd },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await api.post(
          '/shifts',
          {
            date: editingCell.date,
            startTime: editStart,
            endTime: editEnd,
            targetUserId: editingCell.userId,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
      await fetchShifts();
      toast.success('Shift saved');
      closeEdit();
    } catch {
      toast.error('Failed to save shift');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shiftId: string) => {
    try {
      await api.delete(`/shifts/${shiftId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchShifts();
      toast.success('Shift deleted');
      closeEdit();
    } catch {
      toast.error('Failed to delete shift');
    }
  };

  const days = getDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className='pb-24'>
      {/* NAV */}
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

      {/* TABLE */}
      <div className='overflow-x-auto rounded-2xl'>
        <table className='w-full border-collapse min-w-max'>
          {/* HEADER */}
          <thead>
            <tr>
              <th className='sticky left-0 z-10 bg-slate-200 dark:bg-slate-800 text-left px-3 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 w-24 rounded-tl-2xl'>
                Employee
              </th>
              {days.map((day, i) => {
                const isToday = day.toDateString() === today.toDateString();
                return (
                  <th
                    key={i}
                    className={`px-2 py-2.5 text-center text-xs font-semibold min-w-80px ${
                      isToday
                        ? 'text-green-500'
                        : 'text-slate-500 dark:text-slate-400'
                    } ${i === days.length - 1 ? 'rounded-tr-2xl' : ''}`}
                    style={{ background: 'rgb(226 232 240 / 0.6)' }}
                  >
                    <span className='block'>
                      {day.toLocaleDateString('de-DE', { weekday: 'short' })}
                    </span>
                    <span
                      className={`block font-bold ${isToday ? 'text-green-500' : 'text-slate-700 dark:text-slate-200'}`}
                    >
                      {day.getDate()}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {users.map((user, userIdx) => (
              <tr
                key={user._id}
                className={
                  userIdx % 2 === 0
                    ? 'bg-white dark:bg-slate-900'
                    : 'bg-slate-50 dark:bg-slate-900/50'
                }
              >
                {/* USER */}
                <td className='sticky left-0 z-10 px-3 py-2 bg-inherit'>
                  <div className='flex items-center gap-2'>
                    <div className='w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold text-white shrink-0'>
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </div>
                    <span className='text-xs font-medium text-slate-700 dark:text-slate-200 truncate max-w-60px'>
                      {user.firstName}
                    </span>
                  </div>
                </td>

                {/* CELLS */}
                {days.map((day, dayIdx) => {
                  const shift = getShiftForCell(user._id, day);
                  const dateStr = day.toISOString().split('T')[0];
                  const isEditing =
                    editingCell?.userId === user._id &&
                    editingCell?.date === dateStr;
                  const isToday = day.toDateString() === today.toDateString();
                  const isPast = day < today;

                  return (
                    <td
                      key={dayIdx}
                      className={`px-1.5 py-1.5 text-center align-middle border-l border-slate-100 dark:border-slate-800 ${
                        isToday ? 'bg-green-50/50 dark:bg-green-900/10' : ''
                      }`}
                    >
                      {isEditing ? (
                        // ── EDITING STATE ──
                        <div className='flex flex-col gap-1 min-w-80px'>
                          <input
                            type='time'
                            value={editStart}
                            onChange={(e) => setEditStart(e.target.value)}
                            className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-1.5 py-1 rounded-lg text-xs outline-none focus:ring-2 focus:ring-green-500'
                          />
                          <input
                            type='time'
                            value={editEnd}
                            onChange={(e) => setEditEnd(e.target.value)}
                            className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-1.5 py-1 rounded-lg text-xs outline-none focus:ring-2 focus:ring-green-500'
                          />
                          <div className='flex gap-1'>
                            <button
                              onClick={handleSave}
                              disabled={loading}
                              className='flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg py-1 flex items-center justify-center'
                            >
                              <Check size={12} />
                            </button>
                            {shift && (
                              <button
                                onClick={() => handleDelete(shift._id)}
                                className='bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg py-1 px-1.5 flex items-center justify-center'
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                            <button
                              onClick={closeEdit}
                              className='bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg py-1 px-1.5 flex items-center justify-center'
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ) : shift ? (
                        // ── HAS SHIFT ──
                        <button
                          onClick={() => openEdit(user._id, day, shift)}
                          className={`w-full rounded-xl px-1.5 py-1.5 text-center transition-colors hover:opacity-80 ${
                            isPast
                              ? 'bg-slate-100 dark:bg-slate-800'
                              : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          }`}
                        >
                          <span
                            className={`text-xs font-semibold block ${
                              isPast
                                ? 'text-slate-400 dark:text-slate-500'
                                : 'text-green-700 dark:text-green-400'
                            }`}
                          >
                            {shift.startTime}
                          </span>
                          <span
                            className={`text-xs block ${
                              isPast
                                ? 'text-slate-400 dark:text-slate-500'
                                : 'text-green-600 dark:text-green-500'
                            }`}
                          >
                            {shift.endTime}
                          </span>
                        </button>
                      ) : (
                        // ── EMPTY CELL ──
                        <button
                          onClick={() => openEdit(user._id, day)}
                          className='w-full h-12 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors flex items-center justify-center'
                        >
                          <span className='text-slate-300 dark:text-slate-700 text-lg leading-none'>
                            +
                          </span>
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleView;
