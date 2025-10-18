import React, { useEffect, useState, useRef } from 'react';
import { FaSearch, FaUserCircle, FaBell, FaChartLine } from 'react-icons/fa';
import { IoLogOut, IoPerson } from 'react-icons/io5';
import { MdDashboard } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { removeUser } from '../../redux/userSlice';
import { logout, getNotifications } from '../../services/api';
import { RootState } from '../../redux/store';
import { UserRole } from '../../types';

type Notification = {
  _id: string;
  message: string;
  type: 'alert' | 'info';
  createdAt: string;
};

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.user);

  const [dateTime, setDateTime] = useState(new Date());
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 60000, // 1 minute
  });

  useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications.length);
    }
  }, [notifications]);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    
    const handleClickOutside = (event: MouseEvent) => {
        if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
            setProfileOpen(false);
        }
        if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
            setNotificationsOpen(false);
        }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        clearInterval(timer);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: '2-digit' }).format(date);
  const formatTime = (date: Date) => new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(date);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      enqueueSnackbar('Logged out successfully', { variant: 'success' });
      dispatch(removeUser());
      navigate('/auth');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Logout failed', { variant: 'error' });
      dispatch(removeUser());
      navigate('/auth');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const handleNotificationsToggle = () => {
    setNotificationsOpen(prev => !prev);
    if (!isNotificationsOpen) {
        setUnreadCount(0);
    }
  };

  const userRole = userData.role as UserRole;
  const canSeeDashboard = [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER].includes(userRole);
  const canSeeSales = [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER].includes(userRole);

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-[#0c021c] flex-shrink-0">
      <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer">
        <img src="https://picsum.photos/48" className="h-12 w-12 rounded-full border-2 border-yellow-400" alt="Logo" />
        <h1 className="text-lg font-semibold text-[#f5f5f5] tracking-wide">Eldora POS</h1>
      </div>

      <div className="hidden md:flex items-center gap-4 bg-[#1f1f1f] rounded-lg px-5 py-2 w-[400px]">
        <FaSearch className="text-[#ababab]" />
        <input type="text" placeholder="Search..." className="bg-transparent outline-none text-[#f5f5f5] w-full" />
      </div>

      <div className="hidden lg:flex flex-col items-center text-[#f5f5f5]">
        <span className="text-sm font-medium">{formatDate(dateTime)}</span>
        <span className="text-xs text-[#ababab]">{formatTime(dateTime)}</span>
      </div>

      <div className="flex items-center gap-4">
        {canSeeDashboard && (
          <div onClick={() => navigate('/')} className="bg-[#1f1f1f] rounded-full p-3 cursor-pointer hover:bg-yellow-400 group">
            <MdDashboard className="text-[#f5f5f5] text-2xl group-hover:text-black" />
          </div>
        )}
        {canSeeSales && (
            <div onClick={() => navigate('/sales')} title="Sales" className="bg-[#1f1f1f] rounded-full p-3 cursor-pointer hover:bg-yellow-400 group">
                <FaChartLine className="text-[#f5f5f5] text-2xl group-hover:text-black" />
            </div>
        )}
        <div className="relative" ref={notificationsRef}>
          <button onClick={handleNotificationsToggle} className="bg-[#1f1f1f] rounded-full p-3 cursor-pointer hover:bg-yellow-400 group relative">
            <FaBell className="text-[#f5f5f5] text-2xl group-hover:text-black" />
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 rounded-full border-2 border-[#212121] flex items-center justify-center text-xs font-bold text-white">
                    {unreadCount}
                </span>
            )}
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#2b2b2b] rounded-lg shadow-xl z-20">
              <div className="p-3 border-b border-gray-600">
                <h3 className="font-semibold text-white">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? notifications.map(n => (
                  <div key={n._id} className="p-3 border-b border-gray-700 hover:bg-gray-700">
                    <p className="text-sm text-gray-300">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                )) : <p className="p-4 text-sm text-gray-400">No new notifications.</p>}
              </div>
            </div>
          )}
        </div>
        
        <div className="relative" ref={profileRef}>
            <div onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center gap-3 cursor-pointer">
              <FaUserCircle className="text-[#f5f5f5] text-4xl" />
              <div className="hidden md:flex flex-col items-start">
                <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">{userData.name || 'User'}</h1>
                <p className="text-xs text-[#ababab] font-medium capitalize">{userData.role || 'Role'}</p>
              </div>
            </div>
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-[#2b2b2b] rounded-lg shadow-xl z-20 py-2">
                <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left">
                  <IoPerson/> My Profile
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 w-full text-left">
                  <IoLogOut /> Logout
                </button>
              </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
