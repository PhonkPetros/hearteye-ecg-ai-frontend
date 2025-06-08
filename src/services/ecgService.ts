import { instance } from './api';

export interface ECGRecord {
  id: number;
  fileId: string;
  patientName: string;
  gender: string;
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

export interface CleanedLeadsResponse {
  fs: number;
  leads: {
    lead_name: string;
    samples: number[];
  }[];
  patient_name: string;
  age: number;
  gender?: string | null;
  upload_date: string;
  classification: string | null;
  intervals?: {
    p_wave_duration: number | null;
    pq_interval: number | null;
    qrs_duration: number | null;
    qt_interval: number | null;
  };
  confidence?: number | null;
  notes?: string | null;
}

const ecgService = {
  async getHistory(search?: string): Promise<ECGRecord[]> {
    const params = search ? { params: { search } } : undefined;
    const response = await instance.get('/history', params);
    return response.data;
  },

  async getECGDetails(fileId: string): Promise<ECGRecord> {
    const response = await instance.get(`/record/${fileId}`);
    return response.data;
  },

  async uploadECG(formData: FormData): Promise<any> {
    const response = await instance.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateNotes(id: string, notes: string): Promise<void> {
     await instance.put(`/api/ecg/${id}/notes`, { notes });
  },

  async getCleanedLeads(fileId: string): Promise<CleanedLeadsResponse> {
  const response = await instance.get(`/ecg/${fileId}/leads`);
  const raw = response.data;

  return {
    fs: raw.fs,
    leads: raw.leads.map((name: string, i: number) => ({
      lead_name: name,
      samples: raw.signals[i],
    })),
    patient_name: raw.patient_name,
    age: raw.age,
    gender: raw.gender,
    upload_date: raw.upload_date,
    classification: raw.classification,
    intervals: {
      p_wave_duration: raw.p_wave_duration,
      pq_interval: raw.pq_interval,
      qrs_duration: raw.qrs_duration,
      qt_interval: raw.qt_interval,
    },
    confidence: raw.confidence,
    notes: raw.notes,
  };
}

};

export default ecgService; 