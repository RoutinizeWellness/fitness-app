-- Migration to update user profiles for dual functionality (beginner/advanced)

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(20) DEFAULT 'intermediate',
ADD COLUMN IF NOT EXISTS interface_mode VARCHAR(20) DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS experience_details JSONB DEFAULT '{"yearsOfTraining": 0, "consistencyLevel": "moderate", "technicalProficiency": "novice", "knowledgeLevel": "basic"}',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS advanced_features_enabled BOOLEAN DEFAULT FALSE;

-- Create table for user experience progression
CREATE TABLE IF NOT EXISTS user_experience_progression (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  previous_level VARCHAR(20) NOT NULL,
  new_level VARCHAR(20) NOT NULL,
  progression_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progression_reason TEXT,
  assessment_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for user interface preferences
CREATE TABLE IF NOT EXISTS user_interface_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  interface_mode VARCHAR(20) DEFAULT 'beginner',
  show_advanced_metrics BOOLEAN DEFAULT FALSE,
  show_scientific_explanations BOOLEAN DEFAULT FALSE,
  show_detailed_analytics BOOLEAN DEFAULT FALSE,
  show_periodization_tools BOOLEAN DEFAULT FALSE,
  simplified_navigation BOOLEAN DEFAULT TRUE,
  show_tutorial_tips BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE user_experience_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interface_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user_experience_progression
CREATE POLICY "Users can view their own experience progression"
  ON user_experience_progression FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only authenticated users can insert their own experience progression"
  ON user_experience_progression FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_interface_preferences
CREATE POLICY "Users can view their own interface preferences"
  ON user_interface_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own interface preferences"
  ON user_interface_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only authenticated users can insert their own interface preferences"
  ON user_interface_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);
