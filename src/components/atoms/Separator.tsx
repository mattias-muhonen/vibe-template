import React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

interface SeparatorProps extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  orientation?: 'horizontal' | 'vertical';
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(({ className = '', orientation = 'horizontal', ...props }, ref) => {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative
      orientation={orientation}
      className={`
        bg-gray-200
        ${orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'}
        ${className}
      `}
      {...props}
    />
  );
});

Separator.displayName = 'Separator';

export default Separator;