import { publicProcedure, router } from '@/shared/trpc';
import { McpManager } from '@nore/mcp-manager';
import { z } from 'zod';
import { convertCommand } from '../utils/convertCommand';
import { shell } from 'electron';

/**
 * Router for Electron window control operations
 * Provides window manipulation functionality (close, minimize, maximize)
 * and state observation via subscriptions
 */
export const mcpRouter = router({
  /**
   * Closes the current application window
   */
  startServer: publicProcedure
    .input(
      z.object({
        id: z.string(),
        command: z.string(),
        args: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const manager = new McpManager('main', () => {});

      manager.start({
        id: input.id,
        command: convertCommand(input.command),
        args: input.args,
      });
      return true;
    }),
  stopServer: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const manager = new McpManager('main', () => {});
      manager.stop(input.id);
      return true;
    }),
  getTools: publicProcedure.query(async () => {
    const manager = new McpManager('main', () => {});
    return manager.getTools();
  }),
  executeTool: publicProcedure
    .input(
      z.object({
        serverId: z.string(),
        toolName: z.string(),
        inputs: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const manager = new McpManager('main', () => {});
      const result = await manager.executeTool(input);
      return result;
    }),
  openLink: publicProcedure
    .input(z.object({ url: z.string() }))
    .query(async ({ input }) => {
      shell.openExternal(input.url);
      return true;
    }),
});
