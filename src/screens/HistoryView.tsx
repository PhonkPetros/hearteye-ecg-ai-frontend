import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import PatientHistory from '../components/PatientHistory';
import ecgService, { ECGRecord } from '../services/ecgService';
import authService from '../services/authService';

export default function HistoryView() {
  const [records, setRecords] = useState<ECGRecord[]>([]);
  const [sortKey, setSortKey] = useState<'date' | 'patientName' | 'classification'>('date');
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<ECGRecord[]>([]);
  const [selected, setSelected] = useState<ECGRecord | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(records.length / pageSize);
  const paginatedHistory = records.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    const fetch = async () => {
      try {
        const raw = await ecgService.getHistory();
        const mapped = raw.map(mapRecord);
        setRecords(mapped);
      } catch (err) {
        console.error('Failed to fetch history');
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    const lower = search.toLowerCase();
    const filtered = records.filter(
      r =>
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
    const found = records.find(r => r.fileId === fileId);
    if (found) setSelected(found);
  };

  const sortedRecords = [...records].sort((a, b) => {
    if (sortKey === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
    return (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '');
  });

  const user = authService.getCurrentUser();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header userName={user?.username || 'User'} onLogout={authService.logout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-auto">
          <div className="px-8 pt-6 pb-2 bg-gray-50">
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
              <select
                value={sortKey}
                onChange={e => setSortKey(e.target.value as any)}
                className="border px-2 py-1 rounded"
              >
                <option value="date">Sort by Date</option>
                <option value="patientName">Sort by Patient</option>
                <option value="classification">Sort by Class</option>
              </select>
            </div>

            <PatientHistory
              history={records}
              paginatedHistory={paginatedHistory}
              selected={selected}
              onSelectRecord={handleSelectRecord}
              historyLoading={false}
              historyError={null}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
              compact={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
