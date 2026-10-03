import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, MicOff, Send, X, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoicePromptBar({
  prompt = '',
  setPrompt,
  onSubmit,
  loading = false,
  attachedImage = null,
  attachedImagePreview = null,
  onAttachImage,
  onRemoveAttachment,
  placeholder = "Ask a question about this satellite scene, identify objects, or detect changes...",
  presets = [],
  onSelectPreset,
  allowEmptySubmit = false,
}) {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  const canSubmit = !loading && (prompt.trim().length > 0 || allowEmptySubmit);

  // Initialize Web Speech API for voice dictation
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      if (currentTranscript) {
        setPrompt(currentTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition notice:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [setPrompt]);

  const toggleVoiceListening = () => {
    if (!speechSupported) {
      alert('Voice dictation is not supported by your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition start error:', err);
        setIsListening(false);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onAttachImage) {
      onAttachImage(file);
    }
    // reset input so same file can be re-selected if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) {
        onSubmit(e);
      }
    }
  };

  return (
    <div className="space-y-3 font-mono">
      {/* Attached File Preview Chip */}
      <AnimatePresence>
        {attachedImagePreview && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#00A3A6]/30 shadow-xs max-w-fit"
          >
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
              <img src={attachedImagePreview} alt="Attached satellite scene" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col pr-1">
              <span className="text-[11px] font-bold text-slate-800 truncate max-w-[160px] sm:max-w-[220px]">
                {attachedImage?.name || 'satellite_scene.png'}
              </span>
              <span className="text-[9px] text-[#00A3A6] font-semibold">
                ATTACHED FOR MULTIMODAL INFERENCE
              </span>
            </div>
            <button
              type="button"
              onClick={onRemoveAttachment}
              className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors ml-1"
              title="Remove Attachment"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glassmorphic Input Shell */}
      <div
        className={`relative flex flex-col rounded-2xl border transition-all duration-200 bg-white/95 backdrop-blur-md shadow-xs ${
          isListening
            ? 'border-red-400 ring-4 ring-red-500/10'
            : 'border-slate-200/90 focus-within:border-[#00A3A6] focus-within:ring-4 focus-within:ring-[#00A3A6]/10'
        }`}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.tif,.tiff"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Text Input Row */}
        <div className="flex items-center px-3.5 py-2.5">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening to your voice... Speak now" : placeholder}
            className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono py-1.5"
          />

          {/* Action Tools Inside Input Pill */}
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload image from device"
              className={`p-2 rounded-xl text-slate-500 hover:text-[#00A3A6] hover:bg-[#E6F4F1] transition-all relative ${
                attachedImage ? 'text-[#00A3A6] bg-[#E6F4F1]' : ''
              }`}
            >
              <Paperclip className="w-4 h-4" />
              {attachedImage && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#00A3A6]" />
              )}
            </button>

            {/* Voice Dictation (Microphone) Button */}
            <button
              type="button"
              onClick={toggleVoiceListening}
              title={isListening ? "Stop listening" : "Speak to query (Speech-to-Text)"}
              className={`relative p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)] animate-pulse'
                  : 'text-slate-500 hover:text-[#00A3A6] hover:bg-[#E6F4F1]'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                  </span>
                </>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Submit Button */}
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit}
              className="flex items-center justify-center p-2 rounded-xl bg-[#00A3A6] text-white hover:bg-[#008C8F] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs hover:shadow-md hover:scale-105 active:scale-95"
              title={canSubmit ? "Submit Query" : "Type your query or speak into mic to submit"}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Live Speech Recognition Listening Bar Indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between px-4 py-1.5 bg-rose-50 border-t border-rose-100 rounded-b-2xl text-[10px] text-rose-700"
            >
              <div className="flex items-center gap-2">
                <span className="flex gap-0.5 items-end h-3">
                  <span className="w-1 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-3.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1.5 bg-rose-500 rounded-full animate-bounce" />
                </span>
                <span className="font-bold">LISTENING... SPEAK YOUR SATELLITE QUERY</span>
              </div>
              <button
                type="button"
                onClick={toggleVoiceListening}
                className="font-bold uppercase tracking-wider text-rose-800 hover:underline"
              >
                DONE
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preset Suggestions Chips */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-[#00A3A6]" /> SUGGESTED:
          </span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPreset && onSelectPreset(preset)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E6F4F1] border border-[#00A3A6]/25 text-[#087D86] text-[10px] font-semibold hover:bg-[#00A3A6] hover:text-white transition-all shadow-2xs hover:scale-102"
            >
              <span>{preset}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
