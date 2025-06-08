import React, { useRef, useEffect, useState } from 'react';
import { ECGRecord } from '../services/ecgService';

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  suggestions: ECGRecord[];
  onSelect: (fileId: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ search, onSearchChange, suggestions, onSelect }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (search.trim() === '') {
      setShowSuggestions(false);
    } else if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [search, suggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!searchBarRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={searchBarRef} className="relative max-w-2xl mx-auto flex items-center">
      <input
        type="text"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        onFocus={() => setShowSuggestions(suggestions.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        placeholder="Search for ECG record (ID or label)"
        className="flex-1 border border-gray-300 rounded-full px-5 py-2 text-base shadow focus:outline-none focus:ring-2 focus:ring-yellow-400"
        style={{ minWidth: 0 }}
      />
      <button
        className="ml-2 bg-hearteye_orange hover:bg-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow transition"
        onMouseDown={e => {
          e.preventDefault();
          if (suggestions.length > 0) {
            onSearchChange(suggestions[0].fileId);
            setShowSuggestions(false);
            onSelect(suggestions[0].fileId);
          }
        }}
        tabIndex={-1}
        type="button"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
      </button>
      {showSuggestions && (
        <ul className="absolute left-0 right-0 bg-white border border-gray-200 rounded-b-2xl shadow-lg z-20 mt-2 max-h-56 overflow-y-auto w-full">
          {suggestions.map(s => (
            <li
              key={s.fileId}
              className="px-5 py-3 text-base cursor-pointer hover:bg-yellow-50 flex items-center"
              onMouseDown={() => {
                onSearchChange(s.fileId);
                setShowSuggestions(false);
                onSelect(s.fileId);
              }}
            >
              <span className="font-medium">{s.fileId}</span>
              {s.patientName && <span className="ml-2 text-gray-500">{s.patientName}</span>}
            </li>
          ))}
          {suggestions.length === 0 && (
            <li className="px-5 py-3 text-base text-gray-400">No matches</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
