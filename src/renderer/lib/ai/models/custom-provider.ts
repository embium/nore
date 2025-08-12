import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { ModelMeta } from '@/types/ai';
import OpenAICompatible from './openai-compatible';
import type { ModelHelpers } from '../core/base';
// For now, let's remove proxy support for custom providers
// import { fetchWithProxy } from '@/utils/proxy';

interface CustomProviderOptions {
  name: string;
  apiKey?: string;
  apiHost: string;
  model: string;
  headers?: Record<string, string>;
  modelPath?: string;
  supportedFeatures?: {
    streaming?: boolean;
    toolUse?: boolean;
    vision?: boolean;
    imageGeneration?: boolean;
  };
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  useProxy?: boolean;
}

const helpers: ModelHelpers = {
  isModelSupportVision: (model: string) => false, // Can be overridden based on provider features
  isModelSupportToolUse: (model: string) => false, // Can be overridden based on provider features
};

export default class CustomProvider extends OpenAICompatible {
  public name: string;
  public static helpers = helpers;
  private providerOptions: CustomProviderOptions;

  constructor(options: CustomProviderOptions) {
    super({
      apiKey: options.apiKey || '',
      apiHost: options.apiHost,
      model: options.model,
      temperature: options.temperature,
      topP: options.topP,
      maxTokens: options.maxTokens,
      useProxy: options.useProxy || false,
    });

    this.name = options.name;
    this.providerOptions = options;
  }

  protected getChatModel() {
    const provider = createOpenAICompatible({
      name: this.name,
      apiKey: this.providerOptions.apiKey,
      baseURL: this.getBaseUrl(),
      headers: this.providerOptions.headers,
      // fetch: this.providerOptions.useProxy ? fetchWithProxy : undefined,
    });

    return provider.languageModel(this.providerOptions.model);
  }

  private getBaseUrl(): string {
    const { apiHost, modelPath } = this.providerOptions;
    if (modelPath) {
      return `${apiHost.replace(/\/$/, '')}/${modelPath}`;
    }
    return apiHost;
  }

  public isSupportToolUse(): boolean {
    return this.providerOptions.supportedFeatures?.toolUse ?? false;
  }

  public isSupportVision(): boolean {
    return this.providerOptions.supportedFeatures?.vision ?? false;
  }

  public isSupportImageGeneration(): boolean {
    return this.providerOptions.supportedFeatures?.imageGeneration ?? false;
  }

  public isSupportStreaming(): boolean {
    return this.providerOptions.supportedFeatures?.streaming ?? true;
  }

  // Override helpers based on provider features
  static getHelpersForProvider(
    features?: CustomProviderOptions['supportedFeatures']
  ): ModelHelpers {
    return {
      isModelSupportVision: () => features?.vision ?? false,
      isModelSupportToolUse: () => features?.toolUse ?? false,
    };
  }

  public async listModels(): Promise<string[]> {
    try {
      return await super.listModels();
    } catch (error) {
      console.warn(
        `Failed to fetch models from custom provider ${this.name}:`,
        error
      );
      // Return a default model if listing fails
      return [this.providerOptions.model];
    }
  }
}

// Model configuration template for custom providers
export const createCustomModelConfig = (
  modelId: string,
  features?: CustomProviderOptions['supportedFeatures']
): ModelMeta => ({
  [modelId]: {
    contextWindow: 4096, // Default context window
    maxOutput: 2048,
    functionCalling: features?.toolUse ?? false,
    vision: features?.vision ?? false,
  },
});
