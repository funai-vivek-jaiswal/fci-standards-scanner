import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import RunScan from './pages/RunScan';
import Findings from './pages/Findings';
import FindingDetail from './pages/FindingDetail';
import History from './pages/History';
import Rules from './pages/Rules';
import Setup from './pages/Setup';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <div className="main-area">
          <Topbar />
          <div className="page-content">
            <Routes>
              <Route path="/"              element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"     element={<Dashboard />} />
              <Route path="/scan"          element={<RunScan />} />
              <Route path="/findings"      element={<Findings />} />
              <Route path="/findings/:id"  element={<FindingDetail />} />
              <Route path="/history"       element={<History />} />
              <Route path="/rules"         element={<Rules />} />
              <Route path="/setup"         element={<Setup />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
