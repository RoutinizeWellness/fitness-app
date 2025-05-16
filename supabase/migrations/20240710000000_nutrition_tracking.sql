-- Migration para añadir tablas relacionadas con el seguimiento nutricional avanzado

-- Tabla para la base de datos de alimentos
CREATE TABLE IF NOT EXISTS food_database (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT,
  serving_size TEXT NOT NULL,
  serving_unit TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  fiber NUMERIC,
  sugar NUMERIC,
  sodium NUMERIC,
  cholesterol NUMERIC,
  image_url TEXT,
  barcode TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para alimentos personalizados del usuario
CREATE TABLE IF NOT EXISTS custom_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  serving_size TEXT NOT NULL,
  serving_unit TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  fiber NUMERIC,
  sugar NUMERIC,
  sodium NUMERIC,
  cholesterol NUMERIC,
  image_url TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para planes de comidas
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para detalles de planes de comidas
CREATE TABLE IF NOT EXISTS meal_plan_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id UUID REFERENCES meal_plans NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0-6 (domingo-sábado)
  meal_type TEXT NOT NULL, -- 'desayuno', 'almuerzo', 'cena', 'snack'
  food_id UUID,
  custom_food_id UUID,
  food_name TEXT NOT NULL, -- Para cuando no hay referencia a food_id o custom_food_id
  servings NUMERIC NOT NULL,
  calories INTEGER NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para objetivos nutricionales
CREATE TABLE IF NOT EXISTS nutrition_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  calories INTEGER,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC,
  fiber NUMERIC,
  sugar NUMERIC,
  sodium NUMERIC,
  water INTEGER, -- ml
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para registro de agua
CREATE TABLE IF NOT EXISTS water_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  amount INTEGER NOT NULL, -- ml
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para recomendaciones nutricionales basadas en ML
CREATE TABLE IF NOT EXISTS nutrition_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  recommendation_type TEXT NOT NULL, -- 'meal', 'food', 'plan', 'goal'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB NOT NULL,
  confidence NUMERIC NOT NULL DEFAULT 0, -- 0-100
  is_applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para análisis nutricional
CREATE TABLE IF NOT EXISTS nutrition_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  analysis_date DATE NOT NULL,
  period TEXT NOT NULL, -- 'day', 'week', 'month'
  calories_avg INTEGER,
  protein_avg NUMERIC,
  carbs_avg NUMERIC,
  fat_avg NUMERIC,
  adherence_score INTEGER, -- 0-100
  consistency_score INTEGER, -- 0-100
  variety_score INTEGER, -- 0-100
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_food_database_name ON food_database(name);
CREATE INDEX idx_custom_foods_user_id ON custom_foods(user_id);
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plan_details_meal_plan_id ON meal_plan_details(meal_plan_id);
CREATE INDEX idx_nutrition_goals_user_id ON nutrition_goals(user_id);
CREATE INDEX idx_water_log_user_id_date ON water_log(user_id, date);
CREATE INDEX idx_nutrition_recommendations_user_id ON nutrition_recommendations(user_id);
CREATE INDEX idx_nutrition_analysis_user_id_date ON nutrition_analysis(user_id, analysis_date);

-- Trigger para actualizar el timestamp de updated_at en meal_plans
CREATE TRIGGER update_meal_plans_updated_at
BEFORE UPDATE ON meal_plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar el timestamp de updated_at en nutrition_goals
CREATE TRIGGER update_nutrition_goals_updated_at
BEFORE UPDATE ON nutrition_goals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
