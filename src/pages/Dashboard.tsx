import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaStore, FaUsers, FaChartLine, FaCashRegister, FaChair, FaCalendarAlt, FaClipboardList, FaMoneyBillWave } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { RootState } from '../redux/store';
import { UserRole } from '../types';
import { fetchSuperAdminDashboardData } from '../services/api';
import FullScreenLoader from '../components/shared/FullScreenLoader';
import AdminDashboard from './admin/AdminDashboard';

// --- TYPE DEFINITIONS ---
interface DashboardLink {
  to: string;
  label: string;
  icon: React.ReactElement;
}

interface SuperAdminDashboardData {
    totalBusinesses: number;
    totalSystemRevenue: number;
    totalCommissionEarnings: number;
}

// --- DASHBOARD CONFIG ---
const dashboardConfig: Record<string, { title: string; description: string; links: DashboardLink[] }> = {
  [UserRole.SUPERADMIN]: {
    title: 'Super Admin Dashboard',
    description: 'Manage all businesses, users, and system settings.',
    links: [
      { to: '/superadmin/businesses', label: 'Business Management', icon: <FaStore /> },
      { to: '/superadmin/users', label: 'User Management', icon: <FaUsers /> },
    ],
  },
  [UserRole.CASHIER]: {
    title: 'Cashier Dashboard',
    description: 'Manage billing and transactions.',
    links: [
      { to: '/sales', label: 'Record Sales', icon: <FaCashRegister /> },
      { to: '/orders', label: 'Manage Orders', icon: <FaClipboardList /> },
      { to: '/events', label: 'Event Sales', icon: <FaCalendarAlt /> },
    ],
  },
  [UserRole.WAITRESS]: {
    title: 'Waitress Dashboard',
    description: 'Handle customer orders efficiently.',
    links: [
      { to: '/orders', label: 'Create Order', icon: <FaClipboardList /> },
      { to: '/tables', label: 'View Tables', icon: <FaChair /> },
    ],
  },
};


// --- UI COMPONENTS ---
const Tile: React.FC<DashboardLink> = ({ to, label, icon }) => (
     <Link to={to} className="group bg-[#2b2b2b] rounded-2xl p-5 text-center hover:bg-yellow-400 hover:text-black transition-all flex flex-col items-center justify-center gap-4">
        <div className="text-4xl text-gray-300 group-hover:text-black transition-colors">{icon}</div>
        <span className="font-semibold text-lg">{label}</span>
     </Link>
);

const KPICard: React.FC<{ title: string; value: string | number; icon: React.ReactElement }> = ({ title, value, icon }) => (
    <div className="bg-[#2b2b2b] p-5 rounded-xl flex items-center gap-4">
        <div className="text-3xl text-yellow-400 p-3 bg-gray-800 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard: React.FC = () => {
  const { role, name } = useSelector((state: RootState) => state.user);
  const config = dashboardConfig[role] || { title: 'Dashboard', description: 'Welcome!', links: [] };

  // Data fetching for Super Admin
  const { data: superAdminData, isLoading: isSuperAdminLoading } = useQuery<SuperAdminDashboardData>({
    queryKey: ['superAdminDashboardData'],
    queryFn: fetchSuperAdminDashboardData,
    enabled: role === UserRole.SUPERADMIN,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Super Admin View
  if (role === UserRole.SUPERADMIN) {
    if (isSuperAdminLoading) return <FullScreenLoader />;
    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold">Welcome, {name}!</h1>
            <p className="text-gray-400 mb-6">{config.description}</p>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                 <KPICard title="Total Businesses" value={superAdminData?.totalBusinesses || 0} icon={<FaStore/>}/>
                 <KPICard title="Total System Revenue" value={`GHS ${(superAdminData?.totalSystemRevenue || 0).toFixed(2)}`} icon={<FaChartLine/>}/>
                 <KPICard title="My Commission Earnings" value={`GHS ${(superAdminData?.totalCommissionEarnings || 0).toFixed(2)}`} icon={<FaMoneyBillWave/>}/>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {config.links.map(link => <Tile key={link.to} {...link} />)}
             </div>
        </div>
    );
  }

  // Admin/Manager View
  if (role === UserRole.ADMIN || role === UserRole.MANAGER) {
    return <AdminDashboard />;
  }

  // View for other roles (Cashier, Waitress)
  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-2">Welcome, {name}!</h1>
      <p className="mb-8 text-gray-400">{config.description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {config.links.map(link => (
          <Tile key={link.to} {...link} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
