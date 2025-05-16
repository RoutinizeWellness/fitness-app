-- Script para crear tablas para funcionalidades de administrador

-- Tabla para mensajes masivos
CREATE TABLE IF NOT EXISTS mass_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_group TEXT NOT NULL CHECK (target_group IN ('all', 'trainers', 'nutritionists', 'clients')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_count INTEGER DEFAULT 0,
  total_recipients INTEGER DEFAULT 0
);

-- Tabla para notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para solicitudes de verificación de profesionales
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  professional_type TEXT NOT NULL CHECK (professional_type IN ('trainer', 'nutritionist')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users,
  notes TEXT,
  documents JSONB
);

-- Tabla para estadísticas de uso
CREATE TABLE IF NOT EXISTS usage_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  total_users INTEGER NOT NULL,
  active_users INTEGER NOT NULL,
  new_users INTEGER NOT NULL,
  total_trainers INTEGER NOT NULL,
  total_nutritionists INTEGER NOT NULL,
  total_workouts INTEGER NOT NULL,
  total_meal_plans INTEGER NOT NULL,
  total_client_relationships INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para registros de actividad administrativa
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE mass_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para mensajes masivos
CREATE POLICY "Administradores pueden ver todos los mensajes masivos"
ON mass_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = TRUE
  )
);

CREATE POLICY "Administradores pueden crear mensajes masivos"
ON mass_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = TRUE
  )
);

-- Políticas para notificaciones
CREATE POLICY "Usuarios pueden ver sus propias notificaciones"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Administradores pueden crear notificaciones"
ON notifications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = TRUE
  )
);

-- Políticas para solicitudes de verificación
CREATE POLICY "Profesionales pueden ver sus propias solicitudes de verificación"
ON verification_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Profesionales pueden crear solicitudes de verificación"
ON verification_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Administradores pueden ver todas las solicitudes de verificación"
ON verification_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = TRUE
  )
);

CREATE POLICY "Administradores pueden actualizar solicitudes de verificación"
ON verification_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = TRUE
  )
);

-- Políticas para estadísticas de uso
CREATE POLICY "Administradores pueden ver estadísticas de uso"
ON usage_statistics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = TRUE
  )
);

CREATE POLICY "Administradores pueden crear estadísticas de uso"
ON usage_statistics FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = TRUE
  )
);

-- Políticas para registros de actividad administrativa
CREATE POLICY "Administradores pueden ver registros de actividad"
ON admin_activity_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = TRUE
  )
);

CREATE POLICY "Administradores pueden crear registros de actividad"
ON admin_activity_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = TRUE
  )
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);
CREATE INDEX idx_mass_messages_sender_id ON mass_messages(sender_id);
CREATE INDEX idx_mass_messages_target_group ON mass_messages(target_group);
CREATE INDEX idx_usage_statistics_date ON usage_statistics(date);
CREATE INDEX idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_action ON admin_activity_logs(action);
