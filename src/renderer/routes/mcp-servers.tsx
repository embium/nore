import { createFileRoute, Outlet } from '@tanstack/react-router';
import { observer } from '@legendapp/state/react';

// UI Components
import { Middlebar } from '@/components/Middlebar';

// Components
import {
  McpTabContent,
  McpTabHeader,
} from '@/features/mcp-servers/components/McpTab';

const ChatLayoutComponent = observer(() => {
  return (
    <>
      <Middlebar
        headerTitle="MCP Servers"
        headerContent={<McpTabHeader />}
      >
        <McpTabContent />
      </Middlebar>

      {/* The MainScreen content renders in the Outlet */}
      <div className="h-full w-full flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </>
  );
});

export const Route = createFileRoute('/mcp-servers')({
  component: ChatLayoutComponent,
});
