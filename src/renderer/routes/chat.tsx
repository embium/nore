import { createFileRoute, Outlet } from '@tanstack/react-router';
import { observer } from '@legendapp/state/react';

import { Middlebar } from '@/components/Middlebar';
import { ChatTab, ChatTabHeader } from '../features/chat/components/ChatTab';

const ChatLayoutComponent = observer(() => {
  return (
    <>
      <Middlebar
        headerTitle="Chats"
        headerContent={<ChatTabHeader />}
      >
        <ChatTab />
      </Middlebar>

      {/* The MainScreen content renders in the Outlet */}
      <div className="h-full w-full flex flex-col">
        <Outlet />
      </div>
    </>
  );
});

export const Route = createFileRoute('/chat')({
  component: ChatLayoutComponent,
});
