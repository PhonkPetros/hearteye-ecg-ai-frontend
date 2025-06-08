import {instance} from './api';

// Use different API URLs for development vs production
const API_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

console.log('🔐 Auth service initialized with API_URL:', API_URL, 'Environment:', process.env.NODE_ENV);

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
    localStorage.removeItem('user');
    window.location.href = '/login'; // redirect to login page on logout
},

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
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