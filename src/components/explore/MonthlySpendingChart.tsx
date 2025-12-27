import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartEvent,
  type ActiveElement,
  type TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { MonthlyData } from '../../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlySpendingChartProps {
  monthlyData: MonthlyData[];
  selectedMonth: number | null;
  onMonthClick: (monthIndex: number) => void;
}

export function MonthlySpendingChart({
  monthlyData,
  selectedMonth,
  onMonthClick,
}: MonthlySpendingChartProps) {
  const chartData = useMemo(() => {
    const labels = monthlyData.map((d) => d.month.substring(0, 3));
    const data = monthlyData.map((d) => d.totalSpend);

    // Create background colors - highlight selected month
    const backgroundColors = monthlyData.map((_, idx) =>
      idx === selectedMonth
        ? 'rgba(255, 153, 0, 1)' // Amazon orange (selected)
        : 'rgba(255, 153, 0, 0.6)' // Amazon orange (normal)
    );

    const hoverBackgroundColors = monthlyData.map(() =>
      'rgba(255, 153, 0, 0.8)'
    );

    return {
      labels,
      datasets: [
        {
          label: 'Spending',
          data,
          backgroundColor: backgroundColors,
          hoverBackgroundColor: hoverBackgroundColors,
          borderRadius: 6,
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
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(19, 25, 33, 0.95)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(255, 153, 0, 0.5)',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context: TooltipItem<'bar'>) => {
              const value = context.raw as number;
              return `$${value.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`;
            },
            afterLabel: (context: TooltipItem<'bar'>) => {
              const month = monthlyData[context.dataIndex];
              return `${month.orderCount} orders`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.6)',
            font: {
              size: 11,
            },
          },
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.6)',
            font: {
              size: 11,
            },
            callback: (value: number | string) => {
              const numValue = typeof value === 'string' ? parseFloat(value) : value;
              if (numValue >= 1000) {
                return `$${(numValue / 1000).toFixed(0)}k`;
              }
              return `$${numValue}`;
            },
          },
        },
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
      animation: {
        duration: 750,
        easing: 'easeOutQuart' as const,
      },
    }),
    [monthlyData, onMonthClick]
  );

  return (
    <div className="h-64 md:h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}
