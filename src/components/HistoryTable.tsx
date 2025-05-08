import React from 'react';
import { Link } from 'react-router-dom';

interface Record {
  id: string;
  patientName: string;
  date: string;
  classification: string;
}

interface HistoryTableProps {
  records: Record[];
}

export default function HistoryTable({ records }: HistoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Patient', 'Date', 'Class', ''].map(h => (
              <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map(r => (
            <tr key={r.id} className="hover:bg-gray-100">
              <td className="px-6 py-4">{r.patientName}</td>
              <td className="px-6 py-4">{new Date(r.date).toLocaleString()}</td>
              <td className="px-6 py-4">{r.classification}</td>
              <td className="px-6 py-4">
                <Link to={`/ecg/${r.id}`} className="text-blue-600 hover:underline">
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
