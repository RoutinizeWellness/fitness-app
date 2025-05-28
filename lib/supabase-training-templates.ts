/**
 * Supabase Training Templates Integration
 *
 * This service handles the integration between our training templates and Supabase.
 * It provides functions to:
 * - Import templates to Supabase
 * - Fetch templates from Supabase
 * - Create new templates in Supabase
 * - Update existing templates
 */

import { supabase } from "@/lib/supabase-client";
import {
  PplFrequency,
  PplVariant,
  PplPhase,
  PplTemplateConfig,
  createPplRoutine
} from "@/lib/templates/ppl-templates-fixed";
import {
  TrainingLevel,
  TrainingGoal,
  TrainingPhase,
  DeloadType,
  DeloadTiming
} from "@/lib/types/periodization";
import { WorkoutRoutine, WorkoutDay } from "@/lib/types/training";
import { v4 as uuidv4 } from "uuid";

/**
 * Import a training template to Supabase
 */
export async function importTemplateToSupabase(
  template: WorkoutRoutine
): Promise<{ success: boolean; error: any }> {
  try {
    // First, insert the routine
    const { data: routineData, error: routineError } = await supabase
      .from('workout_templates')
      .insert([{
        id: template.id,
        name: template.name,
        description: template.description,
        frequency: template.frequency,
        goal: template.goal,
        level: template.level,
        includes_deload: template.includesDeload,
        deload_frequency: template.deloadFrequency,
        deload_strategy: template.deloadStrategy,
        source: template.source,
        tags: template.tags,
        split: template.split,
        phase: template.phase,
        is_template: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (routineError) {
      console.error('Error importing template to Supabase:', routineError);
      return { success: false, error: routineError };
    }

    // Then, insert each day
    for (const day of template.days) {
      const { error: dayError } = await supabase
        .from('workout_template_days')
        .insert([{
          id: day.id,
          template_id: template.id,
          name: day.name,
          description: day.description,
          target_muscle_groups: day.targetMuscleGroups,
          difficulty: day.difficulty,
          estimated_duration: day.estimatedDuration,
          exercise_sets: day.exerciseSets
        }]);

      if (dayError) {
        console.error('Error importing template day to Supabase:', dayError);
        return { success: false, error: dayError };
      }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in importTemplateToSupabase:', error);
    return { success: false, error };
  }
}

/**
 * Import all PPL templates to Supabase
 */
export async function importAllPplTemplatesToSupabase(
  userId: string
): Promise<{ success: boolean; error: any; importedCount: number }> {
  try {
    let importedCount = 0;
    const errors: any[] = [];

    // Define template configurations to import
    const templateConfigs: PplTemplateConfig[] = [
      // Standard PPL templates
      {
        userId,
        level: 'beginner',
        goal: 'hypertrophy',
        frequency: 6,
        variant: 'standard',
        phase: 'volume',
        includeDeload: false,
        priorityMuscleGroups: [],
        equipment: ['barbell', 'dumbbell', 'cable', 'pullup_bar', 'leg_press', 'leg_extension', 'leg_curl']
      },
      {
        userId,
        level: 'intermediate',
        goal: 'hypertrophy',
        frequency: 6,
        variant: 'standard',
        phase: 'volume',
        includeDeload: true,
        priorityMuscleGroups: [],
        equipment: ['barbell', 'dumbbell', 'cable', 'pullup_bar', 'leg_press', 'leg_extension', 'leg_curl']
      },
      {
        userId,
        level: 'advanced',
        goal: 'hypertrophy',
        frequency: 6,
        variant: 'standard',
        phase: 'volume',
        includeDeload: true,
        priorityMuscleGroups: [],
        equipment: ['barbell', 'dumbbell', 'cable', 'pullup_bar', 'leg_press', 'leg_extension', 'leg_curl']
      },

      // Jeff Nippard PPL templates
      {
        userId,
        level: 'intermediate',
        goal: 'hypertrophy',
        frequency: 6,
        variant: 'nippard',
        phase: 'volume',
        includeDeload: true,
        priorityMuscleGroups: [],
        equipment: ['barbell', 'dumbbell', 'cable', 'pullup_bar', 'leg_press', 'leg_extension', 'leg_curl']
      },
      {
        userId,
        level: 'advanced',
        goal: 'hypertrophy',
        frequency: 6,
        variant: 'nippard',
        phase: 'intensity',
        includeDeload: true,
        priorityMuscleGroups: [],
        equipment: ['barbell', 'dumbbell', 'cable', 'pullup_bar', 'leg_press', 'leg_extension', 'leg_curl']
      },

      // CBUM PPL templates
      {
        userId,
        level: 'intermediate',
        goal: 'hypertrophy',
        frequency: 6,
        variant: 'cbum',
        phase: 'volume',
        includeDeload: true,
        priorityMuscleGroups: [],
        equipment: ['barbell', 'dumbbell', 'cable', 'pullup_bar', 'leg_press', 'leg_extension', 'leg_curl']
      },
      {
        userId,
        level: 'advanced',
        goal: 'hypertrophy',
        frequency: 6,
        variant: 'cbum',
        phase: 'volume',
        includeDeload: true,
        priorityMuscleGroups: [],
        equipment: ['barbell', 'dumbbell', 'cable', 'pullup_bar', 'leg_press', 'leg_extension', 'leg_curl']
      },

      // 5-day Upper/Lower split
      {
        userId,
        level: 'intermediate',
        goal: 'hypertrophy',
        frequency: 5,
        variant: 'standard',
        phase: 'volume',
        includeDeload: true,
        priorityMuscleGroups: [],
        equipment: ['barbell', 'dumbbell', 'cable', 'pullup_bar', 'leg_press', 'leg_extension', 'leg_curl']
      },

      // 7-day specialized split
      {
        userId,
        level: 'advanced',
        goal: 'hypertrophy',
        frequency: 7,
        variant: 'standard',
        phase: 'volume',
        includeDeload: true,
        priorityMuscleGroups: ['chest'],
        equipment: ['barbell', 'dumbbell', 'cable', 'pullup_bar', 'leg_press', 'leg_extension', 'leg_curl']
      },
    ];

    // Create and import each template
    for (const config of templateConfigs) {
      const template = createPplRoutine(config);

      // Check if template already exists
      const { data: existingTemplate } = await supabase
        .from('workout_templates')
        .select('id')
        .eq('name', template.name)
        .eq('level', template.level)
        .eq('goal', template.goal)
        .eq('frequency', template.frequency)
        .limit(1);

      if (existingTemplate && existingTemplate.length > 0) {
        console.log(`Template already exists: ${template.name}`);
        continue;
      }

      const { success, error } = await importTemplateToSupabase(template);

      if (success) {
        importedCount++;
      } else {
        errors.push(error);
      }
    }

    return {
      success: errors.length === 0,
      error: errors.length > 0 ? errors : null,
      importedCount
    };
  } catch (error) {
    console.error('Error in importAllPplTemplatesToSupabase:', error);
    return { success: false, error, importedCount: 0 };
  }
}

/**
 * Get all training templates from Supabase
 */
export async function getTrainingTemplates(): Promise<{
  templates: WorkoutRoutine[];
  error: any
}> {
  try {
    const { data: templateData, error: templateError } = await supabase
      .from('workout_templates')
      .select(`
        *,
        days:workout_template_days(*)
      `)
      .eq('is_template', true)
      .order('created_at', { ascending: false });

    if (templateError) {
      console.error('Error fetching templates from Supabase:', templateError);
      return { templates: [], error: templateError };
    }

    // Convert from database format to application format
    const templates: WorkoutRoutine[] = templateData.map((template: any) => ({
      id: template.id,
      userId: template.user_id || '',
      name: template.name,
      description: template.description,
      days: template.days || [],
      frequency: template.frequency,
      goal: template.goal,
      level: template.level,
      isActive: template.is_active || false,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
      includesDeload: template.includes_deload || false,
      deloadFrequency: template.deload_frequency,
      deloadStrategy: template.deload_strategy,
      source: template.source,
      tags: template.tags || [],
      split: template.split,
      phase: template.phase
    }));

    return { templates, error: null };
  } catch (error) {
    console.error('Error in getTrainingTemplates:', error);
    return { templates: [], error };
  }
}

/**
 * Create a new workout routine from a template
 */
export async function createRoutineFromTemplate(
  templateId: string,
  userId: string
): Promise<{ routine: WorkoutRoutine | null; error: any }> {
  try {
    // Get the template
    const { data: templateData, error: templateError } = await supabase
      .from('workout_templates')
      .select(`
        *,
        days:workout_template_days(*)
      `)
      .eq('id', templateId)
      .limit(1);

    if (templateError || !templateData || templateData.length === 0) {
      console.error('Error fetching template from Supabase:', templateError);
      return { routine: null, error: templateError || 'Template not found' };
    }

    const template = templateData[0];

    // Create a new routine based on the template
    const newRoutine: WorkoutRoutine = {
      id: uuidv4(),
      userId,
      name: template.name,
      description: template.description,
      days: template.days.map((day: any) => ({
        ...day,
        id: uuidv4(),
      })),
      frequency: template.frequency,
      goal: template.goal,
      level: template.level,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      includesDeload: template.includes_deload || false,
      deloadFrequency: template.deload_frequency,
      deloadStrategy: template.deload_strategy,
      source: template.source,
      tags: template.tags || [],
      split: template.split,
      phase: template.phase
    };

    // Save the new routine to Supabase
    const { data: routineData, error: routineError } = await supabase
      .from('workout_routines')
      .insert([{
        id: newRoutine.id,
        user_id: newRoutine.userId,
        name: newRoutine.name,
        description: newRoutine.description,
        frequency: newRoutine.frequency,
        goal: newRoutine.goal,
        level: newRoutine.level,
        is_active: newRoutine.isActive,
        includes_deload: newRoutine.includesDeload,
        deload_frequency: newRoutine.deloadFrequency,
        deload_strategy: newRoutine.deloadStrategy,
        source: newRoutine.source,
        tags: newRoutine.tags,
        split: newRoutine.split,
        phase: newRoutine.phase,
        created_at: newRoutine.createdAt,
        updated_at: newRoutine.updatedAt
      }])
      .select();

    if (routineError) {
      console.error('Error saving routine to Supabase:', routineError);
      return { routine: null, error: routineError };
    }

    // Save the days
    for (const day of newRoutine.days) {
      const { error: dayError } = await supabase
        .from('workout_days')
        .insert([{
          id: day.id,
          routine_id: newRoutine.id,
          name: day.name,
          description: day.description,
          target_muscle_groups: day.targetMuscleGroups,
          difficulty: day.difficulty,
          estimated_duration: day.estimatedDuration,
          exercise_sets: day.exerciseSets
        }]);

      if (dayError) {
        console.error('Error saving workout day to Supabase:', dayError);
        return { routine: null, error: dayError };
      }
    }

    return { routine: newRoutine, error: null };
  } catch (error) {
    console.error('Error in createRoutineFromTemplate:', error);
    return { routine: null, error };
  }
}
