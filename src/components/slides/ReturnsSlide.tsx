import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import { AnimatedNumber } from '../AnimatedNumber';
import { formatCurrency, formatPercent } from '../../utils/dataProcessor';
import type { WrappedStats } from '../../types';
import { forwardRef } from 'react';

interface Props {
  stats: WrappedStats;
  year: number;
}

export const ReturnsSlide = forwardRef<HTMLDivElement, Props>(
  ({ stats }, ref) => {
    const hasReturns = stats.returnCount > 0 || stats.totalRefundAmount > 0;

    if (!hasReturns) {
      return (
        <SlideWrapper ref={ref} gradient="gradient-dark-green">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl lg:text-8xl mb-6"
          >
            ✨
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl lg:text-4xl font-bold text-white mb-4"
          >
            No returns!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-base lg:text-xl"
          >
            You kept everything you ordered.
            <br />
            Perfect shopping instincts! 🎯
          </motion.p>
        </SlideWrapper>
      );
    }

    return (
      <SlideWrapper ref={ref} gradient="gradient-dark-green">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg lg:text-2xl text-white/80 mb-4"
        >
          Changed your mind?
        </motion.p>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <AnimatedNumber
            value={stats.returnCount}
            className="stat-huge text-white"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl lg:text-4xl font-bold text-white mt-2"
        >
          returns
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <p className="text-3xl lg:text-5xl font-bold text-green-400">
            {formatCurrency(stats.totalRefundAmount)}
          </p>
          <p className="text-base lg:text-xl text-white/70 mt-1">back in your pocket 💸</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 bg-black/20 rounded-xl p-4 lg:p-6 w-full max-w-xs lg:max-w-md"
        >
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm lg:text-base">Return rate</span>
            <span className="text-white font-semibold text-base lg:text-lg">
              {formatPercent(stats.returnRate)}
            </span>
          </div>
          {stats.averageRefundTime && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-white/60 text-sm lg:text-base">Avg refund time</span>
              <span className="text-white font-semibold text-base lg:text-lg">
                {stats.averageRefundTime.toFixed(1)} days
              </span>
            </div>
          )}
        </motion.div>
      </SlideWrapper>
    );
  }
);

ReturnsSlide.displayName = 'ReturnsSlide';
