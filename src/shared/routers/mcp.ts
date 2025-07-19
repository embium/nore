import { publicProcedure, router } from '@/shared/trpc';
import { McpManager } from '@nore/mcp-manager';
import { z } from 'zod';
import { convertCommand } from '../utils/convertCommand';

/**
 * Router for Electron window control operations
 * Provides window manipulation functionality (close, minimize, maximize)
 * and state observation via subscriptions
 */
export const mcpRouter = router({
  /**
   * Closes the current application window
   */
  startServer: publicProcedure.mutation(async () => {
    const manager = new McpManager('test', (event) => {
      console.log(event);
    });

    manager.start({
      id: 'knowledge-graph',
      command: convertCommand('npx'),
      args: ['-y', '@itseasy21/mcp-knowledge-graph'],
    });
    return true;
  }),
  stopServer: publicProcedure.mutation(async () => {
    const manager = new McpManager('test', () => {});
    manager.stop('knowledge-graph');
    return true;
  }),
  getTools: publicProcedure.query(async () => {
    const manager = new McpManager('test', () => {});
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
      const manager = new McpManager('test', () => {});
      const result = await manager.executeTool(input);
      console.log(result);
      return result;
    }),
  getCurrentDir: publicProcedure.query(async () => {
    const manager = new McpManager('test', () => {});
    return manager.getCurrentDir();
  }),
});
