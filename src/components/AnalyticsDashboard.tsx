import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import { TrendingUp, Zap, Timer } from 'lucide-react';
import type { Task } from '../types';
import { subDays, format, startOfDay, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props { tasks: Task[] }

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
        <Icon size={15} />
      </div>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
  );
}

export default function AnalyticsDashboard({ tasks }: Props) {
  const today = startOfDay(new Date());

  /* ── Burndown: tasks remaining vs ideal over last 14 days ── */
  const burndown = useMemo(() => {
    const total = tasks.length;
    return Array.from({ length: 14 }, (_, i) => {
      const day = subDays(today, 13 - i);
      const label = format(day, 'dd MMM', { locale: es });
      // Count tasks that were NOT done on that day (simplified: use current done count as proxy)
      const doneSoFar = tasks.filter(
        (t) => t.status === 'done' && t.dueDate && new Date(t.dueDate) <= day
      ).length;
      const remaining = Math.max(0, total - doneSoFar);
      const ideal = Math.max(0, Math.round(total * (1 - i / 13)));
      return { label, remaining, ideal };
    });
  }, [tasks, today]);

  /* ── Velocity: tasks completed per day (last 7 days) ── */
  const velocity = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(today, 6 - i);
      const label = format(day, 'EEE', { locale: es });
      const count = tasks.filter(
        (t) =>
          t.status === 'done' &&
          t.dueDate &&
          format(new Date(t.dueDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      ).length;
      return { label, completadas: count };
    });
  }, [tasks, today]);

  /* ── Cycle time: avg hours from creation to done by priority ── */
  const cycleTime = useMemo(() => {
    const groups: Record<string, number[]> = { low: [], medium: [], high: [], critical: [] };
    tasks
      .filter((t) => t.status === 'done' && t.dueDate)
      .forEach((t) => {
        const hours = differenceInHours(new Date(t.dueDate!), new Date(t.created_at ?? t.dueDate!));
        if (hours >= 0) groups[t.priority]?.push(hours);
      });
    return Object.entries(groups).map(([priority, times]) => ({
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      horas: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
    }));
  }, [tasks]);

  const INDIGO = '#6366f1';
  const CYAN   = '#06b6d4';
  const EMERALD = '#10b981';
  const AMBER  = '#f59e0b';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Burndown chart */}
      <div className="card p-5 lg:col-span-2">
        <SectionTitle icon={TrendingUp} title="Burndown — tareas restantes vs ideal" />
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={burndown} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRemain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={INDIGO} stopOpacity={0.25} />
                <stop offset="95%" stopColor={INDIGO} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#64748b' }} />
            <Area type="monotone" dataKey="ideal"     stroke={CYAN}   strokeWidth={2} strokeDasharray="5 3" fill="none"               name="Ideal" />
            <Area type="monotone" dataKey="remaining" stroke={INDIGO}  strokeWidth={2} fill="url(#gradRemain)"                          name="Restantes" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Velocity */}
      <div className="card p-5">
        <SectionTitle icon={Zap} title="Velocidad — tareas completadas / día" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={velocity} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12 }}
            />
            <Bar dataKey="completadas" fill={EMERALD} radius={[6, 6, 0, 0]} name="Completadas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cycle time */}
      <div className="card p-5">
        <SectionTitle icon={Timer} title="Cycle Time — horas promedio hasta done" />
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={cycleTime} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="priority" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12 }}
              formatter={(v) => [`${v}h`, 'Horas']}
            />
            <Line type="monotone" dataKey="horas" stroke={AMBER} strokeWidth={2.5} dot={{ fill: AMBER, r: 5 }} name="Horas" />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
