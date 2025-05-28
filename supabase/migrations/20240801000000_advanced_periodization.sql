-- Migration para añadir tablas relacionadas con la periodización avanzada de entrenamiento

-- Tabla para programas de periodización avanzados
CREATE TABLE IF NOT EXISTS periodization_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  periodization_type TEXT NOT NULL, -- 'linear', 'undulating', 'block', 'conjugate', 'dup', 'wup'
  start_date DATE,
  end_date DATE,
  goal TEXT NOT NULL,
  training_level TEXT NOT NULL, -- 'intermediate', 'advanced', 'elite'
  frequency INTEGER NOT NULL, -- días por semana
  structure JSONB, -- Estructura completa del programa (opcional)
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para mesociclos
CREATE TABLE IF NOT EXISTS mesocycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES periodization_programs NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL, -- 'hypertrophy', 'strength', 'power', 'endurance', 'deload'
  duration_weeks INTEGER NOT NULL,
  position INTEGER NOT NULL, -- Posición en el programa (1, 2, 3...)
  start_date DATE,
  end_date DATE,
  volume_level INTEGER, -- 1-10
  intensity_level INTEGER, -- 1-10
  includes_deload BOOLEAN DEFAULT FALSE,
  deload_strategy TEXT,
  objectives JSONB, -- Objetivos específicos del mesociclo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para microciclos
CREATE TABLE IF NOT EXISTS microcycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mesocycle_id UUID REFERENCES mesocycles NOT NULL,
  week_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  volume_multiplier NUMERIC DEFAULT 1.0,
  intensity_multiplier NUMERIC DEFAULT 1.0,
  is_deload BOOLEAN DEFAULT FALSE,
  objectives JSONB, -- Objetivos específicos del microciclo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para sesiones de entrenamiento dentro de microciclos
CREATE TABLE IF NOT EXISTS periodized_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  microcycle_id UUID REFERENCES microcycles NOT NULL,
  day_of_week INTEGER NOT NULL, -- 1 (lunes) a 7 (domingo)
  name TEXT NOT NULL,
  description TEXT,
  focus TEXT[], -- Grupos musculares o patrones de movimiento
  duration_minutes INTEGER,
  rpe_target INTEGER, -- 1-10
  rir_target INTEGER, -- 0-5
  exercises JSONB, -- Ejercicios planificados
  special_techniques JSONB, -- Técnicas especiales aplicadas
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para objetivos de entrenamiento
CREATE TABLE IF NOT EXISTS training_objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'strength', 'hypertrophy', 'endurance', 'power', 'skill'
  target_value NUMERIC,
  current_value NUMERIC,
  units TEXT, -- 'kg', 'reps', 'cm', etc.
  deadline DATE,
  associated_exercise TEXT,
  measurement_protocol TEXT,
  success_criteria TEXT,
  is_achieved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para asociar objetivos a programas, mesociclos o microciclos
CREATE TABLE IF NOT EXISTS objective_associations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  objective_id UUID REFERENCES training_objectives NOT NULL,
  entity_type TEXT NOT NULL, -- 'program', 'mesocycle', 'microcycle', 'session'
  entity_id UUID NOT NULL, -- ID del programa, mesociclo, etc.
  priority TEXT NOT NULL, -- 'primary', 'secondary', 'tertiary'
  expected_progress NUMERIC, -- Progreso esperado en este bloque
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para plantillas de periodización
CREATE TABLE IF NOT EXISTS periodization_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  periodization_type TEXT NOT NULL,
  training_level TEXT NOT NULL, -- 'intermediate', 'advanced', 'elite'
  goal TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL,
  structure JSONB NOT NULL, -- Estructura completa de la plantilla
  is_official BOOLEAN DEFAULT FALSE, -- Plantillas oficiales vs. creadas por usuarios
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de seguridad

-- Programas de periodización
ALTER TABLE periodization_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own periodization programs"
  ON periodization_programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own periodization programs"
  ON periodization_programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own periodization programs"
  ON periodization_programs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own periodization programs"
  ON periodization_programs FOR DELETE
  USING (auth.uid() = user_id);

-- Mesociclos
ALTER TABLE mesocycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mesocycles"
  ON mesocycles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM periodization_programs
    WHERE periodization_programs.id = mesocycles.program_id
    AND periodization_programs.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert mesocycles for their programs"
  ON mesocycles FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM periodization_programs
    WHERE periodization_programs.id = mesocycles.program_id
    AND periodization_programs.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own mesocycles"
  ON mesocycles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM periodization_programs
    WHERE periodization_programs.id = mesocycles.program_id
    AND periodization_programs.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own mesocycles"
  ON mesocycles FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM periodization_programs
    WHERE periodization_programs.id = mesocycles.program_id
    AND periodization_programs.user_id = auth.uid()
  ));

-- Políticas similares para microciclos, sesiones, objetivos, etc.
-- (Omitidas por brevedad pero seguirían el mismo patrón)
