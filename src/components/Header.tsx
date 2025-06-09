import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleOpen = () => setOpen((o) => !o);

  return (
    <header className="flex items-center justify-between px-4 py-4 border-b bg-white relative z-30">
      {/* Logo on the left */}
      <div>
        <Link to="/">
          <img
            src="/LogoHeader.png"
            alt="HeartEye Logo"
            className="h-8 cursor-pointer"
          />
        </Link>
      </div>

      {/* User profile on the right */}
      <div className="flex items-center gap-2 relative" ref={ref}>
        <button
          aria-haspopup="true"
          aria-expanded={open}
          onClick={toggleOpen}
          className="flex items-center gap-1 focus:outline-none"
          aria-label="User menu"
        >
          <span className="text-2xl text-gray-500 select-none">👤</span>
          <span className="font-medium">{userName}</span>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-16 w-32 bg-white border rounded shadow z-10">
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
