import React from "react";
import { useLocation } from "react-router-dom";
import logger from "../logger";
import authService from "../services/authService";

const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    const exp = decoded.exp * 1000;
    return Date.now() < exp;
  } catch (error) {
    logger.error("Invalid token format or decoding failed", { error });
    return false;
  }
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  try {
    const token = authService.getToken();

    if (!isTokenValid(token)) {
      try {
        authService.logout();
      } catch (logoutError) {
        logger.error("Error during logout in ProtectedRoute", { logoutError });
      }

      // Prevent redirect loop: if already on /login or /register, just render children
      if (location.pathname === "/login" || location.pathname === "/register") {
        return <>{children}</>;
      }

      return null;
    }

    return <>{children}</>;
  } catch (error) {
    logger.error("Unexpected error in ProtectedRoute", { error });
    return null;
  }
};

export default ProtectedRoute;
