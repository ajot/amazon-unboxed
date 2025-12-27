import type { WrappedStats, ProcessedData, ProcessedOrder, ProcessedRefund, EnrichedRefund, MonthlyData, ParsedFile } from '../types';

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
    console.log('[Storage] storeData called:', {
      processedDataOrders: processedData.orders.length,
      allOrders: allOrders?.length,
      allRefunds: allRefunds?.length,
      selectedYear,
    });
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
    console.log(`[Storage] Initial data size: ${sizeInMB.toFixed(2)}MB, yearlyData entries: ${yearlyData?.length || 0}`);

    if (sizeInMB > 4.5) {
      console.warn(`[Storage] Data size (${sizeInMB.toFixed(2)}MB) approaching localStorage limit. Dropping parsedFiles.`);
      dataToStore.parsedFiles = undefined;
      const reducedJson = JSON.stringify(dataToStore);
      sizeInMB = new Blob([reducedJson]).size / (1024 * 1024);
      console.log(`[Storage] After dropping parsedFiles: ${sizeInMB.toFixed(2)}MB`);

      if (sizeInMB > 4.5) {
        console.warn(`[Storage] Still too large (${sizeInMB.toFixed(2)}MB). Dropping allOrders, keeping yearlyData summary.`);
        dataToStore.allOrders = undefined;
        let finalJson = JSON.stringify(dataToStore);
        let finalSize = new Blob([finalJson]).size / (1024 * 1024);
        console.log(`[Storage] After dropping allOrders: ${finalSize.toFixed(2)}MB`);

        // If STILL too large, also clear monthlyData orders (keep aggregates only)
        if (finalSize > 4.5) {
          console.warn(`[Storage] Still too large. Clearing monthlyData orders.`);
          dataToStore.processedData.monthlyData = dataToStore.processedData.monthlyData.map(m => ({
            ...m,
            orders: [],
          }));
          finalJson = JSON.stringify(dataToStore);
          finalSize = new Blob([finalJson]).size / (1024 * 1024);
          console.log(`[Storage] After clearing monthlyData orders: ${finalSize.toFixed(2)}MB`);
        }

        // yearlyData stays - it's tiny and ensures All Years chart works
        localStorage.setItem(DATA_STORAGE_KEY, finalJson);
        console.log('[Storage] Saved with reduced data');
      } else {
        localStorage.setItem(DATA_STORAGE_KEY, reducedJson);
        console.log('[Storage] Saved without parsedFiles');
      }
    } else {
      localStorage.setItem(DATA_STORAGE_KEY, jsonData);
      console.log('[Storage] Saved full data');
    }
  } catch (e) {
    console.error('[Storage] Failed to store data in localStorage:', e);
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
      console.log('[Storage] No stored data found');
      return null;
    }
    console.log(`[Storage] Retrieved data size: ${(new Blob([stored]).size / (1024 * 1024)).toFixed(2)}MB`);

    const data: StoredData = JSON.parse(stored);
    console.log(`[Storage] Retrieved: allOrders=${data.allOrders?.length || 0}, yearlyData=${data.yearlyData?.length || 0}, parsedFiles=${data.parsedFiles?.length || 0}`);

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

