-- Tabla para hábitos personalizados
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  frequency TEXT[] NOT NULL,
  time_of_day TEXT,
  duration INTEGER,
  reminder BOOLEAN DEFAULT FALSE,
  reminder_time TEXT,
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
  mood INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para plantillas de horarios laborales españoles
CREATE TABLE IF NOT EXISTS work_schedule_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  schedule JSONB NOT NULL,
  is_spanish BOOLEAN DEFAULT TRUE,
  includes_siesta BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para sesiones de siesta
CREATE TABLE IF NOT EXISTS siesta_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER NOT NULL,
  quality INTEGER,
  pre_siesta_energy INTEGER,
  post_siesta_energy INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para ejercicios de mindfulness
CREATE TABLE IF NOT EXISTS mindfulness_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  duration INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
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
  duration INTEGER NOT NULL,
  stress_before INTEGER,
  stress_after INTEGER,
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
  challenge_type TEXT NOT NULL,
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
  anonymous_id TEXT NOT NULL,
  current_value INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para estadísticas anónimas de bienestar corporativo
CREATE TABLE IF NOT EXISTS corporate_wellness_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stats_type TEXT NOT NULL,
  stats_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_siesta_sessions_user_id ON siesta_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mindfulness_logs_user_id ON mindfulness_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);

-- Políticas RLS para habits
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'habits' AND policyname = 'Users can view their own habits'
  ) THEN
    CREATE POLICY "Users can view their own habits"
      ON habits FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'habits' AND policyname = 'Users can insert their own habits'
  ) THEN
    CREATE POLICY "Users can insert their own habits"
      ON habits FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'habits' AND policyname = 'Users can update their own habits'
  ) THEN
    CREATE POLICY "Users can update their own habits"
      ON habits FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'habits' AND policyname = 'Users can delete their own habits'
  ) THEN
    CREATE POLICY "Users can delete their own habits"
      ON habits FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Políticas RLS para habit_logs
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'habit_logs' AND policyname = 'Users can view their own habit logs'
  ) THEN
    CREATE POLICY "Users can view their own habit logs"
      ON habit_logs FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'habit_logs' AND policyname = 'Users can insert their own habit logs'
  ) THEN
    CREATE POLICY "Users can insert their own habit logs"
      ON habit_logs FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Políticas RLS para siesta_sessions
ALTER TABLE siesta_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'siesta_sessions' AND policyname = 'Users can view their own siesta sessions'
  ) THEN
    CREATE POLICY "Users can view their own siesta sessions"
      ON siesta_sessions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'siesta_sessions' AND policyname = 'Users can insert their own siesta sessions'
  ) THEN
    CREATE POLICY "Users can insert their own siesta sessions"
      ON siesta_sessions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Políticas RLS para mindfulness_logs
ALTER TABLE mindfulness_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'mindfulness_logs' AND policyname = 'Users can view their own mindfulness logs'
  ) THEN
    CREATE POLICY "Users can view their own mindfulness logs"
      ON mindfulness_logs FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'mindfulness_logs' AND policyname = 'Users can insert their own mindfulness logs'
  ) THEN
    CREATE POLICY "Users can insert their own mindfulness logs"
      ON mindfulness_logs FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;
