/**
 * Types related to AI models and providers
 */

import type { GeminiModel } from '@/lib/ai/models/gemini';

export type ModelMeta = {
  [key: string]: {
    contextWindow: number;
    maxOutput?: number;
    functionCalling?: boolean;
    vision?: boolean;
    reasoning?: boolean;
  };
};

// Define the built-in provider types
export type BuiltInProviderType =
  | 'Ollama'
  | 'Google Gemini'
  | 'OpenAI'
  | 'Claude'
  | 'Groq'
  | 'DeepSeek'
  | 'TogetherAI'
  | 'LMStudio'
  | 'Perplexity'
  | 'xAI'
  | 'OpenRouter';

// Provider type now includes custom providers
export type ProviderType = BuiltInProviderType | string;

// List of built-in providers
export const BUILT_IN_PROVIDERS: BuiltInProviderType[] = [
  'Ollama',
  'Google Gemini',
  'OpenAI',
  'Claude',
  'Groq',
  'DeepSeek',
  'TogetherAI',
  'LMStudio',
  'Perplexity',
  'xAI',
  'OpenRouter',
];

// Maintain backward compatibility
export const AVAILABLE_PROVIDERS = BUILT_IN_PROVIDERS;

// Base provider configuration interface
export interface BaseProviderConfig {
  id: ProviderType;
  name: string;
  enabled: boolean;
  apiHost: string;
  apiKey?: string;
  description: string;
}

// Extended configuration for custom providers
export interface CustomProviderConfig extends BaseProviderConfig {
  isCustom: true;
  providerType: 'openai-compatible' | 'custom';
  headers?: Record<string, string>;
  modelPath?: string;
  supportedFeatures?: {
    streaming?: boolean;
    toolUse?: boolean;
    vision?: boolean;
    imageGeneration?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Built-in provider configuration
export interface BuiltInProviderConfig extends BaseProviderConfig {
  isCustom?: false;
}

// Union type for all provider configurations
export type ProviderConfig = BuiltInProviderConfig | CustomProviderConfig;

// Define which built-in providers need which configurations
export const BUILT_IN_PROVIDER_CONFIG_MAP: Record<
  BuiltInProviderType,
  { needsApiKey: boolean; needsApiHost: boolean }
> = {
  Ollama: { needsApiKey: false, needsApiHost: true },
  'Google Gemini': { needsApiKey: true, needsApiHost: false },
  OpenAI: { needsApiKey: true, needsApiHost: false },
  Claude: { needsApiKey: true, needsApiHost: false },
  Groq: { needsApiKey: true, needsApiHost: false },
  DeepSeek: { needsApiKey: true, needsApiHost: false },
  TogetherAI: { needsApiKey: true, needsApiHost: false },
  LMStudio: { needsApiKey: false, needsApiHost: true },
  Perplexity: { needsApiKey: true, needsApiHost: false },
  xAI: { needsApiKey: true, needsApiHost: false },
  OpenRouter: { needsApiKey: true, needsApiHost: false },
};

// Function to get provider configuration requirements
export function getProviderConfigRequirements(
  providerId: ProviderType,
  providerConfig?: ProviderConfig
): {
  needsApiKey: boolean;
  needsApiHost: boolean;
} {
  // Check if it's a built-in provider
  if (providerId in BUILT_IN_PROVIDER_CONFIG_MAP) {
    return BUILT_IN_PROVIDER_CONFIG_MAP[providerId as BuiltInProviderType];
  }

  // For custom providers, determine requirements based on the actual config
  if (providerConfig && isCustomProvider(providerConfig)) {
    // API host is always required for custom providers
    // API key is optional unless the provider has one configured
    return {
      needsApiKey: false, // Make API key optional for custom providers
      needsApiHost: true,
    };
  }

  // Fallback for unknown providers
  return { needsApiKey: true, needsApiHost: true };
}

// Maintain backward compatibility
export const PROVIDER_CONFIG_MAP = BUILT_IN_PROVIDER_CONFIG_MAP;

// AI Settings state interface
export interface AISettingsState {
  selectedModelId: string | null;
  providers: Record<ProviderType, ProviderConfig>;
  models: Record<string, ModelConfig>;
  [key: string]: unknown; // Allow dynamic properties
}

// Model configuration interface
export interface ModelConfig {
  id: string;
  name: string;
  provider: ProviderType;
  providerId?: string;
  isCustom: boolean;
  enabled: boolean;

  // Model parameters
  temperature?: number;
  contextMessageLimit?: number;
  contextTokenLimit?: number;
  maxOutputTokens?: number;

  // Additional parameters
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;

  // Extra parameters as object
  extraParams?: Record<string, unknown>;
}

/**
 * Model information with additional metadata
 */
export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  capability?: string;
  pullCount?: string;
  sizes?: string[];
  size: number;
  modified?: string;
}

// Custom Provider Utilities
export function isCustomProvider(
  config: ProviderConfig
): config is CustomProviderConfig {
  return 'isCustom' in config && config.isCustom === true;
}

export function isBuiltInProvider(
  providerId: ProviderType
): providerId is BuiltInProviderType {
  return BUILT_IN_PROVIDERS.includes(providerId as BuiltInProviderType);
}

export function createCustomProviderConfig(
  id: string,
  name: string,
  apiHost: string,
  options: Partial<
    Omit<
      CustomProviderConfig,
      'id' | 'name' | 'apiHost' | 'isCustom' | 'createdAt' | 'updatedAt'
    >
  > = {}
): CustomProviderConfig {
  const now = new Date().toISOString();
  return {
    id,
    name,
    apiHost,
    enabled: false,
    description: options.description || `Custom provider: ${name}`,
    isCustom: true,
    providerType: options.providerType || 'openai-compatible',
    apiKey: options.apiKey,
    headers: options.headers,
    modelPath: options.modelPath,
    supportedFeatures: {
      streaming: true,
      toolUse: false,
      vision: false,
      imageGeneration: false,
      ...options.supportedFeatures,
    },
    createdAt: now,
    updatedAt: now,
  };
}
