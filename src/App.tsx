import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import DetailView from './screens/DetailView';
import HistoryView from './screens/HistoryView';
import Login from './screens/Login';

export type RootRoutes = {
  Dashboard: undefined;
  DetailView: { id: string };
  HistoryView: undefined;
  Login: undefined;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ecg/:id" element={<DetailView />} />
        <Route path="/history" element={<HistoryView />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
