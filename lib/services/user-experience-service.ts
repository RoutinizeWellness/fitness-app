import { supabase } from "@/lib/supabase-client";

export type ExperienceLevel = 'amateur_zero' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type InterfaceMode = 'beginner' | 'advanced';

export interface ExperienceDetails {
  yearsOfTraining: number;
  consistencyLevel: 'low' | 'moderate' | 'high';
  technicalProficiency: 'novice' | 'developing' | 'proficient' | 'expert';
  knowledgeLevel: 'basic' | 'intermediate' | 'advanced' | 'scientific';
}

export interface UserInterfacePreferences {
  id?: string;
  user_id: string;
  interface_mode: InterfaceMode;
  show_advanced_metrics: boolean;
  show_scientific_explanations: boolean;
  show_detailed_analytics: boolean;
  show_periodization_tools: boolean;
  simplified_navigation: boolean;
  show_tutorial_tips: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get user experience level
 */
export async function getUserExperienceLevel(userId: string): Promise<{
  level: ExperienceLevel;
  interfaceMode: InterfaceMode;
  experienceDetails: ExperienceDetails;
  advancedFeaturesEnabled: boolean;
  onboardingCompleted: boolean;
} | null> {
  if (!userId) {
    console.error('User ID is required to get experience level');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('experience_level, interface_mode, experience_details, advanced_features_enabled, onboarding_completed')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error getting user experience level:', error);
      return null;
    }

    if (!data) {
      console.error('No user profile found');
      return null;
    }

    return {
      level: (data.experience_level || 'intermediate') as ExperienceLevel,
      interfaceMode: (data.interface_mode || 'beginner') as InterfaceMode,
      experienceDetails: data.experience_details || {
        yearsOfTraining: 0,
        consistencyLevel: 'moderate',
        technicalProficiency: 'novice',
        knowledgeLevel: 'basic'
      },
      advancedFeaturesEnabled: data.advanced_features_enabled || false,
      onboardingCompleted: data.onboarding_completed || false
    };
  } catch (error) {
    console.error('Error processing user experience level:', error);
    return null;
  }
}

/**
 * Update user experience level
 */
export async function updateUserExperienceLevel(
  userId: string,
  level: ExperienceLevel,
  previousLevel?: ExperienceLevel,
  reason?: string,
  assessmentScore?: number
): Promise<boolean> {
  if (!userId) {
    console.error('User ID is required to update experience level');
    return false;
  }

  try {
    // Update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        experience_level: level,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error updating user experience level:', profileError);
      return false;
    }

    // If there's a previous level, record the progression
    if (previousLevel && previousLevel !== level) {
      const { error: progressionError } = await supabase
        .from('user_experience_progression')
        .insert({
          user_id: userId,
          previous_level: previousLevel,
          new_level: level,
          progression_reason: reason || 'Manual update',
          assessment_score: assessmentScore,
          created_at: new Date().toISOString()
        });

      if (progressionError) {
        console.error('Error recording experience progression:', progressionError);
        // We don't return false here because the main update was successful
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating user experience level:', error);
    return false;
  }
}

/**
 * Update user interface mode
 */
export async function updateUserInterfaceMode(
  userId: string,
  interfaceMode: InterfaceMode
): Promise<boolean> {
  if (!userId) {
    console.error('User ID is required to update interface mode');
    return false;
  }

  try {
    // Update user profile
    const { error } = await supabase
      .from('profiles')
      .update({
        interface_mode: interfaceMode,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user interface mode:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating user interface mode:', error);
    return false;
  }
}

/**
 * Get user interface preferences
 */
export async function getUserInterfacePreferences(userId: string): Promise<UserInterfacePreferences | null> {
  if (!userId) {
    console.error('User ID is required to get interface preferences');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_interface_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no preferences found, create default ones
      if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
        return createDefaultInterfacePreferences(userId);
      }
      console.error('Error getting user interface preferences:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error processing user interface preferences:', error);
    return null;
  }
}

/**
 * Create default interface preferences for a user
 */
async function createDefaultInterfacePreferences(userId: string): Promise<UserInterfacePreferences | null> {
  if (!userId) {
    console.error('User ID is required to create default interface preferences');
    return null;
  }

  const defaultPreferences: UserInterfacePreferences = {
    user_id: userId,
    interface_mode: 'beginner',
    show_advanced_metrics: false,
    show_scientific_explanations: false,
    show_detailed_analytics: false,
    show_periodization_tools: false,
    simplified_navigation: true,
    show_tutorial_tips: true
  };

  try {
    const { data, error } = await supabase
      .from('user_interface_preferences')
      .insert(defaultPreferences)
      .select()
      .single();

    if (error) {
      console.error('Error creating default interface preferences:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating default interface preferences:', error);
    return null;
  }
}

/**
 * Update user interface preferences
 */
export async function updateUserInterfacePreferences(
  preferences: UserInterfacePreferences
): Promise<UserInterfacePreferences | null> {
  if (!preferences.user_id) {
    console.error('User ID is required in preferences object');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_interface_preferences')
      .upsert({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating interface preferences:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating interface preferences:', error);
    return null;
  }
}
