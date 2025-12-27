import Papa from 'papaparse';
import type {
  FileType,
  ParsedFile,
  RetailOrderRow,
  RefundPaymentRow,
  DigitalItemRow,
} from '../types';

/**
 * Detect file type based on CSV headers
 */
export function detectFileType(headers: string[]): FileType {
  const headerSet = new Set(headers.map((h) => h.toLowerCase().trim()));

  // Retail Order History: has "Product Name" and "Shipment Item Subtotal" or "Total Owed"
  if (
    headerSet.has('product name') &&
    (headerSet.has('shipment item subtotal') || headerSet.has('total owed'))
  ) {
    return 'retail_orders';
  }

  // Refund Payments: has "AmountRefunded" and "RefundCompletionDate"
  if (
    headerSet.has('amountrefunded') &&
    headerSet.has('refundcompletiondate')
  ) {
    return 'refund_payments';
  }

  // Digital Items: has "OurPrice" and "Publisher"
  if (headerSet.has('ourprice') && headerSet.has('publisher')) {
    return 'digital_items';
  }

  return 'unknown';
}

/**
 * Parse a single CSV file
 */
export function parseCSVFile(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parse warnings:', results.errors);
        }

        const headers = results.meta.fields || [];
        const fileType = detectFileType(headers);

        resolve({
          type: fileType,
          fileName: file.name,
          data: results.data as unknown[],
          rowCount: results.data.length,
        });
      },
      error: (error) => {
        reject(new Error(`Failed to parse ${file.name}: ${error.message}`));
      },
    });
  });
}

/**
 * Parse multiple CSV files
 */
export async function parseMultipleFiles(files: File[]): Promise<ParsedFile[]> {
  const parsedFiles = await Promise.all(files.map(parseCSVFile));
  return parsedFiles;
}

/**
 * Parse date string from Amazon CSV format
 */
export function parseAmazonDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try multiple formats
  // Format 1: "2025-01-15T10:30:00Z" (ISO)
  // Format 2: "01/15/2025" (US)
  // Format 3: "15/01/2025" (UK)
  // Format 4: "2025-01-15" (ISO date)

  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try US format MM/DD/YYYY
  const usMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (usMatch) {
    return new Date(
      parseInt(usMatch[3]),
      parseInt(usMatch[1]) - 1,
      parseInt(usMatch[2])
    );
  }

  return null;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;

  // Remove currency symbols and commas
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Type guard for retail orders
 */
export function isRetailOrderRow(row: unknown): row is RetailOrderRow {
  return (
    typeof row === 'object' &&
    row !== null &&
    'Order ID' in row &&
    'Order Date' in row
  );
}

/**
 * Type guard for refund payments
 */
export function isRefundPaymentRow(row: unknown): row is RefundPaymentRow {
  return (
    typeof row === 'object' &&
    row !== null &&
    'OrderID' in row &&
    'AmountRefunded' in row
  );
}

/**
 * Type guard for digital items
 */
export function isDigitalItemRow(row: unknown): row is DigitalItemRow {
  return (
    typeof row === 'object' &&
    row !== null &&
    'OrderId' in row &&
    'OurPrice' in row
  );
}

