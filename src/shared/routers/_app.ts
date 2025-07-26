import { publicProcedure, router } from '../trpc';
import { shell } from 'electron';
import pkg from '../../../package.json';
import { windowRouter } from './window';
import { mcpRouter } from './mcp';
import { fileAttachmentsRouter } from './fileAttachments';
import { ollamaRouter } from './ollama';

export const appRouter = router({
  window: windowRouter,
  version: publicProcedure.query(async () => {
    return pkg.version;
  }),
  gh: publicProcedure.mutation(async () => {
    shell.openExternal('https://github.com/Inalegwu/ElectroStatic');
  }),
  mcp: mcpRouter,
  fileAttachments: fileAttachmentsRouter,
  ollama: ollamaRouter,
});

export type AppRouter = typeof appRouter;
