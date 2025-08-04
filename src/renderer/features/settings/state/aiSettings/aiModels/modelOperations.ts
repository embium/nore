/**
 * Model Operations
 * Functions for managing models (add, update, delete, get)
 */
import { computed } from '@legendapp/state';
import { v4 as uuidv4 } from 'uuid';

// State
import {
  aiSettingsState$,
  getProviderConfig,
} from '../aiProviders/providerConfigs';

// Types
import type { ModelConfig, ProviderType } from '@/types/ai';

/**
 * Get all models from state
 */
export function getAllModels(): ModelConfig[] {
  const models = aiSettingsState$.models.get();
  // Filter out any undefined or null values
  return Object.values(models).filter(
    (model): model is ModelConfig => model !== undefined && model !== null
  );
}

/**
 * Get models enabled for use
 */
export function getEnabledModels(): ModelConfig[] {
  const allModels = getAllModels();
  return allModels.filter((model) => {
    const providerConfig = getProviderConfig(model.provider);
    return model.enabled && providerConfig.enabled;
  });
}

/**
 * Get a model by its ID
 */
export function getModelById(modelId: string): ModelConfig | null {
  // Use getAllModels which already handles type safety
  const allModels = getAllModels();
  return allModels.find(model => model.id === modelId) || null;
}

/**
 * Get the selected model
 */
export function getSelectedModel(): ModelConfig | null {
  const selectedId = aiSettingsState$.selectedModelId.get();
  if (!selectedId) return null;
  
  // Use getAllModels which already handles type safety
  const allModels = getAllModels();
  return allModels.find(model => model.id === selectedId) || null;
}

/**
 * Set the selected model
 */
export function setSelectedModel(modelId: string | null): void {
  aiSettingsState$.selectedModelId.set(modelId);
}

/**
 * Add a model configuration
 */
export function addModel(providerId: ProviderType, model: ModelConfig): void {
  // Get current models
  const models = aiSettingsState$.models.get() as Record<string, ModelConfig>;
  
  // Update models with the new model
  aiSettingsState$.models.set({
    ...models,
    [model.id]: model
  });
}

/**
 * Legacy method for adding models
 */
export function addModelLegacy(model: ModelConfig): void {
  // Ensure ID exists
  const modelId = model.id || uuidv4();
  
  // Get current models
  const models = aiSettingsState$.models.get() as Record<string, ModelConfig>;
  
  // Update models with the new model
  aiSettingsState$.models.set({
    ...models,
    [modelId]: { ...model, id: modelId }
  });
}

/**
 * Update a model's configuration
 */
export function updateModel(
  modelId: string,
  updates: Partial<ModelConfig>
): void {
  // Get current models
  const models = aiSettingsState$.models.get() as Record<string, ModelConfig>;
  const existingModel = models[modelId];
  
  if (!existingModel) {
    console.error(`Cannot update model ${modelId} as it doesn't exist`);
    return;
  }

  // Update the model with new values
  aiSettingsState$.models.set({
    ...models,
    [modelId]: {
      ...existingModel,
      ...updates
    }
  });
}

/**
 * Delete a model
 */
export function deleteModel(modelId: string): void {
  // Check if this is the selected model
  const selectedModelId = aiSettingsState$.selectedModelId.get();
  if (selectedModelId === modelId) {
    // Reset the selection
    aiSettingsState$.selectedModelId.set(null);
  }

  try {
    // Get current models with proper typing
    const currentModels = aiSettingsState$.models.get() as Record<string, ModelConfig>;
    
    // Create a new models object without the model to delete
    const models: Record<string, ModelConfig> = { ...currentModels };
    delete models[modelId];
    
    // Update the state
    aiSettingsState$.models.set(models);
  } catch (error) {
    console.error(`Error deleting model ${modelId}:`, error);
  }
}

/**
 * Create a custom model ID
 */
export function createCustomModelId(
  providerId: ProviderType,
  baseName: string
): string {
  return `${providerId.toLowerCase()}-custom-${baseName}-${Date.now().toString(36)}`;
}

/**
 * Computed list of enabled models
 */
export const enabledModels = computed(() => {
  const allModels = getAllModels();
  return allModels.filter((model) => model.enabled);
});

/**
 * Computed selected model
 */
export const selectedModel = computed(() => {
  const selectedId = aiSettingsState$.selectedModelId.get();
  if (!selectedId) return null;
  
  // Use the getAllModels function which already handles type safety
  const allModels = getAllModels();
  return allModels.find(model => model.id === selectedId) || null;
});
