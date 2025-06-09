import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthWatcher from "./components/AuthWatcher";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./screens/Dashboard";
import ECGLeadsView from "./screens/ECGLeadsView";
import HistoryView from "./screens/HistoryView";
import Login from "./screens/Login";
import Register from "./screens/Register";

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
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Layout>
                <HistoryView />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ecg/:id/leads"
          element={
            <ProtectedRoute>
              <Layout>
                <ECGLeadsView />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
