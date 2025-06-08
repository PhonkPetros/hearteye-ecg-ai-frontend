import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ECGRecord } from '../services/ecgService';

interface PatientHistoryProps {
  history: ECGRecord[];
  historyLoading: boolean;
  historyError: string | null;
  page?: number;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
  totalPages?: number;
  selected: ECGRecord | null;
  onSelectRecord: (fileId: string) => void;
  compact?: boolean;
  pageSize?: number;
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
  if (classification.toLowerCase() === 'abnormal') return 'text-red-600';
  return 'text-red-600';
};

const PatientHistory: React.FC<PatientHistoryProps> = ({
  history,
  historyLoading,
  historyError,
  page: externalPage,
  setPage: externalSetPage,
  totalPages: externalTotalPages,
  selected,
  onSelectRecord,
  compact = false,
  pageSize = 5,
}) => {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<'date' | 'patientName' | 'classification'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [internalPage, setInternalPage] = useState(1);
  const page = externalPage ?? internalPage;
  const setPage = externalSetPage ?? setInternalPage;

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      if (sortKey === 'date') {
        const aTime = new Date(a.date).getTime();
        const bTime = new Date(b.date).getTime();
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
      } else {
        const aVal = (a[sortKey] ?? '').toString().toLowerCase();
        const bVal = (b[sortKey] ?? '').toString().toLowerCase();
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
    });
  }, [history, sortKey, sortDirection]);

  const totalPages = externalTotalPages ?? Math.max(1, Math.ceil(sortedHistory.length / pageSize));

  const paginatedHistory = useMemo(() => {
    return sortedHistory.slice((page - 1) * pageSize, page * pageSize);
  }, [sortedHistory, page, pageSize]);

  const onSortKeyChange = (newKey: 'date' | 'patientName' | 'classification') => {
    if (newKey === sortKey) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(newKey);
      setSortDirection('asc');
    }
    setPage(1);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between mb-2">
        {compact ? (
          <h3 className="font-semibold">Patient History</h3>
        ) : (
          <div className="flex gap-x-4 py-2 px-2 border-b font-semibold text-gray-700 text-sm w-full">
            <div className="min-w-[140px] max-w-[25%]">Patient Name</div>
            <div className="min-w-[120px] max-w-[20%]">File ID</div>
            <div className="min-w-[150px] max-w-[25%]">Date</div>
            <div className="min-w-[50px] max-w-[8%]">Age</div>
            <div className="min-w-[70px] max-w-[12%]">Gender</div>
            <div className="min-w-[80px] max-w-[15%]">Classification</div>
            <div className="w-8" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <select
            value={sortKey}
            onChange={e => onSortKeyChange(e.target.value as any)}
            className="border px-2 py-1 rounded cursor-pointer text-xs"
            aria-label="Sort records by"
          >
            <option value="date">Sort by Date</option>
            <option value="patientName">Sort by Patient</option>
            <option value="classification">Sort by Class</option>
          </select>

          <button
            onClick={() => setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            className="border px-2 py-1 rounded text-xs min-w-[90px]"
            title="Toggle sort direction"
          >
            {sortDirection === 'asc' ? '↑ Ascending' : '↓ Descending'}
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
              <div
                className={`truncate ${
                  compact ? 'min-w-[120px] max-w-[40%]' : 'min-w-[140px] max-w-[25%]'
                } ${compact ? 'text-s font-medium' : 'text-sm font-medium'}`}
              >
                {item.patientName || 'Unknown'}
              </div>

              {compact ? (
                <>
                  <div className="min-w-[120px] max-w-[40%] truncate text-xs font-normal text-gray-500">
                    {new Date(item.date).toLocaleString()}
                  </div>

                  <div
                    className={`min-w-[60px] max-w-[15%] truncate text-sm font-normal ${classificationColor(item.classification)}`}
                  >
                    {item.classification || 'Unknown'}
                  </div>
                </>
              ) : (
                <>
                  <div className="min-w-[120px] max-w-[20%] truncate text-sm font-normal text-gray-700">
                    {item.fileId}
                  </div>

                  <div className="min-w-[150px] max-w-[25%] truncate text-sm font-normal text-gray-500">
                    {new Date(item.date).toLocaleString()}
                  </div>

                  <div className="min-w-[50px] max-w-[8%] truncate text-sm font-normal text-gray-700">
                    {item.age !== undefined && item.age !== null ? item.age : '—'}
                  </div>

                  <div className="min-w-[70px] max-w-[12%] truncate text-sm font-normal text-gray-700">
                    {genderDisplay(item.gender)}
                  </div>

                  <div
                    className={`min-w-[80px] max-w-[15%] truncate text-sm font-normal ${
                      classificationColor(item.classification)
                    }`}
                  >
                    {item.classification || 'Unknown'}
                  </div>
                </>
              )}

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

      <div className="flex items-center justify-end mt-auto">
        <button
          className="text-xs px-2 py-1 rounded bg-hearteye_orange hover:bg-yellow-500 disabled:opacity-30"
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-xs mx-2">{page} / {totalPages || 1}</span>
        <button
          className="text-xs px-2 py-1 rounded bg-hearteye_orange hover:bg-yellow-500 disabled:opacity-30"
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PatientHistory;