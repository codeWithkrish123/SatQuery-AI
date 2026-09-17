import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Analyse from './pages/Analyse';
import Scenes from './pages/Scenes';
import Reports from './pages/Reports';
import Archive from './pages/Archive';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-sans selection:bg-[#00A3A6]/20 selection:text-[#00A3A6]">
      <Header />
      <div className="flex flex-1 w-full">
        <Sidebar />
        <main className="flex-1 w-full bg-[#F8FAFC] overflow-y-auto min-h-[calc(100vh-3.5rem)]">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/analyze" element={<Analyse />} />
            <Route path="/scenes" element={<Scenes />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/archive" element={<Archive />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
