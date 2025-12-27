import { useState, useCallback, useEffect } from 'react';
import { Upload } from './components/Upload';
import { SlideShow } from './components/SlideShow';
import { EmailGate } from './components/explore/EmailGate';
import { ExploreDashboard } from './components/explore/ExploreDashboard';
import { calculateStatsWithData, getAvailableYears } from './utils/dataProcessor';
import {
  getStoredEmail,
  storeEmail,
  getStoredData,
  storeData,
  clearStoredData,
} from './utils/localStorage';
import type { ParsedFile, WrappedStats, ProcessedData } from './types';
import './index.css';

type AppView = 'upload' | 'slides' | 'emailGate' | 'explore';

function App() {
  const [view, setView] = useState<AppView>('upload');
  const [stats, setStats] = useState<WrappedStats | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

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
      // Save to localStorage
      storeData(result.stats, result.processedData, files, years, targetYear);
      setHasSavedData(true);
      setView('slides');
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  }, []);

  const handleYearChange = useCallback((year: number) => {
    if (parsedFiles.length === 0) return;
    try {
      setSelectedYear(year);
      const result = calculateStatsWithData(parsedFiles, year);
      setStats(result.stats);
      setProcessedData(result.processedData);
      // Update localStorage with new year
      storeData(result.stats, result.processedData, parsedFiles, availableYears, year);
    } catch (error) {
      console.error('Error recalculating stats:', error);
    }
  }, [parsedFiles, availableYears]);

  const handleReset = useCallback(() => {
    setStats(null);
    setProcessedData(null);
    setParsedFiles([]);
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
      setStats(savedData.stats);
      setProcessedData(savedData.processedData);
      if (savedData.parsedFiles) setParsedFiles(savedData.parsedFiles);
      if (savedData.availableYears) setAvailableYears(savedData.availableYears);
      if (savedData.selectedYear) setSelectedYear(savedData.selectedYear);
      // If user has email, go to explore; otherwise go to slides
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
      setStats(savedData.stats);
      setProcessedData(savedData.processedData);
      if (savedData.parsedFiles) setParsedFiles(savedData.parsedFiles);
      if (savedData.availableYears) setAvailableYears(savedData.availableYears);
      if (savedData.selectedYear) setSelectedYear(savedData.selectedYear);
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
          onBack={handleBackToSlides}
          year={selectedYear}
          availableYears={availableYears}
          onYearChange={handleYearChange}
        />
      )}
    </div>
  );
}

export default App;
