import React, { useCallback, useState } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import { MdOutlineWidgets } from 'react-icons/md';
import { LuBrain } from 'react-icons/lu';
import { FiBookOpen } from 'react-icons/fi';
import { FiSettings } from 'react-icons/fi';
import iconPng from '@/src/assets/icons/icon.png';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { observer } from '@legendapp/state/react';
import SettingsModal from '../features/settings/components/SettingsModal';
import { PromptsLibraryModal } from '../features/prompts-library/components/PromptsLibraryModal';
import { ModelHubModal } from '../features/model-hub/components/ModelHubModal';
import { addServer, startServer } from '../features/mcp/state';
import { v4 as uuidv4 } from 'uuid';
import { trpcProxyClient } from '@/src/shared/config';
import { useNavigate } from '@tanstack/react-router';
interface LeftSidebarProps {}

export const LeftSidebar: React.FC<LeftSidebarProps> = observer(() => {
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [promptsLibraryModalVisible, setPromptsLibraryModalVisible] =
    useState(false);
  const [modelHubModalVisible, setModelHubModalVisible] = useState(false);
  const navigate = useNavigate();

  const handleChats = () => {
    navigate({ to: '/chat' });
  };

  const handleMcpServers = () => {
    navigate({ to: '/mcp-servers' });
  };

  const handleModelHubModalOpen = () => {
    setModelHubModalVisible(true);
  };

  const handleModelHubModalClose = () => {
    setModelHubModalVisible(false);
  };

  const handlePromptsLibraryModalOpen = () => {
    setPromptsLibraryModalVisible(true);
  };

  const handlePromptsLibraryModalClose = () => {
    setPromptsLibraryModalVisible(false);
  };

  const handleSettingsModalOpen = useCallback(() => {
    setSettingsModalVisible(true);
  }, []);

  const handleSettingsModalClose = useCallback(() => {
    setSettingsModalVisible(false);
  }, []);

  const handleAddServer = async () => {
    /*
    addServer({
      id: 'mcp-knowledge-graph',
      name: 'Knowledge Graph',
      command: 'npx',
      args: ['-y', '@itseasy21/mcp-knowledge-graph'],
      status: 'stopped',
    });
    startServer('mcp-knowledge-graph');
    */
    const tools = await trpcProxyClient.mcp.getTools.query();
    console.log(tools);
  };

  return (
    <div className="flex flex-col h-full border-r transition-all duration-200 ease-in-out w-[60px] items-center">
      <div className="flex flex-col h-[60px] border-b items-center justify-center">
        <img
          src={iconPng}
          alt="Notebit"
          className="h-8 w-8"
        />
      </div>

      {/* Top section with Chats and Notes buttons */}
      <div className="mt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={handleChats}
                >
                  <FiMessageSquare className="scale-125" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
            >
              <p>Chats</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={handleMcpServers}
                >
                  <LuBrain className="scale-125" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
            >
              <p>MCP Servers</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Bottom section with Settings button */}
      <div className="mt-auto mb-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={handleModelHubModalOpen}
                >
                  <MdOutlineWidgets className="scale-125" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
            >
              <p>Model Hub</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={handlePromptsLibraryModalOpen}
                >
                  <FiBookOpen className="scale-125" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
            >
              <p>Prompts Library</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={handleSettingsModalOpen}
                >
                  <FiSettings className="scale-125" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
            >
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {modelHubModalVisible && (
        <ModelHubModal
          visible={modelHubModalVisible}
          onClose={handleModelHubModalClose}
        />
      )}
      {promptsLibraryModalVisible && (
        <PromptsLibraryModal
          visible={promptsLibraryModalVisible}
          onClose={handlePromptsLibraryModalClose}
        />
      )}
      {settingsModalVisible && (
        <SettingsModal
          visible={settingsModalVisible}
          onClose={handleSettingsModalClose}
        />
      )}
    </div>
  );
});
