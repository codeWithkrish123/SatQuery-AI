import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SatellitePreviewCard from '../components/SatellitePreviewCard';

export default function Overview() {
  const capabilities = [
    {
      title: 'Visual Q&A',
      tag: 'LIVE',
      description: 'Ask natural language questions about any satellite scene and receive evidence-grounded answers.',
    },
    {
      title: 'Change Detection',
      tag: 'LIVE',
      description: 'Quantify bi-temporal shifts between baseline and current scenes without chronology hallucinations.',
    },
    {
      title: 'Grounding',
      tag: 'LIVE',
      description: 'Detect specific geographical features with visual bounding box proof overlaid on high-res tiles.',
    },
    {
      title: 'Optical-SAR Fusion',
      tag: 'BETA',
      description: 'Cross-modal fusion combining optical RGB/NIR with cloud-penetrating Sentinel-1 SAR C-band radar.',
    },
  ];

  const recentWork = [
    {
      id: 'S2A_20260912_T43QFB',
      name: 'Nubra Valley, Ladakh',
      date: '12 SEP 2026',
      confidence: '94.2%',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=60'
    },
    {
      id: 'RISAT_20260911_086',
      name: 'Brahmaputra floodplain',
      date: '11 SEP 2026',
      confidence: '88.7%',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60'
    },
    {
      id: 'LISS4_20260909_241',
      name: 'Kutch coastal corridor',
      date: '09 SEP 2026',
      confidence: '76.4%',
      image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&auto=format&fit=crop&q=60'
    },
  ];

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto font-sans bg-[#F8FAFC]">
      {/* Top Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-slate-200 rounded-2xl p-6 md:p-8 bg-blueprint shadow-sm">
        {/* Left Hero Text */}
        <div className="lg:col-span-6 space-y-6">
          <p className="text-xs font-mono text-[#00A3A6] tracking-wider uppercase font-semibold">
            // ISRO ANALYTICS NODE · ONLINE
          </p>

          <h1 className="text-4xl md:text-6xl font-serif font-normal text-slate-900 leading-tight">
            The planet<br />
            has <span className="text-[#00A3A6]">an answer.</span>
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed max-w-md">
            Upload satellite imagery, ask a natural-language question, and receive evidence-grounded responses with traceable source signals.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/analyze"
              className="px-5 py-2.5 rounded bg-[#00A3A6] hover:bg-[#008C8F] text-white font-mono text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
            >
              <span>Open analysis suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/scenes"
              className="px-5 py-2.5 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-mono text-xs flex items-center space-x-2 transition-all shadow-sm"
            >
              <span>Browse scenes</span>
            </Link>
          </div>
        </div>

        {/* Right Satellite Sensor Card replacing Globe */}
        <div className="lg:col-span-6 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm h-[340px]">
          <SatellitePreviewCard />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-2xl font-bold text-[#00A3A6]">98.4%</div>
          <div className="text-xs text-slate-500">Evidence Coverage</div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-2xl font-bold text-slate-900">12 Assets</div>
          <div className="text-xs text-slate-500">Satellites in View</div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-2xl font-bold text-slate-900">4.6s</div>
          <div className="text-xs text-slate-500">Median Response Time</div>
        </div>
      </div>

      {/* Capabilities Section */}
      <div className="space-y-4">
        <p className="text-xs font-mono text-[#00A3A6] tracking-wider uppercase">// MULTI-MODAL CAPABILITIES</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((cap, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-[#00A3A6] transition-all">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 font-mono">{cap.title}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E6F4F1] text-[#00A3A6] font-bold">
                  {cap.tag}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{cap.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Scenes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-[#00A3A6] tracking-wider uppercase">// RECENT WORK</p>
          <Link to="/scenes" className="text-xs font-mono text-[#00A3A6] hover:underline">View all 36 scenes →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentWork.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between font-mono text-xs">
                <span className="text-[#00A3A6] text-[11px]">{item.id}</span>
                <span className="w-2 h-2 rounded-full bg-[#00A3A6]"></span>
              </div>
              <div className="h-44 overflow-hidden relative">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 space-y-2 font-mono">
                <h4 className="text-sm font-bold text-slate-900 font-sans">{item.name}</h4>
                <div className="text-[11px] text-slate-400">{item.date}</div>
                <div className="text-[11px] text-[#00A3A6] font-bold">CONFIDENCE {item.confidence}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
