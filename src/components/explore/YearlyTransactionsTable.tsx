import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { YearlyData } from '../../types';
import { formatCurrency } from '../../utils/dataProcessor';
import { formatTableDate, sortBy, type SortDirection } from '../../utils/tableUtils';

// Format currency with proper symbol based on currency code
function formatWithCurrency(amount: number, currency?: string): string {
  const currencyCode = currency || 'USD';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback if currency code is invalid
    return `${currencyCode} ${amount.toLocaleString()}`;
  }
}

interface YearlyTransactionsTableProps {
  yearData: YearlyData;
  onClose: () => void;
}

type SortKey = 'orderDate' | 'productName' | 'unitPrice' | 'quantity';

export function YearlyTransactionsTable({
  yearData,
  onClose,
}: YearlyTransactionsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('orderDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedOrders = useMemo(() => {
    return sortBy(yearData.orders, sortKey, sortDirection);
  }, [yearData.orders, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const SortIndicator = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return null;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-amazon-navy/30 rounded-xl overflow-hidden"
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {yearData.year} Transactions
          </h3>
          <p className="text-sm text-gray-400">
            {yearData.orderCount} orders · {formatCurrency(yearData.totalSpend)}
            {yearData.primaryCurrency && yearData.primaryCurrency !== 'USD' && (
              <span className="ml-2 text-purple-300">({yearData.primaryCurrency} only)</span>
            )}
            {yearData.primaryCurrency === 'USD' && yearData.orders.some(o => o.currency && o.currency !== 'USD') && (
              <span className="ml-2 text-gray-500">(USD only)</span>
            )}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-2"
        >
          ✕
        </button>
      </div>

      <div className="overflow-x-auto max-h-96">
        <table className="w-full">
          <thead className="sticky top-0 bg-amazon-navy">
            <tr className="border-b border-white/10">
              <th
                onClick={() => handleSort('orderDate')}
                className="text-left p-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
              >
                Date
                <SortIndicator columnKey="orderDate" />
              </th>
              <th
                onClick={() => handleSort('productName')}
                className="text-left p-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
              >
                Product
                <SortIndicator columnKey="productName" />
              </th>
              <th
                onClick={() => handleSort('unitPrice')}
                className="text-right p-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
              >
                Price
                <SortIndicator columnKey="unitPrice" />
              </th>
              <th
                onClick={() => handleSort('quantity')}
                className="text-right p-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
              >
                Qty
                <SortIndicator columnKey="quantity" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order, idx) => (
              <motion.tr
                key={`${order.orderId}-${order.asin}-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="p-4 text-sm text-white whitespace-nowrap">
                  {formatTableDate(order.orderDate)}
                </td>
                <td className="p-4 text-sm text-white">
                  <div className="max-w-xs truncate" title={order.productName}>
                    {order.productName}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {order.isDigital && (
                      <span className="text-xs px-2 py-0.5 bg-amazon-orange/20 text-amazon-orange rounded">
                        Digital
                      </span>
                    )}
                    {order.currency && order.currency !== 'USD' && (
                      <span className="text-xs px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-full font-medium">
                        {order.currency}
                      </span>
                    )}
                  </div>
                </td>
                <td className={`p-4 text-sm text-right whitespace-nowrap ${
                  order.currency && order.currency !== 'USD'
                    ? 'text-purple-300'
                    : 'text-white'
                }`}>
                  {formatWithCurrency(order.unitPrice, order.currency)}
                </td>
                <td className="p-4 text-sm text-white text-right">
                  {order.quantity}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {yearData.orders.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          No transactions for this year
        </div>
      )}
    </motion.div>
  );
}
