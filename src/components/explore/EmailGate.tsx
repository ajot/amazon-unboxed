import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface EmailGateProps {
  onSubmit: (email: string) => void;
  onBack: () => void;
}

export function EmailGate({ onSubmit, onBack }: EmailGateProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!email.trim()) {
        setError('Please enter your email');
        return;
      }

      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }

      onSubmit(email.trim());
    },
    [email, onSubmit]
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
            📊
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Explore Your Data
          </h1>
          <p className="text-gray-400">
            Dive deeper into your Amazon shopping trends
          </p>
        </div>

        {/* Email Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Enter your email to continue
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-amazon-navy/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange transition-colors"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full py-4 px-6 bg-amazon-orange text-amazon-dark font-semibold text-lg rounded-xl hover:bg-amber-500 transition-colors"
          >
            Continue to Explore
          </button>
        </motion.form>

        {/* Privacy Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-amazon-navy/30 rounded-lg text-center"
        >
          <p className="text-gray-400 text-sm">
            🔒 Your email is stored locally in your browser only.
            <br />
            <span className="text-gray-500">
              Your data never leaves your device.
            </span>
          </p>
        </motion.div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onBack}
          className="mt-6 w-full text-center text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Back to summary
        </motion.button>
      </motion.div>
    </div>
  );
}
