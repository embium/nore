import React, { useState, useEffect } from 'react';

// UI Components
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomSelectContent } from '@/components/ui/custom-select';
import { Separator } from '@/components/ui/separator';
import { FiSearch, FiX } from 'react-icons/fi';

// Types
import { ModelConfig } from '@/types/ai';
import { GeminiModelInfo } from '@/lib/ai/models/gemini';

// Utils
import { cn } from '@/lib/utils';

interface ModelBaseInfoProps {
  editingModel: ModelConfig | null;
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
  customName: string;
  setCustomName: (name: string) => void;
  sortedAvailableModels: (string | GeminiModelInfo)[];
}

/**
 * Component for base model selection and custom name input
 */
export const ModelBaseInfo: React.FC<ModelBaseInfoProps> = ({
  editingModel,
  selectedModelId,
  setSelectedModelId,
  customName,
  setCustomName,
  sortedAvailableModels,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredModels, setFilteredModels] = useState<
    (string | GeminiModelInfo)[]
  >(sortedAvailableModels);

  // Filter models when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredModels(sortedAvailableModels);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = sortedAvailableModels.filter((model) => {
      const modelName =
        typeof model === 'string'
          ? model.toLowerCase()
          : (model.displayName || model.name).toLowerCase();
      return modelName.includes(query);
    });

    setFilteredModels(filtered);
  }, [searchQuery, sortedAvailableModels]);

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          htmlFor="base-model"
          className="col-span-4"
        >
          Base Model
        </Label>
        <Select
          value={selectedModelId}
          onValueChange={setSelectedModelId}
          disabled={!!editingModel}
        >
          <SelectTrigger
            className={cn('col-span-4', editingModel && 'opacity-70')}
          >
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <CustomSelectContent
            className="max-h-[300px]"
            searchInput={
              <div 
                className="flex items-center px-2 py-2 sticky top-0 bg-popover z-10 border-b"
                onKeyDown={(e) => {
                  // Capture ALL keyboard events to prevent type-to-select behavior
                  e.stopPropagation();
                }}
              >
                <FiSearch className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {searchQuery && (
                  <FiX
                    className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100 cursor-pointer"
                    onClick={() => setSearchQuery('')}
                  />
                )}
              </div>
            }
          >
            <div className="pt-1">
              {filteredModels.length === 0 ? (
                <div className="text-center py-2 text-sm text-muted-foreground">
                  No models found
                </div>
              ) : (
                filteredModels.map((model) => (
                  <SelectItem
                    key={typeof model === 'string' ? model : model.name}
                    value={typeof model === 'string' ? model : model.name}
                  >
                    {typeof model === 'string'
                      ? model
                      : model.displayName || model.name}
                  </SelectItem>
                ))
              )}
            </div>
          </CustomSelectContent>
        </Select>
        {editingModel && (
          <p className="col-span-4 text-xs text-amber-500">
            The base model cannot be changed when editing.
          </p>
        )}
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          htmlFor="custom-name"
          className="col-span-4"
        >
          Custom Name
        </Label>
        <Input
          id="custom-name"
          className="col-span-4"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="My Custom Model"
        />
      </div>

      <Separator className="my-2" />
    </>
  );
};

export default ModelBaseInfo;
