import {instance} from './api';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  msg: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await instance.post<LoginResponse>('/auth/login', data);
        return response.data;
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    };

export const logout = async () => {
    try {
      await instance.post('/auth/logout');
    } catch (error) {
      console.error("Error during logout", error);
    }
  };