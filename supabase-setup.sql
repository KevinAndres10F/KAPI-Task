-- ============================================
-- KAPI Task Board - Supabase Database Setup
-- ============================================

-- Crear tabla de tareas
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'done')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  "order" INTEGER NOT NULL DEFAULT 0,
  assignee TEXT,
  due_date DATE,
  subtasks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Habilitar RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

-- Política: Los usuarios solo pueden ver sus propias tareas
CREATE POLICY "Users can view their own tasks"
  ON tasks
  FOR SELECT
  USING (auth.uid() = tasks.user_id);

-- Política: Los usuarios solo pueden insertar sus propias tareas
CREATE POLICY "Users can insert their own tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (auth.uid() = tasks.user_id);

-- Política: Los usuarios solo pueden actualizar sus propias tareas
CREATE POLICY "Users can update their own tasks"
  ON tasks
  FOR UPDATE
  USING (auth.uid() = tasks.user_id)
  WITH CHECK (auth.uid() = tasks.user_id);

-- Política: Los usuarios solo pueden eliminar sus propias tareas
CREATE POLICY "Users can delete their own tasks"
  ON tasks
  FOR DELETE
  USING (auth.uid() = tasks.user_id);

-- ============================================
-- Datos de ejemplo (Opcional)
-- ============================================

-- Puedes agregar tareas de ejemplo para un usuario específico
-- Reemplaza 'your-user-id' con el ID de usuario real de Supabase
/*
INSERT INTO tasks (user_id, title, description, status, priority, "order", due_date)
VALUES
  ('your-user-id', 'Tarea de ejemplo 1', 'Descripción de la tarea', 'todo', 'high', 0, CURRENT_DATE + INTERVAL '3 days'),
  ('your-user-id', 'Tarea de ejemplo 2', 'Otra descripción', 'in-progress', 'medium', 1, CURRENT_DATE + INTERVAL '7 days');
*/
