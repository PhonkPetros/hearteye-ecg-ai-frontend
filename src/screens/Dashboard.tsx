import React, { useCallback, useEffect, useState } from "react";
import ECGAnalysisPanel from "../components/ECGAnalysisPanel";
import FileUpload from "../components/FileUpload";
import PatientHistory from "../components/PatientHistory";
import SearchBar from "../components/SearchBar";
import logger from "../logger";
import ecgService, { ECGRecord } from "../services/ecgService";

const mapRecord = (item: any): ECGRecord => ({
  id: item.id,
  fileId: item.file_id,
  patientName: item.patient_name,
  age: item.age,
  gender: item.gender,
  date: item.upload_date,
  classification: item.classification,
  summary: item.summary,
  plot: item.plot_url,
  ...item,
});

const Dashboard: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const [history, setHistory] = useState<ECGRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [selected, setSelected] = useState<ECGRecord | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<ECGRecord[]>([]);

  const fetchHistory = useCallback(async (searchQuery = "") => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await ecgService.getHistory(searchQuery);
      const mapped = data.map(mapRecord);
      setHistory(mapped);
      setPage(1);
      if (mapped.length > 0) {
        try {
          const fullDetails = await ecgService.getECGDetails(mapped[0].fileId);
          setSelected(mapRecord(fullDetails));
        } catch (err) {
          logger.error("Failed to fetch detailed ECG record:", err);
          setSelected(mapped[0]);
        }
      } else {
        setSelected(null);
      }
    } catch (err) {
      logger.error("Failed to load history:", err);
      setHistoryError("Failed to load history.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (search.trim() === "") {
      setSuggestions([]);
      return;
    }
    const lower = search.toLowerCase();
    const filtered = history.filter(
      (r) =>
        (r.fileId && r.fileId.toLowerCase().includes(lower)) ||
        (r.patientName && r.patientName.toLowerCase().includes(lower))
    );
    setSuggestions(filtered.slice(0, 5));
  }, [search, history]);

  const handleUpload = async ({
    file,
    patientName,
    age,
    gender,
  }: {
    file: File;
    patientName: string;
    age: number | null;
    gender: string;
  }) => {
    try {
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("patient_name", patientName);
      if (age !== null) formData.append("age", age.toString());
      formData.append("gender", gender);

      await ecgService.uploadECG(formData);

      setUploadSuccess("Upload successful!");
      await fetchHistory();
    } catch (err: any) {
      logger.error("Upload failed:", err);
      setUploadError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSelectRecord = async (fileId: string) => {
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const response = await ecgService.getECGDetails(fileId);
      setSelected(mapRecord(response));
    } catch (err) {
      logger.error("Failed to load ECG record details:", err);
      setAnalysisError("Failed to load record details.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="px-8 pt-6 pb-2">
        <SearchBar
          search={search}
          onSearchChange={setSearch}
          suggestions={suggestions}
          onSelect={handleSelectRecord}
        />
      </div>

      <main className="flex-1 grid grid-cols-5 gap-6 p-8">
        <section className="col-span-2 flex flex-col h-full gap-4">
          <div className="bg-white rounded-lg shadow p-3 flex flex-col items-center justify-center mb-2">
            <h3 className="font-semibold mb-2 text-base">Upload an ECG File</h3>
            <FileUpload
              onUpload={handleUpload}
              uploading={uploading}
              uploadError={uploadError}
              uploadSuccess={uploadSuccess}
            />
          </div>

          <PatientHistory
            history={history}
            selected={selected}
            onSelectRecord={handleSelectRecord}
            historyLoading={historyLoading}
            historyError={historyError}
            compact={true}
          />
        </section>

        <section className="col-span-3 flex flex-col h-full">
          <ECGAnalysisPanel
            selected={selected}
            analysisLoading={analysisLoading}
            analysisError={analysisError}
          />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
