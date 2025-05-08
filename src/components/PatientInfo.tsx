import React from 'react';

interface PatientInfoProps {
  info: {
    name: string;
    age: number;
    gender: string;
  };
  intervals: {
    PR: number;
    QRS: number;
    QT: number;
  };
}

export default function PatientInfo({ info, intervals }: PatientInfoProps) {
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-xl font-semibold mb-2">Patient Information</h2>
      <p><strong>Name:</strong> {info.name}</p>
      <p><strong>Age:</strong> {info.age}</p>
      <p><strong>Gender:</strong> {info.gender}</p>
      
      <h3 className="text-lg font-semibold mt-4 mb-1">ECG Intervals</h3>
      <p><strong>PR Interval:</strong> {intervals.PR} ms</p>
      <p><strong>QRS Duration:</strong> {intervals.QRS} ms</p>
      <p><strong>QT Interval:</strong> {intervals.QT} ms</p>
    </div>
  );
}
