import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import type { WrappedStats } from '../../types';
import { forwardRef } from 'react';

interface Props {
  stats: WrappedStats;
  year: number;
}

const DAY_ABBREVS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const FavoriteDaySlide = forwardRef<HTMLDivElement, Props>(
  ({ stats }, ref) => {
    const maxCount = Math.max(...stats.dailyOrders.map((d) => d.count));
    const favDayIndex = DAY_NAMES.indexOf(stats.favoriteDay.day);

    return (
      <SlideWrapper ref={ref} gradient="gradient-purple-navy">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-base lg:text-2xl text-white/80 mb-4"
        >
          You love shopping on
        </motion.p>

        <motion.h2
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="stat-large text-white"
        >
          {stats.favoriteDay.day}s
        </motion.h2>

        {/* Day histogram */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 w-full max-w-xs lg:max-w-md"
        >
          <div className="flex items-end justify-center gap-3 lg:gap-4 h-20 lg:h-28">
            {stats.dailyOrders.map((day, idx) => {
              const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
              const isFavorite = day.day === stats.favoriteDay.day;
              return (
                <motion.div
                  key={day.day}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 10)}%` }}
                  transition={{ delay: 0.6 + idx * 0.1, duration: 0.4 }}
                  className={`w-8 lg:w-12 rounded-t-md ${
                    isFavorite ? 'bg-amazon-orange' : 'bg-white/30'
                  }`}
                />
              );
            })}
          </div>
          <div className="flex justify-center gap-3 lg:gap-4 mt-3">
            {DAY_ABBREVS.map((d, idx) => (
              <span
                key={d + idx}
                className={`w-8 lg:w-12 text-center text-sm lg:text-base ${
                  idx === favDayIndex ? 'text-amazon-orange font-bold' : 'text-white/40'
                }`}
              >
                {d}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-white/60 text-base lg:text-xl"
        >
          <span className="text-white font-semibold">{stats.favoriteDay.count}</span> orders on{' '}
          {stats.favoriteDay.day}s this year
        </motion.p>
      </SlideWrapper>
    );
  }
);

FavoriteDaySlide.displayName = 'FavoriteDaySlide';
