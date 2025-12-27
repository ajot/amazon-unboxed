import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import { AnimatedNumber } from '../AnimatedNumber';
import { formatCurrency } from '../../utils/dataProcessor';
import type { WrappedStats } from '../../types';
import { forwardRef } from 'react';

interface Props {
  stats: WrappedStats;
}

export const BooksSlide = forwardRef<HTMLDivElement, Props>(
  ({ stats }, ref) => {
    const hasBooks = stats.bookCount > 0;

    if (!hasBooks) {
      return (
        <SlideWrapper ref={ref} gradient="gradient-emerald-dark">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl lg:text-8xl mb-6"
          >
            📚
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl lg:text-4xl font-bold text-white mb-4"
          >
            No books this year
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-base lg:text-xl"
          >
            Maybe 2025 is the year to
            <br />
            start that reading list?
          </motion.p>
        </SlideWrapper>
      );
    }

    // Truncate book title if needed
    const topBookName =
      stats.topBooks[0]?.name.length > 35
        ? stats.topBooks[0]?.name.substring(0, 35) + '...'
        : stats.topBooks[0]?.name;

    return (
      <SlideWrapper ref={ref} gradient="gradient-emerald-dark">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg lg:text-2xl text-white/80 mb-2"
        >
          Your reading journey
        </motion.p>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="flex items-baseline gap-2"
        >
          <AnimatedNumber
            value={stats.bookCount}
            className="stat-huge text-white"
          />
          <span className="text-3xl lg:text-5xl">📚</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl lg:text-4xl font-bold text-white mt-2"
        >
          {stats.bookCount === 1 ? 'book' : 'books'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <p className="text-3xl lg:text-5xl font-bold text-amazon-orange">
            {formatCurrency(stats.bookSpend)}
          </p>
          <p className="text-base lg:text-xl text-white/70 mt-1">spent on books</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 bg-black/20 rounded-xl p-4 lg:p-6 w-full max-w-xs lg:max-w-md"
        >
          {stats.kindleBookCount > 0 && (
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl lg:text-3xl">📱</span>
              <span className="text-white text-base lg:text-lg">
                {stats.kindleBookCount} Kindle {stats.kindleBookCount === 1 ? 'book' : 'books'}
              </span>
            </div>
          )}
          {stats.physicalBookCount > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-2xl lg:text-3xl">📖</span>
              <span className="text-white text-base lg:text-lg">
                {stats.physicalBookCount} physical {stats.physicalBookCount === 1 ? 'book' : 'books'}
              </span>
            </div>
          )}
        </motion.div>

        {topBookName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-6 text-center"
          >
            <p className="text-white/60 text-sm lg:text-base">Most expensive read</p>
            <p className="text-white font-semibold text-sm lg:text-base mt-1 max-w-xs lg:max-w-md">
              {topBookName}
            </p>
            <p className="text-amazon-orange font-bold text-base lg:text-lg">
              {formatCurrency(stats.topBooks[0]?.price || 0)}
            </p>
          </motion.div>
        )}

      </SlideWrapper>
    );
  }
);

BooksSlide.displayName = 'BooksSlide';
