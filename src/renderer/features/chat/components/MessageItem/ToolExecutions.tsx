import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Wrench, Clock, AlertCircle } from 'lucide-react';
import { ToolExecution } from '@/types/chat';

interface ToolExecutionsProps {
  toolExecutions: ToolExecution[];
}

export const ToolExecutions: React.FC<ToolExecutionsProps> = ({
  toolExecutions,
}) => {
  const [expandedTools, setExpandedTools] = useState<number[]>([]);

  const toggleTool = (index: number) => {
    setExpandedTools((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const formatDuration = (duration: number) => {
    if (duration < 1000) {
      return `${duration}ms`;
    }
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatJson = (obj: unknown) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  if (!toolExecutions || toolExecutions.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 space-y-2">
      {toolExecutions.map((execution, index) => {
        const isExpanded = expandedTools.includes(index);
        const hasError = !!execution.error;

        return (
          <div
            key={index}
            className={`border rounded-lg ${
              hasError
                ? 'border-destructive/20 bg-destructive/5'
                : 'border-border bg-muted/30'
            }`}
          >
            <button
              onClick={() => toggleTool(index)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">
                  {execution.toolName}
                </span>
                {hasError && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDuration(execution.duration)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(execution.timestamp)}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-3 pb-3 space-y-3 border-t border-border">
                {hasError && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-destructive mb-1">
                      Error
                    </h4>
                    <pre className="text-xs bg-destructive/10 text-destructive p-2 rounded border overflow-x-auto">
                      {execution.error}
                    </pre>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">
                    Parameters
                  </h4>
                  <pre className="text-xs bg-background border rounded p-2 overflow-x-auto text-muted-foreground">
                    {formatJson(execution.parameters)}
                  </pre>
                </div>

                {!hasError && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">
                      Result
                    </h4>
                    <pre className="text-xs bg-background border rounded p-2 overflow-x-auto text-muted-foreground">
                      {formatJson(execution.result)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
