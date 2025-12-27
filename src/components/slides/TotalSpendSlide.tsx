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
    console.log('[TotalSpendSlide] hasMixed:', stats.hasMixedCurrencies, 'primary:', stats.primaryCurrency, 'breakdown:', stats.currencyBreakdown);
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

        {stats.hasMixedCurrencies && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-4 px-3 py-2 bg-amber-500/20 border border-amber-500/40 rounded-lg text-xs text-amber-200"
          >
            <span className="mr-1">⚠️</span>
            Totals shown in {stats.primaryCurrency} only.{' '}
            <span className="text-amber-300/70">
              Also ordered in:{' '}
              {stats.currencyBreakdown.slice(1).map((c, i) => (
                <span key={c.currency}>
                  {i > 0 && ', '}
                  {c.currency} ({c.orderCount})
                </span>
              ))}
            </span>
          </motion.div>
        )}
      </SlideWrapper>
    );
  }
);

TotalSpendSlide.displayName = 'TotalSpendSlide';
