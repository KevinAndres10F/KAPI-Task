-- =====================================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- Dashboard -> SQL Editor -> New query -> Pegar y Run
-- =====================================================

-- 1. Primero, eliminar políticas existentes que filtran por usuario
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
DROP POLICY IF EXISTS "Enable read access for all users" ON tasks;
DROP POLICY IF EXISTS "Enable insert for all users" ON tasks;
DROP POLICY IF EXISTS "Enable update for all users" ON tasks;
DROP POLICY IF EXISTS "Enable delete for all users" ON tasks;

-- 2. Habilitar RLS si no está habilitado
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 3. Crear nuevas políticas COLABORATIVAS (todos ven todo)

-- Todos pueden ver TODAS las tareas
CREATE POLICY "Everyone can view all tasks" ON tasks
  FOR SELECT USING (true);

-- Todos pueden crear tareas
CREATE POLICY "Everyone can create tasks" ON tasks
  FOR INSERT WITH CHECK (true);

-- Todos pueden actualizar cualquier tarea
CREATE POLICY "Everyone can update all tasks" ON tasks
  FOR UPDATE USING (true);

-- Todos pueden eliminar cualquier tarea
CREATE POLICY "Everyone can delete all tasks" ON tasks
  FOR DELETE USING (true);

-- =====================================================
-- VERIFICAR: Ir a Database -> Tables -> tasks -> Policies
-- Deberías ver 4 políticas con "true" como condición
-- =====================================================
