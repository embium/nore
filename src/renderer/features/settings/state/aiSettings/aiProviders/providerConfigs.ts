/**
 * AI Provider Default Configurations
 * Default configurations for AI providers
 */
import { observable } from '@legendapp/state';
import { persistObservable } from '@legendapp/state/persist';

// Types
import type {
  ProviderType,
  ProviderConfig,
  AISettingsState,
  ModelConfig,
} from '@/types/ai';
import { defaultProviders } from '@/shared/constants';

// Create the aiSettings state observable with proper typing
export const aiSettingsState$ = observable<AISettingsState>({
  selectedModelId: null,
  providers: defaultProviders as Record<ProviderType, ProviderConfig>,
  models: {} as Record<string, ModelConfig>,
});

// Setup persistence for the settings
persistObservable(aiSettingsState$, {
  local: 'ai-settings',
});

// Provider getter functions
export function getProviderConfig(providerId: ProviderType): ProviderConfig {
  const providers = aiSettingsState$.providers.get() as Record<
    ProviderType,
    ProviderConfig
  >;
  return providers[providerId];
}

export function updateProviderConfig(
  providerId: ProviderType,
  config: Partial<ProviderConfig>
): void {
  // Get current providers with proper typing
  const currentProviders = aiSettingsState$.providers.get() as Record<
    ProviderType,
    ProviderConfig
  >;

  // Update the specific provider
  aiSettingsState$.providers.set({
    ...currentProviders,
    [providerId]: {
      ...currentProviders[providerId],
      ...config,
    },
  });

  // Get updated provider config
  const providers = aiSettingsState$.providers.get() as Record<
    ProviderType,
    ProviderConfig
  >;
  const providerConfig = providers[providerId];
  const selectedModelId = aiSettingsState$.selectedModelId.get() as string | null;

  if (selectedModelId) {
    const models = aiSettingsState$.models.get() as Record<string, ModelConfig>;
    const selectedModel = models[selectedModelId];
    if (!providerConfig.enabled) {
      console.log('Provider disabled, unselecting model');
      if (selectedModel?.provider === providerId) {
        console.log('Unselecting model');
        aiSettingsState$.selectedModelId.set(null);
      }
    }
  }
  const models = aiSettingsState$.models.get() as Record<string, ModelConfig>;
  if (models && typeof models === 'object') {
    // Create a new models object with updated values
    const updatedModels = { ...models };

    for (const modelId in models) {
      if (models[modelId].provider === providerId) {
        updatedModels[modelId] = {
          ...models[modelId],
          enabled: false,
        };
      }
    }

    // Update the models state with the new object
    aiSettingsState$.models.set(updatedModels);
  }
}

export function getEnabledProviders(): ProviderConfig[] {
  const providers = aiSettingsState$.providers.get() as Record<
    ProviderType,
    ProviderConfig
  >;
  return Object.values(providers).filter(
    (provider: ProviderConfig) => provider.enabled
  );
}

// Helper function to get the embedding provider type from a provider type
export function getEmbeddingProviderType(
  providerType: ProviderType
): ProviderType {
  return providerType;
}
