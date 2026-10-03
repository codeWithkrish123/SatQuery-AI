import React, { useState, useEffect } from 'react';
import { BarChart3, Download, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { API_BASE_URL } from '../config/api';

export default function Reports() {
  const [reportData, setReportData] = useState(null);

  const now = new Date();
  const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const formatDateStr = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  const dynamicPeriod = `${formatDateStr(past30)} - ${formatDateStr(now)}`;

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
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Automated sensor fusion and surface change verification
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="mission-button flex items-center space-x-2 bg-[#00A3A6] px-5 py-3 font-mono text-xs font-bold text-white shadow-sm hover:bg-[#008C8F] transition-all"
        >
          <Download className="w-4 h-4" />
          <span>-&gt; Export PDF Report</span>
        </button>
      </div>

      {/* Bi-Temporal Comparative Imagery Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
        <div className="glass-card overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[#00A3A6] text-[11px] font-semibold">// BASELINE OBSERVATION (T-0)</span>
            <span className="text-[10px] text-slate-400 font-bold">{formatDateStr(past30)}</span>
          </div>
          <div className="h-48 overflow-hidden relative bg-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=75" 
              alt="Baseline Satellite Observation"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=75';
              }}
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white">
              Cartosat-3 Optical (0.28m GSD)
            </div>
          </div>
          <div className="p-4 space-y-1">
            <h3 className="text-sm font-bold text-slate-900 font-sans">Pre-Monsoon River Basin Baseline</h3>
            <p className="text-[11px] text-slate-500 font-sans">Normal hydrological baseline reference catalogued prior to inundation.</p>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[#00A3A6] text-[11px] font-semibold">// MONITORED INUNDATION (T-1)</span>
            <span className="text-[10px] text-emerald-600 font-bold">{formatDateStr(now)}</span>
          </div>
          <div className="h-48 overflow-hidden relative bg-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=75" 
              alt="Monitored Satellite Inundation" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=75';
              }}
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-emerald-400 font-bold">
              Sentinel-1 C-SAR Radar (Cloud-Penetrating)
            </div>
          </div>
          <div className="p-4 space-y-1">
            <h3 className="text-sm font-bold text-slate-900 font-sans">Surge Inundation Perimeter</h3>
            <p className="text-[11px] text-slate-500 font-sans">Automated pixel difference verified +18.6 ha shoreline expansion with zero occlusion.</p>
          </div>
        </div>
      </div>

      {/* Main Bar Chart Section */}
      <div className="glass-panel space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
          <div>
            <p className="text-xs text-[#00A3A6] font-semibold">// TEMPORAL TREND ANALYSIS</p>
            <h2 className="text-xl font-bold text-slate-900 font-sans">{reportData?.title || 'WATER EXTENT / LAST 30 DAYS'}</h2>
            <p className="text-xs text-slate-400">{reportData?.period || dynamicPeriod}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="border border-[#00A3A6]/30 bg-[#E6F4F1] p-3 text-right rounded">
              <span className="text-[10px] text-slate-500 block">TOTAL EXPANSION</span>
              <span className="text-lg font-bold text-[#00A3A6]">{reportData?.expansionHa || '+18.6'} ha</span>
            </div>
            <div className="border border-slate-200 bg-slate-50 p-3 text-right rounded">
              <span className="text-[10px] text-slate-500 block">GROWTH RATE</span>
              <span className="text-lg font-bold text-slate-900">{reportData?.percentageGrowth || '+14.2%'}</span>
            </div>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-72 w-full pt-4 font-mono">
          {reportData?.timeline ? (
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
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Loading temporal telemetry series...
            </div>
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
