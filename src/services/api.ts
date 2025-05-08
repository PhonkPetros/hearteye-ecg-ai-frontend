import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000';   // Hardcoded for now

console.log('🛠️  API base URL:', API_BASE);

const instance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
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

// For backward compatibility with components still importing ECGSummary
export type ECGSummary = AnalyzeResponse;

export interface UploadResponse { 
  file_id: string; 
}

const api = {
  uploadECG: (formData: FormData): Promise<UploadResponse> => {
    console.log('🛠️  POSTing to:', `${API_BASE}/upload`);
    return instance.post<UploadResponse>('/upload', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    }).then(res => res.data);
  },

  analyzeECG: (id: string): Promise<AnalyzeResponse> => {
    console.log('🛠️  GETting from:', `${API_BASE}/analyze_wfdb/${id}`);
    return instance.get<AnalyzeResponse>(`/analyze_wfdb/${id}`).then(res => res.data);
  },

  fetchHistory: (): Promise<Array<{ 
    id: string; 
    patientName: string; 
    date: string; 
    classification: string 
  }>> => {
    console.log('🛠️  GETting from:', `${API_BASE}/ecg/history`);
    return instance.get('/ecg/history').then(res => res.data);
  },

  searchECG: (query: string) => {
    console.log('🛠️  GETting from:', `${API_BASE}/ecg/search?query=${encodeURIComponent(query)}`);
    return instance.get(`/ecg/search?query=${encodeURIComponent(query)}`).then(res => res.data);
  },
};

export default api;
