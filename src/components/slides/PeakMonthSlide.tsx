import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import { formatCurrency } from '../../utils/dataProcessor';
import type { WrappedStats } from '../../types';
import { forwardRef } from 'react';

interface Props {
  stats: WrappedStats;
  year: number;
}

const MONTH_ABBREVS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export const PeakMonthSlide = forwardRef<HTMLDivElement, Props>(
  ({ stats }, ref) => {
    const maxSpend = Math.max(...stats.monthlySpending.map((m) => m.amount));
    const peakMonthIndex = stats.monthlySpending.findIndex(
      (m) => m.month === stats.peakMonth.month
    );

    return (
      <SlideWrapper ref={ref} gradient="gradient-rose-dark">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-base lg:text-2xl text-white/80 mb-2"
        >
          Your biggest shopping month
        </motion.p>

        <motion.h2
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="stat-large text-white"
        >
          {stats.peakMonth.month}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl lg:text-3xl font-semibold text-amazon-orange mt-2"
        >
          {formatCurrency(stats.peakMonth.amount)}
        </motion.p>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 w-full max-w-xs lg:max-w-md"
        >
          <div className="flex items-end justify-center gap-1 lg:gap-2 h-20 lg:h-28">
            {stats.monthlySpending.map((month, idx) => {
              const height = maxSpend > 0 ? (month.amount / maxSpend) * 100 : 0;
              const isPeak = idx === peakMonthIndex;
              return (
                <motion.div
                  key={month.month}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 5)}%` }}
                  transition={{ delay: 0.8 + idx * 0.05, duration: 0.5 }}
                  className={`w-4 lg:w-6 rounded-t-md ${
                    isPeak ? 'bg-amazon-orange' : 'bg-white/30'
                  }`}
                />
              );
            })}
          </div>
          <div className="flex justify-center gap-1 lg:gap-2 mt-2">
            {MONTH_ABBREVS.map((m, idx) => (
              <span
                key={m + idx}
                className={`w-4 lg:w-6 text-center text-xs ${
                  idx === peakMonthIndex ? 'text-amazon-orange font-bold' : 'text-white/40'
                }`}
              >
                {m}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 text-white/60 text-base lg:text-lg"
        >
          {stats.peakMonth.month === 'November' || stats.peakMonth.month === 'December'
            ? 'Holiday shopping got you good 🛒'
            : stats.peakMonth.month === 'July'
            ? 'Prime Day strikes again 🎯'
            : 'You treated yourself well 🎁'}
        </motion.p>
      </SlideWrapper>
    );
  }
);

PeakMonthSlide.displayName = 'PeakMonthSlide';
