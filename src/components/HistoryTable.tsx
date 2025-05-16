import React from 'react';
import { HistoryRecord } from '../services/api';

interface HistoryTableProps {
  records: HistoryRecord[];
  onSelect?: (rec: HistoryRecord) => void;
}

export default function HistoryTable({ records, onSelect }: HistoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map(r => (
            <tr
              key={r.id}
              className="hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelect?.(r)}
            >
              <td className="px-6 py-4 w-24">
                {r.plot
                  ? <img src={r.plot} alt="thumb" className="h-12 w-20 object-contain" />
                  : <span className="text-gray-400">–</span>}
              </td>
              <td className="px-6 py-4">{r.patientName}</td>
              <td className="px-6 py-4">{new Date(r.date).toLocaleString()}</td>
              <td className="px-6 py-4">{r.classification}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
