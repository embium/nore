import { BrowserWindow } from 'electron';
import { join } from 'node:path';

let splashWindow: BrowserWindow | null = null;

export function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    resizable: false,
    center: true,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      sandbox: false,
    },
  });

  // Handle different paths in development vs production
  const isDev = process.env.NODE_ENV === 'development';
  const splashPath = isDev
    ? join(__dirname, '../../src/renderer/splash.html')
    : join(__dirname, '../renderer/splash.html');
    
  splashWindow.loadFile(splashPath);

  splashWindow.once('ready-to-show', () => {
    splashWindow?.show();
  });

  splashWindow.on('closed', () => {
    splashWindow = null;
  });

  return splashWindow;
}

export function closeSplashWindow() {
  if (splashWindow) {
    splashWindow.close();
    splashWindow = null;
  }
}

export function getSplashWindow() {
  return splashWindow;
}
