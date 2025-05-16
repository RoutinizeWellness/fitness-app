-- Crear tabla para datos de salud
CREATE TABLE IF NOT EXISTS health_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  steps INTEGER,
  heart_rate INTEGER,
  calories_burned INTEGER,
  active_minutes INTEGER,
  distance DECIMAL(10, 2),
  sleep_duration DECIMAL(5, 2),
  water_intake DECIMAL(5, 2),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Índices para búsquedas comunes
  UNIQUE (user_id, date)
);

-- Crear tabla para metas de salud
CREATE TABLE IF NOT EXISTS health_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  steps INTEGER NOT NULL DEFAULT 10000,
  heart_rate_min INTEGER NOT NULL DEFAULT 60,
  heart_rate_max INTEGER NOT NULL DEFAULT 100,
  calories INTEGER NOT NULL DEFAULT 2200,
  active_minutes INTEGER NOT NULL DEFAULT 30,
  sleep_duration DECIMAL(5, 2) NOT NULL DEFAULT 8.0,
  water_intake DECIMAL(5, 2) NOT NULL DEFAULT 2.5,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Índices para búsquedas comunes
  UNIQUE (user_id)
);

-- Crear tabla para registros de sensores
CREATE TABLE IF NOT EXISTS sensor_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  sensor_type VARCHAR(50) NOT NULL,
  value JSONB NOT NULL,
  device_info JSONB,
  
  -- Índices para búsquedas comunes
  INDEX (user_id, sensor_type, timestamp)
);

-- Políticas RLS para health_data
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health data"
  ON health_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health data"
  ON health_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health data"
  ON health_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health data"
  ON health_data FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para health_goals
ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health goals"
  ON health_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health goals"
  ON health_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health goals"
  ON health_goals FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas RLS para sensor_logs
ALTER TABLE sensor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sensor logs"
  ON sensor_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sensor logs"
  ON sensor_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Función para actualizar last_updated automáticamente
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.last_updated = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para health_data
CREATE TRIGGER update_health_data_last_updated
BEFORE UPDATE ON health_data
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();

-- Trigger para health_goals
CREATE TRIGGER update_health_goals_last_updated
BEFORE UPDATE ON health_goals
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();
