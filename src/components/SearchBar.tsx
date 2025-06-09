import React, { useEffect, useRef, useState } from "react";
import { ECGRecord } from "../services/ecgService";

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  suggestions: ECGRecord[];
  onSelect: (fileId: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  search,
  onSearchChange,
  suggestions,
  onSelect,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!searchBarRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((i) => Math.max(i - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        const selected = suggestions[highlightedIndex];
        onSelect(selected.fileId);
        setShowSuggestions(false);
      } else if (search.trim()) {
        // fallback to manual input
        onSelect(search.trim());
        setShowSuggestions(false);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div
      ref={searchBarRef}
      className="max-w-2xl mx-auto flex items-center space-x-2"
    >
      {/* Input + dropdown container */}
      <div className="relative flex-1">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setShowSuggestions(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder="Search ECG by ID or patient name"
          onKeyDown={handleKeyDown}
          className="w-full border border-gray-300 rounded-full px-5 py-2 text-base shadow focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        {showSuggestions && suggestions.length > 0 && (
          <ul
            className="absolute left-0 right-0 bg-white border border-gray-200 rounded-b-2xl shadow-lg z-20 max-h-56 overflow-y-auto"
            style={{ top: "calc(100% + 4px)" }}
          >
            {suggestions.map((s, i) => (
              <li
                key={s.fileId}
                className={`px-5 py-3 text-base cursor-pointer flex items-center ${
                  i === highlightedIndex
                    ? "bg-yellow-100"
                    : "hover:bg-yellow-50"
                }`}
                onMouseDown={() => {
                  onSelect(s.fileId);
                  setShowSuggestions(false);
                }}
              >
                <span className="font-medium">{s.fileId}</span>
                {s.patientName && (
                  <span className="ml-2 text-gray-500">{s.patientName}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Search button */}
      <button
        className="bg-hearteye_orange hover:bg-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow"
        type="button"
        onClick={() => {
          if (search.trim()) {
            onSelect(search.trim());
            setShowSuggestions(false);
          }
        }}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};

export default SearchBar;
