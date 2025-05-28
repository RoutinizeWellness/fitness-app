-- Script de configuración completa del sistema
-- Ejecuta todas las configuraciones necesarias en orden

-- Verificar que todas las tablas necesarias existen
DO $$
BEGIN
  -- Verificar tablas principales
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'Tabla profiles no existe. Ejecutar migraciones básicas primero.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_adaptive_profiles') THEN
    RAISE EXCEPTION 'Tabla user_adaptive_profiles no existe. Ejecutar migraciones de entrenamiento primero.';
  END IF;

  RAISE NOTICE 'Verificación de tablas completada exitosamente.';
END $$;

-- Función para verificar el estado completo del sistema
CREATE OR REPLACE FUNCTION system_health_check()
RETURNS TABLE (
  component TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Verificar tablas principales
  RETURN QUERY
  SELECT 
    'Database Tables'::TEXT,
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_adaptive_profiles')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fatigue_metrics')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_config')
      THEN 'OK'::TEXT
      ELSE 'ERROR'::TEXT
    END,
    'Verificación de existencia de tablas principales'::TEXT;

  -- Verificar funciones principales
  RETURN QUERY
  SELECT 
    'Core Functions'::TEXT,
    CASE 
      WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin')
      AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'setup_admin_user')
      AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_system_metrics')
      THEN 'OK'::TEXT
      ELSE 'ERROR'::TEXT
    END,
    'Verificación de funciones del sistema'::TEXT;

  -- Verificar políticas RLS
  RETURN QUERY
  SELECT 
    'RLS Policies'::TEXT,
    CASE 
      WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname LIKE '%admin%')
      AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_adaptive_profiles' AND policyname LIKE '%admin%')
      THEN 'OK'::TEXT
      ELSE 'WARNING'::TEXT
    END,
    'Verificación de políticas de seguridad'::TEXT;

  -- Verificar configuración del sistema
  RETURN QUERY
  SELECT 
    'System Config'::TEXT,
    CASE 
      WHEN EXISTS (SELECT 1 FROM system_config WHERE key = 'app_name')
      AND EXISTS (SELECT 1 FROM system_config WHERE key = 'admin_email')
      THEN 'OK'::TEXT
      ELSE 'WARNING'::TEXT
    END,
    'Verificación de configuraciones del sistema'::TEXT;

  -- Verificar usuario admin
  RETURN QUERY
  SELECT 
    'Admin User'::TEXT,
    CASE 
      WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@routinize.com')
      THEN 'OK'::TEXT
      ELSE 'PENDING'::TEXT
    END,
    'Usuario administrador debe crearse manualmente'::TEXT;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para inicializar datos de ejemplo (opcional)
CREATE OR REPLACE FUNCTION initialize_sample_data()
RETURNS TEXT AS $$
DECLARE
  result_text TEXT := '';
BEGIN
  -- Solo ejecutar si no hay datos de ejemplo
  IF NOT EXISTS (SELECT 1 FROM communication_templates WHERE name = 'Bienvenida') THEN
    
    -- Insertar plantillas de comunicación adicionales
    INSERT INTO communication_templates (name, type, subject, content, variables, category) VALUES
      (
        'Recordatorio Semanal',
        'email',
        'Tu resumen semanal de entrenamiento',
        'Hola {nombre},

Aquí tienes tu resumen de la semana:
- Entrenamientos completados: {entrenamientos_completados}
- Adherencia: {adherencia}%
- Nivel de fatiga promedio: {fatiga_promedio}

¡Sigue así!

Saludos,
El equipo de Routinize',
        ARRAY['nombre', 'entrenamientos_completados', 'adherencia', 'fatiga_promedio'],
        'reports'
      ),
      (
        'Felicitaciones por Logro',
        'notification',
        '¡Felicitaciones por tu logro!',
        '¡Excelente trabajo, {nombre}! Has alcanzado un nuevo hito: {logro_nombre}. ¡Sigue así!',
        ARRAY['nombre', 'logro_nombre'],
        'achievements'
      );

    result_text := result_text || 'Plantillas de comunicación creadas. ';
  END IF;

  -- Crear configuraciones adicionales del sistema
  INSERT INTO system_config (key, value, description, category) VALUES
    ('workout_reminder_enabled', 'true', 'Recordatorios de entrenamiento habilitados', 'notifications'),
    ('fatigue_alert_threshold', '80', 'Umbral para alertas de fatiga alta', 'health'),
    ('auto_progression_enabled', 'true', 'Progresión automática habilitada', 'training'),
    ('admin_dashboard_refresh_interval', '300', 'Intervalo de actualización del dashboard admin (segundos)', 'admin'),
    ('max_bulk_action_users', '100', 'Máximo número de usuarios para acciones masivas', 'limits')
  ON CONFLICT (key) DO NOTHING;

  result_text := result_text || 'Configuraciones del sistema actualizadas. ';

  -- Crear snapshot inicial de métricas si no existe
  IF NOT EXISTS (SELECT 1 FROM system_metrics_snapshots WHERE date = CURRENT_DATE) THEN
    PERFORM create_daily_metrics_snapshot();
    result_text := result_text || 'Snapshot inicial de métricas creado. ';
  END IF;

  RETURN 'Inicialización completada: ' || result_text;

EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error durante inicialización: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para generar reporte de configuración
CREATE OR REPLACE FUNCTION generate_setup_report()
RETURNS TEXT AS $$
DECLARE
  report TEXT := '';
  health_record RECORD;
  admin_record RECORD;
  config_count INTEGER;
  template_count INTEGER;
BEGIN
  report := E'=== REPORTE DE CONFIGURACIÓN DEL SISTEMA ===\n\n';
  
  -- Estado de salud del sistema
  report := report || E'ESTADO DE COMPONENTES:\n';
  FOR health_record IN SELECT * FROM system_health_check() LOOP
    report := report || '- ' || health_record.component || ': ' || health_record.status || E'\n';
  END LOOP;
  
  -- Estado del usuario admin
  report := report || E'\nUSUARIO ADMINISTRADOR:\n';
  SELECT * INTO admin_record FROM check_admin_status() LIMIT 1;
  
  IF admin_record.user_id IS NOT NULL THEN
    report := report || '- Email: ' || admin_record.email || E'\n';
    report := report || '- Nombre: ' || COALESCE(admin_record.full_name, 'No configurado') || E'\n';
    report := report || '- Perfil: ' || CASE WHEN admin_record.has_profile THEN 'OK' ELSE 'FALTA' END || E'\n';
    report := report || '- Perfil Adaptativo: ' || CASE WHEN admin_record.has_adaptive_profile THEN 'OK' ELSE 'FALTA' END || E'\n';
    report := report || '- Configuración Admin: ' || CASE WHEN admin_record.has_admin_settings THEN 'OK' ELSE 'FALTA' END || E'\n';
    report := report || '- Último acceso: ' || COALESCE(admin_record.last_sign_in::TEXT, 'Nunca') || E'\n';
  ELSE
    report := report || '- Estado: NO CREADO (debe crearse manualmente)' || E'\n';
  END IF;
  
  -- Configuraciones del sistema
  SELECT COUNT(*) INTO config_count FROM system_config;
  report := report || E'\nCONFIGURACIONES DEL SISTEMA:\n';
  report := report || '- Total configuraciones: ' || config_count || E'\n';
  
  -- Plantillas de comunicación
  SELECT COUNT(*) INTO template_count FROM communication_templates;
  report := report || '- Plantillas de comunicación: ' || template_count || E'\n';
  
  -- Instrucciones finales
  report := report || E'\nINSTRUCCIONES PARA COMPLETAR LA CONFIGURACIÓN:\n';
  
  IF admin_record.user_id IS NULL THEN
    report := report || E'1. Crear usuario admin@routinize.com en Supabase Auth\n';
    report := report || E'2. Ejecutar: SELECT setup_admin_user();\n';
  ELSE
    IF NOT admin_record.has_profile OR NOT admin_record.has_adaptive_profile OR NOT admin_record.has_admin_settings THEN
      report := report || E'1. Ejecutar: SELECT setup_admin_user();\n';
    ELSE
      report := report || E'1. ✓ Configuración de admin completada\n';
    END IF;
  END IF;
  
  report := report || E'2. Verificar con: SELECT * FROM system_health_check();\n';
  report := report || E'3. Probar acceso al dashboard de admin\n';
  report := report || E'4. Ejecutar pruebas del sistema adaptativo\n';
  
  report := report || E'\n=== FIN DEL REPORTE ===';
  
  RETURN report;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejecutar inicialización automática
SELECT initialize_sample_data();

-- Mostrar reporte de configuración
SELECT generate_setup_report();

-- Comentarios finales
COMMENT ON FUNCTION system_health_check() IS 'Verifica el estado de todos los componentes del sistema';
COMMENT ON FUNCTION initialize_sample_data() IS 'Inicializa datos de ejemplo y configuraciones adicionales';
COMMENT ON FUNCTION generate_setup_report() IS 'Genera un reporte completo del estado de configuración';

-- Mensaje final
DO $$
BEGIN
  RAISE NOTICE '=== MIGRACIÓN COMPLETA EJECUTADA ===';
  RAISE NOTICE 'Ejecutar: SELECT generate_setup_report(); para ver el estado completo';
  RAISE NOTICE '=====================================';
END $$;
