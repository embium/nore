import React from 'react';
import { GoSidebarCollapse } from 'react-icons/go';
import { observer } from '@legendapp/state/react';

import { layoutState$ } from '@/app/state/layout';

interface MainScreenProps {
  title: React.ReactNode;
}

export const MainHeader: React.FC<MainScreenProps> = observer(({ title }) => {
  const isMiddlebarCollapsed = layoutState$.middlebarCollapsed.get();
  return (
    <div className="h-[60px] flex items-center justify-between px-3 border-b box-border flex-shrink-0">
      <div className="flex items-center flex-1">
        {isMiddlebarCollapsed && (
          <button
            onClick={() => layoutState$.middlebarCollapsed.set(false)}
            className="mr-2 b-0 bg-transparent border-none shadow-none hover:bg-accent"
          >
            <GoSidebarCollapse size={20} />
          </button>
        )}
        <div className="flex-1 font-medium text-lg px-2">{title}</div>
        <div className="w-8" />
      </div>
    </div>
  );
});
