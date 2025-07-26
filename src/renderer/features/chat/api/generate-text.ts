// Types
import { Message, MessageTextPart, StreamTextResult } from '@/types/chat';

// Shared
import {
  ModelInterface,
  OnResultChange,
  onResultChangeWithCancel,
} from '@/lib/ai/core/base';
import { trpcProxyClient } from '@/src/shared/config';
import { tool, ToolSet, jsonSchema } from 'ai';

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
          console.log(
            `Executing tool: ${mcpTool.toolName} with params:`,
            params
          );
          // Execute the MCP tool via tRPC
          try {
            const result = await trpcProxyClient.mcp.executeTool.mutate({
              serverId: mcpTool.serverId,
              toolName: mcpTool.toolName,
              inputs: JSON.stringify(params),
            });
            console.log(`Tool ${mcpTool.toolName} execution result:`, result);
            return result;
          } catch (error) {
            console.error(`Error executing tool ${mcpTool.toolName}:`, error);
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
    params.onResultChangeWithCancel({ cancel }); // Pass cancel method first
    const onResultChange: OnResultChange = (data) => {
      // Log tool calls when they occur
      if (data.toolCalls) {
        console.log('Tool calls detected:', data.toolCalls);
      }

      // Log tool results when they are received
      if (data.toolResults) {
        console.log('Tool results received:', data.toolResults);
      }

      // Log content parts which may contain the AI's response to tool results
      if (data.contentParts) {
        console.log('Content parts received:', data.contentParts);
      }

      result = {
        ...result,
        ...data,
      };
      params.onResultChangeWithCancel({ ...data, cancel });
    };

    result = await model.chat(params.messages, {
      signal: controller.signal,
      onResultChange,
      tools: aiSdkTools,
    });

    console.log(result);
  } catch (err) {
    console.error(err);
    // if a cancellation is performed, do not throw an exception, otherwise the content will be overwritten.
    if (controller.signal.aborted) {
      return result;
    }
    throw err;
  }

  return result;
}
