import React, { useState, useEffect } from 'react';
import { Radio, Scan, Layers, MapPin, Satellite, Activity } from 'lucide-react';

export default function SatellitePreviewCard() {
  const [bandIndex, setBandIndex] = useState(0);
  const bands = ['OPTICAL (RGB)', 'INFRARED (NIR)', 'NDWI MASK', 'SAR RADAR'];

  useEffect(() => {
    const interval = setInterval(() => {
      setBandIndex((prev) => (prev + 1) % bands.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full min-h-[320px] bg-slate-900 border border-slate-200 rounded-xl overflow-hidden relative font-mono text-xs flex flex-col justify-between p-4 shadow-inner">
      {/* Background Satellite Texture */}
      <div className="absolute inset-0 opacity-40 mix-blend-luminosity pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60"
          alt="Satellite Tile"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blueprint"></div>
      </div>

      {/* Top Telemetry Header */}
      <div className="relative z-10 flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 text-white">
        <div className="flex items-center space-x-2">
          <Satellite className="w-4 h-4 text-[#00A3A6]" />
          <span className="font-bold tracking-wider text-[11px]">EOS-04 // LISS-IV ORBITAL PASS</span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-[#00A3A6]">
          <span className="w-2 h-2 rounded-full bg-[#00A3A6] animate-ping"></span>
          <span>LIVE SENSOR FEED</span>
        </div>
      </div>

      {/* Crosshair & Sensor Scan Grid */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center space-y-3 py-6">
        <div className="relative w-36 h-36 border border-[#00A3A6]/40 rounded-full flex items-center justify-center bg-[#00A3A6]/5">
          <div className="absolute inset-0 border border-dashed border-[#00A3A6]/30 rounded-full animate-spin-slow"></div>
          <Scan className="w-10 h-10 text-[#00A3A6] animate-pulse" />
          {/* Crosshair Corner Marks */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00A3A6]"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00A3A6]"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#00A3A6]"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00A3A6]"></div>
        </div>

        <div className="bg-slate-950/90 backdrop-blur-md border border-[#00A3A6]/30 px-3 py-1 rounded text-[10px] text-[#00A3A6] font-bold tracking-wider">
          SPECTRAL MODE: {bands[bandIndex]}
        </div>
      </div>

      {/* Bottom Coordinates Status */}
      <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-300 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded border border-white/10">
        <div className="flex items-center space-x-1.5">
          <MapPin className="w-3 h-3 text-[#00A3A6]" />
          <span>34.6863° N, 77.5673° E</span>
        </div>
        <div className="text-slate-400">
          RES: <span className="text-white font-bold">0.25m</span>
        </div>
      </div>
    </div>
  );
}
