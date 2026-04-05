import { useState } from 'react';
import { CheckSquare, Zap, Users, BarChart3 } from 'lucide-react';
import { authApi } from '../lib/supabaseClient';

interface AuthProps {
  onAuthSuccess: () => void;
}

const FEATURES = [
  { icon: CheckSquare, text: 'Gestiona tareas en tablero Kanban' },
  { icon: Users,       text: 'Colabora con tu equipo en tiempo real' },
  { icon: BarChart3,   text: 'Visualiza métricas y progreso' },
  { icon: Zap,         text: 'Vistas de tablero, lista y calendario' },
];

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await authApi.signUp(email.trim(), password);
      } else {
        await authApi.signIn(email.trim(), password);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[480px] bg-slate-900 flex-col justify-between p-10 relative overflow-hidden flex-shrink-0">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <CheckSquare size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">KAPI Task</span>
          </div>

          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Gestión de proyectos<br />para equipos ágiles
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Organiza, prioriza y entrega con tu equipo. Todo en un solo lugar.
          </p>
        </div>

        {/* Features list */}
        <div className="relative z-10 space-y-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-indigo-300" />
              </div>
              <span className="text-slate-300 text-sm">{text}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative z-10 text-slate-500 text-xs">
          © {new Date().getFullYear()} KAPI Task · Trabajo en equipo simplificado
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fadeIn">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <CheckSquare size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">KAPI Task</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
              {isSignUp ? 'Crear cuenta' : 'Bienvenido de nuevo'}
            </h1>
            <p className="text-sm text-gray-500">
              {isSignUp
                ? 'Únete y empieza a gestionar tus proyectos.'
                : 'Inicia sesión para continuar con tus proyectos.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="tu@empresa.com"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input"
                placeholder="••••••••"
              />
              {isSignUp && (
                <p className="text-xs text-gray-400 mt-1.5">Mínimo 6 caracteres</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white
                         hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                         transition-colors shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {loading
                ? 'Cargando...'
                : isSignUp
                  ? 'Crear cuenta'
                  : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(v => !v); setError(null); }}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                {isSignUp ? 'Iniciar sesión' : 'Crear una'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
