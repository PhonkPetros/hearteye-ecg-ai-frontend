import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import logger from "../logger";
import authService from "../services/authService";

const INACTIVITY_LIMIT_MS = 10 * 60 * 1000; // 10 minutes
const EXCLUDED_PATHS = ["/login", "/register"];

const AuthWatcher: React.FC = () => {
  const inactivityTimeout = useRef<NodeJS.Timeout | null>(null);
  const expiryTimeout = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  const getExpiryFromToken = (token: string): number | null => {
    try {
      const [, payload] = token.split(".");
      const decoded = JSON.parse(atob(payload));
      return decoded.exp * 1000; // Convert to ms
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // Don't run timers on excluded routes
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
      logger.info("Logging out user due to inactivity or token expiry");
      authService.logout();
    };

    const resetInactivityTimer = () => {
      if (inactivityTimeout.current) {
        clearTimeout(inactivityTimeout.current);
      }
      inactivityTimeout.current = setTimeout(logout, INACTIVITY_LIMIT_MS);
    };

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      logout();
      return;
    }

    let user: { access_token?: string };
    try {
      user = JSON.parse(userStr);
    } catch (error) {
      logger.error("Failed to parse user from localStorage", error);
      logout();
      return;
    }

    const accessToken = user.access_token;
    if (!accessToken) {
      logger.warn("No access token found for user, logging out");
      logout();
      return;
    }

    const expiry = getExpiryFromToken(accessToken);
    if (!expiry) {
      logger.warn("Access token has no expiry or is malformed, logging out");
      logout();
      return;
    }

    const now = Date.now();
    const msUntilExpiry = expiry - now;

    if (msUntilExpiry <= 0) {
      logger.info("Access token expired, logging out");
      logout();
      return;
    }

    expiryTimeout.current = setTimeout(logout, msUntilExpiry);

    resetInactivityTimer();

    const events = ["mousemove", "keydown", "mousedown", "touchstart"] as const;
    events.forEach((event) =>
      window.addEventListener(event, resetInactivityTimer)
    );

    return () => {
      clearTimers();
      events.forEach((event) =>
        window.removeEventListener(event, resetInactivityTimer)
      );
    };
  }, [location.pathname]);

  return null;
};

export default AuthWatcher;
