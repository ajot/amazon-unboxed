import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ProcessedOrder } from '../../types';
import { formatCurrency, isLikelyBook } from '../../utils/dataProcessor';
import {
  sortBy,
  paginate,
  formatTableDate,
  getTotalPages,
  type SortDirection,
} from '../../utils/tableUtils';
import { BooksChart } from './BooksChart';
import { MONTHS_FULL, LIMITS, BOOK_FORMAT_STYLES } from '../../config';
import { ChevronLeftIcon, ChevronRightIcon } from '../Icons';

type BookFormat = 'kindle' | 'audible' | 'physical';

function getBookFormat(order: ProcessedOrder): BookFormat {
  if (!order.isDigital) {
    return 'physical';
  }
  const publisher = order.publisher?.toLowerCase() || '';
  if (publisher.includes('audible')) {
    return 'audible';
  }
  return 'kindle';
}

interface BooksViewProps {
  orders: ProcessedOrder[];
}

type SortKey = 'orderDate' | 'productName' | 'totalOwed';

export function BooksView({ orders }: BooksViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('orderDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const perPage = LIMITS.itemsPerPage;

  const handleMonthClick = (monthIndex: number) => {
    setSelectedMonth((prev) => (prev === monthIndex ? null : monthIndex));
    setPage(1);
  };

  // Filter to books only, then apply search and month filter
  const processedBooks = useMemo(() => {
    let books = orders.filter((o) => isLikelyBook(o.productName, o.publisher));

    // Filter by selected month
    if (selectedMonth !== null) {
      books = books.filter((book) => book.orderDate.getMonth() === selectedMonth);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      books = books.filter(
        (book) =>
          book.productName.toLowerCase().includes(term) ||
          book.orderId.toLowerCase().includes(term) ||
          (book.publisher && book.publisher.toLowerCase().includes(term))
      );
    }

    return sortBy(books, sortKey, sortDirection);
  }, [orders, searchTerm, sortKey, sortDirection, selectedMonth]);

  // Paginate
  const { items: paginatedBooks, pagination } = useMemo(() => {
    return paginate(processedBooks, page, perPage);
  }, [processedBooks, page]);

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

  // Get all books for chart (unfiltered by search)
  const allBooks = useMemo(() => {
    return orders.filter((o) => isLikelyBook(o.productName, o.publisher));
  }, [orders]);

  return (
    <div>
      {/* Chart */}
      <div className="bg-amazon-navy/50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-amazon-orange">
            Books by Month
          </h2>
          <p className="text-sm text-gray-400">
            Click a bar to filter the table
          </p>
        </div>
        <BooksChart
          books={allBooks}
          selectedMonth={selectedMonth}
          onMonthClick={handleMonthClick}
        />
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search books by title, publisher, or order ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-96 px-4 py-3 bg-amazon-navy/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amazon-orange focus:ring-amazon-orange focus:ring-1 transition-colors"
        />
      </div>

      {/* Results count and filter indicator */}
      <div className="flex items-center gap-3 mb-4">
        <p className="text-sm text-gray-400">
          {pagination.total} book{pagination.total !== 1 ? 's' : ''} found
        </p>
        {selectedMonth !== null && (
          <button
            onClick={() => setSelectedMonth(null)}
            className="text-sm px-3 py-1 bg-amazon-orange/20 text-amazon-orange rounded-full hover:bg-amazon-orange/30 transition-colors flex items-center gap-1"
          >
            {MONTHS_FULL[selectedMonth]}
            <span className="text-xs">✕</span>
          </button>
        )}
      </div>

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
                  Title
                  <SortIndicator columnKey="productName" />
                </th>
                <th
                  onClick={() => handleSort('totalOwed')}
                  className="text-right p-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                >
                  Price
                  <SortIndicator columnKey="totalOwed" />
                </th>
                <th className="text-center p-4 text-sm font-medium text-gray-400">
                  Format
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedBooks.map((book, idx) => (
                <motion.tr
                  key={`${book.orderId}-${book.asin}-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 text-sm text-white whitespace-nowrap">
                    {formatTableDate(book.orderDate)}
                  </td>
                  <td className="p-4 text-sm text-white">
                    <div className="max-w-md truncate" title={book.productName}>
                      {book.productName}
                    </div>
                    {book.publisher && (
                      <div className="text-xs text-gray-500 mt-1">
                        {book.publisher}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-white text-right whitespace-nowrap">
                    {formatCurrency(book.totalOwed)}
                  </td>
                  <td className="p-4 text-sm text-center">
                    {(() => {
                      const format = getBookFormat(book);
                      const style = BOOK_FORMAT_STYLES[format];
                      return (
                        <span className={`text-xs px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                      );
                    })()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedBooks.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            {searchTerm ? 'No books match your search' : 'No books found'}
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
