-- Tablas adicionales para el sistema de administración

-- Tabla para almacenar configuraciones del sistema
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabla para logs de actividad del sistema
CREATE TABLE IF NOT EXISTS system_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  admin_user_id UUID REFERENCES auth.users(id),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para notificaciones administrativas
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  target_users UUID[] DEFAULT '{}', -- Array de user IDs, vacío = todos los admins
  read_by UUID[] DEFAULT '{}', -- Array de admin IDs que han leído
  action_url TEXT,
  action_label TEXT,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para acciones masivas
CREATE TABLE IF NOT EXISTS bulk_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  target_users UUID[] NOT NULL,
  parameters JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  results JSONB DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para plantillas de comunicación
CREATE TABLE IF NOT EXISTS communication_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'notification', 'sms')),
  subject TEXT,
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}', -- Variables disponibles como {nombre}, {email}, etc.
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para métricas del sistema (snapshots diarios)
CREATE TABLE IF NOT EXISTS system_metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_users INTEGER NOT NULL,
  active_users INTEGER NOT NULL,
  new_users INTEGER NOT NULL,
  total_workouts INTEGER NOT NULL,
  avg_adherence DECIMAL(5,2),
  avg_fatigue DECIMAL(5,2),
  avg_session_duration DECIMAL(8,2),
  system_health TEXT DEFAULT 'good' CHECK (system_health IN ('excellent', 'good', 'warning', 'critical')),
  alerts_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

-- Tabla para configuraciones de usuario específicas del admin
CREATE TABLE IF NOT EXISTS admin_user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  admin_notes TEXT,
  tags TEXT[] DEFAULT '{}',
  priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5),
  custom_flags JSONB DEFAULT '{}',
  last_contact_date TIMESTAMPTZ,
  contact_method TEXT,
  special_instructions TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para seguimiento de cambios en perfiles de usuario
CREATE TABLE IF NOT EXISTS profile_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  changed_by UUID REFERENCES auth.users(id) NOT NULL,
  field_name TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  change_reason TEXT,
  change_type TEXT DEFAULT 'update' CHECK (change_type IN ('create', 'update', 'delete')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_system_activity_logs_user_id ON system_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_activity_logs_created_at ON system_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_activity_logs_activity_type ON system_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_system_activity_logs_severity ON system_activity_logs(severity);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_priority ON admin_notifications(priority DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);

CREATE INDEX IF NOT EXISTS idx_bulk_actions_status ON bulk_actions(status);
CREATE INDEX IF NOT EXISTS idx_bulk_actions_created_by ON bulk_actions(created_by);
CREATE INDEX IF NOT EXISTS idx_bulk_actions_created_at ON bulk_actions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_communication_templates_type ON communication_templates(type);
CREATE INDEX IF NOT EXISTS idx_communication_templates_category ON communication_templates(category);
CREATE INDEX IF NOT EXISTS idx_communication_templates_is_active ON communication_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_system_metrics_snapshots_date ON system_metrics_snapshots(date DESC);

CREATE INDEX IF NOT EXISTS idx_profile_change_history_user_id ON profile_change_history(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_change_history_changed_by ON profile_change_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_profile_change_history_created_at ON profile_change_history(created_at DESC);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_config_updated_at
  BEFORE UPDATE ON system_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_templates_updated_at
  BEFORE UPDATE ON communication_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_user_settings_updated_at
  BEFORE UPDATE ON admin_user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para registrar actividad del sistema
CREATE OR REPLACE FUNCTION log_system_activity(
  p_activity_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT '',
  p_metadata JSONB DEFAULT '{}',
  p_severity TEXT DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO system_activity_logs (
    activity_type,
    user_id,
    admin_user_id,
    description,
    metadata,
    severity
  ) VALUES (
    p_activity_type,
    p_user_id,
    auth.uid(),
    p_description,
    p_metadata,
    p_severity
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear snapshot de métricas diarias
CREATE OR REPLACE FUNCTION create_daily_metrics_snapshot()
RETURNS UUID AS $$
DECLARE
  snapshot_id UUID;
  metrics_data RECORD;
BEGIN
  -- Verificar que el usuario es admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Calcular métricas del día
  SELECT 
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM profiles WHERE last_sign_in_at > NOW() - INTERVAL '30 days') as active_users,
    (SELECT COUNT(*) FROM profiles WHERE created_at::date = CURRENT_DATE) as new_users,
    (SELECT COUNT(*) FROM workout_sessions) as total_workouts,
    (SELECT AVG(volume_completion) FROM fatigue_metrics WHERE date > NOW() - INTERVAL '30 days') as avg_adherence,
    (SELECT AVG(overall_fatigue_score) FROM fatigue_metrics WHERE date > NOW() - INTERVAL '30 days') as avg_fatigue,
    (SELECT AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/60) FROM workout_sessions WHERE completed_at IS NOT NULL AND started_at > NOW() - INTERVAL '30 days') as avg_session_duration
  INTO metrics_data;

  -- Determinar estado del sistema
  DECLARE
    system_health_status TEXT := 'good';
    alerts_count INTEGER := 0;
  BEGIN
    -- Lógica para determinar el estado del sistema
    IF metrics_data.avg_fatigue > 70 THEN
      system_health_status := 'warning';
      alerts_count := alerts_count + 1;
    END IF;
    
    IF metrics_data.avg_adherence < 60 THEN
      system_health_status := 'warning';
      alerts_count := alerts_count + 1;
    END IF;
    
    IF metrics_data.active_users::FLOAT / NULLIF(metrics_data.total_users, 0) < 0.5 THEN
      system_health_status := 'critical';
      alerts_count := alerts_count + 1;
    END IF;

    -- Insertar snapshot
    INSERT INTO system_metrics_snapshots (
      date,
      total_users,
      active_users,
      new_users,
      total_workouts,
      avg_adherence,
      avg_fatigue,
      avg_session_duration,
      system_health,
      alerts_count
    ) VALUES (
      CURRENT_DATE,
      metrics_data.total_users,
      metrics_data.active_users,
      metrics_data.new_users,
      metrics_data.total_workouts,
      metrics_data.avg_adherence,
      metrics_data.avg_fatigue,
      metrics_data.avg_session_duration,
      system_health_status,
      alerts_count
    ) 
    ON CONFLICT (date) 
    DO UPDATE SET
      total_users = EXCLUDED.total_users,
      active_users = EXCLUDED.active_users,
      new_users = EXCLUDED.new_users,
      total_workouts = EXCLUDED.total_workouts,
      avg_adherence = EXCLUDED.avg_adherence,
      avg_fatigue = EXCLUDED.avg_fatigue,
      avg_session_duration = EXCLUDED.avg_session_duration,
      system_health = EXCLUDED.system_health,
      alerts_count = EXCLUDED.alerts_count,
      created_at = NOW()
    RETURNING id INTO snapshot_id;
  END;

  RETURN snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas RLS para las nuevas tablas
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_change_history ENABLE ROW LEVEL SECURITY;

-- Políticas para system_config
CREATE POLICY "Only admin can access system config" ON system_config
  FOR ALL USING (is_admin());

-- Políticas para system_activity_logs
CREATE POLICY "Only admin can view activity logs" ON system_activity_logs
  FOR SELECT USING (is_admin());

CREATE POLICY "Only admin can insert activity logs" ON system_activity_logs
  FOR INSERT WITH CHECK (is_admin());

-- Políticas para admin_notifications
CREATE POLICY "Only admin can access notifications" ON admin_notifications
  FOR ALL USING (is_admin());

-- Políticas para bulk_actions
CREATE POLICY "Only admin can access bulk actions" ON bulk_actions
  FOR ALL USING (is_admin());

-- Políticas para communication_templates
CREATE POLICY "Only admin can access communication templates" ON communication_templates
  FOR ALL USING (is_admin());

-- Políticas para system_metrics_snapshots
CREATE POLICY "Only admin can access metrics snapshots" ON system_metrics_snapshots
  FOR ALL USING (is_admin());

-- Políticas para admin_user_settings
CREATE POLICY "Only admin can access user settings" ON admin_user_settings
  FOR ALL USING (is_admin());

-- Políticas para profile_change_history
CREATE POLICY "Only admin can view profile changes" ON profile_change_history
  FOR SELECT USING (is_admin());

CREATE POLICY "Only admin can insert profile changes" ON profile_change_history
  FOR INSERT WITH CHECK (is_admin());

-- Insertar configuraciones por defecto del sistema
INSERT INTO system_config (key, value, description, category) VALUES
  ('app_name', '"Routinize"', 'Nombre de la aplicación', 'general'),
  ('app_version', '"1.0.0"', 'Versión de la aplicación', 'general'),
  ('maintenance_mode', 'false', 'Modo de mantenimiento activado', 'system'),
  ('max_users', '10000', 'Número máximo de usuarios permitidos', 'limits'),
  ('session_timeout', '3600', 'Tiempo de expiración de sesión en segundos', 'auth'),
  ('email_notifications_enabled', 'true', 'Notificaciones por email habilitadas', 'notifications'),
  ('default_experience_level', '"intermediate"', 'Nivel de experiencia por defecto', 'training'),
  ('fatigue_threshold_warning', '70', 'Umbral de fatiga para advertencias', 'health'),
  ('adherence_threshold_warning', '60', 'Umbral de adherencia para advertencias', 'training')
ON CONFLICT (key) DO NOTHING;

-- Insertar plantillas de comunicación por defecto
INSERT INTO communication_templates (name, type, subject, content, variables, category) VALUES
  (
    'Bienvenida',
    'email',
    '¡Bienvenido a Routinize!',
    'Hola {nombre},

¡Bienvenido a Routinize! Estamos emocionados de tenerte en nuestra comunidad de fitness.

Tu cuenta ha sido creada exitosamente y ya puedes comenzar a personalizar tu experiencia de entrenamiento.

Saludos,
El equipo de Routinize',
    ARRAY['nombre', 'email'],
    'onboarding'
  ),
  (
    'Recordatorio de Entrenamiento',
    'notification',
    'Es hora de entrenar',
    'Hola {nombre}, no olvides completar tu entrenamiento de hoy. ¡Tu cuerpo te lo agradecerá!',
    ARRAY['nombre'],
    'motivation'
  ),
  (
    'Alerta de Fatiga',
    'email',
    'Recomendación de Descanso',
    'Hola {nombre},

Hemos detectado que tus niveles de fatiga han estado altos últimamente. Te recomendamos tomar un día de descanso para una mejor recuperación.

Recuerda que el descanso es tan importante como el entrenamiento.

Cuídate,
El equipo de Routinize',
    ARRAY['nombre', 'fatiga_nivel'],
    'health'
  )
ON CONFLICT DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE system_config IS 'Configuraciones globales del sistema';
COMMENT ON TABLE system_activity_logs IS 'Registro de actividad del sistema';
COMMENT ON TABLE admin_notifications IS 'Notificaciones para administradores';
COMMENT ON TABLE bulk_actions IS 'Registro de acciones masivas ejecutadas';
COMMENT ON TABLE communication_templates IS 'Plantillas para comunicación con usuarios';
COMMENT ON TABLE system_metrics_snapshots IS 'Snapshots diarios de métricas del sistema';
COMMENT ON TABLE admin_user_settings IS 'Configuraciones específicas de usuario para admins';
COMMENT ON TABLE profile_change_history IS 'Historial de cambios en perfiles de usuario';

COMMENT ON FUNCTION log_system_activity(TEXT, UUID, TEXT, JSONB, TEXT) IS 'Registra actividad del sistema';
COMMENT ON FUNCTION create_daily_metrics_snapshot() IS 'Crea snapshot diario de métricas del sistema';
