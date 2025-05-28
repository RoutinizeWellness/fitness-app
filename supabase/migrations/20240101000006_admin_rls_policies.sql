-- Políticas RLS para acceso de administrador
-- Permite al usuario admin@routinize.com acceder a todos los datos

-- Función para verificar si el usuario es administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT email = 'admin@routinize.com'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario puede acceder a un perfil específico
CREATE OR REPLACE FUNCTION can_access_profile(profile_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- El usuario puede acceder a su propio perfil o si es admin
  RETURN (
    auth.uid() = profile_user_id OR is_admin()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para la tabla profiles
DROP POLICY IF EXISTS "Users can view own profile and admin can view all" ON profiles;
CREATE POLICY "Users can view own profile and admin can view all" ON profiles
  FOR SELECT USING (can_access_profile(user_id));

DROP POLICY IF EXISTS "Users can update own profile and admin can update all" ON profiles;
CREATE POLICY "Users can update own profile and admin can update all" ON profiles
  FOR UPDATE USING (can_access_profile(user_id));

DROP POLICY IF EXISTS "Admin can insert profiles" ON profiles;
CREATE POLICY "Admin can insert profiles" ON profiles
  FOR INSERT WITH CHECK (is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;
CREATE POLICY "Admin can delete profiles" ON profiles
  FOR DELETE USING (is_admin());

-- Políticas para la tabla user_adaptive_profiles
DROP POLICY IF EXISTS "Users can view own adaptive profile and admin can view all" ON user_adaptive_profiles;
CREATE POLICY "Users can view own adaptive profile and admin can view all" ON user_adaptive_profiles
  FOR SELECT USING (can_access_profile(user_id));

DROP POLICY IF EXISTS "Users can update own adaptive profile and admin can update all" ON user_adaptive_profiles;
CREATE POLICY "Users can update own adaptive profile and admin can update all" ON user_adaptive_profiles
  FOR UPDATE USING (can_access_profile(user_id));

DROP POLICY IF EXISTS "Users can insert own adaptive profile and admin can insert all" ON user_adaptive_profiles;
CREATE POLICY "Users can insert own adaptive profile and admin can insert all" ON user_adaptive_profiles
  FOR INSERT WITH CHECK (can_access_profile(user_id));

DROP POLICY IF EXISTS "Admin can delete adaptive profiles" ON user_adaptive_profiles;
CREATE POLICY "Admin can delete adaptive profiles" ON user_adaptive_profiles
  FOR DELETE USING (is_admin());

-- Políticas para la tabla fatigue_metrics
DROP POLICY IF EXISTS "Users can view own fatigue metrics and admin can view all" ON fatigue_metrics;
CREATE POLICY "Users can view own fatigue metrics and admin can view all" ON fatigue_metrics
  FOR SELECT USING (can_access_profile(user_id));

DROP POLICY IF EXISTS "Users can insert own fatigue metrics and admin can insert all" ON fatigue_metrics;
CREATE POLICY "Users can insert own fatigue metrics and admin can insert all" ON fatigue_metrics
  FOR INSERT WITH CHECK (can_access_profile(user_id));

DROP POLICY IF EXISTS "Users can update own fatigue metrics and admin can update all" ON fatigue_metrics;
CREATE POLICY "Users can update own fatigue metrics and admin can update all" ON fatigue_metrics
  FOR UPDATE USING (can_access_profile(user_id));

DROP POLICY IF EXISTS "Admin can delete fatigue metrics" ON fatigue_metrics;
CREATE POLICY "Admin can delete fatigue metrics" ON fatigue_metrics
  FOR DELETE USING (is_admin());

-- Políticas para la tabla periodization_plans
DROP POLICY IF EXISTS "Users can view own periodization plans and admin can view all" ON periodization_plans;
CREATE POLICY "Users can view own periodization plans and admin can view all" ON periodization_plans
  FOR SELECT USING (can_access_profile(user_id));

DROP POLICY IF EXISTS "Users can update own periodization plans and admin can update all" ON periodization_plans;
CREATE POLICY "Users can update own periodization plans and admin can update all" ON periodization_plans
  FOR UPDATE USING (can_access_profile(user_id));

DROP POLICY IF EXISTS "Users can insert own periodization plans and admin can insert all" ON periodization_plans;
CREATE POLICY "Users can insert own periodization plans and admin can insert all" ON periodization_plans
  FOR INSERT WITH CHECK (can_access_profile(user_id));

DROP POLICY IF EXISTS "Admin can delete periodization plans" ON periodization_plans;
CREATE POLICY "Admin can delete periodization plans" ON periodization_plans
  FOR DELETE USING (is_admin());

-- Políticas para la tabla workout_sessions
DROP POLICY IF EXISTS "Users can view own workout sessions and admin can view all" ON workout_sessions;
CREATE POLICY "Users can view own workout sessions and admin can view all" ON workout_sessions
  FOR SELECT USING (can_access_profile(user_id));

DROP POLICY IF EXISTS "Users can insert own workout sessions and admin can insert all" ON workout_sessions;
CREATE POLICY "Users can insert own workout sessions and admin can insert all" ON workout_sessions
  FOR INSERT WITH CHECK (can_access_profile(user_id));

DROP POLICY IF EXISTS "Users can update own workout sessions and admin can update all" ON workout_sessions;
CREATE POLICY "Users can update own workout sessions and admin can update all" ON workout_sessions
  FOR UPDATE USING (can_access_profile(user_id));

DROP POLICY IF EXISTS "Admin can delete workout sessions" ON workout_sessions;
CREATE POLICY "Admin can delete workout sessions" ON workout_sessions
  FOR DELETE USING (is_admin());

-- Políticas para la tabla exercise_logs
DROP POLICY IF EXISTS "Users can view own exercise logs and admin can view all" ON exercise_logs;
CREATE POLICY "Users can view own exercise logs and admin can view all" ON exercise_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws 
      WHERE ws.id = exercise_logs.workout_session_id 
      AND can_access_profile(ws.user_id)
    )
  );

DROP POLICY IF EXISTS "Users can insert own exercise logs and admin can insert all" ON exercise_logs;
CREATE POLICY "Users can insert own exercise logs and admin can insert all" ON exercise_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions ws 
      WHERE ws.id = exercise_logs.workout_session_id 
      AND can_access_profile(ws.user_id)
    )
  );

DROP POLICY IF EXISTS "Users can update own exercise logs and admin can update all" ON exercise_logs;
CREATE POLICY "Users can update own exercise logs and admin can update all" ON exercise_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws 
      WHERE ws.id = exercise_logs.workout_session_id 
      AND can_access_profile(ws.user_id)
    )
  );

DROP POLICY IF EXISTS "Admin can delete exercise logs" ON exercise_logs;
CREATE POLICY "Admin can delete exercise logs" ON exercise_logs
  FOR DELETE USING (is_admin());

-- Políticas para la tabla progress_metrics
DROP POLICY IF EXISTS "Users can view own progress metrics and admin can view all" ON progress_metrics;
CREATE POLICY "Users can view own progress metrics and admin can view all" ON progress_metrics
  FOR SELECT USING (can_access_profile(user_id));

DROP POLICY IF EXISTS "Users can insert own progress metrics and admin can insert all" ON progress_metrics;
CREATE POLICY "Users can insert own progress metrics and admin can insert all" ON progress_metrics
  FOR INSERT WITH CHECK (can_access_profile(user_id));

DROP POLICY IF EXISTS "Users can update own progress metrics and admin can update all" ON progress_metrics;
CREATE POLICY "Users can update own progress metrics and admin can update all" ON progress_metrics
  FOR UPDATE USING (can_access_profile(user_id));

DROP POLICY IF EXISTS "Admin can delete progress metrics" ON progress_metrics;
CREATE POLICY "Admin can delete progress metrics" ON progress_metrics
  FOR DELETE USING (is_admin());

-- Políticas para la tabla progression_history
DROP POLICY IF EXISTS "Users can view own progression history and admin can view all" ON progression_history;
CREATE POLICY "Users can view own progression history and admin can view all" ON progression_history
  FOR SELECT USING (can_access_profile(user_id));

DROP POLICY IF EXISTS "Users can insert own progression history and admin can insert all" ON progression_history;
CREATE POLICY "Users can insert own progression history and admin can insert all" ON progression_history
  FOR INSERT WITH CHECK (can_access_profile(user_id));

DROP POLICY IF EXISTS "Admin can delete progression history" ON progression_history;
CREATE POLICY "Admin can delete progression history" ON progression_history
  FOR DELETE USING (is_admin());

-- Políticas para la tabla phase_transitions
DROP POLICY IF EXISTS "Users can view own phase transitions and admin can view all" ON phase_transitions;
CREATE POLICY "Users can view own phase transitions and admin can view all" ON phase_transitions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM periodization_plans pp 
      WHERE pp.id = phase_transitions.plan_id 
      AND can_access_profile(pp.user_id)
    )
  );

DROP POLICY IF EXISTS "Users can insert own phase transitions and admin can insert all" ON phase_transitions;
CREATE POLICY "Users can insert own phase transitions and admin can insert all" ON phase_transitions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM periodization_plans pp 
      WHERE pp.id = phase_transitions.plan_id 
      AND can_access_profile(pp.user_id)
    )
  );

DROP POLICY IF EXISTS "Admin can delete phase transitions" ON phase_transitions;
CREATE POLICY "Admin can delete phase transitions" ON phase_transitions
  FOR DELETE USING (is_admin());

-- Crear vista para estadísticas de administrador
CREATE OR REPLACE VIEW admin_user_stats AS
SELECT 
  p.user_id,
  p.full_name,
  p.email,
  p.created_at,
  p.last_sign_in_at,
  p.experience_level,
  uap.recovery_capacity,
  uap.motivation_level,
  COUNT(DISTINCT ws.id) as total_workouts,
  AVG(fm.overall_fatigue_score) as avg_fatigue,
  AVG(fm.volume_completion) as avg_adherence,
  MAX(ws.created_at) as last_workout_date
FROM profiles p
LEFT JOIN user_adaptive_profiles uap ON p.user_id = uap.user_id
LEFT JOIN workout_sessions ws ON p.user_id = ws.user_id
LEFT JOIN fatigue_metrics fm ON p.user_id = fm.user_id
GROUP BY p.user_id, p.full_name, p.email, p.created_at, p.last_sign_in_at, 
         p.experience_level, uap.recovery_capacity, uap.motivation_level;

-- Política para la vista de estadísticas de admin
DROP POLICY IF EXISTS "Only admin can view user stats" ON admin_user_stats;
CREATE POLICY "Only admin can view user stats" ON admin_user_stats
  FOR SELECT USING (is_admin());

-- Función para obtener métricas del sistema (solo admin)
CREATE OR REPLACE FUNCTION get_system_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Verificar que el usuario es admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'active_users', (SELECT COUNT(*) FROM profiles WHERE last_sign_in_at > NOW() - INTERVAL '30 days'),
    'new_users_today', (SELECT COUNT(*) FROM profiles WHERE created_at::date = CURRENT_DATE),
    'total_workouts', (SELECT COUNT(*) FROM workout_sessions),
    'avg_adherence', (SELECT AVG(volume_completion) FROM fatigue_metrics WHERE date > NOW() - INTERVAL '30 days'),
    'avg_fatigue', (SELECT AVG(overall_fatigue_score) FROM fatigue_metrics WHERE date > NOW() - INTERVAL '30 days'),
    'high_fatigue_users', (SELECT COUNT(DISTINCT user_id) FROM fatigue_metrics WHERE overall_fatigue_score > 70 AND date > NOW() - INTERVAL '7 days')
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener actividad reciente (solo admin)
CREATE OR REPLACE FUNCTION get_recent_activity(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  activity_type TEXT,
  user_id UUID,
  user_name TEXT,
  description TEXT,
  timestamp TIMESTAMPTZ,
  severity TEXT
) AS $$
BEGIN
  -- Verificar que el usuario es admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  (
    SELECT 
      'user_registration'::TEXT,
      p.user_id,
      p.full_name,
      'Nuevo usuario registrado'::TEXT,
      p.created_at,
      'info'::TEXT
    FROM profiles p
    WHERE p.created_at > NOW() - INTERVAL '24 hours'
    ORDER BY p.created_at DESC
    LIMIT limit_count / 4
  )
  UNION ALL
  (
    SELECT 
      'workout_completed'::TEXT,
      ws.user_id,
      p.full_name,
      'Completó entrenamiento'::TEXT,
      ws.completed_at,
      'info'::TEXT
    FROM workout_sessions ws
    JOIN profiles p ON ws.user_id = p.user_id
    WHERE ws.completed_at IS NOT NULL 
    AND ws.completed_at > NOW() - INTERVAL '24 hours'
    ORDER BY ws.completed_at DESC
    LIMIT limit_count / 4
  )
  UNION ALL
  (
    SELECT 
      'high_fatigue'::TEXT,
      fm.user_id,
      p.full_name,
      'Alta fatiga detectada'::TEXT,
      fm.created_at,
      'warning'::TEXT
    FROM fatigue_metrics fm
    JOIN profiles p ON fm.user_id = p.user_id
    WHERE fm.overall_fatigue_score > 80
    AND fm.created_at > NOW() - INTERVAL '24 hours'
    ORDER BY fm.created_at DESC
    LIMIT limit_count / 4
  )
  ORDER BY timestamp DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON FUNCTION is_admin() IS 'Verifica si el usuario actual es administrador';
COMMENT ON FUNCTION can_access_profile(UUID) IS 'Verifica si el usuario puede acceder a un perfil específico';
COMMENT ON FUNCTION get_system_metrics() IS 'Obtiene métricas del sistema (solo admin)';
COMMENT ON FUNCTION get_recent_activity(INTEGER) IS 'Obtiene actividad reciente del sistema (solo admin)';
COMMENT ON VIEW admin_user_stats IS 'Vista con estadísticas de usuarios para administradores';
