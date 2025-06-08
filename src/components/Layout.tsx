import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import authService from '../services/authService';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col h-screen">
      <Header userName={user?.username || 'Patient'} onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
