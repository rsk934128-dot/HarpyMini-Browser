import React, { useState, useEffect } from 'react';
import { Tab, Bookmark } from '../types/browser';
import { NewTabPage } from './NewTabPage';
import { ReaderModeView } from './ReaderModeView';
import { MiniAppsMarketView } from './MiniAppsMarketView';
import { MOCK_PAGES } from '../lib/mockPages';
import {
  ShieldAlert,
  Zap,
  Sparkles,
  BookOpen,
  Download,
  ExternalLink,
  Lock,
  Globe,
  RefreshCw,
} from 'lucide-react';

interface BrowserViewProps {
  activeTab: Tab;
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onToggleReaderMode: () => void;
  onOpenSummarize: () => void;
  onOpenMiniApp: (app: 'calculator' | 'notes' | 'speed' | 'wallet') => void;
  onOpenPasswordManager: () => void;
  onSaveOffline: (title: string, url: string, content: string) => void;
  dataSaverEnabled: boolean;
  totalSavedKb: number;
  totalBlockedTrackers: number;
}

export const BrowserView: React.FC<BrowserViewProps> = ({
  activeTab,
  bookmarks,
  onNavigate,
  onToggleReaderMode,
  onOpenSummarize,
  onOpenMiniApp,
  onOpenPasswordManager,
  onSaveOffline,
  dataSaverEnabled,
  totalSavedKb,
  totalBlockedTrackers,
}) => {
  const [proxyData, setProxyData] = useState<{
    html?: string;
    originalSizeKb?: number;
    finalSizeKb?: number;
    savedKb?: number;
    blockedTrackersCount?: number;
  } | null>(null);
  const [proxyLoading, setProxyLoading] = useState(false);

  const isNewTab = activeTab.url === 'harpymini://newtab';
  const isMarket = activeTab.url === 'harpymini://market' || activeTab.url === 'harpymini://bazar';
  const mockArticle = MOCK_PAGES[activeTab.url];

  // If visiting an external URL that isn't a mock article and not newtab or market
  useEffect(() => {
    if (!isNewTab && !isMarket && !mockArticle && activeTab.url.startsWith('http')) {
      let isMounted = true;
      setProxyLoading(true);
      fetch(`/api/proxy/fetch?url=${encodeURIComponent(activeTab.url)}&dataSaver=${dataSaverEnabled}`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) {
            setProxyData(data);
            setProxyLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setProxyLoading(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setProxyData(null);
    }
  }, [activeTab.url, dataSaverEnabled, isNewTab, isMarket, mockArticle]);

  if (isMarket) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-950/80">
        <MiniAppsMarketView
          onLaunchApp={(appKey) => {
            if (appKey === 'calculator' || appKey === 'notes' || appKey === 'speed' || appKey === 'converter') {
              onOpenMiniApp(appKey as any);
            } else if (appKey === 'qr') {
              // open qr modal via custom handler or app
              onOpenMiniApp('speed');
            }
          }}
          onOpenCustomUrl={onNavigate}
        />
      </div>
    );
  }

  if (isNewTab) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-950/70">
        <NewTabPage
          onNavigate={onNavigate}
          bookmarks={bookmarks}
          onOpenMiniApp={onOpenMiniApp}
          onOpenPasswordManager={onOpenPasswordManager}
          totalSavedKb={totalSavedKb}
          totalBlockedTrackers={totalBlockedTrackers}
          isIncognito={activeTab.isIncognito}
        />
      </div>
    );
  }

  // Reader Mode View
  if (activeTab.readerMode) {
    const title = mockArticle?.title || proxyData?.html?.match(/<title>(.*?)<\/title>/i)?.[1] || activeTab.title;
    const content = mockArticle?.content || (proxyData?.html ? proxyData.html.replace(/<[^>]*>?/gm, ' ') : 'Extracted article content ready for reading.');
    return (
      <div className="flex-1 overflow-y-auto">
        <ReaderModeView
          title={title}
          url={activeTab.url}
          content={content}
          author={mockArticle?.author}
          readTime={mockArticle?.readTime}
          date={mockArticle?.date}
          onExit={onToggleReaderMode}
          onSaveOffline={() => onSaveOffline(title, activeTab.url, content)}
          onSummarize={onOpenSummarize}
        />
      </div>
    );
  }

  // Pre-rendered high-fidelity simulated article
  if (mockArticle) {
    return (
      <div className={`flex-1 overflow-y-auto select-text ${
        activeTab.isIncognito ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-200'
      }`}>
        {/* Banner with Data Saver and AI actions */}
        <div className="bg-slate-800/80 border-b border-slate-700/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-white">{mockArticle.domain}</span>
            <span className="text-slate-400">• Verified TLS 1.3</span>
            {dataSaverEnabled && (
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono text-[11px]">
                Data Saver: Blocked {mockArticle.trackersCount} trackers
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleReaderMode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 text-amber-300 font-medium transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Reader Mode</span>
            </button>
            <button
              onClick={onOpenSummarize}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Summary</span>
            </button>
            <button
              onClick={() => onSaveOffline(mockArticle.title, mockArticle.url, mockArticle.content)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Offline</span>
            </button>
          </div>
        </div>

        {/* Hero Article View */}
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <span>{mockArticle.category}</span>
              <span>•</span>
              <span className="text-slate-400">{mockArticle.date}</span>
              <span>•</span>
              <span className="text-slate-400">{mockArticle.readTime}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {mockArticle.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed italic border-l-4 border-cyan-500 pl-4 py-1 bg-cyan-500/5">
              {mockArticle.summary}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <span>By <strong className="text-slate-200">{mockArticle.author}</strong></span>
            </div>
          </div>

          {mockArticle.heroImage && (
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl max-h-[420px]">
              <img
                src={mockArticle.heroImage}
                alt={mockArticle.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Formatted Content */}
          <div className="prose prose-invert max-w-none space-y-4 text-slate-200 text-sm sm:text-base leading-relaxed">
            {mockArticle.content.split('\n\n').map((block, i) => {
              if (block.startsWith('## ')) {
                return (
                  <h2 key={i} className="text-xl sm:text-2xl font-bold text-white pt-4 pb-2 border-b border-slate-800">
                    {block.replace('## ', '')}
                  </h2>
                );
              }
              if (block.startsWith('### ')) {
                return (
                  <h3 key={i} className="text-lg sm:text-xl font-bold text-cyan-300 pt-2">
                    {block.replace('### ', '')}
                  </h3>
                );
              }
              if (block.startsWith('> ')) {
                return (
                  <blockquote key={i} className="border-l-4 border-amber-500 pl-4 py-2 italic text-amber-200/90 bg-amber-500/10 rounded-r my-4">
                    {block.replace('> ', '')}
                  </blockquote>
                );
              }
              return <p key={i}>{block}</p>;
            })}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-800">
            {mockArticle.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 border border-slate-700">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // External Web URL via HarpyMini Proxy & Sanitizer
  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Proxy Toolbar */}
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 truncate">
          <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="font-semibold text-white truncate">{activeTab.url}</span>
          {proxyData?.savedKb && (
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[11px]">
              Saved {proxyData.savedKb} KB • {proxyData.blockedTrackersCount} Trackers Blocked
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onToggleReaderMode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/60 font-medium"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Reader Mode</span>
          </button>
          <button
            onClick={onOpenSummarize}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Summarize</span>
          </button>
        </div>
      </div>

      {proxyLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
          <div className="text-sm font-medium">HarpyMini Engine fetching and sanitizing page...</div>
          <div className="text-xs text-slate-500">Stripping third-party trackers & running Data Saver filters</div>
        </div>
      ) : proxyData?.html ? (
        <div className="flex-1 overflow-y-auto bg-slate-900 p-6 max-w-4xl mx-auto w-full">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white">
              {proxyData.html.match(/<title>(.*?)<\/title>/i)?.[1] || activeTab.url}
            </h1>
            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-cyan-400">HarpyMini Sanitized Preview</div>
              <p>Page successfully fetched through HarpyMini Proxy with Data Saver filters applied.</p>
              <div className="flex gap-4 font-mono text-emerald-400 pt-1">
                <span>Original: {proxyData.originalSizeKb} KB</span>
                <span>Optimized: {proxyData.finalSizeKb} KB</span>
                <span>Saved: {proxyData.savedKb} KB</span>
              </div>
            </div>
            <div
              className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: proxyData.html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''),
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-6 text-slate-300">
          <Globe className="w-12 h-12 text-cyan-400/80" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">External Web Address</h2>
            <p className="text-xs text-slate-400 max-w-md">
              Target: <code className="text-cyan-400 font-mono">{activeTab.url}</code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleReaderMode}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20"
            >
              Open in Reader Mode
            </button>
            <button
              onClick={onOpenSummarize}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Summarize with AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
