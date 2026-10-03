import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  Globe,
  Layers,
  Activity,
  Compass,
  ExternalLink,
  Radio,
  Cpu,
  Eye,
  ShieldCheck,
  Search,
  X,
  Zap,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Sliders,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import EarthGlobe3D from '../components/EarthGlobe3D';
import { API_BASE_URL } from '../config/api';

const rotatingWords = [
  "Intelligence.",
  "Ground Truth.",
  "Better Decisions.",
  "Orbital Insights."
];

const missionList = [
  {
    id: 'mission-01',
    missionNo: 'MISSION 01',
    name: 'SAR-1 Radar Constellation',
    category: 'C-BAND SYNTHETIC APERTURE RADAR',
    gsd: '5m, 10m and 20m GSD',
    status: 'Operational',
    description: 'Day-and-night, all-weather radar interferometry mapping land deformation, maritime navigation corridors, and flood boundaries.',
    alt: '693 km',
    revisit: '3 days global revisit',
    image: 'https://images.unsplash.com/photo-1517976547714-720226b864c1?w=1200&auto=format&fit=crop&q=80',
    payload: 'C-SAR Active Phased Array (5.405 GHz)',
    swath: '250 km (IW Mode)'
  },
  {
    id: 'mission-02',
    missionNo: 'MISSION 02',
    name: 'OPTICA-2 Multispectral',
    category: 'HIGH-RESOLUTION PUSHBROOM RADIOMETER',
    gsd: '10m, 20m and 60m GSD',
    status: 'Operational',
    description: 'High-revisit multispectral optical constellation delivering systematic coverage of global land surfaces, littoral coastal waters, and inland waterways.',
    alt: '786 km',
    revisit: '5 days at equator',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop&q=80',
    payload: 'MSI 13-Band Pushbroom Spectrometer',
    swath: '290 km Wide Swath'
  },
  {
    id: 'mission-03',
    missionNo: 'MISSION 03',
    name: 'OCEAN-3 Topography & Thermal',
    category: 'DUAL-FREQUENCY SYNTHETIC ALTIMETER & SLSTR',
    gsd: '300m ocean color / 1km sea surface temp',
    status: 'Operational',
    description: 'Comprehensive ocean topography, wave height, sea-surface temperature, and marine ecosystem monitoring across global ocean basins.',
    alt: '814 km',
    revisit: '2 days global sea-surface coverage',
    image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200&auto=format&fit=crop&q=80',
    payload: 'OLCI + SLSTR + SRAL Dual Altimeter',
    swath: '1270 km Swath'
  },
  {
    id: 'mission-04',
    missionNo: 'MISSION 04',
    name: 'ATMOS-4 Trace Gas Spectrometer',
    category: 'ATMOSPHERIC CHEMISTRY SPECTROMETER',
    gsd: '3.5 km x 5.5 km pixel resolution',
    status: 'Operational',
    description: 'Global daily mapping of greenhouse gas concentrations, tropospheric air pollutants, methane super-emitters and aerosol plumes.',
    alt: '824 km',
    revisit: '24 h global revisit',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80',
    payload: 'TROPOMI UV-VIS-NIR-SWIR Spectrometer',
    swath: '2600 km Daily Global Coverage'
  }
];

const bandProfiles = {
  rgb: {
    title: 'Natural RGB (Bands 4-3-2)',
    coords: '28.6139° N, 77.2090° E • Natural Color (RGB 4-3-2)',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&auto=format&fit=crop&q=85',
    dataType: 'Multispectral Level-2A',
    instrument: 'MSI Pushbroom 13-Band',
    desc: 'True-color natural reflectance composite rendered directly from surface radiance calibration. Ideal for human interpretation of land cover, urban structure, and visible water bodies.'
  },
  nir: {
    title: 'False-Color NIR (Bands 8-4-3)',
    coords: '28.6139° N, 77.2090° E • Near-Infrared Vegetation (NIR 8-4-3)',
    image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1800&auto=format&fit=crop&q=85',
    dataType: 'Calibrated BOA Reflectance',
    instrument: 'MSI Pushbroom 13-Band (Band 8 842nm)',
    desc: 'Chlorophyll-sensitive near-infrared spectral synthesis. Bright crimson hues isolate dense canopy photosynthesis, agricultural health, and biomass vigor.'
  },
  swir: {
    title: 'SWIR Penetration (Bands 12-8-4)',
    coords: '28.6139° N, 77.2090° E • Shortwave Infrared (SWIR 12-8-4)',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1800&auto=format&fit=crop&q=85',
    dataType: 'Multispectral Level-2A',
    instrument: 'MSI Pushbroom 13-Band',
    desc: 'Penetrates atmospheric smoke, aerosols, and light cloud cover. Differentiates bare soil moisture, burned areas, and active volcanic thermal signatures.'
  }
};

export default function LandingPage() {
  const [activeBand, setActiveBand] = useState('swir');
  const [selectedMissionModal, setSelectedMissionModal] = useState(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolledNav, setScrolledNav] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/system/status`)
      .then((res) => res.json())
      .then((data) => setSystemStatus(data))
      .catch((err) => console.error('System status sync:', err));
  }, []);

  // Rotating text timer
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Track navbar scroll background transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolledNav(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentProfile = bandProfiles[activeBand];

  return (
    <div className="min-h-screen bg-[#F5F9FA] text-slate-800 font-sans selection:bg-[#00A3A6]/20 selection:text-[#00A3A6] overflow-x-hidden">

      {/* ---------------------------------------------------- */}
      {/* TOP NAVIGATION HEADER (Matching Overview Page Header) */}
      {/* ---------------------------------------------------- */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-7 py-3 ${scrolledNav
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm'
          : 'bg-[#050C16]/85 backdrop-blur-md border-b border-[#142335] text-white'
        }`}>
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">

          {/* Brand Logo Box matching Overview Header */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative flex h-9 w-9 flex-col items-center justify-center border border-[#00A3A6] bg-[#E6F4F1] font-mono text-[10px] font-bold leading-none text-[#00A3A6] shadow-sm">
              <span>S</span>
              <span>Q</span>
              <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-[#00A3A6] animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className={`font-sans text-base font-bold tracking-tight flex items-center gap-1.5 ${scrolledNav ? 'text-slate-900' : 'text-white'}`}>
                SatQuery<span className="text-[#00A3A6]">AI</span>
              </span>
              <span className={`font-mono text-[9px] uppercase tracking-[0.18em] ${scrolledNav ? 'text-slate-400' : 'text-slate-400'}`}>
                EARTH OBSERVATION INTELLIGENCE
              </span>
            </div>
          </Link>

          {/* Center Nav Links with smooth Framer Motion hover & scroll */}
          <nav className={`hidden lg:flex items-center gap-6 xl:gap-8 font-mono text-[11px] uppercase tracking-[0.16em] ${scrolledNav ? 'text-slate-600' : 'text-slate-300'
            }`}>
            {[
              { label: 'HOME', id: 'hero' },
              { label: 'MISSIONS', id: 'missions' },
              { label: 'DATA', id: 'data' },
              { label: 'INTELLIGENCE', id: 'capabilities' },
              { label: 'APPLICATIONS', id: 'meaning' },
              { label: 'TECHNOLOGY', id: 'foundation' },
              { label: 'ABOUT', id: 'footer' }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="relative hover:text-[#00A3A6] transition-colors py-1 group"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00A3A6] transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Right Controls: Status Pill & Launch Button */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0 font-mono text-xs">
            {/* Telemetry Active Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#E6F4F1] border border-[#00A3A6]/30 text-[#00A3A6] font-mono text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A3A6] animate-pulse" />
              <span>SYSTEM ACTIVE</span>
            </div>

            {/* Launch Platform Button */}
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 bg-[#00A3A6] text-white font-mono text-[11px] font-bold tracking-[0.12em] uppercase px-4 py-2 hover:bg-[#008C8F] transition-all shadow-sm hover:shadow-md hover:scale-[1.02]"
            >
              <span>LAUNCH PLATFORM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* 1. HERO VIEWPORT SECTION (Dark Earth Globe Theme) */}
      {/* ---------------------------------------------------- */}
      <section id="hero" className="relative w-full min-h-screen flex flex-col justify-between pt-24 pb-8 px-4 md:px-8 overflow-hidden bg-[#02050B] text-white">

        {/* 3D WebGL Canvas Layer */}
        <EarthGlobe3D />

        {/* Hero Content Box with Framer Motion entrance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-20 max-w-[1440px] mx-auto w-full pt-6 md:pt-12 pointer-events-auto"
        >
          {/* Sub-badge pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F4F1] border border-[#00A3A6]/40 font-mono text-[10px] md:text-[11px] tracking-[0.2em] text-[#00A3A6] font-bold uppercase mb-6 shadow-[0_0_15px_rgba(0,163,166,0.15)]">
            <span className="w-1.5 h-1.5 bg-[#00A3A6] rounded-full inline-block animate-pulse" />
            <span>// COPERNICUS SENTINEL DATA INTEGRATION NODE</span>
          </div>

          {/* Main Serif Display Headline with Framer Motion Animated Text */}
          <h1 className="font-serif font-semibold text-4xl sm:text-6xl md:text-7xl lg:text-[84px] text-white leading-[0.93] tracking-tight mb-6 max-w-5xl">
            Turn Earth<br />
            Observation<br />
            Into Actionable<br />
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.45 }}
                className="text-[#00A3A6] text-glow-teal inline-block"
              >
                {rotatingWords[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </h1>

          {/* Paragraph description */}
          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl font-light leading-relaxed mb-8">
            Transform satellite imagery, geospatial data and AI into clear insights for monitoring infrastructure, environment and change.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-16">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-[#00A3A6] text-white font-mono text-xs font-bold tracking-[0.14em] uppercase px-7 py-4 hover:bg-[#008C8F] transition-all shadow-[0_0_25px_rgba(0,163,166,0.4)]"
              >
                <span>EXPLORE THE PLATFORM</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={() => scrollToSection('foundation')}
                className="inline-flex items-center gap-2 bg-[#0B1728]/80 text-slate-200 border border-[#1F3147] font-mono text-xs font-bold tracking-[0.14em] uppercase px-7 py-4 hover:border-[#00A3A6] hover:text-white transition-all backdrop-blur-md"
              >
                <span>DISCOVER THE TECHNOLOGY</span>
              </button>
            </motion.div>
          </div>

        </motion.div>

        {/* Bottom Horizontal Specs Readout Bar */}
        <div className="relative z-20 max-w-[1440px] mx-auto w-full border-t border-[#18283A]/80 pt-5 pb-2 font-mono text-[10px] md:text-[11px] tracking-[0.14em] uppercase text-slate-400">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A3A6]" />
              <span>SATELLITES ACTIVE: <strong className="text-white">{systemStatus?.activeSatellites || 12} CONSTELLATIONS</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A3A6]" />
              <span>EVIDENCE ACCURACY: <strong className="text-white">{systemStatus?.evidenceCoverage || 98.4}% VERIFIED</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A3A6]" />
              <span>MEDIAN LATENCY: <strong className="text-white">{systemStatus?.medianResponse || '2.1s'} RESPONSE</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[#00A3A6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A3A6] animate-pulse" />
              <span>NODE STATUS: <strong>{systemStatus?.status || 'ONLINE'} (SYNCED)</strong></span>
            </div>
          </div>
        </div>

      </section>

      {/* ---------------------------------------------------- */}
      {/* 2. SECTION: WHERE DATA BECOMES MEANING (Light Theme) */}
      {/* ---------------------------------------------------- */}
      <section id="meaning" className="relative z-20 bg-[#F5F9FA] bg-blueprint py-24 px-4 md:px-8 border-t border-slate-200">
        <div className="max-w-[1440px] mx-auto">

          {/* Framer Motion Fade-up Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            {/* Monospace Kicker Tag */}
            <div className="flex items-center gap-3 font-mono text-xs text-[#00A3A6] tracking-[0.2em] uppercase mb-6">
              <span className="w-8 h-[1px] bg-[#00A3A6]" />
              <span>// WHERE DATA BECOMES MEANING</span>
            </div>

            {/* Section Heading */}
            <h2 className="font-serif font-semibold text-3xl sm:text-5xl md:text-6xl text-[#0F2335] tracking-tight leading-[0.95] mb-12">
              Understand the Earth.<br />
              Monitor Change.<br />
              <span className="text-[#00A3A6]">Make Better Decisions.</span>
            </h2>

            {/* 2 Column Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

              {/* Left Column: Text Paragraphs */}
              <div className="lg:col-span-7 space-y-6 text-slate-600 text-sm md:text-base leading-relaxed font-light">
                <p>
                  Every day, Earth observation satellites capture terabytes of spectral data recording the continuous metamorphosis of our planet. From retreating polar ice sheets and seasonal crop cycles to dynamic transport corridors and maritime commerce, the raw observations hold critical answers.
                </p>
                <p>
                  We bridge raw spaceborne radiometric telemetry with foundation vision models. By replacing speculative guesswork with mathematical sub-pixel grounding, structural difference matrices, and bi-temporal cross-verification, researchers and decision makers unlock indisputable ground truth.
                </p>
              </div>

              {/* Right Column: Light Glassmorphic Principle Card */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="lg:col-span-5 bg-white border border-slate-200/90 p-6 md:p-8 rounded-lg shadow-sm hover:border-[#00A3A6] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between font-mono text-[10px] md:text-[11px] tracking-[0.16em] uppercase mb-6 pb-3 border-b border-slate-100">
                  <span className="text-slate-400">FOUNDATIONAL PRINCIPLE</span>
                  <span className="text-[#00A3A6] font-bold">EMPIRICAL FIDELITY</span>
                </div>

                <p className="font-mono text-xs text-slate-700 leading-relaxed mb-6">
                  Raw sensor radiances are preserved through calibrated Level-2A orthorectification before inference, ensuring that AI reasoning remains strictly anchored to physical photons.
                </p>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 font-mono text-xs text-[#00A3A6] hover:text-[#008C8F] font-bold tracking-wider uppercase transition-colors"
                >
                  <span>Explore Verification Protocol</span>
                  <span>↗</span>
                </Link>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. SECTION: CORE CAPABILITIES (Light Theme) */}
      {/* ---------------------------------------------------- */}
      <section id="capabilities" className="relative z-20 bg-white py-24 px-4 md:px-8 border-t border-slate-200">
        <div className="max-w-[1440px] mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Kicker Tag */}
            <div className="flex items-center gap-3 font-mono text-xs text-[#00A3A6] tracking-[0.2em] uppercase mb-4">
              <span className="w-8 h-[1px] bg-[#00A3A6]" />
              <span>// CORE CAPABILITIES</span>
            </div>

            <h2 className="font-serif font-semibold text-3xl sm:text-5xl md:text-6xl text-[#0F2335] tracking-tight mb-4">
              Explore the Intelligence
            </h2>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl font-light mb-14">
              A unified suite of remote sensing analysis modules, structured to ingest multi-spectral radiances, isolate geographic entities, and verify physical deviations across time.
            </p>
          </motion.div>

          {/* 2-Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Card 01 */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.4 }}
              className="group bg-[#F8FAFC] border border-slate-200 p-6 md:p-8 flex flex-col justify-between hover:border-[#00A3A6] hover:shadow-lg transition-all duration-300 rounded-lg"
            >
              <div>
                {/* Header Pills */}
                <div className="flex items-center justify-between mb-6">
                  <span className="px-2.5 py-1 bg-[#00A3A6] text-white font-mono font-bold text-xs rounded-sm">
                    01
                  </span>
                  <span className="px-3 py-1 bg-[#E6F4F1] text-[#00A3A6] font-mono text-[10px] tracking-[0.14em] uppercase font-bold border border-[#00A3A6]/30 rounded-sm">
                    INGESTION & HARMONIZATION
                  </span>
                </div>

                {/* Card Feature Image */}
                <div className="relative h-64 md:h-72 w-full overflow-hidden mb-6 bg-slate-900 rounded-md">
                  <img
                    src="https://images.unsplash.com/photo-1517976547714-720226b864c1?w=1200&auto=format&fit=crop&q=80"
                    alt="Spacecraft telemetry & launch"
                    className="w-full h-full object-cover filter saturate-90 brightness-90 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
                </div>

                {/* Title & Description */}
                <h3 className="font-serif font-bold text-2xl md:text-3xl text-[#0F2335] mb-3 group-hover:text-[#00A3A6] transition-colors">
                  Satellite Intelligence
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-light">
                  Multi-constellation radiometric ingestion and orthorectification across optical, SAR, and hyperspectral streams.
                </p>

                {/* Monospace Spec Note */}
                <p className="font-mono text-xs text-slate-500 leading-relaxed border-t border-slate-200 pt-4 mb-6">
                  Standardized Level-1C top-of-atmosphere and Level-2A bottom-of-atmosphere surface reflectance pipelines with sub-pixel co-registration.
                </p>
              </div>

              {/* Bottom CTA Link */}
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#00A3A6] tracking-[0.14em] uppercase group-hover:translate-x-1 transition-transform"
              >
                <span>LAUNCH MODULE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Card 02 */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="group bg-[#F8FAFC] border border-slate-200 p-6 md:p-8 flex flex-col justify-between hover:border-[#00A3A6] hover:shadow-lg transition-all duration-300 rounded-lg"
            >
              <div>
                {/* Header Pills */}
                <div className="flex items-center justify-between mb-6">
                  <span className="px-2.5 py-1 bg-[#00A3A6] text-white font-mono font-bold text-xs rounded-sm">
                    02
                  </span>
                  <span className="px-3 py-1 bg-[#E6F4F1] text-[#00A3A6] font-mono text-[10px] tracking-[0.14em] uppercase font-bold border border-[#00A3A6]/30 rounded-sm">
                    VISUAL QUESTION ANSWERING
                  </span>
                </div>

                {/* Card Feature Image */}
                <div className="relative h-64 md:h-72 w-full overflow-hidden mb-6 bg-slate-900 rounded-md">
                  <img
                    src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop&q=80"
                    alt="Satellite landscape analysis"
                    className="w-full h-full object-cover filter saturate-90 brightness-90 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
                </div>

                {/* Title & Description */}
                <h3 className="font-serif font-bold text-2xl md:text-3xl text-[#0F2335] mb-3 group-hover:text-[#00A3A6] transition-colors">
                  Image Analysis
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-light">
                  Evidence-grounded conversational interrogation of complex satellite scenes, resolving land use and structural properties.
                </p>

                {/* Monospace Spec Note */}
                <p className="font-mono text-xs text-slate-500 leading-relaxed border-t border-slate-200 pt-4 mb-6">
                  Powered by multi-modal vision foundation models trained specifically on remote sensing metadata and geometric geospatial patterns.
                </p>
              </div>

              {/* Bottom CTA Link */}
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#00A3A6] tracking-[0.14em] uppercase group-hover:translate-x-1 transition-transform"
              >
                <span>LAUNCH MODULE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. SECTION: ORBITAL CONSTELLATIONS (Light Theme) */}
      {/* ---------------------------------------------------- */}
      <section id="missions" className="relative z-20 bg-[#F5F9FA] bg-blueprint py-24 px-4 md:px-8 border-t border-slate-200">
        <div className="max-w-[1440px] mx-auto">

          {/* Header Row */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
          >
            <div>
              <div className="flex items-center gap-3 font-mono text-xs text-[#00A3A6] tracking-[0.2em] uppercase mb-4">
                <span className="w-8 h-[1px] bg-[#00A3A6]" />
                <span>// ORBITAL CONSTELLATIONS</span>
              </div>
              <h2 className="font-serif font-semibold text-3xl sm:text-5xl md:text-6xl text-[#0F2335] tracking-tight">
                Explore the Missions
              </h2>
              <p className="text-slate-600 text-sm md:text-base max-w-xl font-light mt-3">
                Autonomous spaceborne constellations monitoring land surfaces, ocean dynamics, and atmospheric chemistry with continuous global revisit.
              </p>
            </div>
          </motion.div>

          {/* Mission Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {missionList.slice(0, 3).map((mission, idx) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.12 }}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedMissionModal(mission)}
                className="group bg-white border border-slate-200/90 p-6 flex flex-col justify-between hover:border-[#00A3A6] hover:shadow-md transition-all cursor-pointer rounded-lg"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-4 font-mono text-[10px] tracking-[0.14em] uppercase">
                    <span className="px-2.5 py-1 bg-[#E6F4F1] text-[#00A3A6] border border-[#00A3A6]/30 font-bold rounded-sm">
                      {mission.missionNo}
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-700 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-sm font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{mission.status}</span>
                    </span>
                  </div>

                  {/* Mission Image with Pill */}
                  <div className="relative h-48 w-full overflow-hidden mb-5 bg-slate-900 rounded-md">
                    <img
                      src={mission.image}
                      alt={mission.name}
                      className="w-full h-full object-cover filter saturate-85 brightness-90 group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-slate-900/90 text-white font-mono text-[9px] tracking-wider uppercase border border-slate-700 rounded-sm">
                      {mission.gsd}
                    </span>
                  </div>

                  {/* Sub-category */}
                  <p className="font-mono text-[10px] text-slate-500 tracking-[0.16em] uppercase mb-1">
                    {mission.category}
                  </p>

                  {/* Title */}
                  <h3 className="font-serif font-bold text-xl text-[#0F2335] mb-3 group-hover:text-[#00A3A6] transition-colors">
                    {mission.name}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 text-xs leading-relaxed font-light mb-6">
                    {mission.description}
                  </p>
                </div>

                {/* Card Footer Specs */}
                <div className="border-t border-slate-100 pt-4 flex items-center justify-between font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                  <span>ALT: {mission.alt}</span>
                  <span className="text-[#00A3A6] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    EXPLORE MISSION ↗
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 5. SECTION: SCIENTIFIC DATA OBSERVATION (Light Theme) */}
      {/* ---------------------------------------------------- */}
      <section id="data" className="relative z-20 bg-white py-24 px-4 md:px-8 border-t border-slate-200">
        <div className="max-w-[1440px] mx-auto">

          {/* Header Row with Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6"
          >
            <div>
              <div className="flex items-center gap-3 font-mono text-xs text-[#00A3A6] tracking-[0.2em] uppercase mb-4">
                <span className="w-8 h-[1px] bg-[#00A3A6]" />
                <span>// SCIENTIFIC DATA OBSERVATION</span>
              </div>
              <h2 className="font-serif font-semibold text-4xl sm:text-5xl md:text-6xl text-[#0F2335] tracking-tight">
                Every Pixel Tells a <span className="text-[#00A3A6]">Story.</span>
              </h2>
              <p className="text-slate-600 text-sm md:text-base max-w-2xl font-light mt-3">
                Scientific Earth observation transforms photons into calibrated physical quantities. Inspect multi-spectral radiances across calibrated sensor bands.
              </p>
            </div>

            {/* Band Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 font-mono text-xs rounded-md">
              {['rgb', 'nir', 'swir'].map((bKey) => (
                <button
                  key={bKey}
                  onClick={() => setActiveBand(bKey)}
                  className={`px-4 py-2.5 tracking-wider uppercase transition-all rounded-sm ${activeBand === bKey
                      ? 'bg-[#00A3A6] text-white font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {bKey === 'rgb' ? 'NATURAL RGB' : bKey === 'nir' ? 'FALSE-COLOR NIR' : 'SWIR PENETRATION'}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Large Satellite Raster Frame */}
          <div className="relative min-h-[500px] md:min-h-[580px] w-full overflow-hidden border border-slate-200 bg-slate-950 rounded-lg shadow-md">

            {/* Background Image with AnimatePresence crossfade */}
            <AnimatePresence mode="wait">
              <motion.img
                key={activeBand}
                src={currentProfile.image}
                alt={currentProfile.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full h-[580px] object-cover filter saturate-100 brightness-85"
              />
            </AnimatePresence>

            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/50" />

            {/* Top-left Coordinate Badge */}
            <div className="absolute top-5 left-5 z-20 px-3.5 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 font-mono text-xs text-[#00A3A6] tracking-wide rounded-sm">
              <span>● {currentProfile.coords}</span>
            </div>

            {/* Center Radar Crosshair graphic */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <div className="w-16 h-16 rounded-full border border-[#00A3A6]/40 flex items-center justify-center animate-spin" style={{ animationDuration: '18s' }}>
                <div className="w-2 h-2 rounded-full bg-[#00A3A6]" />
              </div>
            </div>

            {/* Bottom-Right Float Metadata Card */}
            <div className="absolute bottom-5 right-5 z-20 w-full max-w-sm md:max-w-md bg-white/95 backdrop-blur-xl border border-slate-200 p-5 md:p-6 shadow-xl rounded-lg text-slate-800">

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 font-mono text-[10px] md:text-[11px] tracking-[0.16em] uppercase">
                <span className="text-[#00A3A6] font-bold">SCENE METADATA PROFILE</span>
                <span className="px-2 py-0.5 bg-[#E6F4F1] border border-[#00A3A6]/30 text-[#00A3A6] font-bold rounded-sm">
                  CALIBRATED BOA
                </span>
              </div>

              {/* Grid Fields */}
              <div className="grid grid-cols-2 gap-4 my-4 font-mono text-[10px] uppercase">
                <div>
                  <span className="text-slate-400 block mb-0.5">LOCATION</span>
                  <strong className="text-slate-900 text-xs font-sans font-bold">Delhi NCR / Yamuna Basin</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">CAPTURED</span>
                  <strong className="text-[#00A3A6] text-xs font-sans font-bold">22 September 2026</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">RESOLUTION</span>
                  <strong className="text-slate-900 text-xs font-sans font-bold">10 m Ground Sampling</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">DATA TYPE</span>
                  <strong className="text-[#00A3A6] text-xs font-sans font-bold">{currentProfile.dataType}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">CLOUD COVERAGE</span>
                  <strong className="text-slate-900 text-xs font-sans font-bold">0.2% Measured</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">INSTRUMENT</span>
                  <strong className="text-slate-700 text-xs font-sans font-bold">MSI Pushbroom 13-Band</strong>
                </div>
              </div>

              {/* Description Paragraph */}
              <p className="text-slate-600 font-sans text-xs leading-relaxed font-light mb-5 border-t border-slate-100 pt-3">
                {currentProfile.desc}
              </p>

              {/* Action Button */}
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#00A3A6] text-white font-mono text-xs font-bold tracking-[0.14em] uppercase py-3 hover:bg-[#008C8F] transition-all rounded-sm shadow-sm"
              >
                <span>EXPLORE DATA IN VQA ENGINE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 6. FOUNDATION AI SECTION (Light Theme) */}
      {/* ---------------------------------------------------- */}
      <section id="foundation" className="relative z-20 bg-[#F5F9FA] bg-blueprint py-24 px-4 md:px-8 border-t border-slate-200">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6"
          >
            <div className="flex items-center gap-3 font-mono text-xs text-[#00A3A6] tracking-[0.2em] uppercase mb-4">
              <span className="w-8 h-[1px] bg-[#00A3A6]" />
              <span>// FOUNDATION VISION AI</span>
            </div>
            <h2 className="font-serif font-semibold text-4xl sm:text-5xl md:text-6xl text-[#0F2335] tracking-tight mb-6">
              From Images to <span className="text-[#00A3A6]">Intelligence.</span>
            </h2>
            <p className="text-slate-600 text-sm md:text-base font-light leading-relaxed mb-8">
              Raw satellite observation becomes operational intelligence when paired with vision models trained explicitly on remote sensing physics, multispectral radiances, and geodetic geometry.
            </p>

            {/* List of Principles */}
            <div className="space-y-4">
              {[
                'Physical & Structural Changes - Automated evidence classification grounded in calibrated scene signals.',
                'Infrastructure Development - High-revisit urban perimeter scanning and berth throughput monitoring.',
                'Environmental Patterns - Deforestation metrics, surface water boundary drift, and glacier terminus tracking.',
                'Radar & Thermal Anomalies - All-weather Synthetic Aperture Radar (SAR) fusion for zero-gap surveillance.'
              ].map((item, idx) => {
                const [title, desc] = item.split(' - ');
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-3.5 p-4 bg-white border border-slate-200/90 rounded-lg shadow-sm"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#00A3A6] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 text-sm font-bold block mb-1">{title}</strong>
                      <span className="text-slate-500 text-xs font-light">{desc}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Live Inference Visual */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 relative h-[480px] overflow-hidden border border-slate-200 bg-slate-950 rounded-lg shadow-md"
          >
            <img
              src="https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=1400&auto=format&fit=crop&q=85"
              alt="Port infrastructure analysis"
              className="w-full h-full object-cover filter saturate-85 brightness-85"
            />
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-slate-900/90 border border-slate-700 font-mono text-[10px] text-[#00A3A6] tracking-wider uppercase rounded-sm">
              ● LIVE INFERENCE STREAM
            </div>
            <div className="absolute top-14 left-4 px-3 py-1.5 bg-slate-900/90 border border-emerald-500/40 font-mono text-[10px] text-emerald-400 tracking-wider uppercase rounded-sm">
              CONTAINER VESSEL · 99.4% CONFIDENCE
            </div>
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-slate-900/95 border border-slate-700 font-mono text-[10px] text-slate-300 rounded-sm">
              STATUS: ZERO HALLUCINATION PASS · GROUNDED PIXEL VERIFICATION
            </div>
          </motion.div>

        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 7. FOOTER CALLOUT & FOOTER */}
      {/* ---------------------------------------------------- */}
      <section id="change" className="relative z-20 bg-white py-20 px-4 text-center border-t border-slate-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="font-mono text-xs text-[#00A3A6] tracking-[0.2em] uppercase mb-3">
            // READY FOR ANALYSIS
          </div>
          <h2 className="font-serif font-semibold text-3xl sm:text-5xl text-[#0F2335] mb-6">
            Turn Satellite Imagery into Defensible Intelligence.
          </h2>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-[#00A3A6] text-white font-mono text-xs font-bold tracking-[0.14em] uppercase px-8 py-4 hover:bg-[#008C8F] transition-all shadow-md hover:shadow-lg rounded-sm"
          >
            <span>LAUNCH ANALYSIS SUITE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer id="footer" className="relative z-20 bg-[#0F172A] py-8 px-4 border-t border-slate-800 font-mono text-xs text-slate-400">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00A3A6]" />
            <span className="text-white font-bold">SATQUERY AI</span>
            <span>· EARTH OBSERVATION INTELLIGENCE</span>
          </div>
          <span>COPERNICUS SENTINEL DATA INTEGRATION NODE</span>
        </div>
      </footer>

      {/* ---------------------------------------------------- */}
      {/* MISSION DETAILS MODAL (Framer Motion AnimatePresence) */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {selectedMissionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl rounded-lg text-slate-800"
            >
              <button
                onClick={() => setSelectedMissionModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4 font-mono text-xs text-[#00A3A6] uppercase tracking-widest font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00A3A6]" />
                <span>{selectedMissionModal.missionNo} • {selectedMissionModal.category}</span>
              </div>

              <h3 className="font-serif font-semibold text-3xl text-[#0F2335] mb-3">{selectedMissionModal.name}</h3>
              <p className="text-slate-600 text-sm font-light leading-relaxed mb-6">{selectedMissionModal.description}</p>

              <div className="space-y-3 bg-[#F8FAFC] p-4 border border-slate-200 font-mono text-xs text-slate-700 rounded-md">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Payload Instrument:</span>
                  <span className="text-[#00A3A6] font-bold">{selectedMissionModal.payload}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Spatial Resolution:</span>
                  <span className="text-slate-900 font-bold">{selectedMissionModal.gsd}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Swath Width:</span>
                  <span className="text-slate-900 font-bold">{selectedMissionModal.swath}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Orbit Altitude:</span>
                  <span className="text-slate-900 font-bold">{selectedMissionModal.alt} ({selectedMissionModal.revisit})</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Link
                  to="/login"
                  className="px-6 py-3 bg-[#00A3A6] text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#008C8F] transition-colors flex items-center gap-2 rounded-sm shadow-sm"
                >
                  <span>Query {selectedMissionModal.name} Data</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
