import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import { formatCurrency } from '../../utils/dataProcessor';
import type { WrappedStats } from '../../types';
import { forwardRef } from 'react';

interface Props {
  stats: WrappedStats;
}

export const DigitalLifeSlide = forwardRef<HTMLDivElement, Props>(
  ({ stats }, ref) => {
    const hasDigital = stats.digitalSpend > 0 || stats.digitalItemCount > 0;

    if (!hasDigital) {
      return (
        <SlideWrapper ref={ref} gradient="gradient-navy-purple">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl lg:text-8xl mb-6"
          >
            📱
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl lg:text-4xl font-bold text-white mb-4"
          >
            No digital purchases
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-base lg:text-xl"
          >
            You kept it physical this year!
            <br />
            No Kindle books or digital content.
          </motion.p>
        </SlideWrapper>
      );
    }

    return (
      <SlideWrapper ref={ref} gradient="gradient-navy-purple">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg lg:text-2xl text-white/80 mb-2"
        >
          Your digital haul
        </motion.h2>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="text-4xl lg:text-6xl font-bold text-white mt-4"
        >
          {formatCurrency(stats.digitalSpend)}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-base lg:text-xl text-white/70 mt-2"
        >
          in digital purchases
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-black/20 rounded-xl p-4 lg:p-6 w-full max-w-xs lg:max-w-md"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl lg:text-3xl">📚</span>
            <span className="text-white text-base lg:text-lg">
              {stats.digitalItemCount} digital items
            </span>
          </div>
          {stats.digitalOrders > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-2xl lg:text-3xl">🛒</span>
              <span className="text-white text-base lg:text-lg">
                {stats.digitalOrders} digital orders
              </span>
            </div>
          )}
        </motion.div>

        {stats.topPublisher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-6 text-center"
          >
            <p className="text-white/60 text-sm lg:text-base">Top publisher</p>
            <p className="text-white font-semibold text-base lg:text-lg">{stats.topPublisher}</p>
          </motion.div>
        )}
      </SlideWrapper>
    );
  }
);

DigitalLifeSlide.displayName = 'DigitalLifeSlide';
