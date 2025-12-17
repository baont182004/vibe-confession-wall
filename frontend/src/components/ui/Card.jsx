import { motion } from 'framer-motion';
import clsx from 'clsx';

export const Card = ({ children, className, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={clsx('card', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
