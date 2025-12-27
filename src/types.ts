// Raw CSV row types
export interface RetailOrderRow {
  'Order ID': string;
  'Order Date': string;
  'Total Owed': string;
  'Unit Price': string;
  'Product Name': string;
  'Quantity': string;
  'ASIN': string;
  'Order Status': string;
  'Currency': string;
}

export interface RefundPaymentRow {
  'OrderID': string;
  'AmountRefunded': string;
  'RefundCompletionDate': string;
  'Currency': string;
  'Status': string;
}

export interface DigitalItemRow {
  'OrderId': string;
  'OrderDate': string;
  'ProductName': string;
  'OurPrice': string;
  'Publisher': string;
  'SellerOfRecord': string;
  'QuantityOrdered': string;
  'ASIN': string;
  'ListPriceAmount'?: string;
}

// Processed data types
export interface ProcessedOrder {
  orderId: string;
  orderDate: Date;
  totalOwed: number;
  unitPrice: number;
  productName: string;
  quantity: number;
  asin: string;
  currency: string;
  isDigital: boolean;
  publisher?: string;
}

export interface ProcessedRefund {
  orderId: string;
  amountRefunded: number;
  refundDate: Date;
  currency: string;
}

// Monthly aggregated data for charts
export interface MonthlyData {
  month: string;
  monthIndex: number;
  totalSpend: number;
  orderCount: number;
  orders: ProcessedOrder[];
}

// Yearly aggregated data for all-years chart
export interface YearlyData {
  year: number;
  totalSpend: number;
  orderCount: number;
  orders: ProcessedOrder[];
  primaryCurrency?: string;
}

// Refund with matched original order
export interface EnrichedRefund extends ProcessedRefund {
  originalOrder?: ProcessedOrder;
  productName?: string;
}

// Complete processed data (preserved, not discarded)
export interface ProcessedData {
  orders: ProcessedOrder[];
  refunds: ProcessedRefund[];
  enrichedRefunds: EnrichedRefund[];
  monthlyData: MonthlyData[];
}

// Return type for data processor
export interface CalculateStatsResult {
  stats: WrappedStats;
  processedData: ProcessedData;
  allOrders: ProcessedOrder[];  // All orders across all years (for All Years chart)
  allRefunds: ProcessedRefund[];  // All refunds across all years
}

// Calculated statistics
export interface WrappedStats {
  // Spending
  totalGrossSpend: number;
  totalRefunds: number;
  netSpend: number;
  monthlyAverage: number;
  averageItemCost: number;

  // Orders
  totalOrders: number;
  retailOrders: number;
  digitalOrders: number;
  totalItems: number;
  averageItemsPerMonth: number;
  ordersPerDay: number;

  // Time-based
  peakMonth: {
    month: string;
    amount: number;
    orderCount: number;
  };
  favoriteDay: {
    day: string;
    count: number;
  };
  monthlySpending: { month: string; amount: number }[];
  dailyOrders: { day: string; count: number }[];

  // Products
  topItems: { name: string; count: number }[];
  topExpensiveItems: { name: string; price: number }[];

  // Digital
  digitalSpend: number;
  digitalItemCount: number;
  topPublisher?: string;

  // Books (physical + digital)
  bookCount: number;
  bookSpend: number;
  kindleBookCount: number;
  physicalBookCount: number;
  topBookPublisher?: string;
  topBooks: { name: string; price: number }[];

  // Returns
  returnCount: number;
  totalRefundAmount: number;
  averageRefundTime?: number;
  returnRate: number;

  // Currency
  primaryCurrency: string;
  hasMixedCurrencies: boolean;
  currencyBreakdown: { currency: string; amount: number; orderCount: number }[];
}

// File detection
export type FileType =
  | 'retail_orders'
  | 'refund_payments'
  | 'digital_items'
  | 'unknown';

export interface ParsedFile {
  type: FileType;
  fileName: string;
  data: unknown[];
  rowCount: number;
}
