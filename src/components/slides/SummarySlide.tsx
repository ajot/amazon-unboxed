import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import { formatCurrency, formatNumber } from '../../utils/dataProcessor';
import type { WrappedStats } from '../../types';
import { forwardRef } from 'react';
import { DownloadIcon, ChartIcon } from '../Icons';

interface Props {
  stats: WrappedStats;
  year: number;
  onDownload?: () => void;
  onExplore?: () => void;
}

export const SummarySlide = forwardRef<HTMLDivElement, Props>(
  ({ stats, year, onDownload, onExplore }, ref) => {
    // Truncate item name if needed
    const topItemName =
      stats.topItems[0]?.name.length > 20
        ? stats.topItems[0]?.name.substring(0, 20) + '...'
        : stats.topItems[0]?.name || 'N/A';

    return (
      <SlideWrapper ref={ref} gradient="gradient-orange-navy">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl lg:text-4xl font-bold text-white mb-1"
        >
          My Amazon {year}
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2 }}
          className="w-32 lg:w-48 h-1 bg-amazon-orange mx-auto mb-6"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-xs lg:max-w-lg space-y-3"
        >
          {/* Main stats */}
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <div className="bg-black/20 rounded-lg p-3 lg:p-4 text-center">
              <p className="text-xl lg:text-2xl font-bold text-white">
                {formatCurrency(stats.netSpend)}
              </p>
              <p className="text-xs lg:text-sm text-white/60">net spend</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3 lg:p-4 text-center">
              <p className="text-xl lg:text-2xl font-bold text-white">
                {formatNumber(stats.totalOrders)}
              </p>
              <p className="text-xs lg:text-sm text-white/60">orders</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3 lg:p-4 text-center">
              <p className="text-xl lg:text-2xl font-bold text-white">
                {formatNumber(stats.totalItems)}
              </p>
              <p className="text-xs lg:text-sm text-white/60">items</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3 lg:p-4 text-center">
              <p className="text-xl lg:text-2xl font-bold text-green-400">
                {formatCurrency(stats.totalRefundAmount)}
              </p>
              <p className="text-xs lg:text-sm text-white/60">refunded</p>
            </div>
          </div>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-black/20 rounded-lg p-4 lg:p-5 mt-4"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/60 text-sm lg:text-base">Peak month</span>
              <span className="text-white font-semibold text-base lg:text-lg">{stats.peakMonth.month}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/60 text-sm lg:text-base">Fave day</span>
              <span className="text-white font-semibold text-base lg:text-lg">{stats.favoriteDay.day}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm lg:text-base">Top item</span>
              <span className="text-white font-semibold text-right text-sm lg:text-base">
                {topItemName}
              </span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 pt-4 border-t border-white/20 w-full max-w-xs lg:max-w-lg"
        >
          <p className="text-white/40 text-xs lg:text-sm mb-4">unboxed.curiousmints.com</p>

          <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
            {onDownload && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload();
                }}
                className="w-full lg:flex-1 py-3 lg:py-4 px-6 bg-white text-amazon-dark font-semibold text-base lg:text-lg rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                Download <DownloadIcon size={20} />
              </button>
            )}
            {onExplore && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExplore();
                }}
                className="w-full lg:flex-1 py-3 lg:py-4 px-6 bg-amazon-orange text-amazon-dark font-semibold text-base lg:text-lg rounded-xl hover:bg-amber-500 transition-colors flex items-center justify-center gap-2"
              >
                Explore Your Data <ChartIcon size={20} />
              </button>
            )}
          </div>
        </motion.div>
      </SlideWrapper>
    );
  }
);

SummarySlide.displayName = 'SummarySlide';
