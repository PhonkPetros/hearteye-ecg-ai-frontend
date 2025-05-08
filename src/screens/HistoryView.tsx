import React, { useState, useEffect } from 'react';
import HistoryTable from '../components/HistoryTable';
import api from '../services/api';

interface Record {
  id: string;
  patientName: string;
  date: string;
  classification: string;
}

export default function HistoryView() {
  const [records, setRecords] = useState<Record[]>([]);
  const [sortKey, setSortKey] = useState<'date' | 'patientName' | 'classification'>('date');

  useEffect(() => {
    api.fetchHistory().then(setRecords);
  }, []);

  const sorted = [...records].sort((a, b) => {
    if (sortKey === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
    return a[sortKey].localeCompare(b[sortKey]);
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ECG History</h1>
      <div className="flex gap-4 mb-4">
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
      <HistoryTable records={sorted} />
    </div>
  );
}
