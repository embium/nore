import { Icon } from '../components/index';
import t from '@/shared/config';
import { createLazyFileRoute } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { useCallback, useEffect } from 'react';
import { Client } from '../lib/smithery/client';

export const Route = createLazyFileRoute('/')({
  component: Index,
});

function Index() {
  const { mutate: startServer } = t.mcp.startServer.useMutation();

  useEffect(() => {
    startServer();
  }, []);

  const getServers = useCallback(async () => {
    const client = new Client();
    const servers = await client.getServer('@itseasy21/mcp-knowledge-graph');
    console.log(servers);
  }, []);

  const { mutate: executeTool } = t.mcp.executeTool.useMutation({
    onSuccess: (data: string) => {
      console.log(data);
    },
  });

  return (
    <>
      <Button
        onClick={() =>
          executeTool({
            serverId: 'knowledge-graph',
            toolName: 'create_entities',
            inputs: JSON.stringify({
              entities: ['test', 'test2'],
            }),
          })
        }
        className="w-full p-6 cursor-pointer"
      >
        Execute Tool
      </Button>
      <Button
        onClick={() => getServers()}
        className="w-full p-6 cursor-pointer"
      >
        Get Servers
      </Button>
    </>
  );
}
