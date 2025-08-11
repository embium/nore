import React, { useCallback, useMemo, useState } from 'react';
import { observer } from '@legendapp/state/react';
import { toast } from 'sonner';

// Components
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

// Utils
import { extractTextContent } from '@/features/chat/utils/messageUtils';

// Types
import { Message } from '@/types/chat';

interface MessageContextMenuProps {
  isUser: boolean;
  message: Message;
  children: React.ReactNode;
  selectedText: string;
  onEditMessage?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

/**
 * Context menu for message items providing actions like saving to notes and editing
 */
const MessageContextMenuComponent: React.FC<MessageContextMenuProps> = ({
  isUser,
  message,
  children,
  selectedText,
  onEditMessage,
  onDeleteMessage,
}) => {
  // Extract text content for actions
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const textContent = extractTextContent(message);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(textContent).catch((error) => {
      console.error('Error copying message:', error);
      toast.error('Failed to copy message');
    });
  }, [textContent]);

  const handleCopySelection = useCallback(() => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText).catch((error) => {
        console.error('Error copying selection:', error);
        toast.error('Failed to copy selection');
      });
    }
  }, [selectedText]);

  return (
    <ContextMenu onOpenChange={setIsContextMenuOpen}>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleCopy}>Copy message</ContextMenuItem>

        {selectedText && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleCopySelection}>
              Copy selection
            </ContextMenuItem>
          </>
        )}

        <ContextMenuSeparator />

        {isUser && (
          <ContextMenuItem onClick={(e) => onEditMessage?.(message.id)}>
            Edit message
          </ContextMenuItem>
        )}

        <ContextMenuItem
          onClick={(e) => onDeleteMessage?.(message.id)}
          className="text-red-500"
        >
          Delete message
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export const MessageContextMenu = observer(MessageContextMenuComponent);
