import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent as OriginalSelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Custom SelectContent that allows content to be placed above the scroll buttons
interface CustomSelectContentProps
  extends React.ComponentProps<typeof SelectPrimitive.Content> {
  searchInput?: React.ReactNode;
}

const CustomSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  CustomSelectContentProps
>(
  (
    { className, children, position = 'popper', searchInput, ...props },
    ref
  ) => {
    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          data-slot="select-content"
          className={cn(
            'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-hidden rounded-md border shadow-md',
            position === 'popper' &&
              'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
            className
          )}
          position={position}
          {...props}
        >
          {/* Search input at the very top, outside the normal flow */}
          {searchInput}

          {/* Standard structure with scroll buttons */}
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              'p-1 overflow-y-auto max-h-[300px]',
              position === 'popper' &&
                'w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1'
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    );
  }
);

CustomSelectContent.displayName = 'CustomSelectContent';

export { CustomSelectContent };
