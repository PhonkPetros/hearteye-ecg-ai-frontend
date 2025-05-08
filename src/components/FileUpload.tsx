import React, { useRef, ChangeEvent, DragEvent } from 'react';

interface FileUploadProps {
  onUpload: (file: File) => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  return (
    <div
      className="border-2 border-dashed p-6 text-center hover:bg-gray-50"
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <p className="text-gray-500">Drag & drop ECG ZIP, or click to select.</p>
      <input
        ref={inputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
