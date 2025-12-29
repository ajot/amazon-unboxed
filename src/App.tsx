import { useState, useCallback, useEffect } from 'react';
import { Upload } from './components/Upload';
import { SlideShow } from './components/SlideShow';
import { EmailGate } from './components/explore/EmailGate';
import { ExploreDashboard } from './components/explore/ExploreDashboard';
import { calculateStatsWithData, getAvailableYears, calculateCurrencyBreakdown } from './utils/dataProcessor';
import {
  getStoredEmail,
  storeEmail,
  getStoredData,
  storeData,
  clearStoredData,
  type StoredYearlyData,
} from './utils/localStorage';
import type { ParsedFile, WrappedStats, ProcessedData, ProcessedOrder, ProcessedRefund, EnrichedRefund } from './types';
import './index.css';

type AppView = 'upload' | 'slides' | 'emailGate' | 'explore';

function App() {
  const [view, setView] = useState<AppView>('upload');
  const [stats, setStats] = useState<WrappedStats | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [allOrders, setAllOrders] = useState<ProcessedOrder[]>([]);
  const [allRefunds, setAllRefunds] = useState<ProcessedRefund[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [storedYearlyData, setStoredYearlyData] = useState<StoredYearlyData[] | undefined>(undefined);

  // Check for stored email and data on mount
  useEffect(() => {
    setUserEmail(getStoredEmail());
    const savedData = getStoredData();
    if (savedData) {
      setHasSavedData(true);
    }
  }, []);

  const handleFilesProcessed = useCallback((files: ParsedFile[]) => {
    try {
      // Store raw files for year switching
      setParsedFiles(files);

      // Detect available years
      const years = getAvailableYears(files);
      setAvailableYears(years);

      // Default to most recent year
      const targetYear = years[0] || new Date().getFullYear();
      setSelectedYear(targetYear);

      const result = calculateStatsWithData(files, targetYear);
      setStats(result.stats);
      setProcessedData(result.processedData);
      setAllOrders(result.allOrders);
      setAllRefunds(result.allRefunds);
      // Save to localStorage
      storeData(result.stats, result.processedData, result.allOrders, result.allRefunds, files, years, targetYear);
      setHasSavedData(true);
      setView('slides');
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  }, []);

  const handleYearChange = useCallback((year: number) => {
    if (parsedFiles.length === 0 && allOrders.length === 0) return;
    try {
      setSelectedYear(year);

      let stats: WrappedStats;
      let processedData: ProcessedData;

      if (parsedFiles.length > 0) {
        // Have parsed files - use full calculation
        const result = calculateStatsWithData(parsedFiles, year);
        stats = result.stats;
        processedData = result.processedData;
      } else if (allOrders.length > 0) {
        // No parsed files, but have allOrders - filter manually
        const yearOrders = allOrders.filter(o => o.orderDate.getFullYear() === year);
        const yearRefunds = allRefunds.filter(r => r.refundDate.getFullYear() === year);
        const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Build monthly data with correct MonthlyData interface
        const monthlyData = Array.from({ length: 12 }, (_, idx) => {
          const monthOrders = yearOrders.filter(o => o.orderDate.getMonth() === idx);
          return {
            month: MONTHS_FULL[idx],
            monthIndex: idx,
            totalSpend: monthOrders.reduce((sum, o) => sum + o.totalOwed, 0),
            orderCount: monthOrders.length,
            orders: monthOrders,
          };
        });

        // Build enriched refunds by matching with orders
        const orderByIdMap = new Map<string, ProcessedOrder>();
        for (const order of yearOrders) {
          if (!orderByIdMap.has(order.orderId)) {
            orderByIdMap.set(order.orderId, order);
          }
        }
        const enrichedRefunds: EnrichedRefund[] = yearRefunds.map(refund => {
          const originalOrder = orderByIdMap.get(refund.orderId);
          return {
            ...refund,
            originalOrder,
            productName: originalOrder?.productName,
          };
        });

        // Currency breakdown (calculate first to filter spending)
        const { currencyBreakdown, primaryCurrency, hasMixedCurrencies } = calculateCurrencyBreakdown(yearOrders);

        // Filter to primary currency for spending stats when mixed
        const primaryOrders = hasMixedCurrencies
          ? yearOrders.filter(o => (o.currency || 'USD') === primaryCurrency)
          : yearOrders;
        const primaryRefunds = hasMixedCurrencies
          ? yearRefunds.filter(r => (r.currency || 'USD') === primaryCurrency)
          : yearRefunds;

        processedData = {
          orders: yearOrders,
          refunds: yearRefunds,
          enrichedRefunds,
          monthlyData,
        };

        // Calculate stats (primary currency for spending)
        const totalItems = yearOrders.reduce((sum, o) => sum + o.quantity, 0);
        const primaryItems = primaryOrders.reduce((sum, o) => sum + o.quantity, 0);
        const totalSpend = primaryOrders.reduce((sum, o) => sum + o.totalOwed, 0);
        const totalRefundsAmount = primaryRefunds.reduce((sum, r) => sum + r.amountRefunded, 0);
        const retailOrdersList = yearOrders.filter(o => !o.isDigital);
        const digitalOrdersList = yearOrders.filter(o => o.isDigital);
        const uniqueOrderIds = new Set(yearOrders.map(o => o.orderId));
        const totalOrderCount = uniqueOrderIds.size;

        // Monthly spending (primary currency)
        const monthlySpending = monthlyData.map(m => {
          const monthPrimaryOrders = primaryOrders.filter(o => o.orderDate.getMonth() === m.monthIndex);
          return { month: m.month, amount: monthPrimaryOrders.reduce((sum, o) => sum + o.totalOwed, 0) };
        });

        // Peak month (primary currency)
        const peakMonthData = monthlySpending.reduce((max, m) => m.amount > max.amount ? m : max, monthlySpending[0] || { month: 'January', amount: 0 });
        const peakMonthOrders = primaryOrders.filter(o => MONTHS_FULL[o.orderDate.getMonth()] === peakMonthData.month);

        // Daily order counts (all orders)
        const dailyOrderMap = new Map<number, number>();
        for (const order of yearOrders) {
          const day = order.orderDate.getDay();
          dailyOrderMap.set(day, (dailyOrderMap.get(day) || 0) + 1);
        }
        const dailyOrders = DAYS_FULL.map((day, idx) => ({
          day,
          count: dailyOrderMap.get(idx) || 0,
        }));
        const favoriteDay = dailyOrders.reduce((max, d) => d.count > max.count ? d : max, { day: 'Monday', count: 0 });

        // Digital stats (primary currency for spend)
        const primaryDigitalOrders = hasMixedCurrencies
          ? digitalOrdersList.filter(o => (o.currency || 'USD') === primaryCurrency)
          : digitalOrdersList;
        const digitalSpend = primaryDigitalOrders.reduce((sum, o) => sum + o.totalOwed, 0);
        const digitalItemCount = digitalOrdersList.reduce((sum, o) => sum + o.quantity, 0);

        stats = {
          totalGrossSpend: totalSpend,
          totalRefunds: totalRefundsAmount,
          netSpend: totalSpend - totalRefundsAmount,
          monthlyAverage: (totalSpend - totalRefundsAmount) / 12,
          averageItemCost: primaryItems > 0 ? totalSpend / primaryItems : 0,
          totalOrders: totalOrderCount,
          retailOrders: retailOrdersList.length,
          digitalOrders: digitalOrdersList.length,
          totalItems,
          averageItemsPerMonth: totalItems / 12,
          ordersPerDay: totalOrderCount / 365,
          peakMonth: { month: peakMonthData.month, amount: peakMonthData.amount, orderCount: peakMonthOrders.length },
          favoriteDay,
          monthlySpending,
          dailyOrders,
          topItems: [],
          topExpensiveItems: [],
          digitalSpend,
          digitalItemCount,
          bookCount: 0,
          bookSpend: 0,
          kindleBookCount: 0,
          physicalBookCount: 0,
          topBooks: [],
          returnCount: yearRefunds.length,
          totalRefundAmount: totalRefundsAmount,
          returnRate: totalOrderCount > 0 ? (yearRefunds.length / totalOrderCount) * 100 : 0,
          primaryCurrency,
          hasMixedCurrencies,
          currencyBreakdown,
        };
      } else {
        return;
      }

      setStats(stats);
      setProcessedData(processedData);
      // Update localStorage with new year
      storeData(stats, processedData, allOrders, allRefunds, parsedFiles, availableYears, year);
    } catch (error) {
      console.error('Error recalculating stats:', error);
    }
  }, [parsedFiles, allOrders, allRefunds, availableYears]);

  const handleReset = useCallback(() => {
    setStats(null);
    setProcessedData(null);
    setParsedFiles([]);
    setAllOrders([]);
    setAllRefunds([]);
    setAvailableYears([]);
    setSelectedYear(new Date().getFullYear());
    clearStoredData();
    setHasSavedData(false);
    setView('upload');
  }, []);

  const handleExplore = useCallback(() => {
    // If user already has email stored, go directly to explore
    if (userEmail) {
      setView('explore');
    } else {
      setView('emailGate');
    }
  }, [userEmail]);

  const handleEmailSubmit = useCallback((email: string) => {
    storeEmail(email);
    setUserEmail(email);
    setView('explore');
  }, []);

  const handleBackToSlides = useCallback(() => {
    setView('slides');
  }, []);

  // Load saved data and go directly to explore
  const handleContinueExploring = useCallback(() => {
    const savedData = getStoredData();
    if (savedData) {
      // If processedData has no orders but allOrders exists, recalculate for a year that has data
      let targetYear = savedData.selectedYear || new Date().getFullYear();
      let stats = savedData.stats;
      let processedData = savedData.processedData;

      if (processedData.orders.length === 0 && savedData.allOrders && savedData.allOrders.length > 0) {
        // Find years that actually have orders
        const yearsWithOrders = new Set(savedData.allOrders.map(o => o.orderDate.getFullYear()));
        const sortedYears = Array.from(yearsWithOrders).sort((a, b) => b - a);

        if (sortedYears.length > 0 && !yearsWithOrders.has(targetYear)) {
          // Switch to most recent year with data
          targetYear = sortedYears[0];
        }

        // Recalculate stats and processedData from allOrders for the target year
        if (savedData.parsedFiles && savedData.parsedFiles.length > 0) {
          const result = calculateStatsWithData(savedData.parsedFiles, targetYear);
          stats = result.stats;
          processedData = result.processedData;
        } else {
          // No parsedFiles, filter allOrders manually
          const yearOrders = savedData.allOrders.filter(o => o.orderDate.getFullYear() === targetYear);
          const yearRefunds = (savedData.allRefunds || []).filter(r => r.refundDate.getFullYear() === targetYear);

          // Calculate currency breakdown
          const { currencyBreakdown, primaryCurrency, hasMixedCurrencies } = calculateCurrencyBreakdown(yearOrders);

          // Filter to primary currency for spending stats
          const primaryOrders = hasMixedCurrencies
            ? yearOrders.filter(o => (o.currency || 'USD') === primaryCurrency)
            : yearOrders;
          const primaryRefunds = hasMixedCurrencies
            ? yearRefunds.filter(r => (r.currency || 'USD') === primaryCurrency)
            : yearRefunds;

          const totalGross = primaryOrders.reduce((sum, o) => sum + o.totalOwed, 0);
          const totalRefundAmount = primaryRefunds.reduce((sum, r) => sum + r.amountRefunded, 0);

          processedData = {
            ...processedData,
            orders: yearOrders,
            monthlyData: processedData.monthlyData.map((m, idx) => ({
              ...m,
              orders: yearOrders.filter(o => o.orderDate.getMonth() === idx),
            })),
          };
          // Recalculate stats from filtered orders
          stats = {
            ...stats,
            totalOrders: yearOrders.length,
            totalItems: yearOrders.reduce((sum, o) => sum + o.quantity, 0),
            totalGrossSpend: totalGross,
            netSpend: totalGross - totalRefundAmount,
            primaryCurrency,
            hasMixedCurrencies,
            currencyBreakdown,
          };
        }
      }

      setStats(stats);
      setProcessedData(processedData);
      if (savedData.allOrders) setAllOrders(savedData.allOrders);
      if (savedData.allRefunds) setAllRefunds(savedData.allRefunds);
      if (savedData.parsedFiles) setParsedFiles(savedData.parsedFiles);
      if (savedData.availableYears) setAvailableYears(savedData.availableYears);
      setSelectedYear(targetYear);
      if (savedData.yearlyData) setStoredYearlyData(savedData.yearlyData);

      if (userEmail) {
        setView('explore');
      } else {
        setView('slides');
      }
    }
  }, [userEmail]);

  // Load saved data and view slides
  const handleViewWrapped = useCallback(() => {
    const savedData = getStoredData();
    if (savedData) {
      // Same logic as handleContinueExploring - recalculate if needed
      let targetYear = savedData.selectedYear || new Date().getFullYear();
      let stats = savedData.stats;
      let processedData = savedData.processedData;

      if (processedData.orders.length === 0 && savedData.allOrders && savedData.allOrders.length > 0) {
        const yearsWithOrders = new Set(savedData.allOrders.map(o => o.orderDate.getFullYear()));
        const sortedYears = Array.from(yearsWithOrders).sort((a, b) => b - a);

        if (sortedYears.length > 0 && !yearsWithOrders.has(targetYear)) {
          targetYear = sortedYears[0];
        }

        if (savedData.parsedFiles && savedData.parsedFiles.length > 0) {
          const result = calculateStatsWithData(savedData.parsedFiles, targetYear);
          stats = result.stats;
          processedData = result.processedData;
        } else {
          const yearOrders = savedData.allOrders.filter(o => o.orderDate.getFullYear() === targetYear);
          const yearRefunds = (savedData.allRefunds || []).filter(r => r.refundDate.getFullYear() === targetYear);

          // Calculate currency breakdown
          const { currencyBreakdown, primaryCurrency, hasMixedCurrencies } = calculateCurrencyBreakdown(yearOrders);

          // Filter to primary currency for spending stats
          const primaryOrders = hasMixedCurrencies
            ? yearOrders.filter(o => (o.currency || 'USD') === primaryCurrency)
            : yearOrders;
          const primaryRefunds = hasMixedCurrencies
            ? yearRefunds.filter(r => (r.currency || 'USD') === primaryCurrency)
            : yearRefunds;

          const totalGross = primaryOrders.reduce((sum, o) => sum + o.totalOwed, 0);
          const totalRefundAmount = primaryRefunds.reduce((sum, r) => sum + r.amountRefunded, 0);

          processedData = {
            ...processedData,
            orders: yearOrders,
            monthlyData: processedData.monthlyData.map((m, idx) => ({
              ...m,
              orders: yearOrders.filter(o => o.orderDate.getMonth() === idx),
            })),
          };
          stats = {
            ...stats,
            totalOrders: yearOrders.length,
            totalItems: yearOrders.reduce((sum, o) => sum + o.quantity, 0),
            totalGrossSpend: totalGross,
            netSpend: totalGross - totalRefundAmount,
            primaryCurrency,
            hasMixedCurrencies,
            currencyBreakdown,
          };
        }
      }

      setStats(stats);
      setProcessedData(processedData);
      if (savedData.allOrders) setAllOrders(savedData.allOrders);
      if (savedData.allRefunds) setAllRefunds(savedData.allRefunds);
      if (savedData.parsedFiles) setParsedFiles(savedData.parsedFiles);
      if (savedData.availableYears) setAvailableYears(savedData.availableYears);
      setSelectedYear(targetYear);
      if (savedData.yearlyData) setStoredYearlyData(savedData.yearlyData);
      setView('slides');
    }
  }, []);

  return (
    <div className="min-h-screen bg-amazon-dark">
      {view === 'upload' && (
        <Upload
          onFilesProcessed={handleFilesProcessed}
          hasSavedData={hasSavedData}
          hasEmail={!!userEmail}
          onContinueExploring={handleContinueExploring}
          onViewWrapped={handleViewWrapped}
          onClearData={handleReset}
        />
      )}
      {view === 'slides' && stats && (
        <SlideShow
          stats={stats}
          onReset={handleReset}
          onExplore={handleExplore}
          year={selectedYear}
          availableYears={availableYears}
          onYearChange={handleYearChange}
        />
      )}
      {view === 'emailGate' && (
        <EmailGate onSubmit={handleEmailSubmit} onBack={handleBackToSlides} />
      )}
      {view === 'explore' && stats && processedData && (
        <ExploreDashboard
          stats={stats}
          processedData={processedData}
          parsedFiles={parsedFiles}
          allOrders={allOrders}
          storedYearlyData={storedYearlyData}
          onBack={handleBackToSlides}
          onReset={handleReset}
          year={selectedYear}
          availableYears={availableYears}
          onYearChange={handleYearChange}
        />
      )}
    </div>
  );
}

export default App;
