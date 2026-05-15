import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { addNotification } from '../utils/notifications';
import { api } from '../api/axios';
import { useTranslation } from 'react-i18next';

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
          onClick={() => setType('absence')}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
            type === 'absence'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {t('absence')}
        </button>
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
      </div>

      {type === 'desired' ? <DesiredForm isAdmin={isAdmin} /> : <AbsenceForm />}
    </div>
  );
};

export default Create;

// ==========================
// 🧱 DESIRED TIME FORM
// ==========================
const DesiredForm = ({ isAdmin }: { isAdmin: boolean }) => {
  const { t } = useTranslation();
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
        if (res.data.length > 0) {
          setSelectedUserId(res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  const handleSubmit = async () => {
    if (!date || !start || !end) {
      return toast.error(t('fillAllFields'));
    }

    if (isAdmin && !selectedUserId) {
      return toast.error(t('toastSelectUser'));
    }

    try {
      setLoading(true);

      const token = localStorage.getItem('token');

      await api.post(
        '/shifts',
        {
          date,
          startTime: start,
          endTime: end,
          ...(isAdmin && { targetUserId: selectedUserId }),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      addNotification(`Shift created for ${date} (${start}-${end})`);
      toast.success(t('shiftCreated'));

      setDate('');
      setStart('');
      setEnd('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-1.5'>
      <div className='bg-white dark:bg-slate-900 rounded-2xl px-4 py-5 space-y-4'>
        {/* USER SELECTOR — csak adminnak */}
        {isAdmin && (
          <div>
            <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
              {t('employee')}
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.firstName} {u.lastName} ({u.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* DATE */}
        <div>
          <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
            {t('date')}
          </label>
          <input
            type='date'
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className='w-full min-w-0 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
          />
        </div>

        {/* TIME */}
        <div>
          <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
            {t('time')}
          </label>
          <div className='flex gap-2'>
            <input
              type='time'
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className='w-full min-w-0 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
            />
            <input
              type='time'
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className='w-full min-w-0 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
            />
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className='w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors'
        >
          {loading ? t('creating') : t('createShift')}
        </button>
      </div>
    </div>
  );
};

// ==========================
// 🧱 ABSENCE FORM
// ==========================
const AbsenceForm = () => {
  const { t } = useTranslation();
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!date || !reason) {
      return toast.error(t('fillAllFields'));
    }
    addNotification(`Absence requested for ${date}`);
    toast.success(t('absenceRequested'));
    setDate('');
    setReason('');
  };

  return (
    <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-1.5'>
      <div className='bg-white dark:bg-slate-900 rounded-2xl px-4 py-5 space-y-4'>
        <div>
          <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
            {t('date')}
          </label>
          <input
            type='date'
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className='w-full min-w-0 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
          />
        </div>

        <div>
          <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
            {t('reason')}
          </label>
          <input
            placeholder={t('reason')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
          />
        </div>

        <button
          onClick={handleSubmit}
          className='w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl text-sm transition-colors'
        >
          {t('submitRequest')}
        </button>
      </div>
    </div>
  );
};
