import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import HistoryView from './screens/HistoryView';
import Login from './screens/Login';
import Register from './screens/Register';
import ProtectedRoute from './components/ProtectedRoute';
import ECGLeadsView from './screens/ECGLeadsView';
import AuthWatcher from './components/AuthWatcher';

export type RootRoutes = {
  Dashboard: undefined;
  DetailView: { id: string };
  HistoryView: undefined;
};

function App() {
  return (
    <BrowserRouter>
    <AuthWatcher />
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
        <Route path="/history" element={
          <ProtectedRoute>
            <HistoryView />
          </ProtectedRoute>
        } />
        <Route path="/ecg/:id/leads" element={
          <ProtectedRoute>
            <ECGLeadsView/>
          </ProtectedRoute>
        } />
        {/* Redirect to dashboard if authenticated, otherwise to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
