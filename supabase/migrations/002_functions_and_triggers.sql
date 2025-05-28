-- Functions and Triggers Migration
-- This migration creates functions and triggers for the fitness app

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a new profile for the user
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update profile timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update timestamps
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_interface_preferences_timestamp
  BEFORE UPDATE ON user_interface_preferences
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_workout_routines_timestamp
  BEFORE UPDATE ON workout_routines
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_workout_logs_timestamp
  BEFORE UPDATE ON workout_logs
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_nutrition_entries_timestamp
  BEFORE UPDATE ON nutrition_entries
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_nutrition_plans_timestamp
  BEFORE UPDATE ON nutrition_plans
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_recipes_timestamp
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_tasks_timestamp
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_daily_routines_timestamp
  BEFORE UPDATE ON daily_routines
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_habits_timestamp
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Function to get all users (for admin)
CREATE OR REPLACE FUNCTION get_all_users(
  page_size INTEGER DEFAULT 50,
  page_number INTEGER DEFAULT 1,
  search_query TEXT DEFAULT '',
  order_by_column TEXT DEFAULT 'created_at',
  order_direction TEXT DEFAULT 'desc'
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN,
  last_sign_in TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  offset_value INTEGER;
  order_clause TEXT;
BEGIN
  -- Calculate offset
  offset_value := (page_number - 1) * page_size;
  
  -- Build order clause
  IF order_direction = 'asc' THEN
    order_clause := order_by_column || ' ASC';
  ELSE
    order_clause := order_by_column || ' DESC';
  END IF;
  
  -- Return users with profile data
  RETURN QUERY
  SELECT
    au.id,
    au.email,
    p.full_name,
    p.avatar_url,
    p.is_admin,
    au.last_sign_in_at,
    au.created_at
  FROM
    auth.users au
  LEFT JOIN
    profiles p ON au.id = p.user_id
  WHERE
    au.email ILIKE '%' || search_query || '%' OR
    p.full_name ILIKE '%' || search_query || '%'
  ORDER BY
    CASE WHEN order_clause = 'email ASC' THEN au.email END ASC,
    CASE WHEN order_clause = 'email DESC' THEN au.email END DESC,
    CASE WHEN order_clause = 'full_name ASC' THEN p.full_name END ASC,
    CASE WHEN order_clause = 'full_name DESC' THEN p.full_name END DESC,
    CASE WHEN order_clause = 'created_at ASC' THEN au.created_at END ASC,
    CASE WHEN order_clause = 'created_at DESC' THEN au.created_at END DESC,
    CASE WHEN order_clause = 'last_sign_in_at ASC' THEN au.last_sign_in_at END ASC,
    CASE WHEN order_clause = 'last_sign_in_at DESC' THEN au.last_sign_in_at END DESC
  LIMIT page_size
  OFFSET offset_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to execute SQL (for migrations)
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  SELECT is_admin INTO admin_status
  FROM profiles
  WHERE user_id = $1;
  
  RETURN COALESCE(admin_status, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_statistics(user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH workout_stats AS (
    SELECT
      COUNT(*) AS total_workouts,
      SUM(duration) AS total_duration,
      AVG(duration) AS avg_duration,
      COUNT(DISTINCT date_trunc('week', date)) AS active_weeks
    FROM
      workout_logs
    WHERE
      user_id = $1
  ),
  nutrition_stats AS (
    SELECT
      COUNT(*) AS total_entries,
      AVG(total_calories) AS avg_calories,
      AVG(total_protein) AS avg_protein,
      AVG(total_carbs) AS avg_carbs,
      AVG(total_fat) AS avg_fat
    FROM
      nutrition_entries
    WHERE
      user_id = $1
  ),
  focus_stats AS (
    SELECT
      COUNT(*) AS total_sessions,
      SUM(duration) AS total_focus_time,
      AVG(productivity_score) AS avg_productivity
    FROM
      focus_sessions
    WHERE
      user_id = $1
  ),
  habit_stats AS (
    SELECT
      COUNT(*) AS total_habits,
      (
        SELECT COUNT(*)
        FROM habits h
        JOIN habit_logs hl ON h.id = hl.habit_id
        WHERE h.user_id = $1 AND hl.is_completed = TRUE
      ) AS completed_habits
    FROM
      habits
    WHERE
      user_id = $1
  )
  SELECT
    json_build_object(
      'workouts', json_build_object(
        'total', COALESCE((SELECT total_workouts FROM workout_stats), 0),
        'totalDuration', COALESCE((SELECT total_duration FROM workout_stats), 0),
        'avgDuration', COALESCE((SELECT avg_duration FROM workout_stats), 0),
        'activeWeeks', COALESCE((SELECT active_weeks FROM workout_stats), 0)
      ),
      'nutrition', json_build_object(
        'totalEntries', COALESCE((SELECT total_entries FROM nutrition_stats), 0),
        'avgCalories', COALESCE((SELECT avg_calories FROM nutrition_stats), 0),
        'avgProtein', COALESCE((SELECT avg_protein FROM nutrition_stats), 0),
        'avgCarbs', COALESCE((SELECT avg_carbs FROM nutrition_stats), 0),
        'avgFat', COALESCE((SELECT avg_fat FROM nutrition_stats), 0)
      ),
      'focus', json_build_object(
        'totalSessions', COALESCE((SELECT total_sessions FROM focus_stats), 0),
        'totalFocusTime', COALESCE((SELECT total_focus_time FROM focus_stats), 0),
        'avgProductivity', COALESCE((SELECT avg_productivity FROM focus_stats), 0)
      ),
      'habits', json_build_object(
        'totalHabits', COALESCE((SELECT total_habits FROM habit_stats), 0),
        'completedHabits', COALESCE((SELECT completed_habits FROM habit_stats), 0),
        'completionRate', CASE 
          WHEN COALESCE((SELECT total_habits FROM habit_stats), 0) > 0 
          THEN COALESCE((SELECT completed_habits FROM habit_stats), 0)::FLOAT / COALESCE((SELECT total_habits FROM habit_stats), 1)::FLOAT 
          ELSE 0 
        END
      )
    ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
