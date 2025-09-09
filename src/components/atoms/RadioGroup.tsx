import React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  options?: RadioOption[];
  label?: string;
  children?: React.ReactNode;
}

interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className = '', ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={`
        w-5 h-5 rounded-full border-2 border-gray-300 bg-white
        data-[state=checked]:border-blue-600
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2.5 after:h-2.5 after:rounded-full after:bg-blue-600" />
    </RadioGroupPrimitive.Item>
  );
});

RadioGroupItem.displayName = 'RadioGroupItem';

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ options, label, children, className = '', ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <RadioGroupPrimitive.Root
        ref={ref}
        className={`space-y-2 ${className}`}
        {...props}
      >
        {children ? children : options?.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem
              value={option.value}
              disabled={option.disabled}
              id={`radio-${option.value}`}
            />
            <label
              htmlFor={`radio-${option.value}`}
              className="text-sm font-medium text-gray-700 cursor-pointer select-none"
            >
              {option.label}
            </label>
          </div>
        ))}
      </RadioGroupPrimitive.Root>
    </div>
  );
});

RadioGroup.displayName = 'RadioGroup';

export default Object.assign(RadioGroup, {
  Item: RadioGroupItem
});