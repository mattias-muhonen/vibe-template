import React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';

interface ToggleProps extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
  const baseClasses = `
    inline-flex items-center justify-center rounded-lg font-medium
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantClasses = {
    default: `
      bg-transparent text-gray-700
      hover:bg-gray-100
      data-[state=on]:bg-gray-200 data-[state=on]:text-gray-900
    `,
    outline: `
      border-2 border-gray-300 bg-transparent text-gray-700
      hover:bg-gray-50
      data-[state=on]:bg-gray-100 data-[state=on]:border-gray-400
    `
  };

  const sizeClasses = {
    sm: 'h-8 px-2.5 text-sm gap-1',
    md: 'h-10 px-3 text-base gap-1.5',
    lg: 'h-12 px-4 text-lg gap-2'
  };

  return (
    <TogglePrimitive.Root
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </TogglePrimitive.Root>
  );
});

Toggle.displayName = 'Toggle';

export default Toggle;