import { useState } from 'react';
import { api } from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      setError('');

      await api.post('/auth/register', form);

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-green-900 via-black to-black flex items-center justify-center px-4'>
      <div className='w-full max-w-sm bg-black/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl text-white'>
        <h1 className='text-2xl mb-6 text-center'>Create account</h1>

        {error && <p className='text-red-400 text-sm mb-3'>{error}</p>}

        <input
          name='firstName'
          placeholder='First name'
          onChange={handleChange}
          className='w-full mb-3 p-3 rounded-xl bg-white/10'
        />

        <input
          name='lastName'
          placeholder='Last name'
          onChange={handleChange}
          className='w-full mb-3 p-3 rounded-xl bg-white/10'
        />

        <input
          name='email'
          placeholder='Email'
          onChange={handleChange}
          className='w-full mb-3 p-3 rounded-xl bg-white/10'
        />

        <input
          name='password'
          type='password'
          placeholder='Password'
          onChange={handleChange}
          className='w-full mb-4 p-3 rounded-xl bg-white/10'
        />

        <button
          onClick={handleRegister}
          className='w-full bg-green-500 p-3 rounded-xl'
        >
          Register
        </button>

        <p className='mt-4 text-sm text-center'>
          Already have an account?{' '}
          <span
            className='text-green-400 cursor-pointer'
            onClick={() => navigate('/')}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
