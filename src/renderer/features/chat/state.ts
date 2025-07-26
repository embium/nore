/**
 * Chats feature state management with Legend State
 */
import { observable, computed, batch } from '@legendapp/state';
import { persistObservable } from '@legendapp/state/persist';
import { v4 as uuidv4 } from 'uuid';

// Types
import { Message } from '@/types/chat';

interface FileWithPreview {
  file: File;
  preview: string;
  selected: boolean;
  id: string;
}

// Types for the chats state
export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  files?: FileWithPreview[];
  createdAt: number;
  updatedAt: number;
}

export interface chatState$ {
  chatsList: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  shouldGenerateResponse: boolean;
  focusInputTrigger: boolean;
}

// Create the initial state
const initialState: chatState$ = {
  chatsList: [],
  currentChatId: null,
  isLoading: false,
  shouldGenerateResponse: false,
  focusInputTrigger: false,
};

// Create the observable state
export const chatState$ = observable<chatState$>(initialState);

// Setup persistence for chat state
persistObservable(chatState$, {
  local: 'chats',
});

// Computed values for common selections
export const currentChatId = computed(() => {
  return chatState$.currentChatId.get();
});

export const chatsList = computed(() => chatState$.chatsList.get());

export const currentChat = computed(() => {
  const id = chatState$.currentChatId.get();
  if (!id) return null;

  return chatState$.chatsList.get().find((chat) => chat.id === id) || null;
});

export const currentChatMessages = computed(() => {
  const chat = currentChat.get();
  return chat?.messages || [];
});

// Flag to track if initialization has been completed
let hasInitialized = false;

/**
 * Initialize the chats state
 * This ensures we always have at least one chat available and proper state setup
 */
export const initializeChats = () => {
  console.log('Initializing chats state...');
  const chatsList = chatState$.chatsList.get();
  const currentChatId = chatState$.currentChatId.get();

  // Create a default chat if none exist
  if (chatsList.length === 0) {
    console.log('No chats found, creating default chat');
    createChat();
    hasInitialized = true;
    return;
  }

  // Check if we have a valid current chat ID
  if (!currentChatId || !chatsList.find((chat) => chat.id === currentChatId)) {
    console.log('Current chat ID is invalid, setting to first available chat');
    chatState$.currentChatId.set(chatsList[0].id);
  }

  // Ensure all chats have the required fields (in case of schema changes)
  const updatedChats = chatsList.map((chat) => {
    // Ensure all required properties exist with defaults if missing
    return {
      ...chat,
      createdAt: chat.createdAt || Date.now(),
      updatedAt: chat.updatedAt || Date.now(),
    };
  });

  // Only update if there were changes to avoid unnecessary renders
  if (JSON.stringify(chatsList) !== JSON.stringify(updatedChats)) {
    console.log('Updating chats with missing fields');
    chatState$.chatsList.set(updatedChats);
  }
  hasInitialized = true;
};

/**
 * Check if chats have been properly initialized
 */
export const isChatsInitialized = () => {
  return hasInitialized && chatState$.chatsList.get().length > 0;
};

// Chat actions
export function createChat(title?: string) {
  const chatId = uuidv4();
  const now = Date.now();

  // Create a default title if none provided
  const chatTitle = title || `New Conversation`;

  // Create the new chat
  const newChat: Chat = {
    id: chatId,
    title: chatTitle,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  // Add the new chat to the list and set as current
  batch(() => {
    chatState$.chatsList.push(newChat);
    chatState$.currentChatId.set(chatId);
  });
  return newChat;
}

export function openChat(chatId: string) {
  chatState$.currentChatId.set(chatId);
  const result =
    chatState$.chatsList.get().find((chat) => chat.id === chatId) || null;
  return result;
}

export function addMessage(message: Message) {
  const currentChatId = chatState$.currentChatId.get();

  // Ensure there IS a current chat selected before adding a message
  if (!currentChatId) {
    return;
  }

  const chatsList = chatState$.chatsList.get();
  const chatIndex = chatsList.findIndex((chat) => chat.id === currentChatId);

  // Handle case where currentChatId might be invalid (e.g., deleted just before)
  if (chatIndex === -1) {
    return;
  }

  // Create a new updated chatsList
  const updatedChats = [...chatsList];
  updatedChats[chatIndex] = {
    ...updatedChats[chatIndex],
    messages: [...updatedChats[chatIndex].messages, message],
    updatedAt: Date.now(),
  };

  // Move updated chat to the top (optional UX improvement)
  const updatedChat = updatedChats.splice(chatIndex, 1)[0];
  updatedChats.unshift(updatedChat);

  // Update state
  chatState$.chatsList.set(updatedChats);

  return message;
}

// Cache for message content to prevent duplicate updates
const messageContentCache = new Map<string, string>();

export function updateMessage(params: {
  messageId: string;
  content: string;
  usedSmartHubs: string[];
}) {
  const { messageId, content, usedSmartHubs } = params;

  // Skip update if content hasn't changed
  if (messageContentCache.get(messageId) === content) {
    return;
  }

  const currentChatId = chatState$.currentChatId.get();

  if (!currentChatId) {
    return;
  }

  const chatsList = chatState$.chatsList.get();
  const chatIndex = chatsList.findIndex((chat) => chat.id === currentChatId);

  if (chatIndex === -1) {
    return;
  }

  const chat = chatsList[chatIndex];
  const messageIndex = chat.messages.findIndex((msg) => msg.id === messageId);

  if (messageIndex === -1) {
    return;
  }

  // Update the cache with new content
  messageContentCache.set(messageId, content);

  // Use batching to group state updates
  batch(() => {
    // Create a new updated chatsList - this is more efficient than updating nested objects
    const updatedMessages = [...chat.messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      contentParts: [{ type: 'text', text: content }],
      usedSmartHubs,
    };

    const updatedChats = [...chatsList];
    updatedChats[chatIndex] = {
      ...updatedChats[chatIndex],
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    // Single update to reduce cascading renders
    chatState$.chatsList.set(updatedChats);
  });
}

export function deleteMessage(messageId: string) {
  const currentChatId = chatState$.currentChatId.get();

  if (!currentChatId) {
    return;
  }

  const chatsList = chatState$.chatsList.get();
  const chatIndex = chatsList.findIndex((chat) => chat.id === currentChatId);

  if (chatIndex === -1) {
    return;
  }

  const chat = chatsList[chatIndex];
  const updatedMessages = chat.messages.filter((msg) => msg.id !== messageId);

  // Clean up cache if the message is deleted
  if (messageContentCache.has(messageId)) {
    messageContentCache.delete(messageId);
  }

  const updatedChats = [...chatsList];
  updatedChats[chatIndex] = {
    ...updatedChats[chatIndex],
    messages: updatedMessages,
    updatedAt: Date.now(),
  };

  chatState$.chatsList.set(updatedChats);
}

export function updateChatTitle(params: { chatId: string; newTitle: string }) {
  const { chatId, newTitle } = params;

  const chatsList = chatState$.chatsList.get();
  const chatIndex = chatsList.findIndex((chat) => chat.id === chatId);

  if (chatIndex === -1) {
    return;
  }

  const updatedChats = [...chatsList];
  updatedChats[chatIndex] = {
    ...updatedChats[chatIndex],
    title: newTitle,
    updatedAt: Date.now(),
  };

  chatState$.chatsList.set(updatedChats);
}

export function deleteChat(chatId: string) {
  const state = chatState$.get();

  // Remove the chat from the list
  const updatedChats = state.chatsList.filter((chat) => chat.id !== chatId);

  // Clean up cache for all messages in the deleted chat
  const chatToDelete = state.chatsList.find((chat) => chat.id === chatId);
  if (chatToDelete) {
    chatToDelete.messages.forEach((msg) => {
      if (messageContentCache.has(msg.id)) {
        messageContentCache.delete(msg.id);
      }
    });
  }

  batch(() => {
    // Update state
    chatState$.chatsList.set(updatedChats);

    // If we deleted the current chat, switch to the first available chat
    if (state.currentChatId === chatId) {
      chatState$.currentChatId.set(updatedChats[0]?.id || null);
    }
  });
}

export function clearChat(chatId: string) {
  const chatsList = chatState$.chatsList.get();
  const chatIndex = chatsList.findIndex((chat) => chat.id === chatId);

  if (chatIndex === -1) {
    return;
  }

  // Clean up cache for all messages in the chat
  const chatToClear = chatsList[chatIndex];
  chatToClear.messages.forEach((msg) => {
    if (messageContentCache.has(msg.id)) {
      messageContentCache.delete(msg.id);
    }
  });

  const updatedChats = [...chatsList];
  updatedChats[chatIndex] = {
    ...updatedChats[chatIndex],
    messages: [],
    updatedAt: Date.now(),
  };

  chatState$.chatsList.set(updatedChats);
}

export function addFilesToChat(params: {
  chatId: string;
  files: FileWithPreview[];
}) {
  const { chatId, files } = params;
  const chatsList = chatState$.chatsList.get();

  const chatIndex = chatsList.findIndex((chat) => chat.id === chatId);

  if (chatIndex !== -1) {
    const updatedChats = [...chatsList];
    updatedChats[chatIndex] = {
      ...updatedChats[chatIndex],
      files: files,
    };

    chatState$.chatsList.set(updatedChats);
  }

  return null;
}

export function updateFilesInChat(params: {
  chatId: string;
  files: FileWithPreview[];
}) {
  const { chatId, files } = params;
  const chatsList = chatState$.chatsList.get();
  const chatIndex = chatsList.findIndex((chat) => chat.id === chatId);

  if (chatIndex !== -1) {
    const updatedChats = [...chatsList];
    updatedChats[chatIndex] = {
      ...updatedChats[chatIndex],
      files: files,
    };

    chatState$.chatsList.set(updatedChats);
  }

  return null;
}

export function getFilesFromChat(chatId: string) {
  const chatsList = chatState$.chatsList.get();
  const chatIndex = chatsList.findIndex((chat) => chat.id === chatId);

  const result = chatsList[chatIndex]?.files || [];
  return result;
}

// Helper to set shouldGenerateResponse flag
export function setShouldGenerateResponse(value: boolean) {
  chatState$.shouldGenerateResponse.set(value);
}
