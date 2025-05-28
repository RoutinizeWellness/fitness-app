-- Migration for comprehensive schema implementation
-- This migration creates all necessary tables for the fitness app

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USER PROFILES ====================
-- Main user profile table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  weight NUMERIC,
  height NUMERIC,
  goal TEXT,
  level TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  experience_level VARCHAR(20) DEFAULT 'intermediate',
  interface_mode VARCHAR(20) DEFAULT 'beginner',
  experience_details JSONB DEFAULT '{"yearsOfTraining": 0, "consistencyLevel": "moderate", "technicalProficiency": "novice", "knowledgeLevel": "basic"}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  advanced_features_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interface preferences
CREATE TABLE IF NOT EXISTS user_interface_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  interface_mode VARCHAR(20) DEFAULT 'beginner',
  theme VARCHAR(20) DEFAULT 'light',
  color_scheme VARCHAR(20) DEFAULT 'default',
  show_advanced_metrics BOOLEAN DEFAULT FALSE,
  show_scientific_explanations BOOLEAN DEFAULT FALSE,
  show_detailed_analytics BOOLEAN DEFAULT FALSE,
  show_periodization_tools BOOLEAN DEFAULT FALSE,
  simplified_navigation BOOLEAN DEFAULT TRUE,
  show_tutorial_tips BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== TRAINING MODULE ====================
-- Exercise library
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  muscle_group TEXT[] NOT NULL,
  secondary_muscle_groups TEXT[],
  difficulty VARCHAR(20) DEFAULT 'intermediate',
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

-- Workout routines
CREATE TABLE IF NOT EXISTS workout_routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
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

-- Workout logs
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  routine_id UUID REFERENCES workout_routines,
  day_id TEXT,
  date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in minutes
  exercises JSONB NOT NULL,
  notes TEXT,
  rating INTEGER, -- 1-5 rating
  fatigue_level INTEGER, -- 1-10 rating
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training profiles
CREATE TABLE IF NOT EXISTS training_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  training_age INTEGER, -- in months
  training_frequency INTEGER, -- days per week
  training_goal TEXT,
  training_level TEXT,
  preferred_training_style TEXT,
  available_equipment TEXT[],
  time_availability INTEGER, -- minutes per session
  injury_history JSONB,
  strength_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  exercise_id UUID REFERENCES exercises,
  exercise_name TEXT NOT NULL,
  date DATE NOT NULL,
  weight NUMERIC,
  reps INTEGER,
  sets INTEGER,
  rpe NUMERIC, -- Rate of Perceived Exertion
  rir NUMERIC, -- Reps in Reserve
  one_rm_estimated NUMERIC, -- Estimated 1 Rep Max
  volume NUMERIC, -- Total volume (weight * reps * sets)
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Periodization plans
CREATE TABLE IF NOT EXISTS periodization_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  periodization_type TEXT,
  goal TEXT,
  mesocycles JSONB,
  microcycles JSONB,
  deload_strategy TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training recommendations
CREATE TABLE IF NOT EXISTS training_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  recommendation_type TEXT,
  recommendation_data JSONB,
  is_applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== ELITE TRAINING SYSTEM ====================
-- Training journal entries
CREATE TABLE IF NOT EXISTS training_journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  template_id TEXT,
  objective_data JSONB,
  subjective_data JSONB,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fitness tests
CREATE TABLE IF NOT EXISTS fitness_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  test_type TEXT NOT NULL,
  test_name TEXT NOT NULL,
  date DATE NOT NULL,
  results JSONB NOT NULL,
  conditions JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Elite training goals (hierarchical structure)
CREATE TABLE IF NOT EXISTS elite_training_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('primary', 'secondary', 'micro')),
  category TEXT NOT NULL CHECK (category IN ('performance', 'body_composition', 'skill', 'competitive')),
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  deadline DATE,
  priority INTEGER DEFAULT 1,
  parent_goal_id UUID REFERENCES elite_training_goals,
  milestones JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  success_probability NUMERIC,
  ai_insights JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training plans (enhanced)
CREATE TABLE IF NOT EXISTS elite_training_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('strength', 'hypertrophy', 'power', 'endurance', 'sport_specific')),
  duration_weeks INTEGER NOT NULL,
  current_week INTEGER DEFAULT 1,
  goal_ids UUID[],
  phases JSONB,
  auto_adjustments BOOLEAN DEFAULT TRUE,
  optimization_data JSONB,
  last_optimized TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plan optimization history
CREATE TABLE IF NOT EXISTS plan_optimization_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES elite_training_plans NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  optimization_type TEXT NOT NULL,
  changes_made JSONB,
  performance_data JSONB,
  ai_reasoning TEXT,
  effectiveness_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pattern analysis results
CREATE TABLE IF NOT EXISTS pattern_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  analysis_type TEXT NOT NULL,
  pattern_data JSONB,
  insights JSONB,
  confidence_score NUMERIC,
  date_range_start DATE,
  date_range_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for elite training tables
ALTER TABLE training_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE elite_training_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE elite_training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_optimization_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training_journal_entries
CREATE POLICY "Users can view their own journal entries" ON training_journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries" ON training_journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" ON training_journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries" ON training_journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for fitness_tests
CREATE POLICY "Users can view their own fitness tests" ON fitness_tests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fitness tests" ON fitness_tests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fitness tests" ON fitness_tests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fitness tests" ON fitness_tests
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for elite_training_goals
CREATE POLICY "Users can view their own goals" ON elite_training_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON elite_training_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON elite_training_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON elite_training_goals
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for elite_training_plans
CREATE POLICY "Users can view their own training plans" ON elite_training_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training plans" ON elite_training_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training plans" ON elite_training_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training plans" ON elite_training_plans
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for plan_optimization_history
CREATE POLICY "Users can view their own optimization history" ON plan_optimization_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own optimization history" ON plan_optimization_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for pattern_analysis
CREATE POLICY "Users can view their own pattern analysis" ON pattern_analysis
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pattern analysis" ON pattern_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posture analysis
CREATE TABLE IF NOT EXISTS posture_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  image_url TEXT,
  analysis_data JSONB,
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== NUTRITION MODULE ====================
-- Nutrition profiles
CREATE TABLE IF NOT EXISTS nutrition_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  height NUMERIC, -- in cm
  current_weight NUMERIC, -- in kg
  initial_weight NUMERIC, -- in kg
  target_weight NUMERIC, -- in kg
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal TEXT CHECK (goal IN ('lose_weight', 'maintain', 'gain_weight', 'gain_muscle')),
  diet_type TEXT CHECK (diet_type IN ('standard', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'custom')),
  meals_per_day INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weight logs
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  weight NUMERIC NOT NULL, -- in kg
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food preferences
CREATE TABLE IF NOT EXISTS food_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  food_category TEXT, -- e.g., 'dairy', 'meat', 'vegetables'
  preference TEXT CHECK (preference IN ('like', 'dislike', 'allergic', 'intolerant')),
  specific_foods TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food database
CREATE TABLE IF NOT EXISTS food_database (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  serving_size NUMERIC,
  serving_unit TEXT,
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC,
  fiber NUMERIC,
  sugar NUMERIC,
  sodium NUMERIC,
  cholesterol NUMERIC,
  is_spanish_product BOOLEAN DEFAULT FALSE,
  region TEXT, -- For Spanish regional foods
  supermarket TEXT, -- For Spanish supermarket products
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom foods (user-created)
CREATE TABLE IF NOT EXISTS custom_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  serving_size NUMERIC,
  serving_unit TEXT,
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC,
  fiber NUMERIC,
  sugar NUMERIC,
  sodium NUMERIC,
  cholesterol NUMERIC,
  ingredients TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition entries (food diary)
CREATE TABLE IF NOT EXISTS nutrition_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_id UUID,
  food_name TEXT NOT NULL,
  serving_size NUMERIC,
  serving_unit TEXT,
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC,
  fiber NUMERIC,
  sugar NUMERIC,
  sodium NUMERIC,
  cholesterol NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT FALSE,
  is_template BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal plan details
CREATE TABLE IF NOT EXISTS meal_plan_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id UUID REFERENCES meal_plans NOT NULL,
  day_of_week INTEGER, -- 0-6 for Sunday-Saturday
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_id UUID,
  food_name TEXT NOT NULL,
  serving_size NUMERIC,
  serving_unit TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition goals
CREATE TABLE IF NOT EXISTS nutrition_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC,
  fiber NUMERIC,
  sugar NUMERIC,
  sodium NUMERIC,
  cholesterol NUMERIC,
  water NUMERIC, -- in ml
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Water logs
CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  amount NUMERIC NOT NULL, -- in ml
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  description TEXT,
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC,
  ingredients JSONB NOT NULL,
  instructions TEXT[],
  image_url TEXT,
  category TEXT[],
  region TEXT, -- For Spanish regional recipes
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== WELLNESS MODULE ====================
-- Mood logs
CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  mood_level INTEGER CHECK (mood_level BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sleep logs
CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  sleep_start TIMESTAMP WITH TIME ZONE,
  sleep_end TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in minutes
  quality INTEGER CHECK (quality BETWEEN 1 AND 10),
  deep_sleep INTEGER, -- in minutes
  rem_sleep INTEGER, -- in minutes
  light_sleep INTEGER, -- in minutes
  awake_time INTEGER, -- in minutes
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Breathing sessions
CREATE TABLE IF NOT EXISTS breathing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  technique TEXT,
  duration INTEGER, -- in seconds
  cycles INTEGER,
  inhale_time INTEGER, -- in seconds
  hold_in_time INTEGER, -- in seconds
  exhale_time INTEGER, -- in seconds
  hold_out_time INTEGER, -- in seconds
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meditation sessions
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  duration INTEGER, -- in minutes
  type TEXT,
  guided BOOLEAN DEFAULT FALSE,
  guide_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mindfulness exercises
CREATE TABLE IF NOT EXISTS mindfulness_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- in minutes
  category TEXT,
  instructions TEXT,
  benefits TEXT[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wellness goals
CREATE TABLE IF NOT EXISTS wellness_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  goal_type TEXT,
  target_value NUMERIC,
  start_date DATE,
  end_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  progress NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Corporate wellness programs
CREATE TABLE IF NOT EXISTS corporate_wellness_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Corporate wellness participants
CREATE TABLE IF NOT EXISTS corporate_wellness_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES corporate_wellness_programs NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  join_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  progress JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== PRODUCTIVITY MODULE ====================
-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  due_time TIME,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  tags TEXT[],
  category TEXT,
  estimated_time INTEGER, -- in minutes
  actual_time INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Focus sessions
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in minutes
  technique TEXT,
  task_id UUID REFERENCES tasks,
  distractions INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habits
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  frequency_config JSONB, -- For custom frequency
  start_date DATE,
  end_date DATE,
  reminder_time TIME,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habit logs
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits NOT NULL,
  date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Productivity goals
CREATE TABLE IF NOT EXISTS productivity_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  start_date DATE,
  end_date DATE,
  category TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Productivity profiles
CREATE TABLE IF NOT EXISTS productivity_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  assessment_data JSONB,
  work_hours JSONB,
  break_habits JSONB,
  time_management JSONB,
  distractions JSONB,
  energy_levels JSONB,
  focus_duration INTEGER, -- in minutes
  tools JSONB,
  productivity_goal TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== ROW LEVEL SECURITY POLICIES ====================
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interface_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodization_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE posture_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindfulness_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_wellness_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_wellness_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profiles"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admin users can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Create policies for exercises
CREATE POLICY "Everyone can view exercises"
ON exercises FOR SELECT
USING (true);

CREATE POLICY "Admin users can insert exercises"
ON exercises FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin users can update exercises"
ON exercises FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Create policies for workout routines
CREATE POLICY "Users can view their own workout routines"
ON workout_routines FOR SELECT
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own workout routines"
ON workout_routines FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout routines"
ON workout_routines FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout routines"
ON workout_routines FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for workout logs
CREATE POLICY "Users can view their own workout logs"
ON workout_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout logs"
ON workout_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout logs"
ON workout_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout logs"
ON workout_logs FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for nutrition entries
CREATE POLICY "Users can view their own nutrition entries"
ON nutrition_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition entries"
ON nutrition_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition entries"
ON nutrition_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition entries"
ON nutrition_entries FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for food database
CREATE POLICY "Everyone can view food database"
ON food_database FOR SELECT
USING (true);

CREATE POLICY "Admin users can insert food database entries"
ON food_database FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Create policies for custom foods
CREATE POLICY "Users can view their own custom foods or public ones"
ON custom_foods FOR SELECT
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own custom foods"
ON custom_foods FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom foods"
ON custom_foods FOR UPDATE
USING (auth.uid() = user_id);

-- Create policies for recipes
CREATE POLICY "Users can view their own recipes or public ones"
ON recipes FOR SELECT
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own recipes"
ON recipes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
ON recipes FOR UPDATE
USING (auth.uid() = user_id);

-- Create policies for wellness logs
CREATE POLICY "Users can view their own mood logs"
ON mood_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood logs"
ON mood_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own sleep logs"
ON sleep_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sleep logs"
ON sleep_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own breathing sessions"
ON breathing_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own breathing sessions"
ON breathing_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policies for productivity
CREATE POLICY "Users can view their own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own habits"
ON habits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
ON habits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
ON habits FOR UPDATE
USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'User profile avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('exercise_images', 'Exercise demonstration images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('exercise_videos', 'Exercise demonstration videos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('posture_analysis', 'Posture analysis images', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('recipe_images', 'Recipe images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('food_images', 'Food images', true);

-- Set up storage policies
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Exercise images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise_images');

CREATE POLICY "Exercise videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise_videos');

CREATE POLICY "Admin users can upload exercise media"
ON storage.objects FOR INSERT
WITH CHECK (
  (bucket_id = 'exercise_images' OR bucket_id = 'exercise_videos') AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Users can access only their own posture analysis images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'posture_analysis' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Users can upload their own posture analysis images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posture_analysis' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_routines_user_id ON workout_routines(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_date ON workout_logs(date);
CREATE INDEX IF NOT EXISTS idx_nutrition_entries_user_id ON nutrition_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_entries_date ON nutrition_entries(date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_id_date ON mood_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_id_date ON sleep_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id_date ON weight_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id_exercise ON performance_metrics(user_id, exercise_id);

-- Create functions for automated actions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER set_updated_at_profiles
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_workout_routines
BEFORE UPDATE ON workout_routines
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_training_profiles
BEFORE UPDATE ON training_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_nutrition_profiles
BEFORE UPDATE ON nutrition_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_meal_plans
BEFORE UPDATE ON meal_plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_habits
BEFORE UPDATE ON habits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, avatar_url, experience_level, interface_mode, onboarding_completed)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url', 'beginner', 'beginner', false);

  INSERT INTO user_interface_preferences (user_id, interface_mode, show_tutorial_tips)
  VALUES (NEW.id, 'beginner', true);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();
