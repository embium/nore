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
  CustomProviderConfig,
  AISettingsState,
  ModelConfig,
  createCustomProviderConfig,
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
  const selectedModelId = aiSettingsState$.selectedModelId.get() as
    | string
    | null;

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

// Custom provider management functions
export function addCustomProvider(config: CustomProviderConfig): void {
  const currentProviders = aiSettingsState$.providers.get() as Record<
    ProviderType,
    ProviderConfig
  >;

  aiSettingsState$.providers.set({
    ...currentProviders,
    [config.id]: config,
  });
}

export function removeCustomProvider(providerId: ProviderType): void {
  const currentProviders = aiSettingsState$.providers.get() as Record<
    ProviderType,
    ProviderConfig
  >;

  const providerConfig = currentProviders[providerId];
  if (!('isCustom' in providerConfig) || !providerConfig.isCustom) {
    console.warn('Cannot remove built-in provider:', providerId);
    return;
  }

  const { [providerId]: removed, ...remainingProviders } = currentProviders;
  aiSettingsState$.providers.set(remainingProviders);

  // Also remove any models associated with this provider
  const currentModels = aiSettingsState$.models.get() as Record<
    string,
    ModelConfig
  >;
  const updatedModels = Object.fromEntries(
    Object.entries(currentModels).filter(
      ([_, model]) => model.provider !== providerId
    )
  );
  aiSettingsState$.models.set(updatedModels);

  // Clear selected model if it belongs to the removed provider
  const selectedModelId = aiSettingsState$.selectedModelId.get();
  if (
    selectedModelId &&
    currentModels[selectedModelId]?.provider === providerId
  ) {
    aiSettingsState$.selectedModelId.set(null);
  }
}

export function getAllProviders(): ProviderConfig[] {
  const providers = aiSettingsState$.providers.get() as Record<
    ProviderType,
    ProviderConfig
  >;
  return Object.values(providers);
}

export function getCustomProviders(): CustomProviderConfig[] {
  return getAllProviders().filter(
    (provider): provider is CustomProviderConfig => {
      return 'isCustom' in provider && provider.isCustom === true;
    }
  );
}

export function isProviderIdAvailable(id: string): boolean {
  const providers = aiSettingsState$.providers.get() as Record<
    ProviderType,
    ProviderConfig
  >;
  return !(id in providers);
}

export function generateUniqueProviderId(baseName: string): string {
  let counter = 1;
  let id = baseName;

  while (!isProviderIdAvailable(id)) {
    id = `${baseName}-${counter}`;
    counter++;
  }

  return id;
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
