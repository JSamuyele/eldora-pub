import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../redux/store';
import { updateUserProfile, changePassword } from '../services/api';
import { setUser } from '../redux/userSlice';
import { FaSave, FaLock, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';

type ProfileFormInputs = {
  name: string;
  phone: string;
};

type PasswordFormInputs = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector((state: RootState) => state.user);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register: registerProfile, handleSubmit: handleProfileSubmit } = useForm<ProfileFormInputs>({
    defaultValues: {
      name: user.name,
      phone: user.phone,
    },
  });
  
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, watch, reset: resetPasswordForm, formState: { errors } } = useForm<PasswordFormInputs>();

  const profileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data: any) => {
      dispatch(setUser({ ...user, ...data }));
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to update profile', { variant: 'error' });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      resetPasswordForm();
      enqueueSnackbar('Password changed successfully!', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to change password', { variant: 'error' });
    },
  });

  const onProfileSubmit: SubmitHandler<ProfileFormInputs> = (data) => {
    profileMutation.mutate(data);
  };
  
  const onPasswordSubmit: SubmitHandler<PasswordFormInputs> = (data) => {
    passwordMutation.mutate(data);
  };

  const inputClass = "w-full p-3 bg-[#1f1f1f] rounded-lg text-white outline-none focus:ring-2 focus:ring-yellow-400 border border-transparent focus:border-yellow-400 disabled:bg-gray-800";
  const buttonPrimary = "w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:bg-gray-600";
  const newPassword = watch('newPassword');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-sm bg-[#2b2b2b] hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
          <FaArrowLeft /> Back
        </button>
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-[#ababab]">Manage your personal information and password.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="bg-[#2b2b2b] p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">Profile Information</h2>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
              <input {...registerProfile('name', { required: true })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input type="email" value={user.email} className={inputClass} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
              <input {...registerProfile('phone', { required: true })} className={inputClass} />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
              <input value={user.role} className={`${inputClass} capitalize`} disabled />
            </div>
            <button type="submit" className={buttonPrimary} disabled={profileMutation.isPending}>
              <FaSave /> {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-[#2b2b2b] p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">Change Password</h2>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Current Password</label>
              <div className="relative">
                <input type={showCurrentPassword ? 'text' : 'password'} {...registerPassword('currentPassword', { required: true })} className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
              <div className="relative">
                <input type={showNewPassword ? 'text' : 'password'} {...registerPassword('newPassword', { required: true, minLength: 6 })} className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  {...registerPassword('confirmPassword', { 
                    required: true, 
                    validate: value => value === newPassword || "Passwords do not match"
                  })} 
                  className={`${inputClass} pr-12`} 
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
               {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" className={buttonPrimary} disabled={passwordMutation.isPending}>
              <FaLock /> {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
