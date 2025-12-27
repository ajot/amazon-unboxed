import type { ProcessedOrder, EnrichedRefund } from '../types';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

export interface PaginationState {
  page: number;
  perPage: number;
  total: number;
}

/**
 * Sort an array by a key
 */
export function sortBy<T>(
  data: T[],
  key: keyof T,
  direction: SortDirection = 'desc'
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    // Handle dates
    if (aVal instanceof Date && bVal instanceof Date) {
      return direction === 'asc'
        ? aVal.getTime() - bVal.getTime()
        : bVal.getTime() - aVal.getTime();
    }

    // Handle numbers
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Handle strings
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    if (direction === 'asc') {
      return aStr.localeCompare(bStr);
    }
    return bStr.localeCompare(aStr);
  });
}

/**
 * Filter orders by search term (matches product name)
 */
export function filterOrders(
  orders: ProcessedOrder[],
  searchTerm: string
): ProcessedOrder[] {
  if (!searchTerm.trim()) return orders;

  const term = searchTerm.toLowerCase();
  return orders.filter(
    (order) =>
      order.productName.toLowerCase().includes(term) ||
      order.orderId.toLowerCase().includes(term)
  );
}

/**
 * Filter refunds by search term
 */
export function filterRefunds(
  refunds: EnrichedRefund[],
  searchTerm: string
): EnrichedRefund[] {
  if (!searchTerm.trim()) return refunds;

  const term = searchTerm.toLowerCase();
  return refunds.filter(
    (refund) =>
      (refund.productName?.toLowerCase().includes(term)) ||
      refund.orderId.toLowerCase().includes(term)
  );
}

/**
 * Paginate an array
 */
export function paginate<T>(
  data: T[],
  page: number,
  perPage: number
): { items: T[]; pagination: PaginationState } {
  const total = data.length;
  const totalPages = Math.ceil(total / perPage);
  const safePage = Math.min(Math.max(1, page), totalPages || 1);

  const start = (safePage - 1) * perPage;
  const end = start + perPage;
  const items = data.slice(start, end);

  return {
    items,
    pagination: {
      page: safePage,
      perPage,
      total,
    },
  };
}

/**
 * Format date for table display
 */
export function formatTableDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get total pages from pagination state
 */
export function getTotalPages(pagination: PaginationState): number {
  return Math.ceil(pagination.total / pagination.perPage);
}
