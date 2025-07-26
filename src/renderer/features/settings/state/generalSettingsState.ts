import { observable } from '@legendapp/state';
import { persistObservable } from '@legendapp/state/persist';

// Types
import { GeneralSettingsState } from '@/types/generalSettings';

// Create the initial state
const initialState: GeneralSettingsState = {
  enableLinks: true,
  shouldGenerateChatTitles: true,
};

/**
 * Observable state for the Settings feature
 */
export const generalSettingsState$ =
  observable<GeneralSettingsState>(initialState);

/**
 * Setup persistence for settings state
 */
persistObservable(generalSettingsState$, {
  local: 'general-settings-state',
});
