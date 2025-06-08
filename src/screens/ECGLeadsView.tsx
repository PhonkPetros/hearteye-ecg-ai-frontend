import React, { useEffect, useState } from 'react';
import LeadsPlotView from '../components/ECGLeadsPlot';
import { useParams } from 'react-router-dom';
import ecgService, { CleanedLeadsResponse } from '../services/ecgService';

export default function ECGLeadsView() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CleanedLeadsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ecgService.getCleanedLeads(id)
      .then((response) => {
        setData(response);
        setError(null);
        setNotesDraft(response.notes || '');
      })
      .catch(() => setError('Failed to load lead signals'))
      .finally(() => setLoading(false));
  }, [id]);

  async function saveNotes() {
    if (!id) return;
    try {
      await ecgService.updateNotes(id, notesDraft);
      setData((prev) => prev ? { ...prev, notes: notesDraft } : prev);
      setIsEditingNotes(false);
    } catch {
      alert('Failed to save notes');
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">{id}</h1>

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

      {/* Result and Confidence */}
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

      {/* Notes Section */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-gray-700">Notes</h4>
          {!isEditingNotes && (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="text-blue-600 hover:underline text-xs flex items-center gap-1"
              aria-label="Edit notes"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              className="w-full border rounded p-2 text-sm"
              rows={5}
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={saveNotes}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setNotesDraft(data.notes || '');
                  setIsEditingNotes(false);
                }}
                className="bg-gray-300 px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-700 whitespace-pre-line">{data.notes || 'No notes available.'}</p>
        )}
      </div>

      {/* ECG plot component */}
      <LeadsPlotView data={data} />
    </main>
  );
}
