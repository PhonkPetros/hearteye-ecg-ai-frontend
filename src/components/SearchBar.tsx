import React, { useState, FormEvent } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [q, setQ] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(q);
  };

  return (
    <form onSubmit={submit} className="mt-4 flex">
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search ECG..."
        className="flex-grow border px-4 py-2 rounded-l-md"
      />
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-r-md">
        Go
      </button>
    </form>
  );
}
