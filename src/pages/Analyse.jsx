import React, { useState, useRef, useEffect } from 'react';
import { Upload, Send, CheckCircle, Loader2, Scan, ArrowLeftRight, FileText, Sparkles, AlertCircle, ShieldAlert, Calendar, RotateCcw, Waves, MapPin, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIOrb from '../components/AIOrb';
import StreamingResponse from '../components/StreamingResponse';
import VoicePromptBar from '../components/VoicePromptBar';
import { API_BASE_URL } from '../config/api';

export default function Analyse() {
  const [activeTab, setActiveTab] = useState('vqa'); // 'vqa' | 'change' | 'grounding' | 'spectral'
  const [prompt, setPrompt] = useState('');

  // Single Image State (VQA & Grounding)
  const [singleImage, setSingleImage] = useState(null);
  const [singleImagePreview, setSingleImagePreview] = useState(null);

  // Grounding Feature Input
  const [featureName, setFeatureName] = useState('water body');

  const [spectralBands, setSpectralBands] = useState({ red: null, nir: null, green: null });

  // Change Detection Image & Date States
  const [image1, setImage1] = useState(null);
  const [image1Preview, setImage1Preview] = useState('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=60');
  const [date1, setDate1] = useState('14 August 2026');

  const [image2, setImage2] = useState(null);
  const [image2Preview, setImage2Preview] = useState('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60');
  const [date2, setDate2] = useState('12 September 2026');

  // Grounding BBox Canvas Overlay Refs
  const groundingImageRef = useRef(null);
  const chatScrollRef = useRef(null);
  const [renderedDimensions, setRenderedDimensions] = useState({ width: 0, height: 0 });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [aiState, setAiState] = useState('idle');
  const [messages, setMessages] = useState([]);

  const tabs = [
    { id: 'vqa', label: 'VISUAL Q&A', tag: 'VQA', icon: FileText },
    { id: 'change', label: 'CHANGE DETECTION', tag: 'BI-TEMPORAL', icon: ArrowLeftRight },
    { id: 'grounding', label: 'GROUNDING', tag: 'BBOX', icon: Scan },
    { id: 'spectral', label: 'SPECTRAL INDICES', tag: 'NDVI / NDWI', icon: Waves },
  ];

  const presets = [
    "Identify water reservoir boundary and flood risk",
    "Describe flooded terrain and crop damage index",
    "Quantify coastal shoreline erosion shift",
    "Locate road networks crossing waterways"
  ];

  // Auto-scroll chat thread smoothly when new messages stream in
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  // Dynamically track rendered image width & height for grounding canvas overlay
  useEffect(() => {
    const updateDimensions = () => {
      if (groundingImageRef.current) {
        setRenderedDimensions({
          width: groundingImageRef.current.clientWidth,
          height: groundingImageRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [singleImagePreview, activeTab]);

  const handleSingleImageChange = (file) => {
    if (file) {
      setSingleImage(file);
      setSingleImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveSingleImage = () => {
    setSingleImage(null);
    setSingleImagePreview(null);
  };

  const handleSpectralBandChange = (band, event) => {
    const file = event.target.files[0];
    if (file) setSpectralBands((current) => ({ ...current, [band]: file }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (loading) return;

    const queryText = activeTab === 'grounding'
      ? (prompt.trim() || featureName || 'water body')
      : activeTab === 'spectral'
        ? 'Calculate NDVI and NDWI from uploaded spectral bands'
        : prompt.trim() || (activeTab === 'change' ? 'Quantify shoreline delta' : 'Describe satellite scene features');

    if (activeTab === 'grounding') {
      setFeatureName(queryText);
    }

    // Add user message to conversational thread
    setMessages((current) => [...current, {
      id: `user-${Date.now()}`,
      role: 'user',
      text: queryText,
      image: (activeTab === 'vqa' || activeTab === 'grounding') ? singleImagePreview : null,
      tab: activeTab
    }]);

    setLoading(true);
    setAiState('processing');
    setResponse(null);

    const formData = new FormData();

    try {
      let endpoint = `${API_BASE_URL}/api/vqa`;
      let res;

      if (activeTab === 'vqa') {
        endpoint = `${API_BASE_URL}/api/vqa`;
        formData.append('question', queryText);
        if (singleImage) formData.append('image', singleImage);

        res = await fetch(endpoint, { method: 'POST', body: formData });
      } else if (activeTab === 'change') {
        endpoint = `${API_BASE_URL}/api/change-detection`;
        formData.append('question', queryText);
        formData.append('date1', date1);
        formData.append('date2', date2);
        if (image1) formData.append('image1', image1);
        if (image2) formData.append('image2', image2);

        res = await fetch(endpoint, { method: 'POST', body: formData });
      } else if (activeTab === 'grounding') {
        endpoint = `${API_BASE_URL}/api/grounding`;
        formData.append('feature', queryText);
        if (singleImage) formData.append('image', singleImage);

        res = await fetch(endpoint, { method: 'POST', body: formData });
      } else if (activeTab === 'spectral') {
        endpoint = `${API_BASE_URL}/api/spectral-indices`;
        if (spectralBands.red) formData.append('red', spectralBands.red);
        if (spectralBands.nir) formData.append('nir', spectralBands.nir);
        if (spectralBands.green) formData.append('green', spectralBands.green);

        res = await fetch(endpoint, { method: 'POST', body: formData });
      }

      if (res && res.ok) {
        const data = await res.json();
        setResponse(data);
        setAiState('success');

        const answerText = data.answer || data.raw_response || 'Analysis complete. Review the verified evidence below.';

        setMessages((current) => [...current, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: answerText,
          sources: data.sources,
          evidence: data.evidence,
          model: data.source ? data.source.split('(')[0].trim() : 'Google Gemini 1.5 Flash',
          live_model: data.live_model !== false,
          bbox: data.bbox_percent || data.bounding_box,
          verified_change: data.verified_change,
          pixel_diff_percent: data.pixel_diff_percent,
        }]);

        // Clear prompt input after submission for clean conversational flow
        setPrompt('');
      } else {
        let message = 'API server returned an error';
        if (res) {
          try {
            const errorData = await res.json();
            message = errorData.message || message;
          } catch (parseError) {
            message = `${message} (${res.status})`;
          }
        }
        throw new Error(message);
      }
    } catch (err) {
      const errorMsg = err.message || 'Request failed. Analysis unavailable.';
      setResponse({ error: errorMsg });
      setAiState('error');
      setMessages((current) => [...current, {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ Analysis Unavailable: ${errorMsg}\nPlease verify that your Gemini API key or backend endpoint is active.`,
        isError: true,
        model: 'SatQuery Vision Core'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    handleSubmit({ preventDefault: () => { } });
  };

  return (
    <div className="aerospace-page mx-auto w-full max-w-7xl space-y-8 p-6 font-sans md:p-10">
      {/* SIH Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <p className="mission-label">
            // SIH26167 · ISRO SATELLITE INTELLIGENCE
          </p>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-slate-900 md:text-5xl">
            Analyse a Scene
          </h1>
          <p className="text-sm text-slate-600">
            Multimodal Earth Observation: Voice Dictation, Spatial Grounding, and Temporal Change Detection.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-[#00A3A6]">
          <span className="w-2 h-2 rounded-full bg-[#00A3A6] animate-pulse"></span>
          <span>GEMINI CLOUD VISION · 24/7 LIVE</span>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex flex-wrap gap-2.5 border-b border-slate-200 pb-4 font-mono">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setResponse(null);
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'border border-[#00A3A6]/40 text-[#00A3A6] font-bold bg-[#E6F4F1] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                isActive ? 'bg-[#00A3A6] text-white' : 'border border-[#00A3A6]/30 text-[#00A3A6]'
              }`}>
                [{tab.tag}]
              </span>
            </button>
          );
        })}
      </div>

      {/* Analysis Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Upload Container */}
        <div className="glass-panel space-y-4 p-6 lg:col-span-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-slate-400 tracking-wider uppercase font-semibold">
              IMAGE TELEMETRY INPUT
            </p>
            {singleImagePreview && (
              <button
                type="button"
                onClick={handleRemoveSingleImage}
                className="text-[10px] font-mono text-rose-500 hover:underline"
              >
                Clear Scene
              </button>
            )}
          </div>

          {activeTab === 'spectral' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#00A3A6]/30 bg-[#EAF8FA] p-3 text-[11px] leading-relaxed text-slate-600 font-mono">
                Upload aligned single-band files. Red + NIR calculate NDVI; Green + NIR additionally calculate NDWI water candidates.
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  ['red', 'RED · B4', 'Required'],
                  ['nir', 'NIR · B8', 'Required'],
                  ['green', 'GREEN · B3', 'Optional'],
                ].map(([band, label, requirement]) => (
                  <label key={band} className="relative flex min-h-32 cursor-pointer flex-col justify-between border border-dashed border-[#00A3A6] bg-[#F8FAFC] p-3.5 rounded-2xl transition-all hover:bg-[#EAF8FA] hover:border-[#00A3A6]">
                    <input type="file" accept="image/*,.tif,.tiff" onChange={(event) => handleSpectralBandChange(band, event)} className="absolute inset-0 cursor-pointer opacity-0" />
                    <span className="font-mono text-[10px] font-bold text-[#087D86]">{label}</span>
                    <span className="text-[10px] text-slate-500 truncate">{spectralBands[band]?.name || requirement}</span>
                    <Upload className="h-4 w-4 text-[#00A3A6]" />
                  </label>
                ))}
              </div>
            </div>
          ) : (activeTab === 'vqa' || activeTab === 'grounding') ? (
            <div className={`relative flex min-h-[290px] flex-col items-center justify-center border-2 border-dashed border-[#00A3A6]/40 bg-[#F8FAFC] p-4 text-center rounded-2xl transition-all hover:bg-[#EAF8FA]/60 ${loading && singleImagePreview ? 'ai-image-processing ring-4 ring-[#00A3A6]/20' : ''}`}>
              <input
                type="file"
                accept="image/*,.tif,.tiff"
                onChange={(e) => handleSingleImageChange(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
              />
              {singleImagePreview ? (
                <div className="relative w-full overflow-hidden rounded-xl flex justify-center bg-black/5">
                  <img
                    ref={groundingImageRef}
                    onLoad={() => {
                      if (groundingImageRef.current) {
                        setRenderedDimensions({
                          width: groundingImageRef.current.clientWidth,
                          height: groundingImageRef.current.clientHeight,
                        });
                      }
                    }}
                    src={singleImagePreview}
                    alt="Satellite Preview"
                    className="max-h-80 w-full object-contain rounded-xl shadow-xs"
                  />

                  {loading && (
                    <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2 border border-[#9BDDE2] bg-white/95 px-3 py-1.5 font-mono text-[10px] font-bold text-[#087D86] rounded-xl shadow-md backdrop-blur-md animate-pulse">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00A3A6]" /> MULTIMODAL REASONING...
                    </div>
                  )}

                  {/* Grounding BBox Percentage Canvas Overlay (SIH Contract: 0-100% converted to displayed pixels) */}
                  {activeTab === 'grounding' && response && response.bbox_percent && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="absolute border-2 border-[#00A3A6] bg-[#00A3A6]/25 flex items-start p-1 z-30 shadow-[0_0_20px_rgba(0,163,166,0.6)] rounded-sm"
                      style={{
                        left: `${(response.bbox_percent[0] / 100) * renderedDimensions.width}px`,
                        top: `${(response.bbox_percent[1] / 100) * renderedDimensions.height}px`,
                        width: `${((response.bbox_percent[2] - response.bbox_percent[0]) / 100) * renderedDimensions.width}px`,
                        height: `${((response.bbox_percent[3] - response.bbox_percent[1]) / 100) * renderedDimensions.height}px`,
                      }}
                    >
                      <span className="text-[10px] font-mono bg-[#00A3A6] text-white px-2 py-0.5 rounded font-bold shadow-xs flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        {featureName || 'Target Feature'}
                      </span>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 font-mono py-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#9BDDE2] bg-[#E6F4F1] text-[#00A3A6] shadow-xs">
                    <Upload className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-sans text-sm font-bold text-slate-900">Upload Satellite Tile</h4>
                    <p className="mt-1 text-[10px] text-slate-400">PNG · JPG · GEOTIFF UP TO 50 MB</p>
                  </div>
                  <p className="text-[11px] font-bold uppercase text-[#00A3A6] tracking-wide">
                    CLICK OR DRAG IMAGE HERE
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Change Detection Dual Upload Slots + Capture Date Inputs */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 font-mono">
                {/* Image 1 Slot */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                    <span>BASELINE (T1)</span>
                    <Calendar className="w-3 h-3 text-[#00A3A6]" />
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-2 bg-[#F8FAFC] relative h-40 flex items-center justify-center overflow-hidden hover:border-[#00A3A6] transition-colors">
                    <input type="file" accept="image/*" onChange={(e) => {
                      if (e.target.files[0]) {
                        setImage1(e.target.files[0]);
                        setImage1Preview(URL.createObjectURL(e.target.files[0]));
                      }
                    }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <img src={image1Preview} alt="Before" className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <input
                    type="text"
                    value={date1}
                    onChange={(e) => setDate1(e.target.value)}
                    placeholder="14 August 2026"
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-[#00A3A6]"
                  />
                </div>

                {/* Image 2 Slot */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                    <span>CURRENT (T2)</span>
                    <Calendar className="w-3 h-3 text-[#00A3A6]" />
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-2 bg-[#F8FAFC] relative h-40 flex items-center justify-center overflow-hidden hover:border-[#00A3A6] transition-colors">
                    <input type="file" accept="image/*" onChange={(e) => {
                      if (e.target.files[0]) {
                        setImage2(e.target.files[0]);
                        setImage2Preview(URL.createObjectURL(e.target.files[0]));
                      }
                    }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <img src={image2Preview} alt="After" className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <input
                    type="text"
                    value={date2}
                    onChange={(e) => setDate2(e.target.value)}
                    placeholder="12 September 2026"
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-[#00A3A6]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Query & Interactive Conversational Intelligence Section */}
        <div className="space-y-6 lg:col-span-6">
          <div className="glass-panel space-y-5 p-6 font-mono rounded-3xl border border-slate-200/90 shadow-sm flex flex-col min-h-[580px]">
            {/* Conversation Messages Container */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[460px] scroll-smooth"
              aria-live="polite"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 space-y-3">
                  <AIOrb state="idle" />
                  <div className="space-y-1">
                    <h3 className="font-sans font-bold text-slate-800 text-sm">
                      SatQuery Multimodal Intelligence
                    </h3>
                    <p className="text-xs text-slate-500 font-mono max-w-sm">
                      Upload an image, type your question, or tap the microphone to speak your query.
                    </p>
                  </div>
                </div>
              )}

              {/* Message Thread */}
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  {message.role === 'user' ? (
                    /* User Message Bubble */
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-[#102838] text-white px-4 py-3 text-xs leading-relaxed shadow-xs">
                        {message.image && (
                          <div className="mb-2 rounded-xl overflow-hidden border border-white/20">
                            <img src={message.image} alt="User Scene Tile" className="max-h-36 w-full object-cover" />
                          </div>
                        )}
                        <p className="font-sans">{message.text}</p>
                      </div>
                    </div>
                  ) : (
                    /* Assistant Message with GPT/Claude/Gemini Typewriter & Motion */
                    <div className="flex items-start gap-2.5">
                      <div className="shrink-0 mt-1">
                        <AIOrb state={message.isError ? 'error' : 'success'} compact />
                      </div>
                      <div className="flex-1 space-y-3">
                        <StreamingResponse
                          text={message.text}
                          sources={message.sources}
                          model={message.model || 'Gemini Flash Vision'}
                          isError={message.isError}
                          isLive={message.live_model}
                        />

                        {/* Visual Badge Card for Grounding Coordinates if available */}
                        {message.bbox && Array.isArray(message.bbox) && message.bbox.length === 4 && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-2.5 rounded-xl bg-[#E6F4F1] border border-[#00A3A6]/30 text-xs font-mono text-[#087D86]"
                          >
                            <Scan className="w-4 h-4 text-[#00A3A6]" />
                            <span className="font-bold">BOUNDING BOX OVERLAY:</span>
                            <span className="bg-white px-2 py-0.5 rounded border border-[#00A3A6]/20 font-bold">
                              [{message.bbox.join(', ')}]%
                            </span>
                          </motion.div>
                        )}

                        {/* Visual Badge Card for Change Detection if available */}
                        {message.verified_change !== undefined && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-3 rounded-xl bg-[#E6F4F1] border border-[#00A3A6]/30 font-mono text-xs"
                          >
                            <div className="flex items-center space-x-2">
                              {message.verified_change ? (
                                <span className="px-2.5 py-1 rounded bg-emerald-500 text-white font-bold text-[10px] tracking-wider uppercase shadow-2xs">
                                  VERIFIED TEMPORAL SHIFT
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded bg-amber-500 text-white font-bold text-[10px] tracking-wider uppercase">
                                  NO SIGNIFICANT SHIFT
                                </span>
                              )}
                              <span className="text-slate-600 text-xs font-bold">Estimated Delta:</span>
                            </div>
                            <span className="text-sm font-bold text-[#00A3A6]">
                              {message.pixel_diff_percent == null ? 'N/A' : `${message.pixel_diff_percent}%`}
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Live Loading Indicator with AI Orb */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-2xl border border-[#00A3A6]/30 bg-[#E6F4F1] px-4 py-3 text-xs text-[#087D86] font-mono shadow-2xs"
                >
                  <AIOrb state="processing" compact />
                  <span className="flex items-center gap-1.5 font-bold">
                    Analyzing satellite telemetry via Gemini Vision Core
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-[#00A3A6] animate-ping" />
                    </span>
                  </span>
                </motion.div>
              )}
            </div>

            {/* Error Notification Banner with Retry */}
            {response && response.error && (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 font-mono">
                <div>
                  <p className="font-bold">// SERVICE TELEMETRY NOTICE</p>
                  <p className="mt-0.5 text-amber-800">{response.error}</p>
                </div>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex shrink-0 items-center gap-1.5 border border-amber-400 bg-white px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs"
                >
                  <RotateCcw className="h-3 w-3" /> RETRY
                </button>
              </div>
            )}

            {/* Spectral Result Tiles (if on spectral tab) */}
            {activeTab === 'spectral' && response && !response.error && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
                {[
                  ['NDVI mean', response.ndvi_mean == null ? 'N/A' : response.ndvi_mean],
                  ['NDWI mean', response.ndwi_mean == null ? 'N/A' : response.ndwi_mean],
                  ['Water candidates', response.water_candidate_percent == null ? 'N/A' : `${response.water_candidate_percent}%`],
                  ['Flood candidates', response.flood_candidate_percent == null ? 'N/A' : `${response.flood_candidate_percent}%`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-[#00A3A6]/30 bg-[#E6F4F1] p-3 text-center">
                    <p className="font-mono text-[9px] uppercase tracking-wide text-slate-500 font-bold">{label}</p>
                    <p className="mt-1 font-serif text-lg font-bold text-[#087D86]">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Interactive GPT/Claude/Gemini Voice & Multimodal Prompt Input Bar */}
            <div className="pt-2 border-t border-slate-200/80">
              <VoicePromptBar
                prompt={prompt}
                setPrompt={setPrompt}
                onSubmit={handleSubmit}
                loading={loading}
                attachedImage={singleImage}
                attachedImagePreview={singleImagePreview}
                onAttachImage={handleSingleImageChange}
                onRemoveAttachment={handleRemoveSingleImage}
                placeholder={
                  activeTab === 'grounding'
                    ? "Enter feature name or speak into mic (e.g. water body, settlement, runway)..."
                    : activeTab === 'change'
                      ? "Enter bi-temporal change query (or click mic to speak)..."
                      : "Ask any question about this satellite scene (or click mic to speak)..."
                }
                presets={activeTab === 'vqa' ? presets : []}
                onSelectPreset={(preset) => setPrompt(preset)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
