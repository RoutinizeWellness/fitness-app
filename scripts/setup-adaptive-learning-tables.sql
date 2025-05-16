-- Tabla para almacenar la fatiga del usuario
CREATE TABLE IF NOT EXISTS user_fatigue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_fatigue FLOAT NOT NULL DEFAULT 30,
  baseline_fatigue FLOAT NOT NULL DEFAULT 20,
  recovery_rate FLOAT NOT NULL DEFAULT 5,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla para almacenar las preferencias de entrenamiento
CREATE TABLE IF NOT EXISTS training_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_time TEXT NOT NULL DEFAULT 'any',
  preferred_duration INTEGER NOT NULL DEFAULT 60,
  preferred_exercises_per_workout INTEGER NOT NULL DEFAULT 6,
  preferred_frequency INTEGER NOT NULL DEFAULT 4,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla para almacenar el historial de adaptaciones
CREATE TABLE IF NOT EXISTS adaptation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  adaptation_type TEXT NOT NULL,
  previous_value FLOAT NOT NULL,
  new_value FLOAT NOT NULL,
  reason TEXT,
  success BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de seguridad RLS (Row Level Security)

-- Políticas para user_fatigue
ALTER TABLE user_fatigue ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_fatigue_select_policy ON user_fatigue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_fatigue_insert_policy ON user_fatigue
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_fatigue_update_policy ON user_fatigue
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY user_fatigue_delete_policy ON user_fatigue
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para training_preferences
ALTER TABLE training_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY training_preferences_select_policy ON training_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY training_preferences_insert_policy ON training_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY training_preferences_update_policy ON training_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY training_preferences_delete_policy ON training_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para adaptation_history
ALTER TABLE adaptation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY adaptation_history_select_policy ON adaptation_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY adaptation_history_insert_policy ON adaptation_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY adaptation_history_update_policy ON adaptation_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY adaptation_history_delete_policy ON adaptation_history
  FOR DELETE USING (auth.uid() = user_id);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS user_fatigue_user_id_idx ON user_fatigue(user_id);
CREATE INDEX IF NOT EXISTS training_preferences_user_id_idx ON training_preferences(user_id);
CREATE INDEX IF NOT EXISTS adaptation_history_user_id_idx ON adaptation_history(user_id);
CREATE INDEX IF NOT EXISTS adaptation_history_date_idx ON adaptation_history(date);
