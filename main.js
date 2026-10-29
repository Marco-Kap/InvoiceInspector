const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs/promises');

let mainWindow;
let pendingFiles = [];
const allowedExtensions = new Set(['.xml', '.pdf']);

function collectFileArgs(argv) {
  return argv.filter(arg => typeof arg === 'string' && !arg.startsWith('-'))
    .map(arg => path.resolve(arg))
    .filter(arg => allowedExtensions.has(path.extname(arg).toLowerCase()));
}
function queueFiles(paths) {
  pendingFiles.push(...paths);
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents.isLoading() === false) {
    mainWindow.webContents.send('invoice-files-opened', pendingFiles.splice(0));
  }
}
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440, height: 960, minWidth: 900, minHeight: 650,
    title: 'InvoiceInspector',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.setWindowOpenHandler(({url}) => {
    if (url.startsWith('https://') || url.startsWith('http://')) shell.openExternal(url);
    return {action:'deny'};
  });
  mainWindow.webContents.on('did-finish-load', () => {
    if (pendingFiles.length) mainWindow.webContents.send('invoice-files-opened', pendingFiles.splice(0));
  });
}
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
else {
  app.on('second-instance', (_event, argv) => {
    if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); }
    queueFiles(collectFileArgs(argv));
  });
  app.whenReady().then(() => {
    pendingFiles.push(...collectFileArgs(process.argv));
    createWindow();
    app.on('open-file', (event, filePath) => { event.preventDefault(); queueFiles([filePath]); });
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
ipcMain.handle('invoice:get-initial-files', () => pendingFiles.splice(0));
ipcMain.handle('invoice:read-file', async (_event, filePath) => {
  const resolved = path.resolve(String(filePath));
  if (!allowedExtensions.has(path.extname(resolved).toLowerCase())) throw new Error('Dateiformat nicht unterstützt.');
  const bytes = await fs.readFile(resolved);
  return { name: path.basename(resolved), type: path.extname(resolved).toLowerCase() === '.pdf' ? 'application/pdf' : 'text/xml', bytes: Array.from(bytes) };
});
