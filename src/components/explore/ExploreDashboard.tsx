import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WrappedStats, ProcessedData, ParsedFile, ProcessedOrder, YearlyData } from '../../types';
import type { StoredYearlyData } from '../../utils/localStorage';
import { MonthlySpendingChart } from './MonthlySpendingChart';
import { MonthlyTransactionsTable } from './MonthlyTransactionsTable';
import { YearlySpendingChart } from './YearlySpendingChart';
import { YearlyTransactionsTable } from './YearlyTransactionsTable';
import { AllTransactionsView } from './AllTransactionsView';
import { RefundsView } from './RefundsView';
import { BooksView } from './BooksView';
import { DemoBadge } from '../DemoBadge';
import { formatCurrency, formatNumber, calculateYearlyData, calculateYearlyDataFromOrders } from '../../utils/dataProcessor';

type TabType = 'overview' | 'transactions' | 'books' | 'refunds' | 'allyears';

interface ExploreDashboardProps {
  stats: WrappedStats;
  processedData: ProcessedData;
  parsedFiles: ParsedFile[];
  allOrders: ProcessedOrder[];
  storedYearlyData?: StoredYearlyData[];
  onBack: () => void;
  onReset: () => void;
  year: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
  isDemoMode?: boolean;
}

export function ExploreDashboard({
  stats,
  processedData,
  parsedFiles,
  allOrders,
  storedYearlyData,
  onBack,
  onReset,
  year,
  availableYears,
  onYearChange,
  isDemoMode,
}: ExploreDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYearIndex, setSelectedYearIndex] = useState<number | null>(null);

  // Calculate yearly data - use allOrders (contains all years), fallback to parsedFiles, then storedYearlyData
  const yearlyData = useMemo((): YearlyData[] => {
    if (allOrders.length > 0) {
      return calculateYearlyDataFromOrders(allOrders);
    }
    if (parsedFiles.length > 0) {
      return calculateYearlyData(parsedFiles);
    }
    // Fallback: use stored yearly summary (has totals but no transactions)
    if (storedYearlyData && storedYearlyData.length > 0) {
      return storedYearlyData;
    }
    // Last fallback: use current year's orders only
    return calculateYearlyDataFromOrders(processedData.orders);
  }, [allOrders, parsedFiles, storedYearlyData, processedData.orders]);

  const handleMonthClick = useCallback((monthIndex: number) => {
    setSelectedMonth((prev) => (prev === monthIndex ? null : monthIndex));
  }, []);

  const handleYearClick = useCallback((yearIndex: number) => {
    setSelectedYearIndex((prev) => (prev === yearIndex ? null : yearIndex));
  }, []);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'All Transactions' },
    { id: 'books', label: 'Books' },
    { id: 'refunds', label: 'Refunds' },
    { id: 'allyears', label: 'All Years' },
  ];

  return (
    <div className="min-h-screen bg-amazon-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-amazon-dark/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-xl font-bold text-white">
                📊 Data Explorer
              </h1>
              {isDemoMode && <DemoBadge />}
            </div>
            <div className="flex items-center gap-4">
              {/* Year selector */}
              {availableYears.length > 1 && (
                <select
                  value={year}
                  onChange={(e) => onYearChange(parseInt(e.target.value))}
                  className="px-3 py-2 bg-white/10 text-white rounded-lg text-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y} className="bg-amazon-dark">
                      {y}
                    </option>
                  ))}
                </select>
              )}
              <div className="text-right">
                <p className="text-sm text-gray-400">
                  {activeTab === 'allyears' ? 'All Years' : `${year} Summary`}
                </p>
                <p className="text-lg font-semibold text-amazon-orange">
                  {activeTab === 'allyears'
                    ? formatCurrency(yearlyData.reduce((sum, y) => sum + y.totalSpend, 0))
                    : formatCurrency(stats.netSpend)}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedMonth(null);
                  setSelectedYearIndex(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amazon-orange text-amazon-dark'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Stats Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-amazon-navy/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(stats.totalGrossSpend)}
                  </p>
                </div>
                <div className="bg-amazon-navy/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Orders</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(stats.totalOrders)}
                  </p>
                </div>
                <div className="bg-amazon-navy/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Items</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(stats.totalItems)}
                  </p>
                </div>
                <div className="bg-amazon-navy/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Refunded</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(stats.totalRefundAmount)}
                  </p>
                </div>
              </div>

              {/* Monthly Chart */}
              <div className="bg-amazon-navy/30 rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Monthly Spending
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  Click on a month to see transactions
                </p>
                <MonthlySpendingChart
                  monthlyData={processedData.monthlyData}
                  selectedMonth={selectedMonth}
                  onMonthClick={handleMonthClick}
                />
              </div>

              {/* Monthly Transactions Table (when month selected) */}
              <AnimatePresence>
                {selectedMonth !== null && (
                  <MonthlyTransactionsTable
                    monthData={processedData.monthlyData[selectedMonth]}
                    onClose={() => setSelectedMonth(null)}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <AllTransactionsView orders={processedData.orders} primaryCurrency={stats.primaryCurrency} />
            </motion.div>
          )}

          {activeTab === 'books' && (
            <motion.div
              key="books"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <BooksView orders={processedData.orders} />
            </motion.div>
          )}

          {activeTab === 'refunds' && (
            <motion.div
              key="refunds"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <RefundsView
                refunds={processedData.enrichedRefunds}
                totalRefunded={stats.totalRefundAmount}
                year={year}
              />
            </motion.div>
          )}

          {activeTab === 'allyears' && (
            <motion.div
              key="allyears"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Yearly Chart */}
              <div className="bg-amazon-navy/30 rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Spending by Year
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  Click on a year to see transactions
                </p>
                <YearlySpendingChart
                  yearlyData={yearlyData}
                  selectedYear={selectedYearIndex}
                  onYearClick={handleYearClick}
                />
              </div>

              {/* Yearly Transactions Table (when year selected) */}
              <AnimatePresence>
                {selectedYearIndex !== null && yearlyData[selectedYearIndex] && (
                  <YearlyTransactionsTable
                    yearData={yearlyData[selectedYearIndex]}
                    onClose={() => setSelectedYearIndex(null)}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Over button */}
        <div className="flex justify-end mt-12 mb-8">
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm text-red-400 border border-red-400/30 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            Start Over
          </button>
        </div>
      </main>
    </div>
  );
}
