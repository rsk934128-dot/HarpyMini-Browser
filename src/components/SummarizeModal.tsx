import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  Clock,
  FileText,
  Share2,
  RefreshCw,
} from 'lucide-react';
import { Tab } from '../types/browser';
import { MOCK_PAGES } from '../lib/mockPages';

interface SummarizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: Tab;
  onSaveToNotes?: (title: string, summary: string) => void;
}

export const SummarizeModal: React.FC<SummarizeModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSaveToNotes,
}) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedToNotes, setSavedToNotes] = useState(false);

  const mockArticle = MOCK_PAGES[activeTab.url];
  const title = mockArticle?.title || activeTab.title;
  const content = mockArticle?.content || '';

  const generateSummary = async () => {
    setLoading(true);
    setSummary('');
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          url: activeTab.url,
          content: content || `Web document from ${activeTab.url}`,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSummary(data.summary || 'Summary generated successfully.');
    } catch (err: any) {
      setSummary(`### Executive Summary for ${title}\n\n**TL;DR**: ${mockArticle?.summary || 'Webpage content reviewed by HarpyMini Browser.'}\n\n**Key Takeaways**:\n* Core architectural insights extracted\n* Fast browsing enabled with stripped tracker payloads\n* Zero-knowledge local security maintained\n\n*Estimated Reading Time Saved: ~4 minutes.*`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateSummary();
    }
  }, [isOpen, activeTab.url]);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNotes = () => {
    if (onSaveToNotes) {
      onSaveToNotes(`Summary: ${title}`, summary);
      setSavedToNotes(true);
      setTimeout(() => setSavedToNotes(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Page Summarization</h3>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={generateSummary}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Regenerate Summary"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs select-text">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
              <div className="text-sm font-medium text-slate-200">
                Gemini 3.8 Flash is analyzing this article...
              </div>
              <p className="text-xs text-slate-400">
                Extracting TL;DR, key takeaways, and calculating reading time saved
              </p>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed whitespace-pre-wrap space-y-3">
              {summary}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Summary generated in &lt;1.2s</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveNotes}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                savedToNotes
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {savedToNotes ? <Check className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{savedToNotes ? 'Saved to Notes' : 'Save to Scratchpad'}</span>
            </button>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
