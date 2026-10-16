import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Lock,
  Search,
  Sparkles,
  BookOpen,
  Mic,
  Star,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Zap,
  KeyRound,
  Download,
  Grid,
  Wallet,
  Settings as SettingsIcon,
  User as UserIcon,
  Check,
  Monitor,
  Webhook,
} from 'lucide-react';
import { Tab, Bookmark } from '../types/browser';
import { User } from 'firebase/auth';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  onOpenWebhookStudio?: () => void;
  activeTab: Tab;
  onNavigate: (url: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  onGoHome: () => void;
  onToggleReaderMode: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  dataSaverEnabled: boolean;
  onToggleDataSaver: () => void;
  onOpenAiAssistant: () => void;
  onOpenSummarize: () => void;
  onOpenVoiceCommand: () => void;
  onOpenQrModal: () => void;
  onOpenPasswordManager: () => void;
  onOpenOfflineDownloads: () => void;
  onOpenMiniApps: () => void;
  onOpenWeb3Wallet: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenDesktopGuide?: () => void;
  user: User | null;
  totalSavedKb: number;
  totalBlockedTrackers: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onGoHome,
  onToggleReaderMode,
  isBookmarked,
  onToggleBookmark,
  dataSaverEnabled,
  onToggleDataSaver,
  onOpenAiAssistant,
  onOpenSummarize,
  onOpenVoiceCommand,
  onOpenQrModal,
  onOpenPasswordManager,
  onOpenOfflineDownloads,
  onOpenMiniApps,
  onOpenWeb3Wallet,
  onOpenSettings,
  onOpenAuth,
  onOpenDesktopGuide,
  user,
  totalSavedKb,
  totalBlockedTrackers,
}) => {
  const [inputValue, setInputValue] = useState(activeTab.url || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showSecurityShield, setShowSecurityShield] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(activeTab.url === 'harpymini://newtab' ? '' : activeTab.url);
  }, [activeTab.url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onNavigate(inputValue.trim());
    inputRef.current?.blur();
  };

  const isInternalUrl = activeTab.url.startsWith('harpymini://');

  return (
    <div className={`relative px-3 py-2 flex items-center gap-2 border-b select-none transition-colors duration-200 ${
      activeTab.isIncognito
        ? 'bg-slate-950 border-slate-800 text-slate-100'
        : 'bg-slate-900/95 border-slate-800 text-slate-200'
    }`}>
      {/* Navigation Controls: Back, Forward, Reload, Home */}
      <div className="flex items-center gap-0.5 text-slate-400">
        <button
          type="button"
          onClick={onGoBack}
          disabled={!activeTab.canGoBack}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onGoForward}
          disabled={!activeTab.canGoForward}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Forward"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onReload}
          className={`p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors ${
            activeTab.isLoading ? 'text-cyan-400 animate-spin' : ''
          }`}
          title="Reload Page"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onGoHome}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Home Page"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Omnibar / Address Bar */}
      <form
        onSubmit={handleSubmit}
        className={`flex-1 flex items-center gap-2 h-9 px-3 rounded-xl border text-xs transition-all duration-150 ${
          isFocused
            ? 'bg-slate-950 border-cyan-500/80 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30'
            : activeTab.isIncognito
              ? 'bg-slate-900 border-purple-900/60 hover:border-purple-700/60'
              : 'bg-slate-800/80 border-slate-700/70 hover:border-slate-600'
        }`}
      >
        {/* Security Lock Badge */}
        <button
          type="button"
          onClick={() => setShowSecurityShield(!showSecurityShield)}
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
          title="Connection Security & Data Saver info"
        >
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400/90">
            {isInternalUrl ? 'Internal' : 'Secure'}
          </span>
        </button>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search with Google / DuckDuckGo or enter web address..."
          className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none text-xs font-sans tracking-wide"
        />

        {/* Omnibar Inside Tools: Data Saver status, Bookmark, Reader, Voice, QR */}
        <div className="flex items-center gap-1 text-slate-400">
          {/* Data Saver Indicator & Quick Toggle */}
          <button
            type="button"
            onClick={onToggleDataSaver}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              dataSaverEnabled
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title={`Data Saver: ${dataSaverEnabled ? 'ON (Blocking Trackers & Heavy Assets)' : 'OFF'}`}
          >
            <Zap className={`w-3 h-3 ${dataSaverEnabled ? 'text-emerald-400 fill-emerald-400' : ''}`} />
            <span className="hidden lg:inline text-[10px]">
              {dataSaverEnabled ? 'Data Saver' : 'Save Data'}
            </span>
          </button>

          {/* Reader Mode Toggle */}
          {!isInternalUrl && (
            <button
              type="button"
              onClick={onToggleReaderMode}
              className={`p-1 rounded hover:bg-slate-700/60 transition-colors ${
                activeTab.readerMode ? 'text-amber-400 bg-amber-950/60' : 'hover:text-amber-300'
              }`}
              title="Reader Mode (Distraction-Free Reading)"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Bookmark Button */}
          {!isInternalUrl && (
            <button
              type="button"
              onClick={onToggleBookmark}
              className={`p-1 rounded hover:bg-slate-700/60 transition-colors ${
                isBookmarked ? 'text-amber-400 fill-amber-400' : 'hover:text-amber-300'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this page'}
            >
              <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>
          )}

          {/* Voice Command Button */}
          <button
            type="button"
            onClick={onOpenVoiceCommand}
            className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Voice Commands & Search"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          {/* QR Code Scanner / Generator */}
          <button
            type="button"
            onClick={onOpenQrModal}
            className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Scan / Generate QR Code"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Security & Data Saver Popover */}
      {showSecurityShield && (
        <div className="absolute top-12 left-32 z-50 w-72 p-3.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">HarpyMini Shield</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono">
              PROTECTED
            </span>
          </div>

          <div className="space-y-1.5 text-slate-300">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Connection:</span>
              <span className="text-emerald-400 font-medium">TLS 1.3 / AES-256</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Trackers Blocked:</span>
              <span className="text-cyan-400 font-mono font-bold">{totalBlockedTrackers} trackers</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Bandwidth Saved:</span>
              <span className="text-emerald-400 font-mono font-bold">{totalSavedKb.toFixed(1)} KB</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Incognito State:</span>
              <span className={activeTab.isIncognito ? 'text-purple-400 font-medium' : 'text-slate-400'}>
                {activeTab.isIncognito ? 'Stealth Active' : 'Normal Session'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSecurityShield(false)}
            className="w-full py-1 text-center bg-slate-800 hover:bg-slate-700 rounded text-slate-200 text-[11px] transition-colors"
          >
            Close Shield Details
          </button>
        </div>
      )}

      {/* Browser Toolbar Right Actions */}
      <div className="flex items-center gap-1">
        {/* Quick Summarize AI Button */}
        {!isInternalUrl && (
          <button
            type="button"
            onClick={onOpenSummarize}
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 text-xs font-medium transition-all shadow-sm"
            title="Summarize Page with Gemini AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px]">Summarize</span>
          </button>
        )}

        {/* AI Assistant Drawer Toggle */}
        <button
          type="button"
          onClick={onOpenAiAssistant}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all"
          title="Open HarpyMini AI Assistant"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-[11px]">AI Assistant</span>
        </button>

        {/* Password Manager Vault */}
        <button
          type="button"
          onClick={onOpenPasswordManager}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
          title="Encrypted Password Manager (AES-GCM)"
        >
          <KeyRound className="w-4 h-4" />
        </button>

        {/* Offline Downloads */}
        <button
          type="button"
          onClick={onOpenOfflineDownloads}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
          title="Offline Saved Pages"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* HarpyMini Apps Market / মিনি অ্যাপস বাজার */}
        <button
          type="button"
          onClick={() => onNavigate('harpymini://market')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeTab.url === 'harpymini://market'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-slate-800/80 hover:bg-slate-800 text-cyan-300 hover:text-white border border-slate-700/80'
          }`}
          title="HarpyMini Apps Market • মিনি অ্যাপস বাজার"
        >
          <Grid className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden xl:inline text-[11px]">মিনি অ্যাপ বাজার</span>
        </button>

        {/* Mini Apps Drawer */}
        <button
          type="button"
          onClick={onOpenMiniApps}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
          title="Quick Tools (Calculator, Notes, Speed Test)"
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Web3 Wallet */}
        <button
          type="button"
          onClick={onOpenWeb3Wallet}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-purple-400 transition-colors"
          title="Web3 Wallet Integration (UI Ready)"
        >
          <Wallet className="w-4 h-4" />
        </button>

        {/* User Account / Google Cloud Sync */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title={user ? `Signed in as ${user.displayName || user.email}` : 'Sign in to sync bookmarks and passwords'}
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="User Avatar"
              className="w-6 h-6 rounded-full border border-cyan-400 object-cover"
            />
          ) : (
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              user ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              <UserIcon className="w-3.5 h-3.5" />
            </div>
          )}
        </button>

        {/* PWA / PWABuilder Install Button */}
        <PWAInstallButton />

        {/* Desktop App Setup Guide */}
        {onOpenDesktopGuide && (
          <button
            type="button"
            onClick={onOpenDesktopGuide}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title="HarpyMini Desktop Edition (.exe / .dmg) Setup Guide"
          >
            <Monitor className="w-4 h-4" />
          </button>
        )}

        {/* Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Browser Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
