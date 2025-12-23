import { cn } from '../../lib/utils';

export const ScrollArea = ({ className, children, ...props }) => (
  <div className={cn('overflow-auto', className)} {...props}>
    {children}
  </div>
);
