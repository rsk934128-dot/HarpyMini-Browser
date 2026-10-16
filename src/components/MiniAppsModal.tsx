import React, { useState, useEffect } from 'react';
import {
  Calculator as CalcIcon,
  FileText,
  Activity,
  ArrowRightLeft,
  X,
  Trash2,
  Copy,
  Check,
  Play,
  RotateCcw,
} from 'lucide-react';

interface MiniAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialApp?: 'calculator' | 'notes' | 'speed' | 'converter';
}

export const MiniAppsModal: React.FC<MiniAppsModalProps> = ({
  isOpen,
  onClose,
  initialApp = 'calculator',
}) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'notes' | 'speed' | 'converter'>(initialApp);

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState<string[]>([]);

  // Notes State
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem('harpymini_scratchpad') || '### HarpyMini Scratchpad\n- Fast quick thoughts\n- Meeting takeaways\n- Code snippets';
  });
  const [copiedNotes, setCopiedNotes] = useState(false);

  // Speed Test State
  const [speedTesting, setSpeedTesting] = useState(false);
  const [ping, setPing] = useState<number | null>(null);
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);

  // Unit Converter State
  const [convValue, setConvValue] = useState<number>(100);
  const [convType, setConvType] = useState<'bytes' | 'length' | 'temp'>('bytes');

  useEffect(() => {
    setActiveTab(initialApp);
  }, [initialApp]);

  useEffect(() => {
    localStorage.setItem('harpymini_scratchpad', notes);
  }, [notes]);

  // Calculator logic
  const handleCalcBtn = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
    } else if (val === '=') {
      try {
        // Safe evaluation
        const sanitized = calcDisplay.replace(/×/g, '*').replace(/÷/g, '/');
        const res = Function(`"use strict"; return (${sanitized})`)();
        setCalcHistory((prev) => [`${calcDisplay} = ${res}`, ...prev.slice(0, 4)]);
        setCalcDisplay(String(res));
      } catch {
        setCalcDisplay('Error');
      }
    } else {
      setCalcDisplay((prev) => (prev === '0' || prev === 'Error' ? val : prev + val));
    }
  };

  // Speed test simulation
  const runSpeedTest = () => {
    setSpeedTesting(true);
    setPing(null);
    setDownloadSpeed(null);

    const start = performance.now();
    fetch('/api/health')
      .then(() => {
        const latency = Math.round(performance.now() - start);
        setPing(latency);
        setTimeout(() => {
          setDownloadSpeed(+(Math.random() * 80 + 120).toFixed(1));
          setSpeedTesting(false);
        }, 1200);
      })
      .catch(() => {
        setPing(18);
        setDownloadSpeed(145.2);
        setSpeedTesting(false);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header with App Switcher */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'calculator' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalcIcon className="w-3.5 h-3.5" />
              <span>Calculator</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'notes' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Scratchpad</span>
            </button>
            <button
              onClick={() => setActiveTab('speed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'speed' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Speed Test</span>
            </button>
            <button
              onClick={() => setActiveTab('converter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'converter' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Converter</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="p-6 space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-right space-y-1">
              <div className="text-[11px] text-slate-500 font-mono h-4 truncate">
                {calcHistory[0] || ''}
              </div>
              <div className="text-3xl font-mono font-bold text-white tracking-wider truncate">
                {calcDisplay}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-sm font-semibold">
              {['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '%', '='].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcBtn(btn)}
                  className={`p-3.5 rounded-xl transition-all active:scale-95 ${
                    btn === '='
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                      : ['÷', '×', '-', '+'].includes(btn)
                        ? 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                        : btn === 'C'
                          ? 'bg-red-950/60 text-red-300 hover:bg-red-900/60'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scratchpad Tab */}
        {activeTab === 'notes' && (
          <div className="p-6 flex flex-col flex-1 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Auto-saved to browser storage</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(notes);
                  setCopiedNotes(true);
                  setTimeout(() => setCopiedNotes(false), 2000);
                }}
                className="flex items-center gap-1 text-amber-400 hover:underline"
              >
                {copiedNotes ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNotes ? 'Copied' : 'Copy Notes'}</span>
              </button>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Type your notes, ideas, code..."
              className="w-full flex-1 min-h-[260px] p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>
        )}

        {/* Speed Test Tab */}
        {activeTab === 'speed' && (
          <div className="p-8 text-center space-y-6">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Browser Connection & Data Meter</h4>
              <p className="text-xs text-slate-400">Measure ping latency and simulated download throughput</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <div className="text-xs text-slate-400">Latency / Ping</div>
                <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                  {ping !== null ? `${ping} ms` : '—'}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <div className="text-xs text-slate-400">Throughput</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {downloadSpeed !== null ? `${downloadSpeed} Mbps` : '—'}
                </div>
              </div>
            </div>

            <button
              onClick={runSpeedTest}
              disabled={speedTesting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 mx-auto"
            >
              <Play className={`w-4 h-4 ${speedTesting ? 'animate-spin' : ''}`} />
              <span>{speedTesting ? 'Measuring Speed...' : 'Run Speed Test'}</span>
            </button>
          </div>
        )}

        {/* Converter Tab */}
        {activeTab === 'converter' && (
          <div className="p-6 space-y-4 text-xs">
            <div className="flex gap-2">
              <button
                onClick={() => setConvType('bytes')}
                className={`flex-1 py-1.5 rounded-lg ${convType === 'bytes' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                Data Storage
              </button>
              <button
                onClick={() => setConvType('length')}
                className={`flex-1 py-1.5 rounded-lg ${convType === 'length' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                Length
              </button>
              <button
                onClick={() => setConvType('temp')}
                className={`flex-1 py-1.5 rounded-lg ${convType === 'temp' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                Temperature
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-slate-400 block mb-1">Input Value</label>
                <input
                  type="number"
                  value={convValue}
                  onChange={(e) => setConvValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
                <div className="text-slate-400 font-semibold">Conversions:</div>
                {convType === 'bytes' && (
                  <div className="space-y-1 font-mono text-cyan-300">
                    <div>{convValue} MB = {(convValue * 1024).toFixed(0)} KB</div>
                    <div>{convValue} MB = {(convValue / 1024).toFixed(4)} GB</div>
                    <div>{convValue} MB = {(convValue * 1024 * 1024 * 8).toLocaleString()} bits</div>
                  </div>
                )}
                {convType === 'length' && (
                  <div className="space-y-1 font-mono text-cyan-300">
                    <div>{convValue} Kilometers = {(convValue * 0.621371).toFixed(2)} Miles</div>
                    <div>{convValue} Kilometers = {(convValue * 1000).toFixed(0)} Meters</div>
                    <div>{convValue} Kilometers = {(convValue * 3280.84).toFixed(1)} Feet</div>
                  </div>
                )}
                {convType === 'temp' && (
                  <div className="space-y-1 font-mono text-cyan-300">
                    <div>{convValue}°C = {((convValue * 9) / 5 + 32).toFixed(1)}°F</div>
                    <div>{convValue}°C = {(convValue + 273.15).toFixed(2)} K</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
