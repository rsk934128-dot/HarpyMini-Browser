import React from 'react';
import {
  Settings as SettingsIcon,
  X,
  Zap,
  Shield,
  Search,
  BookOpen,
  Trash2,
  HardDrive,
  Info,
} from 'lucide-react';
import { UserBrowserSettings } from '../types/browser';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserBrowserSettings;
  onUpdateSettings: (newSettings: Partial<UserBrowserSettings>) => void;
  onClearHistory: () => void;
  historyCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearHistory,
  historyCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-white border border-slate-700">
              <SettingsIcon className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Browser Preferences</h3>
              <p className="text-xs text-slate-400">HarpyMini Engine v2.5.0</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-200">
          {/* Search Engine */}
          <div className="space-y-2">
            <label className="font-semibold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Default Search Engine</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['duckduckgo', 'google', 'bing'] as const).map((engine) => (
                <button
                  key={engine}
                  onClick={() => onUpdateSettings({ searchEngine: engine })}
                  className={`py-2 rounded-xl capitalize font-medium border transition-colors ${
                    settings.searchEngine === engine
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {engine}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & Data Saver */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Privacy & Data Saver</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <div>
                <div className="font-semibold text-white">Data Saver Mode</div>
                <div className="text-[11px] text-slate-400">
                  Strips tracking beacons, analytics scripts, and stops auto-playing heavy media.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.dataSaverEnabled}
                onChange={(e) => onUpdateSettings({ dataSaverEnabled: e.target.checked })}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <div>
                <div className="font-semibold text-white">Harpy Shield Anti-Tracker</div>
                <div className="text-[11px] text-slate-400">
                  Blocks fingerprinting and third-party advertising scripts.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.adBlockEnabled}
                onChange={(e) => onUpdateSettings({ adBlockEnabled: e.target.checked })}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Reader Mode Defaults */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Default Reader Styling</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Theme</label>
                <select
                  value={settings.readerTheme}
                  onChange={(e) => onUpdateSettings({ readerTheme: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="dark">Dark Slate</option>
                  <option value="sepia">Warm Sepia</option>
                  <option value="oled">OLED Black</option>
                  <option value="light">Crisp Light</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Font Family</label>
                <select
                  value={settings.readerFont}
                  onChange={(e) => onUpdateSettings({ readerFont: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="serif">Serif (Editorial)</option>
                  <option value="sans">Sans-Serif (Modern)</option>
                  <option value="mono">Monospace (Code)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clear Browsing Data */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="font-semibold text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Clear Browsing History</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-[11px] text-slate-400">
                Current history items: <strong className="text-white">{historyCount}</strong> (Incognito visits are never saved).
              </div>
              <button
                onClick={onClearHistory}
                disabled={historyCount === 0}
                className="px-3 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 disabled:opacity-40 text-red-300 border border-red-800 font-semibold text-xs transition-colors"
              >
                Clear History
              </button>
            </div>
          </div>

          {/* About */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>HarpyMini Browser Architecture</span>
            </div>
            <p>
              Built with React 19, Tailwind CSS, Google Gemini 3.8 Flash, Firebase Firestore & Auth, and Web Crypto AES-GCM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
