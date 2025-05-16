import React from 'react';

const Sidebar: React.FC = () => (
  <aside className="w-56 bg-yellow-500 flex flex-col text-white py-8 px-4 h-full">
    <div className="flex items-center mb-12">
      <img src="/logo.svg" alt="HeartEye Logo" className="h-8 mr-2" />
      <span className="font-bold text-xl">Heart<span className="text-blue-900">Eye</span></span>
    </div>
    <nav className="flex flex-col gap-4">
      <a href="#" className="font-semibold bg-white/20 rounded px-3 py-2">Dashboard</a>
      <a href="#" className="font-semibold hover:bg-white/10 rounded px-3 py-2">History</a>
    </nav>
  </aside>
);

export default Sidebar; 