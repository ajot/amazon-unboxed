import type { WrappedStats, ProcessedData, ProcessedOrder, ProcessedRefund, EnrichedRefund, MonthlyData, ParsedFile } from '../types';

const DATA_STORAGE_KEY = 'amazon-wrapped-data';

// Compact yearly summary for persistence (small footprint)
interface StoredYearlySummary {
  year: number;
  totalSpend: number;
  orderCount: number;
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
  allOrders?: (Omit<ProcessedOrder, 'orderDate'> & { orderDate: string })[];
  allRefunds?: (Omit<ProcessedRefund, 'refundDate'> & { refundDate: string })[];
  parsedFiles?: ParsedFile[];
  availableYears?: number[];
  selectedYear?: number;
  yearlyData?: StoredYearlySummary[];  // Compact summary that always persists
  savedAt: string;
}

/**
 * Compute compact yearly summary from orders
 */
function computeYearlySummary(orders: ProcessedOrder[]): StoredYearlySummary[] {
  const ordersByYear = new Map<number, { totalSpend: number; orderCount: number }>();
  for (const order of orders) {
    const year = order.orderDate.getFullYear();
    if (!ordersByYear.has(year)) {
      ordersByYear.set(year, { totalSpend: 0, orderCount: 0 });
    }
    const yearData = ordersByYear.get(year)!;
    yearData.totalSpend += order.totalOwed;
    yearData.orderCount += 1;
  }
  return Array.from(ordersByYear.entries())
    .map(([year, data]) => ({ year, ...data }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Store processed data in localStorage
 */
export function storeData(
  stats: WrappedStats,
  processedData: ProcessedData,
  allOrders?: ProcessedOrder[],
  allRefunds?: ProcessedRefund[],
  parsedFiles?: ParsedFile[],
  availableYears?: number[],
  selectedYear?: number
): void {
  try {
    // Compute compact yearly summary (always persists, ~1KB)
    const yearlyData = allOrders ? computeYearlySummary(allOrders) : undefined;

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
      allOrders: allOrders?.map(o => ({
        ...o,
        orderDate: o.orderDate.toISOString(),
      })),
      allRefunds: allRefunds?.map(r => ({
        ...r,
        refundDate: r.refundDate.toISOString(),
      })),
      parsedFiles,
      availableYears,
      selectedYear,
      yearlyData,
      savedAt: new Date().toISOString(),
    };

    const jsonData = JSON.stringify(dataToStore);
    // Check size before storing (localStorage limit is ~5MB)
    let sizeInMB = new Blob([jsonData]).size / (1024 * 1024);

    if (sizeInMB > 4.5) {
      // Data too large, progressively drop data to fit
      dataToStore.parsedFiles = undefined;
      const reducedJson = JSON.stringify(dataToStore);
      sizeInMB = new Blob([reducedJson]).size / (1024 * 1024);

      if (sizeInMB > 4.5) {
        // Still too large, drop allOrders but keep yearlyData summary
        dataToStore.allOrders = undefined;
        let finalJson = JSON.stringify(dataToStore);
        let finalSize = new Blob([finalJson]).size / (1024 * 1024);

        if (finalSize > 4.5) {
          // Clear monthlyData orders as last resort
          dataToStore.processedData.monthlyData = dataToStore.processedData.monthlyData.map(m => ({
            ...m,
            orders: [],
          }));
          finalJson = JSON.stringify(dataToStore);
        }

        localStorage.setItem(DATA_STORAGE_KEY, finalJson);
      } else {
        localStorage.setItem(DATA_STORAGE_KEY, reducedJson);
      }
    } else {
      localStorage.setItem(DATA_STORAGE_KEY, jsonData);
    }
  } catch {
    // Storage failed silently - data won't persist but app continues working
  }
}

// YearlyData with empty orders array for fallback display
export interface StoredYearlyData {
  year: number;
  totalSpend: number;
  orderCount: number;
  orders: ProcessedOrder[];  // Will be empty when restored from summary
}

export interface StoredDataResult {
  stats: WrappedStats;
  processedData: ProcessedData;
  allOrders?: ProcessedOrder[];
  allRefunds?: ProcessedRefund[];
  parsedFiles?: ParsedFile[];
  availableYears?: number[];
  selectedYear?: number;
  yearlyData?: StoredYearlyData[];  // Compact summary with empty orders
}

/**
 * Get stored data from localStorage
 */
export function getStoredData(): StoredDataResult | null {
  try {
    const stored = localStorage.getItem(DATA_STORAGE_KEY);
    if (!stored) {
      return null;
    }

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

    // Convert allOrders date strings back to Date objects
    const allOrders = data.allOrders?.map(o => ({
      ...o,
      orderDate: new Date(o.orderDate),
    }));

    // Convert allRefunds date strings back to Date objects
    const allRefunds = data.allRefunds?.map(r => ({
      ...r,
      refundDate: new Date(r.refundDate),
    }));

    // Convert yearlyData summary to full format with empty orders
    const yearlyData = data.yearlyData?.map(y => ({
      year: y.year,
      totalSpend: y.totalSpend,
      orderCount: y.orderCount,
      orders: [] as ProcessedOrder[],  // Empty - transactions not available from summary
    }));

    return {
      stats: data.stats,
      processedData,
      allOrders,
      allRefunds,
      parsedFiles: data.parsedFiles,
      availableYears: data.availableYears,
      selectedYear: data.selectedYear,
      yearlyData,
    };
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

