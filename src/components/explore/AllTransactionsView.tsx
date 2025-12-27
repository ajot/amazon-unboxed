import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ProcessedOrder } from '../../types';
import { formatCurrency } from '../../utils/dataProcessor';
import {
  sortBy,
  filterOrders,
  paginate,
  formatTableDate,
  getTotalPages,
  type SortDirection,
} from '../../utils/tableUtils';

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

interface AllTransactionsViewProps {
  orders: ProcessedOrder[];
  primaryCurrency?: string;
}

type SortKey = 'orderDate' | 'productName' | 'totalOwed' | 'quantity';

export function AllTransactionsView({ orders, primaryCurrency = 'USD' }: AllTransactionsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('orderDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const perPage = 20;

  // Filter and sort
  const processedOrders = useMemo(() => {
    const filtered = filterOrders(orders, searchTerm);
    return sortBy(filtered, sortKey, sortDirection);
  }, [orders, searchTerm, sortKey, sortDirection]);

  // Paginate
  const { items: paginatedOrders, pagination } = useMemo(() => {
    return paginate(processedOrders, page, perPage);
  }, [processedOrders, page]);

  const totalPages = getTotalPages(pagination);

  // Handle sort
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
    setPage(1);
  };

  // Sort indicator
  const SortIndicator = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return null;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div>
      {/* Summary Card */}
      <div className="bg-amazon-navy/50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amazon-orange text-sm">All Transactions ({primaryCurrency} only)</p>
            <p className="text-3xl font-bold text-amazon-orange">
              {formatCurrency(orders
                .filter(o => (o.currency || 'USD') === primaryCurrency)
                .reduce((sum, o) => sum + o.totalOwed, 0))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Total Orders</p>
            <p className="text-2xl font-semibold text-white">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by product name or order ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-96 px-4 py-3 bg-amazon-navy/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amazon-orange focus:ring-amazon-orange focus:ring-1 transition-colors"
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-400 mb-4">
        {pagination.total} transaction{pagination.total !== 1 ? 's' : ''} found
      </p>

      {/* Table */}
      <div className="bg-amazon-navy/30 rounded-xl overflow-hidden">
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
                  onClick={() => handleSort('totalOwed')}
                  className="text-right p-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                >
                  Price
                  <SortIndicator columnKey="totalOwed" />
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
              {paginatedOrders.map((order, idx) => (
                <motion.tr
                  key={`${order.orderId}-${order.asin}-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 text-sm text-white whitespace-nowrap">
                    {formatTableDate(order.orderDate)}
                  </td>
                  <td className="p-4 text-sm text-white">
                    <div className="max-w-md truncate" title={order.productName}>
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
                      <span className="text-xs text-gray-500">
                        {order.orderId}
                      </span>
                    </div>
                  </td>
                  <td className={`p-4 text-sm text-right whitespace-nowrap ${
                    order.currency && order.currency !== 'USD'
                      ? 'text-purple-300'
                      : 'text-white'
                  }`}>
                    {formatWithCurrency(order.totalOwed, order.currency)}
                  </td>
                  <td className="p-4 text-sm text-white text-right">
                    {order.quantity}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedOrders.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No transactions found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg transition-colors ${
              page === 1
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            ← Prev
          </button>
          <span className="text-gray-400 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg transition-colors ${
              page === totalPages
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
