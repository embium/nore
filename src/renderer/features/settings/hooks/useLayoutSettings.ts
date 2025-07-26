// State
import { layoutSettingsState$ } from '../state/layoutSettingsState';

/**
 * Hook to access and update layout settings
 */
export function useLayoutSettings() {
  // Get values from state
  const middlebarWidth = layoutSettingsState$.middlebarWidth.get();

  // Update functions
  const setMiddlebarWidth = (width: number) => {
    layoutSettingsState$.middlebarWidth.set(width);
  };

  const updateLayoutSettings = (settings: { middlebarWidth?: number }) => {
    if (settings.middlebarWidth !== undefined) {
      layoutSettingsState$.middlebarWidth.set(settings.middlebarWidth);
    }
  };

  return {
    // Values
    middlebarWidth,

    // Update functions
    setMiddlebarWidth,
    updateLayoutSettings,
  };
}
