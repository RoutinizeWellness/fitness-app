-- Migration para añadir tablas relacionadas con características avanzadas de aprendizaje

-- Tabla para almacenar respuestas a diferentes intensidades de entrenamiento
CREATE TABLE IF NOT EXISTS intensity_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  workout_id UUID REFERENCES workouts,
  intensity_level TEXT NOT NULL, -- 'low', 'moderate', 'high'
  performance_score INTEGER NOT NULL, -- 1-10
  recovery_time INTEGER, -- horas
  mood_impact INTEGER, -- -5 a 5
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar patrones de progresión
CREATE TABLE IF NOT EXISTS progression_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  exercise_id TEXT,
  exercise_name TEXT,
  muscle_group TEXT,
  progression_rate NUMERIC, -- porcentaje de cambio por semana
  weeks_of_data INTEGER NOT NULL,
  is_progressing BOOLEAN DEFAULT FALSE,
  is_stagnant BOOLEAN DEFAULT FALSE,
  is_regressing BOOLEAN DEFAULT FALSE,
  last_progression_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar correlaciones entre estado de ánimo y entrenamiento
CREATE TABLE IF NOT EXISTS mood_correlations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  workout_type TEXT NOT NULL,
  mood_before NUMERIC,
  mood_after NUMERIC,
  mood_change NUMERIC,
  sample_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar clusters de usuarios similares
CREATE TABLE IF NOT EXISTS user_clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cluster_name TEXT NOT NULL,
  cluster_description TEXT,
  user_ids UUID[] NOT NULL,
  common_patterns JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar datos de wearables
CREATE TABLE IF NOT EXISTS wearable_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  device_type TEXT NOT NULL, -- 'fitbit', 'garmin', 'apple_health', 'google_fit', 'other'
  steps INTEGER,
  calories_burned INTEGER,
  active_minutes INTEGER,
  heart_rate JSONB, -- {resting, average, max, zones}
  sleep JSONB, -- {duration, deep, light, rem, awake, score}
  stress_level INTEGER, -- 1-100
  data_json JSONB, -- datos adicionales específicos del dispositivo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_intensity_responses_user_id ON intensity_responses(user_id);
CREATE INDEX idx_progression_patterns_user_id ON progression_patterns(user_id);
CREATE INDEX idx_mood_correlations_user_id ON mood_correlations(user_id);
CREATE INDEX idx_wearable_data_user_id ON wearable_data(user_id);
CREATE INDEX idx_wearable_data_date ON wearable_data(date);

-- Trigger para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_progression_patterns_updated_at
BEFORE UPDATE ON progression_patterns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mood_correlations_updated_at
BEFORE UPDATE ON mood_correlations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_clusters_updated_at
BEFORE UPDATE ON user_clusters
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
