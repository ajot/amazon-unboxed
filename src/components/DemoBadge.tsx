import { motion } from 'framer-motion';

interface DemoBadgeProps {
  className?: string;
}

export function DemoBadge({ className = '' }: DemoBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium shadow-lg ${className}`}
    >
      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      Demo Data
    </motion.div>
  );
}
