const Notifications = () => {
  const notifications = JSON.parse(
    localStorage.getItem('notifications') || '[]',
  );

  return (
    <div className='pb-24'>
      <h1 className='text-2xl font-semibold mb-5'>Notifications</h1>

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
                className='bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 shadow-sm'
              >
                <p className='text-sm font-medium text-slate-800 dark:text-white'>
                  {n.text}
                </p>
                <p className='text-xs text-slate-400 mt-1'>
                  {new Date(n.date).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
