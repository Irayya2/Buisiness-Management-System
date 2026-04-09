import React from 'react';

const cx = (...parts) => parts.filter(Boolean).join(' ');

export const Skeleton = ({ className, style, ...props }) => {
  return <div className={cx('skeleton', className)} style={style} {...props} />;
};

