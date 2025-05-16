-- Migration para añadir tablas relacionadas con bienestar y productividad

-- Tabla para hábitos personalizados
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'morning_routine', 'work', 'health', 'evening', etc.
  frequency TEXT[] NOT NULL, -- ['monday', 'wednesday', 'friday'] o ['daily', 'weekdays', 'weekends']
  time_of_day TEXT, -- 'morning', 'afternoon', 'evening', o hora específica '09:00'
  duration INTEGER, -- en minutos
  reminder BOOLEAN DEFAULT FALSE,
  reminder_time TEXT, -- '15min_before', '30min_before', '1hour_before'
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para registros de hábitos completados
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  mood INTEGER, -- 1-5
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para plantillas de horarios laborales españoles
CREATE TABLE IF NOT EXISTS work_schedule_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  schedule JSONB NOT NULL, -- {monday: [{start: '09:00', end: '14:00'}, {start: '16:00', end: '19:00'}], ...}
  is_spanish BOOLEAN DEFAULT TRUE,
  includes_siesta BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para sesiones de siesta
CREATE TABLE IF NOT EXISTS siesta_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER NOT NULL, -- en minutos
  quality INTEGER, -- 1-5
  pre_siesta_energy INTEGER, -- 1-5
  post_siesta_energy INTEGER, -- 1-5
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para ejercicios de mindfulness
CREATE TABLE IF NOT EXISTS mindfulness_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'breathing', 'meditation', 'visualization', 'body_scan'
  duration INTEGER NOT NULL, -- en minutos
  difficulty TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced'
  instructions JSONB NOT NULL,
  benefits TEXT[],
  audio_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para registros de sesiones de mindfulness
CREATE TABLE IF NOT EXISTS mindfulness_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  exercise_id UUID REFERENCES mindfulness_exercises,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER NOT NULL, -- en minutos
  stress_before INTEGER, -- 1-10
  stress_after INTEGER, -- 1-10
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para programas de bienestar corporativo
CREATE TABLE IF NOT EXISTS corporate_wellness_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  goals JSONB,
  participants_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para retos corporativos
CREATE TABLE IF NOT EXISTS corporate_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES corporate_wellness_programs NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  challenge_type TEXT NOT NULL, -- 'steps', 'sleep', 'stress', 'activity'
  target_value INTEGER,
  reward TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para participantes en retos corporativos (anónimos)
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES corporate_challenges NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  anonymous_id TEXT NOT NULL, -- ID anónimo para reportes
  current_value INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para estadísticas anónimas de bienestar corporativo
CREATE TABLE IF NOT EXISTS corporate_wellness_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stats_type TEXT NOT NULL, -- 'sleep', 'stress', 'activity', 'absence'
  stats_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX idx_siesta_sessions_user_id ON siesta_sessions(user_id);
CREATE INDEX idx_mindfulness_logs_user_id ON mindfulness_logs(user_id);
CREATE INDEX idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);

-- Políticas RLS para habits
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para habit_logs
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habit logs"
  ON habit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit logs"
  ON habit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para siesta_sessions
ALTER TABLE siesta_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own siesta sessions"
  ON siesta_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own siesta sessions"
  ON siesta_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para mindfulness_logs
ALTER TABLE mindfulness_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mindfulness logs"
  ON mindfulness_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mindfulness logs"
  ON mindfulness_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
