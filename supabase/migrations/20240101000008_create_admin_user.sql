-- Configuración del usuario administrador
-- Este script debe ejecutarse después de crear manualmente el usuario admin@routinize.com

-- Función para configurar el usuario admin
CREATE OR REPLACE FUNCTION setup_admin_user()
RETURNS TEXT AS $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'admin@routinize.com';
BEGIN
  -- Buscar el usuario admin por email
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = admin_email;

  -- Verificar que el usuario existe
  IF admin_user_id IS NULL THEN
    RETURN 'ERROR: Usuario admin@routinize.com no encontrado. Debe crearse manualmente primero.';
  END IF;

  -- Crear o actualizar el perfil del admin
  INSERT INTO profiles (
    user_id,
    email,
    full_name,
    experience_level,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    admin_email,
    'Administrador del Sistema',
    'expert',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    experience_level = EXCLUDED.experience_level,
    updated_at = NOW();

  -- Crear perfil adaptativo para el admin
  INSERT INTO user_adaptive_profiles (
    user_id,
    experience_level,
    fitness_goals,
    available_equipment,
    time_constraints,
    physical_limitations,
    preferred_exercise_types,
    avoided_exercises,
    progression_preferences,
    recovery_capacity,
    motivation_level,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'expert',
    ARRAY['general_fitness', 'strength', 'hypertrophy'],
    ARRAY['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'],
    jsonb_build_object(
      'sessionsPerWeek', 5,
      'minutesPerSession', 90,
      'preferredDays', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      'timeOfDay', 'morning'
    ),
    ARRAY[]::TEXT[],
    ARRAY['compound', 'isolation', 'functional'],
    ARRAY[]::TEXT[],
    jsonb_build_object(
      'weightIncrement', 2.5,
      'repIncrement', 1,
      'progressionStyle', 'linear',
      'deloadFrequency', 4
    ),
    9,
    10,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    experience_level = EXCLUDED.experience_level,
    fitness_goals = EXCLUDED.fitness_goals,
    available_equipment = EXCLUDED.available_equipment,
    time_constraints = EXCLUDED.time_constraints,
    recovery_capacity = EXCLUDED.recovery_capacity,
    motivation_level = EXCLUDED.motivation_level,
    updated_at = NOW();

  -- Crear configuraciones específicas de admin
  INSERT INTO admin_user_settings (
    user_id,
    admin_notes,
    tags,
    priority_level,
    custom_flags,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'Usuario administrador del sistema con acceso completo a todas las funcionalidades.',
    ARRAY['admin', 'system', 'full_access'],
    5,
    jsonb_build_object(
      'is_super_admin', true,
      'can_modify_system_config', true,
      'can_access_all_users', true,
      'can_execute_bulk_actions', true
    ),
    admin_user_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    admin_notes = EXCLUDED.admin_notes,
    tags = EXCLUDED.tags,
    priority_level = EXCLUDED.priority_level,
    custom_flags = EXCLUDED.custom_flags,
    updated_at = NOW();

  -- Registrar la configuración en el log del sistema
  PERFORM log_system_activity(
    'admin_setup',
    admin_user_id,
    'Usuario administrador configurado correctamente',
    jsonb_build_object(
      'admin_email', admin_email,
      'setup_timestamp', NOW()
    ),
    'info'
  );

  -- Crear snapshot inicial de métricas
  PERFORM create_daily_metrics_snapshot();

  RETURN 'SUCCESS: Usuario admin configurado correctamente con ID: ' || admin_user_id::TEXT;

EXCEPTION
  WHEN OTHERS THEN
    RETURN 'ERROR: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar el estado del admin
CREATE OR REPLACE FUNCTION check_admin_status()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  has_profile BOOLEAN,
  has_adaptive_profile BOOLEAN,
  has_admin_settings BOOLEAN,
  created_at TIMESTAMPTZ,
  last_sign_in TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    p.full_name,
    (p.user_id IS NOT NULL) as has_profile,
    (uap.user_id IS NOT NULL) as has_adaptive_profile,
    (aus.user_id IS NOT NULL) as has_admin_settings,
    au.created_at,
    au.last_sign_in_at
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.user_id
  LEFT JOIN user_adaptive_profiles uap ON au.id = uap.user_id
  LEFT JOIN admin_user_settings aus ON au.id = aus.user_id
  WHERE au.email = 'admin@routinize.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para resetear configuración de admin (solo en caso de problemas)
CREATE OR REPLACE FUNCTION reset_admin_configuration()
RETURNS TEXT AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Buscar el usuario admin
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@routinize.com';

  IF admin_user_id IS NULL THEN
    RETURN 'ERROR: Usuario admin no encontrado';
  END IF;

  -- Eliminar configuraciones existentes
  DELETE FROM admin_user_settings WHERE user_id = admin_user_id;
  DELETE FROM user_adaptive_profiles WHERE user_id = admin_user_id;
  DELETE FROM profiles WHERE user_id = admin_user_id;

  -- Reconfigurar
  RETURN setup_admin_user();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insertar configuraciones iniciales del sistema si no existen
INSERT INTO system_config (key, value, description, category) VALUES
  ('admin_email', '"admin@routinize.com"', 'Email del administrador principal', 'admin'),
  ('admin_setup_completed', 'false', 'Indica si la configuración de admin está completa', 'admin'),
  ('system_initialized', 'false', 'Indica si el sistema ha sido inicializado', 'system'),
  ('last_admin_login', 'null', 'Timestamp del último login de admin', 'admin'),
  ('admin_notifications_enabled', 'true', 'Notificaciones para admin habilitadas', 'admin')
ON CONFLICT (key) DO NOTHING;

-- Crear notificación inicial para el admin
INSERT INTO admin_notifications (
  title,
  message,
  type,
  priority,
  target_users,
  created_by,
  created_at
) 
SELECT 
  'Sistema Configurado',
  'El sistema Routinize ha sido configurado correctamente. Bienvenido al panel de administración.',
  'success',
  3,
  ARRAY[au.id],
  au.id,
  NOW()
FROM auth.users au
WHERE au.email = 'admin@routinize.com'
ON CONFLICT DO NOTHING;

-- Comentarios para documentación
COMMENT ON FUNCTION setup_admin_user() IS 'Configura el usuario administrador con todos los perfiles necesarios';
COMMENT ON FUNCTION check_admin_status() IS 'Verifica el estado de configuración del usuario admin';
COMMENT ON FUNCTION reset_admin_configuration() IS 'Resetea la configuración del admin (solo para troubleshooting)';

-- Mensaje de instrucciones
DO $$
BEGIN
  RAISE NOTICE '=== CONFIGURACIÓN DE USUARIO ADMIN ===';
  RAISE NOTICE 'Para completar la configuración:';
  RAISE NOTICE '1. Crear manualmente el usuario admin@routinize.com en Supabase Auth';
  RAISE NOTICE '2. Ejecutar: SELECT setup_admin_user();';
  RAISE NOTICE '3. Verificar con: SELECT * FROM check_admin_status();';
  RAISE NOTICE '==========================================';
END $$;
