import React, { useState } from 'react';
import {
  Monitor,
  X,
  Copy,
  Check,
  Download,
  Terminal,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DesktopGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopGuideModal: React.FC<DesktopGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <img
              src="/pwa-192x192.png"
              alt="HarpyMini Browser Logo"
              className="w-10 h-10 rounded-xl border border-cyan-500/30 object-cover bg-slate-950 p-0.5 shadow-md shadow-cyan-500/20"
            />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>HarpyMini Desktop & PWA (Windows / Mac / Android)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
                  PWABuilder & Chromium
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                PWA / PWABuilder এবং Electron Chromium ইঞ্জিন দিয়ে তৈরি আধুনিক ব্রাউজার
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-200">
          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Block</span>
              </div>
              <p className="text-[11px] text-slate-400">
                কোনো iframe বা CORS বাধা নেই। YouTube, Google, Facebook যেকোনো সাইট ১০০% সরাসরি চলবে।
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                <span>Native Engine</span>
              </div>
              <p className="text-[11px] text-slate-400">
                পুরো Chromium ইঞ্জিন ব্যাকএন্ডে থাকার কারণে দ্রুততম রেন্ডারিং ও স্মুথ ব্রাউজিং।
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <div className="text-purple-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Gemini & Apps</span>
              </div>
              <p className="text-[11px] text-slate-400">
                আমাদের বিল্ট-ইন Gemini 3.8 এআই সহকারী এবং মিনি অ্যাপস বাজার ডেস্কটপেই লাইভ থাকবে।
              </p>
            </div>
          </div>

          {/* Desktop Preview Mockup Image */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-xl max-h-52 bg-slate-950">
            <img
              src="src/assets/images/harpymini_home_1792154644772.jpg"
              alt="HarpyMini Desktop UI Preview"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] text-cyan-300 font-mono border border-cyan-500/30">
              Windows 11 / macOS Chromium Build
            </div>
          </div>

          {/* Steps to Build .exe on your PC */}
          <div className="space-y-4">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>আপনার কম্পিউটারে `.exe` ফাইল তৈরি করার ৩টি সহজ ধাপ:</span>
            </div>

            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center font-semibold text-white">
                <span>১. প্রজেক্টের প্যাকেজ ইনস্টল করুন:</span>
                <button
                  onClick={() => copyCode('npm install', 'step1')}
                  className="flex items-center gap-1 text-cyan-400 hover:underline text-[11px]"
                >
                  {copiedStep === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStep === 'step1' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-cyan-300">
                npm install
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center font-semibold text-white">
                <span>২. কম্পিউটারে সরাসরি ডেস্কটপ মোডে টেস্ট করতে চালান:</span>
                <button
                  onClick={() => copyCode('npm run electron:dev', 'step2')}
                  className="flex items-center gap-1 text-cyan-400 hover:underline text-[11px]"
                >
                  {copiedStep === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStep === 'step2' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-cyan-300">
                npm run electron:dev
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center font-semibold text-white">
                <span>৩. উইন্ডোজের জন্য ইনস্টলেবল সফটওয়্যার (`.exe` Installer) বানাতে:</span>
                <button
                  onClick={() => copyCode('npm run electron:build', 'step3')}
                  className="flex items-center gap-1 text-cyan-400 hover:underline text-[11px]"
                >
                  {copiedStep === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStep === 'step3' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-cyan-300">
                npm run electron:build
              </div>
              <p className="text-[11px] text-slate-400">
                কমান্ডটি শেষ হলে আপনার কম্পিউটারে <code className="text-amber-300 font-mono">dist-electron/HarpyMini Browser-Setup-2.5.0.exe</code> ফাইল তৈরি হয়ে যাবে!
              </p>
            </div>

            {/* Step 4 - PWABuilder */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 space-y-2">
              <div className="flex justify-between items-center font-semibold text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  ৪. PWABuilder দিয়ে মাইক্রোসফট স্টোর ও গুগল প্লে প্যাকেজ তৈরি:
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  PWABuilder Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                HarpyMini তে সব ধরনের PWABuilder রিকোয়ারমেন্টস (512px, 192px মাস্কেবল আইকন, সার্ভিস ওয়ার্কার ও কমপ্লিট ম্যানিফেস্ট) কনফিগার করা আছে।
              </p>
              <div className="p-2.5 rounded-xl bg-slate-950/90 font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                <span>https://www.pwabuilder.com</span>
                <button
                  onClick={() => copyCode('https://www.pwabuilder.com', 'pwabuilder')}
                  className="flex items-center gap-1 text-cyan-400 hover:underline text-[10px]"
                >
                  {copiedStep === 'pwabuilder' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedStep === 'pwabuilder' ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                PWABuilder-এ আপনার সাইটের লিংক দিলেই এটি ১০০/১০০ PWA স্কোর দিবে এবং সরাসরি Windows (.msix) বা Android (.apk) প্যাকেজ ডাউনলোড করতে পারবেন!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Electron Engine Setup • Ready for Windows, macOS & Linux
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
          >
            বুঝেছি (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
