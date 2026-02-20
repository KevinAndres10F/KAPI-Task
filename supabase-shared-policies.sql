-- Shared board policies (safe migration)
-- Apply this in Supabase SQL Editor to make tasks visible/editable
-- by all authenticated users, without dropping existing data.

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can update all tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can delete all tasks" ON tasks;

CREATE POLICY "Authenticated users can view all tasks"
  ON tasks
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update all tasks"
  ON tasks
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete all tasks"
  ON tasks
  FOR DELETE
  USING (auth.uid() IS NOT NULL);
