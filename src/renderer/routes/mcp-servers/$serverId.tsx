/**
 * MCP Server Configuration Route
 * Route for configuring individual MCP servers
 */

import React from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { observer } from '@legendapp/state/react';
import { FiArrowLeft, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

// UI Components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

// Components
import { MainHeader } from '@/components/MainHeader';

// State
import {
  getServerById,
  updateServer,
  removeServer,
} from '@/features/mcp-servers/state';

export const Route = createFileRoute('/mcp-servers/$serverId')({
  component: observer(McpServerConfigComponent),
});

/**
 * Props for the MCP Server Config component
 */
interface McpServerConfigProps {}

/**
 * MCP Server Config component
 * Handles configuration of individual MCP servers
 */
function McpServerConfigComponent({}: McpServerConfigProps) {
  const { serverId } = Route.useParams();
  const navigate = useNavigate();
  const server = getServerById(serverId);

  const [command, setCommand] = React.useState('');
  const [envVars, setEnvVars] = React.useState<
    Array<{ key: string; value: string }>
  >([]);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Initialize form data when server loads
  React.useEffect(() => {
    if (server) {
      const fullCommand =
        server.command +
        (server.args.length > 0 ? ' ' + server.args.join(' ') : '');
      setCommand(fullCommand);

      const envEntries = Object.entries(server.env || {}).map(
        ([key, value]) => ({ key, value })
      );
      setEnvVars(envEntries.length > 0 ? envEntries : [{ key: '', value: '' }]);
    }
  }, [server]);

  if (!server) {
    return (
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Server not found</h3>
            <p className="text-muted-foreground mb-4">
              The requested server could not be found.
            </p>
            <Link to="/mcp-servers">
              <Button>
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    const parts = command.trim().split(' ');
    const newCommand = parts[0] || '';
    const newArgs = parts.slice(1);

    const newEnv: Record<string, string> = {};
    envVars.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) {
        newEnv[key.trim()] = value.trim();
      }
    });

    updateServer(serverId, {
      command: newCommand,
      args: newArgs,
      env: newEnv,
    });

    setHasChanges(false);
  };

  const handleRemoveServer = () => {
    if (
      confirm(
        'Are you sure you want to remove this server? This action cannot be undone.'
      )
    ) {
      removeServer(serverId);
      navigate({ to: '/mcp-servers' });
    }
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
    setHasChanges(true);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const updateEnvVar = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const updated = [...envVars];
    updated[index][field] = value;
    setEnvVars(updated);
    setHasChanges(true);
  };

  const handleCommandChange = (value: string) => {
    setCommand(value);
    setHasChanges(true);
  };

  return (
    <>
      <MainHeader title={server.displayName || server.name} />
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveServer}
            >
              <FiTrash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                {server.iconUrl && (
                  <img
                    src={server.iconUrl}
                    alt={server.name}
                    className="h-10 w-10 rounded"
                  />
                )}
                <div>
                  <CardTitle>{server.displayName || server.name}</CardTitle>
                  {server.qualifiedName && (
                    <CardDescription>{server.qualifiedName}</CardDescription>
                  )}
                </div>
              </div>
              {server.description && (
                <CardDescription className="mt-3">
                  {server.description}
                </CardDescription>
              )}
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Command Configuration</CardTitle>
              <CardDescription>
                Configure the command and arguments used to start this server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="command">Command</Label>
                <Textarea
                  id="command"
                  value={command}
                  onChange={(e) => handleCommandChange(e.target.value)}
                  placeholder="npx -y @modelcontextprotocol/server-memory"
                  className="font-mono text-sm"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the full command including arguments. The first word
                  will be treated as the command, and the rest as arguments.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>
                Set environment variables for this server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {envVars.map((envVar, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1">
                    <Input
                      placeholder="Variable name"
                      value={envVar.key}
                      onChange={(e) =>
                        updateEnvVar(index, 'key', e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Value"
                      value={envVar.value}
                      onChange={(e) =>
                        updateEnvVar(index, 'value', e.target.value)
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEnvVar(index)}
                    disabled={envVars.length === 1}
                  >
                    <FiX className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addEnvVar}
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Add Variable
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                // Reset form
                const fullCommand =
                  server.command +
                  (server.args.length > 0 ? ' ' + server.args.join(' ') : '');
                setCommand(fullCommand);
                const envEntries = Object.entries(server.env || {}).map(
                  ([key, value]) => ({ key, value })
                );
                setEnvVars(
                  envEntries.length > 0 ? envEntries : [{ key: '', value: '' }]
                );
                setHasChanges(false);
              }}
              disabled={!hasChanges}
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
