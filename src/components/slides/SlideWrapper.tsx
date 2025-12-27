import { motion } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';

interface SlideWrapperProps {
  children: ReactNode;
  gradient: string;
  className?: string;
}

export const SlideWrapper = forwardRef<HTMLDivElement, SlideWrapperProps>(
  ({ children, gradient, className = '' }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className={`slide-container ${gradient} ${className}`}
      >
        <div className="slide-content">
          {children}
        </div>
      </motion.div>
    );
  }
);

SlideWrapper.displayName = 'SlideWrapper';
