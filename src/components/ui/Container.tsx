import type { FC } from 'react';
import { cn } from '@utils/helpers';
import type { ContainerProps } from '@/types/components';

/**
 * Container component for consistent page width with responsive padding
 * - Uses max-width to center content
 * - Uses clamp() for fluid padding that adapts to screen size and display scaling
 * - Ensures consistent spacing across Landing page and Browse Vehicles page
 */
export const Container: FC<ContainerProps> = ({
  children,
  className,
  maxWidth = 'xl',
}) => {
  const maxWidths = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-7xl', // ~1280px
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidths[maxWidth],
        className
      )}
      style={{
        paddingInline: 'clamp(1rem, 5vw, 5rem)', // 16px min, 5% viewport, 80px max
      }}
    >
      {children}
    </div>
  );
};

export default Container;
