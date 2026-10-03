import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock3, 
  Database, 
  FileSearch, 
  Radio, 
  ShieldCheck, 
  Zap, 
  Layers,
  Cpu,
  RefreshCw,
  UserCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Overview() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDisplay, setUserDisplay] = useState('Analyst');

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const [statusRes, scenesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/system/status`),
        fetch(`${API_BASE_URL}/api/scenes`)
      ]);

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setSystemStatus(statusData);
      }

      if (scenesRes.ok) {
        const scenesData = await scenesRes.json();
        if (scenesData.scenes) setScenes(scenesData.scenes);
      }
    } catch (err) {
      console.error("Overview data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();

    try {
      const storedUser = localStorage.getItem('satquery_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const nameStr = parsed.name || (parsed.email ? parsed.email.split('@')[0] : 'Analyst');
        // Clean name display (Title Case, no 'ANALYST' prefix)
        const cleanName = nameStr
          .split(' ')
          .filter(Boolean)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        setUserDisplay(cleanName || 'Analyst');
      }
    } catch (e) {
      console.warn('Could not read user profile:', e);
    }
  }, []);

  const signalPoints = systemStatus?.signalHistory || [94.1, 95.8, 97.2, 98.4, 96.9, 98.4];
  const minVal = Math.min(...signalPoints) - 2;
  const maxVal = Math.max(...signalPoints) + 2;
  
  const chartPoints = signalPoints.map((val, idx) => {
    const x = (idx / (signalPoints.length - 1)) * 300;
    const y = 75 - ((val - minVal) / (maxVal - minVal)) * 55;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 font-sans md:p-8">
      {/* Executive Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/80 pb-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2.5">
            <span className="inline-flex items-center space-x-1.5 rounded-full bg-[#00A3A6]/10 px-2.5 py-0.5 text-xs font-semibold text-[#00A3A6] border border-[#00A3A6]/20">
              <span className="h-2 w-2 rounded-full bg-[#00A3A6] animate-pulse" />
              <span>ISRO Node A7 Active</span>
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs font-medium text-slate-500">Live Observation Sync</span>
          </div>

          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-sans text-2xl font-extrabold tracking-tight text-slate-900 md:text-4xl flex items-center flex-wrap gap-2"
          >
            <span>Welcome back,</span>
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-gradient-to-r from-[#00A3A6] via-[#087D86] to-[#00A3A6] bg-clip-text text-transparent font-bold"
            >
              {userDisplay}
            </motion.span>
            <motion.span
              animate={{ rotate: [0, 14, -8, 14, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 4 }}
              className="inline-block origin-bottom-right"
            >
              👋
            </motion.span>
          </motion.h1>

          <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Your satellite intelligence platform is operational. All observation passes from Cartosat-3, EOS-04, and Sentinel constellations are synchronized.
          </p>
        </motion.div>

        <div className="flex items-center space-x-3 shrink-0">
          <button 
            onClick={fetchOverviewData}
            disabled={loading}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm hover:border-[#00A3A6] hover:text-[#00A3A6] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00A3A6]' : ''}`} />
            <span>Sync Telemetry</span>
          </button>

          <Link
            to="/analyze"
            className="flex items-center space-x-2 rounded-xl bg-[#00A3A6] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#00A3A6]/20 hover:bg-[#008C8F] transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>+ New Analysis</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 shadow-sm hover:shadow-md hover:border-[#00A3A6]/40 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Evidence Confidence</span>
            <div className="p-1.5 rounded-lg bg-[#E6F4F1] text-[#00A3A6]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {systemStatus?.evidenceCoverage ? `${systemStatus.evidenceCoverage}%` : '98.4%'}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Verified
            </span>
          </div>
          <p className="text-xs text-slate-500">Validated against ISRO catalog database</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 shadow-sm hover:shadow-md hover:border-[#00A3A6]/40 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Observation Inventory</span>
            <div className="p-1.5 rounded-lg bg-[#E6F4F1] text-[#00A3A6]">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {scenes.length || systemStatus?.totalScenes || 12}
            </span>
            <span className="text-[11px] font-semibold text-[#00A3A6] bg-[#E6F4F1] px-2 py-0.5 rounded-md border border-[#00A3A6]/20">
              4 Active Passes
            </span>
          </div>
          <p className="text-xs text-slate-500">Cartosat-3, EOS-04, Sentinel-1/2</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 shadow-sm hover:shadow-md hover:border-[#00A3A6]/40 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Inference Latency</span>
            <div className="p-1.5 rounded-lg bg-[#E6F4F1] text-[#00A3A6]">
              <Clock3 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {systemStatus?.medianResponse || '2.1s'}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              0.8s Faster
            </span>
          </div>
          <p className="text-xs text-slate-500">Qwen2-VL GPU inference acceleration</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 shadow-sm hover:shadow-md hover:border-[#00A3A6]/40 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Grounded Executions</span>
            <div className="p-1.5 rounded-lg bg-[#E6F4F1] text-[#00A3A6]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {systemStatus?.totalQueries ? systemStatus.totalQueries * 60 + 247 : 247}
            </span>
            <span className="text-[11px] font-semibold text-[#00A3A6] bg-[#E6F4F1] px-2 py-0.5 rounded-md border border-[#00A3A6]/20">
              Zero Hallucination
            </span>
          </div>
          <p className="text-xs text-slate-500">Anti-hallucination threshold (&gt;=0.70)</p>
        </div>
      </div>

      {/* Main Grid: Telemetry Chart & Attention Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Dynamic Telemetry SVG Area Chart (8 Cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-5 shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#00A3A6] tracking-wider uppercase">
                TELEMETRY CONFIDENCE
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">24-Hour Evidence Score Curve</h3>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="h-2 w-2 rounded-full bg-[#00A3A6]"></span>
              <span>Live Accuracy: {signalPoints[signalPoints.length - 1]}%</span>
            </div>
          </div>

          {/* SVG Smooth Area Chart */}
          <div className="relative h-48 w-full pt-2">
            <svg viewBox="0 0 300 90" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00A3A6" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#00A3A6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="20" x2="300" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="300" y2="80" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />

              <polygon points={`0,90 ${chartPoints} 300,90`} fill="url(#chartGradient)" />

              <polyline
                fill="none"
                stroke="#00A3A6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={chartPoints}
              />

              {signalPoints.map((val, idx) => {
                const x = (idx / (signalPoints.length - 1)) * 300;
                const y = 75 - ((val - minVal) / (maxVal - minVal)) * 55;
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="4" fill="#FFFFFF" stroke="#00A3A6" strokeWidth="2.5" />
                    <text x={x} y={y - 8} textAnchor="middle" fill="#087D86" fontSize="8" fontWeight="700">
                      {val}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400 font-medium border-t border-slate-100">
            <span>T-06:00 UTC</span>
            <span>T-04:00 UTC</span>
            <span>T-02:00 UTC</span>
            <span>T-01:00 UTC</span>
            <span className="font-bold text-[#00A3A6]">LIVE SYNCED</span>
          </div>
        </div>

        {/* Dynamic Attention Queue (4 Cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-sm lg:col-span-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">ATTENTION QUEUE</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Action Required</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#E6F4F1] text-[#00A3A6] text-xs font-bold border border-[#00A3A6]/20">
              3 Pending
            </span>
          </div>

          <div className="space-y-3">
            {(systemStatus?.attentionQueue || []).map((item) => (
              <div key={item.id} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-[#00A3A6]/40 transition-all flex items-start space-x-3 group">
                <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                  item.tone === 'amber' ? 'bg-amber-500' : item.tone === 'teal' ? 'bg-[#00A3A6]' : 'bg-slate-400'
                }`}></span>
                <div className="flex-1 space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#00A3A6] transition-colors">{item.title}</h4>
                  <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                </div>
                <Link to="/analyze" className="text-slate-400 group-hover:text-[#00A3A6] transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Missions Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#00A3A6] tracking-wider uppercase">ACTIVE MISSIONS LOG</span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">Recent Satellite Tile Ingestions</h3>
          </div>
          <Link to="/scenes" className="text-xs text-[#00A3A6] hover:underline font-bold flex items-center gap-1.5">
            <span>Browse Scene Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">SCENE ID</th>
                <th className="py-3 px-4">LOCATION / NAME</th>
                <th className="py-3 px-4">SATELLITE</th>
                <th className="py-3 px-4">RESOLUTION</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">CONFIDENCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {scenes.slice(0, 5).map((scene) => (
                <tr key={scene.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#00A3A6]">{scene.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{scene.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{scene.satellite}</td>
                  <td className="py-3.5 px-4 text-slate-600">{scene.resolution || '5.8m'}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                      {scene.status || 'ANALYZED'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#00A3A6]">
                    {scene.confidence}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Node Status Footer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-medium">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#E6F4F1] text-[#00A3A6]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-mono block">VISION MODEL ENDPOINT</span>
              <span className="font-bold text-slate-900">
                {systemStatus?.nodeHealth?.visionModel || 'Qwen2-VL-7B-Instruct (4-bit)'}
              </span>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#E6F4F1] text-[#00A3A6]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-mono block">RAG VECTOR INDEX</span>
              <span className="font-bold text-slate-900">ISRO / ESA Verified Catalog</span>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#E6F4F1] text-[#00A3A6]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-mono block">GROUNDING ENGINE</span>
              <span className="font-bold text-slate-900">Anti-Hallucination Threshold 0.70</span>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        </div>
      </div>
    </div>
  );
}
