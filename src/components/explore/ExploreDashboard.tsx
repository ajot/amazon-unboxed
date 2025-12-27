import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WrappedStats, ProcessedData } from '../../types';
import { MonthlySpendingChart } from './MonthlySpendingChart';
import { MonthlyTransactionsTable } from './MonthlyTransactionsTable';
import { AllTransactionsView } from './AllTransactionsView';
import { RefundsView } from './RefundsView';
import { BooksView } from './BooksView';
import { formatCurrency, formatNumber } from '../../utils/dataProcessor';

type TabType = 'overview' | 'transactions' | 'books' | 'refunds';

interface ExploreDashboardProps {
  stats: WrappedStats;
  processedData: ProcessedData;
  onBack: () => void;
}

export function ExploreDashboard({
  stats,
  processedData,
  onBack,
}: ExploreDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const handleMonthClick = useCallback((monthIndex: number) => {
    setSelectedMonth((prev) => (prev === monthIndex ? null : monthIndex));
  }, []);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'All Transactions' },
    { id: 'books', label: 'Books' },
    { id: 'refunds', label: 'Refunds' },
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
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">2025 Summary</p>
              <p className="text-lg font-semibold text-amazon-orange">
                {formatCurrency(stats.netSpend)}
              </p>
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
              <AllTransactionsView orders={processedData.orders} />
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
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
