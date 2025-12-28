import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../lib/utils';

export const Tabs = TabsPrimitive.Root;

export const TabsList = ({ className, ...props }) => (
  <TabsPrimitive.List
    className={cn(
      'inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface2)] p-1 text-sm shadow-sm',
      className
    )}
    {...props}
  />
);

export const TabsTrigger = ({ className, ...props }) => (
  <TabsPrimitive.Trigger
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--textMuted)] transition-all data-[state=active]:bg-[rgba(222,181,215,0.35)] data-[state=active]:text-text data-[state=active]:shadow-[0_8px_18px_rgba(222,181,215,0.25)]',
      className
    )}
    {...props}
  />
);

export const TabsContent = ({ className, ...props }) => (
  <TabsPrimitive.Content
    className={cn('mt-2 focus-visible:outline-none', className)}
    {...props}
  />
);
