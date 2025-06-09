import { useEffect, useState } from "react";
import PatientHistory from "../components/PatientHistory";
import SearchBar from "../components/SearchBar";
import logger from "../logger";
import ecgService, { ECGRecord } from "../services/ecgService";

export default function HistoryView() {
  const [records, setRecords] = useState<ECGRecord[]>([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<ECGRecord[]>([]);
  const [selected, setSelected] = useState<ECGRecord | null>(null);
  const pageSize = 10;

  // Fetch history records
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        logger.info("Fetching ECG history records");
        const raw = await ecgService.getHistory();
        const mapped = raw.map(mapRecord);
        setRecords(mapped);
        logger.info(`Fetched ${mapped.length} history records`);
      } catch (error) {
        logger.error("Failed to fetch history records:", error);
      }
    };

    fetchHistory();
  }, []);

  // Filter suggestions on search
  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }

    const lower = search.toLowerCase();
    const filtered = records.filter(
      (r) =>
        (r.fileId && r.fileId.toLowerCase().includes(lower)) ||
        (r.patientName && r.patientName.toLowerCase().includes(lower))
    );
    setSuggestions(filtered.slice(0, 5));
  }, [search, records]);

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

  const handleSelectRecord = (fileId: string) => {
    const found = records.find((r) => r.fileId === fileId);
    if (found) {
      logger.info("Selected ECG record:", fileId);
      setSelected(found);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <div className="px-8 pt-6 pb-2">
        <SearchBar
          search={search}
          onSearchChange={setSearch}
          suggestions={suggestions}
          onSelect={handleSelectRecord}
        />
      </div>

      <div className="px-8 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Patient History</h1>
        </div>

        <PatientHistory
          history={records}
          selected={selected}
          onSelectRecord={handleSelectRecord}
          historyLoading={false}
          historyError={null}
          compact={false}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}
