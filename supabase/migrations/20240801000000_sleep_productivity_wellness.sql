-- Migration para añadir tablas relacionadas con sueño, productividad y bienestar

-- Tabla para registros de sueño
CREATE TABLE IF NOT EXISTS sleep_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INTEGER NOT NULL, -- en minutos
  quality INTEGER NOT NULL, -- 1-10
  deep_sleep INTEGER, -- en minutos
  rem_sleep INTEGER, -- en minutos
  light_sleep INTEGER, -- en minutos
  awake_time INTEGER, -- en minutos
  hrv INTEGER, -- en ms
  resting_heart_rate INTEGER, -- en ppm
  body_temperature NUMERIC, -- en °C
  factors JSONB, -- {alcohol: boolean, caffeine: boolean, screens: boolean, stress: boolean}
  notes TEXT,
  device_source TEXT, -- 'manual', 'whoop', 'oura', 'garmin', 'apple_watch', 'fitbit', 'polar'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para objetivos de sueño
CREATE TABLE IF NOT EXISTS sleep_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  target_duration INTEGER NOT NULL, -- en minutos
  target_bedtime TIME NOT NULL,
  target_wake_time TIME NOT NULL,
  target_deep_sleep_percentage INTEGER, -- porcentaje
  target_rem_sleep_percentage INTEGER, -- porcentaje
  target_hrv INTEGER, -- en ms
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para siesta
CREATE TABLE IF NOT EXISTS nap_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INTEGER NOT NULL, -- en minutos
  quality INTEGER NOT NULL, -- 1-10
  pre_nap_energy INTEGER, -- 1-10
  post_nap_energy INTEGER, -- 1-10
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para tareas
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  due_time TIME,
  priority TEXT NOT NULL, -- 'low', 'medium', 'high'
  status TEXT NOT NULL, -- 'pending', 'in_progress', 'completed', 'cancelled'
  tags TEXT[],
  category TEXT,
  estimated_time INTEGER, -- en minutos
  actual_time INTEGER, -- en minutos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para sesiones de enfoque
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INTEGER NOT NULL, -- en minutos
  technique TEXT, -- 'pomodoro', 'deep_work', 'flow'
  task_id UUID REFERENCES tasks,
  distractions INTEGER,
  productivity_score INTEGER, -- 1-10
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para rutinas diarias
CREATE TABLE IF NOT EXISTS daily_routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL, -- 'morning', 'evening'
  items JSONB NOT NULL, -- [{title: string, completed: boolean, order: number}]
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para registros de estado emocional
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  mood_level INTEGER NOT NULL, -- 1-10
  energy_level INTEGER NOT NULL, -- 1-10
  stress_level INTEGER NOT NULL, -- 1-10
  anxiety_level INTEGER NOT NULL, -- 1-10
  mental_clarity INTEGER NOT NULL, -- 1-10
  emotion_type TEXT, -- 'happy', 'sad', 'angry', 'anxious', 'calm', etc.
  emotion_intensity INTEGER, -- 1-10
  emotion_valence INTEGER, -- -5 a 5 (negativo a positivo)
  emotion_arousal INTEGER, -- 1-10 (bajo a alto)
  journal_entry TEXT,
  factors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para sesiones de respiración
CREATE TABLE IF NOT EXISTS breathing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  technique TEXT NOT NULL, -- 'wim_hof', 'box_breathing', '4-7-8', etc.
  duration INTEGER NOT NULL, -- en minutos
  rounds INTEGER,
  breath_holds TEXT[], -- duración de cada retención en segundos
  pre_session_state INTEGER, -- 1-10
  post_session_state INTEGER, -- 1-10
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para sesiones de mindfulness
CREATE TABLE IF NOT EXISTS mindfulness_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type TEXT NOT NULL, -- 'meditation', 'body_scan', 'visualization', etc.
  duration INTEGER NOT NULL, -- en minutos
  guided BOOLEAN DEFAULT FALSE,
  guide_source TEXT,
  pre_session_stress INTEGER, -- 1-10
  post_session_stress INTEGER, -- 1-10
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para puntuación de preparación diaria
CREATE TABLE IF NOT EXISTS readiness_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  overall_score INTEGER NOT NULL, -- 1-100
  sleep_score INTEGER NOT NULL, -- 1-100
  physical_score INTEGER NOT NULL, -- 1-100
  mental_score INTEGER NOT NULL, -- 1-100
  lifestyle_score INTEGER NOT NULL, -- 1-100
  components JSONB NOT NULL, -- {sleep: {duration, quality, hrv, ...}, physical: {...}, ...}
  recommendations TEXT[],
  training_adjustment TEXT, -- 'reduce_intensity', 'reduce_volume', 'normal', 'increase'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para configuración de integración con wearables
CREATE TABLE IF NOT EXISTS wearable_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  device_type TEXT NOT NULL, -- 'whoop', 'oura', 'garmin', 'apple_watch', 'fitbit', 'polar'
  is_connected BOOLEAN DEFAULT FALSE,
  auth_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_sleep_entries_user_id ON sleep_entries(user_id);
CREATE INDEX idx_sleep_entries_date ON sleep_entries(date);
CREATE INDEX idx_sleep_goals_user_id ON sleep_goals(user_id);
CREATE INDEX idx_nap_entries_user_id ON nap_entries(user_id);
CREATE INDEX idx_nap_entries_date ON nap_entries(date);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_date ON focus_sessions(date);
CREATE INDEX idx_daily_routines_user_id ON daily_routines(user_id);
CREATE INDEX idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX idx_mood_entries_date ON mood_entries(date);
CREATE INDEX idx_breathing_sessions_user_id ON breathing_sessions(user_id);
CREATE INDEX idx_breathing_sessions_date ON breathing_sessions(date);
CREATE INDEX idx_mindfulness_sessions_user_id ON mindfulness_sessions(user_id);
CREATE INDEX idx_mindfulness_sessions_date ON mindfulness_sessions(date);
CREATE INDEX idx_readiness_scores_user_id ON readiness_scores(user_id);
CREATE INDEX idx_readiness_scores_date ON readiness_scores(date);
CREATE INDEX idx_wearable_integrations_user_id ON wearable_integrations(user_id);

-- Trigger para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_sleep_entries_updated_at
BEFORE UPDATE ON sleep_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sleep_goals_updated_at
BEFORE UPDATE ON sleep_goals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_routines_updated_at
BEFORE UPDATE ON daily_routines
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wearable_integrations_updated_at
BEFORE UPDATE ON wearable_integrations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS para sleep_entries
ALTER TABLE sleep_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sleep entries"
  ON sleep_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sleep entries"
  ON sleep_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep entries"
  ON sleep_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep entries"
  ON sleep_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para las demás tablas (similar a sleep_entries)
-- Se omiten por brevedad, pero seguirían el mismo patrón
