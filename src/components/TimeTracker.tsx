import { useEffect, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { useTimeTracking, formatDuration } from '../hooks/useTimeTracking';

interface TimeTrackerProps {
  taskId: string;
}

export default function TimeTracker({ taskId }: TimeTrackerProps) {
  const { toggle, isRunning, getTotal } = useTimeTracking();
  const running = isRunning(taskId);
  const [, setTick] = useState(0);

  // Re-render every second while running to update elapsed display
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const total = getTotal(taskId);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => toggle(taskId)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          running
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
        }`}
        title={running ? 'Detener timer' : 'Iniciar timer'}
      >
        {running ? <Square size={11} /> : <Play size={11} />}
        {running ? 'Detener' : 'Iniciar'}
      </button>
      {total > 0 && (
        <span className="text-xs text-gray-500 font-mono">
          {formatDuration(total)}
        </span>
      )}
    </div>
  );
}
