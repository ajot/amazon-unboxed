import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import { AnimatedNumber } from '../AnimatedNumber';
import { formatCurrency } from '../../utils/dataProcessor';
import type { WrappedStats } from '../../types';
import { forwardRef } from 'react';

interface Props {
  stats: WrappedStats;
  year: number;
}

export const TotalSpendSlide = forwardRef<HTMLDivElement, Props>(
  ({ stats, year }, ref) => {
    return (
      <SlideWrapper ref={ref} gradient="gradient-amber-navy">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg lg:text-2xl text-white/80 mb-4"
        >
          You spent
        </motion.p>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <AnimatedNumber
            value={stats.netSpend}
            prefix="$"
            className="stat-huge text-white"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg lg:text-2xl text-white/80 mt-4"
        >
          on Amazon in {year}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-4 lg:p-6 bg-black/20 rounded-xl"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-sm lg:text-base">Ordered</span>
            <span className="text-white font-semibold text-base lg:text-lg">
              {formatCurrency(stats.totalGrossSpend)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm lg:text-base">Refunded</span>
            <span className="text-green-400 font-semibold text-base lg:text-lg">
              -{formatCurrency(stats.totalRefunds)}
            </span>
          </div>
        </motion.div>
      </SlideWrapper>
    );
  }
);

TotalSpendSlide.displayName = 'TotalSpendSlide';
