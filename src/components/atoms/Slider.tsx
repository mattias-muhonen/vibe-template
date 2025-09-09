import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  showValue?: boolean;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ label, showValue = false, className = '', value, defaultValue, ...props }, ref) => {
  const currentValue = value || defaultValue || [0];
  
  return (
    <div className="w-full space-y-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-gray-700">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm font-medium text-gray-500">
              {Array.isArray(currentValue) ? currentValue[0] : currentValue}
            </span>
          )}
        </div>
      )}
      <SliderPrimitive.Root
        ref={ref}
        className={`
          relative flex items-center select-none touch-none w-full h-5
          ${className}
        `}
        value={value}
        defaultValue={defaultValue}
        {...props}
      >
        <SliderPrimitive.Track className="bg-gray-200 relative grow rounded-full h-2">
          <SliderPrimitive.Range className="absolute bg-blue-600 rounded-full h-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb 
          className="
            block w-5 h-5 bg-white border-2 border-blue-600 rounded-full
            hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200 shadow-md
          "
        />
      </SliderPrimitive.Root>
    </div>
  );
});

Slider.displayName = 'Slider';

export default Slider;