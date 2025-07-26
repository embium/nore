import { observable, computed } from '@legendapp/state';
import { persistObservable } from '@legendapp/state/persist';

// Types
import { LayoutSettings } from '@/types/layoutSettings';

// Create the initial state
const initialState: LayoutSettings = {
  middlebarWidth: 415,
  middlebarCollapsed: false,
};

// Create the observable state
export const layoutSettingsState$ = observable<LayoutSettings>(initialState);

// Setup persistence
persistObservable(layoutSettingsState$, {
  local: 'layout-state',
});

// Computed values
export const middlebarWidth = computed(() =>
  layoutSettingsState$.middlebarWidth.get()
);

export const middlebarCollapsed = computed(() =>
  layoutSettingsState$.middlebarCollapsed.get()
);

export const setMiddlebarCollapsed = (collapsed: boolean) =>
  layoutSettingsState$.middlebarCollapsed.set(collapsed);

// Set the middle sidebar width with constraints
export function setMiddleSidebarWidth(width: number) {
  // Constrain width to valid range
  const newWidth = Math.max(180, Math.min(width, 1200));
  console.log('newWidth', newWidth);

  // Update the state
  layoutSettingsState$.middlebarWidth.set(newWidth);
}

// Hook to access layout state values with Legend State
export function useLayoutState() {
  const middlebarWidth = layoutSettingsState$.middlebarWidth.get();
  const middlebarCollapsed = layoutSettingsState$.middlebarCollapsed.get();

  return {
    middlebarWidth,
    middlebarCollapsed,
    setMiddlebarCollapsed,
  };
}
