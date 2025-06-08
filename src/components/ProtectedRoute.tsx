import React from 'react';
import authService from '../services/authService';
import { useLocation } from 'react-router-dom';

const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload));
    const exp = decoded.exp * 1000;
    return Date.now() < exp;
  } catch {
    return false;
  }
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = authService.getToken();
  const location = useLocation();

  if (!isTokenValid(token)) {
    authService.logout();

    // Prevent redirect loop: if already on /login or /register, just render children
    if (location.pathname === '/login' || location.pathname === '/register') {
      return <>{children}</>;
    }

    return null
  }

  return <>{children}</>;
};

export default ProtectedRoute;
