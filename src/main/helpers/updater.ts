import electronUpdater, { AppUpdater } from 'electron-updater';

/**
 * Configures and returns the autoUpdater instance
 * Sets up event listeners for update events
 */
export function getAutoUpdater(): AppUpdater {
  // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
  // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
  const { autoUpdater } = electronUpdater;
  autoUpdater.forceDevUpdateConfig = true;
  autoUpdater.disableDifferentialDownload = true;
  autoUpdater.disableWebInstaller = true;

  // Log update events to console
  autoUpdater.logger = console;

  return autoUpdater;
}

/**
 * Initializes the auto-updater and checks for updates
 */
export function initializeUpdater(): void {
  const autoUpdater = getAutoUpdater();

  // Check for updates
  autoUpdater.checkForUpdatesAndNotify();
}
