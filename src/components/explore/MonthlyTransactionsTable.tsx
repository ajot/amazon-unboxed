import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { MonthlyData } from '../../types';
import { formatCurrency, formatWithCurrency } from '../../utils/dataProcessor';
import { formatTableDate, sortBy, type SortDirection } from '../../utils/tableUtils';

interface MonthlyTransactionsTableProps {
  monthData: MonthlyData;
  onClose: () => void;
}

type SortKey = 'orderDate' | 'productName' | 'unitPrice' | 'quantity';

export function MonthlyTransactionsTable({
  monthData,
  onClose,
}: MonthlyTransactionsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('orderDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedOrders = useMemo(() => {
    return sortBy(monthData.orders, sortKey, sortDirection);
  }, [monthData.orders, sortKey, sortDirection]);

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
            {monthData.month} Transactions
          </h3>
          <p className="text-sm text-gray-400">
            {monthData.orderCount} orders · {formatCurrency(monthData.totalSpend)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-2"
        >
          ✕
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
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
                transition={{ delay: idx * 0.02 }}
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

      {monthData.orders.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          No transactions for this month
        </div>
      )}
    </motion.div>
  );
}
