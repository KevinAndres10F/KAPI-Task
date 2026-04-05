import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, List, CalendarDays, BarChart2, AlignJustify,
  Plus, Search, LogOut, CheckSquare, Menu, X as CloseIcon,
  ChevronUp, ChevronDown, AlertCircle, Clock, CheckCircle2,
  TrendingUp, Users, Filter,
} from 'lucide-react';
import Column from './Column';
import TaskModal from './TaskModal';
import Calendar from './Calendar';
import type { Task, Status, Priority, ViewType } from '../types';
import {
  PRIORITY_BADGE_CLASSES, PRIORITY_DOT_CLASSES, PRIORITY_LABELS,
  STATUS_BADGE_CLASSES, STATUS_DOT_CLASSES, STATUS_LABELS,
} from '../types';
import { useTasks } from '../hooks/useTasks';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface BoardProps {
  userEmail?: string | null;
  onSignOut: () => void;
}

const NAV_ITEMS: { view: ViewType; label: string; Icon: React.ElementType }[] = [
  { view: 'dashboard', label: 'Dashboard',  Icon: BarChart2 },
  { view: 'board',     label: 'Tablero',    Icon: LayoutGrid },
  { view: 'backlog',   label: 'Backlog',    Icon: AlignJustify },
  { view: 'calendar',  label: 'Calendario', Icon: CalendarDays },
  { view: 'table',     label: 'Tabla',      Icon: List },
];

const STATUSES: { value: Status; label: string }[] = [
  { value: 'todo',        label: 'Por Hacer' },
  { value: 'in-progress', label: 'En Progreso' },
  { value: 'done',        label: 'Completado' },
];

type SortField = 'title' | 'priority' | 'dueDate' | 'status';
type SortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
};

/* ── Dashboard stat card ─────────────────────────────────── */
function StatCard({
  label, value, sub, gradient, Icon, delay = 0,
}: {
  label: string; value: number; sub: string;
  gradient: string; Icon: React.ElementType; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={`${gradient} text-white rounded-2xl p-6 shadow-lg flex items-start justify-between`}
    >
      <div>
        <p className="text-sm font-medium opacity-80 mb-1">{label}</p>
        <p className="text-4xl font-bold mb-1">{value}</p>
        <p className="text-xs opacity-70">{sub}</p>
      </div>
      <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
        <Icon size={22} />
      </div>
    </motion.div>
  );
}

/* ── Backlog row ─────────────────────────────────────────── */
function BacklogRow({ task, onEdit, onDelete }: {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
}) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="hover:bg-gray-50/50 transition-colors"
    >
      {/* Title */}
      <td className="table-cell font-medium text-gray-900 max-w-xs">
        <button
          onClick={() => onEdit(task)}
          className="text-left hover:text-blue-600 transition-colors line-clamp-2"
        >
          {task.title}
        </button>
        {task.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
        )}
      </td>

      {/* Priority */}
      <td className="table-cell">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE_CLASSES[task.priority]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT_CLASSES[task.priority]}`} />
          {PRIORITY_LABELS[task.priority]}
        </span>
      </td>

      {/* Status */}
      <td className="table-cell">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASSES[task.status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_CLASSES[task.status]}`} />
          {STATUS_LABELS[task.status]}
        </span>
      </td>

      {/* Assignee */}
      <td className="table-cell">
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {task.assignee.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-700 truncate max-w-[100px]">{task.assignee}</span>
          </div>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        )}
      </td>

      {/* Due Date */}
      <td className="table-cell">
        {task.dueDate ? (
          <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
            {isOverdue && <AlertCircle size={11} className="inline mr-1" />}
            {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true, locale: es })}
          </span>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        )}
      </td>

      {/* Subtasks */}
      <td className="table-cell">
        {(task.subtasks?.length ?? 0) > 0 ? (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-1.5 rounded-full"
                style={{
                  width: `${((task.subtasks?.filter(s => s.completed).length ?? 0) / (task.subtasks?.length ?? 1)) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs text-gray-400">
              {task.subtasks?.filter(s => s.completed).length}/{task.subtasks?.length}
            </span>
          </div>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="table-cell text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(task)}
            className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            Borrar
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

/* ── Main Board component ────────────────────────────────── */
export default function Board({ userEmail, onSignOut }: BoardProps) {
  const { tasks, deleteTask } = useTasks();
  const [viewType, setViewType] = useState<ViewType>('board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Backlog filters
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  /* ── helpers ── */
  const handleEditTask = (task: Task) => { setSelectedTask(task); setIsModalOpen(true); };
  const handleAddTask  = ()          => { setSelectedTask(null); setIsModalOpen(true); };
  const handleModalClose = ()        => { setIsModalOpen(false); setSelectedTask(null); };

  /* ── dashboard stats ── */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = useMemo(() => ({
    total:      tasks.length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done:       tasks.filter(t => t.status === 'done').length,
    overdue:    tasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < today && t.status !== 'done'
    ).length,
  }), [tasks, today]);

  /* ── backlog filtered + sorted ── */
  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.assignee?.toLowerCase().includes(q)
      );
    }
    if (filterPriority !== 'all') result = result.filter(t => t.priority === filterPriority);
    if (filterStatus   !== 'all') result = result.filter(t => t.status   === filterStatus);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'priority') cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      else if (sortField === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
      else if (sortField === 'dueDate') {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        cmp = da - db;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [tasks, search, filterPriority, filterStatus, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown size={12} className="text-gray-300" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-indigo-500" />
      : <ChevronDown size={12} className="text-indigo-500" />;
  };

  /* ── recent tasks for dashboard ── */
  const recentTasks = useMemo(() =>
    [...tasks]
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 8),
    [tasks]
  );

  /* ── sidebar nav item ── */
  const NavItem = ({ view, label, Icon }: { view: ViewType; label: string; Icon: React.ElementType }) => (
    <button
      onClick={() => { setViewType(view); setSidebarOpen(false); }}
      className={`nav-item w-full ${viewType === view ? 'nav-item-active' : 'nav-item-inactive'}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  /* ── view title ── */
  const viewTitle = NAV_ITEMS.find(n => n.view === viewType)?.label ?? 'Tablero';

  /* ── render ── */
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckSquare size={16} className="text-white" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">KAPI Task</span>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="section-label text-slate-500 px-3 mb-2">NAVEGACIÓN</p>
          {NAV_ITEMS.map(item => (
            <NavItem key={item.view} {...item} />
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {userEmail?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">{userEmail}</p>
              <p className="text-xs text-slate-500">Miembro del equipo</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0 shadow-sm">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">
              {viewTitle}
            </h1>
            {viewType === 'board' && (
              <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                {stats.inProgress} en progreso · {stats.done} completadas · {stats.total} total
              </p>
            )}
          </div>

          {/* Search (backlog only) */}
          {viewType === 'backlog' && (
            <div className="relative hidden sm:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar tareas..."
                className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           w-52 lg:w-64 placeholder:text-gray-400"
              />
            </div>
          )}

          {/* Team indicator */}
          <div className="hidden md:flex items-center gap-1.5">
            <Users size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400">Equipo</span>
          </div>

          {/* Add task */}
          <button
            onClick={handleAddTask}
            className="btn-primary flex-shrink-0"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nueva tarea</span>
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {/* ── DASHBOARD ── */}
          {viewType === 'dashboard' && (
            <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
              {/* Stats cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  label="Total Tareas"
                  value={stats.total}
                  sub="en el proyecto"
                  gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                  Icon={CheckSquare}
                  delay={0}
                />
                <StatCard
                  label="En Progreso"
                  value={stats.inProgress}
                  sub="activas ahora"
                  gradient="bg-gradient-to-br from-violet-500 to-violet-700"
                  Icon={TrendingUp}
                  delay={0.05}
                />
                <StatCard
                  label="Completadas"
                  value={stats.done}
                  sub="tareas cerradas"
                  gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
                  Icon={CheckCircle2}
                  delay={0.1}
                />
                <StatCard
                  label="Vencidas"
                  value={stats.overdue}
                  sub="requieren atención"
                  gradient="bg-gradient-to-br from-rose-500 to-rose-700"
                  Icon={AlertCircle}
                  delay={0.15}
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent tasks */}
                <div className="xl:col-span-2 card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Tareas recientes</h2>
                    <button
                      onClick={() => setViewType('backlog')}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Ver todas →
                    </button>
                  </div>
                  {recentTasks.length === 0 ? (
                    <div className="empty-state">
                      <CheckSquare size={36} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-900 font-medium text-sm">Sin tareas aún</p>
                      <p className="text-gray-500 text-xs mt-1">Crea tu primera tarea para empezar</p>
                      <button onClick={handleAddTask} className="btn-primary mt-4 mx-auto">
                        <Plus size={15} /> Nueva tarea
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentTasks.map((task, i) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                          onClick={() => handleEditTask(task)}
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT_CLASSES[task.status]}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                              {task.title}
                            </p>
                            {task.assignee && (
                              <p className="text-xs text-gray-400 truncate">{task.assignee}</p>
                            )}
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${PRIORITY_BADGE_CLASSES[task.priority]}`}>
                            {PRIORITY_LABELS[task.priority]}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-gray-400 hidden sm:block flex-shrink-0">
                              <Clock size={11} className="inline mr-1" />
                              {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true, locale: es })}
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Side panel */}
                <div className="space-y-4">
                  {/* Progress by status */}
                  <div className="card p-5">
                    <h3 className="text-base font-semibold text-gray-900 tracking-tight mb-4">Estado del proyecto</h3>
                    <div className="space-y-3">
                      {STATUSES.map(({ value, label }) => {
                        const count = tasks.filter(t => t.status === value).length;
                        const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                        return (
                          <div key={value}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">{label}</span>
                              <span className="text-sm font-medium text-gray-800">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className={`h-2 rounded-full ${
                                  value === 'done' ? 'bg-emerald-500' :
                                  value === 'in-progress' ? 'bg-blue-500' :
                                  'bg-slate-300'
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Priority distribution */}
                  <div className="card p-5">
                    <h3 className="text-base font-semibold text-gray-900 tracking-tight mb-4">Por prioridad</h3>
                    <div className="space-y-2">
                      {(['critical', 'high', 'medium', 'low'] as Priority[]).map(p => {
                        const count = tasks.filter(t => t.priority === p).length;
                        return (
                          <div key={p} className="flex items-center justify-between">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE_CLASSES[p]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT_CLASSES[p]}`} />
                              {PRIORITY_LABELS[p]}
                            </span>
                            <span className="text-sm font-semibold text-gray-700">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="card p-5">
                    <h3 className="text-base font-semibold text-gray-900 tracking-tight mb-3">Acciones rápidas</h3>
                    <div className="space-y-2">
                      <button onClick={handleAddTask} className="btn-primary w-full justify-center text-sm">
                        <Plus size={15} /> Nueva tarea
                      </button>
                      <button onClick={() => setViewType('board')} className="btn-secondary w-full justify-center text-sm">
                        <LayoutGrid size={15} /> Ver tablero
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── BOARD (KANBAN) ── */}
          {viewType === 'board' && (
            <div className="p-4 sm:p-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {STATUSES.map(status => (
                  <Column
                    key={status.value}
                    status={status.value}
                    title={status.label}
                    onEdit={handleEditTask}
                    onAddTask={handleAddTask}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── BACKLOG ── */}
          {viewType === 'backlog' && (
            <div className="p-4 sm:p-6 animate-fadeIn">
              {/* Filter bar */}
              <div className="card p-4 mb-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Filter size={15} />
                  <span className="text-sm font-medium text-gray-600">Filtros</span>
                </div>

                {/* Search (mobile) */}
                <div className="relative sm:hidden flex-1 min-w-[140px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-blue-500 w-full placeholder:text-gray-400"
                  />
                </div>

                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value as Priority | 'all')}
                  className="input w-auto py-2 flex-shrink-0"
                >
                  <option value="all">Todas las prioridades</option>
                  {(['critical', 'high', 'medium', 'low'] as Priority[]).map(p => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as Status | 'all')}
                  className="input w-auto py-2 flex-shrink-0"
                >
                  <option value="all">Todos los estados</option>
                  {STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                {(search || filterPriority !== 'all' || filterStatus !== 'all') && (
                  <button
                    onClick={() => { setSearch(''); setFilterPriority('all'); setFilterStatus('all'); }}
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 ml-auto"
                  >
                    <CloseIcon size={12} /> Limpiar
                  </button>
                )}

                <span className="text-xs text-gray-400 ml-auto">
                  {filteredTasks.length} tarea{filteredTasks.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Table */}
              {filteredTasks.length === 0 ? (
                <div className="empty-state animate-fadeIn">
                  <Search size={36} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-900 font-medium">Sin resultados</p>
                  <p className="text-gray-500 text-sm mt-1">Ajusta los filtros o crea una nueva tarea</p>
                  <button onClick={handleAddTask} className="btn-primary mt-4 mx-auto">
                    <Plus size={15} /> Nueva tarea
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="w-full">
                    <thead className="border-b border-gray-100">
                      <tr>
                        <th className="table-header-cell">
                          <button className="flex items-center gap-1" onClick={() => toggleSort('title')}>
                            Tarea <SortIcon field="title" />
                          </button>
                        </th>
                        <th className="table-header-cell">
                          <button className="flex items-center gap-1" onClick={() => toggleSort('priority')}>
                            Prioridad <SortIcon field="priority" />
                          </button>
                        </th>
                        <th className="table-header-cell">
                          <button className="flex items-center gap-1" onClick={() => toggleSort('status')}>
                            Estado <SortIcon field="status" />
                          </button>
                        </th>
                        <th className="table-header-cell">Asignado</th>
                        <th className="table-header-cell">
                          <button className="flex items-center gap-1" onClick={() => toggleSort('dueDate')}>
                            Vencimiento <SortIcon field="dueDate" />
                          </button>
                        </th>
                        <th className="table-header-cell">Subtareas</th>
                        <th className="table-header-cell text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <AnimatePresence>
                        {filteredTasks.map(task => (
                          <BacklogRow
                            key={task.id}
                            task={task}
                            onEdit={handleEditTask}
                            onDelete={id => void deleteTask(id)}
                          />
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TABLE VIEW ── */}
          {viewType === 'table' && (
            <div className="p-4 sm:p-6 animate-fadeIn">
              {tasks.length === 0 ? (
                <div className="empty-state mt-4">
                  <List size={36} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-900 font-medium">Sin tareas</p>
                  <p className="text-gray-500 text-sm mt-1">Crea tu primera tarea</p>
                  <button onClick={handleAddTask} className="btn-primary mt-4 mx-auto">
                    <Plus size={15} /> Nueva tarea
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="w-full">
                    <thead className="border-b border-gray-100">
                      <tr>
                        <th className="table-header-cell">Tarea</th>
                        <th className="table-header-cell">Prioridad</th>
                        <th className="table-header-cell">Estado</th>
                        <th className="table-header-cell">Asignado</th>
                        <th className="table-header-cell">Vencimiento</th>
                        <th className="table-header-cell text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <AnimatePresence>
                        {tasks.map(task => (
                          <BacklogRow
                            key={task.id}
                            task={task}
                            onEdit={handleEditTask}
                            onDelete={id => void deleteTask(id)}
                          />
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── CALENDAR ── */}
          {viewType === 'calendar' && (
            <div className="animate-fadeIn h-full">
              <Calendar tasks={tasks} onTaskClick={handleEditTask} />
            </div>
          )}
        </main>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        task={selectedTask}
      />
    </div>
  );
}
