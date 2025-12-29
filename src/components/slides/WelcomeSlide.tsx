import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import { forwardRef } from 'react';

interface Props {
  year: number;
}

export const WelcomeSlide = forwardRef<HTMLDivElement, Props>(({ year }, ref) => {
  return (
    <SlideWrapper ref={ref} gradient="gradient-orange-navy">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
        className="text-6xl lg:text-9xl mb-6 lg:mb-10"
      >
        📦
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="text-4xl lg:text-7xl font-bold text-white mb-2">Your</h1>
        <h1 className="text-4xl lg:text-7xl font-bold text-white mb-2">{year}</h1>
        <h1 className="text-4xl lg:text-7xl font-bold text-white">Unboxed</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 lg:mt-12"
      >
        <div className="w-16 lg:w-24 h-0.5 bg-white/30 mx-auto mb-6" />
        <p className="text-white/70 text-base lg:text-xl">Tap to begin →</p>
      </motion.div>
    </SlideWrapper>
  );
});

WelcomeSlide.displayName = 'WelcomeSlide';
