import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import * as yup from 'yup';

type FormData = {
  email: string;
  password: string;
};

const schema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});



const Login: React.FC = () => {
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange', 
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setLoginError('');
  
    try {
      const res = await login(data);
      navigate('/');
    } catch (error: any) {
        setLoginError(error.response?.data?.msg || 'Login failed');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-100">
      <img
        src="LogoHeader.png"
        alt="Company Logo"
        className="absolute top-6 left-6 w-60 h-auto"
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

        <div className="mb-4">
          <label className="block text-gray-600 font-medium mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
            }`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 font-medium mb-1">Password</label>
          <input
            {...register('password')}
            type="password"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.password ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
            }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {loginError && (
          <p className="text-red-500 text-sm mt-1 mb-5">{loginError}</p>
        )}

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className={`w-full text-white py-2 rounded-md transition ${
            isValid && !isLoading
              ? 'bg-hearteye_blue hover:bg-hearteye_blue_hover'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
