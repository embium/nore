import { exposeElectronTRPC } from 'electron-trpc/main';

// Expose electron-trpc
process.once('loaded', () => {
  exposeElectronTRPC();
});
