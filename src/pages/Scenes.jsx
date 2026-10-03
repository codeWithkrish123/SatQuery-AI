import React, { useState, useEffect } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Scenes() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [scenes, setScenes] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [newSceneName, setNewSceneName] = useState('');
  const [newSatellite, setNewSatellite] = useState('LISS-IV / EOS-04');
  const [newType, setNewType] = useState('LISS-IV');

  useEffect(() => {
    fetchScenes();
  }, [filter, search]);

  const fetchScenes = async () => {
    try {
      const url = `${API_BASE_URL}/api/scenes?category=${filter}&search=${search}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.scenes) setScenes(data.scenes);
    } catch (err) {
      console.error("Failed to fetch scenes:", err);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newSceneName);
    formData.append('satellite', newSatellite);
    formData.append('type', newType);

    try {
      const res = await fetch(`${API_BASE_URL}/api/scenes/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.scene) {
        setScenes([data.scene, ...scenes]);
        setShowUploadModal(false);
        setNewSceneName('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['All', 'Optical', 'SAR', 'LISS-IV', 'Cartosat'];

  return (
    <div className="aerospace-page mx-auto max-w-7xl space-y-8 p-6 font-sans md:p-10">
      {/* Header Matching Screenshot 1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="mission-label">
            // IMAGERY INVENTORY
          </p>
          <h1 className="mt-1 font-serif text-4xl font-normal tracking-tight text-slate-900 md:text-5xl">
            Scene library
          </h1>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="mission-button flex items-center space-x-2 bg-[#00A3A6] px-5 py-3 font-mono text-xs font-bold text-white"
        >
          <Plus className="w-4 h-4" />
          <span>+ Upload scene</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between font-mono">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3.5 py-1.5 rounded border text-xs transition-all ${
                filter === cat
                  ? 'border-[#00A3A6] bg-[#E6F4F1] font-bold text-[#00A3A6]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-[#00A3A6] hover:bg-slate-50'
              }`}
            >
              {cat === 'All' ? `All assets · ${scenes.length}` : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono text-slate-900 focus:outline-none focus:border-[#00A3A6]"
          />
        </div>
      </div>

      {/* Scene Grid Matching Screenshot 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
        {scenes.map((scene) => (
          <div key={scene.id} className="glass-card overflow-hidden">
            {/* Asset Code & Green Dot */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[#00A3A6] text-[11px] font-semibold">{scene.id}</span>
              <span className="w-2 h-2 rounded-full bg-[#00A3A6]"></span>
            </div>

            {/* Image Preview */}
            <div className="h-44 overflow-hidden relative bg-slate-100">
              <img src={scene.thumbnail} alt={scene.name} className="w-full h-full object-cover" />
            </div>

            {/* Title & Date */}
            <div className="p-4 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 font-sans">{scene.name}</h3>
              <p className="text-[11px] text-slate-400">{scene.acquired}</p>
              <div className="text-[11px] text-[#00A3A6] font-bold pt-1">
                CONFIDENCE {scene.confidence}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="glass-panel relative w-full max-w-md space-y-5 p-6 shadow-xl">
            <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">// INGEST SATELLITE SCENE</h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500">SCENE NAME / LOCATION</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunderbans Sector A"
                  value={newSceneName}
                  onChange={(e) => setNewSceneName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-[#00A3A6]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500">SATELLITE MODEL</label>
                <select
                  value={newSatellite}
                  onChange={(e) => setNewSatellite(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-[#00A3A6]"
                >
                  <option value="LISS-IV / EOS-04">LISS-IV / EOS-04</option>
                  <option value="Cartosat-3 / RISAT-1A">Cartosat-3 / RISAT-1A</option>
                  <option value="Sentinel-1 / RISAT-1">Sentinel-1 / RISAT-1</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded bg-[#00A3A6] hover:bg-[#008C8F] text-white font-bold"
              >
                INGEST TO ISRO INVENTORY
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
