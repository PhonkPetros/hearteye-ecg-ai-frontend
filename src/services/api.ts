import axios from 'axios';
import authService from './authService'; // import for token refreshing

// Use different API URLs for development vs production
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';


console.log('🛠️  API base URL:', API_BASE, 'Environment:', process.env.NODE_ENV);

export const instance = axios.create({
  baseURL: API_BASE,
  timeout: 100000,
  withCredentials: true,
});

export interface AnalyzeResponse {
  patient: {
    name: string | null;
    age: number | null;
    gender: string | null;
  };
  summary: Record<string, number | null>;
  plot: string | null;
}

export type ECGSummary = AnalyzeResponse; // backward compatibility

export interface UploadResponse {
  file_id: string;
}

export interface HistoryRecord {
  id: string;
  patientName: string;
  date: string;
  classification: string;
  summary?: AnalyzeResponse['summary'];
  plot?: string;
}

// Request interceptor to add access token
instance.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - token invalid or expired
      authService.logout();
    }
    return Promise.reject(error);
  }
);

const api = {
  uploadECG: (formData: FormData): Promise<UploadResponse> => {
    console.log('🛠️  POSTing to:', `${API_BASE}/upload`);
    return instance
      .post<UploadResponse>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(res => res.data);
  },

  analyzeECG: (id: string): Promise<AnalyzeResponse> => {
    console.log('🛠️  GETting from:', `${API_BASE}/analyze_wfdb/${id}`);
    return instance
      .get<AnalyzeResponse>(`/analyze_wfdb/${id}`)
      .then(res => res.data);
  },

  fetchHistory: (): Promise<HistoryRecord[]> => {
    console.log('🛠️  GETting history from:', `${API_BASE}/history`);
    return instance
      .get<HistoryRecord[]>('/history')
      .then(res => res.data);
  },

  searchECG: (query: string): Promise<HistoryRecord[]> => {
    console.log('🛠️  GETting search from:', `${API_BASE}/history?search=${encodeURIComponent(query)}`);
    return instance
      .get<HistoryRecord[]>(`/history?search=${encodeURIComponent(query)}`)
      .then(res => res.data);
  },
};

export default api;
