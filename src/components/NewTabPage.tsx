import React, { useState } from 'react';
import {
  Search,
  Globe,
  ShieldCheck,
  Zap,
  KeyRound,
  Download,
  Sparkles,
  Calculator,
  FileText,
  Activity,
  Wallet,
  ArrowRight,
  Plus,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Bookmark } from '../types/browser';
import { MOCK_PAGES } from '../lib/mockPages';

interface NewTabPageProps {
  onNavigate: (url: string) => void;
  bookmarks: Bookmark[];
  onOpenMiniApp: (app: 'calculator' | 'notes' | 'speed' | 'wallet') => void;
  onOpenPasswordManager: () => void;
  totalSavedKb: number;
  totalBlockedTrackers: number;
  isIncognito: boolean;
}

export const NewTabPage: React.FC<NewTabPageProps> = ({
  onNavigate,
  bookmarks,
  onOpenMiniApp,
  onOpenPasswordManager,
  totalSavedKb,
  totalBlockedTrackers,
  isIncognito,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchEngine, setSearchEngine] = useState<'google' | 'duckduckgo'>('duckduckgo');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onNavigate(searchQuery.trim());
  };

  const trendingArticles = Object.values(MOCK_PAGES);

  return (
    <div className={`min-h-full w-full py-10 px-4 md:px-8 max-w-5xl mx-auto space-y-8 select-none transition-colors duration-200 ${
      isIncognito ? 'text-slate-200' : 'text-slate-100'
    }`}>
      {/* Brand Hero & Incognito Status */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm backdrop-blur-sm bg-slate-800/60 border-slate-700/60 text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          {isIncognito ? 'Incognito Mode: Zero Footprint' : 'HarpyMini Browser v2.5 • AI & Privacy Native'}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <img
            src="/pwa-192x192.png"
            alt="HarpyMini Browser Logo"
            className="w-16 h-16 rounded-2xl shadow-xl shadow-cyan-500/20 border border-cyan-400/40 p-0.5 object-cover bg-slate-950 hover:scale-105 transition-transform"
          />
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                HarpyMini
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PWA Certified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Next-Gen AI & Privacy Browser • PWABuilder & Desktop Ready
            </p>
          </div>
        </div>

        <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto">
          {isIncognito
            ? 'Pages you view in this tab won’t appear in your browser history or leave cookies after you close this session.'
            : 'Fast, lightweight browsing with Gemini AI Assistant, AES-GCM Encrypted Vault, and Data Saver.'}
        </p>
      </div>

      {/* Central Search Bar with Search Engine Selector */}
      <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
        <div className="relative flex items-center rounded-2xl bg-slate-800/90 border border-slate-700 shadow-xl shadow-cyan-900/10 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
          <div className="pl-4 pr-2 text-slate-400 flex items-center gap-1.5">
            <Search className="w-5 h-5 text-cyan-400" />
            <select
              value={searchEngine}
              onChange={(e) => setSearchEngine(e.target.value as any)}
              className="bg-transparent text-[11px] font-semibold text-slate-400 focus:outline-none cursor-pointer"
            >
              <option value="duckduckgo" className="bg-slate-900 text-slate-200">DuckDuckGo</option>
              <option value="google" className="bg-slate-900 text-slate-200">Google</option>
            </select>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search the web privately or type a URL...`}
            className="flex-1 bg-transparent py-3.5 px-2 text-sm text-white placeholder-slate-400 focus:outline-none"
          />

          <button
            type="submit"
            className="mr-2 p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Privacy Shield & Data Saver Live Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-white">{totalBlockedTrackers}</div>
            <div className="text-[11px] text-slate-400 font-medium">Trackers Blocked</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-emerald-400">{totalSavedKb.toFixed(1)} KB</div>
            <div className="text-[11px] text-slate-400 font-medium">Bandwidth Saved</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-amber-300">AES-GCM</div>
            <div className="text-[11px] text-slate-400 font-medium">Encrypted Vault</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-purple-300">Gemini 3.8</div>
            <div className="text-[11px] text-slate-400 font-medium">Flash AI Ready</div>
          </div>
        </div>
      </div>

      {/* Speed Dials / Quick Bookmarks */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
          <span>Speed Dial & Bookmarks</span>
          <span className="text-[11px] text-slate-500">{bookmarks.length} saved</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {bookmarks.map((bm) => (
            <button
              key={bm.id}
              onClick={() => onNavigate(bm.url)}
              className="group p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-500/60 transition-all text-left flex flex-col gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-700/80 flex items-center justify-center text-base group-hover:scale-105 transition-transform">
                {bm.icon || '🌐'}
              </div>
              <div className="truncate text-xs font-semibold text-slate-200 group-hover:text-cyan-400">
                {bm.title}
              </div>
              <div className="truncate text-[10px] text-slate-500">
                {new URL(bm.url.startsWith('http') ? bm.url : `https://${bm.url}`).hostname}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mini Apps Bazar Showcase */}
      <div
        onClick={() => onNavigate('harpymini://market')}
        className="cursor-pointer group relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900 border border-indigo-700/60 hover:border-cyan-400/80 transition-all p-5 shadow-xl shadow-indigo-950/40 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            🛍️
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                মিনি অ্যাপস বাজার (Mini Apps Marketplace)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono border border-cyan-800 font-bold">
                NEW
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              যেকোনো অ্যাপস সার্চ করে বের করুন • ২০৪৮ গেম, টু-ডু প্ল্যানার, এআই স্টুডিও, ক্যালকুলেটর ও ক্রিপ্টো
            </p>
          </div>
        </div>

        {/* Visual Preview Image of Market */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="hidden sm:block w-36 h-20 rounded-xl overflow-hidden border border-indigo-500/40 shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
            <img
              src="src/assets/images/harpymini_market_1792154685523.jpg"
              alt="Mini Apps Bazar Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all flex-shrink-0">
            <span>বাজারে প্রবেশ করুন</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Built-in Mini Apps Shortcuts */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
          <span>HarpyMini Built-in Apps</span>
          <button
            onClick={() => onNavigate('harpymini://market')}
            className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>সব অ্যাপস দেখুন (View All Market)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onOpenMiniApp('calculator')}
            className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left flex items-center gap-3 transition-colors"
          >
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Calculator</div>
              <div className="text-[10px] text-slate-400">Scientific math</div>
            </div>
          </button>

          <button
            onClick={() => onOpenMiniApp('notes')}
            className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left flex items-center gap-3 transition-colors"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Scratchpad</div>
              <div className="text-[10px] text-slate-400">Quick notes & code</div>
            </div>
          </button>

          <button
            onClick={() => onOpenMiniApp('speed')}
            className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left flex items-center gap-3 transition-colors"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Speed Test</div>
              <div className="text-[10px] text-slate-400">Ping & latency meter</div>
            </div>
          </button>

          <button
            onClick={() => onOpenMiniApp('wallet')}
            className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left flex items-center gap-3 transition-colors"
          >
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Web3 Wallet</div>
              <div className="text-[10px] text-slate-400">dApp integration UI</div>
            </div>
          </button>
        </div>
      </div>

      {/* Featured Web Articles & Reader Demos */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
          <span>Trending & Offline-Ready Feeds</span>
          <span className="text-[11px] text-cyan-400">Supports AI Summarize & Reader Mode</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trendingArticles.map((article) => (
            <div
              key={article.url}
              onClick={() => onNavigate(article.url)}
              className="group cursor-pointer rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 overflow-hidden transition-all flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-cyan-950/20"
            >
              {article.heroImage && (
                <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                  <img
                    src={article.heroImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-cyan-300 border border-slate-700/60 font-mono">
                    {article.domain}
                  </div>
                </div>
              )}

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">{article.category}</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-mono">
                      Save {article.trackersCount} trackers
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-400 font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>Read Article</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
