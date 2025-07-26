import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BrainIcon, Loader2 } from 'lucide-react';
import { observer } from '@legendapp/state/react';

// Types
import { Message } from '../../types';

// Components
import MarkdownRenderer from '@/components/markdown';

// Hooks
import { useMessageData } from '../../hooks/useMessageData';

interface MessageContentProps {
  message: Message;
  isExpanded?: boolean;
}

const MessageContentComponent: React.FC<MessageContentProps> = ({
  message,
  isExpanded = true,
}) => {
  // Use our custom hook to get optimized message data
  const { textContent, reasoningSections, messageRoleInfo } =
    useMessageData(message);
  const { roleClass } = messageRoleInfo;
  const [expandedReasonings, setExpandedReasonings] = useState<number[]>([]);

  // Toggle reasoning section visibility
  const toggleReasoning = (index: number) => {
    setExpandedReasonings((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Function to render content with reasoning toggles
  const renderContentWithReasoning = () => {
    if (reasoningSections.length === 0) {
      return <MarkdownRenderer content={textContent} />;
    }

    // Split by reasoning markers and render each part
    const parts = textContent.split(/(__REASONING_\d+__)/);

    return (
      <>
        {parts.map((part: string, index: number) => {
          // Check if this part is a reasoning marker
          const reasoningMatch = part.match(/__REASONING_(\d+)__/);

          if (reasoningMatch) {
            const reasoningIndex = parseInt(reasoningMatch[1], 10);
            const reasoningData = reasoningSections[reasoningIndex];
            const isExpanded = expandedReasonings.includes(reasoningIndex);

            return (
              <div
                key={`reasoning-${reasoningIndex}`}
                className="my-2"
              >
                <button
                  onClick={() => toggleReasoning(reasoningIndex)}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 rounded px-2 py-1 transition-colors"
                >
                  <BrainIcon className="h-3.5 w-3.5" />
                  Reasoning
                  {!reasoningData.isComplete && (
                    <Loader2 className="h-3 w-3 animate-spin ml-1" />
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3 ml-auto" />
                  ) : (
                    <ChevronDown className="h-3 w-3 ml-auto" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-1 pl-2 border-l-2 border-primary/20 text-muted-foreground">
                    <MarkdownRenderer content={reasoningData.content} />
                    {!reasoningData.isComplete && (
                      <div className="text-xs text-muted-foreground mt-1 flex items-center">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Thinking...
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }

          // Regular content
          return part ? (
            <MarkdownRenderer
              key={index}
              content={part}
            />
          ) : null;
        })}
      </>
    );
  };

  if (!isExpanded) {
    return null;
  }

  return (
    <div data-message-id={message.id}>
      <div className={`message-content ${roleClass}`}>
        {renderContentWithReasoning()}
      </div>
    </div>
  );
};

export const MessageContent = observer(MessageContentComponent);
