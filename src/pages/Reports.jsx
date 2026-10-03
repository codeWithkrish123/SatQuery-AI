import React, { useState, useEffect } from 'react';
import { BarChart3, Download, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { API_BASE_URL } from '../config/api';

export default function Reports() {
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/reports`)
      .then(res => res.json())
      .then(data => {
        if (data.data) setReportData(data.data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleExportPDF = () => {
    window.open(`${API_BASE_URL}/api/reports/pdf`, '_blank');
  };

  return (
    <div className="aerospace-page mx-auto max-w-7xl space-y-8 p-6 font-sans md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="mission-label">
            // ANALYSIS OUTPUTS
          </p>
          <h1 className="mt-1 font-serif text-4xl font-normal tracking-tight text-slate-900 md:text-5xl">
            Temporal Reports
          </h1>
        </div>

        <button
          onClick={handleExportPDF}
          className="mission-button flex items-center space-x-2 bg-[#00A3A6] px-5 py-3 font-mono text-xs font-bold text-white"
        >
          <Download className="w-4 h-4" />
          <span>-&gt; Export PDF Report</span>
        </button>
      </div>

      {/* Main Bar Chart Section */}
      <div className="glass-panel space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
          <div>
            <p className="text-xs text-[#00A3A6] font-semibold">// TEMPORAL TREND ANALYSIS</p>
            <h2 className="text-xl font-bold text-slate-900 font-sans">{reportData?.title || 'WATER EXTENT / LAST 30 DAYS'}</h2>
            <p className="text-xs text-slate-400">{reportData?.period || '14 AUG 2026 - 12 SEP 2026'}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="border border-[#00A3A6]/30 bg-[#E6F4F1] p-3 text-right">
              <span className="text-[10px] text-slate-500 block">TOTAL EXPANSION</span>
              <span className="text-lg font-bold text-[#00A3A6]">{reportData?.expansionHa || '+18.6'} ha</span>
            </div>
            <div className="border border-slate-200 bg-slate-50 p-3 text-right">
              <span className="text-[10px] text-slate-500 block">GROWTH RATE</span>
              <span className="text-lg font-bold text-slate-900">{reportData?.percentageGrowth || '+14.2%'}</span>
            </div>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-72 w-full pt-4 font-mono">
          {reportData?.timeline && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#00A3A6', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#00A3A6' }}
                />
                <Bar dataKey="extent" fill="#00A3A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        {reportData?.highlights?.map((hl, idx) => (
          <div key={idx} className="glass-card space-y-2 p-5">
            <div className="flex items-center space-x-2 text-[#00A3A6]">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold">// KEY FINDING 0{idx + 1}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">{hl}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
