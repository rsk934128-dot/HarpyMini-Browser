import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { AiChatMessage, Tab } from '../types/browser';
import { MOCK_PAGES } from '../lib/mockPages';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: Tab;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hi! I'm your **HarpyMini AI Assistant**, powered by Gemini 3.8 Flash. I can answer questions about the page you are viewing, extract insights, or assist with anything else!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mockArticle = MOCK_PAGES[activeTab.url];
  const pageTitle = mockArticle?.title || activeTab.title;
  const pageContent = mockArticle?.content || '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: AiChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          pageContext: {
            title: pageTitle,
            url: activeTab.url,
            content: pageContent,
          },
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMsg: AiChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I am ready to help you with this page.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: AiChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Note: ${err.message || 'Could not communicate with Gemini service'}. Please check your connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-fresh',
        role: 'assistant',
        content: `Chat cleared. Ask me anything about ${pageTitle || 'the web'}!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 sm:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl z-40 select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide">HarpyMini AI Assistant</h2>
            <p className="text-[10px] text-cyan-400">Gemini 3.8 Flash • Context Grounded</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Clear Chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current Page Context Badge */}
      <div className="px-3 py-2 bg-slate-800/60 border-b border-slate-800 text-[11px] flex items-center justify-between text-slate-300">
        <div className="truncate flex-1 mr-2">
          <span className="text-slate-400">Context: </span>
          <span className="font-semibold text-cyan-300 truncate">
            {pageTitle || 'New Tab'}
          </span>
        </div>
        <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 text-[10px] font-mono">
          Active
        </span>
      </div>

      {/* Visual AI Header Banner */}
      <div className="relative h-20 w-full overflow-hidden border-b border-slate-800 flex-shrink-0">
        <img
          src="src/assets/images/harpymini_ai_chat_1792154663170.jpg"
          alt="Gemini AI Assistant"
          className="w-full h-full object-cover object-top opacity-50 hover:opacity-75 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent flex items-end p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-semibold drop-shadow">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gemini 3.8 Flash Engine Active</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs select-text">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
              {msg.role === 'user' ? (
                <>
                  <span>You</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-cyan-400" />
                  <span>HarpyMini AI</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </>
              )}
            </div>

            <div
              className={`relative group max-w-[90%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none shadow-sm'
                  : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-none shadow-sm'
              }`}
            >
              {msg.content}

              {msg.role === 'assistant' && (
                <button
                  onClick={() => copyToClipboard(msg.content, msg.id)}
                  className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-700/80 hover:bg-slate-600 text-slate-300 transition-opacity"
                  title="Copy text"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-slate-400 text-xs animate-pulse">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>HarpyMini is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Contextual Prompt Chips */}
      <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5 border-t border-slate-800 bg-slate-900/60">
        <button
          onClick={() => handleSendMessage('Summarize the top key takeaways of this page in 3 bullet points.')}
          disabled={loading}
          className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] border border-slate-700 hover:border-cyan-500/50 transition-colors"
        >
          📌 3 Takeaways
        </button>
        <button
          onClick={() => handleSendMessage('Explain the main concept of this article like I am 5 years old.')}
          disabled={loading}
          className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-purple-300 text-[11px] border border-slate-700 hover:border-purple-500/50 transition-colors"
        >
          💡 Explain Like I'm 5
        </button>
        <button
          onClick={() => handleSendMessage('What are potential risks, limitations, or counterarguments to this?')}
          disabled={loading}
          className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] border border-slate-700 hover:border-amber-500/50 transition-colors"
        >
          ⚖️ Counterarguments
        </button>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 focus-within:border-cyan-500"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this page or any topic..."
            className="flex-1 bg-transparent text-white placeholder-slate-400 text-xs focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
