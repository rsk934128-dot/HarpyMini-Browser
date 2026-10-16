import { Plus, X, Globe, Shield, Volume2 } from 'lucide-react';
import { Tab } from '../types/browser';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: (isIncognito?: boolean) => void;
  isIncognitoMode: boolean;
  onToggleIncognito: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  isIncognitoMode,
  onToggleIncognito,
}) => {
  return (
    <div className={`flex items-center gap-1 px-2 pt-2 border-b select-none transition-colors duration-200 ${
      isIncognitoMode 
        ? 'bg-slate-950 border-slate-800 text-slate-200' 
        : 'bg-slate-900 border-slate-800/80 text-slate-300'
    }`}>
      {/* HarpyMini Brand Logo & Indicator */}
      <div className="flex items-center gap-2 px-2.5 py-1 text-xs font-semibold tracking-wide text-cyan-400">
        <img
          src="/icon.svg"
          alt="HarpyMini Logo"
          className="w-5 h-5 rounded-md shadow-sm shadow-cyan-500/30 object-contain"
        />
        <span className="hidden sm:inline font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
          HarpyMini
        </span>
      </div>

      {/* Tabs List */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-t-lg max-w-[220px] min-w-[120px] text-xs font-medium cursor-pointer transition-all duration-150 border-t border-x ${
                isActive
                  ? isIncognitoMode
                    ? 'bg-slate-900 text-white border-slate-700 shadow-sm'
                    : 'bg-slate-800/90 text-white border-slate-700/80 shadow-sm'
                  : 'bg-slate-900/40 text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              {/* Tab Icon */}
              <div className="flex-shrink-0">
                {tab.isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                ) : tab.isIncognito ? (
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                )}
              </div>

              {/* Tab Title */}
              <span className="truncate flex-1 text-[11.5px]">
                {tab.title || (tab.isIncognito ? 'Private Tab' : 'New Tab')}
              </span>

              {/* Close Button */}
              {tabs.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-slate-700/80 p-0.5 rounded text-slate-400 hover:text-white transition-opacity"
                  title="Close Tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* New Tab Button */}
        <button
          type="button"
          onClick={() => onNewTab(false)}
          className="p-1.5 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors"
          title="New Tab (Ctrl+T)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Incognito Mode Toggle Button */}
      <button
        type="button"
        onClick={onToggleIncognito}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
          isIncognitoMode
            ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60 shadow-sm'
            : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/50'
        }`}
        title={isIncognitoMode ? 'Incognito Mode Active: No history recorded' : 'Switch to Incognito Private Browsing'}
      >
        <Shield className="w-3.5 h-3.5 text-purple-400" />
        <span className="hidden md:inline text-[11px]">
          {isIncognitoMode ? 'Incognito On' : 'Incognito'}
        </span>
      </button>
    </div>
  );
};
