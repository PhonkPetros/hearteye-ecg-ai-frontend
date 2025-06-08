import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import authService from '../services/authService';

const INACTIVITY_LIMIT_MS = 10 * 60 * 1000; // 10 minutes inactivity
const EXCLUDED_PATHS = ['/login', '/register'];

const AuthWatcher: React.FC = () => {
  const inactivityTimeout = useRef<NodeJS.Timeout | null>(null);
  const expiryTimeout = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  const getExpiryFromToken = (token: string): number | null => {
    try {
      const [, payload] = token.split('.');
      const decoded = JSON.parse(atob(payload));
      return decoded.exp * 1000; // convert to milliseconds
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // If on excluded route, do not start timers
    if (EXCLUDED_PATHS.includes(location.pathname)) {
      if (inactivityTimeout.current) {
        clearTimeout(inactivityTimeout.current);
        inactivityTimeout.current = null;
      }
      if (expiryTimeout.current) {
        clearTimeout(expiryTimeout.current);
        expiryTimeout.current = null;
      }
      return;
    }

    const clearTimers = () => {
      if (inactivityTimeout.current) {
        clearTimeout(inactivityTimeout.current);
        inactivityTimeout.current = null;
      }
      if (expiryTimeout.current) {
        clearTimeout(expiryTimeout.current);
        expiryTimeout.current = null;
      }
    };

    const logout = () => {
      clearTimers();
      authService.logout();
    };

    const resetInactivityTimer = () => {
      if (inactivityTimeout.current) {
        clearTimeout(inactivityTimeout.current);
      }
      inactivityTimeout.current = setTimeout(() => {
        logout();
      }, INACTIVITY_LIMIT_MS);
    };

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      logout();
      return;
    }
    const user = JSON.parse(userStr);
    const accessToken = user.access_token;
    if (!accessToken) {
      logout();
      return;
    }

    const expiry = getExpiryFromToken(accessToken);
    if (!expiry) {
      logout();
      return;
    }

    const now = Date.now();
    const msUntilExpiry = expiry - now;

    if (msUntilExpiry <= 0) {
      logout();
      return;
    }

    expiryTimeout.current = setTimeout(() => {
      logout();
    }, msUntilExpiry);

    resetInactivityTimer();

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    return () => {
      clearTimers();
      events.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [location.pathname]); // re-run effect on path change

  return null;
};

export default AuthWatcher;
