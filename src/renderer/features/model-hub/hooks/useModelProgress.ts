import { useEffect } from 'react';
import t from '@/shared/config/index';
import { modelHubState$ } from '../state';

/**
 * Hook to subscribe to model installation progress updates
 */
export function useModelProgress() {
  const utils = t.useUtils();

  useEffect(() => {
    // Subscribe to model progress events from the main process
    const subscription = utils.client.ollama.onPullProgress.subscribe(
      undefined,
      {
        onData: (data) => {
          if (data.modelName && typeof data.progress === 'number') {
            // Update the model progress in state using the correct observable pattern
            modelHubState$.modelProgress[data.modelName].set({
              progress: data.progress,
              status: data.status || 'Downloading...',
            });
          }
        },
        onError: (error) => {
          console.error('Model progress subscription error:', error);
        },
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [utils.client.ollama.onPullProgress]);
}
