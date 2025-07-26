// Application constants
export const APP_NAME = 'Nore';
export const APP_VERSION = '1.0.0';

import { ProviderConfig, ProviderType } from '@/types/ai';
import { PromptType } from '@/types/defaultPrompts';

export enum ContextWindowSize {
  t16k = 16384,
  t32k = 32768,
  t64k = 65536,
  t128k = 131072,
}

// Mapping for dropdown display
export const promptTypeLabels: Record<PromptType, string> = {
  system: 'Default System Prompt',
  title: 'Title Generation Prompt',
  fileAttachments: 'File Attachments Prompt',
};

export const defaultProviders: Record<ProviderType, ProviderConfig> = {
  Ollama: {
    id: 'Ollama',
    name: 'Ollama',
    enabled: false,
    apiHost: 'http://127.0.0.1:11434',
    description: 'Run open-source LLMs locally on your machine',
  },
  'Google Gemini': {
    id: 'Google Gemini',
    name: 'Google Gemini',
    enabled: false,
    apiHost: 'https://generativelanguage.googleapis.com/',
    apiKey: '',
    description: "Google's multimodal AI model",
  },
  OpenAI: {
    id: 'OpenAI',
    name: 'OpenAI',
    enabled: false,
    apiHost: 'https://api.openai.com',
    apiKey: '',
    description: 'OpenAI API',
  },
  Claude: {
    id: 'Claude',
    name: 'Claude',
    enabled: false,
    apiHost: 'https://api.anthropic.com/v1',
    apiKey: '',
    description: 'Claude API',
  },
  Groq: {
    id: 'Groq',
    name: 'Groq',
    enabled: false,
    apiHost: 'https://api.groq.com',
    apiKey: '',
    description: 'Groq API',
  },
  DeepSeek: {
    id: 'DeepSeek',
    name: 'DeepSeek',
    enabled: false,
    apiHost: 'https://api.deepseek.com/',
    apiKey: '',
    description: 'DeepSeek API',
  },
  TogetherAI: {
    id: 'TogetherAI',
    name: 'TogetherAI',
    enabled: false,
    apiHost: 'https://api.together.xyz/v1',
    apiKey: '',
    description: 'TogetherAI API',
  },
  LMStudio: {
    id: 'LMStudio',
    name: 'LMStudio',
    enabled: false,
    apiHost: 'http://127.0.0.1:1234',
    apiKey: '',
    description: 'LMStudio API',
  },
  Perplexity: {
    id: 'Perplexity',
    name: 'Perplexity',
    enabled: false,
    apiHost: 'https://api.perplexity.ai',
    apiKey: '',
    description: 'Perplexity API',
  },
  xAI: {
    id: 'xAI',
    name: 'xAI',
    enabled: false,
    apiHost: 'https://api.xai.com',
    apiKey: '',
    description: 'xAI API',
  },
  OpenRouter: {
    id: 'OpenRouter',
    name: 'OpenRouter',
    enabled: false,
    apiHost: 'https://openrouter.ai/api/v1',
    apiKey: '',
    description: 'OpenRouter API',
  },
};
