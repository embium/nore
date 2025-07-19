import { Outlet, createRoute } from '@tanstack/react-router';
import { Middlebar } from '@/components/Middlebar';
import { Route as rootRoute } from '../__root';
import { AiOutlinePlus } from 'react-icons/ai';

// Define the header content as a variable for clarity
const McpServersHeader = <div>hello</div>;

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat', // Pathless route
  component: () => (
    <>
      <Middlebar
        headerTitle="MCP Servers"
        header={McpServersHeader}
      >
        {/*
          Whatever you place here becomes the 'children' of MiddleSidebar.
          It can be a simple list or a highly complex component like McpServerList.
        */}
        test
      </Middlebar>

      {/* The MainScreen content renders in the Outlet */}
      <div className="h-full flex flex-col">
        <Outlet />
      </div>
    </>
  ),
});
