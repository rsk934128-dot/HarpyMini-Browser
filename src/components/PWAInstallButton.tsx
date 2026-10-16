import React, { useState } from 'react';
import { Download, Check, Sparkles, Smartphone, Monitor, Shield, X, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstalledSuccess(true);
        setTimeout(() => setShowModal(false), 2000);
      }
    } else {
      setShowModal(true);
    }
  };

  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
        <Check className="w-3.5 h-3.5" />
        Installed PWA
      </span>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Install HarpyMini as PWA App"
        className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all shadow-sm hover:shadow-cyan-500/10 hover:border-cyan-400/50"
      >
        <Download className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
        <span className="hidden sm:inline">Install PWA</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with HarpyMini Logo */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/pwa-192x192.png"
                alt="HarpyMini Logo"
                className="w-14 h-14 rounded-xl shadow-lg border border-cyan-500/30 bg-slate-950 p-0.5 object-cover"
              />
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                  HarpyMini Browser
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    PWA Ready
                  </span>
                </h3>
                <p className="text-xs text-slate-400">PWABuilder & Modern App Store Standard</p>
              </div>
            </div>

            {installedSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center my-4">
                <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="font-semibold text-emerald-300">Successfully Installed!</h4>
                <p className="text-xs text-emerald-200/80 mt-1">
                  HarpyMini is now available as a standalone desktop/mobile app on your device.
                </p>
              </div>
            ) : isIOS ? (
              <div className="space-y-3 my-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-xs">
                <h4 className="font-semibold text-cyan-300 flex items-center gap-1.5 text-sm">
                  <Smartphone className="w-4 h-4" /> Install on iPhone / iPad (iOS)
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                  <li>
                    Tap Safari's <span className="font-medium text-white">Share</span> button (the box with an up arrow).
                  </li>
                  <li>
                    Scroll down and tap <span className="font-medium text-white">"Add to Home Screen"</span>.
                  </li>
                  <li>
                    Confirm with <span className="font-medium text-cyan-400">"Add"</span> to launch with full native standalone experience!
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 my-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-xs">
                <h4 className="font-semibold text-cyan-300 flex items-center gap-1.5 text-sm">
                  <Monitor className="w-4 h-4" /> Install on Windows / Mac / Chrome / Edge
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  HarpyMini is fully certified for <strong>PWABuilder</strong> and <strong>Chromium Standalone PWA</strong> mode:
                </p>
                <ul className="space-y-1.5 text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Look for the <strong>Install Icon (🖥️ / ⊕)</strong> in your browser's address bar.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Or click Chrome/Edge menu (⋮) &rarr; <strong>"Install HarpyMini Browser"</strong>.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Fully works offline with cached Mini Apps and fast launching!
                  </li>
                </ul>
              </div>
            )}

            {/* PWA Standards & Features List */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 mb-4">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Maskable & 512px Icons</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Offline Service Worker</span>
              </div>
            </div>

            <div className="flex gap-2">
              {isInstallable && !installedSuccess && (
                <button
                  onClick={install}
                  className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-medium text-white text-xs shadow-md shadow-cyan-500/20 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Install Now
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition border border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
