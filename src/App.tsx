import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import DetailView from './screens/DetailView';
import HistoryView from './screens/HistoryView';
import Login from './screens/Login';
import Register from './screens/Register';
import ProtectedRoute from './components/ProtectedRoute';

export type RootRoutes = {
  Dashboard: undefined;
  DetailView: { id: string };
  HistoryView: undefined;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/ecg/:id" element={
          <ProtectedRoute>
            <DetailView />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <HistoryView />
          </ProtectedRoute>
        } />

        {/* Redirect to dashboard if authenticated, otherwise to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
