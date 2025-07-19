import React, { useEffect, useRef, useCallback, useState } from 'react';
import { GoSidebarExpand } from 'react-icons/go';
import { observer, useSelector } from '@legendapp/state/react';

import { layoutState$ } from '@/app/state/layout';

interface MiddlebarProps {
  headerTitle: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

export const Middlebar: React.FC<MiddlebarProps> = observer(
  ({ headerTitle, header, children }) => {
    // Use Legend State for sidebar width
    const isMiddlebarCollapsed = useSelector(layoutState$.middlebarCollapsed);
    const middlebarWidth = useSelector(layoutState$.middlebarWidth);
    const isResizing = useRef(false);
    const [isAnimating, setIsAnimating] = useState(true);
    const sidebarRef = useRef<HTMLDivElement>(null);
    // Enable animations when component mounts
    useEffect(() => {
      setIsAnimating(true);

      // Update the container to match the sidebar width initially
      const sidebarElement = document.querySelector(
        '.border-r.bg-card.relative'
      ) as HTMLElement;
      const resizingContainer = sidebarElement?.closest(
        '.resizing-container'
      ) as HTMLElement;

      if (sidebarElement && resizingContainer) {
        resizingContainer.style.width = isMiddlebarCollapsed
          ? '0'
          : `${middlebarWidth}px`;
      }

      return () => {
        setIsAnimating(false);

        // Clean up any residual resize events
        if (isResizing.current) {
          isResizing.current = false;
          document.body.style.cursor = '';
        }
      };
    }, [middlebarWidth]);

    // Mouse event handlers for resizing
    const handleMouseDown = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        // Prevent text selection during resize
        e.preventDefault();

        isResizing.current = true;
        document.body.style.cursor = 'ew-resize';
        const startX = e.clientX;
        const startWidth = middlebarWidth;

        // Disable animations during resize for better performance
        setIsAnimating(false);

        // Use a reference for the current width to avoid stale values
        const currentWidth = { value: startWidth };

        // Get the sidebar element and parent container
        const sidebarElement = e.currentTarget.parentElement;
        const resizingContainer = sidebarElement?.closest(
          '.resizing-container'
        ) as HTMLElement;

        // Use RAF for smoother animation
        let rafId: number | null = null;

        // Create a more efficient move handler
        const onMouseMove = (moveEvent: MouseEvent) => {
          if (!isResizing.current) return;

          // Cancel any pending animation frame
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
          }

          // Schedule update on next animation frame for better performance
          rafId = requestAnimationFrame(() => {
            const delta = moveEvent.clientX - startX;
            const newWidth = Math.max(180, Math.min(startWidth + delta, 1200));

            // Only update DOM if the width has changed significantly
            if (Math.abs(newWidth - currentWidth.value) >= 1) {
              currentWidth.value = newWidth;

              // Update both the container and sidebar
              if (sidebarElement) {
                sidebarElement.style.width = `${newWidth}px`;
                sidebarElement.style.minWidth = `${newWidth}px`;
              }

              // Update parent container width
              if (resizingContainer && !isMiddlebarCollapsed) {
                resizingContainer.style.width = `${newWidth}px`;
              }
            }
          });
        };

        const onMouseUp = () => {
          isResizing.current = false;
          document.body.style.cursor = '';
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);

          // Cancel any pending animation frame
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
          }

          // Update the state after resize is complete
          layoutState$.middlebarWidth.set(currentWidth.value);

          // Re-enable animations after resize completes
          setTimeout(() => setIsAnimating(true), 100);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      },
      [middlebarWidth]
    );

    return (
      <div
        className="transition-all duration-300 ease-in-out flex-shrink-0 h-full resizing-container"
        style={{
          width: isMiddlebarCollapsed ? '0' : `${middlebarWidth}px`,
          opacity: isMiddlebarCollapsed ? 0 : 1,
          overflow: 'visible',
        }}
      >
        <div
          className="h-full"
          style={{
            width: `${middlebarWidth}px`,
            minWidth: `${middlebarWidth}px`,
            visibility: isMiddlebarCollapsed ? 'hidden' : 'visible',
            height: '100%',
            minHeight: '100%',
            transition: 'none', // Disable transition for direct DOM manipulation
          }}
        >
          <div
            className="flex flex-col h-full overflow-hidden border-r bg-card relative"
            ref={sidebarRef}
            style={{
              transition: isAnimating ? 'all 300ms ease-in-out' : 'none',
              width: `${middlebarWidth}px`,
              minWidth: `${middlebarWidth}px`,
            }}
          >
            <div className="h-[60px] flex items-center justify-between px-3 border-b">
              <div className="flex items-center">
                <button
                  onClick={() =>
                    layoutState$.middlebarCollapsed.set(!isMiddlebarCollapsed)
                  }
                  className="mr-2 b-0 bg-transparent border-none shadow-none hover:bg-accent"
                >
                  <GoSidebarExpand
                    size={20}
                    className="text-lg"
                  />
                </button>
                <span className="flex-1 font-medium text-lg">
                  {headerTitle}
                </span>
              </div>
              {header}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-visible pr-3 h-full min-h-0">
              {/* Render the appropriate content component */}
              <div className="h-full flex flex-col">{children}</div>
            </div>
            {/* Draggable resizer */}
            <div
              onMouseDown={handleMouseDown}
              className="absolute top-0 right-0 h-full w-3 cursor-ew-resize z-10 bg-transparent hover:bg-accent/40 transition-colors"
              style={{ userSelect: 'none' }}
              aria-label="Resize sidebar"
              role="separator"
            />
          </div>
        </div>
      </div>
    );
  }
);
