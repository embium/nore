/**
 * MCP Servers Registry Route
 * Route for browsing and installing MCP servers from the Smithery registry
 */

import { useState, useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { observer } from '@legendapp/state/react';
import {
  FiDownload,
  FiExternalLink,
  FiSearch,
  FiServer,
  FiX,
} from 'react-icons/fi';

// Components
import { MainHeader } from '@/components/MainHeader';

// State
import {
  installServerFromRegistry,
  setLoadingRegistry,
} from '@/features/mcp-servers/state';

import type { RegistryServer } from '@/features/mcp-servers/state';

// Utils
import { Client } from '@/lib/smithery/client';

// UI Components
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { trpcProxyClient } from '@/src/shared/config';

export const Route = createFileRoute('/mcp-servers/registry')({
  component: observer(McpServersRegistryComponent),
});

/**
 * MCP Servers Registry component
 * Handles browsing and installing servers from the Smithery registry
 */
function McpServersRegistryComponent() {
  const [registryServers, setRegistryServers] = useState<RegistryServer[]>([]);
  const [filteredServers, setFilteredServers] = useState<RegistryServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServer, setSelectedServer] = useState<RegistryServer | null>(
    null
  );
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const loadRegistryServers = async () => {
      setIsLoading(true);
      setLoadingRegistry(true);
      try {
        const client = new Client();
        const serversResponse = await client.getServers();
        const servers = serversResponse.servers || [];
        setRegistryServers(servers);
        setFilteredServers(servers);
      } catch (error) {
        console.error('Failed to fetch registry servers:', error);
      } finally {
        setIsLoading(false);
        setLoadingRegistry(false);
      }
    };

    loadRegistryServers();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim() === '') {
        setFilteredServers(registryServers);
        return;
      }

      setIsLoading(true);
      try {
        const client = new Client();
        const serversResponse = await client.getServers({
          searchQuery: searchQuery,
        });
        const servers = serversResponse.servers || [];
        setFilteredServers(servers);
      } catch (error) {
        console.error('Failed to search registry servers:', error);
        // Fallback to local filtering if search fails
        const query = searchQuery.toLowerCase();
        const filtered = registryServers.filter(
          (server) =>
            server.qualifiedName.toLowerCase().includes(query) ||
            server.description?.toLowerCase().includes(query)
        );
        setFilteredServers(filtered);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, registryServers]);

  const handleServerClick = (
    event: React.MouseEvent,
    server: RegistryServer
  ) => {
    // If the click was on the install button, don't open external link
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    trpcProxyClient.mcp.openLink.query({ url: server.homepage });
  };

  const handleInstallClick = async (server: RegistryServer) => {
    setSelectedServer(server);

    try {
      // Fetch detailed server info
      const client = new Client();
      const details = await client.getServer(server.qualifiedName);

      // Check if the server has a stdio connection type
      const hasStdioConnection = details.connections?.some(
        (connection: { type: string }) => connection.type === 'stdio'
      );

      if (!hasStdioConnection) {
        // Show an error toast or alert
        toast(
          `${details.displayName || details.name} cannot be installed because it doesn't support stdio connections.`
        );
        return;
      }

      setSelectedServer({ ...details });
      setInstallDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch server details:', error);
      toast('Failed to fetch server details.');
    }
  };

  const handleInstallConfirm = async () => {
    if (!selectedServer) return;

    setIsInstalling(true);
    try {
      installServerFromRegistry(selectedServer);
      setInstallDialogOpen(false);
    } catch (error) {
      console.error('Failed to install server:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <>
      <MainHeader title="MCP Servers Registry" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Smithery Registry
            </h2>
            <p className="text-muted-foreground">
              Browse and install MCP servers from the Smithery registry
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search servers..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">
                Loading registry servers...
              </p>
            </div>
          </div>
        ) : filteredServers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <FiServer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No servers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? 'Try a different search term'
                  : 'No servers available in the registry'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredServers.map((server) => (
              <Card
                key={server.displayName}
                className="relative cursor-pointer hover:shadow-md transition-shadow"
                onClick={(e) => handleServerClick(e, server)}
              >
                <CardHeader>
                  <div className="flex items-stavrt justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {server.displayName}
                          <FiExternalLink className="h-3 w-3 text-muted-foreground" />
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                  {server.description && (
                    <CardDescription className="mt-2">
                      {server.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInstallClick(server);
                    }}
                  >
                    <FiDownload className="mr-2 h-4 w-4" />
                    Install
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={installDialogOpen}
        onOpenChange={setInstallDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install MCP Server</DialogTitle>
            <DialogDescription>
              Are you sure you want to install {selectedServer?.displayName}?
            </DialogDescription>
          </DialogHeader>

          {selectedServer && (
            <div className="py-4">
              <div className="space-y-3">
                {selectedServer.description && (
                  <p className="text-sm">{selectedServer.description}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInstallDialogOpen(false)}
              disabled={isInstalling}
            >
              <FiX className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleInstallConfirm}
              disabled={isInstalling}
            >
              {isInstalling ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full mr-2" />
                  Installing...
                </>
              ) : (
                <>
                  <FiDownload className="mr-2 h-4 w-4" />
                  Install
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
