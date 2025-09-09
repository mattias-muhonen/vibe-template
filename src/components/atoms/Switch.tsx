import React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className = '', label, id, ...props }, ref) => {
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex items-center gap-2">
      <SwitchPrimitive.Root
        ref={ref}
        id={switchId}
        className={`
          w-11 h-6 bg-gray-300 rounded-full relative
          data-[state=checked]:bg-blue-600
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${className}
        `}
        {...props}
      >
        <SwitchPrimitive.Thumb 
          className="
            block w-5 h-5 bg-white rounded-full shadow-lg
            transition-transform duration-200
            translate-x-0.5 data-[state=checked]:translate-x-[22px]
          "
        />
      </SwitchPrimitive.Root>
      {label && (
        <label 
          htmlFor={switchId}
          className="text-sm font-medium text-gray-700 cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
});

Switch.displayName = 'Switch';

export default Switch;