import type { WrappedStats, ProcessedData, ProcessedOrder, ProcessedRefund, EnrichedRefund, MonthlyData } from '../types';

const EMAIL_STORAGE_KEY = 'amazon-wrapped-email';
const DATA_STORAGE_KEY = 'amazon-wrapped-data';

/**
 * Get stored email from localStorage
 */
export function getStoredEmail(): string | null {
  try {
    return localStorage.getItem(EMAIL_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Store email in localStorage
 */
export function storeEmail(email: string): void {
  try {
    localStorage.setItem(EMAIL_STORAGE_KEY, email);
  } catch {
    console.warn('Failed to store email in localStorage');
  }
}


// Data persistence types
interface StoredData {
  stats: WrappedStats;
  processedData: {
    orders: (Omit<ProcessedOrder, 'orderDate'> & { orderDate: string })[];
    refunds: (Omit<ProcessedRefund, 'refundDate'> & { refundDate: string })[];
    enrichedRefunds: (Omit<EnrichedRefund, 'refundDate' | 'originalOrder'> & {
      refundDate: string;
      originalOrder?: Omit<ProcessedOrder, 'orderDate'> & { orderDate: string };
    })[];
    monthlyData: (Omit<MonthlyData, 'orders'> & {
      orders: (Omit<ProcessedOrder, 'orderDate'> & { orderDate: string })[];
    })[];
  };
  savedAt: string;
}

/**
 * Store processed data in localStorage
 */
export function storeData(stats: WrappedStats, processedData: ProcessedData): void {
  try {
    const dataToStore: StoredData = {
      stats,
      processedData: {
        orders: processedData.orders.map(o => ({
          ...o,
          orderDate: o.orderDate.toISOString(),
        })),
        refunds: processedData.refunds.map(r => ({
          ...r,
          refundDate: r.refundDate.toISOString(),
        })),
        enrichedRefunds: processedData.enrichedRefunds.map(r => ({
          ...r,
          refundDate: r.refundDate.toISOString(),
          originalOrder: r.originalOrder ? {
            ...r.originalOrder,
            orderDate: r.originalOrder.orderDate.toISOString(),
          } : undefined,
        })),
        monthlyData: processedData.monthlyData.map(m => ({
          ...m,
          orders: m.orders.map(o => ({
            ...o,
            orderDate: o.orderDate.toISOString(),
          })),
        })),
      },
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (e) {
    console.warn('Failed to store data in localStorage:', e);
  }
}

/**
 * Get stored data from localStorage
 */
export function getStoredData(): { stats: WrappedStats; processedData: ProcessedData } | null {
  try {
    const stored = localStorage.getItem(DATA_STORAGE_KEY);
    if (!stored) return null;

    const data: StoredData = JSON.parse(stored);

    // Convert date strings back to Date objects
    const processedData: ProcessedData = {
      orders: data.processedData.orders.map(o => ({
        ...o,
        orderDate: new Date(o.orderDate),
      })),
      refunds: data.processedData.refunds.map(r => ({
        ...r,
        refundDate: new Date(r.refundDate),
      })),
      enrichedRefunds: data.processedData.enrichedRefunds.map(r => ({
        ...r,
        refundDate: new Date(r.refundDate),
        originalOrder: r.originalOrder ? {
          ...r.originalOrder,
          orderDate: new Date(r.originalOrder.orderDate),
        } : undefined,
      })),
      monthlyData: data.processedData.monthlyData.map(m => ({
        ...m,
        orders: m.orders.map(o => ({
          ...o,
          orderDate: new Date(o.orderDate),
        })),
      })),
    };

    return { stats: data.stats, processedData };
  } catch (e) {
    console.warn('Failed to retrieve stored data:', e);
    return null;
  }
}

/**
 * Clear all stored data
 */
export function clearStoredData(): void {
  try {
    localStorage.removeItem(DATA_STORAGE_KEY);
  } catch {
    console.warn('Failed to clear stored data');
  }
}

