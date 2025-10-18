
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../redux/store';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  roles?: (UserRole | string)[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, role: userRole } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(userRole)) {
     return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
