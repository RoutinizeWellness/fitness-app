-- Crear tabla para planes de entrenamiento generados por IA
CREATE TABLE IF NOT EXISTS ai_workout_plans (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL,
  sessions_per_week INTEGER NOT NULL,
  focus_areas TEXT[] NOT NULL,
  workouts JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para recomendaciones de IA
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  reason TEXT,
  exercises TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para análisis de progreso de IA
CREATE TABLE IF NOT EXISTS ai_progress_analyses (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  summary TEXT NOT NULL,
  metrics JSONB NOT NULL,
  insights TEXT[],
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para consultas de IA
CREATE TABLE IF NOT EXISTS ai_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE ai_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_progress_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_queries ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para planes de entrenamiento
CREATE POLICY "Usuarios pueden ver sus propios planes de IA"
ON ai_workout_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propios planes de IA"
ON ai_workout_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios planes de IA"
ON ai_workout_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propios planes de IA"
ON ai_workout_plans FOR DELETE
USING (auth.uid() = user_id);

-- Crear políticas RLS para recomendaciones
CREATE POLICY "Usuarios pueden ver sus propias recomendaciones de IA"
ON ai_recommendations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propias recomendaciones de IA"
ON ai_recommendations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propias recomendaciones de IA"
ON ai_recommendations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propias recomendaciones de IA"
ON ai_recommendations FOR DELETE
USING (auth.uid() = user_id);

-- Crear políticas RLS para análisis de progreso
CREATE POLICY "Usuarios pueden ver sus propios análisis de progreso de IA"
ON ai_progress_analyses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propios análisis de progreso de IA"
ON ai_progress_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios análisis de progreso de IA"
ON ai_progress_analyses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propios análisis de progreso de IA"
ON ai_progress_analyses FOR DELETE
USING (auth.uid() = user_id);

-- Crear políticas RLS para consultas de IA
CREATE POLICY "Usuarios pueden ver sus propias consultas de IA"
ON ai_queries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propias consultas de IA"
ON ai_queries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ai_workout_plans_user_id ON ai_workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_progress_analyses_user_id ON ai_progress_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_queries_user_id ON ai_queries(user_id);
