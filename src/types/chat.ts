/**
 * Types related to chat functionality
 */

import type { LanguageModelUsage } from 'ai';

export interface MessagePicture {
  url?: string;
  storageKey?: string;
  loading?: boolean;
}

export type MessageTextPart = { type: 'text'; text: string };

export type MessageImagePart = { type: 'image'; storageKey: string };

export type MessageToolCallPart = {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: unknown;
};

export type MessageToolCalls = { [key: string]: MessageToolCall };

export type MessageToolCall = {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
};

export interface ToolExecution {
  toolName: string;
  parameters: unknown;
  result: unknown;
  timestamp: number;
  duration: number;
  error?: string;
}

export const MessageRoleEnum = {
  System: 'system',
  User: 'user',
  Assistant: 'assistant',
  Tool: 'tool',
} as const;

export type MessageRole =
  (typeof MessageRoleEnum)[keyof typeof MessageRoleEnum];

export interface Message {
  id: string; // 当role为tool时，id为toolCallId
  name?: string;
  role: MessageRole;
  cancel?: () => void;
  generating?: boolean;
  model?: string;

  style?: string; // image style
  reasoningContent?: string;
  toolCalls?: MessageToolCalls;
  contentParts: MessageContentParts;

  errorCode?: number;
  error?: string;
  errorExtra?: {
    [key: string]: unknown;
  };
  status?: (
    | {
        type: 'sending_file';
        mode?: 'local' | 'advanced';
      }
    | {
        type: 'loading_webpage';
        mode?: 'local' | 'advanced';
      }
    | {
        type: 'web_browsing';
      }
  )[];

  wordCount?: number;
  tokenCount?: number;
  tokensUsed?: number;
  timestamp?: number;
  firstTokenLatency?: number;
  toolExecutions?: ToolExecution[];
}

export type MessageContentParts = (
  | MessageTextPart
  | MessageImagePart
  | MessageToolCallPart
)[];

export type StreamTextResult = {
  contentParts: MessageContentParts;
  reasoningContent?: string;
  usage?: LanguageModelUsage;
  toolExecutions?: ToolExecution[];
};
