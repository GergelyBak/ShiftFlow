import { useState } from 'react';
import { api } from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) return toast.error('Please enter your email');

    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      setSent(true);
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
            Reset your password
          </p>
        </div>

        <div className='bg-slate-200/60 dark:bg-slate-800 rounded-3xl p-1.5'>
          <div className='bg-white dark:bg-slate-900 rounded-2xl px-5 py-6 space-y-3'>
            {sent ? (
              <div className='text-center py-4 space-y-2'>
                <p className='text-2xl'>📧</p>
                <p className='text-sm font-semibold text-slate-800 dark:text-white'>
                  Check your email
                </p>
                <p className='text-xs text-slate-400'>
                  We sent a reset link to <strong>{email}</strong>. It expires in 1 hour.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block'>
                    Email
                  </label>
                  <input
                    type='email'
                    placeholder='your@email.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className='w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500'
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className='w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors mt-2'
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </>
            )}
          </div>
        </div>

        <p className='text-center text-sm text-slate-500 dark:text-slate-400 mt-4'>
          <span
            onClick={() => navigate('/')}
            className='text-green-500 font-medium cursor-pointer'
          >
            Back to login
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
