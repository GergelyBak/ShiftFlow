import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('month');

  useEffect(() => {
    const fetchShifts = async () => {
      const token = localStorage.getItem('token');

      const res = await api.get('/shifts/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShifts(res.data);
    };

    fetchShifts();
  }, []);

  // 📅 NAV
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

  return (
    <div className='text-white'>
      {/* HEADER */}
      <div className='flex items-center justify-between mb-6'>
        {/* VIEW SWITCH */}
        <div className='bg-black/50 rounded-full p-1 flex'>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-1 rounded-full text-sm ${
              view === 'week' ? 'bg-green-500 text-black' : 'text-gray-400'
            }`}
          >
            Week
          </button>

          <button
            onClick={() => setView('month')}
            className={`px-4 py-1 rounded-full text-sm ${
              view === 'month' ? 'bg-green-500 text-black' : 'text-gray-400'
            }`}
          >
            Month
          </button>
        </div>

        {/* DATE NAV */}
        <div className='flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full'>
          <button onClick={prev}>
            <ChevronLeft size={18} />
          </button>

          <span className='text-sm font-medium'>
            {view === 'month'
              ? currentDate.toLocaleString('en-GB', {
                  month: 'long',
                })
              : 'This Week'}
          </span>

          <button onClick={next}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* VIEW */}
      {view === 'month' ? (
        <MonthView shifts={shifts} currentDate={currentDate} />
      ) : (
        <WeekView shifts={shifts} currentDate={currentDate} />
      )}
    </div>
  );
};

export default Calendar;

// =======================
// 📅 MONTH VIEW
// =======================
const MonthView = ({ shifts, currentDate }: any) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];

  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const hasShift = (day: number) => {
    return shifts.some((shift: any) => {
      const d = new Date(shift.date);
      return (
        d.getDate() === day &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });
  };

  return (
    <div>
      {/* WEEK DAYS */}
      <div className='grid grid-cols-7 mb-2 text-gray-400 text-sm'>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className='text-center'>
            {d}
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className='grid grid-cols-7 gap-2'>
        {days.map((day, index) => (
          <div
            key={index}
            className='bg-black/50 backdrop-blur-xl rounded-xl h-20 p-2 flex flex-col justify-between'
          >
            {day && (
              <>
                <span className='text-sm'>{day}</span>

                {hasShift(day) && (
                  <div className='bg-green-500 text-black text-[10px] px-2 py-[2px] rounded-full text-center'>
                    shift
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// =======================
// 📅 WEEK VIEW (alap)
// =======================
const WeekView = ({}: any) => {
  return (
    <div className='text-center text-gray-400 mt-10'>
      Weekly view coming soon...
    </div>
  );
};
