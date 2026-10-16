import React, { useState } from 'react';
import {
  Type,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Bookmark,
  Share2,
  Download,
  X,
  Sparkles,
  Check,
} from 'lucide-react';

interface ReaderModeViewProps {
  title: string;
  url: string;
  content: string;
  author?: string;
  readTime?: string;
  date?: string;
  onExit: () => void;
  onSaveOffline: () => void;
  onSummarize: () => void;
}

export const ReaderModeView: React.FC<ReaderModeViewProps> = ({
  title,
  url,
  content,
  author,
  readTime = '4 min read',
  date,
  onExit,
  onSaveOffline,
  onSummarize,
}) => {
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light' | 'oled'>('dark');
  const [fontSize, setFontSize] = useState<number>(17);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('serif');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSpeakToggle = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      // Clean content for speech
      const plainText = `${title}. ${content.replace(/[#*`_>]/g, '')}`;
      const utterance = new SpeechSynthesisUtterance(plainText.slice(0, 3000));
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleSaveOfflineClick = () => {
    onSaveOffline();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const themeClasses = {
    dark: 'bg-slate-900 text-slate-200 border-slate-800',
    oled: 'bg-black text-slate-100 border-neutral-900',
    sepia: 'bg-[#fbf0d9] text-[#433422] border-[#ebd4b3]',
    light: 'bg-white text-slate-900 border-slate-200',
  }[theme];

  const fontClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  }[fontFamily];

  return (
    <div className={`min-h-full w-full transition-colors duration-200 select-text ${themeClasses}`}>
      {/* Top Floating Reader Bar */}
      <div className={`sticky top-0 z-30 px-4 py-2.5 border-b backdrop-blur-md flex flex-wrap items-center justify-between gap-3 ${
        theme === 'dark' || theme === 'oled' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
            Reader Mode
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">{readTime}</span>
        </div>

        {/* Reader Controls: Font Family, Font Size, Theme, Speech, Summarize, Save */}
        <div className="flex items-center gap-1.5 text-xs">
          {/* Font Family */}
          <div className="flex rounded-lg border border-slate-700/60 overflow-hidden">
            <button
              onClick={() => setFontFamily('sans')}
              className={`px-2 py-1 font-sans ${fontFamily === 'sans' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
              title="Sans-serif"
            >
              Sans
            </button>
            <button
              onClick={() => setFontFamily('serif')}
              className={`px-2 py-1 font-serif ${fontFamily === 'serif' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
              title="Serif"
            >
              Serif
            </button>
            <button
              onClick={() => setFontFamily('mono')}
              className={`px-2 py-1 font-mono ${fontFamily === 'mono' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
              title="Monospace"
            >
              Mono
            </button>
          </div>

          {/* Font Size A- / A+ */}
          <div className="flex rounded-lg border border-slate-700/60 overflow-hidden">
            <button
              onClick={() => setFontSize(Math.max(13, fontSize - 2))}
              className="px-2 py-1 hover:bg-slate-800 text-slate-300 font-bold"
              title="Smaller font"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize(Math.min(26, fontSize + 2))}
              className="px-2 py-1 hover:bg-slate-800 text-slate-300 font-bold"
              title="Larger font"
            >
              A+
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex rounded-lg border border-slate-700/60 overflow-hidden">
            <button
              onClick={() => setTheme('dark')}
              className={`w-6 h-6 flex items-center justify-center bg-slate-900 text-white ${theme === 'dark' ? 'ring-2 ring-cyan-400' : ''}`}
              title="Dark Theme"
            >
              D
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`w-6 h-6 flex items-center justify-center bg-[#fbf0d9] text-[#433422] ${theme === 'sepia' ? 'ring-2 ring-cyan-400' : ''}`}
              title="Sepia Paper Theme"
            >
              S
            </button>
            <button
              onClick={() => setTheme('oled')}
              className={`w-6 h-6 flex items-center justify-center bg-black text-white ${theme === 'oled' ? 'ring-2 ring-cyan-400' : ''}`}
              title="OLED Black Theme"
            >
              O
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`w-6 h-6 flex items-center justify-center bg-white text-black ${theme === 'light' ? 'ring-2 ring-cyan-400' : ''}`}
              title="Light Theme"
            >
              L
            </button>
          </div>

          {/* Text-to-Speech Aloud */}
          <button
            onClick={handleSpeakToggle}
            className={`p-1.5 rounded-lg border border-slate-700/60 transition-colors ${
              isSpeaking ? 'bg-cyan-600 text-white animate-pulse' : 'hover:bg-slate-800 text-slate-300'
            }`}
            title={isSpeaking ? 'Stop Reading Aloud' : 'Read Article Aloud (TTS)'}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Summarize button */}
          <button
            onClick={onSummarize}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-colors"
            title="Summarize with Gemini"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Summarize</span>
          </button>

          {/* Save Offline */}
          <button
            onClick={handleSaveOfflineClick}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors ${
              savedSuccess
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'border-slate-700/60 hover:bg-slate-800 text-slate-300'
            }`}
            title="Save for offline reading"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{savedSuccess ? 'Saved' : 'Offline'}</span>
          </button>

          {/* Exit Reader Mode */}
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Exit Reader View"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Article Body */}
      <article className={`max-w-3xl mx-auto py-10 px-6 sm:px-12 leading-relaxed ${fontClasses}`} style={{ fontSize: `${fontSize}px` }}>
        <header className="mb-8 pb-6 border-b border-current/20 space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm opacity-70">
            {author && <span>By {author}</span>}
            {date && <span>• {date}</span>}
            <span>• {readTime}</span>
            <span className="truncate max-w-xs font-mono text-xs opacity-60">({new URL(url.startsWith('http') ? url : `https://${url}`).hostname})</span>
          </div>
        </header>

        {/* Clean Content Parser */}
        <div className="space-y-5 whitespace-pre-line leading-relaxed">
          {content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={idx} className="text-xl sm:text-2xl font-bold pt-4 pb-1 border-b border-current/10">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-lg sm:text-xl font-bold pt-2">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('> ')) {
              return (
                <blockquote key={idx} className="border-l-4 border-cyan-500 pl-4 py-1 italic opacity-90 my-4 bg-cyan-500/5 rounded-r">
                  {paragraph.replace('> ', '')}
                </blockquote>
              );
            }
            return (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>
      </article>
    </div>
  );
};
