import React, { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import SearchBar from '../components/SearchBar';
import HistoryTable from '../components/HistoryTable';
import api, { AnalyzeResponse } from '../services/api';

export default function Dashboard() {
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [history, setHistory] = useState<Array<any>>([]);
  const [searchResults, setSearchResults] = useState<Array<any>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        console.log('Fetching history...');
        const data = await api.fetchHistory();
        console.log('History data:', data);
        setHistory(data);
        setError(null);
      } catch (err: any) {
        const errorMessage = err.response 
          ? `Failed to fetch ECG history. Server responded with ${err.response.status}: ${err.response.data}`
          : 'Failed to fetch ECG history. Please make sure the backend server is running.';
        setError(errorMessage);
        console.error('Error fetching history:', err);
      }
    };
    fetchHistory();
  }, []);

  const handleUpload = async (file: File) => {
    try {
      setError(null);
      console.log('Uploading file:', file.name);
      const fd = new FormData();
      fd.append('file', file);
      const { file_id } = await api.uploadECG(fd);
      console.log('File uploaded, ID:', file_id);
      
      console.log('Analyzing ECG...');
      const result = await api.analyzeECG(file_id);
      console.log('Analysis result:', result);
      setAnalysis(result);
    } catch (err: any) {
      const errorMessage = err.response 
        ? `Failed to upload or analyze ECG. Server responded with ${err.response.status}: ${err.response.data}`
        : 'Failed to upload or analyze ECG. Please try again.';
      setError(errorMessage);
      console.error('Error uploading ECG:', err);
    }
  };

  const handleSearch = async (q: string) => {
    try {
      setError(null);
      console.log('Searching for:', q);
      if (q) {
        const results = await api.searchECG(q);
        console.log('Search results:', results);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (err: any) {
      const errorMessage = err.response 
        ? `Failed to search ECGs. Server responded with ${err.response.status}: ${err.response.data}`
        : 'Failed to search ECGs. Please try again.';
      setError(errorMessage);
      console.error('Error searching ECGs:', err);
    }
  };

  const recordsToShow = searchResults.length ? searchResults : history;

  if (!analysis) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <FileUpload onUpload={handleUpload} />
        <SearchBar onSearch={handleSearch} />
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Recent ECG History</h2>
          <HistoryTable records={recordsToShow} />
        </div>
      </div>
    );
  }

  const { patient, summary, plot } = analysis;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <FileUpload onUpload={handleUpload} />
      <div className="mt-6 space-y-6">
        {/* Patient Information */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Patient Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {patient.name ?? '–'}</p>
              <p><strong>Age:</strong> {patient.age ?? '–'}</p>
              <p><strong>Gender:</strong> {patient.gender ?? '–'}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">ECG Metrics</h3>
              {Object.entries(summary).map(([key, value]) => (
                <p key={key}>
                  <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>{' '}
                  {value !== null ? `${value} ms` : '–'}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* ECG Plot */}
        {plot && (
          <div className="bg-white shadow rounded p-4">
            <h2 className="text-xl font-semibold mb-4">ECG Plot</h2>
            <img 
              src={plot} 
              alt="ECG Plot" 
              className="w-full h-auto object-contain"
            />
          </div>
        )}
      </div>
      <SearchBar onSearch={handleSearch} />
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Recent ECG History</h2>
        <HistoryTable records={recordsToShow} />
      </div>
    </div>
  );
}
