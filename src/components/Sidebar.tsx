import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => (
  <aside className="w-56 bg-hearteye_orange flex flex-col text-white py-8 px-4 h-full">
    <nav className="flex flex-col gap-4">
      <Link 
        to="/" 
        className="font-semibold bg-white/20 rounded px-3 py-2"
      >
        Dashboard
      </Link>
      <Link 
        to="/history" 
        className="font-semibold hover:bg-white/10 rounded px-3 py-2"
      >
        History
      </Link>
    </nav>
  </aside>
);

export default Sidebar; 