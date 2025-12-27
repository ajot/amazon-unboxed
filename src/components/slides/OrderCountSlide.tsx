import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import { AnimatedNumber } from '../AnimatedNumber';
import { formatDecimal } from '../../utils/dataProcessor';
import type { WrappedStats } from '../../types';
import { forwardRef } from 'react';

interface Props {
  stats: WrappedStats;
  year: number;
}

export const OrderCountSlide = forwardRef<HTMLDivElement, Props>(
  ({ stats }, ref) => {
    const daysPerOrder = stats.totalOrders > 0 ? 365 / stats.totalOrders : 0;

    return (
      <SlideWrapper ref={ref} gradient="gradient-blue-navy">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg lg:text-2xl text-white/80 mb-4"
        >
          You placed
        </motion.p>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <AnimatedNumber
            value={stats.totalOrders}
            className="stat-huge text-white"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl lg:text-4xl font-bold text-white mt-2"
        >
          orders
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-base lg:text-xl text-white/70 mt-6"
        >
          That's about 1 package
          <br />
          every {formatDecimal(daysPerOrder)} days 📦
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex gap-4 lg:gap-6 mt-8"
        >
          <div className="bg-black/20 rounded-xl px-6 lg:px-8 py-4 lg:py-6 text-center">
            <p className="text-2xl lg:text-4xl font-bold text-white">{stats.retailOrders}</p>
            <p className="text-xs lg:text-sm text-white/60">Retail</p>
          </div>
          <div className="bg-black/20 rounded-xl px-6 lg:px-8 py-4 lg:py-6 text-center">
            <p className="text-2xl lg:text-4xl font-bold text-white">{stats.digitalOrders}</p>
            <p className="text-xs lg:text-sm text-white/60">Digital</p>
          </div>
        </motion.div>
      </SlideWrapper>
    );
  }
);

OrderCountSlide.displayName = 'OrderCountSlide';
