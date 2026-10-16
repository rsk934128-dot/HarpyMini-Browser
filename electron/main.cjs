const { app, BrowserWindow, BrowserView, ipcMain, session } = require('electron');
const path = require('path');

let mainWindow;
let currentBrowserView = null;
let isDataSaverActive = true;

// Ad and tracker blocklist domains for native Chromium network interception
const TRACKER_BLOCKLIST = [
  '*://*.doubleclick.net/*',
  '*://*.google-analytics.com/*',
  '*://*.googlesyndication.com/*',
  '*://*.adnxs.com/*',
  '*://*.facebook.net/*',
  '*://*.scorecardresearch.com/*',
  '*://*.quantserve.com/*',
  '*://*.outbrain.com/*',
  '*://*.taboola.com/*',
];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'HarpyMini Browser',
    backgroundColor: '#0f172a',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;
  const startUrl = isDev
    ? (process.env.APP_URL || 'http://localhost:3000')
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Set up native ad-block & privacy network shield
  setupPrivacyFilter();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Native Chromium Request Interceptor (Brave-like Ad & Tracker blocker)
function setupPrivacyFilter() {
  const defaultSession = session.defaultSession;

  defaultSession.webRequest.onBeforeRequest(
    { urls: ['*://*/*'] },
    (details, callback) => {
      if (!isDataSaverActive) {
        return callback({ cancel: false });
      }

      const url = details.url.toLowerCase();
      const isBlocked = TRACKER_BLOCKLIST.some((pattern) => {
        const domainPattern = pattern.replace(/\*:\/\/\*\./g, '').replace(/\/\*/g, '');
        return url.includes(domainPattern);
      });

      if (isBlocked) {
        // Send notification to UI about blocked tracker
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('tracker-blocked', { url: details.url });
        }
        callback({ cancel: true });
      } else {
        callback({ cancel: false });
      }
    }
  );
}

// IPC event handlers from React UI
ipcMain.handle('get-desktop-status', () => {
  return {
    isDesktop: true,
    version: app.getVersion() || '2.5.0',
    platform: process.platform,
    chromiumVersion: process.versions.chrome,
    electronVersion: process.versions.electron,
  };
});

ipcMain.on('toggle-datasaver', (event, enabled) => {
  isDataSaverActive = Boolean(enabled);
});

// App Lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
