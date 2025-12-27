import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
  type ChartEvent,
  type ActiveElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ProcessedOrder } from '../../types';
import { formatCurrency } from '../../utils/dataProcessor';
import { MONTHS_SHORT, BOOK_FORMAT_COLORS, BOOK_FORMAT_STYLES, TOOLTIP_STYLE, CHART_AXIS_COLORS } from '../../config';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type BookFormat = 'kindle' | 'audible' | 'physical';

interface MonthlyBookData {
  month: string;
  monthIndex: number;
  kindle: { count: number; spend: number };
  audible: { count: number; spend: number };
  physical: { count: number; spend: number };
}

function getBookFormat(order: ProcessedOrder): BookFormat {
  if (!order.isDigital) {
    return 'physical';
  }
  // Check if it's an Audible book
  const publisher = order.publisher?.toLowerCase() || '';
  if (publisher.includes('audible')) {
    return 'audible';
  }
  return 'kindle';
}

interface BooksChartProps {
  books: ProcessedOrder[];
  selectedMonth: number | null;
  onMonthClick: (monthIndex: number) => void;
}

export function BooksChart({ books, selectedMonth, onMonthClick }: BooksChartProps) {
  const monthlyData = useMemo(() => {
    // Initialize monthly data
    const data: MonthlyBookData[] = MONTHS_SHORT.map((month, idx) => ({
      month,
      monthIndex: idx,
      kindle: { count: 0, spend: 0 },
      audible: { count: 0, spend: 0 },
      physical: { count: 0, spend: 0 },
    }));

    // Aggregate books by month and format
    for (const book of books) {
      const monthIdx = book.orderDate.getMonth();
      const format = getBookFormat(book);
      data[monthIdx][format].count += book.quantity;
      data[monthIdx][format].spend += book.totalOwed;
    }

    return data;
  }, [books]);

  const chartData = useMemo(() => {
    // Dim non-selected months when a month is selected
    const getOpacity = (idx: number) => {
      if (selectedMonth === null) return 0.8;
      return idx === selectedMonth ? 1 : 0.3;
    };

    return {
      labels: MONTHS_SHORT,
      datasets: [
        {
          label: 'Kindle',
          data: monthlyData.map((d) => d.kindle.count),
          backgroundColor: monthlyData.map((_, idx) => `${BOOK_FORMAT_COLORS.kindle.base}, ${getOpacity(idx)})`),
          hoverBackgroundColor: BOOK_FORMAT_COLORS.kindle.hover,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Audible',
          data: monthlyData.map((d) => d.audible.count),
          backgroundColor: monthlyData.map((_, idx) => `${BOOK_FORMAT_COLORS.audible.base}, ${getOpacity(idx)})`),
          hoverBackgroundColor: BOOK_FORMAT_COLORS.audible.hover,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Physical',
          data: monthlyData.map((d) => d.physical.count),
          backgroundColor: monthlyData.map((_, idx) => `${BOOK_FORMAT_COLORS.physical.base}, ${getOpacity(idx)})`),
          hoverBackgroundColor: BOOK_FORMAT_COLORS.physical.hover,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };
  }, [monthlyData, selectedMonth]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
          labels: {
            color: CHART_AXIS_COLORS.textLight,
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          backgroundColor: TOOLTIP_STYLE.background,
          titleColor: TOOLTIP_STYLE.titleColor,
          bodyColor: TOOLTIP_STYLE.bodyColor,
          borderColor: CHART_AXIS_COLORS.grid,
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (context: TooltipItem<'bar'>) => {
              const count = context.raw as number;
              const format = context.dataset.label?.toLowerCase() as BookFormat;
              const monthData = monthlyData[context.dataIndex];
              const spend = monthData[format]?.spend || 0;
              return `${context.dataset.label}: ${count} book${count !== 1 ? 's' : ''} (${formatCurrency(spend)})`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: {
            display: false,
          },
          ticks: {
            color: CHART_AXIS_COLORS.text,
            font: {
              size: 11,
            },
          },
        },
        y: {
          stacked: true,
          grid: {
            color: CHART_AXIS_COLORS.grid,
          },
          ticks: {
            color: CHART_AXIS_COLORS.text,
            font: {
              size: 11,
            },
            stepSize: 1,
          },
          title: {
            display: true,
            text: 'Books',
            color: CHART_AXIS_COLORS.text,
          },
        },
      },
      animation: {
        duration: 750,
        easing: 'easeOutQuart' as const,
      },
      onClick: (_event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          onMonthClick(index);
        }
      },
      onHover: (event: ChartEvent, elements: ActiveElement[]) => {
        const nativeEvent = event.native as MouseEvent | null;
        const target = nativeEvent?.target as HTMLElement | null;
        if (target) {
          target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
        }
      },
    }),
    [monthlyData, onMonthClick]
  );

  // Calculate totals for summary
  const totals = useMemo(() => {
    return monthlyData.reduce(
      (acc, m) => ({
        kindle: { count: acc.kindle.count + m.kindle.count, spend: acc.kindle.spend + m.kindle.spend },
        audible: { count: acc.audible.count + m.audible.count, spend: acc.audible.spend + m.audible.spend },
        physical: { count: acc.physical.count + m.physical.count, spend: acc.physical.spend + m.physical.spend },
      }),
      {
        kindle: { count: 0, spend: 0 },
        audible: { count: 0, spend: 0 },
        physical: { count: 0, spend: 0 },
      }
    );
  }, [monthlyData]);

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {(['kindle', 'audible', 'physical'] as const).map((format) => (
          <div key={format} className={`${BOOK_FORMAT_STYLES[format].bg} rounded-lg p-3 text-center`}>
            <p className={`${BOOK_FORMAT_STYLES[format].text} text-xs font-medium`}>
              {BOOK_FORMAT_STYLES[format].label}
            </p>
            <p className="text-white text-lg font-bold">{totals[format].count}</p>
            <p className={`${BOOK_FORMAT_STYLES[format].text} opacity-70 text-xs`}>
              {formatCurrency(totals[format].spend)}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64 md:h-72">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
