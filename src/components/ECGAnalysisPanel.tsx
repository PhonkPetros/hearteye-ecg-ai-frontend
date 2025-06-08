import React from 'react';
import { ECGRecord } from '../services/ecgService';
import { useNavigate } from 'react-router-dom';


interface ECGAnalysisPanelProps {
  selected: ECGRecord | null;
  analysisLoading: boolean;
  analysisError: string | null;
}

const ECGAnalysisPanel: React.FC<ECGAnalysisPanelProps> = ({
  selected,
  analysisLoading,
  analysisError,
}) => {
  const navigate = useNavigate();
  
  const handleViewLeads = () => {
    if (selected?.fileId) {
      navigate(`/ecg/${selected.fileId}/leads`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col">
      <h3 className="font-semibold mb-2">ECG Analysis</h3>
      <div className="flex-1">
        {analysisLoading ? (
          <div className="text-gray-500 text-sm">Loading...</div>
        ) : analysisError ? (
          <div className="text-red-600 text-sm">{analysisError}</div>
        ) : selected ? (
          <>
            {selected.plot && (
              <img
                src={selected.plot}
                alt="ECG Plot"
                className="w-full h-48 object-contain rounded border mb-4"
              />
            )}
            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
              <div>
                <div className="text-gray-500">Patient Information</div>
                <div>
                  Age: <span className="font-medium">{selected.age ?? '-'}</span>
                </div>
                <div>
                  Patient:{' '}
                  <span className="font-medium">{selected.patientName ?? '-'}</span>
                </div>
                <div>
                  Gender: <span className="font-medium">{selected.gender ?? '-'}</span>
                </div>
                <div>
                  Uploaded:{' '}
                  <span className="font-medium">
                    {selected.date ? new Date(selected.date).toLocaleString() : '-'}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-gray-500">Intervals</div>
                <div>
                  QRS:{' '}
                  <span className="font-medium">
                    {selected.intervals?.qrs_duration_ms ?? '-'}
                  </span>{' '}
                  ms
                </div>
                <div>
                  QT:{' '}
                  <span className="font-medium">
                    {selected.intervals?.qt_interval_ms ?? '-'}
                  </span>{' '}
                  ms
                </div>
                <div>
                  PQ:{' '}
                  <span className="font-medium">
                    {selected.intervals?.pq_interval_ms ?? '-'}
                  </span>{' '}
                  ms
                </div>
                <div>
                  P-wave:{' '}
                  <span className="font-medium">
                    {selected.intervals?.p_wave_duration_ms ?? '-'}
                  </span>{' '}
                  ms
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                Result:{' '}
                <span
                  className={`font-semibold ${
                    selected.classification === 'Normal'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {selected.classification ?? '-'}
                </span>
              </div>
              <div>
                Confidence:{' '}
                <span className="font-semibold">
                  {selected.confidence
                    ? (selected.confidence * 100).toFixed(0) + '%'
                    : '-'}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-1">Notes</h4>
              <p className="text-gray-700 whitespace-pre-line">
                {selected.notes || 'No notes available.'}
              </p>
            </div>
          </>
        ) : (
          <div className="text-gray-500 text-center py-10">
            Select a record to view details
          </div>
        )}
      </div>

      {/* Bottom right-aligned button */}
      <div className="mt-4 flex justify-end">
        <button onClick={handleViewLeads} className="bg-hearteye_orange text-white text-sm-b px-4 py-2 rounded hover:bg-yellow-500 transition">
          View all leads
        </button>
      </div>
    </div>
  );
};

export default ECGAnalysisPanel;
