-- Script para crear tablas para entrenadores personales y nutricionistas

-- Tabla para perfiles de entrenadores
CREATE TABLE IF NOT EXISTS trainer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  specialties TEXT[] NOT NULL,
  experience_years INTEGER NOT NULL,
  certifications TEXT[],
  bio TEXT,
  hourly_rate NUMERIC,
  availability JSONB,
  max_clients INTEGER DEFAULT 20,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para perfiles de nutricionistas
CREATE TABLE IF NOT EXISTS nutritionist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  specialties TEXT[] NOT NULL,
  experience_years INTEGER NOT NULL,
  certifications TEXT[],
  bio TEXT,
  hourly_rate NUMERIC,
  availability JSONB,
  max_clients INTEGER DEFAULT 20,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para relaciones cliente-profesional
CREATE TABLE IF NOT EXISTS client_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL,
  client_id UUID REFERENCES auth.users NOT NULL,
  professional_type TEXT NOT NULL CHECK (professional_type IN ('trainer', 'nutritionist')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'paused', 'terminated')),
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(professional_id, client_id, professional_type)
);

-- Tabla para asignaciones de entrenamiento
CREATE TABLE IF NOT EXISTS training_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID NOT NULL,
  client_id UUID REFERENCES auth.users NOT NULL,
  routine_id UUID REFERENCES workout_routines,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  feedback TEXT,
  client_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para asignaciones de nutrición
CREATE TABLE IF NOT EXISTS nutrition_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID NOT NULL,
  client_id UUID REFERENCES auth.users NOT NULL,
  meal_plan_id UUID REFERENCES meal_plans,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  feedback TEXT,
  client_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para mensajes entre profesionales y clientes
CREATE TABLE IF NOT EXISTS client_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users NOT NULL,
  recipient_id UUID REFERENCES auth.users NOT NULL,
  relationship_id UUID REFERENCES client_relationships,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para evaluaciones y seguimiento
CREATE TABLE IF NOT EXISTS client_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL,
  client_id UUID REFERENCES auth.users NOT NULL,
  professional_type TEXT NOT NULL CHECK (professional_type IN ('trainer', 'nutritionist')),
  assessment_date DATE NOT NULL,
  metrics JSONB NOT NULL,
  notes TEXT,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para pagos y facturación
CREATE TABLE IF NOT EXISTS professional_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL,
  client_id UUID REFERENCES auth.users NOT NULL,
  professional_type TEXT NOT NULL CHECK (professional_type IN ('trainer', 'nutritionist')),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'EUR',
  payment_date DATE NOT NULL,
  payment_method TEXT,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritionist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_payments ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles de entrenadores
CREATE POLICY "Entrenadores pueden ver su propio perfil"
ON trainer_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Entrenadores pueden actualizar su propio perfil"
ON trainer_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Entrenadores pueden insertar su propio perfil"
ON trainer_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clientes pueden ver perfiles de entrenadores"
ON trainer_profiles FOR SELECT
USING (is_verified = TRUE);

-- Políticas para perfiles de nutricionistas (similar a entrenadores)
CREATE POLICY "Nutricionistas pueden ver su propio perfil"
ON nutritionist_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Nutricionistas pueden actualizar su propio perfil"
ON nutritionist_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Nutricionistas pueden insertar su propio perfil"
ON nutritionist_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clientes pueden ver perfiles de nutricionistas"
ON nutritionist_profiles FOR SELECT
USING (is_verified = TRUE);

-- Políticas para relaciones cliente-profesional
CREATE POLICY "Profesionales pueden ver sus relaciones con clientes"
ON client_relationships FOR SELECT
USING (auth.uid() = professional_id);

CREATE POLICY "Clientes pueden ver sus relaciones con profesionales"
ON client_relationships FOR SELECT
USING (auth.uid() = client_id);

-- Políticas para asignaciones de entrenamiento
CREATE POLICY "Entrenadores pueden ver asignaciones que han creado"
ON training_assignments FOR SELECT
USING (auth.uid() = trainer_id);

CREATE POLICY "Clientes pueden ver sus asignaciones de entrenamiento"
ON training_assignments FOR SELECT
USING (auth.uid() = client_id);

-- Políticas para asignaciones de nutrición
CREATE POLICY "Nutricionistas pueden ver asignaciones que han creado"
ON nutrition_assignments FOR SELECT
USING (auth.uid() = nutritionist_id);

CREATE POLICY "Clientes pueden ver sus asignaciones de nutrición"
ON nutrition_assignments FOR SELECT
USING (auth.uid() = client_id);

-- Políticas para mensajes
CREATE POLICY "Usuarios pueden ver mensajes enviados o recibidos"
ON client_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Usuarios pueden enviar mensajes"
ON client_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_trainer_profiles_user_id ON trainer_profiles(user_id);
CREATE INDEX idx_nutritionist_profiles_user_id ON nutritionist_profiles(user_id);
CREATE INDEX idx_client_relationships_professional_id ON client_relationships(professional_id);
CREATE INDEX idx_client_relationships_client_id ON client_relationships(client_id);
CREATE INDEX idx_training_assignments_trainer_id ON training_assignments(trainer_id);
CREATE INDEX idx_training_assignments_client_id ON training_assignments(client_id);
CREATE INDEX idx_nutrition_assignments_nutritionist_id ON nutrition_assignments(nutritionist_id);
CREATE INDEX idx_nutrition_assignments_client_id ON nutrition_assignments(client_id);
CREATE INDEX idx_client_messages_sender_id ON client_messages(sender_id);
CREATE INDEX idx_client_messages_recipient_id ON client_messages(recipient_id);
CREATE INDEX idx_client_assessments_professional_id ON client_assessments(professional_id);
CREATE INDEX idx_client_assessments_client_id ON client_assessments(client_id);
