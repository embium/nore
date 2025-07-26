/**
 * MCP Servers Index Route
 * Route for adding custom MCP servers
 */

import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { observer } from '@legendapp/state/react';
import { FiServer, FiPlus, FiX } from 'react-icons/fi';

// State
import { addServer } from '@/features/mcp-servers/state';

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

// Components
import { MainHeader } from '@/components/MainHeader';

function AddCustomServerComponent() {
  const navigate = useNavigate();
  const [serverName, setServerName] = useState('');
  const [serverDisplayName, setServerDisplayName] = useState('');
  const [serverCommand, setServerCommand] = useState('');
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>(
    [{ key: '', value: '' }]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const updateEnvVar = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const updated = [...envVars];
    updated[index][field] = value;
    setEnvVars(updated);
  };

  const handleAddServer = async () => {
    if (!serverName || !serverCommand) return;

    setIsSubmitting(true);

    try {
      // Parse command and args
      const commandParts = serverCommand.trim().split(' ');
      const command = commandParts[0];
      const args = commandParts.slice(1);

      // Process environment variables
      const env: Record<string, string> = {};
      envVars.forEach(({ key, value }) => {
        if (key.trim() && value.trim()) {
          env[key.trim()] = value.trim();
        }
      });

      // Add the server
      await addServer({
        id: serverName.toLowerCase().replace(/\s+/g, '-'),
        name: serverName,
        displayName: serverDisplayName || serverName,
        command,
        args,
        status: 'stopped',
        env,
      });

      // Navigate back to servers list
      navigate({ to: '/mcp-servers' });
    } catch (error) {
      console.error('Failed to add server:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <MainHeader title="Add Custom MCP Server" />
      <div className="flex-1 overflow-auto p-6">
        <div className=" mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FiServer className="h-5 w-5" />
                <CardTitle>Add Custom MCP Server</CardTitle>
              </div>
              <CardDescription>
                Add a custom MCP server by providing the server details below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="server-name">Server ID</Label>
                <Input
                  id="server-name"
                  placeholder="e.g., my-custom-server"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  A unique identifier for this server. Used internally and for
                  API calls.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="server-display-name">
                  Display Name (Optional)
                </Label>
                <Input
                  id="server-display-name"
                  placeholder="e.g., My Custom Server"
                  value={serverDisplayName}
                  onChange={(e) => setServerDisplayName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  A friendly name to display in the UI. If not provided, the
                  server ID will be used.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="server-command">Command</Label>
                <Input
                  id="server-command"
                  placeholder="e.g., python -m my_mcp_server"
                  value={serverCommand}
                  onChange={(e) => setServerCommand(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The command to run the server. Include any arguments separated
                  by spaces.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Environment Variables</Label>
                  <div className="mt-2 space-y-2">
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
                      type="button"
                    >
                      <FiPlus className="mr-2 h-4 w-4" />
                      Add Variable
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set environment variables for this server
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleAddServer}
                    disabled={!serverName || !serverCommand || isSubmitting}
                    className="w-full"
                  >
                    <FiPlus className="mr-2 h-4 w-4" />
                    Add Server
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute('/mcp-servers/')({
  component: observer(AddCustomServerComponent),
});
