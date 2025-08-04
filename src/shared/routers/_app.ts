import { publicProcedure, router } from '../trpc';
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
  mcp: mcpRouter,
  fileAttachments: fileAttachmentsRouter,
  ollama: ollamaRouter,
});

export type AppRouter = typeof appRouter;
