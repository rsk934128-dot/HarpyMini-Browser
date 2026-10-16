import React, { useState } from 'react';
import {
  Search,
  Grid,
  Sparkles,
  Play,
  Star,
  Plus,
  ArrowRight,
  TrendingUp,
  X,
  ExternalLink,
  CheckCircle2,
  Trash2,
  Bookmark,
  Share2,
} from 'lucide-react';
import { MARKET_MINI_APPS, MiniAppItem } from '../lib/marketApps';

interface MiniAppsMarketViewProps {
  onLaunchApp: (appKey: string) => void;
  onOpenCustomUrl: (url: string) => void;
}

export const MiniAppsMarketView: React.FC<MiniAppsMarketViewProps> = ({
  onLaunchApp,
  onOpenCustomUrl,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [installedApps, setInstalledApps] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('harpymini_installed_apps');
      return saved ? JSON.parse(saved) : ['app-calc', 'app-todo', 'app-notes'];
    } catch {
      return ['app-calc', 'app-todo', 'app-notes'];
    }
  });

  const [customApps, setCustomApps] = useState<MiniAppItem[]>(() => {
    try {
      const saved = localStorage.getItem('harpymini_custom_apps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Add custom app modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [newAppDesc, setNewAppDesc] = useState('');
  const [newAppIcon, setNewAppIcon] = useState('🌐');

  // Active running mini-app in embedded runner
  const [activeRunningApp, setActiveRunningApp] = useState<MiniAppItem | null>(null);

  // Todo app state
  const [todos, setTodos] = useState<{ id: string; text: string; done: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem('harpymini_todos');
      return saved
        ? JSON.parse(saved)
        : [
            { id: '1', text: 'Explore HarpyMini AI Assistant', done: true },
            { id: '2', text: 'Save Master Password in AES-GCM Vault', done: true },
            { id: '3', text: 'Try 2048 Game in Mini Apps Bazar', done: false },
          ];
    } catch {
      return [];
    }
  });
  const [newTodoText, setNewTodoText] = useState('');

  // 2048 Game state
  const [grid2048, setGrid2048] = useState<number[][]>([
    [0, 2, 0, 0],
    [0, 0, 4, 0],
    [0, 0, 0, 2],
    [0, 0, 0, 0],
  ]);
  const [score2048, setScore2048] = useState(128);

  // AI Prompt Studio state
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiPromptOutput, setAiPromptOutput] = useState('');
  const [aiPromptLoading, setAiPromptLoading] = useState(false);

  // Filtered Apps
  const allApps = [...MARKET_MINI_APPS, ...customApps];

  const filteredApps = allApps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.nameBn && app.nameBn.includes(searchQuery)) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'installed'
          ? installedApps.includes(app.id)
          : app.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleInstall = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (installedApps.includes(id)) {
      updated = installedApps.filter((appId) => appId !== id);
    } else {
      updated = [...installedApps, id];
    }
    setInstalledApps(updated);
    localStorage.setItem('harpymini_installed_apps', JSON.stringify(updated));
  };

  const handleAddCustomApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppUrl.trim()) return;

    const newApp: MiniAppItem = {
      id: `custom-${Date.now()}`,
      name: newAppName.trim(),
      category: 'utilities',
      description: newAppDesc.trim() || 'Custom user mini app',
      icon: newAppIcon || '🌐',
      color: 'from-pink-600 to-rose-500',
      rating: 5.0,
      usersCount: 'You',
      badge: 'Custom',
      externalUrl: newAppUrl.startsWith('http') ? newAppUrl : `https://${newAppUrl}`,
    };

    const updated = [newApp, ...customApps];
    setCustomApps(updated);
    setInstalledApps([...installedApps, newApp.id]);
    localStorage.setItem('harpymini_custom_apps', JSON.stringify(updated));

    setNewAppName('');
    setNewAppUrl('');
    setNewAppDesc('');
    setShowAddModal(false);
  };

  const handleLaunch = (app: MiniAppItem) => {
    if (app.componentKey === 'webhook') {
      onLaunchApp('webhook');
    } else if (app.externalUrl) {
      onOpenCustomUrl(app.externalUrl);
    } else {
      setActiveRunningApp(app);
    }
  };

  // Todo functions
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const updated = [...todos, { id: `todo-${Date.now()}`, text: newTodoText.trim(), done: false }];
    setTodos(updated);
    localStorage.setItem('harpymini_todos', JSON.stringify(updated));
    setNewTodoText('');
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTodos(updated);
    localStorage.setItem('harpymini_todos', JSON.stringify(updated));
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    setTodos(updated);
    localStorage.setItem('harpymini_todos', JSON.stringify(updated));
  };

  // Run AI prompt
  const handleAiPromptGenerate = async () => {
    if (!aiPromptInput.trim() || aiPromptLoading) return;
    setAiPromptLoading(true);
    setAiPromptOutput('');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Please refine and generate a high-quality creative plan or solution for: "${aiPromptInput}". Provide structured bullet points and practical tips.` }],
        }),
      });
      const data = await res.json();
      setAiPromptOutput(data.reply || 'No output generated.');
    } catch {
      setAiPromptOutput('AI prompt execution ready. Connect to network to fetch dynamic completions.');
    } finally {
      setAiPromptLoading(false);
    }
  };

  return (
    <div className="min-h-full w-full py-8 px-4 sm:px-8 max-w-6xl mx-auto space-y-8 select-none text-slate-100">
      {/* Hero Banner for Mini Apps Market */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-700/50 p-6 sm:p-10 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>HarpyMini Apps Market • মিনি অ্যাপস বাজার</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              সার্চ করুন এবং যেকোনো মিনি অ্যাপস ১-ক্লিকে ইনস্ট্যান্ট চালু করুন
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              কোনো ডাউনলোড বা ইনস্টলেশন সাইজের ঝামেলা নেই! ক্লাউড-রেডি হালকা মিনি অ্যাপ্লিকেশনসমূহ যা সরাসরি ব্রাউজারে বিদ্যুতগতিতে চলে।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="hidden lg:block w-48 h-28 rounded-2xl overflow-hidden border border-indigo-500/40 shadow-xl">
              <img
                src="src/assets/images/harpymini_market_1792154685523.jpg"
                alt="Mini Apps Store"
                className="w-full h-full object-cover"
              />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন অ্যাপ যুক্ত করুন</span>
            </button>
          </div>
        </div>

        {/* Search Bar in Market */}
        <div className="relative max-w-2xl pt-2">
          <Search className="w-5 h-5 absolute left-3.5 top-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="বাজারে মিনি অ্যাপ সার্চ করুন (যেমন: Calculator, To-Do, Game, AI, Speed)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-inner"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'all', label: 'সব অ্যাপস (All)' },
          { id: 'google', label: 'গুগল ও ওয়েবহুক (Google & Webhooks)' },
          { id: 'installed', label: 'আমার অ্যাপস (My Apps)' },
          { id: 'productivity', label: 'প্রোডাক্টিভিটি (Productivity)' },
          { id: 'ai', label: 'এআই টুলস (AI Tools)' },
          { id: 'games', label: 'গেমস (Games)' },
          { id: 'utilities', label: 'ইউটিলিটি (Utilities)' },
          { id: 'finance', label: 'ফাইন্যান্স (Finance)' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Apps Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
          <span>মোট পাওয়া গেছে: {filteredApps.length} টি মিনি অ্যাপস</span>
          <span className="text-cyan-400">Zero-Storage Instant Execution</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => {
            const isInstalled = installedApps.includes(app.id);
            return (
              <div
                key={app.id}
                onClick={() => handleLaunch(app)}
                className="group cursor-pointer rounded-3xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/60 p-5 transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl hover:shadow-cyan-900/10"
              >
                <div className="space-y-3">
                  {app.previewImage && (
                    <div className="h-28 -mx-5 -mt-5 mb-3 overflow-hidden rounded-t-3xl bg-slate-950 relative">
                      <img
                        src={app.previewImage}
                        alt={app.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform`}
                    >
                      {app.icon}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {app.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                          {app.badge}
                        </span>
                      )}
                      <button
                        onClick={(e) => toggleInstall(app.id, e)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isInstalled
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-slate-700 text-slate-400 hover:text-white border-slate-600'
                        }`}
                        title={isInstalled ? 'আমার অ্যাপস থেকে রিমুভ করুন' : 'আমার অ্যাপস-এ সেভ করুন'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isInstalled ? 'fill-emerald-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                      <span>{app.name}</span>
                    </h3>
                    {app.nameBn && (
                      <div className="text-[11px] text-cyan-400/90 font-medium">{app.nameBn}</div>
                    )}
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {app.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-700/60 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {app.rating}
                    </span>
                    <span>•</span>
                    <span>{app.usersCount} users</span>
                  </div>

                  <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-cyan-600/20 group-hover:bg-cyan-600 text-cyan-300 group-hover:text-white font-semibold transition-all">
                    <span>চালান (Open)</span>
                    <Play className="w-3 h-3 fill-current" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Embedded Live Runner Modal for Market Apps */}
      {activeRunningApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${activeRunningApp.color} flex items-center justify-center text-xl shadow-md`}
                >
                  {activeRunningApp.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{activeRunningApp.name}</h3>
                  <p className="text-xs text-slate-400">{activeRunningApp.nameBn || activeRunningApp.category}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveRunningApp(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Active App Container */}
            <div className="p-6 overflow-y-auto">
              {/* To-Do Planner */}
              {activeRunningApp.componentKey === 'todo' && (
                <div className="space-y-4">
                  <form onSubmit={addTodo} className="flex gap-2">
                    <input
                      type="text"
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      placeholder="নতুন কোনো কাজ বা টাস্ক লিখুন..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      যুক্ত করুন
                    </button>
                  </form>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {todos.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs"
                      >
                        <div
                          onClick={() => toggleTodo(todo.id)}
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <input
                            type="checkbox"
                            checked={todo.done}
                            onChange={() => toggleTodo(todo.id)}
                            className="w-4 h-4 accent-emerald-500 cursor-pointer"
                          />
                          <span
                            className={
                              todo.done
                                ? 'line-through text-slate-500'
                                : 'text-slate-200 font-medium'
                            }
                          >
                            {todo.text}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="p-1 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2048 Game */}
              {activeRunningApp.componentKey === 'game-2048' && (
                <div className="text-center space-y-4">
                  <div className="flex justify-between items-center max-w-xs mx-auto text-xs font-bold">
                    <span className="text-slate-400">Score:</span>
                    <span className="text-amber-400 font-mono text-base">{score2048}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 bg-slate-950 p-4 rounded-2xl max-w-xs mx-auto border border-slate-800">
                    {grid2048.flat().map((val, idx) => (
                      <div
                        key={idx}
                        className={`h-14 rounded-xl flex items-center justify-center font-bold font-mono text-base ${
                          val === 0
                            ? 'bg-slate-800/40 text-transparent'
                            : val === 2
                              ? 'bg-amber-100 text-slate-900'
                              : val === 4
                                ? 'bg-amber-200 text-slate-900'
                                : 'bg-amber-500 text-white shadow-md'
                        }`}
                      >
                        {val || ''}
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-slate-400">
                    Swipe or click arrow buttons to merge tiles and score points!
                  </p>

                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setScore2048((s) => s + 32)}
                      className="px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold"
                    >
                      Merge Tiles
                    </button>
                    <button
                      onClick={() => setScore2048(0)}
                      className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
                    >
                      New Game
                    </button>
                  </div>
                </div>
              )}

              {/* AI Prompt Studio */}
              {activeRunningApp.componentKey === 'ai-prompt' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">
                      আপনার প্রম্পট, আইডিয়া বা প্রশ্নের বিষয় লিখুন:
                    </label>
                    <textarea
                      value={aiPromptInput}
                      onChange={(e) => setAiPromptInput(e.target.value)}
                      placeholder="যেমন: Write a persuasive marketing hook for a lightweight privacy browser..."
                      className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-sans min-h-[90px]"
                    />
                  </div>

                  <button
                    onClick={handleAiPromptGenerate}
                    disabled={aiPromptLoading}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{aiPromptLoading ? 'Generating Idea...' : 'Gemini দিয়ে জেনারেট করুন'}</span>
                  </button>

                  {aiPromptOutput && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {aiPromptOutput}
                    </div>
                  )}
                </div>
              )}

              {/* Crypto Tracker */}
              {activeRunningApp.componentKey === 'crypto' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                      <div className="text-slate-400">Bitcoin (BTC)</div>
                      <div className="text-xl font-bold font-mono text-white">$67,420.00</div>
                      <div className="text-emerald-400 font-semibold">+3.8% (24h)</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                      <div className="text-slate-400">Ethereum (ETH)</div>
                      <div className="text-xl font-bold font-mono text-white">$3,580.40</div>
                      <div className="text-emerald-400 font-semibold">+2.4% (24h)</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                      <div className="text-slate-400">Solana (SOL)</div>
                      <div className="text-xl font-bold font-mono text-white">$172.90</div>
                      <div className="text-emerald-400 font-semibold">+5.1% (24h)</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                      <div className="text-slate-400">Gas Tracker</div>
                      <div className="text-xl font-bold font-mono text-purple-400">12 Gwei</div>
                      <div className="text-slate-400">Low Network Congestion</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback for other existing component keys */}
              {['calculator', 'notes', 'speed', 'converter', 'qr'].includes(
                activeRunningApp.componentKey || ''
              ) && (
                <div className="text-center py-6 space-y-3">
                  <p className="text-slate-300 text-xs">
                    This app is connected directly to HarpyMini's native tool engine.
                  </p>
                  <button
                    onClick={() => {
                      const key = activeRunningApp.componentKey!;
                      setActiveRunningApp(null);
                      onLaunchApp(key);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20"
                  >
                    Open in Full Tool View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Mini App Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">বাজারে নতুন অ্যাপ যুক্ত করুন</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomApp} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">অ্যাপের নাম (App Name)</label>
                <input
                  type="text"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="যেমন: My Finance Dashboard"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">অ্যাপ ইউআরএল (Web App Link)</label>
                <input
                  type="text"
                  value={newAppUrl}
                  onChange={(e) => setNewAppUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">বর্ণনা (Description)</label>
                <input
                  type="text"
                  value={newAppDesc}
                  onChange={(e) => setNewAppDesc(e.target.value)}
                  placeholder="অ্যাপটি কী কাজে লাগে..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">আইকন (Emoji Icon)</label>
                <input
                  type="text"
                  value={newAppIcon}
                  onChange={(e) => setNewAppIcon(e.target.value)}
                  className="w-16 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-center text-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  অ্যাপটি যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
