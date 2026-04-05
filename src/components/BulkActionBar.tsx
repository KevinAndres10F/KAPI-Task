import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, CheckCircle2, Clock, Circle, X } from 'lucide-react';
import type { Priority, Status } from '../types';
import { PRIORITY_LABELS } from '../types';

interface BulkActionBarProps {
  count: number;
  onSetStatus: (status: Status) => void;
  onSetPriority: (priority: Priority) => void;
  onDelete: () => void;
  onClear: () => void;
}

const STATUSES: { value: Status; label: string; Icon: React.ElementType; color: string }[] = [
  { value: 'todo',        label: 'Por Hacer',   Icon: Circle,        color: 'text-slate-500' },
  { value: 'in-progress', label: 'En Progreso', Icon: Clock,         color: 'text-blue-500'  },
  { value: 'done',        label: 'Completado',  Icon: CheckCircle2,  color: 'text-emerald-500' },
];

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];

export default function BulkActionBar({ count, onSetStatus, onSetPriority, onDelete, onClear }: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          key="bulk-bar"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150]
                     flex items-center gap-2 flex-wrap justify-center
                     px-4 py-3 rounded-2xl
                     bg-slate-900 text-white
                     shadow-2xl shadow-black/40
                     border border-slate-700"
        >
          {/* Count */}
          <span className="px-2 py-0.5 bg-indigo-600 rounded-full text-xs font-bold mr-1">
            {count} seleccionada{count !== 1 ? 's' : ''}
          </span>

          {/* Status buttons */}
          <div className="flex items-center gap-1 border-r border-slate-700 pr-2">
            {STATUSES.map(({ value, label, Icon, color }) => (
              <button
                key={value}
                onClick={() => onSetStatus(value)}
                title={label}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                           bg-slate-800 hover:bg-slate-700 transition-colors ${color}`}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Priority select */}
          <select
            onChange={(e) => onSetPriority(e.target.value as Priority)}
            defaultValue=""
            className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs
                       text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500
                       border-r border-slate-700 mr-1"
          >
            <option value="" disabled>Prioridad...</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
            ))}
          </select>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                       bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Eliminar</span>
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Limpiar selección"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
