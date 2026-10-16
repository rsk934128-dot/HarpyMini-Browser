export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  isIncognito: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  historyStack: string[];
  historyIndex: number;
  readerMode: boolean;
  dataSavedKb?: number;
  blockedTrackers?: number;
}

export interface Bookmark {
  id: string;
  userId?: string;
  title: string;
  url: string;
  icon?: string;
  category: string;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  userId?: string;
  title: string;
  url: string;
  visitedAt: string;
}

export interface PasswordItem {
  id: string;
  userId?: string;
  website: string;
  username: string;
  encryptedData: string; // AES-GCM cipher
  iv: string;
  salt: string;
  decryptedPassword?: string; // only in memory when master password is active
  createdAt: string;
  updatedAt: string;
}

export interface OfflinePage {
  id: string;
  userId?: string;
  title: string;
  url: string;
  content: string; // clean text / markdown / html
  savedAt: string;
  sizeKb: number;
}

export interface UserBrowserSettings {
  searchEngine: 'google' | 'duckduckgo' | 'bing';
  dataSaverEnabled: boolean;
  adBlockEnabled: boolean;
  theme: 'dark' | 'light' | 'oled';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  readerTheme: 'light' | 'sepia' | 'dark' | 'paper';
  readerFont: 'sans' | 'serif' | 'mono';
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type WebhookActionType = 
  | 'open_url' 
  | 'search' 
  | 'notification' 
  | 'ai_summary' 
  | 'open_miniapp' 
  | 'custom';

export interface WebhookEvent {
  id: string;
  timestamp: string;
  source: 'incoming' | 'outgoing';
  action: WebhookActionType;
  sender?: string;
  targetUrl?: string;
  title?: string;
  message?: string;
  payload?: any;
  status: 'success' | 'failed' | 'pending';
  responseCode?: number;
  error?: string;
}

export interface OutgoingWebhookEndpoint {
  id: string;
  name: string;
  service: 'google_chat' | 'discord' | 'slack' | 'google_apps_script' | 'custom';
  url: string;
  enabled: boolean;
  secret?: string;
  createdAt: string;
}

export interface BrowserNotification {
  id: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionType?: WebhookActionType;
  actionPayload?: any;
  timestamp: string;
  source: 'webhook' | 'google' | 'browser';
  read?: boolean;
}

