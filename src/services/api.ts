import axios from "axios";
import logger from "../logger";
import authService from "./authService";

const API_BASE = process.env.REACT_APP_API_BASE;

logger.debug("API base URL:", API_BASE, "| Environment:", process.env.NODE_ENV);

export const instance = axios.create({
  baseURL: API_BASE,
  timeout: 100000,
  withCredentials: true,
});

// ➕ Add Authorization token to every request
instance.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      logger.debug(
        "Request with token:",
        config.method?.toUpperCase(),
        config.url
      );
    } else {
      logger.warn(
        "Request without token:",
        config.method?.toUpperCase(),
        config.url
      );
    }
    return config;
  },
  (error) => {
    logger.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Handle response errors globally
instance.interceptors.response.use(
  (response) => {
    logger.debug(
      "Response:",
      response.config.url,
      "| Status:",
      response.status
    );
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401) {
      logger.warn("Unauthorized (401) on", url);
      authService.logout();
    } else {
      logger.error(
        `API error on ${url || "unknown URL"} | Status: ${status}`,
        error
      );
    }

    return Promise.reject(error);
  }
);
