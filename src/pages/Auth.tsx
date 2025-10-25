import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../redux/userSlice';
import { login } from '../services/api';
import { User, UserRole } from '../types';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response: any) => {
      if (!response.success) {
        throw new Error(response.message);
      }
      const { data, token } = response;
      const userData: User = { 
        ...data,
        role: data.role.toLowerCase() as UserRole,
        token
      };
      
      dispatch(setUser(userData));
      enqueueSnackbar("Login successful!", { variant: "success" });
      navigate('/');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Login failed', { variant: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-900 to-black">
      <div className="w-full max-w-md p-8">
        <div className="flex flex-col items-center gap-2 mb-8">
          <img src="https://picsum.photos/56" alt="Logo" className="h-14 w-14 border-2 border-yellow-400 rounded-full" />
          <h1 className="text-xl font-semibold text-[#f5f5f5] tracking-wide">Eldora Royal Event & Pub</h1>
        </div>
        <h2 className="text-4xl text-center font-semibold text-yellow-400 mb-8">Employee Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">Employee Email</label>
            <div className="flex items-center rounded-lg p-4 bg-[#1f1f1f]">
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" className="bg-transparent w-full text-white focus:outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">Password</label>
            <div className="relative flex items-center rounded-lg p-4 bg-[#1f1f1f]">
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Enter password" className="bg-transparent w-full text-white focus:outline-none pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-400 hover:text-white">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loginMutation.isPending} className="w-full rounded-lg mt-4 py-3 text-lg bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-300 transition disabled:bg-gray-500">
            {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
