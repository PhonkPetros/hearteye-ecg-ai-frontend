import {instance} from './api';

// Use different API URLs for development vs production
const API_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

console.log('🔐 Auth service initialized with API_URL:', API_URL, 'Environment:', process.env.NODE_ENV);

// Create axios instance with base URL
// export const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
//   timeout: 100000
// });

// Add request interceptor to include token
instance.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Adding auth token to request:', config.url);
    }
    console.log('🔐 Making request to:', `${config.baseURL || ''}${config.url || ''}`);
    return config;
  },
  (error) => {
    console.error('🔐 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
instance.interceptors.response.use(
  (response) => {
    console.log('🔐 Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('🔐 Response error:', error.response?.status, error.response?.data, error.config?.url);
    return Promise.reject(error);
  }
);

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
    console.log('🔐 Attempting login for user:', data.username);
    try {
      const response = await instance.post('/auth/login', data);
      console.log('🔐 Login successful:', response.data);
      if (response.data.access_token) {
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log('🔐 Token stored in localStorage');
      }
      return response.data;
    } catch (error) {
      console.error('🔐 Login failed:', error);
      throw error;
    }
  },

  async register(data: RegisterData): Promise<{ message: string }> {
    console.log('🔐 Attempting registration for user:', data.username);
    try {
      const response = await instance.post('/auth/register', data);
      console.log('🔐 Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('🔐 Registration failed:', error);
      throw error;
    }
  },

  logout(): void {
    console.log('🔐 Logging out user');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      console.log('🔐 Current user found:', userData.user?.username);
      return userData.user;
    }
    console.log('🔐 No current user found');
    return null;
  },

  getToken(): string | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      return userData.access_token;
    }
    return null;
  }
};

export default authService; 