import { observable } from '@legendapp/state';
import { persistObservable } from '@legendapp/state/persist';

export const layoutState$ = observable<LayoutState>({
  middlebarWidth: 600,
  middlebarCollapsed: false,
});

persistObservable(layoutState$, {
  local: 'layout_state',
});
