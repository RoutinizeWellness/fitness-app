-- Initial Schema Migration
-- This migration creates the initial database schema for the fitness app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  weight NUMERIC,
  height NUMERIC,
  goal TEXT,
  level TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  experience_level TEXT DEFAULT 'intermediate',
  interface_mode TEXT DEFAULT 'beginner',
  experience_details JSONB,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  advanced_features_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user interface preferences table
CREATE TABLE IF NOT EXISTS user_interface_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  interface_mode TEXT DEFAULT 'beginner',
  theme TEXT DEFAULT 'light',
  color_scheme TEXT DEFAULT 'default',
  show_advanced_metrics BOOLEAN DEFAULT FALSE,
  show_scientific_explanations BOOLEAN DEFAULT FALSE,
  show_detailed_analytics BOOLEAN DEFAULT FALSE,
  show_periodization_tools BOOLEAN DEFAULT FALSE,
  simplified_navigation BOOLEAN DEFAULT TRUE,
  show_tutorial_tips BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user experience progression table
CREATE TABLE IF NOT EXISTS user_experience_progression (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  previous_level TEXT NOT NULL,
  new_level TEXT NOT NULL,
  progression_reason TEXT,
  assessment_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  muscle_group TEXT[] NOT NULL,
  secondary_muscle_groups TEXT[],
  difficulty TEXT DEFAULT 'intermediate',
  equipment TEXT[],
  is_compound BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  video_url TEXT,
  instructions TEXT,
  tips TEXT[],
  alternatives TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout routines table
CREATE TABLE IF NOT EXISTS workout_routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  level TEXT,
  frequency INTEGER,
  days JSONB NOT NULL,
  is_template BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  periodization_type TEXT,
  mesocycle_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout logs table
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  routine_id UUID REFERENCES workout_routines(id) ON DELETE SET NULL,
  day_id TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  duration INTEGER,
  exercises JSONB NOT NULL,
  notes TEXT,
  rating INTEGER,
  fatigue_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food database table
CREATE TABLE IF NOT EXISTS food_database (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  serving_size NUMERIC NOT NULL,
  serving_unit TEXT NOT NULL,
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  fiber NUMERIC,
  sugar NUMERIC,
  sodium NUMERIC,
  cholesterol NUMERIC,
  is_spanish_product BOOLEAN DEFAULT FALSE,
  region TEXT,
  supermarket TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nutrition entries table
CREATE TABLE IF NOT EXISTS nutrition_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT,
  food_items JSONB NOT NULL,
  total_calories NUMERIC,
  total_protein NUMERIC,
  total_carbs NUMERIC,
  total_fat NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nutrition plans table
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  daily_calories NUMERIC,
  protein_target NUMERIC,
  carbs_target NUMERIC,
  fat_target NUMERIC,
  meal_plan JSONB,
  is_active BOOLEAN DEFAULT FALSE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,
  instructions TEXT,
  preparation_time INTEGER,
  cooking_time INTEGER,
  servings INTEGER,
  difficulty TEXT,
  meal_type TEXT,
  cuisine TEXT,
  calories_per_serving NUMERIC,
  protein_per_serving NUMERIC,
  carbs_per_serving NUMERIC,
  fat_per_serving NUMERIC,
  image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  due_time TIME,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  tags TEXT[],
  category TEXT,
  estimated_time INTEGER,
  actual_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create focus sessions table
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  duration INTEGER NOT NULL,
  technique TEXT,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  distractions INTEGER,
  productivity_score INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily routines table
CREATE TABLE IF NOT EXISTS daily_routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  items JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL,
  frequency_config JSONB,
  start_date DATE,
  end_date DATE,
  reminder_time TIME,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habit logs table
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interface_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_experience_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for user_interface_preferences
CREATE POLICY "Users can view their own preferences" ON user_interface_preferences
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own preferences" ON user_interface_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for workout_routines
CREATE POLICY "Users can view their own routines or public templates" ON workout_routines
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);
  
CREATE POLICY "Users can update their own routines" ON workout_routines
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own routines" ON workout_routines
  FOR DELETE USING (auth.uid() = user_id);

-- Create policy for workout_logs
CREATE POLICY "Users can view their own workout logs" ON workout_logs
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own workout logs" ON workout_logs
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own workout logs" ON workout_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to get active users
CREATE OR REPLACE FUNCTION count_active_users(days_ago INTEGER)
RETURNS INTEGER AS $$
DECLARE
  active_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT auth.users.id)
  INTO active_count
  FROM auth.users
  WHERE last_sign_in_at >= (NOW() - (days_ago || ' days')::INTERVAL);
  
  RETURN active_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
