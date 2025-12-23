import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Checkbox = ({ className, ...props }) => (
  <CheckboxPrimitive.Root
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-[var(--border)] bg-[var(--surface)] shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg0)] data-[state=checked]:border-[var(--blue)] data-[state=checked]:bg-[var(--blue)]',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-[var(--bg0)]">
      <Check className="h-3 w-3" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);
