import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const Card = ({ children, className, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'card rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
