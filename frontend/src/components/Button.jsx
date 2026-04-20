import React from 'react';

function Button({ 
  children, 
  variant = 'primary', 
  size = 'default',
  fullWidth = false,
  onClick,
  type = 'button',
  disabled = false,
  className = ''
}) {
  // Build class names
  let classes = 'btn';
  
  // Add variant class
  if (variant === 'primary') classes += ' btn-primary';
  if (variant === 'outline') classes += ' btn-outline';
  if (variant === 'ghost') classes += ' btn-ghost';
  
  // Add size class
  if (size === 'sm') classes += ' btn-sm';
  if (size === 'icon') classes += ' btn-icon';
  
  // Add full width
  if (fullWidth) classes += ' btn-full';
  
  // Add custom class
  if (className) classes += ' ' + className;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  );
}

export default Button;