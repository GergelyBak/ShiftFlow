import { useState } from 'react';
import { createShift } from '../api/shifts';
import { toast } from 'react-toastify';
import { addNotification } from '../utils/notifications';

const Create = () => {
  const [type, setType] = useState<'absence' | 'desired'>('desired');

  return (
    <div className='text-white'>
      {/* HEADER */}
      <h1 className='text-2xl mb-6'>Create</h1>

      {/* SWITCH */}
      <div className='bg-black/50 rounded-full p-1 flex mb-6'>
        <button
          onClick={() => setType('absence')}
          className={`flex-1 py-2 rounded-full ${
            type === 'absence' ? 'bg-green-500 text-black' : 'text-gray-400'
          }`}
        >
          Absence
        </button>

        <button
          onClick={() => setType('desired')}
          className={`flex-1 py-2 rounded-full ${
            type === 'desired' ? 'bg-green-500 text-black' : 'text-gray-400'
          }`}
        >
          Desired Time
        </button>
      </div>

      {/* CONTENT */}
      {type === 'desired' ? <DesiredForm /> : <AbsenceForm />}
    </div>
  );
};

export default Create;

// ==========================
// 🧱 DESIRED TIME FORM
// ==========================
const DesiredForm = () => {
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!date || !start || !end) {
      return toast.error('Please fill all fields');
    }

    try {
      setLoading(true);

      await createShift({
        date,
        startTime: start,
        endTime: end,
      });

      // ✅ NOTIFICATION
      addNotification(`Shift created for ${date} (${start}-${end})`);

      toast.success('Shift created');

      // reset
      setDate('');
      setStart('');
      setEnd('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error creating shift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-4'>
      <input
        type='date'
        className='w-full p-3 rounded-xl bg-black/50'
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <div className='flex gap-2'>
        <input
          type='time'
          className='w-full p-3 rounded-xl bg-black/50'
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />

        <input
          type='time'
          className='w-full p-3 rounded-xl bg-black/50'
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className='w-full bg-green-500 text-black p-3 rounded-xl'
      >
        {loading ? 'Creating...' : 'Create Shift'}
      </button>
    </div>
  );
};

// ==========================
// 🧱 ABSENCE FORM
// ==========================
const AbsenceForm = () => {
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!date || !reason) {
      return toast.error('Fill all fields');
    }

    // ✅ NOTIFICATION
    addNotification(`Absence requested for ${date}`);

    toast.success('Absence request sent');

    setDate('');
    setReason('');
  };

  return (
    <div className='space-y-4'>
      <input
        type='date'
        className='w-full p-3 rounded-xl bg-black/50'
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <input
        placeholder='Reason'
        className='w-full p-3 rounded-xl bg-black/50'
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className='w-full bg-green-500 text-black p-3 rounded-xl'
      >
        Send Request
      </button>
    </div>
  );
};
