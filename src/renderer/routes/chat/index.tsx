/**
 * Chat ID Route
 * Route for specific chat conversations - displays messages and handles chat interaction
 */

import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { observer } from '@legendapp/state/react';

import { ChatScreen } from '../../features/chat/screens/ChatScreen';
import { MainHeader } from '../../components/MainHeader';
import { currentChat } from '../../features/chat/state';

export const Route = createFileRoute('/chat/')({
  component: observer(ChatComponent),
});

/**
 * Props for the Chat component
 */
interface ChatProps {}

/**
 * Chat component
 * Handles specific chat conversations by chatId
 */
function ChatComponent({}: ChatProps) {
  const currentChatValue = currentChat.get();
  const title = currentChatValue?.title || 'New Chat';
  //const activeChat = useObservable<Chat | null>(currentChatValue);

  return (
    <>
      <MainHeader title={title} />
      <ChatScreen />
    </>
  );
}
