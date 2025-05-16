-- Migration para añadir tablas relacionadas con dietas personalizadas usando IA

-- Tabla para dietas personalizadas
CREATE TABLE IF NOT EXISTS personalized_diets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  diet_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  calorie_target INTEGER NOT NULL,
  protein_target NUMERIC NOT NULL,
  carbs_target NUMERIC NOT NULL,
  fat_target NUMERIC NOT NULL,
  meals_per_day INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para días de dietas personalizadas
CREATE TABLE IF NOT EXISTS personalized_diet_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diet_id UUID REFERENCES personalized_diets NOT NULL,
  day_number INTEGER NOT NULL,
  total_calories INTEGER NOT NULL,
  total_protein NUMERIC NOT NULL,
  total_carbs NUMERIC NOT NULL,
  total_fat NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para comidas de dietas personalizadas
CREATE TABLE IF NOT EXISTS personalized_diet_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diet_day_id UUID REFERENCES personalized_diet_days NOT NULL,
  meal_type TEXT NOT NULL,
  name TEXT NOT NULL,
  total_calories INTEGER NOT NULL,
  total_protein NUMERIC NOT NULL,
  total_carbs NUMERIC NOT NULL,
  total_fat NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para alimentos de comidas personalizadas
CREATE TABLE IF NOT EXISTS personalized_diet_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID REFERENCES personalized_diet_meals NOT NULL,
  food_id UUID REFERENCES food_database,
  recipe_id UUID REFERENCES recipes,
  name TEXT NOT NULL,
  serving_size NUMERIC NOT NULL,
  serving_unit TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para feedback de dietas personalizadas
CREATE TABLE IF NOT EXISTS personalized_diet_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diet_id UUID REFERENCES personalized_diets NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  adherence_score INTEGER CHECK (adherence_score BETWEEN 0 AND 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para ajustes de dietas personalizadas (historial de cambios)
CREATE TABLE IF NOT EXISTS personalized_diet_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diet_id UUID REFERENCES personalized_diets NOT NULL,
  adjustment_type TEXT NOT NULL, -- 'calorie', 'macro', 'food_preference', etc.
  previous_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_personalized_diets_user_id ON personalized_diets(user_id);
CREATE INDEX idx_personalized_diet_days_diet_id ON personalized_diet_days(diet_id);
CREATE INDEX idx_personalized_diet_meals_diet_day_id ON personalized_diet_meals(diet_day_id);
CREATE INDEX idx_personalized_diet_foods_meal_id ON personalized_diet_foods(meal_id);
CREATE INDEX idx_personalized_diet_feedback_diet_id ON personalized_diet_feedback(diet_id);
CREATE INDEX idx_personalized_diet_adjustments_diet_id ON personalized_diet_adjustments(diet_id);

-- Trigger para actualizar el timestamp de updated_at en personalized_diets
CREATE TRIGGER update_personalized_diets_updated_at
BEFORE UPDATE ON personalized_diets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Función para recomendar dietas personalizadas basadas en patrones de usuario
CREATE OR REPLACE FUNCTION recommend_personalized_diet(user_id UUID)
RETURNS TABLE (
  diet_id UUID,
  name TEXT,
  description TEXT,
  confidence NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH user_preferences AS (
    SELECT 
      np.diet_type,
      np.activity_level,
      np.goal,
      np.meals_per_day
    FROM nutrition_profiles np
    WHERE np.user_id = $1
  ),
  similar_users AS (
    SELECT 
      np.user_id,
      COUNT(*) AS similarity_score
    FROM nutrition_profiles np
    JOIN user_preferences up ON 
      np.diet_type = up.diet_type AND
      np.activity_level = up.activity_level AND
      np.goal = up.goal
    WHERE np.user_id != $1
    GROUP BY np.user_id
    ORDER BY similarity_score DESC
    LIMIT 10
  ),
  successful_diets AS (
    SELECT 
      pd.id,
      pd.name,
      pd.description,
      AVG(pdf.rating) AS avg_rating,
      AVG(pdf.adherence_score) AS avg_adherence,
      COUNT(pdf.id) AS feedback_count
    FROM personalized_diets pd
    JOIN personalized_diet_feedback pdf ON pd.id = pdf.diet_id
    JOIN similar_users su ON pd.user_id = su.user_id
    WHERE pdf.rating >= 4
    GROUP BY pd.id, pd.name, pd.description
    HAVING AVG(pdf.adherence_score) >= 70
    ORDER BY avg_rating DESC, feedback_count DESC
    LIMIT 5
  )
  SELECT 
    sd.id,
    sd.name,
    sd.description,
    (sd.avg_rating * 0.7 + sd.avg_adherence * 0.3) AS confidence
  FROM successful_diets sd
  ORDER BY confidence DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para generar estadísticas de adherencia a dietas personalizadas
CREATE OR REPLACE FUNCTION calculate_diet_adherence(diet_id UUID, user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  adherence_score INTEGER;
  total_days INTEGER;
  tracked_days INTEGER;
  macro_adherence NUMERIC;
BEGIN
  -- Obtener el número total de días de la dieta
  SELECT 
    (end_date - start_date) INTO total_days
  FROM personalized_diets
  WHERE id = diet_id;
  
  -- Contar días con entradas de nutrición
  SELECT 
    COUNT(DISTINCT date) INTO tracked_days
  FROM nutrition
  WHERE 
    user_id = $2 AND
    date BETWEEN (SELECT start_date FROM personalized_diets WHERE id = diet_id) AND
                (SELECT end_date FROM personalized_diets WHERE id = diet_id);
  
  -- Calcular adherencia a macros (simplificado)
  SELECT 
    AVG(
      LEAST(
        n.calories::NUMERIC / pd.calorie_target, 
        1.0
      ) * 100
    ) INTO macro_adherence
  FROM nutrition n
  JOIN personalized_diets pd ON pd.id = diet_id
  WHERE 
    n.user_id = $2 AND
    n.date BETWEEN pd.start_date AND pd.end_date;
  
  -- Calcular puntuación final (50% seguimiento de días, 50% adherencia a macros)
  adherence_score := (tracked_days::NUMERIC / GREATEST(total_days, 1) * 50) + 
                    (COALESCE(macro_adherence, 0) * 0.5);
  
  RETURN adherence_score;
END;
$$ LANGUAGE plpgsql;
