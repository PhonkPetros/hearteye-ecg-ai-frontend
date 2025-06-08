import React from 'react';
import { ECGRecord } from '../services/ecgService';

interface PatientHistoryProps {
  history: ECGRecord[];
  historyLoading: boolean;
  historyError: string | null;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  paginatedHistory: ECGRecord[];
  selected: ECGRecord | null;
  onSelectRecord: (fileId: string) => void;
}

const PatientHistory: React.FC<PatientHistoryProps> = ({
  history,
  historyLoading,
  historyError,
  page,
  setPage,
  totalPages,
  paginatedHistory,
  selected,
  onSelectRecord,
}) => {
  return (
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
              className={`flex items-center justify-between py-2 cursor-pointer hover:bg-gray-100 rounded ${
                selected?.fileId === item.fileId ? 'bg-indigo-50' : ''
              }`}
              onClick={() => onSelectRecord(item.fileId)}
            >
              <span className="font-medium">{item.patientName || item.fileId}</span>
              <span className="text-xs text-gray-500">{new Date(item.date).toLocaleString()}</span>
              <span
                className={`text-xs font-semibold ${
                  item.classification === 'Normal' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.classification || ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientHistory;
