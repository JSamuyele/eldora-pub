import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../redux/userSlice';
import { login, register } from '../services/api';
import { User, UserRole } from '../types';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// Login Component
const LoginComponent: React.FC = () => {
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
  );
};

// Register Component
const RegisterComponent: React.FC<{ setIsRegister: (isRegister: boolean) => void }> = ({ setIsRegister }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [formData, setFormData] = useState({
        name: "", email: "", phone: "", password: "", role: "", tenantId: "665b12a02371234567890001", // Hardcoded ID for "Eldora Main Branch" from seeder
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelection = (selectedRole: string) => {
        setFormData({ ...formData, role: selectedRole.toLowerCase() });
    };

    const registerMutation = useMutation({
        mutationFn: register,
        onSuccess: () => {
            enqueueSnackbar("Registration successful! Please log in.", { variant: "success" });
            setTimeout(() => setIsRegister(false), 1500);
        },
        onError: (error: any) => {
            enqueueSnackbar(error?.response?.data?.message || "Registration failed", { variant: "error" });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        registerMutation.mutate(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Employee Name" required className="w-full p-4 bg-[#1f1f1f] rounded-lg text-white outline-none focus:ring-2 focus:ring-yellow-400"/>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Employee Email" required className="w-full p-4 bg-[#1f1f1f] rounded-lg text-white outline-none focus:ring-2 focus:ring-yellow-400"/>
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Employee Phone (e.g. 0244123456)" required className="w-full p-4 bg-[#1f1f1f] rounded-lg text-white outline-none focus:ring-2 focus:ring-yellow-400"/>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Password" required className="w-full p-4 bg-[#1f1f1f] rounded-lg text-white outline-none focus:ring-2 focus:ring-yellow-400 pr-12"/>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div>
                <label className="block text-[#ababab] mb-2 text-sm font-medium">Choose your role</label>
                <div className="flex items-center gap-3">
                    {["Waitress", "Cashier", "Manager"].map((role) => (
                        <button key={role} type="button" onClick={() => handleRoleSelection(role)}
                            className={`w-full py-3 rounded-lg text-white transition ${formData.role === role.toLowerCase() ? "bg-yellow-500 text-black" : "bg-[#1f1f1f] hover:bg-gray-700"}`}>
                            {role}
                        </button>
                    ))}
                </div>
            </div>
            <button type="submit" disabled={registerMutation.isPending} className="w-full rounded-lg py-3 text-lg bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-300 transition disabled:bg-gray-500">
                {registerMutation.isPending ? 'Signing Up...' : 'Sign Up'}
            </button>
        </form>
    );
};

// Main Auth Page
const Auth: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden md:block w-1/2 relative">
        <img className="w-full h-full object-cover" src="https://picsum.photos/1200/1200?grayscale&blur=2" alt="Restaurant" />
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <blockquote className="absolute bottom-10 left-10 right-10 text-2xl italic text-white">
          "The best way to find yourself is to lose yourself in the service of others."
          <span className="block mt-4 text-yellow-400">- Eldora Management</span>
        </blockquote>
      </div>
      <div className="w-full md:w-1/2 min-h-screen bg-[#212121] p-8 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto">
          <div className="flex flex-col items-center gap-2 mb-8">
            <img src="https://picsum.photos/56" alt="Logo" className="h-14 w-14 border-2 border-yellow-400 rounded-full" />
            <h1 className="text-xl font-semibold text-[#f5f5f5] tracking-wide">Eldora Royal Event & Pub</h1>
          </div>
          <h2 className="text-4xl text-center font-semibold text-yellow-400 mb-8">
            {isRegister ? "Employee Registration" : "Employee Login"}
          </h2>
          {isRegister ? <RegisterComponent setIsRegister={setIsRegister} /> : <LoginComponent />}
          <div className="text-center mt-6">
            <p className="text-sm text-[#ababab]">
              {isRegister ? "Already have an account? " : "Don't have an account? "}
              <button onClick={() => setIsRegister(!isRegister)} className="text-yellow-400 font-semibold hover:underline">
                {isRegister ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
