import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaBoxOpen, FaChartLine, FaUsers, FaStore, FaSignOutAlt, FaBars, FaTimes, FaClipboardList, FaChair, FaReceipt, FaUserFriends, FaFire, FaExclamationTriangle, FaMoneyBillWave, FaChevronDown } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { RootState } from '../../redux/store';
import { fetchDashboardData, getSalesTransactions } from '../../services/api';
import FullScreenLoader from '../../components/shared/FullScreenLoader';
import ReportModal from '../../components/ui/ReportModal';

// --- TYPE DEFINITIONS ---
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

interface Transaction {
    _id: string;
    total: number;
    status: 'Open' | 'Paid' | 'Cancelled';
    createdAt: string;
}

const KPICard: React.FC<{ title: string; value: string | number; icon: React.ReactElement }> = ({ title, value, icon }) => (
    <div className="bg-[#2b2b2b] p-5 rounded-xl flex items-center gap-4">
        <div className="text-3xl text-yellow-400 p-3 bg-gray-800 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const DashboardList: React.FC<{ title: string; items: { _id?: string; name: string; stock?: number }[]; icon: React.ReactElement; linkTo: string; }> = ({ title, items, icon, linkTo }) => (
    <div className="bg-[#2b2b2b] p-5 rounded-xl">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">{icon} {title}</h3>
            <Link to={linkTo} className="text-sm text-yellow-400 hover:underline">View All</Link>
        </div>
        <ul className="space-y-3">
            {items.length > 0 ? items.map((item, index) => (
                <li key={item._id || index} className="flex justify-between items-center bg-[#1f1f1f] p-3 rounded-lg">
                    <span className="font-medium text-gray-300">{item.name}</span>
                    {item.stock !== undefined && <span className="text-sm font-bold text-red-400">{item.stock} left</span>}
                </li>
            )) : <li key="no-items" className="text-gray-500 text-sm text-center">No items to show.</li>}
        </ul>
    </div>
);

const AdminDashboard: React.FC = () => {
  const { name } = useSelector((state: RootState) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [period, setPeriod] = useState('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<'7d' | '30d'>('7d');

  const { data: adminData, isLoading: isAdminLoading } = useQuery<AdminDashboardData>({
    queryKey: ['dashboardData', period],
    queryFn: () => fetchDashboardData({ period }),
  });

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

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { to: '/inventory', label: 'Inventory', icon: <FaBoxOpen /> },
    { to: '/sales', label: 'Sales', icon: <FaChartLine /> },
    { to: '/staff', label: 'Staff Management', icon: <FaUsers /> },
    { to: '/admin/business-settings', label: 'Settings', icon: <FaStore /> },
  ];

  if (isLoading) return <FullScreenLoader />;
  if (!adminData) return <p className="p-6 text-red-500">Error loading dashboard data.</p>;

  const { kpis, lowStockItems, topSellingItems } = adminData;

  const periods = [
    {label: 'Today', value: 'today'}, 
    {label: 'Last 7 Days', value: '7d'},
    {label: 'Last 30 Days', value: '30d'}
  ];

  const handlePeriodClick = (p: { label: string, value: string }) => {
    if (p.value === '7d' || p.value === '30d') {
      setReportPeriod(p.value);
      setIsReportModalOpen(true);
    } else {
      setPeriod(p.value);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#1f1f1f] text-white">
      {/* Sidebar */}
      <div className={`bg-[#0c021c] w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-20`}>
        <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-semibold text-white">Admin</h2>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden">
                <FaTimes className="text-white" />
            </button>
        </div>
        <nav>
          {navLinks.map(link => (
            <Link
              key={link.label}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === link.to ? 'bg-yellow-400 text-black' : 'text-gray-300 hover:bg-gray-700'}`}>
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 w-full p-4">
            <Link to="/auth" className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-700">
                <FaSignOutAlt />
                <span>Logout</span>
            </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-[#0c021c]">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden">
                <FaBars className="text-white text-2xl"/>
            </button>
            <h1 className="text-2xl font-semibold">Welcome, {name}!</h1>
        </div>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#1f1f1f] p-6">
        <div className="flex items-center gap-2 mb-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 text-sm font-semibold rounded-full transition bg-[#2b2b2b] text-white hover:bg-gray-700"
                >
                    Select Period
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
                    <div className="bg-[#2b2b2b] p-5 rounded-xl">
                        <h3 className="text-lg font-semibold mb-4">Select a Period</h3>
                        <div className="flex items-center gap-2">
                            {periods.map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() => handlePeriodClick(p)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                                        period === p.value
                                            ? 'bg-yellow-400 text-black'
                                            : 'bg-[#1f1f1f] text-white hover:bg-gray-700'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isReportModalOpen && (
              <ReportModal 
                period={reportPeriod} 
                onClose={() => setIsReportModalOpen(false)} 
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <KPICard title="Total Revenue Today" value={`GHS ${todayStats.revenueToday.toFixed(2)}`} icon={<FaMoneyBillWave/>}/>
                <KPICard title="Open Orders" value={todayStats.openOrders} icon={<FaClipboardList />}/>
                <KPICard title="Total Revenue" value={`GHS ${kpis.totalRevenue.toFixed(2)}`} icon={<FaChartLine/>}/>
                <KPICard title="Open Tables" value={kpis.openTables} icon={<FaChair/>}/>
                <KPICard title="Total Transactions" value={kpis.totalTransactions} icon={<FaReceipt/>}/>
                <KPICard title="New Customers" value={kpis.newCustomers} icon={<FaUserFriends/>}/>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardList title="Top Selling Items" items={topSellingItems} icon={<FaFire className="text-orange-400" />} linkTo="/sales" />
                <DashboardList title="Low Stock Alerts" items={lowStockItems} icon={<FaExclamationTriangle className="text-red-400" />} linkTo="/inventory" />
            </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
