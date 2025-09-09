import React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className = '', label, id, ...props }, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex items-center gap-2">
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        className={`
          w-5 h-5 rounded border-2 border-gray-300 
          data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600
          data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:border-blue-600
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${className}
        `}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path 
              d="M11.5 3.5L5.5 9.5L2.5 6.5" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label 
          htmlFor={checkboxId}
          className="text-sm font-medium text-gray-700 cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;