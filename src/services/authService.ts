import logger from "../logger";
import { instance } from "./api";

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    logger.debug("Attempting login for user:", data.username);
    try {
      const response = await instance.post("/auth/login", data);
      const authData = response.data;

      if (authData?.access_token) {
        localStorage.setItem("user", JSON.stringify(authData));
        logger.info("User logged in and token stored");
      } else {
        logger.warn("Login succeeded but no token received");
      }

      return authData;
    } catch (error) {
      logger.error("Login failed:", error);
      throw error;
    }
  },

  async register(data: RegisterData): Promise<{ message: string }> {
    logger.debug("Attempting registration for user:", data.username);
    try {
      const response = await instance.post("/auth/register", data);
      logger.info("Registration successful:", response.data);
      return response.data;
    } catch (error) {
      logger.error("Registration failed:", error);
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem("user");
    logger.info("User logged out, clearing localStorage and redirecting");
    window.location.href = "/login"; // redirect to login page on logout
  },

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        logger.info("No current user in localStorage");
        return null;
      }

      const parsed = JSON.parse(userStr);
      if (parsed?.user) {
        return parsed.user;
      } else {
        logger.warn("User object malformed in localStorage");
        return null;
      }
    } catch (error) {
      logger.error("Failed to parse user from localStorage:", error);
      return null;
    }
  },

  getToken(): string | null {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        logger.info("No token in localStorage");
        return null;
      }

      const parsed = JSON.parse(userStr);
      if (parsed?.access_token) {
        return parsed.access_token;
      } else {
        logger.warn("Access token not found in stored user");
        return null;
      }
    } catch (error) {
      logger.error("Failed to parse token from localStorage:", error);
      return null;
    }
  },
};

export default authService;
