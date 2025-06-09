import logger from "../logger"; // import the new logger
import { instance } from "./api";

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
    try {
      const params = search ? { params: { search } } : undefined;
      logger.debug("Fetching ECG history with search:", search);
      const response = await instance.get("/history", params);
      logger.debug("ECG history fetched:", response.data);
      return response.data;
    } catch (error) {
      logger.error("Error fetching ECG history:", error);
      throw error;
    }
  },

  async getECGDetails(fileId: string): Promise<ECGRecord> {
    try {
      logger.debug("Fetching ECG details for fileId:", fileId);
      const response = await instance.get(`/ecg/${fileId}`);
      logger.debug("ECG details fetched:", response.data);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching ECG details for ${fileId}:`, error);
      throw error;
    }
  },

  async uploadECG(formData: FormData): Promise<any> {
    try {
      logger.debug("Uploading ECG data...");
      const response = await instance.post("/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      logger.debug("ECG upload successful:", response.data);
      return response.data;
    } catch (error) {
      logger.error("Error uploading ECG:", error);
      throw error;
    }
  },

  async updateNotes(id: string, notes: string): Promise<void> {
    try {
      logger.debug(`Updating notes for ECG id ${id}...`);
      await instance.put(`/ecg/${id}/notes`, { notes });
      logger.debug(`Notes updated for ECG id ${id}`);
    } catch (error) {
      logger.error(`Error updating notes for ECG id ${id}:`, error);
      throw error;
    }
  },

  async getCleanedLeads(fileId: string): Promise<CleanedLeadsResponse> {
    try {
      logger.debug("Fetching cleaned leads for fileId:", fileId);
      const response = await instance.get(`/ecg/${fileId}/leads`);
      const raw = response.data;

      const cleanedLeads: CleanedLeadsResponse = {
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

      logger.debug("Cleaned leads fetched:", cleanedLeads);
      return cleanedLeads;
    } catch (error) {
      logger.error(`Error fetching cleaned leads for ${fileId}:`, error);
      throw error;
    }
  },
};

export default ecgService;
