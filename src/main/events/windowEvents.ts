import { BrowserWindow, ipcMain } from 'electron';
import { getMainWindow } from '../windows/mainWindow';

export function setupWindowEvents() {
  // Handle window minimize request
  ipcMain.on('window:minimize', () => {
    const win = getMainWindow();
    if (win) {
      win.minimize();
    }
  });

  // Handle window maximize/restore request
  ipcMain.on('window:maximize', () => {
    const win = getMainWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  // Handle window close request
  ipcMain.on('window:close', () => {
    const win = getMainWindow();
    if (win) {
      win.close();
    }
  });

  // Handle window isMaximized check
  ipcMain.handle('window:isMaximized', () => {
    const win = getMainWindow();
    return win ? win.isMaximized() : false;
  });
}
