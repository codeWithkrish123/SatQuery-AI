import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';

export default function Archive() {
  const [archive, setArchive] = useState([]);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('All');

  useEffect(() => {
    fetchArchive();
  }, [search, modeFilter]);

  const fetchArchive = async () => {
    try {
      const res = await fetch(`/api/archive?search=${search}&mode=${modeFilter}`);
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
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto font-sans bg-[#F8FAFC]">
      {/* Header Matching Screenshot 4 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-mono text-[#00A3A6] tracking-wider uppercase font-semibold">
            // PERSISTENT RECORD
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-normal text-slate-900 mt-1">
            Query archive
          </h1>
        </div>

        <Link
          to="/analyze"
          className="px-5 py-2.5 rounded bg-[#00A3A6] hover:bg-[#008C8F] text-white font-mono font-bold text-xs flex items-center space-x-2 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ New analysis</span>
        </Link>
      </div>

      {/* Query Archive Table Matching Screenshot 4 */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm font-mono">
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
              {archiveData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
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
