import React, { useRef, useState, ChangeEvent, DragEvent, useEffect } from 'react';

interface UploadData {
  file: File;
  patientName: string;
  age: number | null;
  gender: string;
}

interface FileUploadProps {
  onUpload: (data: UploadData) => void;
  uploading: boolean;
  uploadError?: string | null;
  uploadSuccess?: string | null;
}

export default function FileUpload({ onUpload, uploading, uploadError, uploadSuccess }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState('');

  useEffect(() => {
    if (uploadSuccess) {
      setFile(null);
      setPatientName('');
      setAge(null);
      setGender('');
    }
  }, [uploadSuccess]);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
  };

  const handleUploadClick = () => {
    if (file) {
      onUpload({ file, patientName, age, gender });
    }
  };

  return (
    <div>
       {/* File upload box */}
      <div
        className={`border-2 border-dashed p-8 text-center cursor-pointer rounded mb-4 ${uploadError ? 'border-red-400' : 'border-gray-300'} hover:bg-gray-50`}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-gray-500">
          {file ? `Selected file: ${file.name}` : 'Drag & drop ECG ZIP, or click to select.'}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>

      {/* Patient Info Inputs */}
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={e => setPatientName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          disabled={uploading}
        />
        <input
          type="number"
          placeholder="Age"
          value={age !== null ? age : ''}
          onChange={e => setAge(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full border rounded px-3 py-2"
          min={0}
          max={105}
          disabled={uploading}
        />
        <select
          value={gender}
          onChange={e => setGender(e.target.value)}
          className="w-full border rounded px-3 py-2"
          disabled={uploading}
        >
          <option value="">Select Gender</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
          <option value="O">Other</option>
        </select>
      </div>

      {/* Messages container */}
      <div className="mt-4 mb-3 min-h-[1.rem] flex items-center justify-center">
        {uploadSuccess && (
          <p className="text-green-600 text-sm font-medium">{uploadSuccess}</p>
        )}
        {uploadError && (
          <p className="text-red-600 text-sm font-medium">{uploadError}</p>
        )}
      </div>

      {/* Upload button */}
      <button
        className="w-full bg-hearteye_orange hover:bg-yellow-500 text-white font-semibold py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleUploadClick}
        disabled={uploading || !file || !patientName || age === null || !gender}
        type="button"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
