import React, { useEffect, useState } from 'react';
import LeadsPlotView from '../components/ECGLeadsPlot';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import authService from '../services/authService';
import ecgService, { CleanedLeadsResponse } from '../services/ecgService';

export default function ECGLeadsView() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CleanedLeadsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ecgService.getCleanedLeads(id)
      .then((response) => {
        setData(response);
        setError(null);
      })
      .catch(() => setError('Failed to load lead signals'))
      .finally(() => setLoading(false));
  }, [id]);

  console.log('ECGLeadsView data:', data);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="flex flex-col h-screen">
      <Header userName={user?.username || 'Patient'} onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <h1 className="text-2xl font-bold mb-6">ECG {id}</h1>

          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
            <div>
              <div className="text-gray-500">Patient Information</div>
              <div>Age: <span className="font-medium">{data.age ?? '-'}</span></div>
              <div>Patient: <span className="font-medium">{data.patient_name ?? '-'}</span></div>
              <div>Gender: <span className="font-medium">{data.gender ?? '-'}</span></div>
              <div>Uploaded: <span className="font-medium">{data.upload_date ? new Date(data.upload_date).toLocaleString() : '-'}</span></div>
            </div>
            <div>
              <div className="text-gray-500">Intervals</div>
              <div>QRS: <span className="font-medium">{data.intervals?.qrs_duration ?? '-'}</span> ms</div>
              <div>QT: <span className="font-medium">{data.intervals?.qt_interval ?? '-'}</span> ms</div>
              <div>PQ: <span className="font-medium">{data.intervals?.pq_interval ?? '-'}</span> ms</div>
              <div>P-wave: <span className="font-medium">{data.intervals?.p_wave_duration ?? '-'}</span> ms</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div>
              Result: <span className={`font-semibold ${data.classification === 'Normal' ? 'text-green-600' : 'text-red-600'}`}>
                {data.classification ?? '-'}
              </span>
            </div>
            <div>
              Confidence: <span className="font-semibold text-green-600">
                {data.confidence !== null && data.confidence !== undefined ? `${Math.round(data.confidence * 100)}%` : '-'}
              </span>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-500">{data.notes || 'Note'}</div>

          {/* ECG plot component */}
          <LeadsPlotView data={data} />
        </main>
      </div>
    </div>
  );
}
