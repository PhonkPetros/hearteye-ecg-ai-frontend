import React, { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  userName: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b bg-white relative">
      <div></div>
      <div className="flex items-center gap-2 relative" ref={ref}>
        <span className="text-2xl text-gray-500 cursor-pointer" onClick={() => setOpen(o => !o)}>👤</span>
        <span className="font-medium cursor-pointer" onClick={() => setOpen(o => !o)}>{userName}</span>
        <svg className="w-4 h-4 ml-1 text-gray-400 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" onClick={() => setOpen(o => !o)}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        {open && (
          <div className="absolute right-0 mt-10 w-32 bg-white border rounded shadow z-10">
            <button
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 