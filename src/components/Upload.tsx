import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { ParsedFile } from '../types';
import { parseMultipleFiles } from '../utils/csvParser';

interface UploadProps {
  onFilesProcessed: (files: ParsedFile[]) => void;
  hasSavedData?: boolean;
  hasEmail?: boolean;
  onContinueExploring?: () => void;
  onViewWrapped?: () => void;
}

const FILE_TYPE_LABELS: Record<string, string> = {
  retail_orders: 'Retail Orders',
  refund_payments: 'Refund Payments',
  digital_items: 'Digital Items',
  unknown: 'Unknown File Type',
};

export function Upload({
  onFilesProcessed,
  hasSavedData,
  hasEmail,
  onContinueExploring,
  onViewWrapped,
}: UploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const csvFiles = Array.from(files).filter(
      (f) => f.name.endsWith('.csv') || f.type === 'text/csv'
    );

    if (csvFiles.length === 0) {
      setError('Please upload CSV files from your Amazon data export.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const newParsedFiles = await parseMultipleFiles(csvFiles);
      setParsedFiles((prev) => {
        // Merge with existing, avoid duplicates by filename
        const existingNames = new Set(prev.map((f) => f.fileName));
        const uniqueNew = newParsedFiles.filter(
          (f) => !existingNames.has(f.fileName)
        );
        return [...prev, ...uniqueNew];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse files');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback((fileName: string) => {
    setParsedFiles((prev) => prev.filter((f) => f.fileName !== fileName));
  }, []);

  const handleGenerate = useCallback(() => {
    const hasRequiredFiles = parsedFiles.some(
      (f) => f.type === 'retail_orders' || f.type === 'digital_items'
    );

    if (!hasRequiredFiles) {
      setError(
        'Please upload at least one order history file (Retail.OrderHistory.csv or Digital Items.csv)'
      );
      return;
    }

    onFilesProcessed(parsedFiles);
  }, [parsedFiles, onFilesProcessed]);

  const hasOrders = parsedFiles.some(
    (f) => f.type === 'retail_orders' || f.type === 'digital_items'
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[800px]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-7xl mb-4"
          >
            📦
          </motion.div>
          <h1 className="text-5xl font-bold text-white mb-2">Amazon Wrapped</h1>
          <p className="text-gray-400">Your 2025 shopping story awaits</p>
        </div>

        {/* Saved Data Options */}
        {hasSavedData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amazon-orange/10 border border-amazon-orange/30 rounded-xl"
          >
            <p className="text-white text-sm mb-3">
              You have saved data from a previous session
            </p>
            <div className="flex gap-2">
              {hasEmail && onContinueExploring && (
                <button
                  onClick={onContinueExploring}
                  className="flex-1 py-2 px-4 bg-amazon-orange text-amazon-dark font-semibold rounded-lg hover:bg-amber-500 transition-colors text-sm"
                >
                  Explore Data 📊
                </button>
              )}
              {onViewWrapped && (
                <button
                  onClick={onViewWrapped}
                  className="flex-1 py-2 px-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors text-sm"
                >
                  View Wrapped 🎁
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Drop Zone */}
        <motion.div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragging
                ? 'border-amazon-orange bg-amazon-orange/10'
                : 'border-gray-600 hover:border-gray-500'
            }
          `}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <input
            type="file"
            multiple
            accept=".csv"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="text-5xl mb-4">{isDragging ? '📥' : '📁'}</div>
          <p className="text-lg text-white mb-2">
            {isDragging ? 'Drop files here' : 'Drag & drop your Amazon CSV files'}
          </p>
          <p className="text-sm text-gray-400">or click to browse</p>

          {isProcessing && (
            <div className="mt-4">
              <div className="animate-spin w-6 h-6 border-2 border-amazon-orange border-t-transparent rounded-full mx-auto" />
            </div>
          )}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Parsed Files List */}
        {parsedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 space-y-2"
          >
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              Uploaded Files
            </h3>
            {parsedFiles.map((file, idx) => (
              <motion.div
                key={file.fileName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-3 bg-amazon-navy/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      file.type === 'unknown'
                        ? 'bg-gray-600'
                        : 'bg-amazon-orange/20 text-amazon-orange'
                    }`}
                  >
                    {FILE_TYPE_LABELS[file.type]}
                  </span>
                  <span className="text-sm text-white truncate max-w-[200px]">
                    {file.fileName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {file.rowCount} rows
                  </span>
                </div>
                <button
                  onClick={() => removeFile(file.fileName)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Required Files Info */}
        <div className="mt-6 p-4 bg-amazon-navy/30 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Files to upload:
          </h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li className="flex items-center gap-2">
              <span
                className={hasOrders ? 'text-green-400' : 'text-gray-500'}
              >
                {hasOrders ? '✓' : '○'}
              </span>
              Retail.OrderHistory.*.csv (required)
            </li>
            <li className="flex items-center gap-2">
              <span
                className={
                  parsedFiles.some((f) => f.type === 'refund_payments')
                    ? 'text-green-400'
                    : 'text-gray-500'
                }
              >
                {parsedFiles.some((f) => f.type === 'refund_payments')
                  ? '✓'
                  : '○'}
              </span>
              Retail.OrdersReturned.Payments.*.csv (for refunds)
            </li>
            <li className="flex items-center gap-2">
              <span
                className={
                  parsedFiles.some((f) => f.type === 'digital_items')
                    ? 'text-green-400'
                    : 'text-gray-500'
                }
              >
                {parsedFiles.some((f) => f.type === 'digital_items')
                  ? '✓'
                  : '○'}
              </span>
              Digital Items.csv (optional)
            </li>
          </ul>
        </div>

        {/* Generate Button */}
        {parsedFiles.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={!hasOrders}
            className={`
              w-full mt-6 py-4 px-6 rounded-xl font-semibold text-lg
              transition-all duration-200
              ${
                hasOrders
                  ? 'bg-amazon-orange text-amazon-dark hover:bg-amber-500'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Generate My Wrapped 🎁
          </motion.button>
        )}

        {/* Privacy Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-5 bg-amazon-navy/30 rounded-xl border border-gray-700/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔒</span>
            <h4 className="text-sm font-semibold text-white">100% Private</h4>
          </div>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>All processing happens <span className="text-white">locally in your browser</span></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>No data is saved to any server or cloud</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Works offline — disable WiFi and try it!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>No AI, no analytics, no tracking</span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-gray-500 italic">
            No AI was harmed in the generation of your Wrapped.
          </p>
        </motion.div>

        {/* Disclaimer */}
        <p className="mt-6 text-xs text-gray-600 text-center">
          This project is not affiliated with, endorsed by, or sponsored by Amazon.com, Inc.
          <br />
          Amazon and all related trademarks are property of Amazon.com, Inc.
        </p>
      </motion.div>
    </div>
  );
}
