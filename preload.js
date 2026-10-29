const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('invoiceInspectorDesktop', {
  getInitialFiles: () => ipcRenderer.invoke('invoice:get-initial-files'),
  readInvoiceFile: (filePath) => ipcRenderer.invoke('invoice:read-file', filePath),
  onOpenFiles: (callback) => {
    ipcRenderer.on('invoice-files-opened', (_event, paths) => callback(paths));
  }
});
