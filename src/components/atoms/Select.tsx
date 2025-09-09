import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectPrimitive.SelectProps {
  options?: SelectOption[];
  placeholder?: string;
  label?: string;
  children?: React.ReactNode;
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className = '', children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={`
      w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg
      hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      flex items-center justify-between gap-2
      transition-colors duration-200
      ${className}
    `}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-500">
        <path 
          d="M4 6L8 10L12 6" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));

SelectTrigger.displayName = 'SelectTrigger';

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className = '', children, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={`
        overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200
        animate-in fade-in-80 z-50
        ${className}
      `}
      position="popper"
      sideOffset={4}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));

SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className = '', children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={`
      relative flex items-center px-8 py-2 text-sm rounded
      hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
      data-[disabled]:opacity-50 data-[disabled]:pointer-events-none
      cursor-pointer select-none
      ${className}
    `}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path 
          d="M13 4L6 11L3 8" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));

SelectItem.displayName = 'SelectItem';

const Select = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  SelectProps
>(({ options, placeholder = 'Select...', label, children, ...props }, ref) => {
  if (children) {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>
      </div>
    );
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <SelectPrimitive.Root {...props}>
        <SelectTrigger>
          <SelectPrimitive.Value placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectPrimitive.Root>
    </div>
  );
});

Select.displayName = 'Select';

export default Object.assign(Select, {
  Trigger: SelectTrigger,
  Content: SelectContent,
  Item: SelectItem,
  Value: SelectPrimitive.Value,
});