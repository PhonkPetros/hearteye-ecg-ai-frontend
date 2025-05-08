import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api, { AnalyzeResponse } from '../services/api';

export default function DetailView() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.analyzeECG(id)
      .then(res => {
        setData(res);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load ECG details');
      });
  }, [id]);

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!data) return <div className="p-4">Loading…</div>;

  const { patient, summary, plot } = data;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">ECG Details — {patient.name ?? 'Unknown Patient'}</h1>

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
  );
}
