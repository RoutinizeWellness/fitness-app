-- Tabla para dispositivos Bluetooth
CREATE TABLE IF NOT EXISTS bluetooth_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  last_connected TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Índices para búsquedas comunes
  UNIQUE (user_id, device_id)
);

-- Tabla para rutas (GPS)
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  total_distance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  average_pace DECIMAL(10, 2),
  activity_type VARCHAR(50) NOT NULL,
  points JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Índices para búsquedas comunes
  INDEX (user_id, start_time)
);

-- Tabla para notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  icon VARCHAR(255),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  action_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Índices para búsquedas comunes
  INDEX (user_id, created_at)
);

-- Tabla para logros
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  level VARCHAR(50) NOT NULL,
  threshold INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla para logros de usuario
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Índices para búsquedas comunes
  UNIQUE (user_id, achievement_id)
);

-- Tabla para datos de usuario (perfil extendido)
CREATE TABLE IF NOT EXISTS user_health_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL(5, 2),
  height DECIMAL(5, 2),
  birth_date DATE,
  gender VARCHAR(10),
  activity_level VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Índices para búsquedas comunes
  UNIQUE (user_id)
);

-- Políticas RLS para bluetooth_devices
ALTER TABLE bluetooth_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bluetooth devices"
  ON bluetooth_devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bluetooth devices"
  ON bluetooth_devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bluetooth devices"
  ON bluetooth_devices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bluetooth devices"
  ON bluetooth_devices FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para routes
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own routes"
  ON routes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own routes"
  ON routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes"
  ON routes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes"
  ON routes FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas RLS para user_health_profile
ALTER TABLE user_health_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health profile"
  ON user_health_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health profile"
  ON user_health_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health profile"
  ON user_health_profile FOR UPDATE
  USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para user_health_profile
CREATE TRIGGER update_user_health_profile_updated_at
BEFORE UPDATE ON user_health_profile
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insertar logros predefinidos
INSERT INTO achievements (name, description, icon, category, level, threshold, points)
VALUES
  ('Primeros Pasos', 'Completa 5,000 pasos en un día', 'footprints', 'steps', 'bronze', 5000, 10),
  ('Caminante', 'Completa 10,000 pasos en un día', 'footprints', 'steps', 'silver', 10000, 20),
  ('Maratonista', 'Completa 20,000 pasos en un día', 'footprints', 'steps', 'gold', 20000, 50),
  ('Ultra Maratonista', 'Completa 30,000 pasos en un día', 'footprints', 'steps', 'platinum', 30000, 100),
  
  ('Primer Entrenamiento', 'Completa tu primer entrenamiento', 'dumbbell', 'workouts', 'bronze', 1, 10),
  ('Entrenador Regular', 'Completa 10 entrenamientos', 'dumbbell', 'workouts', 'silver', 10, 20),
  ('Entrenador Dedicado', 'Completa 50 entrenamientos', 'dumbbell', 'workouts', 'gold', 50, 50),
  ('Entrenador Élite', 'Completa 100 entrenamientos', 'dumbbell', 'workouts', 'platinum', 100, 100),
  
  ('Buen Descanso', 'Duerme 7 horas en una noche', 'moon', 'sleep', 'bronze', 7, 10),
  ('Descanso Óptimo', 'Duerme 8 horas en una noche', 'moon', 'sleep', 'silver', 8, 20),
  ('Maestro del Descanso', 'Duerme 8 horas durante 7 noches consecutivas', 'moon', 'sleep', 'gold', 7, 50),
  
  ('Bien Hidratado', 'Bebe 2 litros de agua en un día', 'droplet', 'general', 'bronze', 2, 10),
  ('Perfectamente Hidratado', 'Bebe 2.5 litros de agua en un día', 'droplet', 'general', 'silver', 2.5, 20),
  
  ('Racha Inicial', 'Mantén una racha de 3 días', 'zap', 'streak', 'bronze', 3, 10),
  ('Racha Semanal', 'Mantén una racha de 7 días', 'zap', 'streak', 'silver', 7, 20),
  ('Racha Mensual', 'Mantén una racha de 30 días', 'zap', 'streak', 'gold', 30, 50),
  ('Racha Legendaria', 'Mantén una racha de 100 días', 'zap', 'streak', 'platinum', 100, 100);
