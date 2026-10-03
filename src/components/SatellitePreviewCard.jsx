import React from 'react';
import { MapPin, Satellite } from 'lucide-react';

export default function SatellitePreviewCard() {
  return (
    <div className="flex h-full min-h-[320px] w-full flex-col justify-between bg-white p-5 font-mono text-xs text-slate-700">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <Satellite className="h-4 w-4 text-[#00A3A6]" />
          <span className="font-bold tracking-wide text-slate-800">EOS-04 / LISS-IV</span>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-slate-400">Preview</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
        <div className="satellite-scene" aria-label="Animated satellite orbital preview" role="img">
          <div className="scene-frame scene-frame-one" />
          <div className="scene-frame scene-frame-two" />
          <div className="scene-frame scene-frame-three" />
          <div className="planet-orbit planet-orbit-wide" />
          <div className="planet-orbit planet-orbit-tight" />
          <div className="planet" />
          <div className="satellite-object">
            <span className="satellite-panel satellite-panel-left" />
            <span className="satellite-body" />
            <span className="satellite-panel satellite-panel-right" />
          </div>
          <span className="scene-label">ORBITAL PASS / 04</span>
        </div>
        <span className="text-[10px] font-bold tracking-wider text-[#00A3A6]">INFRARED (NIR)</span>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-[10px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-[#00A3A6]" />
          <span>34.6863° N, 77.5673° E</span>
        </div>
        <span>RES: <strong className="text-slate-700">0.25m</strong></span>
      </div>
    </div>
  );
}
