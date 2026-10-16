import React, { useState, useEffect } from 'react';
import {
  Webhook,
  Send,
  Radio,
  Check,
  Copy,
  ExternalLink,
  Trash2,
  Play,
  RotateCcw,
  Sparkles,
  Search,
  Bell,
  Code2,
  FileCode2,
  CheckCircle2,
  XCircle,
  Globe,
  Settings,
  Layers,
  FileSpreadsheet,
  MessageSquare,
  X,
  RefreshCw,
} from 'lucide-react';
import { WebhookEvent, OutgoingWebhookEndpoint, WebhookActionType } from '../types/browser';

interface WebhookIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUrl: (url: string) => void;
  onLaunchMiniApp: (appKey: string) => void;
  onNewNotification?: (title: string, message: string, actionUrl?: string) => void;
}

export const WebhookIntegrationModal: React.FC<WebhookIntegrationModalProps> = ({
  isOpen,
  onClose,
  onOpenUrl,
  onLaunchMiniApp,
  onNewNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'google_hub' | 'incoming' | 'outgoing' | 'logs' | 'apps_script'>('google_hub');

  // Events & logs state
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Incoming Tester state
  const [testAction, setTestAction] = useState<WebhookActionType>('notification');
  const [testTitle, setTestTitle] = useState('Google Workspace Trigger');
  const [testMessage, setTestMessage] = useState('New submission in Google Forms received at 12:45 PM');
  const [testUrl, setTestUrl] = useState('https://docs.google.com/spreadsheets');
  const [testQuery, setTestQuery] = useState('AI Gemini Flash advancements');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Outgoing Webhook state
  const [endpoints, setEndpoints] = useState<OutgoingWebhookEndpoint[]>(() => {
    try {
      const saved = localStorage.getItem('harpymini_outgoing_webhooks');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'ep-google-chat',
              name: 'Google Chat Workspace Space',
              service: 'google_chat',
              url: 'https://chat.googleapis.com/v1/spaces/SPACE_ID/messages?key=AIzaSy...&token=...',
              enabled: true,
              createdAt: new Date().toISOString(),
            },
            {
              id: 'ep-slack',
              name: 'Slack Alerts Channel',
              service: 'slack',
              url: 'https://hooks.slack.com/services/T00/B00/XXXXX',
              enabled: false,
              createdAt: new Date().toISOString(),
            },
          ];
    } catch {
      return [];
    }
  });

  const [newEpName, setNewEpName] = useState('');
  const [newEpService, setNewEpService] = useState<'google_chat' | 'discord' | 'slack' | 'custom'>('google_chat');
  const [newEpUrl, setNewEpUrl] = useState('');

  const [dispatchTargetId, setDispatchTargetId] = useState<string>('custom');
  const [customTargetUrl, setCustomTargetUrl] = useState('');
  const [dispatchMessage, setDispatchMessage] = useState('HarpyMini Browser: Webhook alert sent successfully!');
  const [dispatchTitle, setDispatchTitle] = useState('Browser Task Notification');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  // Real Webhook URL
  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/trigger` : 'https://harpymini.app/api/webhooks/trigger';

  // Save endpoints to localstorage
  useEffect(() => {
    localStorage.setItem('harpymini_outgoing_webhooks', JSON.stringify(endpoints));
  }, [endpoints]);

  // Connect to SSE stream for live events
  useEffect(() => {
    if (!isOpen) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/webhooks/events');
      eventSource.onopen = () => setIsConnected(true);
      eventSource.onerror = () => setIsConnected(false);

      eventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.type === 'INIT_HISTORY') {
            setEvents(parsed.events || []);
          } else {
            // New single event
            setEvents((prev) => [parsed, ...prev.slice(0, 70)]);
            if (onNewNotification && parsed.title) {
              onNewNotification(parsed.title, parsed.message || '', parsed.targetUrl);
            }
          }
        } catch (err) {
          console.error('SSE parse error:', err);
        }
      };
    } catch (err) {
      console.warn('SSE connection failed:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isOpen, onNewNotification]);

  const copyToClipboard = (text: string, type: 'url' | 'script') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  const handleSendIncomingTest = async () => {
    setIsSendingTest(true);
    setTestResult(null);

    let payload: any = {
      action: testAction,
      title: testTitle,
      message: testMessage,
    };

    if (testAction === 'open_url') {
      payload.url = testUrl;
    } else if (testAction === 'search') {
      payload.query = testQuery;
    } else if (testAction === 'open_miniapp') {
      payload.appId = 'calculator';
    } else if (testAction === 'ai_summary') {
      payload.content = testMessage;
    }

    try {
      const res = await fetch('/api/webhooks/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setTestResult(`✅ 200 OK - Webhook Triggered: ${data.message || 'Success'}`);

      // Perform local action if required
      if (testAction === 'open_url' && testUrl) {
        onOpenUrl(testUrl);
      } else if (testAction === 'search' && testQuery) {
        onOpenUrl(`https://www.google.com/search?q=${encodeURIComponent(testQuery)}`);
      } else if (testAction === 'open_miniapp') {
        onLaunchMiniApp('calculator');
      }
    } catch (err: any) {
      setTestResult(`❌ Error: ${err.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleDispatchOutgoing = async () => {
    let target = customTargetUrl;
    let service: any = 'custom';

    if (dispatchTargetId !== 'custom') {
      const ep = endpoints.find((e) => e.id === dispatchTargetId);
      if (ep) {
        target = ep.url;
        service = ep.service;
      }
    }

    if (!target.trim()) {
      setDispatchStatus('⚠️ অনুগ্রহ করে একটি সঠিক Webhook URL দিন।');
      return;
    }

    setIsDispatching(true);
    setDispatchStatus(null);

    try {
      const res = await fetch('/api/webhooks/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: target.trim(),
          service,
          title: dispatchTitle,
          message: dispatchMessage,
          payload: {
            app: 'HarpyMini Browser',
            timestamp: new Date().toISOString(),
            status: 'operational',
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDispatchStatus(`✅ Status ${data.statusCode}: সফলভাবে ডিসপ্যাচ হয়েছে!`);
      } else {
        setDispatchStatus(`⚠️ Response ${data.statusCode || 500}: ${data.error || 'Failed'}`);
      }
    } catch (err: any) {
      setDispatchStatus(`❌ Delivery failed: ${err.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleAddEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEpName.trim() || !newEpUrl.trim()) return;

    const newEp: OutgoingWebhookEndpoint = {
      id: `ep-${Date.now()}`,
      name: newEpName.trim(),
      service: newEpService,
      url: newEpUrl.trim(),
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    setEndpoints([...endpoints, newEp]);
    setNewEpName('');
    setNewEpUrl('');
  };

  const handleDeleteEndpoint = (id: string) => {
    setEndpoints(endpoints.filter((e) => e.id !== id));
  };

  const handleClearHistory = async () => {
    try {
      await fetch('/api/webhooks/clear', { method: 'POST' });
      setEvents([]);
    } catch (err) {
      console.error(err);
    }
  };

  const googleAppsScriptCode = `/**
 * HarpyMini Browser Automation Script
 * Google Apps Script for Google Forms / Google Sheets
 */
function onFormSubmitOrSheetChange(e) {
  // আপনার HarpyMini ব্রাউজারের ইউনিক ওয়েবহুক লিংক
  var webhookUrl = "${webhookUrl}";
  
  var payload = {
    action: "notification", // বিকল্প: "open_url", "search", "ai_summary"
    title: "Google Sheets Trigger",
    message: "নতুন ডেটা আপডেট হয়েছে: " + (e ? JSON.stringify(e.values || e.namedValues || "Row added") : "Manual execution"),
    sender: "Google Apps Script Engine",
    url: SpreadsheetApp.getActiveSpreadsheet().getUrl()
  };
  
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(webhookUrl, options);
  Logger.log("Response Code: " + response.getResponseCode());
}`;

  const GOOGLE_SERVICES = [
    {
      name: 'Google Search',
      nameBn: 'গুগল সার্চ ও লাইভ রেজাল্ট',
      desc: 'Instant web search with answers & AI highlights',
      url: 'https://www.google.com',
      icon: '🔍',
      color: 'from-blue-600 to-indigo-600',
      tag: 'Core Search',
    },
    {
      name: 'Google Drive',
      nameBn: 'গুগল ড্রাইভ ক্লাউড স্টোরেজ',
      desc: 'Cloud file storage, shared drives & backup',
      url: 'https://drive.google.com',
      icon: '📁',
      color: 'from-amber-500 to-emerald-600',
      tag: 'Cloud Storage',
    },
    {
      name: 'Google Docs',
      nameBn: 'গুগল ডক্স ডকুমেন্ট এডিটর',
      desc: 'Collaborative real-time rich document processor',
      url: 'https://docs.google.com',
      icon: '📄',
      color: 'from-blue-600 to-cyan-600',
      tag: 'Workspace',
    },
    {
      name: 'Google Sheets',
      nameBn: 'গুগল স্প্রেডশীটস ও টেবিল',
      desc: 'Spreadsheets, formulas, and chart analytics',
      url: 'https://sheets.google.com',
      icon: '📊',
      color: 'from-emerald-600 to-teal-600',
      tag: 'Workspace',
    },
    {
      name: 'Google Gemini AI',
      nameBn: 'গুগল জেমিনাই এআই হাব',
      desc: 'Multimodal advanced reasoning & prompt workspace',
      url: 'https://gemini.google.com',
      icon: '✨',
      color: 'from-purple-600 to-indigo-600',
      tag: 'Gemini AI',
    },
    {
      name: 'Google Keep',
      nameBn: 'গুগল কিপ কুইক নোটস',
      desc: 'Sticky notes, audio memos & checklists',
      url: 'https://keep.google.com',
      icon: '💡',
      color: 'from-yellow-500 to-amber-600',
      tag: 'Notes',
    },
    {
      name: 'Google Calendar',
      nameBn: 'গুগল ক্যালেন্ডার ও শিডিউল',
      desc: 'Meeting scheduler, event reminders & calendar',
      url: 'https://calendar.google.com',
      icon: '📅',
      color: 'from-blue-600 to-blue-800',
      tag: 'Productivity',
    },
    {
      name: 'Google Translate',
      nameBn: 'গুগল অনুবাদক (বাংলা ও বৈশ্বিক)',
      desc: 'Instant multilingual text & web translation',
      url: 'https://translate.google.com',
      icon: '🌐',
      color: 'from-cyan-600 to-blue-600',
      tag: 'Translate',
    },
    {
      name: 'Google Maps',
      nameBn: 'গুগল ম্যাপস ও স্যাটেলাইট ভিউ',
      desc: 'Interactive navigation, traffic, and locations',
      url: 'https://maps.google.com',
      icon: '🗺️',
      color: 'from-emerald-500 to-teal-700',
      tag: 'Navigation',
    },
    {
      name: 'YouTube',
      nameBn: 'ইউটিউব ভিডিও ও পডকাস্ট',
      desc: 'Streaming videos, tutorials & live events',
      url: 'https://youtube.com',
      icon: '▶️',
      color: 'from-red-600 to-rose-700',
      tag: 'Media',
    },
    {
      name: 'Gmail',
      nameBn: 'গুগল জিমেইল ক্লায়েন্ট',
      desc: 'Secure email client with smart spam filtering',
      url: 'https://mail.google.com',
      icon: '✉️',
      color: 'from-red-500 to-orange-500',
      tag: 'Communication',
    },
    {
      name: 'Google Meet',
      nameBn: 'গুগল মিট ভিডিও কনফারেন্স',
      desc: 'High-definition video calls & screen sharing',
      url: 'https://meet.google.com',
      icon: '📹',
      color: 'from-teal-600 to-emerald-700',
      tag: 'Calls',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Google মিনি ব্রাউজার ওয়েবহুক ও ইন্টিগ্রেশন হাব
                </h2>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  isConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  <Radio className={`w-3 h-3 ${isConnected ? 'animate-pulse text-emerald-400' : ''}`} />
                  <span>{isConnected ? 'SSE Live Connected' : 'Polling Ready'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Google Workspace, Apps Script ও রিমোট ওয়েবহুকের মাধ্যমে HarpyMini ব্রাউজার রিমোটলি নিয়ন্ত্রণ করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-900/50 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('google_hub')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 ${
              activeTab === 'google_hub'
                ? 'border-cyan-400 text-cyan-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>গুগল অ্যাপস হাব (Google Hub)</span>
          </button>

          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 ${
              activeTab === 'incoming'
                ? 'border-amber-400 text-amber-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Webhook className="w-4 h-4" />
            <span>ইনকামিং ওয়েবহুক ও রিমোট ট্রিগার</span>
          </button>

          <button
            onClick={() => setActiveTab('apps_script')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 ${
              activeTab === 'apps_script'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Apps Script কোড</span>
          </button>

          <button
            onClick={() => setActiveTab('outgoing')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 ${
              activeTab === 'outgoing'
                ? 'border-purple-400 text-purple-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>আউটগোয়িং ডিসপ্যাচ (Google Chat / Slack)</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 ${
              activeTab === 'logs'
                ? 'border-indigo-400 text-indigo-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>লাইভ ইভেন্ট লগ ({events.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: GOOGLE APPS HUB */}
          {activeTab === 'google_hub' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/20 to-slate-800/60 border border-blue-700/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>গুগল ইকোসিস্টেম ও ওয়ান-ক্লিক সার্ভিস লঞ্চার</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 font-mono">
                      Integrated
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    HarpyMini ব্রাউজারে গুগল সার্চ, ডক্স, ড্রাইভ, মিট এবং জেমিনাই এআই সরাসরি এক ক্লিকে ট্রিগার করুন।
                  </p>
                </div>
                <button
                  onClick={() => {
                    onOpenUrl('https://www.google.com');
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Google Search খুলুন</span>
                </button>
              </div>

              {/* Grid of Google Apps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {GOOGLE_SERVICES.map((srv) => (
                  <div
                    key={srv.name}
                    onClick={() => {
                      onOpenUrl(srv.url);
                      onClose();
                    }}
                    className="group cursor-pointer rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/60 p-4 transition-all flex items-start justify-between gap-3 shadow-sm hover:shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${srv.color} flex items-center justify-center text-xl shadow group-hover:scale-105 transition-transform flex-shrink-0`}>
                        {srv.icon}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {srv.name}
                          </h4>
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                            {srv.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-cyan-300 font-medium">{srv.nameBn}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{srv.desc}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 flex-shrink-0 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: INCOMING WEBHOOKS */}
          {activeTab === 'incoming' && (
            <div className="space-y-6">
              {/* Endpoint banner */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                      POST
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white">
                      আপনার ব্রাউজারের ইউনিক ওয়েবহুক রিসিভার লিংক
                    </h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(webhookUrl, 'url')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs text-white transition-colors"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'কপি হয়েছে!' : 'Copy Webhook URL'}</span>
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-xs text-cyan-400 border border-slate-800 break-all select-all">
                  {webhookUrl}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  যেকোনো বাহ্যিক সার্ভিস (Google Apps Script, Zapier, Make, n8n, GitHub, পাইথন স্ক্রিপ্ট বা cURL) থেকে এই URL-এ JSON পেলোড পাঠালে HarpyMini ব্রাউজার স্বয়ংক্রিয়ভাবে অ্যাকশন এক্সিকিউট করবে।
                </p>
              </div>

              {/* Interactive Tester */}
              <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-cyan-400" />
                  <span>ওয়েবহুক টেস্ট কনসোল (Live Webhook Action Trigger)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ট্রিগার অ্যাকশন টাইপ (Action)
                    </label>
                    <select
                      value={testAction}
                      onChange={(e) => setTestAction(e.target.value as WebhookActionType)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="notification">নোটিফিকেশন ব্যানার (notification)</option>
                      <option value="open_url">ব্রাউজারে URL খুলুন (open_url)</option>
                      <option value="search">গুগল সার্চ ট্রিগার (search)</option>
                      <option value="ai_summary">Gemini AI সামারি জেনারেটর (ai_summary)</option>
                      <option value="open_miniapp">মিনি অ্যাপ লঞ্চ করুন (open_miniapp)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      শিরোনাম / ট্রিগার সোর্স (Title)
                    </label>
                    <input
                      type="text"
                      value={testTitle}
                      onChange={(e) => setTestTitle(e.target.value)}
                      placeholder="যেমন: Google Forms New Lead"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {testAction === 'open_url' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      টার্গেট ওয়েব URL
                    </label>
                    <input
                      type="url"
                      value={testUrl}
                      onChange={(e) => setTestUrl(e.target.value)}
                      placeholder="https://docs.google.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                {testAction === 'search' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      সার্চ কুয়েরি (Search Query)
                    </label>
                    <input
                      type="text"
                      value={testQuery}
                      onChange={(e) => setTestQuery(e.target.value)}
                      placeholder="Google Search Query..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    মেসেজ / পেলোড কনটেন্ট
                  </label>
                  <textarea
                    rows={2}
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="মেসেজ বা তথ্য যা ব্রাউজারে ডিসপ্লে হবে..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleSendIncomingTest}
                    disabled={isSendingTest}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all"
                  >
                    {isSendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    <span>টেস্ট ওয়েবহুক পাঠান (Send Webhook)</span>
                  </button>

                  {testResult && (
                    <span className="text-xs font-medium text-slate-200 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
                      {testResult}
                    </span>
                  )}
                </div>
              </div>

              {/* cURL Example */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400">cURL কমান্ড উদাহরণ:</span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  <code>{`curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{"action": "notification", "title": "Server Alert", "message": "Deployment Successful at 100%"}'`}</code>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE APPS SCRIPT */}
          {activeTab === 'apps_script' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-2xl p-4 sm:p-5 space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Google Sheets ও Google Forms-এর সাথে HarpyMini কানেকশন</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  গুগল শিট বা গুগল ফর্মে নতুন কোনো রেসপন্স সাবমিট হলে স্বয়ংক্রিয়ভাবে HarpyMini ব্রাউজারে নোটিফিকেশন আসবে বা শিটটি স্বয়ংক্রিয়ভাবে নতুন ট্যাবে ওপেন হবে।
                </p>
                <ol className="text-xs text-slate-400 list-decimal pl-5 space-y-1">
                  <li>আপনার Google Sheet বা Form ওপেন করুন এবং <strong>Extensions &gt; Apps Script</strong>-এ যান।</li>
                  <li>নিচের সম্পূর্ণ কোডটি কপি করে সেখানে পেস্ট করুন।</li>
                  <li>উপরে <strong>Triggers (ঘড়ি আইকন)</strong> থেকে <em>onEdit</em> বা <em>onFormSubmit</em> ইভেন্ট সিলেক্ট করে সেভ করুন!</li>
                </ol>
              </div>

              <div className="relative">
                <div className="absolute right-3 top-3 z-10">
                  <button
                    onClick={() => copyToClipboard(googleAppsScriptCode, 'script')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white border border-slate-700 shadow"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'কপি সম্পন্ন!' : 'কোড কপি করুন'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400/90 overflow-x-auto leading-relaxed">
                  <code>{googleAppsScriptCode}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: OUTGOING WEBHOOK DISPATCH */}
          {activeTab === 'outgoing' && (
            <div className="space-y-6">
              {/* Dispatch form */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-purple-400" />
                  <span>Google Chat / Slack / Discord-এ মেসেজ ও ইভেন্ট পাঠান</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      টার্গেট সার্ভিস নির্বাচন করুন
                    </label>
                    <select
                      value={dispatchTargetId}
                      onChange={(e) => setDispatchTargetId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="custom">কাস্টম Webhook URL</option>
                      {endpoints.map((ep) => (
                        <option key={ep.id} value={ep.id}>
                          {ep.name} ({ep.service})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      শিরোনাম (Dispatch Title)
                    </label>
                    <input
                      type="text"
                      value={dispatchTitle}
                      onChange={(e) => setDispatchTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {dispatchTargetId === 'custom' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      টার্গেট Webhook URL (Google Chat / Slack / Discord / Custom REST API)
                    </label>
                    <input
                      type="url"
                      value={customTargetUrl}
                      onChange={(e) => setCustomTargetUrl(e.target.value)}
                      placeholder="https://chat.googleapis.com/v1/spaces/... or https://hooks.slack.com/..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    মেসেজ বডি (Message Content)
                  </label>
                  <textarea
                    rows={2}
                    value={dispatchMessage}
                    onChange={(e) => setDispatchMessage(e.target.value)}
                    placeholder="মেসেজ যা টার্গেট চ্যাট স্পেসে সেন্ড হবে..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleDispatchOutgoing}
                    disabled={isDispatching}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 disabled:opacity-50 transition-all"
                  >
                    {isDispatching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>ডিসপ্যাচ সম্পন্ন করুন (Send Dispatch)</span>
                  </button>

                  {dispatchStatus && (
                    <span className="text-xs font-medium text-slate-200 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
                      {dispatchStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Saved Outgoing Endpoints */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  সংরক্ষিত আউটগোয়িং এন্ডপয়েন্টস ({endpoints.length})
                </h4>

                <div className="space-y-2">
                  {endpoints.map((ep) => (
                    <div
                      key={ep.id}
                      className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{ep.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-700/40 font-mono">
                            {ep.service}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{ep.url}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteEndpoint(ep.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new endpoint form */}
                <form onSubmit={handleAddEndpoint} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/40 space-y-3">
                  <span className="text-xs font-semibold text-slate-300">নতুন এন্ডপয়েন্ট সেভ করুন:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="এন্ডপয়েন্ট নাম (যেমন Google Chat Space)"
                      value={newEpName}
                      onChange={(e) => setNewEpName(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                    <select
                      value={newEpService}
                      onChange={(e) => setNewEpService(e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="google_chat">Google Chat</option>
                      <option value="slack">Slack</option>
                      <option value="discord">Discord</option>
                      <option value="custom">Custom Webhook</option>
                    </select>
                    <input
                      type="url"
                      placeholder="Webhook URL"
                      value={newEpUrl}
                      onChange={(e) => setNewEpUrl(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs text-white font-semibold transition-colors"
                  >
                    + এন্ডপয়েন্ট যোগ করুন
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: EVENT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  রিয়েল-টাইম লাইভ ইভেন্ট স্ট্রিম (সর্বশেষ {events.length} টি অ্যাকশন)
                </span>
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 text-xs border border-slate-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>লগ মুছুন</span>
                </button>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <Webhook className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs">এখনও কোনো ওয়েবহুক ইভেন্ট আসেনি।</p>
                  <p className="text-[11px] text-slate-600">ইনকামিং ট্যাবে গিয়ে একটি টেস্ট ওয়েবহুক ট্রিগার করুন!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            ev.source === 'incoming'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            {ev.source.toUpperCase()}
                          </span>
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-700 text-cyan-300">
                            {ev.action}
                          </span>
                          <span className="font-bold text-white truncate">{ev.title}</span>
                        </div>

                        {ev.message && (
                          <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                            {ev.message}
                          </p>
                        )}

                        {ev.targetUrl && (
                          <p className="text-cyan-400 font-mono text-[10px] truncate">
                            URL: {ev.targetUrl}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                          {ev.sender && <span>Sender: {ev.sender}</span>}
                          <span>Status: {ev.responseCode || 200} OK</span>
                        </div>
                      </div>

                      {ev.targetUrl && (
                        <button
                          onClick={() => {
                            onOpenUrl(ev.targetUrl!);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 text-[11px] font-medium flex items-center gap-1 flex-shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>খুলুন</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-850 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Webhook Engine v2.5 • Google Apps Script & Workspace Ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            বন্ধ করুন (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
