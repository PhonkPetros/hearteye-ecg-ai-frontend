import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Create axios instance with base URL
export const api = axios.create({
  baseURL: API_URL
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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
    const response = await api.post('/auth/login', data);
    if (response.data.access_token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async register(data: RegisterData): Promise<{ message: string }> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      return userData.user;
    }
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