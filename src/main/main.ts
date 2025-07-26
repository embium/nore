import { app } from 'electron';
import pkg from '../../package.json';
import { eventEmitter } from '@/shared/config/context';
import { createMainWindow } from './windows/mainWindow';
import { createSplashWindow, closeSplashWindow } from './windows/splashWindow';
import { setupWindowEvents } from './events/windowEvents';

export function main() {
  app.setName(pkg.name.toLocaleUpperCase());

  app.whenReady().then(() => {
    // Show splash screen first
    const splash = createSplashWindow();

    // Create main window
    const mainWindow = createMainWindow();

    // Close splash when main window is ready
    mainWindow.webContents.once('dom-ready', () => {
      // Give a small delay to ensure smooth transition
      setTimeout(() => {
        closeSplashWindow();
        mainWindow.show();
      }, 500);
    });

    setupWindowEvents();
  });

  app.once('window-all-closed', () => app.quit());

  // Make event emitter available globally for subscriptions
  (global as any).eventEmitter = eventEmitter;
}
