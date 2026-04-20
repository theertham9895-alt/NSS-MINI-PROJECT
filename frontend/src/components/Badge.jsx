import React from 'react';

function Badge({ children, variant = 'primary', className = '' }) {
  let classes = 'badge';
  
  if (variant === 'primary') classes += ' badge-primary';
  if (variant === 'accent') classes += ' badge-accent';
  if (variant === 'warning') classes += ' badge-warning';
  if (variant === 'error') classes += ' badge-error';
  if (variant === 'outline') classes += ' badge-outline';
  
  if (className) classes += ' ' + className;

  return <span className={classes}>{children}</span>;
}

export default Badge;