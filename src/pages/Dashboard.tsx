import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaStore, FaUsers, FaBoxOpen, FaChartLine, FaCashRegister, FaChair, FaCalendarAlt, FaClipboardList, FaExclamationTriangle, FaFire, FaMoneyBillWave, FaReceipt, FaUserFriends, FaUserPlus, FaRegCalendarCheck } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { RootState } from '../redux/store';
import { UserRole } from '../types';
import { fetchDashboardData, fetchSuperAdminDashboardData, getSalesTransactions } from '../services/api';
import FullScreenLoader from '../components/shared/FullScreenLoader';

// --- TYPE DEFINITIONS ---
interface DashboardLink {
  to: string;
  label: string;
  icon: React.ReactElement;
  className?: string;
}

interface KPI {
  totalRevenue: number;
  openTables: number;
  totalTransactions: number;
  newCustomers: number;
}
interface AdminDashboardData {
    kpis: KPI;
    lowStockItems: { _id: string; name: string; stock: number }[];
    topSellingItems: { _id: string; name: string; }[];
}

interface SuperAdminDashboardData {
    totalBusinesses: number;
    totalSystemRevenue: number;
    totalCommissionEarnings: number;
}

interface Transaction {
    _id: string;
    total: number;
    status: 'Open' | 'Paid' | 'Cancelled';
    createdAt: string;
}


// --- REUSABLE LINK DEFINITIONS ---
const adminManagerLinks = [
  { to: '/staff', label: 'Staff', icon: <FaUserPlus />, className: "bg-blue-600 hover:bg-blue-500" },
  { to: '/inventory', label: 'Inventory', icon: <FaBoxOpen />, className: "bg-green-600 hover:bg-green-500" },
  { to: '/sales', label: 'Sales', icon: <FaChartLine />, className: "bg-orange-600 hover:bg-orange-500" },
  { to: '/event-booking', label: 'Event Bookings', icon: <FaRegCalendarCheck />, className: "bg-indigo-600 hover:bg-indigo-500" },
  { to: '/tables', label: 'Tables', icon: <FaChair />, className: "bg-purple-600 hover:bg-purple-500" },
  { to: '/reports', label: 'Reports', icon: <FaClipboardList />, className: "bg-teal-600 hover:bg-teal-500" },
];

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
  [UserRole.ADMIN]: { 
    title: 'Admin Dashboard', 
    description: 'Overview of your business performance.', 
    links: adminManagerLinks 
  },
  [UserRole.MANAGER]: { 
    title: 'Manager Dashboard', 
    description: 'Oversee daily operations and staff.', 
    links: adminManagerLinks
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

const ActionButton: React.FC<DashboardLink> = ({ to, label, icon, className }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-full transition-transform transform hover:scale-105 ${className}`}
  >
    {icon}
    <span>{label}</span>
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

const DashboardList: React.FC<{ title: string; items: any[]; icon: React.ReactElement; linkTo: string; }> = ({ title, items, icon, linkTo }) => (
    <div className="bg-[#2b2b2b] p-5 rounded-xl">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">{icon} {title}</h3>
            <Link to={linkTo} className="text-sm text-yellow-400 hover:underline">View All</Link>
        </div>
        <ul className="space-y-3">
            {items.length > 0 ? items.map(item => (
                <li key={item._id} className="flex justify-between items-center bg-[#1f1f1f] p-3 rounded-lg">
                    <span className="font-medium text-gray-300">{item.name}</span>
                    {item.stock !== undefined && <span className="text-sm font-bold text-red-400">{item.stock} left</span>}
                </li>
            )) : <li key="no-items" className="text-gray-500 text-sm text-center">No items to show.</li>}
        </ul>
    </div>
);

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard: React.FC = () => {
  const { role, name } = useSelector((state: RootState) => state.user);
  const config = dashboardConfig[role] || { title: 'Dashboard', description: 'Welcome!', links: [] };
  const [period, setPeriod] = useState('today');

  // Data fetching for Super Admin
  const { data: superAdminData, isLoading: isSuperAdminLoading } = useQuery<SuperAdminDashboardData>({
    queryKey: ['superAdminDashboardData'],
    queryFn: fetchSuperAdminDashboardData,
    enabled: role === UserRole.SUPERADMIN,
  });

  // Data fetching for Admin/Manager
  const { data: adminData, isLoading: isAdminLoading } = useQuery<AdminDashboardData>({
    queryKey: ['dashboardData', period],
    queryFn: () => fetchDashboardData({ period }),
    enabled: role === UserRole.ADMIN || role === UserRole.MANAGER,
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
    const { data: transactions = [], isLoading: isTxnLoading } = useQuery<Transaction[]>({
        queryKey: ['sales'],
        queryFn: getSalesTransactions,
    });

    const isLoading = isAdminLoading || isTxnLoading;

    const todayStats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
    
        const todaysTransactions = transactions.filter(t => 
            new Date(t.createdAt).toISOString().split('T')[0] === today && (t.status === 'Open' || t.status === 'Paid')
        );
        
        const revenueToday = todaysTransactions.reduce((sum, t) => sum + t.total, 0);
        const openOrders = transactions.filter(t => t.status === 'Open').length;
    
        return { revenueToday, openOrders };
    }, [transactions]);
    
    if (isLoading) return <FullScreenLoader />;
    if (!adminData) return <p className="p-6 text-red-500">Error loading dashboard data.</p>;
    
    const { kpis, lowStockItems, topSellingItems } = adminData;

    return (
      <div className="p-6 text-white">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
                <h1 className="text-3xl font-bold">Welcome, {name}!</h1>
                <p className="text-gray-400">{config.description}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
               {config.links.map(link => <ActionButton key={link.to} {...link} />)}
            </div>
        </div>
        
        <div className="flex items-center gap-2 mb-6">
            {[{label: 'Today', value: 'today'}, {label: 'Last 7 Days', value: '7d'}, {label: 'Last 30 Days', value: '30d'}].map((p) => (
                <button
                    key={p.value}
                    onClick={() => setPeriod(p.value)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                        period === p.value 
                        ? 'bg-yellow-400 text-black' 
                        : 'bg-[#2b2b2b] text-white hover:bg-gray-700'
                    }`}
                >
                    {p.label}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <KPICard title="Total Revenue Today" value={`GHS ${todayStats.revenueToday.toFixed(2)}`} icon={<FaMoneyBillWave/>}/>
            <KPICard title="Open Orders" value={todayStats.openOrders} icon={<FaClipboardList />}/>
            <KPICard title="Total Revenue" value={`GHS ${kpis.totalRevenue.toFixed(2)}`} icon={<FaChartLine/>}/>
            <KPICard title="Open Tables" value={kpis.openTables} icon={<FaChair/>}/>
            <KPICard title="Total Transactions" value={kpis.totalTransactions} icon={<FaReceipt/>}/>
            <KPICard title="New Customers" value={kpis.newCustomers} icon={<FaUserFriends/>}/>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardList title="Top Selling Items" items={topSellingItems} icon={<FaFire className="text-orange-400"/>} linkTo="/sales" />
            <DashboardList title="Low Stock Alerts" items={lowStockItems} icon={<FaExclamationTriangle className="text-red-400"/>} linkTo="/inventory" />
        </div>

      </div>
    );
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
