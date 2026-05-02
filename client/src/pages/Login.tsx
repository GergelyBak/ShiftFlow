import { useState } from 'react';
import { api } from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setError('');

      const res = await api.post('/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      toast.success('Logged in successfully');

      navigate('/dashboard');
    } catch (err: any) {
      console.log(err.response?.data);
      setError(err.response?.data?.message || 'Login failed');
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-green-900 via-black to-black flex items-center justify-center px-4'>
      {/* CARD */}
      <div className='w-full max-w-sm bg-black/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl text-white'>
        <h1 className='text-2xl font-semibold mb-6 text-center'>
          Welcome back
        </h1>

        {error && (
          <p className='text-red-400 text-sm mb-4 text-center'>{error}</p>
        )}

        {/* EMAIL */}
        <input
          className='w-full mb-3 p-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          className='w-full mb-4 p-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500'
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          className='w-full bg-green-500 hover:bg-green-600 transition p-3 rounded-xl font-medium'
        >
          Login
        </button>

        {/* LINK */}
        <p className='mt-5 text-sm text-center text-gray-400'>
          No account?{' '}
          <span
            className='text-green-400 cursor-pointer'
            onClick={() => navigate('/register')}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
