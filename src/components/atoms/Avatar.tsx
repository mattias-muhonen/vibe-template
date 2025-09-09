import React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  fallback,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };


  return (
    <AvatarPrimitive.Root 
      className={`
        inline-flex items-center justify-center overflow-hidden rounded-full
        bg-gray-100 select-none align-middle
        ${sizeClasses[size]} ${className}
      `}
    >
      <AvatarPrimitive.Image
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
      <AvatarPrimitive.Fallback
        className="
          w-full h-full flex items-center justify-center
          bg-gray-200 text-gray-600 font-medium
        "
        delayMs={600}
      >
        {fallback ? (
          <span>{fallback}</span>
        ) : (
          <svg 
            className="w-1/2 h-1/2" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path 
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        )}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
};

export default Avatar;