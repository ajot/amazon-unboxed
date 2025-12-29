import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import type { WrappedStats } from '../types';
import {
  WelcomeSlide,
  TotalSpendSlide,
  ByTheNumbersSlide,
  OrderCountSlide,
  PeakMonthSlide,
  FavoriteDaySlide,
  TopItemsSlide,
  BigTicketsSlide,
  DigitalLifeSlide,
  BooksSlide,
  ReturnsSlide,
  SummarySlide,
} from './slides';
import { DemoBadge } from './DemoBadge';

interface SlideShowProps {
  stats: WrappedStats;
  onReset: () => void;
  onExplore: () => void;
  year: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
  isDemoMode?: boolean;
}

const TOTAL_SLIDES = 12;

export function SlideShow({ stats, onReset, onExplore, year, availableYears, onYearChange, isDemoMode }: SlideShowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, TOTAL_SLIDES - 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch/swipe handling
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  // Download current slide as PNG
  const downloadSlide = useCallback(async () => {
    if (!slideRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(slideRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#131921',
      });

      const link = document.createElement('a');
      link.download = `unboxed-${year}-slide-${currentSlide + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download slide:', err);
    } finally {
      setIsDownloading(false);
    }
  }, [currentSlide, isDownloading, year]);

  // Render current slide
  const renderSlide = () => {
    const commonProps = { stats, year };

    switch (currentSlide) {
      case 0:
        return <WelcomeSlide ref={slideRef} year={year} />;
      case 1:
        return <TotalSpendSlide ref={slideRef} {...commonProps} />;
      case 2:
        return <ByTheNumbersSlide ref={slideRef} {...commonProps} />;
      case 3:
        return <OrderCountSlide ref={slideRef} {...commonProps} />;
      case 4:
        return <PeakMonthSlide ref={slideRef} {...commonProps} />;
      case 5:
        return <FavoriteDaySlide ref={slideRef} {...commonProps} />;
      case 6:
        return <TopItemsSlide ref={slideRef} {...commonProps} />;
      case 7:
        return <BigTicketsSlide ref={slideRef} {...commonProps} />;
      case 8:
        return <DigitalLifeSlide ref={slideRef} {...commonProps} />;
      case 9:
        return <BooksSlide ref={slideRef} {...commonProps} />;
      case 10:
        return <ReturnsSlide ref={slideRef} {...commonProps} />;
      case 11:
        return <SummarySlide ref={slideRef} {...commonProps} onDownload={downloadSlide} onExplore={onExplore} />;
      default:
        return null;
    }
  };

  // Navigation controls component
  const NavigationControls = () => (
    <>
      {/* Previous button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        disabled={currentSlide === 0}
        className={`p-3 rounded-full transition-all text-2xl ${
          currentSlide === 0
            ? 'text-white/20 cursor-not-allowed'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        ←
      </button>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide(idx);
            }}
            className={`h-2 rounded-full transition-all ${
              idx === currentSlide
                ? 'bg-amazon-orange w-6'
                : idx < currentSlide
                ? 'bg-amazon-orange/50 w-2'
                : 'bg-white/20 w-2'
            }`}
          />
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        disabled={currentSlide === TOTAL_SLIDES - 1}
        className={`p-3 rounded-full transition-all text-2xl ${
          currentSlide === TOTAL_SLIDES - 1
            ? 'text-white/20 cursor-not-allowed'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        →
      </button>

      {/* Download button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          downloadSlide();
        }}
        disabled={isDownloading}
        className="p-3 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all text-xl"
        title="Download slide"
      >
        {isDownloading ? (
          <span className="animate-spin">⏳</span>
        ) : (
          '📥'
        )}
      </button>

      {/* Explore button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExplore();
        }}
        className="p-3 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all text-xl"
        title="Explore your data"
      >
        📊
      </button>

      {/* Year selector */}
      {availableYears.length > 1 && (
        <select
          value={year}
          onChange={(e) => {
            e.stopPropagation();
            onYearChange(parseInt(e.target.value));
          }}
          onClick={(e) => e.stopPropagation()}
          className="ml-2 px-3 py-2 bg-white/10 text-white rounded-lg text-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amazon-orange"
          title="Select year"
        >
          {availableYears.map((y) => (
            <option key={y} value={y} className="bg-amazon-dark">
              {y}
            </option>
          ))}
        </select>
      )}
    </>
  );

  return (
    <div
      className="min-h-screen"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={currentSlide < TOTAL_SLIDES - 1 ? nextSlide : undefined}
    >
      {/* Demo mode badge */}
      {isDemoMode && (
        <div className="fixed top-4 left-4 z-50">
          <DemoBadge />
        </div>
      )}

      {/* Slide container */}
      <AnimatePresence mode="wait">{renderSlide()}</AnimatePresence>

      {/* Fixed navigation bar - Desktop */}
      <nav className="slide-nav">
        <div className="slide-nav-inner">
          <NavigationControls />
        </div>

        {/* Keyboard hint - Desktop only */}
        <span className="hidden lg:block text-white/30 text-sm ml-6">
          Press → or click to continue
        </span>
      </nav>

      {/* Reset button - positioned in nav area */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={(e) => {
          e.stopPropagation();
          onReset();
        }}
        className="fixed bottom-4 right-4 text-sm text-white/30 hover:text-white/60 transition-colors z-50 hidden lg:block"
      >
        Start over ↺
      </motion.button>
    </div>
  );
}
