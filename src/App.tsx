import { useEffect, useState } from 'react';
import Board from './components/Board';
import Auth from './components/Auth';
import { useTasks } from './hooks/useTasks';
import { authApi } from './lib/supabaseClient';
import './App.css';

function App() {
  const { loadTasks, setTasks } = useTasks();
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const session = await authApi.getSession();
        setSessionEmail(session?.user?.email ?? null);
        if (session?.user) {
          await loadTasks();
        } else {
          setTasks([]);
        }
      } finally {
        setCheckingSession(false);
      }
    };

    void init();

    const { data } = authApi.onAuthStateChange((session) => {
      setSessionEmail(session?.user?.email ?? null);
      if (session?.user) {
        void loadTasks();
      } else {
        setTasks([]);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [loadTasks, setTasks]);

  const handleSignOut = async () => {
    await authApi.signOut();
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-gray-600">Checking session...</div>
      </div>
    );
  }

  if (!sessionEmail) {
    return <Auth onAuthSuccess={() => void loadTasks()} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Board userEmail={sessionEmail} onSignOut={handleSignOut} />
    </div>
  );
}

export default App;
