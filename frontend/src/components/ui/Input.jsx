import clsx from 'clsx';

export const Input = ({ className, ...props }) => {
  return (
    <input
      className={clsx('input', className)}
      {...props}
    />
  );
};

export const TextArea = ({ className, ...props }) => {
  return (
    <textarea
      className={clsx('input', 'input--textarea', className)}
      {...props}
    />
  );
};
