import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LeadsPlotView from '../components/ECGLeadsPlot';
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

    const fetchLeads = async () => {
      setLoading(true);
      try {
        const response = await ecgService.getCleanedLeads(id);
        setData(response);
        setNotesDraft(response.notes || '');
        setError(null);
      } catch (error) {
        setError('Failed to load lead signals');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [id]);

  const saveNotes = async () => {
    if (!id || !notesDraft.trim()) return;
    try {
      await ecgService.updateNotes(id, notesDraft);
      setData(prev => (prev ? { ...prev, notes: notesDraft } : prev));
      setIsEditingNotes(false);
    } catch (error) {
      alert('Failed to save notes');
    }
  };

  if (loading) return <div className="p-4 text-gray-600">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!data) return null;

  const {
    age,
    patient_name,
    gender,
    upload_date,
    intervals,
    classification,
    confidence,
    notes,
  } = data;

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">{id}</h1>

      {/* Patient Info */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
        <div>
          <div className="text-gray-500">Patient Information</div>
          <div>Age: <span className="font-medium">{age ?? '-'}</span></div>
          <div>Patient: <span className="font-medium">{patient_name ?? '-'}</span></div>
          <div>Gender: <span className="font-medium">{gender ?? '-'}</span></div>
          <div>Uploaded: <span className="font-medium">{upload_date ? new Date(upload_date).toLocaleString() : '-'}</span></div>
        </div>
        <div>
          <div className="text-gray-500">Intervals</div>
          <div>QRS: <span className="font-medium">{intervals?.qrs_duration ?? '-'}</span> ms</div>
          <div>QT: <span className="font-medium">{intervals?.qt_interval ?? '-'}</span> ms</div>
          <div>PQ: <span className="font-medium">{intervals?.pq_interval ?? '-'}</span> ms</div>
          <div>P-wave: <span className="font-medium">{intervals?.p_wave_duration ?? '-'}</span> ms</div>
        </div>
      </div>

      {/* Result and Confidence */}
      <div className="flex items-center gap-4 text-sm">
        <div>
          Result: <span className={`font-semibold ${classification === 'Normal' ? 'text-green-600' : 'text-red-600'}`}>
            {classification ?? '-'}
          </span>
        </div>
        <div>
          Confidence: <span className="font-semibold text-green-600">
            {confidence != null ? `${Math.round(confidence * 100)}%` : '-'}
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
              className="text-blue-600 hover:underline text-xs"
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
                disabled={notesDraft.trim() === (notes || '').trim()}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:bg-blue-300"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setNotesDraft(notes || '');
                  setIsEditingNotes(false);
                }}
                className="bg-gray-300 px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-700 whitespace-pre-line">
            {notes?.trim() || 'No notes available.'}
          </p>
        )}
      </div>

      {/* ECG Plot */}
      <LeadsPlotView data={data} />
    </main>
  );
}