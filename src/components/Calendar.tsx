import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Task } from '../types';
import { PRIORITY_COLORS } from '../types';

interface CalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function Calendar({ tasks, onTaskClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getTasksForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateString;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="w-full h-full mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-6 overflow-y-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 sm:px-4 py-2 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors active:scale-95"
            >
              Hoy
            </button>
            <button
              onClick={previousMonth}
              className="p-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors active:scale-95"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={20} className="sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors active:scale-95"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={20} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 md:p-4">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs sm:text-sm font-semibold text-gray-700 py-1 sm:py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );
            const dayTasks = getTasksForDate(date);
            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.01 }}
                className={`
                  aspect-square border rounded-lg p-1 sm:p-2 relative overflow-hidden
                  ${isToday(day) ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'}
                  ${isPast && !isToday(day) ? 'bg-gray-50' : ''}
                  ${dayTasks.length > 0 ? 'cursor-pointer hover:shadow-md active:scale-95' : ''}
                  transition-all duration-200
                `}
              >
                <div className="text-xs sm:text-sm font-medium text-gray-900 mb-0.5 sm:mb-1">
                  {day}
                </div>

                {/* Tasks for this day */}
                {dayTasks.length > 0 && (
                  <div className="space-y-0.5 sm:space-y-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`
                          w-full text-left text-[9px] sm:text-xs px-0.5 sm:px-1 py-0.5 rounded truncate
                          border-l-2 ${PRIORITY_COLORS[task.priority]}
                          bg-gray-50 hover:bg-gray-100 transition-colors active:scale-95
                        `}
                        title={task.title}
                      >
                        {task.title}
                      </button>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[8px] sm:text-xs text-gray-500 px-0.5 sm:px-1">
                        +{dayTasks.length - 2}
                      </div>
                    )}
                  </div>
                )}

                {/* Task count indicator */}
                {dayTasks.length > 0 && (
                  <div className="absolute top-1 right-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                      {dayTasks.length}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Leyenda de Prioridades</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-l-blue-500 bg-gray-50"></div>
            <span className="text-sm text-gray-600">Baja</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-l-yellow-500 bg-gray-50"></div>
            <span className="text-sm text-gray-600">Media</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-l-orange-500 bg-gray-50"></div>
            <span className="text-sm text-gray-600">Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-l-red-500 bg-gray-50"></div>
            <span className="text-sm text-gray-600">Crítica</span>
          </div>
        </div>
      </div>
    </div>
  );
}
