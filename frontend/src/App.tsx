import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import { apiGetAccounts, apiGetCategories, apiGetTiers } from './services/api';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ConsultationPage } from './pages/ConsultationPage';
import { ManagementPage } from './pages/ManagementPage';
import { EquilibragePage } from './pages/EquilibragePage';
import { StatisticsPage } from './pages/StatisticsPage';

const ProtectedLayout: React.FC = () => {
  const { token } = useAuthStore();
  const { setAccounts, setCategories, setTiers, reset } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    Promise.all([
      apiGetAccounts().then(setAccounts),
      apiGetCategories().then(setCategories),
      apiGetTiers().then(setTiers),
    ]).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) reset();
  }, [token]);

  if (!token) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { token } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/accounts/:id" element={<ConsultationPage />} />
          <Route path="/accounts/:id/categories" element={<ManagementPage type="categories" />} />
          <Route path="/accounts/:id/tiers" element={<ManagementPage type="tiers" />} />
          <Route path="/accounts/:id/echeances" element={<ManagementPage type="echeances" />} />
          <Route path="/equilibrage" element={<EquilibragePage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
