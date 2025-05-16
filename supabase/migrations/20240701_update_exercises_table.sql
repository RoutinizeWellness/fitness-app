-- Actualización de la tabla de ejercicios para soportar una biblioteca más completa
ALTER TABLE exercises 
  -- Añadir nuevos campos
  ADD COLUMN IF NOT EXISTS secondary_muscle_groups TEXT[],
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS sub_category TEXT,
  ADD COLUMN IF NOT EXISTS tips TEXT,
  ADD COLUMN IF NOT EXISTS variations TEXT[],
  ADD COLUMN IF NOT EXISTS calories_burned NUMERIC,
  ADD COLUMN IF NOT EXISTS is_compound BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS movement_pattern TEXT,
  ADD COLUMN IF NOT EXISTS force_type TEXT,
  ADD COLUMN IF NOT EXISTS mechanics TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS popularity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Crear índices para mejorar el rendimiento de búsquedas
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_popularity ON exercises(popularity);

-- Crear trigger para actualizar el timestamp de updated_at
CREATE TRIGGER update_exercises_updated_at
BEFORE UPDATE ON exercises
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Crear tabla de favoritos de ejercicios
CREATE TABLE IF NOT EXISTS exercise_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  exercise_id UUID REFERENCES exercises NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

-- Habilitar RLS en la tabla de favoritos
ALTER TABLE exercise_favorites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para favoritos de ejercicios
CREATE POLICY "Usuarios pueden ver sus propios favoritos"
ON exercise_favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar sus propios favoritos"
ON exercise_favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propios favoritos"
ON exercise_favorites FOR DELETE
USING (auth.uid() = user_id);
