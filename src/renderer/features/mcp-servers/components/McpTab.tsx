import { observer } from '@legendapp/state/react';
import { Link, useNavigate } from '@tanstack/react-router';
import { mcpServersState$, startServer, stopServer } from '../state';
import { FiServer, FiPlus, FiPlay, FiSquare } from 'react-icons/fi';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

const McpTabHeaderComponent: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate({ to: '/mcp-servers' });
  };

  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="text-xs"
        onClick={handleNavigate}
      >
        <FiPlus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const McpTabHeader = observer(McpTabHeaderComponent);

const McpTabContentComponent = () => {
  const mcpServers = mcpServersState$.serversList.get();

  const handleToggleServer = async (
    serverId: string,
    currentStatus: string
  ) => {
    if (currentStatus === 'running') {
      await stopServer(serverId);
    } else {
      await startServer(serverId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'stopped':
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto min-h-0">
        {mcpServers.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No servers installed
          </div>
        ) : (
          <ul className="space-y-1 px-1 py-2">
            {mcpServers.map((server) => (
              <li
                key={server.id}
                className="group"
              >
                <Link
                  to="/mcp-servers/$serverId"
                  params={{ serverId: server.id }}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  activeProps={{
                    className: 'bg-accent text-accent-foreground',
                  }}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Badge
                      variant="outline"
                      className={`h-2 w-2 rounded-full p-0 ${getStatusColor(server.status)}`}
                    />
                    <span className="truncate">
                      {server.displayName || server.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleServer(server.id, server.status);
                    }}
                  >
                    {server.status === 'running' ? (
                      <FiSquare className="h-3 w-3" />
                    ) : (
                      <FiPlay className="h-3 w-3" />
                    )}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t p-2 mt-auto flex-shrink-0">
        <div className="flex flex-col gap-1">
          <Link
            to="/mcp-servers/registry"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            activeProps={{
              className: 'bg-accent text-accent-foreground',
            }}
          >
            <FiServer className="h-4 w-4" />
            <span>Browse Registry</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const McpTabContent = observer(McpTabContentComponent);
