/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import {
  Tab,
  Bookmark,
  HistoryItem,
  OfflinePage,
  UserBrowserSettings,
} from './types/browser';
import { DEFAULT_BOOKMARKS, MOCK_PAGES } from './lib/mockPages';

// Components
import { TabBar } from './components/TabBar';
import { Navbar } from './components/Navbar';
import { BrowserView } from './components/BrowserView';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { SummarizeModal } from './components/SummarizeModal';
import { VoiceCommandModal } from './components/VoiceCommandModal';
import { PasswordManagerModal } from './components/PasswordManagerModal';
import { QrModal } from './components/QrModal';
import { OfflineDownloadsModal } from './components/OfflineDownloadsModal';
import { MiniAppsModal } from './components/MiniAppsModal';
import { Web3WalletModal } from './components/Web3WalletModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { DesktopGuideModal } from './components/DesktopGuideModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  // Tabs State
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      url: 'harpymini://newtab',
      title: 'New Tab',
      isLoading: false,
      isIncognito: false,
      canGoBack: false,
      canGoForward: false,
      historyStack: ['harpymini://newtab'],
      historyIndex: 0,
      readerMode: false,
      dataSavedKb: 0,
      blockedTrackers: 0,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // Global Incognito Toggle
  const [isIncognitoMode, setIsIncognitoMode] = useState<boolean>(false);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('harpymini_bookmarks');
      return saved ? JSON.parse(saved) : DEFAULT_BOOKMARKS;
    } catch {
      return DEFAULT_BOOKMARKS;
    }
  });

  // History State
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('harpymini_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Offline Pages State
  const [offlinePages, setOfflinePages] = useState<OfflinePage[]>(() => {
    try {
      const saved = localStorage.getItem('harpymini_offline');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'offline-sample',
              title: 'Offline Guide: HarpyMini Browser Architecture',
              url: 'https://dev.to/harpymini/building-modern-privacy-browsers',
              content: MOCK_PAGES['https://dev.to/harpymini/building-modern-privacy-browsers'].content,
              savedAt: new Date().toISOString(),
              sizeKb: 45.0,
            },
          ];
    } catch {
      return [];
    }
  });

  // Settings State
  const [settings, setSettings] = useState<UserBrowserSettings>({
    searchEngine: 'duckduckgo',
    dataSaverEnabled: true,
    adBlockEnabled: true,
    theme: 'dark',
    fontSize: 'md',
    readerTheme: 'dark',
    readerFont: 'serif',
  });

  // Live Metrics
  const [totalSavedKb, setTotalSavedKb] = useState<number>(314.6);
  const [totalBlockedTrackers, setTotalBlockedTrackers] = useState<number>(87);

  // Modals / Drawers Open State
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isSummarizeOpen, setIsSummarizeOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isPasswordManagerOpen, setIsPasswordManagerOpen] = useState(false);
  const [isOfflineDownloadsOpen, setIsOfflineDownloadsOpen] = useState(false);
  const [isMiniAppsOpen, setIsMiniAppsOpen] = useState(false);
  const [miniAppInitial, setMiniAppInitial] = useState<'calculator' | 'notes' | 'speed' | 'converter'>('calculator');
  const [isWeb3WalletOpen, setIsWeb3WalletOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDesktopGuideOpen, setIsDesktopGuideOpen] = useState(false);

  // Active Tab reference
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync Bookmarks from Firestore
        const bookmarksPath = `users/${currentUser.uid}/bookmarks`;
        try {
          const snapshot = await getDocs(collection(db, bookmarksPath));
          if (!snapshot.empty) {
            const remoteBookmarks: Bookmark[] = [];
            snapshot.forEach((d) => remoteBookmarks.push({ id: d.id, ...d.data() } as Bookmark));
            setBookmarks(remoteBookmarks);
          } else {
            // Seed initial bookmarks to Firestore
            for (const bm of bookmarks) {
              await setDoc(doc(db, bookmarksPath, bm.id), {
                id: bm.id,
                userId: currentUser.uid,
                title: bm.title,
                url: bm.url,
                category: bm.category || 'General',
                createdAt: bm.createdAt,
              });
            }
          }
        } catch (err) {
          console.warn('Bookmarks Firestore sync warning:', err);
        }

        // Sync Offline Pages from Firestore
        const offlinePath = `users/${currentUser.uid}/offlinePages`;
        try {
          const snap = await getDocs(collection(db, offlinePath));
          if (!snap.empty) {
            const remoteOffline: OfflinePage[] = [];
            snap.forEach((d) => remoteOffline.push({ id: d.id, ...d.data() } as OfflinePage));
            setOfflinePages(remoteOffline);
          }
        } catch (err) {
          console.warn('Offline pages Firestore sync warning:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('harpymini_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('harpymini_history', JSON.stringify(historyItems));
  }, [historyItems]);

  useEffect(() => {
    localStorage.setItem('harpymini_offline', JSON.stringify(offlinePages));
  }, [offlinePages]);

  // Navigate Active Tab
  const handleNavigate = (rawUrl: string) => {
    let finalUrl = rawUrl.trim();

    // Check if search query or valid URL
    const isDomain = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/.test(finalUrl);
    const hasProtocol = /^https?:\/\//i.test(finalUrl) || finalUrl.startsWith('harpymini://');

    if (!hasProtocol && !isDomain) {
      if (settings.searchEngine === 'google') {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}`;
      } else {
        finalUrl = `https://duckduckgo.com/?q=${encodeURIComponent(finalUrl)}`;
      }
    } else if (!hasProtocol && isDomain) {
      finalUrl = `https://${finalUrl}`;
    }

    // Determine title
    const mockPage = MOCK_PAGES[finalUrl];
    let pageTitle = finalUrl;
    if (finalUrl === 'harpymini://market' || finalUrl === 'harpymini://bazar') {
      pageTitle = 'মিনি অ্যাপস বাজার (Apps Market)';
    } else if (finalUrl === 'harpymini://newtab') {
      pageTitle = 'New Tab';
    } else if (mockPage) {
      pageTitle = mockPage.title;
    }

    // Record stats
    if (settings.dataSaverEnabled) {
      const saved = mockPage?.trackersCount ? mockPage.trackersCount * 2.4 : 6.8;
      setTotalSavedKb((prev) => prev + saved);
      setTotalBlockedTrackers((prev) => prev + (mockPage?.trackersCount || 3));
    }

    // Record History (ONLY if NOT in incognito)
    if (!activeTab.isIncognito && !finalUrl.startsWith('harpymini://')) {
      const newHistoryItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        userId: user?.uid,
        title: pageTitle,
        url: finalUrl,
        visitedAt: new Date().toISOString(),
      };
      setHistoryItems((prev) => [newHistoryItem, ...prev.slice(0, 99)]);

      if (user) {
        const historyPath = `users/${user.uid}/history`;
        setDoc(doc(db, historyPath, newHistoryItem.id), {
          id: newHistoryItem.id,
          userId: user.uid,
          title: newHistoryItem.title,
          url: newHistoryItem.url,
          visitedAt: newHistoryItem.visitedAt,
        }).catch((err) => console.warn('History firestore error:', err));
      }
    }

    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id !== activeTabId) return tab;
        const newStack = tab.historyStack.slice(0, tab.historyIndex + 1);
        newStack.push(finalUrl);
        return {
          ...tab,
          url: finalUrl,
          title: pageTitle,
          isLoading: false,
          readerMode: false,
          historyStack: newStack,
          historyIndex: newStack.length - 1,
          canGoBack: newStack.length > 1,
          canGoForward: false,
        };
      })
    );
  };

  // Back / Forward / Reload / Home
  const handleGoBack = () => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId || tab.historyIndex <= 0) return tab;
        const newIndex = tab.historyIndex - 1;
        const targetUrl = tab.historyStack[newIndex];
        return {
          ...tab,
          url: targetUrl,
          title: MOCK_PAGES[targetUrl]?.title || targetUrl,
          historyIndex: newIndex,
          canGoBack: newIndex > 0,
          canGoForward: true,
          readerMode: false,
        };
      })
    );
  };

  const handleGoForward = () => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId || tab.historyIndex >= tab.historyStack.length - 1) return tab;
        const newIndex = tab.historyIndex + 1;
        const targetUrl = tab.historyStack[newIndex];
        return {
          ...tab,
          url: targetUrl,
          title: MOCK_PAGES[targetUrl]?.title || targetUrl,
          historyIndex: newIndex,
          canGoBack: true,
          canGoForward: newIndex < tab.historyStack.length - 1,
          readerMode: false,
        };
      })
    );
  };

  const handleReload = () => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId) return tab;
        return { ...tab, isLoading: true };
      })
    );
    setTimeout(() => {
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id !== activeTabId) return tab;
          return { ...tab, isLoading: false };
        })
      );
    }, 450);
  };

  const handleGoHome = () => {
    handleNavigate('harpymini://newtab');
  };

  // Toggle Reader Mode
  const handleToggleReaderMode = () => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === activeTabId ? { ...tab, readerMode: !tab.readerMode } : tab))
    );
  };

  // Toggle Bookmark for active page
  const isCurrentBookmarked = bookmarks.some((b) => b.url === activeTab.url);
  const handleToggleBookmark = async () => {
    if (activeTab.url.startsWith('harpymini://')) return;

    if (isCurrentBookmarked) {
      const toRemove = bookmarks.find((b) => b.url === activeTab.url);
      setBookmarks((prev) => prev.filter((b) => b.url !== activeTab.url));
      if (user && toRemove) {
        deleteDoc(doc(db, `users/${user.uid}/bookmarks`, toRemove.id)).catch(console.warn);
      }
    } else {
      const newBm: Bookmark = {
        id: `bm-${Date.now()}`,
        userId: user?.uid,
        title: activeTab.title || activeTab.url,
        url: activeTab.url,
        icon: '⭐',
        category: 'Favorites',
        createdAt: new Date().toISOString(),
      };
      setBookmarks((prev) => [newBm, ...prev]);

      if (user) {
        const bookmarksPath = `users/${user.uid}/bookmarks`;
        try {
          await setDoc(doc(db, bookmarksPath, newBm.id), {
            id: newBm.id,
            userId: user.uid,
            title: newBm.title,
            url: newBm.url,
            category: newBm.category,
            createdAt: newBm.createdAt,
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, bookmarksPath);
        }
      }
    }
  };

  // New Tab creation
  const handleNewTab = (isIncognito: boolean = false) => {
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newId,
      url: 'harpymini://newtab',
      title: isIncognito ? 'Private Tab' : 'New Tab',
      isLoading: false,
      isIncognito,
      canGoBack: false,
      canGoForward: false,
      historyStack: ['harpymini://newtab'],
      historyIndex: 0,
      readerMode: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  // Close Tab
  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) {
      // Don't close last tab, just reset it to newtab
      setTabs([
        {
          id: 'tab-1',
          url: 'harpymini://newtab',
          title: 'New Tab',
          isLoading: false,
          isIncognito: false,
          canGoBack: false,
          canGoForward: false,
          historyStack: ['harpymini://newtab'],
          historyIndex: 0,
          readerMode: false,
        },
      ]);
      setActiveTabId('tab-1');
      return;
    }

    const filtered = tabs.filter((t) => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[filtered.length - 1].id);
    }
  };

  // Toggle Incognito
  const handleToggleIncognito = () => {
    const nextState = !isIncognitoMode;
    setIsIncognitoMode(nextState);
    handleNewTab(nextState);
  };

  // Save for Offline Reading
  const handleSaveOffline = async (title: string, url: string, content: string) => {
    const pageId = `offline-${Date.now()}`;
    const newOffline: OfflinePage = {
      id: pageId,
      userId: user?.uid,
      title,
      url,
      content,
      savedAt: new Date().toISOString(),
      sizeKb: +(content.length / 1024).toFixed(1) || 12.0,
    };

    setOfflinePages((prev) => [newOffline, ...prev]);

    if (user) {
      const offlinePath = `users/${user.uid}/offlinePages`;
      try {
        await setDoc(doc(db, offlinePath, pageId), {
          id: pageId,
          userId: user.uid,
          title: newOffline.title,
          url: newOffline.url,
          content: newOffline.content,
          savedAt: newOffline.savedAt,
          sizeKb: newOffline.sizeKb,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, offlinePath);
      }
    }
  };

  // Delete Offline Page
  const handleDeleteOfflinePage = async (id: string) => {
    setOfflinePages((prev) => prev.filter((p) => p.id !== id));
    if (user) {
      deleteDoc(doc(db, `users/${user.uid}/offlinePages`, id)).catch(console.warn);
    }
  };

  // Execute Voice Command Actions
  const handleExecuteVoiceCommand = (action: {
    intent: string;
    target?: string;
    query?: string;
    spokenResponse?: string;
  }) => {
    switch (action.intent) {
      case 'NAVIGATE':
        if (action.target) handleNavigate(action.target);
        break;
      case 'SEARCH':
        if (action.query) handleNavigate(action.query);
        break;
      case 'SUMMARIZE':
        setIsSummarizeOpen(true);
        break;
      case 'READER_MODE':
        handleToggleReaderMode();
        break;
      case 'NEW_TAB':
        handleNewTab(false);
        break;
      case 'CLOSE_TAB':
        handleCloseTab(activeTabId);
        break;
      case 'INCOGNITO':
        handleToggleIncognito();
        break;
      case 'DATA_SAVER':
        setSettings((prev) => ({ ...prev, dataSaverEnabled: !prev.dataSaverEnabled }));
        break;
      case 'OPEN_PASSWORDS':
        setIsPasswordManagerOpen(true);
        break;
      case 'BOOKMARK':
        handleToggleBookmark();
        break;
      case 'MINI_APP':
        if (action.target === 'calculator' || action.target === 'notes' || action.target === 'speed' || action.target === 'wallet') {
          if (action.target === 'wallet') {
            setIsWeb3WalletOpen(true);
          } else {
            setMiniAppInitial(action.target as any);
            setIsMiniAppsOpen(true);
          }
        } else {
          setIsMiniAppsOpen(true);
        }
        break;
      case 'AI_ANSWER':
        setIsAiDrawerOpen(true);
        break;
      default:
        if (action.query) handleNavigate(action.query);
        break;
    }
  };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans select-none ${
      activeTab.isIncognito ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-200'
    }`}>
      {/* Browser Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        isIncognitoMode={isIncognitoMode}
        onToggleIncognito={handleToggleIncognito}
      />

      {/* Omnibar & Tools Navbar */}
      <Navbar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onGoHome={handleGoHome}
        onToggleReaderMode={handleToggleReaderMode}
        isBookmarked={isCurrentBookmarked}
        onToggleBookmark={handleToggleBookmark}
        dataSaverEnabled={settings.dataSaverEnabled}
        onToggleDataSaver={() =>
          setSettings((prev) => ({ ...prev, dataSaverEnabled: !prev.dataSaverEnabled }))
        }
        onOpenAiAssistant={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
        onOpenSummarize={() => setIsSummarizeOpen(true)}
        onOpenVoiceCommand={() => setIsVoiceOpen(true)}
        onOpenQrModal={() => setIsQrOpen(true)}
        onOpenPasswordManager={() => setIsPasswordManagerOpen(true)}
        onOpenOfflineDownloads={() => setIsOfflineDownloadsOpen(true)}
        onOpenMiniApps={() => {
          setMiniAppInitial('calculator');
          setIsMiniAppsOpen(true);
        }}
        onOpenWeb3Wallet={() => setIsWeb3WalletOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenDesktopGuide={() => setIsDesktopGuideOpen(true)}
        user={user}
        totalSavedKb={totalSavedKb}
        totalBlockedTrackers={totalBlockedTrackers}
      />

      {/* Main View Area with Active Browser Content & Docked AI Assistant */}
      <div className="flex-1 flex overflow-hidden relative">
        <BrowserView
          activeTab={activeTab}
          bookmarks={bookmarks}
          onNavigate={handleNavigate}
          onToggleReaderMode={handleToggleReaderMode}
          onOpenSummarize={() => setIsSummarizeOpen(true)}
          onOpenMiniApp={(app) => {
            if (app === 'wallet') {
              setIsWeb3WalletOpen(true);
            } else {
              setMiniAppInitial(app);
              setIsMiniAppsOpen(true);
            }
          }}
          onOpenPasswordManager={() => setIsPasswordManagerOpen(true)}
          onSaveOffline={handleSaveOffline}
          dataSaverEnabled={settings.dataSaverEnabled}
          totalSavedKb={totalSavedKb}
          totalBlockedTrackers={totalBlockedTrackers}
        />

        {/* Docked AI Assistant Drawer */}
        <AiAssistantDrawer
          isOpen={isAiDrawerOpen}
          onClose={() => setIsAiDrawerOpen(false)}
          activeTab={activeTab}
        />
      </div>

      {/* Modals & Tool Sheets */}
      <SummarizeModal
        isOpen={isSummarizeOpen}
        onClose={() => setIsSummarizeOpen(false)}
        activeTab={activeTab}
        onSaveToNotes={(t, s) => {
          const current = localStorage.getItem('harpymini_scratchpad') || '';
          localStorage.setItem('harpymini_scratchpad', `${current}\n\n### ${t}\n${s}`);
        }}
      />

      <VoiceCommandModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        currentUrl={activeTab.url}
        onExecuteCommand={handleExecuteVoiceCommand}
      />

      <PasswordManagerModal
        isOpen={isPasswordManagerOpen}
        onClose={() => setIsPasswordManagerOpen(false)}
        user={user}
        currentUrl={activeTab.url}
      />

      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        currentUrl={activeTab.url}
        onNavigate={handleNavigate}
      />

      <OfflineDownloadsModal
        isOpen={isOfflineDownloadsOpen}
        onClose={() => setIsOfflineDownloadsOpen(false)}
        offlinePages={offlinePages}
        onOpenPage={(page) => {
          setTabs((prev) =>
            prev.map((tab) => {
              if (tab.id !== activeTabId) return tab;
              return {
                ...tab,
                url: page.url,
                title: page.title,
                readerMode: true,
              };
            })
          );
        }}
        onDeletePage={handleDeleteOfflinePage}
      />

      <MiniAppsModal
        isOpen={isMiniAppsOpen}
        onClose={() => setIsMiniAppsOpen(false)}
        initialApp={miniAppInitial}
      />

      <Web3WalletModal
        isOpen={isWeb3WalletOpen}
        onClose={() => setIsWeb3WalletOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        onClearHistory={() => {
          setHistoryItems([]);
          localStorage.removeItem('harpymini_history');
        }}
        historyCount={historyItems.length}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
      />

      <DesktopGuideModal
        isOpen={isDesktopGuideOpen}
        onClose={() => setIsDesktopGuideOpen(false)}
      />
    </div>
  );
}
