import { api } from './authService';

export interface ECGRecord {
  id: number;
  fileId: string;
  patientName: string;
  date: string;
  classification: string | null;
  summary?: any;
  plot: string | null;
  age?: number | null;
  intervals?: {
    p_wave_duration_ms: number | null;
    pq_interval_ms: number | null;
    qrs_duration_ms: number | null;
    qt_interval_ms: number | null;
  };
  confidence?: number | null;
  notes?: string | null;
}

const ecgService = {
  async getHistory(search?: string): Promise<ECGRecord[]> {
    const params = search ? { params: { search } } : undefined;
    const response = await api.get('/history', params);
    return response.data;
  },

  async getECGDetails(fileId: string): Promise<ECGRecord> {
    const response = await api.get(`/record/${fileId}`);
    return response.data;
  },

  async uploadECG(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default ecgService; 