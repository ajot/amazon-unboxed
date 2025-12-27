import { useState, useCallback, useEffect } from 'react';
import { Upload } from './components/Upload';
import { SlideShow } from './components/SlideShow';
import { EmailGate } from './components/explore/EmailGate';
import { ExploreDashboard } from './components/explore/ExploreDashboard';
import { calculateStatsWithData } from './utils/dataProcessor';
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
      const result = calculateStatsWithData(files);
      setStats(result.stats);
      setProcessedData(result.processedData);
      // Save to localStorage
      storeData(result.stats, result.processedData);
      setHasSavedData(true);
      setView('slides');
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  }, []);

  const handleReset = useCallback(() => {
    setStats(null);
    setProcessedData(null);
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
        <SlideShow stats={stats} onReset={handleReset} onExplore={handleExplore} />
      )}
      {view === 'emailGate' && (
        <EmailGate onSubmit={handleEmailSubmit} onBack={handleBackToSlides} />
      )}
      {view === 'explore' && stats && processedData && (
        <ExploreDashboard
          stats={stats}
          processedData={processedData}
          onBack={handleBackToSlides}
        />
      )}
    </div>
  );
}

export default App;
