import { useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, AlignJustify, CalendarDays, BarChart2, List,
  Plus, Search, LogOut, CheckCircle2, Clock, AlertCircle,
  Zap,
} from 'lucide-react';
import { useCommandPalette } from '../hooks/useCommandPalette';
import { useTasks } from '../hooks/useTasks';
import { PRIORITY_DOT_CLASSES, PRIORITY_LABELS, STATUS_LABELS } from '../types';
import type { ViewType } from '../types';
import '../styles/command-palette.css';

interface CommandPaletteProps {
  onNavigate: (view: ViewType) => void;
  onNewTask: () => void;
  onSignOut: () => void;
}

const NAV_COMMANDS: { label: string; view: ViewType; Icon: React.ElementType; shortcut?: string }[] = [
  { label: 'Dashboard',  view: 'dashboard',  Icon: BarChart2,    shortcut: '1' },
  { label: 'Tablero',    view: 'board',      Icon: LayoutGrid,   shortcut: '2' },
  { label: 'Backlog',    view: 'backlog',    Icon: AlignJustify, shortcut: '3' },
  { label: 'Calendario', view: 'calendar',   Icon: CalendarDays, shortcut: '4' },
  { label: 'Tabla',      view: 'table',      Icon: List,         shortcut: '5' },
];

export default function CommandPalette({ onNavigate, onNewTask, onSignOut }: CommandPaletteProps) {
  const { open, setOpen } = useCommandPalette();
  const tasks = useTasks((s) => s.tasks);

  const close = useCallback(() => setOpen(false), [setOpen]);

  const runAndClose = useCallback((fn: () => void) => {
    fn();
    close();
  }, [close]);

  // Close on Escape (cmdk handles it internally, but also via overlay click)
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, close]);

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  );
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            key="cp-panel"
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-[15vh] -translate-x-1/2 w-full max-w-[600px] px-4 z-[101]"
          >
            <Command
              className="cp-root"
              shouldFilter={true}
              loop
            >
              {/* Search input */}
              <div className="cp-input-wrapper">
                <Search size={16} className="cp-search-icon" />
                <Command.Input
                  className="cp-input"
                  placeholder="Buscar tareas, navegar, acciones..."
                  autoFocus
                />
              </div>

              <Command.List className="cp-list">
                <Command.Empty className="cp-empty">
                  <Zap size={18} className="mx-auto mb-2 text-gray-300" />
                  Sin resultados
                </Command.Empty>

                {/* ── Quick actions ── */}
                <Command.Group heading="Acciones" className="cp-group">
                  <Command.Item
                    value="nueva tarea crear add"
                    onSelect={() => runAndClose(onNewTask)}
                    className="cp-item"
                  >
                    <div className="cp-item-icon bg-indigo-50 text-indigo-600">
                      <Plus size={14} />
                    </div>
                    <span className="cp-item-label">Nueva tarea</span>
                    <kbd className="cp-kbd">N</kbd>
                  </Command.Item>

                  <Command.Item
                    value="cerrar sesion salir logout sign out"
                    onSelect={() => runAndClose(onSignOut)}
                    className="cp-item"
                  >
                    <div className="cp-item-icon bg-red-50 text-red-500">
                      <LogOut size={14} />
                    </div>
                    <span className="cp-item-label">Cerrar sesión</span>
                  </Command.Item>
                </Command.Group>

                {/* ── Navigation ── */}
                <Command.Group heading="Navegar" className="cp-group">
                  {NAV_COMMANDS.map(({ label, view, Icon, shortcut }) => (
                    <Command.Item
                      key={view}
                      value={`navegar ${label} ${view}`}
                      onSelect={() => runAndClose(() => onNavigate(view))}
                      className="cp-item"
                    >
                      <div className="cp-item-icon bg-slate-100 text-slate-600">
                        <Icon size={14} />
                      </div>
                      <span className="cp-item-label">{label}</span>
                      {shortcut && <kbd className="cp-kbd">{shortcut}</kbd>}
                    </Command.Item>
                  ))}
                </Command.Group>

                {/* ── In Progress tasks ── */}
                {inProgressTasks.length > 0 && (
                  <Command.Group heading="En Progreso" className="cp-group">
                    {inProgressTasks.slice(0, 5).map((task) => (
                      <Command.Item
                        key={task.id}
                        value={`${task.title} ${task.assignee ?? ''} en progreso`}
                        onSelect={() => runAndClose(() => onNavigate('board'))}
                        className="cp-item"
                      >
                        <div className="cp-item-icon bg-blue-50 text-blue-500">
                          <Clock size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="cp-item-label truncate">{task.title}</p>
                          {task.assignee && (
                            <p className="text-xs text-gray-400 truncate">{task.assignee}</p>
                          )}
                        </div>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT_CLASSES[task.priority]}`} />
                        <span className="cp-meta">{PRIORITY_LABELS[task.priority]}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* ── Overdue tasks ── */}
                {overdueTasks.length > 0 && (
                  <Command.Group heading="Vencidas" className="cp-group">
                    {overdueTasks.slice(0, 4).map((task) => (
                      <Command.Item
                        key={task.id}
                        value={`${task.title} ${task.assignee ?? ''} vencida overdue`}
                        onSelect={() => runAndClose(() => onNavigate('backlog'))}
                        className="cp-item"
                      >
                        <div className="cp-item-icon bg-red-50 text-red-500">
                          <AlertCircle size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="cp-item-label truncate">{task.title}</p>
                          <p className="text-xs text-gray-400">{STATUS_LABELS[task.status]}</p>
                        </div>
                        <span className="cp-kbd text-red-400 bg-red-50">Vencida</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* ── All tasks (searchable) ── */}
                <Command.Group heading="Todas las tareas" className="cp-group">
                  {tasks.slice(0, 20).map((task) => (
                    <Command.Item
                      key={task.id}
                      value={`${task.title} ${task.assignee ?? ''} ${task.status} ${task.priority}`}
                      onSelect={() => runAndClose(() => onNavigate('board'))}
                      className="cp-item"
                    >
                      <div className="cp-item-icon bg-gray-100 text-gray-500">
                        <CheckCircle2 size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`cp-item-label truncate ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
                          {task.title}
                        </p>
                        {task.assignee && (
                          <p className="text-xs text-gray-400 truncate">{task.assignee}</p>
                        )}
                      </div>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT_CLASSES[task.priority]}`} />
                      <span className="cp-meta">{STATUS_LABELS[task.status]}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>

              {/* Footer hint */}
              <div className="cp-footer">
                <span><kbd className="cp-kbd-sm">↑↓</kbd> navegar</span>
                <span><kbd className="cp-kbd-sm">↵</kbd> seleccionar</span>
                <span><kbd className="cp-kbd-sm">Esc</kbd> cerrar</span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
