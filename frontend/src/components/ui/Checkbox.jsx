import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Checkbox = ({ className, ...props }) => (
  <CheckboxPrimitive.Root
    className={cn(
      'peer h-5 w-5 shrink-0 rounded-sm border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-plan)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg0)] hover:border-[var(--accent-plan)]/70 active:scale-[0.97] data-[state=checked]:border-[var(--accent-plan)] data-[state=checked]:bg-[var(--accent-plan)] data-[state=checked]:shadow-[0_0_0_2px_rgba(222,181,215,0.4)] data-[state=checked]:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white transition-transform duration-150">
      <Check className="h-3 w-3" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);
