import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import { formatCurrency, formatPercent } from '../../utils/dataProcessor';
import type { WrappedStats } from '../../types';
import { forwardRef } from 'react';
import { LIMITS } from '../../config';

interface Props {
  stats: WrappedStats;
}

export const BigTicketsSlide = forwardRef<HTMLDivElement, Props>(
  ({ stats }, ref) => {
    const top5Total = stats.topExpensiveItems
      .slice(0, 5)
      .reduce((sum, item) => sum + item.price, 0);
    const percentOfSpend =
      stats.totalGrossSpend > 0 ? (top5Total / stats.totalGrossSpend) * 100 : 0;

    // Truncate long product names
    const truncateName = (name: string, maxLen = LIMITS.truncateLengthShort) => {
      if (name.length <= maxLen) return name;
      return name.substring(0, maxLen) + '...';
    };

    return (
      <SlideWrapper ref={ref} gradient="gradient-pink-navy">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg lg:text-2xl text-white/80 mb-2"
        >
          Your biggest
        </motion.h2>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl lg:text-4xl font-bold text-white mb-6"
        >
          purchases
        </motion.h2>

        <div className="w-full max-w-xs lg:max-w-md space-y-2">
          {stats.topExpensiveItems.slice(0, 5).map((item, idx) => (
            <motion.div
              key={`${item.name}-${idx}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="flex items-center gap-3 bg-black/20 rounded-lg p-3 lg:p-4"
            >
              <span className="text-amazon-orange font-bold w-6 text-base lg:text-lg">
                {idx + 1}.
              </span>
              <span className="text-white text-sm lg:text-base flex-1 text-left">
                {truncateName(item.name)}
              </span>
              <span className="text-white font-semibold text-sm lg:text-base">
                {formatCurrency(item.price)}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 pt-4 border-t border-white/20 w-full max-w-xs lg:max-w-md"
        >
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm lg:text-base">Top 5 total</span>
            <span className="text-white font-bold text-base lg:text-lg">{formatCurrency(top5Total)}</span>
          </div>
          <p className="text-sm lg:text-base text-white/50 mt-1">
            ({formatPercent(percentOfSpend)} of your spend)
          </p>
        </motion.div>
      </SlideWrapper>
    );
  }
);

BigTicketsSlide.displayName = 'BigTicketsSlide';
