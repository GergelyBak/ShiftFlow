import { useState } from 'react';
import { Trash2 } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>(
    JSON.parse(localStorage.getItem('notifications') || '[]'),
  );

  const deleteOne = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const deleteAll = () => {
    setNotifications([]);
    localStorage.setItem('notifications', JSON.stringify([]));
  };

  return (
    <div className='pb-24'>
      <div className='flex items-center justify-between mb-5'>
        <h1 className='text-2xl font-semibold'>Notifications</h1>
        {notifications.length > 0 && (
          <button
            onClick={deleteAll}
            className='text-xs text-red-400 hover:text-red-500 font-medium transition-colors'
          >
            Clear all
          </button>
        )}
      </div>

      <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-3'>
        <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 px-1'>
          Recent
        </p>

        {notifications.length === 0 ? (
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-6 text-center text-slate-400 text-sm'>
            No notifications yet
          </div>
        ) : (
          <div className='space-y-2'>
            {notifications.map((n: any) => (
              <div
                key={n.id}
                className='bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 flex items-center justify-between gap-3'
              >
                <div className='min-w-0'>
                  <p className='text-sm font-medium text-slate-800 dark:text-white'>
                    {n.text}
                  </p>
                  <p className='text-xs text-slate-400 mt-1'>
                    {new Date(n.date).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteOne(n.id)}
                  className='text-slate-300 hover:text-red-400 transition-colors shrink-0'
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;