import React, { useRef, useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ecgService, { ECGRecord } from '../services/ecgService';
import authService from '../services/authService';
import FileUpload from '../components/FileUpload'; // import the new FileUpload component

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

  // Pagination state for history
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(history.length / pageSize);
  const paginatedHistory = history.slice((page - 1) * pageSize, page * pageSize);

  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<ECGRecord[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  // Auto-suggest logic
  useEffect(() => {
    if (search.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const lower = search.toLowerCase();
    const filtered = history.filter(
      r =>
        (r.fileId && r.fileId.toLowerCase().includes(lower)) ||
        (r.patientName && r.patientName.toLowerCase().includes(lower))
    );
    setSuggestions(filtered.slice(0, 5));
    setShowSuggestions(filtered.length > 0);
  }, [search, history]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!searchBarRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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

  const fetchHistory = async (searchQuery = '') => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await ecgService.getHistory(searchQuery);
      const mapped = data.map(mapRecord);
      setHistory(mapped);
      setPage(1); // Reset to first page on new search
      if (mapped.length > 0) {
        setSelected(mapped[0]);
      } else {
        setSelected(null);
      }
    } catch (err: any) {
      setHistoryError('Failed to load history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Upload handler from FileUpload component
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
    setUploadError('');
    setUploadSuccess('');

    // Create form data here, including patient info
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_name', patientName);
    if (age !== null) formData.append('age', age.toString());
    formData.append('gender', gender);

    // Pass the formData to the service
    await ecgService.uploadECG(formData);

    setUploadSuccess('Upload successful!');
    await fetchHistory();
  } catch (err: any) {
    setUploadError(err.message || 'Upload failed.');
  } finally {
    setUploading(false);
  }
};


  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const handleSelectRecord = async (fileId: string) => {
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const response = await ecgService.getECGDetails(fileId);
      setSelected(mapRecord(response));
    } catch (err: any) {
      setAnalysisError('Failed to load record details.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const user = authService.getCurrentUser();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header userName={user?.username || 'Patient'} onLogout={handleLogout} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Search bar at the top */}
          <div className="px-8 pt-6 pb-2 bg-gray-50">
            <div ref={searchBarRef} className="relative max-w-2xl mx-auto flex items-center">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                placeholder="Search for ECG record (ID or label)"
                className="flex-1 border border-gray-300 rounded-full px-5 py-2 text-base shadow focus:outline-none focus:ring-2 focus:ring-yellow-400"
                style={{ minWidth: 0 }}
              />
              <button
                className="ml-2 bg-hearteye_orange hover:bg-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow transition"
                onMouseDown={e => {
                  e.preventDefault();
                  if (suggestions.length > 0) {
                    setSearch(suggestions[0].fileId);
                    setShowSuggestions(false);
                    handleSelectRecord(suggestions[0].fileId);
                  }
                }}
                tabIndex={-1}
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
              </button>
              {showSuggestions && (
                <ul className="absolute left-0 right-0 bg-white border border-gray-200 rounded-b-2xl shadow-lg z-20 mt-2 max-h-56 overflow-y-auto w-full">
                  {suggestions.map(s => (
                    <li
                      key={s.fileId}
                      className="px-5 py-3 text-base cursor-pointer hover:bg-yellow-50 flex items-center"
                      onMouseDown={() => {
                        setSearch(s.fileId);
                        setShowSuggestions(false);
                        handleSelectRecord(s.fileId);
                      }}
                    >
                      <span className="font-medium">{s.fileId}</span>
                      {s.patientName && <span className="ml-2 text-gray-500">{s.patientName}</span>}
                    </li>
                  ))}
                  {suggestions.length === 0 && (
                    <li className="px-5 py-3 text-base text-gray-400">No matches</li>
                  )}
                </ul>
              )}
            </div>
          </div>
          <main className="flex-1 grid grid-cols-3 gap-6 p-8 bg-gray-50">
            {/* Left column: Upload + History */}
            <section className="col-span-1 flex flex-col h-full gap-4">
              {/* Upload (top, smaller) */}
              <div className="bg-white rounded-lg shadow p-3 flex flex-col items-center justify-center mb-2">
                <h3 className="font-semibold mb-2 text-base">Upload an ECG File</h3>
                <FileUpload
                  onUpload={handleUpload}
                  uploading={uploading}
                  uploadError={uploadError}
                  uploadSuccess={uploadSuccess}
                />
              </div>
              {/* Patient History (bottom, paginated) */}
              <div className="bg-white rounded-lg shadow p-4 flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Patient History</h3>
                  <div className="flex gap-2 items-center">
                    <button
                      className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      Prev
                    </button>
                    <span className="text-xs">{page} / {totalPages || 1}</span>
                    <button
                      className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                      disabled={page === totalPages || totalPages === 0}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
                {historyLoading ? (
                  <div className="text-gray-500 text-sm">Loading...</div>
                ) : historyError ? (
                  <div className="text-red-600 text-sm">{historyError}</div>
                ) : (
                  <ul className="flex-1 divide-y divide-gray-100 mb-2 overflow-y-auto">
                    {paginatedHistory.map((item) => (
                      <li
                        key={item.fileId}
                        className={`flex items-center justify-between py-2 cursor-pointer hover:bg-gray-100 rounded ${selected?.fileId === item.fileId ? 'bg-indigo-50' : ''}`}
                        onClick={() => handleSelectRecord(item.fileId)}
                      >
                        <span className="font-medium">{item.patientName || item.fileId}</span>
                        <span className="text-xs text-gray-500">{new Date(item.date).toLocaleString()}</span>
                        <span className={`text-xs font-semibold ${item.classification === 'Normal' ? 'text-green-600' : 'text-red-600'}`}>{item.classification || ''}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
            {/* Right column: Plot and values */}
            <section className="col-span-2 flex flex-col h-full">
              <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col">
                <h3 className="font-semibold mb-2">ECG Analysis</h3>
                {analysisLoading ? (
                  <div className="text-gray-500 text-sm">Loading...</div>
                ) : analysisError ? (
                  <div className="text-red-600 text-sm">{analysisError}</div>
                ) : selected ? (
                  <>
                    {selected.plot && (
                      <img src={selected.plot} alt="ECG Plot" className="w-full h-48 object-contain rounded border mb-4" />
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div>
                        <div className="text-gray-500">Patient Information</div>
                        <div>Age: <span className="font-medium">{selected.age ?? '-'}</span></div>
                        <div>Patient: <span className="font-medium">{selected.patientName ?? '-'}</span></div>
                        <div>Gender: <span className="font-medium">{selected.gender ?? '-'}</span></div>
                        <div>Uploaded: <span className="font-medium">{selected.date ? new Date(selected.date).toLocaleString() : '-'}</span></div>
                      </div>
                      <div>
                        <div className="text-gray-500">Intervals</div>
                        <div>QRS: <span className="font-medium">{selected.intervals?.qrs_duration_ms ?? '-'}</span> ms</div>
                        <div>QT: <span className="font-medium">{selected.intervals?.qt_interval_ms ?? '-'}</span> ms</div>
                        <div>PQ: <span className="font-medium">{selected.intervals?.pq_interval_ms ?? '-'}</span> ms</div>
                        <div>P-wave: <span className="font-medium">{selected.intervals?.p_wave_duration_ms ?? '-'}</span> ms</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>Result: <span className={`font-semibold ${selected.classification === 'Normal' ? 'text-green-600' : 'text-red-600'}`}>{selected.classification ?? '-'}</span></div>
                      <div>Confidence: <span className="font-semibold">{selected.confidence ? (selected.confidence * 100).toFixed(0) + '%' : '-'}</span></div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-semibold mb-1">Summary</h4>
                      <p className="text-gray-700 whitespace-pre-line">{selected.summary || 'No summary available.'}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 text-center py-10">Select a record to view details</div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
