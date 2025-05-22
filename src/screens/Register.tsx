import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import authService from '../services/authService';

type FormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const schema = yup.object().shape({
  username: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(4, 'Password must be at least 4 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
});

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    setRegisterError('');
    setLoading(true);
    try {
      await authService.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      navigate('/login');
    } catch (err: any) {
      setRegisterError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-100 relative">
      {/* Logo */}
      <img
        src="/LogoHeader.png"
        alt="Company Logo"
        className="absolute top-6 left-6 w-60 h-auto"
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>

        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-600 font-medium mb-1">Username</label>
          <input
            id="username"
            {...register('username')}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.username ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
            }`}
            placeholder="johndoe"
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-600 font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
            }`}
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-600 font-medium mb-1">Password</label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.password ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
            }`}
            placeholder="Enter password"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-gray-600 font-medium mb-1">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.confirmPassword ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
            }`}
            placeholder="Enter password again"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {registerError && (
          <p className="text-red-500 text-sm mt-1 mb-4">{registerError}</p>
        )}

        <button
          type="submit"
          disabled={!isValid || loading}
          className={`w-full text-white py-2 rounded-md transition ${
            isValid && !loading
              ? 'bg-hearteye_blue hover:bg-hearteye_blue_hover'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <div className="text-sm text-center mt-4">
          <Link to="/login" className="font-medium text-orange hover:text-hearteye_orange">
            Already have an account? Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;