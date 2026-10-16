const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getDesktopStatus: () => ipcRenderer.invoke('get-desktop-status'),
  toggleDataSaver: (enabled) => ipcRenderer.send('toggle-datasaver', enabled),
  onTrackerBlocked: (callback) => {
    ipcRenderer.on('tracker-blocked', (event, data) => callback(data));
  },
});
