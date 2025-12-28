import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../../lib/utils';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export const PopoverContent = ({ className, align = 'center', sideOffset = 4, ...props }) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_18px_40px_rgba(222,181,215,0.25)] outline-none backdrop-blur',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
);
