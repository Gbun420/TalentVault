import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const DashboardLayout = () => (
  <div className="tv-layout">
    <Sidebar />
    <div className="tv-main">
      <Topbar />
      <main className="tv-content">
        <Outlet />
      </main>
    </div>
  </div>
);

export default DashboardLayout;
