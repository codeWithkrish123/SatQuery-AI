import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Copy, Check, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StreamingResponse({
  text = '',
  sources = [],
  model = 'Gemini 1.5 Flash',
  isError = false,
  isLive = true,
  onComplete,
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  // Typewriter streaming effect
  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    // Split text into words to simulate token-by-token streaming
    const words = text.split(/(\s+)/);
    let index = 0;
    setDisplayedText('');
    setIsTyping(true);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      index += 2; // take word + whitespace
      if (index >= words.length) {
        setDisplayedText(text);
        setIsTyping(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (onComplete) onComplete();
      } else {
        setDisplayedText(words.slice(0, index).join(''));
      }
    }, 20); // 20ms per token for natural generative feel

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text]);

  // Text-To-Speech (Read Aloud)
  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  // Format markdown lines cleanly
  const renderFormattedContent = (content) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      // Headers (### or ##)
      if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
        const headerText = trimmed.replace(/^#+\s*/, '');
        return (
          <h4 key={idx} className="font-sans font-bold text-slate-900 text-xs mt-3 mb-1 tracking-tight flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A3A6]" />
            {headerText}
          </h4>
        );
      }

      // Bullet points (- or *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletText = trimmed.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-slate-700 text-xs leading-relaxed my-0.5">
            {formatInlineMarks(bulletText)}
          </li>
        );
      }

      // Standard paragraphs
      return (
        <p key={idx} className="text-slate-800 text-[13px] sm:text-sm leading-relaxed font-sans mb-2">
          {formatInlineMarks(line)}
        </p>
      );
    });
  };

  // Parse inline bold **text** and code `code`
  const formatInlineMarks = (str) => {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-[#E6F4F1] text-[#087D86] font-mono text-[11px] border border-[#00A3A6]/20">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`w-full text-slate-800 ${
        isError
          ? 'p-3.5 rounded-2xl bg-amber-50/90 text-amber-950 border border-amber-200'
          : 'pt-0.5'
      }`}
    >
      {/* Top Header Badge Row */}
      <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E6F4F1] text-[#087D86] font-bold border border-[#00A3A6]/20 shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#00A3A6] animate-pulse" />
            <span>{model || 'Gemini Vision AI'}</span>
          </div>

          {isLive && (
            <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[9px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              VERIFIED 24/7
            </span>
          )}
        </div>

        {/* Action Buttons: Listen & Copy */}
        <div className="flex items-center gap-1">
          {/* Read Aloud Button */}
          <button
            type="button"
            onClick={handleToggleSpeak}
            title={isSpeaking ? 'Stop Reading' : 'Read Aloud'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all ${
              isSpeaking
                ? 'bg-[#00A3A6] text-white shadow-xs animate-pulse'
                : 'bg-slate-100 text-slate-600 hover:bg-[#E6F4F1] hover:text-[#087D86]'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3 h-3" />
                <span className="hidden xs:inline">STOP</span>
                {/* Audio Wave animation bars */}
                <span className="flex items-end gap-0.5 h-2.5 ml-1">
                  <span className="w-0.5 h-full bg-white animate-[bounce_0.6s_infinite_100ms]" />
                  <span className="w-0.5 h-2 bg-white animate-[bounce_0.6s_infinite_200ms]" />
                  <span className="w-0.5 h-3 bg-white animate-[bounce_0.6s_infinite_300ms]" />
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3" />
                <span className="hidden xs:inline">LISTEN</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy Response"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-[10px] font-mono font-semibold"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="hidden xs:inline">COPY</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content with Typewriter / Streaming animation */}
      <div className="relative leading-relaxed">
        {renderFormattedContent(displayedText)}

        {/* Blinking Streaming Cursor */}
        {isTyping && (
          <span className="inline-block w-2 h-3.5 ml-1 bg-[#00A3A6] rounded-xs animate-pulse align-middle shadow-[0_0_8px_#00A3A6]" />
        )}
      </div>

      {/* Grounded Source Citations */}
      {sources && sources.length > 0 && !isError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mt-3.5 pt-2.5 border-t border-slate-100 font-mono text-[10px]"
        >
          <div className="flex items-center gap-1.5 text-[#087D86] font-bold mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GROUNDED MISSION SOURCES &amp; EVIDENCE:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((src, i) => (
              <a
                key={i}
                href={src.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#E6F4F1] text-[#087D86] border border-[#00A3A6]/30 hover:bg-[#00A3A6] hover:text-white transition-all shadow-2xs font-semibold"
              >
                <span>{src.title || src.source_id}</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
