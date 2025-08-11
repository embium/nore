import type React from 'react';
import { FiServer, FiPlay, FiSquare } from 'react-icons/fi';
import { observer } from '@legendapp/state/react';
import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import CustomDropdown from '@/components/custom-dropdown/CustomDropdown';
import CustomDropdownItem from '@/components/custom-dropdown/CustomDropdownItem';

// Types
import { mcpServersState$ } from '@/features/mcp-servers/state';
import { startServer, stopServer } from '@/features/mcp-servers/state';

const McpServersManagerComponent: React.FC = () => {
  const mcpServers = mcpServersState$.serversList.get();

  const handleToggleServer = async (
    serverId: string,
    currentStatus: string
  ) => {
    try {
      if (currentStatus === 'running') {
        await stopServer(serverId);
      } else {
        await startServer(serverId);
      }
    } catch (error) {
      console.error('Failed to toggle server status:', error);
    }
  };

  return (
    <CustomDropdown
      className="w-auto"
      persistOnItemClick={true}
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="MCP Servers"
        >
          <FiServer className="h-4 w-4" />
        </Button>
      }
      contentClassName="w-[400px] flex flex-col p-2"
    >
      <div className="flex items-center justify-between mb-2 px-2">
        <h3 className="font-medium text-sm">MCP Servers</h3>
        <Link to="/mcp-servers/registry">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <FiServer className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      <div className="overflow-y-auto max-h-[300px] space-y-1">
        {mcpServers.length === 0 ? (
          <div className="text-sm text-muted-foreground p-2 text-center">
            No servers installed
          </div>
        ) : (
          mcpServers.map((server) => {
            // Determine button state based on server status
            const isButtonDisabled = server.status === 'starting';
            const shouldShowStopButton = server.status === 'running';

            return (
              <CustomDropdownItem
                key={server.id}
                className="p-0 w-full"
              >
                <div
                  className="flex w-full items-center justify-between gap-2 p-2 rounded hover:bg-accent"
                  onClick={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyPress={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        server.status === 'running'
                          ? 'bg-green-500'
                          : server.status === 'starting'
                            ? 'bg-yellow-500'
                            : server.status === 'error'
                              ? 'bg-red-500'
                              : server.status === 'idle'
                                ? 'bg-blue-400'
                                : 'bg-gray-400'
                      }`}
                    />
                    <div className="flex-grow truncate text-sm">
                      {server.displayName || server.name}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleToggleServer(server.id, server.status)}
                    disabled={isButtonDisabled}
                  >
                    {shouldShowStopButton ? (
                      <FiSquare className="h-3 w-3" />
                    ) : (
                      <FiPlay className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </CustomDropdownItem>
            );
          })
        )}
      </div>

      <div className="mt-2 pt-2 border-t">
        <Link
          to="/mcp-servers"
          className="w-full"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
          >
            Manage Servers
          </Button>
        </Link>
      </div>
    </CustomDropdown>
  );
};

export const McpServersManager = observer(McpServersManagerComponent);
