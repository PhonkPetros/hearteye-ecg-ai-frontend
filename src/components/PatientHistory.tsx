import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  compact?: boolean;  // <-- added prop to toggle compact mode
}

const genderDisplay = (gender: string | undefined) => {
  if (!gender) return 'Other';
  const g = gender.toLowerCase();
  if (g === 'm' || g === 'male') return 'Male';
  if (g === 'f' || g === 'female') return 'Female';
  return 'Other';
};

const classificationColor = (classification?: string | null) => {
  if (!classification || classification.toLowerCase() === 'unknown') return 'text-black';
  if (classification.toLowerCase() === 'normal') return 'text-green-600';
  if (classification.toLowerCase() === 'abnormal') return 'text-red-600'
  return 'text-red-600';
};


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
  compact = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between mb-2">
        {compact ? (
          <h3 className="font-semibold">Patient History</h3>
        ) : (
          <div />  // Empty div to keep spacing when heading is hidden
        )}
        <div className="flex gap-2 items-center">
          <button
            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="text-xs">{page} / {totalPages || 1}</span>
          <button
            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>

      {historyLoading ? (
        <div className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>Loading...</div>
      ) : historyError ? (
        <div className={`text-red-600 ${compact ? 'text-xs' : 'text-sm'}`}>{historyError}</div>
      ) : (
        <ul className={`flex-1 divide-y divide-gray-100 mb-2 overflow-y-auto`}>
          {paginatedHistory.map((item) => (
            <li
              key={item.fileId}
              className={`flex items-center gap-x-4 py-2 px-2 cursor-pointer hover:bg-gray-100 rounded ${
                selected?.fileId === item.fileId ? 'bg-indigo-50' : ''
              }`}
              onClick={() => onSelectRecord(item.fileId)}
            >
              {/* Patient Name */}
              <div
                className={`truncate ${
                  compact ? 'min-w-[120px] max-w-[40%]' : 'min-w-[140px] max-w-[25%]'
                } ${compact ? 'text-s font-medium' : 'text-sm font-medium'}`}
              >
                {item.patientName || 'Unknown'}
              </div>

              {compact ? (
                <>
                  {/* Date */}
                  <div className="min-w-[120px] max-w-[40%] truncate text-xs font-normal text-gray-500">
                    {new Date(item.date).toLocaleString()}
                  </div>

                  {/* Classification */}
                  <div
                    className={`min-w-[60px] max-w-[15%] truncate text-sm font-normal ${classificationColor(item.classification)}`}
                  >
                    {item.classification || 'Unknown'}
                  </div>
                </>
              ) : (
                <>
                  {/* File ID */}
                  <div className="min-w-[120px] max-w-[20%] truncate text-sm font-normal text-gray-700">
                    {item.fileId}
                  </div>

                  {/* Date */}
                  <div className="min-w-[150px] max-w-[25%] truncate text-sm font-normal text-gray-500">
                    {new Date(item.date).toLocaleString()}
                  </div>

                  {/* Age */}
                  <div className="min-w-[50px] max-w-[8%] truncate text-sm font-normal text-gray-700">
                    {item.age !== undefined && item.age !== null ? item.age : '—'}
                  </div>

                  {/* Gender */}
                  <div className="min-w-[70px] max-w-[12%] truncate text-sm font-normal text-gray-700">
                    {genderDisplay(item.gender)}
                  </div>

                  {/* Classification */}
                  <div
                    className={`min-w-[80px] max-w-[15%] truncate text-sm font-normal ${
                      classificationColor(item.classification)
                    }`}
                  >
                    {item.classification || 'Unknown'}
                  </div>
                </>
              )}

              {/* Arrow button as Link */}
              <div className="flex-shrink-0 w-8 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/ecg/${item.fileId}/leads`);
                  }}
                  className={`p-1 rounded hover:bg-yellow-100 focus:outline-none text-hearteye_orange rounded-full hover:text-yellow-500 ${
                    compact ? 'w-6 h-6' : 'w-8 h-8'
                  }`}
                  aria-label={`View details of ${item.fileId}`}
                >
                  <svg
                    className={compact ? 'w-5 h-5' : 'w-6 h-6'}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientHistory;
