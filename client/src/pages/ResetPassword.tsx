import { useState } from 'react';
import { api } from '../api/axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirm) return toast.error('Please fill in all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    if (!token) return toast.error('Invalid reset link');

    try {
      setLoading(true);
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      toast.success('Password updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center px-4 transition-colors duration-300'>
      <div className='w-full max-w-sm'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
            ShiftFlow
          </h1>
          <p className='text-slate-500 dark:text-slate-400 text-sm mt-1'>
            Set a new password
          </p>
        </div>

        <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-1.5'>
          <div className='bg-white dark:bg-slate-900 rounded-2xl px-5 py-6 space-y-3'>
            {done ? (
              <div className='text-center py-4 space-y-2'>
                <p className='text-2xl'>✅</p>
                <p className='text-sm font-semibold text-slate-800 dark:text-white'>
                  Password updated!
                </p>
                <p className='text-xs text-slate-400'>
                  You can now log in with your new password.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className='w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl text-sm transition-colors mt-2'
                >
                  Go to login
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
                    New password
                  </label>
                  <input
                    type='password'
                    placeholder='Min. 6 characters'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
                  />
                </div>

                <div>
                  <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
                    Confirm password
                  </label>
                  <input
                    type='password'
                    placeholder='Repeat your password'
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className='w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors mt-2'
                >
                  {loading ? 'Saving...' : 'Set new password'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
