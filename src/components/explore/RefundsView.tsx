import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { EnrichedRefund } from '../../types';
import { formatCurrency } from '../../utils/dataProcessor';
import {
  sortBy,
  filterRefunds,
  paginate,
  formatTableDate,
  getTotalPages,
  type SortDirection,
} from '../../utils/tableUtils';
import { ChevronLeftIcon, ChevronRightIcon } from '../Icons';

interface RefundsViewProps {
  refunds: EnrichedRefund[];
  totalRefunded: number;
  year: number;
}

type SortKey = 'refundDate' | 'productName' | 'amountRefunded';

export function RefundsView({ refunds, totalRefunded, year }: RefundsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('refundDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const perPage = 20;

  // Filter and sort
  const processedRefunds = useMemo(() => {
    const filtered = filterRefunds(refunds, searchTerm);
    return sortBy(filtered, sortKey, sortDirection);
  }, [refunds, searchTerm, sortKey, sortDirection]);

  // Paginate
  const { items: paginatedRefunds, pagination } = useMemo(() => {
    return paginate(processedRefunds, page, perPage);
  }, [processedRefunds, page]);

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
            <p className="text-amazon-orange text-sm">Total Refunded in {year}</p>
            <p className="text-3xl font-bold text-amazon-orange">
              {formatCurrency(totalRefunded)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Refunds</p>
            <p className="text-2xl font-semibold text-white">{refunds.length}</p>
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
        {pagination.total} refund{pagination.total !== 1 ? 's' : ''} found
      </p>

      {/* Table */}
      <div className="bg-amazon-navy/30 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th
                  onClick={() => handleSort('refundDate')}
                  className="text-left p-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                >
                  Refund Date
                  <SortIndicator columnKey="refundDate" />
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">
                  Order ID
                </th>
                <th
                  onClick={() => handleSort('productName')}
                  className="text-left p-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                >
                  Product
                  <SortIndicator columnKey="productName" />
                </th>
                <th
                  onClick={() => handleSort('amountRefunded')}
                  className="text-right p-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                >
                  Amount
                  <SortIndicator columnKey="amountRefunded" />
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRefunds.map((refund, idx) => (
                <motion.tr
                  key={`${refund.orderId}-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 text-sm text-white whitespace-nowrap">
                    {formatTableDate(refund.refundDate)}
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {refund.orderId}
                  </td>
                  <td className="p-4 text-sm text-white">
                    {refund.productName ? (
                      <div
                        className="max-w-md truncate"
                        title={refund.productName}
                      >
                        {refund.productName}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">
                        Product info not available
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-green-400 text-right whitespace-nowrap font-medium">
                    +{formatCurrency(refund.amountRefunded)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedRefunds.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            {refunds.length === 0
              ? `No refunds recorded in ${year}`
              : 'No refunds match your search'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${
              page === 1
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <ChevronLeftIcon size={16} /> Prev
          </button>
          <span className="text-gray-400 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${
              page === totalPages
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Next <ChevronRightIcon size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
