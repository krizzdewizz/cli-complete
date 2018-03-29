import { app, BrowserWindow, Menu } from 'electron';
import * as url from 'url';
import { config } from './config';
import { createMenu } from './menu';
import { loadSettings, saveSettings } from './settings';

let win: BrowserWindow;

interface ServerSettings {
  window: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
}

const SETTINGS_FILE = 'server-settings.json';
const DEFAULT_SETTINGS = { window: { width: 1280, height: 864 } };
let settings: ServerSettings;

function createWindow() {
  settings = loadSettings<ServerSettings>(SETTINGS_FILE, DEFAULT_SETTINGS);
  win = new BrowserWindow({
    ...settings.window,
    icon: config.icon,
    frame: false,
    transparent: true,
    backgroundColor: '#000'
  });

  win.loadURL(url.format(config.url));

  const dev = config.dev || process.argv.indexOf('-dev') >= 0;

  win.setMenu(Menu.buildFromTemplate(createMenu(dev)));

  if (dev) {
    win.webContents.openDevTools();
  }

  const saveBounds = () => {
    if (!win.isMaximized()) {
      Object.assign(settings.window, win.getBounds());
    }
  };

  win.on('resize', () => saveBounds());
  win.on('move', () => saveBounds());

  win.on('close', () => saveSettings<ServerSettings>(SETTINGS_FILE, settings));

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

export function closeWindow() {
  win.close();
}

export function dirname() {
  return __dirname;
}