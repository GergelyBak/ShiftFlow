import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const { t } = useTranslation();

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
    <div className="pb-24">

      {/* HEADER */}
      <h1 className="text-2xl font-semibold mb-6">{t('greeting', { name })}</h1>

      {/* NEXT SHIFT */}
      {nextShift && (
        <div className="bg-slate-200/70 dark:bg-slate-800 rounded-3xl p-3 mb-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 px-1">
            {t('nextShift')}
          </p>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {new Date(nextShift.date).toLocaleDateString(
                t('locale') === 'de' ? 'de-DE' : 'en-GB',
                { weekday: 'short', day: '2-digit', month: '2-digit' }
              )}
            </p>
            <p className="text-3xl font-bold mt-1 tracking-tight">
              {nextShift.startTime} – {nextShift.endTime}
            </p>
            <p className="text-xs text-slate-400 mt-1">{t('clock')}</p>
          </div>
        </div>
      )}

      {/* ALL SHIFTS */}
      <div className="bg-slate-200/70 dark:bg-slate-800 rounded-3xl p-3 mb-4">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 px-1">
          {t('myShifts')}
        </p>

        {shifts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center text-slate-400 text-sm">
            {t('noShifts')}
          </div>
        ) : (
          <div className="space-y-2">
            {shifts.map((shift) => (
              <div
                key={shift._id}
                className="bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="text-xs text-slate-400">
                    {new Date(shift.date).toLocaleDateString(
                      t('locale') === 'de' ? 'de-DE' : 'en-GB',
                      { weekday: 'short', day: '2-digit', month: '2-digit' }
                    )}
                  </p>
                  <p className="text-base font-semibold mt-0.5 tracking-tight">
                    {shift.startTime} – {shift.endTime}
                  </p>
                </div>
                <span className="text-slate-300 dark:text-slate-600 text-lg">⊟</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;