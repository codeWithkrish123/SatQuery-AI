import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Archive() {
  const [archive, setArchive] = useState([]);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('All');

  useEffect(() => {
    fetchArchive();
  }, [search, modeFilter]);

  const fetchArchive = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/archive?search=${search}&mode=${modeFilter}`);
      const data = await res.json();
      if (data.archive) setArchive(data.archive);
    } catch (err) {
      console.error(err);
    }
  };

  const archiveData = [
    {
      code: 'S2A_20260912_T43QFB',
      name: 'Nubra Valley, Ladakh',
      date: '12 SEP 2026',
      confidence: '94.2%'
    },
    {
      code: 'RISAT_20260911_086',
      name: 'Brahmaputra floodplain',
      date: '11 SEP 2026',
      confidence: '88.7%'
    },
    {
      code: 'LISS4_20260909_241',
      name: 'Kutch coastal corridor',
      date: '09 SEP 2026',
      confidence: '76.4%'
    },
    {
      code: 'CARTOSAT_3_0926',
      name: 'Chennai peri-urban',
      date: '05 SEP 2026',
      confidence: '91.1%'
    },
    {
      code: 'OCEANSAT_3_113',
      name: 'Konkan shelf',
      date: '02 SEP 2026',
      confidence: '82.8%'
    }
  ];

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
        </div>

        <Link
          to="/analyze"
          className="mission-button flex items-center space-x-2 bg-[#00A3A6] px-5 py-3 font-mono text-xs font-bold text-white"
        >
          <Plus className="w-4 h-4" />
          <span>+ New analysis</span>
        </Link>
      </div>

      {/* Query Archive Table Matching Screenshot 4 */}
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
              {(archive.length > 0 ? archive.map(a => ({
                code: a.scene || a.id,
                name: a.location || a.query,
                date: a.acquired,
                confidence: `${a.confidence}%`
              })) : archiveData).map((item, idx) => (
                <tr key={idx} className="transition-colors hover:bg-[#F3FAFA]">
                  <td className="py-4 px-6 space-y-1">
                    <span className="text-[#00A3A6] text-[11px] block">{item.code}</span>
                    <span className="font-bold text-slate-900 text-sm font-sans block">{item.name}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-500">
                    {item.date}
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-[#00A3A6] text-xs">
                    {item.confidence}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <ArrowRight className="w-4 h-4 text-slate-400 inline-block hover:text-[#00A3A6] cursor-pointer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
