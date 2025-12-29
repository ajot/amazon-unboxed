import Papa from 'papaparse';
import type { ParsedFile } from '../types';
import { detectFileType } from './csvParser';

interface DemoFileConfig {
  path: string;
  name: string;
}

const DEMO_FILES: DemoFileConfig[] = [
  { path: '/demo/Retail.OrderHistory.1.csv', name: 'Retail.OrderHistory.1.csv' },
  { path: '/demo/Retail.OrderHistory.2.csv', name: 'Retail.OrderHistory.2.csv' },
  { path: '/demo/Retail.OrderHistory.3.csv', name: 'Retail.OrderHistory.3.csv' },
  { path: '/demo/Retail.OrderHistory.4.csv', name: 'Retail.OrderHistory.4.csv' },
  { path: '/demo/Digital Items.csv', name: 'Digital Items.csv' },
  { path: '/demo/Retail.OrdersReturned.Payments.1.csv', name: 'Retail.OrdersReturned.Payments.1.csv' },
];

/**
 * Load demo data from pre-bundled CSV files
 */
export async function loadDemoData(): Promise<ParsedFile[]> {
  const parsedFiles: ParsedFile[] = [];

  for (const fileConfig of DEMO_FILES) {
    try {
      const response = await fetch(fileConfig.path);
      if (!response.ok) {
        console.warn(`Failed to fetch demo file: ${fileConfig.path}`);
        continue;
      }

      const csvText = await response.text();

      const result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      if (result.errors.length > 0) {
        console.warn(`CSV parse warnings for ${fileConfig.name}:`, result.errors);
      }

      const headers = result.meta.fields || [];
      const fileType = detectFileType(headers);

      parsedFiles.push({
        type: fileType,
        fileName: fileConfig.name,
        data: result.data as unknown[],
        rowCount: result.data.length,
      });
    } catch (error) {
      console.error(`Error loading demo file ${fileConfig.path}:`, error);
    }
  }

  return parsedFiles;
}
