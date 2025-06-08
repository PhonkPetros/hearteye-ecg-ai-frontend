import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-56 bg-hearteye_orange flex flex-col text-white py-8 px-4 h-full">
      <nav className="flex flex-col gap-4">
        <Link
          to="/"
          className={`font-semibold rounded px-3 py-2 ${
            location.pathname === '/' ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/history"
          className={`font-semibold rounded px-3 py-2 ${
            location.pathname === '/history' ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
        >
          History
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
