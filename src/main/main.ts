import { app, protocol } from 'electron';
import pkg from '../../package.json';
import { eventEmitter } from '@/shared/config/context';
import { createMainWindow } from './windows/mainWindow';
import { createSplashWindow, closeSplashWindow } from './windows/splashWindow';
import { setupWindowEvents } from './events/window';
import { initializeUpdater } from './helpers/updater';
import { setupUpdateEventForwarding } from './events/updates';

export function main() {
  // Fix for Linux sandbox issues in Snap and AppImage
  if (process.platform === 'linux') {
    app.commandLine.appendSwitch('no-sandbox');
  }

  /**
   * Initializes the application when Electron is ready
   */
  function initializeApp() {
    // Show splash screen first
    createSplashWindow();

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

    // Set up update event forwarding now that main window exists
    setupUpdateEventForwarding();

    // Initialize and check for updates (no need to wait for this to complete)
    initializeUpdater();

    setupWindowEvents();
  }

  app.setName(pkg.name);

  app.whenReady().then(initializeApp);

  app.once('window-all-closed', () => app.quit());

  // Make event emitter available globally for subscriptions
  (global as any).eventEmitter = eventEmitter;
}
