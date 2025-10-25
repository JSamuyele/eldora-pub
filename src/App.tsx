
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import useLoadUser from './hooks/useLoadUser';

import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Orders from './pages/Orders';
import Tables from './pages/Tables';
import Events from './pages/Events';
import Profile from './pages/Profile';
import StaffManagement from './pages/admin/StaffManagement';
import UserManagement from './pages/superadmin/UserManagement';
import BusinessManagement from './pages/superadmin/BusinessManagement';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import FullScreenLoader from './components/shared/FullScreenLoader';
import EventBooking from './pages/EventBooking';
import Reports from './pages/Reports';
import BusinessSettings from './pages/admin/BusinessSettings';

import SuperAdminSettings from './pages/superadmin/SuperAdminSettings';

const App: React.FC = () => {
  const isLoading = useLoadUser();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  if (isLoading) {
    return <FullScreenLoader />;
  }
  
  const allRoles = ['superadmin', 'admin', 'manager', 'cashier', 'waitress'];

  return (
    <Routes>
      <Route path="/auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={
          <ProtectedRoute roles={allRoles}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute roles={allRoles}>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Admin & Manager Routes */}
        <Route path="/inventory" element={<ProtectedRoute roles={['admin', 'manager']}><Inventory /></ProtectedRoute>} />
        <Route path="/sales" element={<ProtectedRoute roles={['admin', 'manager', 'cashier']}><Sales /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute roles={allRoles}><Orders /></ProtectedRoute>} />
        <Route path="/tables" element={<ProtectedRoute roles={['admin', 'manager', 'waitress']}><Tables /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute roles={['admin', 'manager', 'cashier']}><Events /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute roles={['admin', 'manager']}><StaffManagement /></ProtectedRoute>} />
        <Route path="/event-booking" element={<ProtectedRoute roles={['admin', 'manager']}><EventBooking /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={['admin', 'manager']}><Reports /></ProtectedRoute>} />
        <Route path="/admin/business-settings" element={<ProtectedRoute roles={['admin', 'manager']}><BusinessSettings /></ProtectedRoute>} />


        {/* Super Admin Routes */}
        <Route path="/superadmin/users" element={<ProtectedRoute roles={['superadmin']}><UserManagement /></ProtectedRoute>} />
        <Route path="/superadmin/businesses" element={<ProtectedRoute roles={['superadmin']}><BusinessManagement /></ProtectedRoute>} />
        <Route path="/superadmin/settings" element={<ProtectedRoute roles={['superadmin']}><SuperAdminSettings /></ProtectedRoute>} />
      </Route>
      
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
