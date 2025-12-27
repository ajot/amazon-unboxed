import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import { formatCurrency, formatNumber, formatDecimal } from '../../utils/dataProcessor';
import type { WrappedStats } from '../../types';
import { forwardRef } from 'react';

interface Props {
  stats: WrappedStats;
}

const StatBox = ({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="bg-black/20 rounded-xl p-4 lg:p-6 flex flex-col items-center justify-center"
  >
    <span className="text-2xl lg:text-4xl font-bold text-white">{value}</span>
    <span className="text-xs lg:text-sm text-white/60 mt-1">{label}</span>
  </motion.div>
);

export const ByTheNumbersSlide = forwardRef<HTMLDivElement, Props>(
  ({ stats }, ref) => {
    const daysPerOrder = stats.totalOrders > 0 ? 365 / stats.totalOrders : 0;

    return (
      <SlideWrapper ref={ref} gradient="gradient-indigo-dark">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl lg:text-4xl font-bold text-white mb-8 lg:mb-12"
        >
          2025 in numbers
        </motion.h2>

        <div className="grid grid-cols-2 gap-4 lg:gap-6 w-full max-w-xs lg:max-w-lg">
          <StatBox
            value={formatCurrency(stats.monthlyAverage)}
            label="per month"
            delay={0.2}
          />
          <StatBox
            value={formatCurrency(stats.averageItemCost)}
            label="per item"
            delay={0.3}
          />
          <StatBox
            value={formatNumber(stats.totalItems)}
            label="items"
            delay={0.4}
          />
          <StatBox
            value={formatNumber(Math.round(stats.averageItemsPerMonth))}
            label="items/month"
            delay={0.5}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 lg:mt-12 text-center"
        >
          <p className="text-white/70 text-base lg:text-xl">
            You averaged an order
            <br />
            <span className="text-white font-semibold">
              every {formatDecimal(daysPerOrder)} days
            </span>
          </p>
        </motion.div>
      </SlideWrapper>
    );
  }
);

ByTheNumbersSlide.displayName = 'ByTheNumbersSlide';
