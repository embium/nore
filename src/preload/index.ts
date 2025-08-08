import { exposeElectronTRPC } from 'electron-trpc/main';
import { contextBridge } from 'electron';
import { windowApi } from './api/window';
import { systemApi } from './api/system';

// Expose electron-trpc
process.once('loaded', () => {
  exposeElectronTRPC();
});

// Expose APIs to the renderer via contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  window: windowApi,
  system: systemApi,
});

// Type definitions for the exposed APIs
export interface ElectronAPI {
  window: typeof windowApi;
  system: typeof systemApi;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
