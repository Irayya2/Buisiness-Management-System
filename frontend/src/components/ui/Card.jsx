import React from 'react';

const cx = (...parts) => parts.filter(Boolean).join(' ');

export const Card = ({ className, children, ...props }) => {
  return (
    <div className={cx('card', className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => {
  return (
    <div className={cx('card-header', className)} {...props}>
      {children}
    </div>
  );
};

export const CardBody = ({ className, children, ...props }) => {
  return (
    <div className={cx('card-body', className)} {...props}>
      {children}
    </div>
  );
};

