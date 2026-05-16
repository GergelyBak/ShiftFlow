import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { addNotification } from '../utils/notifications';
import { api } from '../api/axios';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const Create = () => {
  const [type, setType] = useState<'absence' | 'desired'>('desired');
  const { t } = useTranslation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.role === 'admin';

  return (
    <div className='pb-24'>
      <h1 className='text-2xl font-semibold mb-5'>{t('create')}</h1>

      <div className='bg-slate-200 dark:bg-slate-800 rounded-full p-1 flex mb-5'>
        <button
          onClick={() => setType('desired')}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
            type === 'desired'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {t('desiredTime')}
        </button>
        <button
          onClick={() => setType('absence')}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
            type === 'absence'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {t('absence')}
        </button>
      </div>

      {type === 'desired' ? <DesiredForm isAdmin={isAdmin} /> : <AbsenceForm />}
    </div>
  );
};

export default Create;

const DesiredForm = ({ isAdmin }: { isAdmin: boolean }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'de' ? 'de-DE' : 'en-GB';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedType, setSelectedType] = useState<'available' | 'unavailable'>(
    'available',
  );
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('22:00');
  const [saving, setSaving] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [shiftStart, setShiftStart] = useState('');
  const [shiftEnd, setShiftEnd] = useState('');
  const [shiftLoading, setShiftLoading] = useState(false);

  const token = localStorage.getItem('token');

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const weekLabel = `${weekDays[0].toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })} - ${weekDays[6].toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}`;

  useEffect(() => {
    fetchAvailability();
  }, [currentDate]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
        if (res.data.length > 0) setSelectedUserId(res.data[0]._id);
      } catch {
        console.error('Failed to load users');
      }
    };
    fetchUsers();
  }, [isAdmin]);

  const fetchAvailability = async () => {
    try {
      const start = fmt(weekDays[0]);
      const end = fmt(weekDays[6]);
      const res = await api.get(`/availability/my?start=${start}&end=${end}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailability(res.data);
    } catch {
      console.error('Failed to load availability');
    }
  };

  const getAvailabilityForDay = (date: Date) => {
    return availability.find((a) => {
      const d = new Date(a.date);
      return d.toDateString() === date.toDateString();
    });
  };

  const handleDayClick = (day: Date) => {
    const existing = getAvailabilityForDay(day);
    setSelectedDay(day);
    if (existing) {
      setSelectedType(existing.type);
      setStartTime(existing.startTime);
      setEndTime(existing.endTime);
    } else {
      setSelectedType('available');
      setStartTime('08:00');
      setEndTime('16:00');
    }
  };

  const handleSave = async () => {
    if (!selectedDay) return;
    setSaving(true);
    try {
      const res = await api.post(
        '/availability',
        {
          date: fmt(selectedDay),
          startTime,
          endTime,
          type: selectedType,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAvailability((prev) => {
        const filtered = prev.filter(
          (a) => new Date(a.date).toDateString() !== selectedDay.toDateString(),
        );
        return [...filtered, res.data];
      });
      toast.success('Saved!');
      setSelectedDay(null);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedDay) return;
    try {
      await api.delete('/availability', {
        headers: { Authorization: `Bearer ${token}` },
        data: { date: fmt(selectedDay) },
      });
      setAvailability((prev) =>
        prev.filter(
          (a) =>
            new Date(a.date).toDateString() !== selectedDay!.toDateString(),
        ),
      );
      toast.success('Removed!');
      setSelectedDay(null);
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleShiftSubmit = async () => {
    if (!shiftDate || !shiftStart || !shiftEnd)
      return toast.error(t('fillAllFields'));
    if (!selectedUserId) return toast.error(t('toastSelectUser'));
    try {
      setShiftLoading(true);
      await api.post(
        '/shifts',
        {
          date: shiftDate,
          startTime: shiftStart,
          endTime: shiftEnd,
          targetUserId: selectedUserId,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      addNotification(
        `Shift created for ${shiftDate} (${shiftStart}-${shiftEnd})`,
      );
      toast.success(t('shiftCreated'));
      setShiftDate('');
      setShiftStart('');
      setShiftEnd('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('errorGeneric'));
    } finally {
      setShiftLoading(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className='space-y-4'>
      {isAdmin && (
        <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-1.5'>
          <div className='bg-white dark:bg-slate-900 rounded-2xl px-4 py-4 space-y-3'>
            <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>
              Create Shift
            </p>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
            <input
              type='date'
              value={shiftDate}
              onChange={(e) => setShiftDate(e.target.value)}
              className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
            />
            <div className='flex gap-2'>
              <input
                type='time'
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
              />
              <input
                type='time'
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
              />
            </div>
            <button
              onClick={handleShiftSubmit}
              disabled={shiftLoading}
              className='w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors'
            >
              {shiftLoading ? t('creating') : t('createShift')}
            </button>
          </div>
        </div>
      )}

      <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-3'>
        <div className='flex items-center justify-between mb-3'>
          <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>
            My Availability
          </p>
          <div className='flex items-center gap-1 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full'>
            <button
              onClick={() => {
                const d = new Date(currentDate);
                d.setDate(d.getDate() - 7);
                setCurrentDate(d);
              }}
              className='text-slate-600 dark:text-slate-300 p-0.5'
            >
              <ChevronLeft size={14} />
            </button>
            <span className='text-xs font-medium text-slate-700 dark:text-slate-200 px-1'>
              {weekLabel}
            </span>
            <button
              onClick={() => {
                const d = new Date(currentDate);
                d.setDate(d.getDate() + 7);
                setCurrentDate(d);
              }}
              className='text-slate-600 dark:text-slate-300 p-0.5'
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className='flex items-center gap-3 mb-3 px-1'>
          <span className='flex items-center gap-1 text-xs text-slate-400'>
            <span className='w-3 h-3 rounded-full bg-green-500 inline-block' />{' '}
            Available
          </span>
          <span className='flex items-center gap-1 text-xs text-slate-400'>
            <span className='w-3 h-3 rounded-full bg-red-400 inline-block' />{' '}
            Unavailable
          </span>
        </div>

        <div className='grid grid-cols-7 gap-1.5'>
          {weekDays.map((day, i) => {
            const avail = getAvailabilityForDay(day);
            const isToday = day.toDateString() === today.toDateString();
            const isPast = day < today;

            const bgColor = avail
              ? avail.type === 'available'
                ? 'bg-green-500 border-green-500'
                : 'bg-red-400 border-red-400'
              : isToday
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700';

            const textColor = avail
              ? 'text-white'
              : isToday
                ? 'text-green-600 dark:text-green-400'
                : isPast
                  ? 'text-slate-400 dark:text-slate-500'
                  : 'text-slate-700 dark:text-slate-200';

            return (
              <button
                key={i}
                onClick={() => !isPast && handleDayClick(day)}
                disabled={isPast}
                className={`rounded-xl h-16 p-1.5 flex flex-col items-center justify-between border transition-all active:scale-95 ${bgColor} ${isPast ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`text-xs font-medium ${textColor}`}>
                  {day.toLocaleDateString(locale, { weekday: 'short' })}
                </span>
                <span className={`text-base font-bold ${textColor}`}>
                  {day.getDate()}
                </span>
                {avail && (
                  <span className='text-white/80 text-[9px] leading-none'>
                    {avail.startTime}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div
          className='fixed inset-0 bg-black/40 z-50 flex items-end justify-center'
          onClick={() => setSelectedDay(null)}
        >
          <div
            className='bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl p-6 pb-10'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center justify-between mb-4'>
              <div>
                <p className='text-xs text-slate-400 uppercase tracking-wide'>
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
                onClick={() => setSelectedDay(null)}
                className='bg-slate-100 dark:bg-slate-800 p-2 rounded-full'
              >
                <X size={18} className='text-slate-500' />
              </button>
            </div>

            <div className='bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 flex mb-4'>
              <button
                onClick={() => setSelectedType('available')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${selectedType === 'available' ? 'bg-green-500 text-white' : 'text-slate-500 dark:text-slate-400'}`}
              >
                ✅ Available
              </button>
              <button
                onClick={() => setSelectedType('unavailable')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${selectedType === 'unavailable' ? 'bg-red-400 text-white' : 'text-slate-500 dark:text-slate-400'}`}
              >
                ❌ Unavailable
              </button>
            </div>

            <div className='flex gap-2 mb-4'>
              <div className='flex-1'>
                <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
                  From
                </label>
                <input
                  type='time'
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
                />
              </div>
              <div className='flex-1'>
                <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
                  To
                </label>
                <input
                  type='time'
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
                />
              </div>
            </div>

            <div className='flex gap-2'>
              {getAvailabilityForDay(selectedDay) && (
                <button
                  onClick={handleRemove}
                  className='flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm font-medium'
                >
                  Remove
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className='flex-1 py-3 rounded-2xl bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors'
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AbsenceForm = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [myAbsences, setMyAbsences] = useState<any[]>([]);

  useEffect(() => {
    fetchMyAbsences();
  }, []);

  const fetchMyAbsences = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/absences/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyAbsences(res.data);
    } catch {
      console.error('Failed to load absences');
    }
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason)
      return toast.error(t('fillAllFields'));
    if (new Date(endDate) < new Date(startDate))
      return toast.error('End date must be after start date');
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.post(
        '/absences',
        { startDate, endDate, reason },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMyAbsences((prev) => [res.data, ...prev]);
      addNotification(`Absence requested: ${startDate} - ${endDate}`);
      toast.success(t('absenceRequested'));
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const statusColor = (status: string) => {
    if (status === 'approved')
      return 'text-green-500 bg-green-500/10 border-green-500/30';
    if (status === 'rejected')
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
  };

  return (
    <div className='space-y-4'>
      <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-1.5'>
        <div className='bg-white dark:bg-slate-900 rounded-2xl px-4 py-5 space-y-4'>
          <div className='grid grid-cols-2 gap-2'>
            <div>
              <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
                From
              </label>
              <input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
              />
            </div>
            <div>
              <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
                To
              </label>
              <input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
              />
            </div>
          </div>
          <div>
            <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
              {t('reason')}
            </label>
            <input
              type='text'
              placeholder='e.g. Urlaub, Krankheit...'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className='w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors'
          >
            {loading ? 'Submitting...' : t('submitRequest')}
          </button>
        </div>
      </div>

      {myAbsences.length > 0 && (
        <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-1.5'>
          <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-3 pt-2 pb-1'>
            My Requests
          </p>
          <div className='space-y-1'>
            {myAbsences.map((a) => (
              <div
                key={a._id}
                className='bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 flex items-center justify-between'
              >
                <div>
                  <p className='text-sm font-medium text-slate-800 dark:text-white'>
                    {formatDate(a.startDate)}
                    {a.startDate !== a.endDate && ` - ${formatDate(a.endDate)}`}
                  </p>
                  <p className='text-xs text-slate-400 mt-0.5'>{a.reason}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor(a.status)}`}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
