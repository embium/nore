import React, { useState } from 'react';
import { ChevronRight, Plus, Settings } from 'lucide-react';
import { observer } from '@legendapp/state/react';

// Types
import type { ProviderType, ProviderConfig } from '@/types/ai';
import { BUILT_IN_PROVIDERS } from '@/types/ai';
import { isCustomProvider } from '@/types/ai';

// Utils
import { cn } from '@/lib/utils';

// Components
import ProviderIcon from '@/components/ProviderIcons';
import { CustomProviderManager } from './CustomProviderManager';

// State
import { getAllProviders } from '../../state/aiSettings/aiProviders/providerConfigs';

interface ProviderListProps {
  providers: ProviderType[];
  activeProvider: ProviderType;
  setActiveProvider: (provider: ProviderType) => void;
  isProviderEnabled: (provider: ProviderType) => boolean;
}

/**
 * Provider selection sidebar list
 */
const ProviderListComponent = ({
  providers,
  activeProvider,
  setActiveProvider,
  isProviderEnabled,
}: ProviderListProps) => {
  const [showCustomManager, setShowCustomManager] = useState(false);

  // Get all providers (built-in + custom) and categorize them
  const allProviders = getAllProviders();
  const builtInProviders = allProviders.filter((p) =>
    BUILT_IN_PROVIDERS.includes(p.id as any)
  );
  const customProviders = allProviders.filter(isCustomProvider);

  const renderProviderItem = (provider: ProviderConfig) => (
    <div
      key={provider.id}
      className={cn(
        'flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors',
        activeProvider === provider.id
          ? 'bg-muted font-medium'
          : 'hover:bg-muted/50'
      )}
      onClick={() => setActiveProvider(provider.id)}
      onKeyDown={(e) => {
        // Handle Enter or Space key press
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveProvider(provider.id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Set ${provider.id} as active provider`}
    >
      <div className="flex items-center">
        <span className="mr-2">
          <ProviderIcon provider={provider.id} />
        </span>
        <div className="flex flex-col">
          <span>{provider.name}</span>
          {isCustomProvider(provider) && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Custom
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center">
        {isProviderEnabled(provider.id) && (
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        )}
        <ChevronRight
          className={cn(
            'h-4 w-4 ml-1 transition-transform',
            activeProvider === provider.id && 'rotate-90'
          )}
        />
      </div>
    </div>
  );

  return (
    <div className="md:col-span-1 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Available Providers</div>
        <button
          onClick={() => setShowCustomManager(true)}
          className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Manage Custom Providers"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
        {/* Built-in Providers */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-1">
            Built-in Providers
          </div>
          {builtInProviders.map(renderProviderItem)}
        </div>

        {/* Custom Providers */}
        {customProviders.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-1">
              Custom Providers
            </div>
            {customProviders.map(renderProviderItem)}
          </div>
        )}

        {/* Add Custom Provider Button */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={() => setShowCustomManager(true)}
            className="w-full flex items-center justify-center p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Manage Custom Providers
          </button>
        </div>
      </div>

      {/* Custom Provider Manager Modal */}
      <CustomProviderManager
        isOpen={showCustomManager}
        onClose={() => setShowCustomManager(false)}
      />
    </div>
  );
};

export const ProviderList = observer(ProviderListComponent);
