import { app, BrowserWindow } from 'electron';
import * as url from 'url';
import { config } from './config';

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 864,
    icon: config.icon
  });

  win.loadURL(url.format(config.url));

  const dev = config.dev || process.argv.indexOf('-dev') >= 0;

  if (dev) {
    win.webContents.openDevTools();
  }

  win.on('closed', () => win = null);
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
