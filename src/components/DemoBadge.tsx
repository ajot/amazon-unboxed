import { motion } from 'framer-motion';

interface DemoBadgeProps {
  className?: string;
}

export function DemoBadge({ className = '' }: DemoBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-purple-300 text-xs font-medium ${className}`}
    >
      <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
      Demo Data
    </motion.div>
  );
}
