-- Migration para añadir tablas relacionadas con el algoritmo de aprendizaje

-- Tabla para almacenar patrones de usuario
CREATE TABLE IF NOT EXISTS user_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  pattern_type TEXT NOT NULL, -- 'workout_preference', 'exercise_selection', 'timing', 'intensity_response'
  pattern_data JSONB NOT NULL, -- Datos específicos del patrón
  confidence NUMERIC NOT NULL DEFAULT 0, -- Nivel de confianza (0-100)
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar preferencias aprendidas
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  preference_type TEXT NOT NULL, -- 'exercise_type', 'muscle_group', 'equipment', 'time_of_day', 'workout_duration'
  preference_value TEXT NOT NULL, -- Valor de la preferencia
  strength NUMERIC NOT NULL DEFAULT 0, -- Fuerza de la preferencia (0-100)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar feedback sobre recomendaciones
CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  recommendation_id UUID NOT NULL, -- ID de la recomendación
  recommendation_type TEXT NOT NULL, -- 'workout', 'exercise', 'plan'
  rating INTEGER NOT NULL, -- Valoración (1-5)
  feedback_text TEXT, -- Comentario opcional
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar recomendaciones inteligentes
CREATE TABLE IF NOT EXISTS smart_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation_type TEXT NOT NULL, -- 'workout', 'exercise', 'plan', 'habit'
  recommendation_data JSONB NOT NULL, -- Datos específicos de la recomendación
  confidence NUMERIC NOT NULL DEFAULT 0, -- Nivel de confianza (0-100)
  reasoning TEXT NOT NULL, -- Explicación de por qué se recomienda
  patterns_used JSONB, -- Patrones utilizados para generar la recomendación
  is_active BOOLEAN DEFAULT TRUE, -- Si la recomendación está activa
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_user_patterns_user_id ON user_patterns(user_id);
CREATE INDEX idx_user_patterns_type ON user_patterns(pattern_type);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_type ON user_preferences(preference_type);
CREATE INDEX idx_recommendation_feedback_user_id ON recommendation_feedback(user_id);
CREATE INDEX idx_recommendation_feedback_recommendation_id ON recommendation_feedback(recommendation_id);
CREATE INDEX idx_smart_recommendations_user_id ON smart_recommendations(user_id);
CREATE INDEX idx_smart_recommendations_type ON smart_recommendations(recommendation_type);

-- Trigger para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_recommendations_updated_at
BEFORE UPDATE ON smart_recommendations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
