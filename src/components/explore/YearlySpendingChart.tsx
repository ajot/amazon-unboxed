import { useMemo, useRef } from 'react';
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
import type { YearlyData } from '../../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface YearlySpendingChartProps {
  yearlyData: YearlyData[];
  selectedYear: number | null;
  onYearClick: (yearIndex: number) => void;
}

export function YearlySpendingChart({
  yearlyData,
  selectedYear,
  onYearClick,
}: YearlySpendingChartProps) {
  const chartRef = useRef<ChartJS<'bar'> | null>(null);

  const handleChartClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const chart = chartRef.current;
    if (!chart) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // First check if clicking on a bar element
    const elements = chart.getElementsAtEventForMode(
      event.nativeEvent,
      'nearest',
      { intersect: true },
      false
    );

    if (elements.length > 0) {
      onYearClick(elements[0].index);
      return;
    }

    // Check if clicking in the x-axis label area
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;

    if (xScale && yScale && y > yScale.bottom) {
      // Find which label was clicked
      for (let i = 0; i < yearlyData.length; i++) {
        const labelX = xScale.getPixelForValue(i);
        if (Math.abs(x - labelX) < 25) {
          onYearClick(i);
          return;
        }
      }
    }
  };

  const chartData = useMemo(() => {
    const labels = yearlyData.map((d) => d.year.toString());
    const data = yearlyData.map((d) => d.totalSpend);

    // Create background colors - highlight selected year
    const backgroundColors = yearlyData.map((_, idx) =>
      idx === selectedYear
        ? 'rgba(255, 153, 0, 1)' // Amazon orange (selected)
        : 'rgba(255, 153, 0, 0.6)' // Amazon orange (normal)
    );

    const hoverBackgroundColors = yearlyData.map(() =>
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
  }, [yearlyData, selectedYear]);

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
              const year = yearlyData[context.dataIndex];
              return `${year.orderCount} orders`;
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
              size: 12,
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
      onHover: (_event: ChartEvent, elements: ActiveElement[]) => {
        const nativeEvent = _event.native as MouseEvent | null;
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
    [yearlyData]
  );

  return (
    <div className="h-64 md:h-80 cursor-pointer">
      <Bar
        ref={chartRef}
        data={chartData}
        options={options}
        onClick={handleChartClick}
      />
    </div>
  );
}
