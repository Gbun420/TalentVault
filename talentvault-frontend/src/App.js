import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Candidates from './pages/Candidates';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const App = () => (
  <Routes>
    <Route element={<DashboardLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="jobs" element={<Jobs />} />
      <Route path="candidates" element={<Candidates />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="settings" element={<Settings />} />
    </Route>
    <Route path="/home" element={<Navigate to="/" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
