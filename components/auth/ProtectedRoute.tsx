
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { User } from '../../types';

interface ProtectedRouteProps {
  currentUser: User | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ currentUser }) => {
  const location = useLocation();

  if (!currentUser) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to so we can send them along after they login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />; // Render the children routes if authenticated
};

export default ProtectedRoute;
