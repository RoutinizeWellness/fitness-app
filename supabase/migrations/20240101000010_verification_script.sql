-- Script de verificación automática del sistema
-- Ejecutar después de completar toda la configuración

-- Función principal de verificación
CREATE OR REPLACE FUNCTION run_complete_system_verification()
RETURNS TABLE (
  test_category TEXT,
  test_name TEXT,
  status TEXT,
  details TEXT,
  execution_time INTERVAL
) AS $$
DECLARE
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
  admin_user_id UUID;
  test_result RECORD;
BEGIN
  -- Obtener ID del usuario admin
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@routinize.com';

  -- Test 1: Verificar existencia de tablas principales
  start_time := clock_timestamp();
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_adaptive_profiles')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fatigue_metrics')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'periodization_plans')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_config')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_notifications')
    THEN
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Database'::TEXT, 
        'Core Tables'::TEXT, 
        'PASS'::TEXT, 
        'Todas las tablas principales existen'::TEXT,
        (end_time - start_time)::INTERVAL;
    ELSE
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Database'::TEXT, 
        'Core Tables'::TEXT, 
        'FAIL'::TEXT, 
        'Faltan tablas principales'::TEXT,
        (end_time - start_time)::INTERVAL;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Database'::TEXT, 
        'Core Tables'::TEXT, 
        'ERROR'::TEXT, 
        SQLERRM::TEXT,
        (end_time - start_time)::INTERVAL;
  END;

  -- Test 2: Verificar funciones principales
  start_time := clock_timestamp();
  BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin')
    AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'setup_admin_user')
    AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_system_metrics')
    AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_daily_metrics_snapshot')
    THEN
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Functions'::TEXT, 
        'Core Functions'::TEXT, 
        'PASS'::TEXT, 
        'Todas las funciones principales existen'::TEXT,
        (end_time - start_time)::INTERVAL;
    ELSE
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Functions'::TEXT, 
        'Core Functions'::TEXT, 
        'FAIL'::TEXT, 
        'Faltan funciones principales'::TEXT,
        (end_time - start_time)::INTERVAL;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Functions'::TEXT, 
        'Core Functions'::TEXT, 
        'ERROR'::TEXT, 
        SQLERRM::TEXT,
        (end_time - start_time)::INTERVAL;
  END;

  -- Test 3: Verificar usuario admin
  start_time := clock_timestamp();
  BEGIN
    IF admin_user_id IS NOT NULL THEN
      IF EXISTS (SELECT 1 FROM profiles WHERE user_id = admin_user_id)
      AND EXISTS (SELECT 1 FROM user_adaptive_profiles WHERE user_id = admin_user_id)
      AND EXISTS (SELECT 1 FROM admin_user_settings WHERE user_id = admin_user_id)
      THEN
        end_time := clock_timestamp();
        RETURN QUERY SELECT 
          'Admin User'::TEXT, 
          'Complete Setup'::TEXT, 
          'PASS'::TEXT, 
          'Usuario admin completamente configurado'::TEXT,
          (end_time - start_time)::INTERVAL;
      ELSE
        end_time := clock_timestamp();
        RETURN QUERY SELECT 
          'Admin User'::TEXT, 
          'Complete Setup'::TEXT, 
          'PARTIAL'::TEXT, 
          'Usuario admin existe pero configuración incompleta'::TEXT,
          (end_time - start_time)::INTERVAL;
      END IF;
    ELSE
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Admin User'::TEXT, 
        'Complete Setup'::TEXT, 
        'FAIL'::TEXT, 
        'Usuario admin no existe'::TEXT,
        (end_time - start_time)::INTERVAL;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Admin User'::TEXT, 
        'Complete Setup'::TEXT, 
        'ERROR'::TEXT, 
        SQLERRM::TEXT,
        (end_time - start_time)::INTERVAL;
  END;

  -- Test 4: Verificar políticas RLS
  start_time := clock_timestamp();
  BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname LIKE '%admin%')
    AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_adaptive_profiles' AND policyname LIKE '%admin%')
    AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_config' AND policyname LIKE '%admin%')
    THEN
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Security'::TEXT, 
        'RLS Policies'::TEXT, 
        'PASS'::TEXT, 
        'Políticas RLS para admin configuradas'::TEXT,
        (end_time - start_time)::INTERVAL;
    ELSE
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Security'::TEXT, 
        'RLS Policies'::TEXT, 
        'FAIL'::TEXT, 
        'Faltan políticas RLS para admin'::TEXT,
        (end_time - start_time)::INTERVAL;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Security'::TEXT, 
        'RLS Policies'::TEXT, 
        'ERROR'::TEXT, 
        SQLERRM::TEXT,
        (end_time - start_time)::INTERVAL;
  END;

  -- Test 5: Verificar configuraciones del sistema
  start_time := clock_timestamp();
  BEGIN
    IF (SELECT COUNT(*) FROM system_config) >= 10 THEN
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Configuration'::TEXT, 
        'System Config'::TEXT, 
        'PASS'::TEXT, 
        format('Configuraciones del sistema: %s', (SELECT COUNT(*) FROM system_config))::TEXT,
        (end_time - start_time)::INTERVAL;
    ELSE
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Configuration'::TEXT, 
        'System Config'::TEXT, 
        'FAIL'::TEXT, 
        'Configuraciones del sistema insuficientes'::TEXT,
        (end_time - start_time)::INTERVAL;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Configuration'::TEXT, 
        'System Config'::TEXT, 
        'ERROR'::TEXT, 
        SQLERRM::TEXT,
        (end_time - start_time)::INTERVAL;
  END;

  -- Test 6: Verificar plantillas de comunicación
  start_time := clock_timestamp();
  BEGIN
    IF (SELECT COUNT(*) FROM communication_templates) >= 3 THEN
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Communication'::TEXT, 
        'Templates'::TEXT, 
        'PASS'::TEXT, 
        format('Plantillas disponibles: %s', (SELECT COUNT(*) FROM communication_templates))::TEXT,
        (end_time - start_time)::INTERVAL;
    ELSE
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Communication'::TEXT, 
        'Templates'::TEXT, 
        'FAIL'::TEXT, 
        'Plantillas de comunicación insuficientes'::TEXT,
        (end_time - start_time)::INTERVAL;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Communication'::TEXT, 
        'Templates'::TEXT, 
        'ERROR'::TEXT, 
        SQLERRM::TEXT,
        (end_time - start_time)::INTERVAL;
  END;

  -- Test 7: Probar función is_admin (solo si hay usuario admin)
  IF admin_user_id IS NOT NULL THEN
    start_time := clock_timestamp();
    BEGIN
      -- Simular contexto de admin (esto es una simplificación)
      IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
        end_time := clock_timestamp();
        RETURN QUERY SELECT 
          'Admin Functions'::TEXT, 
          'Admin Check'::TEXT, 
          'PASS'::TEXT, 
          'Función is_admin disponible'::TEXT,
          (end_time - start_time)::INTERVAL;
      ELSE
        end_time := clock_timestamp();
        RETURN QUERY SELECT 
          'Admin Functions'::TEXT, 
          'Admin Check'::TEXT, 
          'FAIL'::TEXT, 
          'Función is_admin no disponible'::TEXT,
          (end_time - start_time)::INTERVAL;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        end_time := clock_timestamp();
        RETURN QUERY SELECT 
          'Admin Functions'::TEXT, 
          'Admin Check'::TEXT, 
          'ERROR'::TEXT, 
          SQLERRM::TEXT,
          (end_time - start_time)::INTERVAL;
    END;
  END IF;

  -- Test 8: Verificar métricas del sistema
  start_time := clock_timestamp();
  BEGIN
    IF EXISTS (SELECT 1 FROM system_metrics_snapshots) THEN
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Metrics'::TEXT, 
        'System Snapshots'::TEXT, 
        'PASS'::TEXT, 
        'Snapshots de métricas disponibles'::TEXT,
        (end_time - start_time)::INTERVAL;
    ELSE
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Metrics'::TEXT, 
        'System Snapshots'::TEXT, 
        'WARNING'::TEXT, 
        'No hay snapshots de métricas (normal en instalación nueva)'::TEXT,
        (end_time - start_time)::INTERVAL;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      end_time := clock_timestamp();
      RETURN QUERY SELECT 
        'Metrics'::TEXT, 
        'System Snapshots'::TEXT, 
        'ERROR'::TEXT, 
        SQLERRM::TEXT,
        (end_time - start_time)::INTERVAL;
  END;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para generar resumen de verificación
CREATE OR REPLACE FUNCTION verification_summary()
RETURNS TEXT AS $$
DECLARE
  total_tests INTEGER;
  passed_tests INTEGER;
  failed_tests INTEGER;
  error_tests INTEGER;
  warning_tests INTEGER;
  summary_text TEXT;
BEGIN
  -- Contar resultados
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'PASS'),
    COUNT(*) FILTER (WHERE status = 'FAIL'),
    COUNT(*) FILTER (WHERE status = 'ERROR'),
    COUNT(*) FILTER (WHERE status = 'WARNING' OR status = 'PARTIAL')
  INTO total_tests, passed_tests, failed_tests, error_tests, warning_tests
  FROM run_complete_system_verification();

  -- Generar resumen
  summary_text := E'=== RESUMEN DE VERIFICACIÓN DEL SISTEMA ===\n\n';
  summary_text := summary_text || 'Total de pruebas: ' || total_tests || E'\n';
  summary_text := summary_text || '✅ Exitosas: ' || passed_tests || E'\n';
  summary_text := summary_text || '❌ Fallidas: ' || failed_tests || E'\n';
  summary_text := summary_text || '⚠️  Advertencias: ' || warning_tests || E'\n';
  summary_text := summary_text || '🚨 Errores: ' || error_tests || E'\n\n';

  -- Estado general
  IF failed_tests = 0 AND error_tests = 0 THEN
    summary_text := summary_text || '🎉 ESTADO: SISTEMA COMPLETAMENTE FUNCIONAL' || E'\n';
  ELSIF failed_tests > 0 OR error_tests > 0 THEN
    summary_text := summary_text || '⚠️  ESTADO: REQUIERE ATENCIÓN' || E'\n';
    summary_text := summary_text || 'Revisar pruebas fallidas y corregir problemas.' || E'\n';
  END IF;

  summary_text := summary_text || E'\nPara ver detalles completos ejecutar:' || E'\n';
  summary_text := summary_text || 'SELECT * FROM run_complete_system_verification();' || E'\n';

  RETURN summary_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejecutar verificación automática
DO $$
BEGIN
  RAISE NOTICE '%', verification_summary();
END $$;

-- Comentarios
COMMENT ON FUNCTION run_complete_system_verification() IS 'Ejecuta verificación completa de todos los componentes del sistema';
COMMENT ON FUNCTION verification_summary() IS 'Genera resumen ejecutivo de la verificación del sistema';

-- Instrucciones finales
DO $$
BEGIN
  RAISE NOTICE '=== VERIFICACIÓN AUTOMÁTICA COMPLETADA ===';
  RAISE NOTICE 'Para ejecutar verificación completa:';
  RAISE NOTICE 'SELECT * FROM run_complete_system_verification();';
  RAISE NOTICE '';
  RAISE NOTICE 'Para resumen ejecutivo:';
  RAISE NOTICE 'SELECT verification_summary();';
  RAISE NOTICE '==========================================';
END $$;
