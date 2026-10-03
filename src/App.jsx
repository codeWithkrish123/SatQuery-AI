import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Overview from './pages/Overview';
import Analyse from './pages/Analyse';
import Scenes from './pages/Scenes';
import Reports from './pages/Reports';
import Archive from './pages/Archive';

export default function App() {
  const location = useLocation();

  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup') {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F9FA] text-slate-800 font-sans selection:bg-[#00A3A6]/20 selection:text-[#00A3A6]">
      <Header />
      <div className="flex w-full flex-1">
        <Sidebar />
        <main className="page-reveal min-h-[calc(100vh-4rem)] w-full flex-1 overflow-y-auto bg-[#F5F9FA] pb-16 md:pb-0">
          <Routes>
            <Route path="/overview" element={<Overview />} />
            <Route path="/analyze" element={<Analyse />} />
            <Route path="/scenes" element={<Scenes />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
