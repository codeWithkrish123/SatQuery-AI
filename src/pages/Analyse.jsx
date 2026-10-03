import React, { useState, useRef, useEffect } from 'react';
import { Upload, Send, CheckCircle, Loader2, Scan, ArrowLeftRight, FileText, Sparkles, AlertCircle, ShieldAlert, Calendar, RotateCcw, Waves } from 'lucide-react';
import AIOrb from '../components/AIOrb';

export default function Analyse() {
  const [activeTab, setActiveTab] = useState('vqa'); // 'vqa' | 'change' | 'grounding'
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
    "Quantify coastal shoreline erosion shift"
  ];

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

  const handleSingleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSingleImage(file);
      setSingleImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSpectralBandChange = (band, event) => {
    const file = event.target.files[0];
    if (file) setSpectralBands((current) => ({ ...current, [band]: file }));
  };

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://satquery-backend-sandy.vercel.app').split(',')[0].trim().replace(/\/+$/, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const submittedText = activeTab === 'grounding'
      ? featureName || 'water body'
      : activeTab === 'spectral'
        ? 'Calculate NDVI and NDWI from uploaded spectral bands'
        : prompt || (activeTab === 'change' ? 'Quantify shoreline delta' : 'Describe satellite scene features');

    setMessages((current) => [...current, {
      id: `user-${Date.now()}`,
      role: 'user',
      text: submittedText,
      image: singleImagePreview,
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
        formData.append('question', prompt || 'Describe satellite scene features');
        if (singleImage) formData.append('image', singleImage);

        res = await fetch(endpoint, { method: 'POST', body: formData });
      } else if (activeTab === 'change') {
        endpoint = `${API_BASE_URL}/api/change-detection`;
        formData.append('question', prompt || 'Quantify shoreline delta');
        formData.append('date1', date1);
        formData.append('date2', date2);
        if (image1) formData.append('image1', image1);
        if (image2) formData.append('image2', image2);

        res = await fetch(endpoint, { method: 'POST', body: formData });
      } else if (activeTab === 'grounding') {
        endpoint = `${API_BASE_URL}/api/grounding`;
        formData.append('feature', featureName || 'water body');
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
        setMessages((current) => [...current, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: data.answer || data.raw_response || 'Spectral analysis complete. Review the calculated indices below.',
          sources: data.sources,
          evidence: data.evidence,
        }]);
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
      const errorResponse = {
        error: errorMsg
      };
      setResponse(errorResponse);
      setAiState('error');
      setMessages((current) => [...current, {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ Analysis Unavailable: ${errorMsg}\nNo mock or synthetic result was generated. Please verify the live model service endpoint connection.`,
        isError: true
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
            Visual Q&A, Grounding overlay canvas, and verified Change Detection.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-[#00A3A6]">
          <span className="w-2 h-2 rounded-full bg-[#00A3A6] animate-pulse"></span>
          <span>SIH CONTRACT READY</span>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-4 font-mono">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setResponse(null);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded text-xs transition-all ${isActive
                  ? 'border-b-2 border-[#00A3A6] text-[#00A3A6] font-bold bg-[#E6F4F1]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <span>{tab.label}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded border border-[#00A3A6]/30 text-[#00A3A6] font-bold">
                [{tab.tag}]
              </span>
            </button>
          );
        })}
      </div>

      {/* Analysis Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Upload Container */}
        <div className="glass-panel space-y-4 p-6 lg:col-span-6">
          <p className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">IMAGE INPUT</p>

          {activeTab === 'spectral' ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#00A3A6]/30 bg-[#EAF8FA] p-3 text-[11px] leading-relaxed text-slate-600">
                Upload aligned single-band files. Red + NIR calculate NDVI; Green + NIR additionally calculate NDWI water candidates.
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  ['red', 'RED · B4', 'Required'],
                  ['nir', 'NIR · B8', 'Required'],
                  ['green', 'GREEN · B3', 'Optional'],
                ].map(([band, label, requirement]) => (
                  <label key={band} className="relative flex min-h-32 cursor-pointer flex-col justify-between border border-dashed border-[#00A3A6] bg-[#F8FAFC] p-3 transition-colors hover:bg-[#EAF8FA]">
                    <input type="file" accept="image/*,.tif,.tiff" onChange={(event) => handleSpectralBandChange(band, event)} className="absolute inset-0 cursor-pointer opacity-0" />
                    <span className="font-mono text-[10px] font-bold text-[#087D86]">{label}</span>
                    <span className="text-[10px] text-slate-500">{spectralBands[band]?.name || requirement}</span>
                    <Upload className="h-4 w-4 text-[#00A3A6]" />
                  </label>
                ))}
              </div>
            </div>
          ) : (activeTab === 'vqa' || activeTab === 'grounding') ? (
            <div className={`relative flex min-h-[260px] flex-col items-center justify-center border border-dashed border-[#00A3A6] bg-[#EAF8FA] p-4 text-center transition-colors hover:bg-[#E4F5F7] ${loading && singleImagePreview ? 'ai-image-processing' : ''}`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleSingleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
              />
              {singleImagePreview ? (
                <div className="relative w-full overflow-hidden rounded-lg flex justify-center">
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
                    className="max-h-72 w-full object-contain rounded-lg"
                  />

                  {loading && (
                    <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 border border-[#9BDDE2] bg-white/90 px-2.5 py-1.5 font-mono text-[10px] font-bold text-[#087D86] shadow-sm backdrop-blur-sm">
                      <Loader2 className="h-3 w-3 animate-spin" /> VISUAL PROCESSING
                    </div>
                  )}

                  {/* Grounding BBox Percentage Canvas Overlay (SIH Contract: 0-100% converted to displayed pixels) */}
                  {activeTab === 'grounding' && response && response.bbox_percent && (
                    <div
                      className="absolute border-2 border-[#00A3A6] bg-[#00A3A6]/20 flex items-start p-1 z-30 shadow-[0_0_15px_rgba(0,163,166,0.4)]"
                      style={{
                        left: `${(response.bbox_percent[0] / 100) * renderedDimensions.width}px`,
                        top: `${(response.bbox_percent[1] / 100) * renderedDimensions.height}px`,
                        width: `${((response.bbox_percent[2] - response.bbox_percent[0]) / 100) * renderedDimensions.width}px`,
                        height: `${((response.bbox_percent[3] - response.bbox_percent[1]) / 100) * renderedDimensions.height}px`,
                      }}
                    >
                      <span className="text-[10px] font-mono bg-[#00A3A6] text-white px-1.5 py-0.5 rounded font-bold">
                        {featureName || 'Target Feature'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 font-mono">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#9BDDE2] bg-white text-[#00A3A6]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-sans text-base font-bold text-slate-900">Upload satellite imagery</h4>
                    <p className="mt-1 text-[10px] text-slate-400">PNG · JPG · GEOTIFF UP TO 50 MB</p>
                  </div>
                  <p className="text-[11px] font-bold uppercase text-[#00A3A6]">DROP OR CLICK TO BROWSE</p>
                </div>
              )}
            </div>
          ) : (
            /* Change Detection Dual Upload Slots + Capture Date Inputs */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 font-mono">
                {/* Image 1 Slot */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>BEFORE SCENE</span>
                    <Calendar className="w-3 h-3 text-[#00A3A6]" />
                  </div>
                  <div className="border border-slate-200 rounded-xl p-2 bg-[#F8FAFC] relative h-40 flex items-center justify-center overflow-hidden">
                    <input type="file" accept="image/*" onChange={(e) => {
                      if (e.target.files[0]) {
                        setImage1(e.target.files[0]);
                        setImage1Preview(URL.createObjectURL(e.target.files[0]));
                      }
                    }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <img src={image1Preview} alt="Before" className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <input
                    type="text"
                    value={date1}
                    onChange={(e) => setDate1(e.target.value)}
                    placeholder="14 August 2026"
                    className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded text-xs text-slate-800 font-mono focus:outline-none focus:border-[#00A3A6]"
                  />
                </div>

                {/* Image 2 Slot */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>AFTER SCENE</span>
                    <Calendar className="w-3 h-3 text-[#00A3A6]" />
                  </div>
                  <div className="border border-slate-200 rounded-xl p-2 bg-[#F8FAFC] relative h-40 flex items-center justify-center overflow-hidden">
                    <input type="file" accept="image/*" onChange={(e) => {
                      if (e.target.files[0]) {
                        setImage2(e.target.files[0]);
                        setImage2Preview(URL.createObjectURL(e.target.files[0]));
                      }
                    }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <img src={image2Preview} alt="After" className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <input
                    type="text"
                    value={date2}
                    onChange={(e) => setDate2(e.target.value)}
                    placeholder="12 September 2026"
                    className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded text-xs text-slate-800 font-mono focus:outline-none focus:border-[#00A3A6]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Query & Response Section */}
        <div className="space-y-6 lg:col-span-6">
          <div className="glass-panel space-y-4 p-6 font-mono">
            <div className="space-y-3 border-b border-slate-200 pb-4" aria-live="polite">
              {messages.length === 0 && (
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <AIOrb state="idle" compact />
                  <span>Ready for a grounded satellite analysis.</span>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`ai-message-enter flex gap-3 ${message.role === 'user' ? 'justify-end' : 'items-start'}`}>
                  {message.role === 'assistant' && <AIOrb state={message.isError ? 'error' : 'success'} compact />}
                  <div className={`max-w-[88%] px-3.5 py-3 text-xs leading-relaxed ${message.role === 'user'
                      ? 'bg-[#102838] text-white rounded'
                      : message.isError
                        ? 'border-l-4 border-amber-500 bg-amber-50 text-amber-900 font-mono rounded'
                        : 'border-l-2 border-[#00A3A6] bg-[#EAF8FA] text-slate-700'
                    }`}>
                    {message.image && (
                      <img src={message.image} alt="Uploaded satellite scene" className="mb-2 max-h-28 w-full object-cover" />
                    )}
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    {message.sources && message.sources.length > 0 && !message.isError && (
                      <div className="mt-2.5 pt-2 border-t border-[#00A3A6]/20 space-y-1 font-mono text-[10px]">
                        <span className="font-bold text-[#00A3A6]">// GROUNDED CATALOG SOURCES:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {message.sources.map((src, i) => (
                            <a key={i} href={src.url || '#'} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded bg-[#00A3A6]/10 text-[#00A3A6] border border-[#00A3A6]/30 hover:bg-[#00A3A6] hover:text-white transition-colors">
                              🔗 {src.title || src.source_id}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="ai-message-enter flex items-center gap-3 border-l-2 border-[#00A3A6] bg-[#EAF8FA] px-3 py-3 text-xs text-slate-600">
                  <AIOrb state="processing" compact />
                  <span>Reviewing scene evidence and preparing a grounded response<span className="ai-caret" /></span>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-400 tracking-wider uppercase">
              {activeTab === 'grounding' ? 'FEATURE NAME INPUT' : activeTab === 'spectral' ? 'SPECTRAL INPUT' : 'QUESTION INPUT'}
            </p>

            {activeTab === 'spectral' ? (
              <form onSubmit={handleSubmit}>
                <button type="submit" disabled={loading || !spectralBands.red || !spectralBands.nir} className="mission-button flex w-full items-center justify-center gap-2 bg-[#00A3A6] px-5 py-3 text-xs font-bold text-white transition-all hover:bg-[#008C8F] disabled:cursor-not-allowed disabled:opacity-50">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Waves className="h-4 w-4" /> CALCULATE INDICES &gt;</>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {activeTab === 'grounding' ? (
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#00A3A6] bg-[#F8FAFC]">
                    <input
                      type="text"
                      value={featureName}
                      onChange={(e) => setFeatureName(e.target.value)}
                      placeholder="e.g. water body, solar panel, bridge..."
                      className="flex-1 px-4 py-3 bg-transparent text-xs text-slate-900 focus:outline-none font-mono"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="mission-button px-5 bg-[#00A3A6] hover:bg-[#008C8F] text-white text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>LOCATE &gt;</span>}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#00A3A6] bg-[#F8FAFC]">
                      <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask a question or enter change query..."
                        className="flex-1 px-4 py-3 bg-transparent text-xs text-slate-900 focus:outline-none font-mono"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="mission-button px-5 bg-[#00A3A6] hover:bg-[#008C8F] text-white text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>SUBMIT &gt;</span>}
                      </button>
                    </div>

                    {/* Preset Question Buttons */}
                    {activeTab === 'vqa' && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {presets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPrompt(preset)}
                            className="px-2.5 py-1 rounded bg-[#E6F4F1] border border-[#00A3A6]/30 text-[#00A3A6] text-[10px] hover:bg-[#00A3A6] hover:text-white transition-colors"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </form>
            )}

            {/* Results Display Panel matching exact SIH contract */}
            {response && (
              <div className="space-y-4 pt-2">
                {response.error && (
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
                    <div>
                      <p className="font-bold">// LIVE MODEL UNAVAILABLE</p>
                      <p className="mt-1">{response.error}</p>
                    </div>
                    <button type="button" onClick={handleRetry} className="flex shrink-0 items-center gap-1.5 border border-amber-400 bg-white px-3 py-2 font-mono text-[10px] font-bold text-amber-800 transition-colors hover:bg-amber-100">
                      <RotateCcw className="h-3 w-3" /> RETRY
                    </button>
                  </div>
                )}
                {/* Grounding Null Case: Feature Not Found */}
                {activeTab === 'grounding' && response.bbox_percent === null && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-bold text-amber-950">// FEATURE NOT FOUND IN SCENE</p>
                      <p className="text-[11px] text-amber-800 mt-0.5">Could not locate "{featureName}" in the uploaded satellite image tile.</p>
                    </div>
                  </div>
                )}

                {/* Change Detection Badge (Green "Verified Change" vs Amber "No Significant Change") ABOVE answer text */}
                {activeTab === 'change' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#E6F4F1] border border-[#00A3A6]/30 font-mono">
                      <div className="flex items-center space-x-2">
                        {response.verified_change === null ? (
                          <span className="px-2.5 py-1 rounded bg-slate-500 text-white font-bold text-[10px] tracking-wider uppercase">
                            MODEL METRIC UNAVAILABLE
                          </span>
                        ) : response.verified_change ? (
                          <span className="px-2.5 py-1 rounded bg-emerald-500 text-white font-bold text-[10px] tracking-wider uppercase">
                            VERIFIED CHANGE
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-amber-500 text-white font-bold text-[10px] tracking-wider uppercase">
                            NO SIGNIFICANT CHANGE
                          </span>
                        )}
                        <span className="text-slate-600 text-xs">Deterministic Pixel Diff:</span>
                      </div>
                      <span className="text-sm font-bold text-[#00A3A6]">
                        {response.pixel_diff_percent == null ? 'N/A' : `${response.pixel_diff_percent}%`}
                      </span>
                    </div>

                    {/* Secondary Raw Model Answer expandable/subtle display */}
                    {response.raw_model_answer && (
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-mono">
                        <span className="font-semibold text-slate-700">// RAW MODEL CLAIM:</span> {response.raw_model_answer}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'spectral' && !response.error && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ['NDVI mean', response.ndvi_mean == null ? 'N/A' : response.ndvi_mean],
                      ['NDWI mean', response.ndwi_mean == null ? 'N/A' : response.ndwi_mean],
                      ['Water candidates', response.water_candidate_percent == null ? 'N/A' : `${response.water_candidate_percent}%`],
                      ['Flood candidates', response.flood_candidate_percent == null ? 'N/A' : `${response.flood_candidate_percent}%`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-[#00A3A6]/30 bg-[#E6F4F1] p-3">
                        <p className="font-mono text-[9px] uppercase tracking-wide text-slate-500">{label}</p>
                        <p className="mt-1 font-serif text-xl text-[#087D86]">{value}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
