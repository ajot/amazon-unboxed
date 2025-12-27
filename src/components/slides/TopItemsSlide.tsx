import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import type { WrappedStats } from '../../types';
import { forwardRef } from 'react';
import { LIMITS } from '../../config';

interface Props {
  stats: WrappedStats;
}

export const TopItemsSlide = forwardRef<HTMLDivElement, Props>(
  ({ stats }, ref) => {
    // Truncate long product names
    const truncateName = (name: string, maxLen = LIMITS.truncateLength) => {
      if (name.length <= maxLen) return name;
      return name.substring(0, maxLen) + '...';
    };

    return (
      <SlideWrapper ref={ref} gradient="gradient-teal-dark">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg lg:text-2xl text-white/80 mb-2"
        >
          Your most ordered
        </motion.h2>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl lg:text-4xl font-bold text-white mb-6"
        >
          items
        </motion.h2>

        <div className="w-full max-w-xs lg:max-w-md space-y-3">
          {stats.topItems.slice(0, 5).map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="flex items-center gap-3 bg-black/20 rounded-lg p-3 lg:p-4"
            >
              <span className="text-amazon-orange font-bold text-lg lg:text-xl w-6">
                {idx + 1}.
              </span>
              <span className="text-white text-sm lg:text-base flex-1 text-left">
                {truncateName(item.name)}
              </span>
              <span className="text-white/60 text-sm lg:text-base">×{item.count}</span>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-white/60 text-base lg:text-lg"
        >
          Some things you just
          <br />
          can't get enough of 🔄
        </motion.p>
      </SlideWrapper>
    );
  }
);

TopItemsSlide.displayName = 'TopItemsSlide';
