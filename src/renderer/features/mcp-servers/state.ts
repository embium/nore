/**
 * MCP feature state management with Legend State
 */
import { trpcProxyClient } from '@/src/shared/config';
import { observable, computed, batch } from '@legendapp/state';
import { persistObservable } from '@legendapp/state/persist';
import { v4 as uuidv4 } from 'uuid';

export interface Server {
  id: string;
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  status: 'running' | 'idle' | 'stopped';
  qualifiedName?: string;
  displayName?: string;
  description?: string;
  iconUrl?: string;
}

export interface RegistryServer {
  qualifiedName: string;
  displayName: string;
  description: string;
  iconUrl?: string;
  remote: boolean;
  deploymentUrl?: string;
  security?: {
    scanPassed: boolean;
  };
  tools?: any[];
  connections: {
    type: string;
    configSchema?: any;
    exampleConfig?: any;
    published?: boolean;
    stdioFunction?: string;
    deploymentUrl?: string;
  }[];
}

export interface mcpServersState$ {
  serversList: Server[];
  registryServers: RegistryServer[];
  isLoadingRegistry: boolean;
}

// Create the initial state
const initialState: mcpServersState$ = {
  serversList: [],
  registryServers: [],
  isLoadingRegistry: false,
};

// Create the observable state
export const mcpServersState$ = observable<mcpServersState$>(initialState);

// Setup persistence for chat state
persistObservable(mcpServersState$, {
  local: 'mcp-servers',
});

export const serversList = computed(() => mcpServersState$.serversList.get());
export const registryServers = computed(() =>
  mcpServersState$.registryServers.get()
);
export const isLoadingRegistry = computed(() =>
  mcpServersState$.isLoadingRegistry.get()
);

export function initializeServers() {
  const servers = mcpServersState$.serversList.get();
  if (servers.length > 0) {
    return;
  }
  servers.forEach((server) => {
    if (server.status === 'running') {
      startServer(server.id);
    }
  });
}

// Add server
export function addServer(server: Server) {
  mcpServersState$.serversList.push(server);
}

// Update server
export function updateServer(serverId: string, updates: Partial<Server>) {
  const servers = mcpServersState$.serversList.get();
  const serverIndex = servers.findIndex((s) => s.id === serverId);
  if (serverIndex !== -1) {
    Object.assign(servers[serverIndex], updates);
  }
}

// Remove server
export function removeServer(serverId: string) {
  const state = mcpServersState$.get();

  // Remove the chat from the list
  const updatedServers = state.serversList.filter(
    (server) => server.id !== serverId
  );

  mcpServersState$.serversList.set(updatedServers);
}

// Install server from registry
export function installServerFromRegistry(registryServer: RegistryServer) {
  const stdioConnection = registryServer.connections.find(
    (conn) => conn.type === 'stdio'
  );
  if (!stdioConnection || !stdioConnection.stdioFunction) {
    throw new Error('No stdio connection available for this server');
  }

  // Parse the stdioFunction to extract command and args
  const functionBody = stdioConnection.stdioFunction;
  console.log(functionBody);
  const commandMatch = functionBody.match(/command:\s*['"]([^'"]+)['"]/);
  const argsMatch = functionBody.match(/args:\s*\[([^\]]+)\]/);

  const command = commandMatch ? commandMatch[1] : 'npx';
  const argsString = argsMatch ? argsMatch[1] : '';

  // Process args and extract environment variables
  const args: string[] = [];
  let env: Record<string, string> = {};

  // Split by commas but respect backticks for template literals
  const argParts = argsString.split(/,(?=(?:[^`]*`[^`]*`)*[^`]*$)/);

  argParts.forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;

    // Check if it's an environment variable in a template literal
    // Example: `API_KEY="${config.TWENTY_FIRST_API_KEY}"`
    const envVarMatch = trimmed.match(/^`([\w_]+)=\"\${config\.(\w+)}\"`$/);

    if (envVarMatch) {
      // This is an env variable, extract it
      const [_, envName, configKey] = envVarMatch;
      env[envName] = `${configKey}`;
      // We don't add this to args as it's an env variable
    } else if (/^['"`].*['"`]$/.test(trimmed)) {
      // Regular quoted string, remove quotes
      args.push(trimmed.replace(/^['"`]|['"`]$/g, ''));
    } else {
      // Other cases (might be a variable reference)
      args.push(trimmed);
    }
  });

  const newServer: Server = {
    id: uuidv4(),
    name: registryServer.displayName,
    command,
    args,
    env,
    status: 'stopped',
    qualifiedName: registryServer.qualifiedName,
    displayName: registryServer.displayName,
    description: registryServer.description,
    iconUrl: registryServer.iconUrl,
  };

  console.log(newServer);

  addServer(newServer);
  return newServer;
}

// Set registry servers
export function setRegistryServers(servers: RegistryServer[]) {
  mcpServersState$.registryServers.set(servers);
}

// Set loading state
export function setLoadingRegistry(loading: boolean) {
  mcpServersState$.isLoadingRegistry.set(loading);
}

// Get server by ID
export function getServerById(serverId: string) {
  const servers = mcpServersState$.serversList.get();
  return servers.find((server) => server.id === serverId);
}

// Start server
export async function startServer(serverId: string) {
  const servers = mcpServersState$.serversList.get();
  const server = servers.find((server) => server.id === serverId);
  if (!server) {
    return false;
  }

  try {
    const status = await trpcProxyClient.mcp.startServer.mutate({
      id: serverId,
      command: server.command,
      args: server.args,
    });

    server.status = status ? 'running' : 'stopped';
    return status;
  } catch (error) {
    console.error('Failed to start server:', error);
    server.status = 'stopped';
    return false;
  }
}

// Stop server
export async function stopServer(serverId: string) {
  const servers = mcpServersState$.serversList.get();
  const server = servers.find((server) => server.id === serverId);
  if (!server) {
    return false;
  }

  try {
    const status = await trpcProxyClient.mcp.stopServer.mutate({
      id: serverId,
    });
    server.status = 'stopped';
    return status;
  } catch (error) {
    console.error('Failed to stop server:', error);
    return false;
  }
}
