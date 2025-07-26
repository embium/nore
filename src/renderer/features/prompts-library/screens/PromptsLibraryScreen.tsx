import React from 'react';
import { observer } from '@legendapp/state/react';

// Types
import { Prompt } from '@/types/promptsLibrary';

// Hooks
import { usePromptDetail } from '../hooks';

// Components
import {
  PromptHeader,
  PromptContent,
  DeletePromptDialog,
  EmptyPromptState,
} from '../components/PromptDetail';

interface PromptsLibraryScreenProps {
  promptId: string | null;
  onEditPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (promptId: string) => void;
}

/**
 * PromptsLibraryScreen displays the details of a selected prompt
 */
const PromptsLibraryScreenComponent: React.FC<PromptsLibraryScreenProps> = ({
  promptId,
  onEditPrompt,
  onDeletePrompt,
}) => {
  const {
    prompt,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleCopyPrompt,
    handleDeleteRequest,
    handleConfirmDelete,
  } = usePromptDetail({ promptId, onDeletePrompt });

  // If no prompt is selected, display empty state
  if (!prompt) {
    return <EmptyPromptState />;
  }

  return (
    <>
      <div className="flex flex-col h-full overflow-auto">
        <PromptHeader
          prompt={prompt}
          onCopyPrompt={handleCopyPrompt}
          onEditPrompt={onEditPrompt}
          onDeleteRequest={handleDeleteRequest}
        />

        <PromptContent prompt={prompt} />
      </div>

      <DeletePromptDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        promptName={prompt.name}
      />
    </>
  );
};

export const PromptsLibraryScreen = observer(PromptsLibraryScreenComponent);
