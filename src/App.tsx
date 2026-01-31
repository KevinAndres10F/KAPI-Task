import { useEffect } from 'react';
import Board from './components/Board';
import { useTasks } from './hooks/useTasks';
import './App.css';

function App() {
  const { setTasks } = useTasks();

  // Inicializar tareas de ejemplo
  useEffect(() => {
    const mockTasks = [
      {
        id: '1',
        title: 'Design Interface',
        description: 'Create mockups and prototypes',
        status: 'todo' as const,
        priority: 'high' as const,
        assignee: 'John Doe',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtasks: [
          { id: '1-1', title: 'Sketch wireframes', completed: true },
          { id: '1-2', title: 'Create high-fidelity mockups', completed: false },
        ],
        order: 0,
      },
      {
        id: '2',
        title: 'Setup Backend',
        description: 'Configure server and database',
        status: 'in-progress' as const,
        priority: 'critical' as const,
        assignee: 'Jane Smith',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtasks: [
          { id: '2-1', title: 'Setup database', completed: true },
          { id: '2-2', title: 'Configure API endpoints', completed: false },
        ],
        order: 0,
      },
      {
        id: '3',
        title: 'Implement Authentication',
        description: 'Create login and registration system',
        status: 'in-progress' as const,
        priority: 'medium' as const,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtasks: [],
        order: 1,
      },
      {
        id: '4',
        title: 'Initial Deployment',
        description: 'Deploy to Netlify',
        status: 'done' as const,
        priority: 'low' as const,
        assignee: 'Alex Johnson',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtasks: [
          { id: '4-1', title: 'Setup CI/CD', completed: true },
          { id: '4-2', title: 'Configure domain', completed: true },
        ],
        order: 0,
      },
      {
        id: '5',
        title: 'Testing',
        description: 'Write unit and integration tests',
        status: 'todo' as const,
        priority: 'high' as const,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtasks: [],
        order: 1,
      },
    ];

    setTasks(mockTasks);
  }, [setTasks]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Board />
    </div>
  );
}

export default App;
