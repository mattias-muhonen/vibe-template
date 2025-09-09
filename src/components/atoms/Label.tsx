import React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  required?: boolean;
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className = '', required = false, children, ...props }, ref) => {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={`
        text-sm font-medium text-gray-700 
        peer-disabled:opacity-50
        ${className}
      `}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </LabelPrimitive.Root>
  );
});

Label.displayName = 'Label';

export default Label;