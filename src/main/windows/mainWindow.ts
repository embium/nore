import { createContext } from '@/shared/config/context';
import { appRouter } from '@/shared/routers/_app';
import { BrowserWindow } from 'electron';
import { createIPCHandler } from 'electron-trpc/main';
import { join } from 'node:path';

let mainWindow: BrowserWindow | null = null;

export function createMainWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 500,
    minHeight: 500,
    frame: false,
    show: false, // Hide the window initially
    webPreferences: {
      sandbox: false,
      preload: join(__dirname, '../preload/index.js'),
      webSecurity: false, // Disable web security
      allowRunningInsecureContent: false, // Allow loading insecure content
    },
    autoHideMenuBar: true,
  });
  createIPCHandler({
    router: appRouter,
    windows: [mainWindow],
    createContext,
  });

  // We'll handle showing the window in the main process
  // after the splash screen is closed

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // mainWindow.webContents.openDevTools({ mode: "bottom" });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

export function getMainWindow() {
  return mainWindow;
}
