-- Crear tabla de registros de entrenamiento si no existe
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  workout_id UUID,
  routine_id UUID,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  sets_completed INTEGER NOT NULL,
  reps_completed INTEGER NOT NULL,
  weight NUMERIC,
  rir INTEGER,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS workout_logs_user_id_idx ON workout_logs (user_id);
CREATE INDEX IF NOT EXISTS workout_logs_workout_id_idx ON workout_logs (workout_id);
CREATE INDEX IF NOT EXISTS workout_logs_routine_id_idx ON workout_logs (routine_id);
CREATE INDEX IF NOT EXISTS workout_logs_exercise_id_idx ON workout_logs (exercise_id);
CREATE INDEX IF NOT EXISTS workout_logs_completed_at_idx ON workout_logs (completed_at);

-- Crear política RLS para que los usuarios solo puedan ver sus propios registros
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'workout_logs' AND policyname = 'workout_logs_user_id_policy'
  ) THEN
    CREATE POLICY workout_logs_user_id_policy ON workout_logs
      FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Habilitar RLS en la tabla
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Crear función para obtener registros de entrenamiento por usuario
CREATE OR REPLACE FUNCTION get_user_workout_logs(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  workout_id UUID,
  routine_id UUID,
  exercise_id TEXT,
  exercise_name TEXT,
  sets_completed INTEGER,
  reps_completed INTEGER,
  weight NUMERIC,
  rir INTEGER,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT wl.*
  FROM workout_logs wl
  WHERE wl.user_id = p_user_id
    AND (p_start_date IS NULL OR wl.completed_at >= p_start_date)
    AND (p_end_date IS NULL OR wl.completed_at <= p_end_date)
  ORDER BY wl.completed_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
