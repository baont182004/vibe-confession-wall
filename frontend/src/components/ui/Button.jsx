import clsx from 'clsx';

export const Button = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const mappedVariant = variant === 'danger' ? 'destructive' : variant;

  return (
    <button
      className={clsx('btn', `btn--${mappedVariant}`, `btn--${size}`, className)}
      {...props}
    >
      {children}
    </button>
  );
};
