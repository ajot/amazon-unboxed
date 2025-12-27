import type {
  ParsedFile,
  ProcessedOrder,
  ProcessedRefund,
  WrappedStats,
  MonthlyData,
  EnrichedRefund,
  ProcessedData,
  CalculateStatsResult,
} from '../types';
import {
  parseAmazonDate,
  parseCurrency,
  isRetailOrderRow,
  isRefundPaymentRow,
  isDigitalItemRow,
} from './csvParser';
import {
  LOCALE,
  CURRENCY,
  LIMITS,
  MONTHS_FULL,
  DAYS_FULL,
  BOOK_PUBLISHERS,
  SUBSCRIPTION_EXCLUSIONS,
  PRODUCT_EXCLUSIONS,
  STRONG_BOOK_INDICATORS,
  MEDIUM_BOOK_INDICATORS,
  BOOK_SERIES_PATTERN,
  BOOK_SERIES_PAREN_PATTERN,
} from '../config';

/**
 * Detect if a product is likely a book based on product name and publisher
 */
export function isLikelyBook(productName: string, publisher?: string): boolean {
  const name = productName.toLowerCase();

  // Subscription/membership exclusions - check first before publisher
  if (SUBSCRIPTION_EXCLUSIONS.some(sub => name.includes(sub))) {
    return false;
  }

  // Check publisher - if from a known book publisher, it's likely a book
  if (publisher) {
    const pub = publisher.toLowerCase();
    // Skip generic/non-book publishers
    if (pub !== 'vendor details not available' &&
        pub !== 'amazon.com services, inc' &&
        pub !== 'amazon.com services, inc.') {
      if (BOOK_PUBLISHERS.some(bookPub => pub.includes(bookPub))) {
        return true;
      }
    }
  }

  // Exclusion patterns - definitely NOT books
  if (PRODUCT_EXCLUSIONS.some(exclusion => name.includes(exclusion))) {
    return false;
  }

  // Strong indicators - these are almost certainly books
  if (STRONG_BOOK_INDICATORS.some(indicator => name.includes(indicator))) {
    return true;
  }

  // Check for common book title patterns
  // e.g., "Title (Series Book 1)" or "Book 2"
  if (BOOK_SERIES_PATTERN.test(name) || BOOK_SERIES_PAREN_PATTERN.test(name)) {
    return true;
  }

  // Medium-strength indicators (literary terms)
  return MEDIUM_BOOK_INDICATORS.some(indicator => name.includes(indicator));
}

/**
 * Process retail order rows into normalized orders
 */
function processRetailOrders(data: unknown[]): ProcessedOrder[] {
  return data
    .filter(isRetailOrderRow)
    .map((row) => {
      const orderDate = parseAmazonDate(row['Order Date']);
      if (!orderDate) return null;

      return {
        orderId: row['Order ID'],
        orderDate,
        totalOwed: parseCurrency(row['Total Owed']),
        unitPrice: parseCurrency(row['Unit Price']),
        productName: row['Product Name'] || 'Unknown Item',
        quantity: parseInt(row['Quantity']) || 1,
        asin: row['ASIN'],
        currency: row['Currency'] || 'USD',
        isDigital: false,
      };
    })
    .filter((order): order is ProcessedOrder => order !== null);
}

/**
 * Process digital item rows into normalized orders
 */
function processDigitalOrders(data: unknown[]): ProcessedOrder[] {
  return data
    .filter(isDigitalItemRow)
    .map((row) => {
      const orderDate = parseAmazonDate(row['OrderDate']);
      if (!orderDate) return null;

      // For Audible credit purchases, OurPrice is 0 but ListPriceAmount has actual value
      const ourPrice = parseCurrency(row['OurPrice']);
      const listPrice = parseCurrency(row['ListPriceAmount'] || '0');
      const price = ourPrice > 0 ? ourPrice : listPrice;

      // Use SellerOfRecord for publisher if it's meaningful (e.g., "Audible")
      // Fall back to Publisher field
      const sellerOfRecord = row['SellerOfRecord'];
      const publisher = row['Publisher'];
      const effectivePublisher =
        (sellerOfRecord && sellerOfRecord !== 'Not Applicable' && sellerOfRecord !== 'Vendor Details Not Available')
          ? sellerOfRecord
          : (publisher && publisher !== 'Not Applicable' ? publisher : undefined);

      return {
        orderId: row['OrderId'],
        orderDate,
        totalOwed: price,
        unitPrice: price,
        productName: row['ProductName'] || 'Unknown Digital Item',
        quantity: parseInt(row['QuantityOrdered']) || 1,
        asin: row['ASIN'],
        currency: 'USD',
        isDigital: true,
        publisher: effectivePublisher,
      } as ProcessedOrder;
    })
    .filter((order): order is ProcessedOrder => order !== null);
}

/**
 * Process refund payment rows
 */
function processRefunds(data: unknown[]): ProcessedRefund[] {
  return data
    .filter(isRefundPaymentRow)
    .map((row) => {
      const refundDate = parseAmazonDate(row['RefundCompletionDate']);
      if (!refundDate) return null;

      return {
        orderId: row['OrderID'],
        amountRefunded: parseCurrency(row['AmountRefunded']),
        refundDate,
        currency: row['Currency'] || 'USD',
      };
    })
    .filter((refund): refund is ProcessedRefund => refund !== null);
}

/**
 * Get all available years from parsed files (before filtering)
 * Returns years sorted descending (most recent first)
 */
export function getAvailableYears(files: ParsedFile[]): number[] {
  const years = new Set<number>();

  for (const file of files) {
    switch (file.type) {
      case 'retail_orders':
        for (const row of file.data) {
          if (isRetailOrderRow(row)) {
            const date = parseAmazonDate(row['Order Date']);
            if (date) years.add(date.getFullYear());
          }
        }
        break;
      case 'digital_items':
        for (const row of file.data) {
          if (isDigitalItemRow(row)) {
            const date = parseAmazonDate(row['OrderDate']);
            if (date) years.add(date.getFullYear());
          }
        }
        break;
      case 'refund_payments':
        for (const row of file.data) {
          if (isRefundPaymentRow(row)) {
            const date = parseAmazonDate(row['RefundCompletionDate']);
            if (date) years.add(date.getFullYear());
          }
        }
        break;
    }
  }

  return Array.from(years).sort((a, b) => b - a);
}

/**
 * Filter orders to target year only
 */
function filterToTargetYear<T extends { orderDate?: Date; refundDate?: Date }>(
  data: T[],
  targetYear: number
): T[] {
  return data.filter((item) => {
    const date = 'orderDate' in item ? item.orderDate : item.refundDate;
    return date && date.getFullYear() === targetYear;
  });
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat(LOCALE).format(Math.round(num));
}

/**
 * Format decimal to one decimal place
 */
export function formatDecimal(num: number): string {
  return num.toFixed(1);
}

/**
 * Format percentage
 */
export function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`;
}

/**
 * Calculate all wrapped statistics and preserve processed data for exploration
 */
export function calculateStatsWithData(files: ParsedFile[], targetYear: number): CalculateStatsResult {
  // Extract and process data from files
  let allOrders: ProcessedOrder[] = [];
  let allRefunds: ProcessedRefund[] = [];

  for (const file of files) {
    switch (file.type) {
      case 'retail_orders':
        allOrders = [...allOrders, ...processRetailOrders(file.data)];
        break;
      case 'digital_items':
        allOrders = [...allOrders, ...processDigitalOrders(file.data)];
        break;
      case 'refund_payments':
        allRefunds = [...allRefunds, ...processRefunds(file.data)];
        break;
    }
  }

  // Filter to target year
  const filteredOrders = filterToTargetYear(allOrders, targetYear);
  const filteredRefunds = filterToTargetYear(allRefunds, targetYear);

  // Dedupe orders by orderId + productName (same item in same order)
  const uniqueOrderKeys = new Set<string>();
  const dedupedOrders = filteredOrders.filter((order) => {
    const key = `${order.orderId}-${order.asin || order.productName}`;
    if (uniqueOrderKeys.has(key)) return false;
    uniqueOrderKeys.add(key);
    return true;
  });

  // Split by type
  const retailOrders = dedupedOrders.filter((o) => !o.isDigital);
  const digitalOrders = dedupedOrders.filter((o) => o.isDigital);

  // Basic spending stats
  const totalGrossSpend = dedupedOrders.reduce((sum, o) => sum + o.totalOwed, 0);
  const totalRefunds = filteredRefunds.reduce((sum, r) => sum + r.amountRefunded, 0);
  const netSpend = totalGrossSpend - totalRefunds;

  // Item counts
  const totalItems = dedupedOrders.reduce((sum, o) => sum + o.quantity, 0);
  const totalOrders = new Set(dedupedOrders.map((o) => o.orderId)).size;

  // Averages
  const monthlyAverage = netSpend / 12;
  const averageItemCost = totalItems > 0 ? totalGrossSpend / totalItems : 0;
  const averageItemsPerMonth = totalItems / 12;
  const ordersPerDay = totalOrders / 365;

  // Monthly spending
  const monthlySpendingMap = new Map<number, number>();
  for (const order of dedupedOrders) {
    const month = order.orderDate.getMonth();
    monthlySpendingMap.set(month, (monthlySpendingMap.get(month) || 0) + order.totalOwed);
  }
  const monthlySpending = MONTHS_FULL.map((month, idx) => ({
    month,
    amount: monthlySpendingMap.get(idx) || 0,
  }));

  // Peak month
  let peakMonth = { month: 'January', amount: 0, orderCount: 0 };
  for (const [monthIdx, amount] of monthlySpendingMap) {
    if (amount > peakMonth.amount) {
      const orderCount = dedupedOrders.filter(
        (o) => o.orderDate.getMonth() === monthIdx
      ).length;
      peakMonth = { month: MONTHS_FULL[monthIdx], amount, orderCount };
    }
  }

  // Daily order counts
  const dailyOrderMap = new Map<number, number>();
  for (const order of dedupedOrders) {
    const day = order.orderDate.getDay();
    dailyOrderMap.set(day, (dailyOrderMap.get(day) || 0) + 1);
  }
  const dailyOrders = DAYS_FULL.map((day, idx) => ({
    day,
    count: dailyOrderMap.get(idx) || 0,
  }));

  // Favorite day
  let favoriteDay = { day: 'Monday', count: 0 };
  for (const [dayIdx, count] of dailyOrderMap) {
    if (count > favoriteDay.count) {
      favoriteDay = { day: DAYS_FULL[dayIdx], count };
    }
  }

  // Top items by quantity
  const itemCountMap = new Map<string, number>();
  for (const order of dedupedOrders) {
    const name = order.productName;
    itemCountMap.set(name, (itemCountMap.get(name) || 0) + order.quantity);
  }
  const topItems = Array.from(itemCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, LIMITS.topItems);

  // Top expensive items
  const topExpensiveItems = [...dedupedOrders]
    .sort((a, b) => b.unitPrice - a.unitPrice)
    .slice(0, LIMITS.topExpensive)
    .map((o) => ({ name: o.productName, price: o.unitPrice }));

  // Digital stats
  const digitalSpend = digitalOrders.reduce((sum, o) => sum + o.totalOwed, 0);
  const digitalItemCount = digitalOrders.reduce((sum, o) => sum + o.quantity, 0);

  // Top publisher
  const publisherMap = new Map<string, number>();
  for (const order of digitalOrders) {
    if (order.publisher) {
      publisherMap.set(
        order.publisher,
        (publisherMap.get(order.publisher) || 0) + order.quantity
      );
    }
  }
  let topPublisher: string | undefined;
  let maxPubCount = 0;
  for (const [pub, count] of publisherMap) {
    if (count > maxPubCount) {
      topPublisher = pub;
      maxPubCount = count;
    }
  }

  // Book stats (physical + digital)
  const allBooks = dedupedOrders.filter((o) => isLikelyBook(o.productName, o.publisher));
  const kindleBooks = allBooks.filter((o) => o.isDigital);
  const physicalBooks = allBooks.filter((o) => !o.isDigital);

  const bookCount = allBooks.reduce((sum, o) => sum + o.quantity, 0);
  const bookSpend = allBooks.reduce((sum, o) => sum + o.totalOwed, 0);
  const kindleBookCount = kindleBooks.reduce((sum, o) => sum + o.quantity, 0);
  const physicalBookCount = physicalBooks.reduce((sum, o) => sum + o.quantity, 0);

  // Top book publisher
  const bookPublisherMap = new Map<string, number>();
  for (const book of allBooks) {
    if (book.publisher) {
      bookPublisherMap.set(
        book.publisher,
        (bookPublisherMap.get(book.publisher) || 0) + book.quantity
      );
    }
  }
  let topBookPublisher: string | undefined;
  let maxBookPubCount = 0;
  for (const [pub, count] of bookPublisherMap) {
    if (count > maxBookPubCount) {
      topBookPublisher = pub;
      maxBookPubCount = count;
    }
  }

  // Top books by price
  const topBooks = [...allBooks]
    .sort((a, b) => b.unitPrice - a.unitPrice)
    .slice(0, LIMITS.topBooks)
    .map((o) => ({ name: o.productName, price: o.unitPrice }));

  // Return stats
  const returnCount = filteredRefunds.length;
  const totalRefundAmount = totalRefunds;
  const returnRate = totalOrders > 0 ? (returnCount / totalOrders) * 100 : 0;

  // Build stats object
  const stats: WrappedStats = {
    totalGrossSpend,
    totalRefunds,
    netSpend,
    monthlyAverage,
    averageItemCost,
    totalOrders,
    retailOrders: new Set(retailOrders.map((o) => o.orderId)).size,
    digitalOrders: new Set(digitalOrders.map((o) => o.orderId)).size,
    totalItems,
    averageItemsPerMonth,
    ordersPerDay,
    peakMonth,
    favoriteDay,
    monthlySpending,
    dailyOrders,
    topItems,
    topExpensiveItems,
    digitalSpend,
    digitalItemCount,
    topPublisher,
    bookCount,
    bookSpend,
    kindleBookCount,
    physicalBookCount,
    topBookPublisher,
    topBooks,
    returnCount,
    totalRefundAmount,
    returnRate,
  };

  // Build monthly data for exploration
  const monthlyData: MonthlyData[] = MONTHS_FULL.map((month, idx) => {
    const monthOrders = dedupedOrders.filter(
      (o) => o.orderDate.getMonth() === idx
    );
    return {
      month,
      monthIndex: idx,
      totalSpend: monthOrders.reduce((sum, o) => sum + o.totalOwed, 0),
      orderCount: monthOrders.length,
      orders: monthOrders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime()),
    };
  });

  // Enrich refunds with original order data
  const orderByIdMap = new Map<string, ProcessedOrder>();
  for (const order of dedupedOrders) {
    // Store first order for each orderId (there might be multiple items per order)
    if (!orderByIdMap.has(order.orderId)) {
      orderByIdMap.set(order.orderId, order);
    }
  }

  const enrichedRefunds: EnrichedRefund[] = filteredRefunds.map((refund) => {
    const originalOrder = orderByIdMap.get(refund.orderId);
    return {
      ...refund,
      originalOrder,
      productName: originalOrder?.productName,
    };
  });

  // Build processed data object
  const processedData: ProcessedData = {
    orders: dedupedOrders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime()),
    refunds: filteredRefunds.sort((a, b) => b.refundDate.getTime() - a.refundDate.getTime()),
    enrichedRefunds: enrichedRefunds.sort((a, b) => b.refundDate.getTime() - a.refundDate.getTime()),
    monthlyData,
  };

  return { stats, processedData };
}
