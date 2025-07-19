import React from 'react';
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

export function LeftSidebar() {
  const handleSetChatsTab = () => {};

  const handleSetMcpServersTab = () => {};

  const handleSetModelHubTab = () => {};

  const handleSetPromptsLibraryTab = () => {};

  const handleSetSettingsTab = () => {};
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
                  onClick={handleSetChatsTab}
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
                  onClick={handleSetMcpServersTab}
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
      </div>

      {/* Bottom section with Settings button */}
      <div className="mt-auto mb-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={handleSetModelHubTab}
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
                  onClick={handleSetMcpServersTab}
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

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={handleSetPromptsLibraryTab}
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
                  onClick={handleSetSettingsTab}
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
    </div>
  );
}
