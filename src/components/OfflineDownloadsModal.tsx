import React, { useState } from 'react';
import {
  Download,
  Trash2,
  X,
  BookOpen,
  FileText,
  Search,
  ExternalLink,
  HardDrive,
} from 'lucide-react';
import { OfflinePage } from '../types/browser';

interface OfflineDownloadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  offlinePages: OfflinePage[];
  onOpenPage: (page: OfflinePage) => void;
  onDeletePage: (id: string) => void;
}

export const OfflineDownloadsModal: React.FC<OfflineDownloadsModalProps> = ({
  isOpen,
  onClose,
  offlinePages,
  onOpenPage,
  onDeletePage,
}) => {
  const [search, setSearch] = useState('');
  const [selectedPage, setSelectedPage] = useState<OfflinePage | null>(null);

  if (!isOpen) return null;

  const filtered = offlinePages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.url.toLowerCase().includes(search.toLowerCase())
  );

  const totalSize = offlinePages.reduce((acc, p) => acc + (p.sizeKb || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Offline Downloads & Articles</h3>
              <p className="text-xs text-slate-400">
                {offlinePages.length} pages saved • {(totalSize).toFixed(1)} KB offline storage used
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search downloaded offline pages..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Content list or preview */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs space-y-2">
              <HardDrive className="w-8 h-8 mx-auto text-slate-600" />
              <div>No offline pages saved yet.</div>
              <p className="text-[11px] text-slate-600">
                Click the "Save Offline" button on any webpage or in Reader Mode to store it for offline reading.
              </p>
            </div>
          ) : (
            filtered.map((page) => (
              <div
                key={page.id}
                className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between gap-3 text-xs transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-bold text-white truncate">{page.title}</h4>
                  <div className="text-[11px] text-slate-400 truncate">{page.url}</div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span>Saved: {new Date(page.savedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono">{page.sizeKb} KB</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onOpenPage(page);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm text-xs transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Offline</span>
                  </button>

                  <button
                    onClick={() => onDeletePage(page.id)}
                    className="p-2 rounded-xl bg-slate-700/60 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete offline copy"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
