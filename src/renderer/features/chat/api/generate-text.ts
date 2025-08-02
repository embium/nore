// Types
import {
  Message,
  MessageTextPart,
  StreamTextResult,
  ToolExecution,
} from '@/types/chat';

// Shared
import {
  ModelInterface,
  OnResultChange,
  onResultChangeWithCancel,
} from '@/lib/ai/core/base';
import { trpcProxyClient } from '@/src/shared/config';
import { tool, ToolSet, jsonSchema } from 'ai';

// Extend globalThis to include our tool executions
declare global {
  var currentToolExecutions: ToolExecution[] | undefined;
}

// MCP Tool Info interface
interface ToolInfo {
  serverId: string;
  toolName: string;
  description: string;
  parameters: string; // JSON string
}

/**
 * Convert MCP ToolInfo array to AI SDK ToolSet format
 */
function convertMcpToolsToAiSdk(mcpTools: ToolInfo[]): ToolSet {
  const toolSet: ToolSet = {};

  for (const mcpTool of mcpTools) {
    try {
      // Parse the parameters JSON string
      const parametersSchema = JSON.parse(mcpTool.parameters);

      // Use AI SDK's jsonSchema helper to create a schema from JSON schema
      // This ensures compatibility with the AI SDK's tool function
      const schema = jsonSchema(parametersSchema);

      toolSet[mcpTool.toolName] = tool({
        description: mcpTool.description,
        parameters: schema,
        execute: async (params) => {
          const startTime = Date.now();

          // Execute the MCP tool via tRPC
          try {
            const result = await trpcProxyClient.mcp.executeTool.mutate({
              serverId: mcpTool.serverId,
              toolName: mcpTool.toolName,
              inputs: JSON.stringify(params),
            });
            const endTime = Date.now();

            // Store tool execution details for UI display
            const toolExecution: ToolExecution = {
              toolName: mcpTool.toolName,
              parameters: params,
              result: result,
              timestamp: startTime,
              duration: endTime - startTime,
            };

            // Store tool execution for UI display
            if (!globalThis.currentToolExecutions) {
              globalThis.currentToolExecutions = [];
            }
            globalThis.currentToolExecutions.push(toolExecution);

            return result;
          } catch (error) {
            const endTime = Date.now();

            // Store failed tool execution
            const toolExecution: ToolExecution = {
              toolName: mcpTool.toolName,
              parameters: params,
              result: null,
              timestamp: startTime,
              duration: endTime - startTime,
              error: error instanceof Error ? error.message : String(error),
            };

            if (!globalThis.currentToolExecutions) {
              globalThis.currentToolExecutions = [];
            }
            globalThis.currentToolExecutions.push(toolExecution);

            throw error;
          }
        },
      });
    } catch (error) {
      console.warn(`Failed to convert MCP tool ${mcpTool.toolName}:`, error);
    }
  }

  return toolSet;
}

export async function generateText(
  model: ModelInterface,
  params: {
    messages: Message[];
    webBrowsing?: boolean;
  }
): Promise<string> {
  const controller = new AbortController();
  let result: StreamTextResult = {
    contentParts: [],
  };

  try {
    result = await model.chat(params.messages, {
      signal: controller.signal,
    });
  } catch (err) {
    console.error(err);
    if (controller.signal.aborted) {
      return '';
    }
    throw err;
  }

  return (
    result.contentParts
      ?.map((part: { type: string }) => {
        if (part.type === 'text') {
          return (part as MessageTextPart).text;
        }
        return '';
      })
      .join('') || ''
  );
}

export async function streamText(
  model: ModelInterface,
  params: {
    messages: Message[];
    onResultChangeWithCancel: onResultChangeWithCancel;
    webBrowsing?: boolean;
  }
) {
  const controller = new AbortController();
  const cancel = () => controller.abort();

  let result: StreamTextResult = {
    contentParts: [],
  };

  const mcpTools = await trpcProxyClient.mcp.getTools.query();
  const aiSdkTools = convertMcpToolsToAiSdk(mcpTools);

  try {
    // Initialize tool executions for this conversation
    globalThis.currentToolExecutions = [];

    params.onResultChangeWithCancel({ cancel }); // Pass cancel method first
    const onResultChange: OnResultChange = (data) => {
      // Include tool executions in the result
      const toolExecutions = globalThis.currentToolExecutions
        ? [...globalThis.currentToolExecutions]
        : undefined;

      result = {
        ...result,
        ...data,
        ...(toolExecutions && toolExecutions.length > 0
          ? { toolExecutions }
          : {}),
      };

      params.onResultChangeWithCancel({
        ...data,
        cancel,
        ...(toolExecutions && toolExecutions.length > 0
          ? { toolExecutions }
          : {}),
      });
    };

    result = await model.chat(params.messages, {
      signal: controller.signal,
      onResultChange,
      tools: aiSdkTools,
    });
  } catch (err) {
    // if a cancellation is performed, do not throw an exception, otherwise the content will be overwritten.
    if (controller.signal.aborted) {
      return result;
    }
    throw err;
  }

  return result;
}
