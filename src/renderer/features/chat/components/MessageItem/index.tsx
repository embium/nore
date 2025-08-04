import React, { useCallback } from 'react';

// Types
import type { Message } from '@/types/chat';

// Utils
import { cn } from '@/lib/utils';

// Components
import { MessageContent } from './MessageContent';
import { MessageActions } from './MessageActions';

// Hooks
import { useMessageData } from '../../hooks/useMessageData';

interface MessageItemProps {
  message: Message;
  onEditMessage?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onSelectedText?: (text: string) => void;
  onResendMessage?: (messageId: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onEditMessage,
  onDeleteMessage,
  onSelectedText,
  onResendMessage,
}) => {
  // Use our custom hook to get optimized message data
  const { textContent, messageRoleInfo } = useMessageData(message);
  const { isUserMessage, displayName, roleClass, model } = messageRoleInfo;

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection?.toString()) {
      onSelectedText?.(selection.toString());
    } else {
      onSelectedText?.('');
    }
  }, [onSelectedText]);

  const handleClick = useCallback(() => {
    handleSelection();
  }, [handleSelection]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Handle Space or Enter key press
      if (event.key === 'Enter' || event.key === ' ') {
        handleSelection();
      }
    },
    [handleSelection]
  );

  return (
    <div
      className={cn(
        'message-item group py-3 px-4 hover:bg-accent/40 transition-colors select-text',
        roleClass
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label={`${isUserMessage ? 'User' : 'Assistant'} message`}
    >
      <div className="flex justify-between items-start">
        <div className="message-role font-semibold text-sm text-muted-foreground mb-1">
          {displayName}
          {!isUserMessage && model && (
            <span className="text-xs ml-2 opacity-70">via {model}</span>
          )}
        </div>
      </div>

      <MessageContent message={message} />
      <MessageActions
        messageId={message.id}
        messageContent={textContent}
        isUserMessage={isUserMessage}
        onEditMessage={onEditMessage}
        onDeleteMessage={onDeleteMessage}
        onResendMessage={onResendMessage}
      />
    </div>
  );
};

export default React.memo(MessageItem);
