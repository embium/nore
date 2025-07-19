import { publicProcedure, router } from '../trpc';
import { shell } from 'electron';
import pkg from '../../../package.json';
import { windowRouter } from './window';
import { mcpRouter } from './mcp';

export const appRouter = router({
  window: windowRouter,
  version: publicProcedure.query(async () => {
    return pkg.version;
  }),
  gh: publicProcedure.mutation(async () => {
    shell.openExternal('https://github.com/Inalegwu/ElectroStatic');
  }),
  mcp: mcpRouter,
});

export type AppRouter = typeof appRouter;
