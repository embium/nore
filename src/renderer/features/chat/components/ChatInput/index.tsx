import React, { useEffect } from 'react';
import {
  observer,
  useObservable,
  useObserveEffect,
} from '@legendapp/state/react';
import { FiFile } from 'react-icons/fi';

// Utils
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';

// Sub-components
import { ModelSelector } from './ModelSelector';
import { InputArea } from './InputArea';
import { FileAttachmentModal } from './FileAttachmentModal';
import { ModelSettingsDialog } from './ModelSettingsDialog';
import { ExpressPromptsSelector } from './ExpressPromptsSelector';

// Hooks
import { useTextInput } from '../../hooks/useTextInput';
import { useModelSelection } from '../../hooks/useModelSelection';
import { useModelOperations } from '@/features/settings/hooks/useModelOperations';
import { useFileAttachment } from '../../hooks/useFileAttachment';

// Types
import { Prompt } from '@/types/promptsLibrary';

import {
  enabledModels,
  selectedModel,
} from '@/features/settings/state/aiSettings/aiSettingsState';
import { chatState$ } from '../../state';
import { McpServersManager } from './McpServersManager';

export interface ChatInputProps {
  /** Current input value */
  value: string;
  /** Called when input value changes */
  onChange: (value: string) => void;
  /** Called when user submits the input */
  onSend: (message: string) => void;
  /** Whether the chat is currently loading/generating a response */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Called when user clicks to cancel generation */
  onCancel?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Called when user selects a model */
  onSelectModel: (modelId: string) => void;
  /** Called to get note content */
  getContent: (noteId: string) => Promise<string>;
  /** Called when files are selected for upload */
}

/**
 * Chat input component with send button and model selector
 */
const ChatInputComponent: React.FC<ChatInputProps> = observer(
  ({
    value,
    onChange,
    onSend,
    isLoading = false,
    error = null,
    onCancel,
    className,
    onSelectModel,
    getContent,
  }) => {
    const selectedModelValue = selectedModel.get();
    const enabledModelsValue = enabledModels.get();
    const focusInputTrigger = chatState$.focusInputTrigger.get();

    useEffect(() => {
      if (focusInputTrigger) {
        textareaRef.current?.focus();
        chatState$.focusInputTrigger.set(false);
      }
    }, [focusInputTrigger]);

    // Use input handling hook
    const {
      textareaRef,
      isSendDisabled,
      handleInputChange,
      handleKeyPress,
      handleSend,
    } = useTextInput({
      value,
      onChange,
      onSend,
      isLoading,
      selectedModelExists: !!selectedModel,
    });

    // Use model selection hook
    const {
      handleSelectModel,
      hasModels,
      selectedModelName,
      selectedModelProvider,
    } = useModelSelection({
      selectedModel: selectedModelValue,
      enabledModels: enabledModelsValue,
      onSelectModel,
    });

    // Get model operations with the provider ID
    const { handleCreateOrUpdateModel } = useModelOperations(
      selectedModelProvider!
    );

    // Use file attachment hook
    const { selectedFiles, documentsAvailable } = useFileAttachment();

    // Count selected documents
    const selectedDocumentsCount = documentsAvailable.filter(
      (doc) => doc.selected
    ).length;

    const handleSelectPrompt = (prompt: Prompt) => {
      if (textareaRef.current) {
        const textareaContent = textareaRef.current.value;
        const appendTextareaContent =
          textareaContent && `\n\n${textareaContent}`;
        onChange(`${prompt.prompt} ${appendTextareaContent}`);
        textareaRef.current.focus();
      }
    };

    return (
      <>
        <div className="flex flex-row">
          {selectedDocumentsCount > 0 && (
            <div className="flex items-center px-3 py-1.5 text-sm border border-dashed rounded-md w-fit mx-3 mb-2 mt-2 text-muted-foreground">
              <FiFile className="w-4 h-4 mr-2" />
              {selectedDocumentsCount}{' '}
              {selectedDocumentsCount === 1 ? 'Document' : 'Documents'} Selected
            </div>
          )}
        </div>
        <div className={cn('w-full border-t p-3', className)}>
          {/* Loading indicator */}
          {isLoading && (
            <>
              <div className="p-3 text-center text-foreground">
                Generating response...
              </div>
              {onCancel && (
                <div className="flex justify-center mb-3">
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-md border border-foreground"
                  >
                    Stop Generation
                  </button>
                </div>
              )}
            </>
          )}

          {/* Error message */}
          {error && (
            <div className="p-2 mb-3 text-center text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md">
              Error: {error}
            </div>
          )}

          {!selectedModelValue && (
            <div className="p-2 mb-3 text-center text-amber-500 bg-red-100 dark:bg-red-900/20 rounded-md">
              No model has been selected. Please select a model in the settings.
            </div>
          )}

          {/* Input field and send button */}
          <div className="flex flex-col">
            <div className="py-2">
              <InputArea
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                onSend={handleSend}
                isSendDisabled={isSendDisabled}
                textareaRef={textareaRef}
              />
            </div>

            {/* Controls area */}
            <div className="flex justify-between">
              <div className="flex justify-start gap-2">
                {/* Model selector */}
                <ModelSelector onSelectModel={handleSelectModel} />

                {/* Model settings dialog */}
                {selectedModelValue && (
                  <ModelSettingsDialog
                    handleCreateOrUpdateModel={handleCreateOrUpdateModel}
                  />
                )}

                <ExpressPromptsSelector onSelectPrompt={handleSelectPrompt} />

                {/* File attachment modal */}
                <FileAttachmentModal
                  selectedFiles={selectedFiles}
                  documentsAvailable={documentsAvailable}
                />

                <McpServersManager />
              </div>
              <div className="flex justify-end">
                <Button
                  disabled={isSendDisabled}
                  onClick={handleSend}
                  size="icon"
                  className="h-9 w-9 shrink-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    className="h-4 w-4"
                  >
                    <path
                      fill="currentColor"
                      d="m223.87 114.52l-176-104A16 16 0 0 0 24 24v208a16 16 0 0 0 23.87 13.85l176-104a16 16 0 0 0 0-27.33"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);

export const ChatInput = observer(ChatInputComponent);
