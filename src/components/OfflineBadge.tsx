import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

interface OfflineBadgeProps {
  isOnline: boolean;
}

export default function OfflineBadge({ isOnline }: OfflineBadgeProps) {
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline-badge"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[200]
                     flex items-center gap-2
                     px-4 py-2 rounded-full
                     bg-slate-800 text-slate-100
                     shadow-lg shadow-black/25
                     text-sm font-medium
                     border border-slate-700"
        >
          <WifiOff size={14} className="text-amber-400" />
          Modo offline
        </motion.div>
      )}
    </AnimatePresence>
  );
}
