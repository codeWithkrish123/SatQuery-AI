import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Radio, ShieldCheck, Cpu, Layers } from 'lucide-react';

const carouselSlides = [
  {
    id: 1,
    tag: 'SENTINEL-2 MULTISPECTRAL',
    title: '10m Resolution Surface Monitoring',
    description: 'High-revisit multispectral optical constellation delivering systematic coverage of global land surfaces, coastal zones, and flood basins.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    spec1: '10m GSD (RGB/NIR)',
    spec2: '5-Day Revisit'
  },
  {
    id: 2,
    tag: 'C-BAND SYNTHETIC APERTURE RADAR',
    title: 'All-Weather Cloud-Penetrating Radar',
    description: 'Day-and-night SAR interferometry mapping land deformation, shoreline shifts, and inundated flood corridors through dense cloud cover.',
    image: 'https://images.unsplash.com/photo-1517976547714-720226b864c1?w=1200&auto=format&fit=crop&q=80',
    spec1: 'C-Band 5.405 GHz',
    spec2: '0% Cloud Interference'
  },
  {
    id: 3,
    tag: 'CARTOSAT-3 SUB-METER',
    title: '0.28m High-Agility Panchromatic',
    description: 'Sub-meter panchromatic and 1.12m multispectral imaging for fine-grained infrastructure telemetry and glacial lake hazard assessment.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    spec1: '0.28m Pan GSD',
    spec2: '509 km Altitude'
  },
  {
    id: 4,
    tag: '3D VISION & RAG FUSION',
    title: 'Evidence-Grounded Satellite AI',
    description: 'Qwen2-VL vision model fused with ISRO and Copernicus authoritative catalogs to eliminate non-existent spectral hallucinations.',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80',
    spec1: '98.4% Confidence',
    spec2: 'Zero Hallucination'
  }
];

export default function AuthVisualCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % carouselSlides.length);
  };

  const activeSlide = carouselSlides[currentIndex];

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-slate-950 p-8 md:p-12 text-white">
      {/* 3D Dynamic Image Background Stage */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0, scale: 1.1, rotateY: 5 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.95, rotateY: -5 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 z-0 overflow-hidden"
          style={{ perspective: 1000 }}
        >
          <img
            src={activeSlide.image}
            alt={activeSlide.title}
            className="h-full w-full object-cover object-center filter brightness-[0.65] contrast-[1.1]"
          />
          {/* Futuristic Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/40" />
          {/* Blueprint Grid Accent overlay */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 163, 166, 0.4) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Top Brand Tag & Live Status Pill */}
      <div className="relative z-10 flex items-center justify-between font-mono">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#00A3A6] bg-[#00A3A6]/20 text-white font-bold">
            SQ
          </div>
          <div>
            <span className="font-sans text-base font-extrabold tracking-tight">SatQuery<span className="text-[#00A3A6]">AI</span></span>
            <span className="block text-[9px] text-slate-400 tracking-wider">EARTH OBSERVATION NODE</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 rounded-full border border-[#00A3A6]/40 bg-slate-900/80 px-3 py-1 text-[10px] font-bold text-[#00A3A6] backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-[#00A3A6] animate-pulse"></span>
          <span>ORBITAL TELEMETRY</span>
        </div>
      </div>

      {/* Center Slide Information Content */}
      <div className="relative z-10 space-y-4 max-w-lg my-auto pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center space-x-2 rounded-md border border-[#00A3A6]/40 bg-[#00A3A6]/15 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-[#00A3A6]">
              <Radio className="h-3 w-3" />
              <span>// {activeSlide.tag}</span>
            </div>

            <h2 className="font-serif text-3xl font-normal leading-tight tracking-tight text-white md:text-4xl">
              {activeSlide.title}
            </h2>

            <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed">
              {activeSlide.description}
            </p>

            {/* Spec Badges */}
            <div className="flex flex-wrap gap-2 pt-2 font-mono text-[11px]">
              <span className="rounded-md border border-slate-700 bg-slate-900/80 px-3 py-1 font-bold text-slate-200 backdrop-blur-sm">
                🛰️ {activeSlide.spec1}
              </span>
              <span className="rounded-md border border-[#00A3A6]/30 bg-[#00A3A6]/20 px-3 py-1 font-bold text-[#00A3A6] backdrop-blur-sm">
                ⚡ {activeSlide.spec2}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls & Slide Indicators */}
      <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-6 font-mono text-xs">
        {/* Slide Counter & Dots */}
        <div className="flex items-center space-x-4">
          <span className="font-bold text-[#00A3A6]">
            0{currentIndex + 1} <span className="text-slate-600">/ 0{carouselSlides.length}</span>
          </span>

          <div className="flex space-x-1.5">
            {carouselSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-6 bg-[#00A3A6]' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrev}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-slate-300 transition-colors hover:border-[#00A3A6] hover:bg-[#00A3A6] hover:text-white"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-slate-300 transition-colors hover:border-[#00A3A6] hover:bg-[#00A3A6] hover:text-white"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
