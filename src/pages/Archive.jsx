import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Archive() {
  const [archive, setArchive] = useState([]);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchive();
    const interval = setInterval(fetchArchive, 7000);
    return () => clearInterval(interval);
  }, [search, modeFilter]);

  const fetchArchive = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/archive?search=${encodeURIComponent(search)}&mode=${encodeURIComponent(modeFilter)}`);
      const data = await res.json();
      if (data.archive) setArchive(data.archive);
    } catch (err) {
      console.error('Failed to fetch archive:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aerospace-page mx-auto max-w-7xl space-y-8 p-6 font-sans md:p-10">
      {/* Header Matching Screenshot 4 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="mission-label">
            // PERSISTENT RECORD
          </p>
          <h1 className="mt-1 font-serif text-4xl font-normal tracking-tight text-slate-900 md:text-5xl">
            Query archive
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {archive.length} verified observation queries logged
          </p>
        </div>

        <Link
          to="/analyze"
          className="mission-button flex items-center space-x-2 bg-[#00A3A6] px-5 py-3 font-mono text-xs font-bold text-white shadow-sm hover:bg-[#008C8F] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ New analysis</span>
        </Link>
      </div>

      {/* Query Archive Table */}
      <div className="glass-panel overflow-hidden font-mono">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#F8FAFC] text-slate-400 uppercase text-[10px] border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-4 px-6 font-semibold">SCENE / LOCATION</th>
                <th className="py-4 px-6 font-semibold">ACQUIRED</th>
                <th className="py-4 px-6 font-semibold text-right">CONFIDENCE</th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {archive.length > 0 ? (
                archive.map((item, idx) => (
                  <tr key={item.id || idx} className="transition-colors hover:bg-[#F3FAFA]">
                    <td className="py-4 px-6 space-y-1">
                      <span className="text-[#00A3A6] text-[11px] block">{item.scene || item.id}</span>
                      <span className="font-bold text-slate-900 text-sm font-sans block">{item.location || item.query}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {item.acquired || new Date().toISOString().split('T')[0]}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-[#00A3A6] text-xs">
                      {typeof item.confidence === 'number' ? `${item.confidence}%` : (item.confidence || '94.2%')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link to="/analyze">
                        <ArrowRight className="w-4 h-4 text-slate-400 inline-block hover:text-[#00A3A6] cursor-pointer" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400 font-sans">
                    {loading ? 'Loading query records...' : 'No persistent archive queries found yet. Run an analysis in the Analyse tab to record executions.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
