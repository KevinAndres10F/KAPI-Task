import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Board } from './components/Board';
import { TaskModal } from './components/TaskModal';
import type { Task, Column } from './types';
import './App.css';

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Diseñar interfaz',
    description: 'Crear mockups y prototipos de la aplicación',
    status: 'todo',
    order: 0,
  },
  {
    id: '2',
    title: 'Configurar backend',
    description: 'Configurar servidor y base de datos',
    status: 'in-progress',
    order: 0,
  },
  {
    id: '3',
    title: 'Implementar autenticación',
    description: 'Crear sistema de login y registro',
    status: 'in-progress',
    order: 1,
  },
  {
    id: '4',
    title: 'Deploy inicial',
    description: 'Desplegar a Netlify',
    status: 'done',
    order: 0,
  },
];

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const columns: Column[] = [
    {
      id: 'todo',
      title: 'Por Hacer',
      tasks: tasks.filter((t) => t.status === 'todo'),
    },
    {
      id: 'in-progress',
      title: 'En Progreso',
      tasks: tasks.filter((t) => t.status === 'in-progress'),
    },
    {
      id: 'done',
      title: 'Completado',
      tasks: tasks.filter((t) => t.status === 'done'),
    },
  ];

  const handleAddTask = (columnId: string) => {
    setSelectedTask(undefined);
    setSelectedColumnId(columnId);
    setModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setSelectedColumnId(task.status);
    setModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (selectedTask) {
      // Actualizar tarea existente
      setTasks((prev) =>
        prev.map((t) => (t.id === selectedTask.id ? { ...t, ...taskData } : t))
      );
    } else {
      // Crear nueva tarea
      setTasks((prev) => [
        ...prev,
        {
          id: taskData.id || crypto.randomUUID(),
          title: taskData.title || '',
          description: taskData.description || '',
          status: (taskData.status || selectedColumnId) as Task['status'],
          order: taskData.order || 0,
        },
      ]);
    }
  };

  const handleTasksChange = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="bg-white dark:bg-gray-950 min-h-screen">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">KAPI Task Board</h1>
              <p className="text-blue-100 text-sm mt-1">
                Gestiona tus proyectos de manera visual y colaborativa
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-blue-700 dark:hover:bg-blue-700 rounded-lg transition-colors"
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {darkMode ? (
                <Sun size={24} />
              ) : (
                <Moon size={24} />
              )}
            </button>
          </div>
        </header>

        {/* Board */}
        <main>
          <Board
            columns={columns}
            onTasksChange={handleTasksChange}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        </main>

        {/* Modal */}
        <TaskModal
          isOpen={modalOpen}
          task={selectedTask}
          columnId={selectedColumnId}
          onClose={() => {
            setModalOpen(false);
            setSelectedTask(undefined);
            setSelectedColumnId('');
          }}
          onSave={handleSaveTask}
        />
      </div>
    </div>
  );
}

export default App;
