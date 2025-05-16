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

  // Ensure patient object exists to avoid undefined errors
  const patient = data.patient ?? { name: 'Unknown Patient', age: null, gender: null };
  const summary = data.summary;
  const plot = data.plot;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">ECG Details — {patient.name || 'Unknown Patient'}</h1>

      {/* Patient Information */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Patient Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Name:</strong> {patient.name || '–'}</p>
            <p><strong>Age:</strong> {patient.age !== null ? patient.age : '–'}</p>
            <p><strong>Gender:</strong> {patient.gender || '–'}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">ECG Metrics</h3>
            {summary && Object.entries(summary).map(([key, value]) => (
              <p key={key}>
                <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>{' '}
                {value !== null ? `${value} ms` : '–'}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* ECG Plot and Intervals */}
      {plot ? (
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-4">ECG Plot</h2>
          <img
            src={plot}
            alt="ECG Plot"
            className="w-full h-auto object-contain mb-6"
          />

          {/* Detailed Intervals Below Diagram */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Detailed Intervals</h3>
            <div className="grid grid-cols-2 gap-4">
              <p><strong>P-Wave Duration:</strong> {summary.P_wave_duration_ms !== null ? `${summary.P_wave_duration_ms} ms` : '–'}</p>
              <p><strong>PQ Interval:</strong> {summary.PQ_interval_ms !== null ? `${summary.PQ_interval_ms} ms` : '–'}</p>
              <p><strong>QRS Duration:</strong> {summary.QRS_duration_ms !== null ? `${summary.QRS_duration_ms} ms` : '–'}</p>
              <p><strong>QT Interval:</strong> {summary.QT_interval_ms !== null ? `${summary.QT_interval_ms} ms` : '–'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-gray-500">No ECG plot available.</div>
      )}
    </div>
  );
}
