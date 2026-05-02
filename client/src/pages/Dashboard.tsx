import { useEffect, useState } from 'react';
import { api } from '../api/axios';

const Dashboard = () => {
  const [shifts, setShifts] = useState<any[]>([]);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/shifts/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShifts(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchShifts();
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const name = user?.firstName ?? 'User';
  const nextShift = shifts[0];

  return (
    <div className='min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white p-4 pb-24 transition-colors duration-300'>
      {/* HEADER */}
      <h1 className='text-2xl font-semibold mb-6'>Hey {name}!</h1>

      {/* NEXT SHIFT — külső container */}
      {nextShift && (
        <div className='bg-slate-200/70 dark:bg-slate-800 rounded-3xl p-3 mb-4'>
          <p className='text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 px-1'>
            Next Shift
          </p>
          {/* belső fehér kártya */}
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm'>
            <p className='text-sm text-slate-500 dark:text-slate-400'>
              {new Date(nextShift.date).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
              })}
            </p>
            <p className='text-3xl font-bold mt-1'>
              {nextShift.startTime} - {nextShift.endTime}
            </p>
            <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>
              Clock
            </p>
          </div>
        </div>
      )}

      {/* ALL SHIFTS — külső container */}
      <div className='bg-slate-200/70 dark:bg-slate-800 rounded-3xl p-3 mb-4'>
        <p className='text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 px-1'>
          My Shifts
        </p>

        {shifts.length === 0 ? (
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-6 text-center text-slate-400 text-sm'>
            No shifts yet
          </div>
        ) : (
          <div className='space-y-2'>
            {shifts.map((shift) => (
              <div
                key={shift._id}
                className='bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm flex justify-between items-center'
              >
                <div>
                  <p className='text-sm text-slate-500 dark:text-slate-400'>
                    {new Date(shift.date).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </p>
                  <p className='text-lg font-semibold mt-0.5'>
                    {shift.startTime} - {shift.endTime}
                  </p>
                </div>
                <span className='text-slate-300 dark:text-slate-600 text-xl'>
                  ⊟
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
