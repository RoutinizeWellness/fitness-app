/**
 * Import Templates Script
 * 
 * This script imports all PPL templates to Supabase.
 * Run it with: npx ts-node scripts/import-templates.ts
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { 
  PplFrequency,
  PplVariant,
  PplPhase,
  PplTemplateConfig,
  createPplRoutine
} from '../lib/templates/ppl-templates';
import { 
  TrainingLevel, 
  TrainingGoal
} from '../lib/types/periodization';
import { WorkoutRoutine } from '../lib/types/training';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and key are required. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Import a training template to Supabase
 */
async function importTemplateToSupabase(
  template: WorkoutRoutine
): Promise<{ success: boolean; error: any }> {
  try {
    console.log(`Importing template: ${template.name}`);
    
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
    
    console.log(`Successfully imported template: ${template.name}`);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in importTemplateToSupabase:', error);
    return { success: false, error };
  }
}

/**
 * Import all PPL templates to Supabase
 */
async function importAllPplTemplatesToSupabase(): Promise<{ 
  success: boolean; 
  error: any; 
  importedCount: number 
}> {
  try {
    let importedCount = 0;
    const errors: any[] = [];
    const userId = 'system';
    
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
    
    console.log(`Starting import of ${templateConfigs.length} templates...`);
    
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
    
    console.log(`Import completed. Successfully imported ${importedCount} templates.`);
    if (errors.length > 0) {
      console.error(`Failed to import ${errors.length} templates.`);
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

// Run the import
importAllPplTemplatesToSupabase()
  .then(result => {
    if (result.success) {
      console.log(`Successfully imported ${result.importedCount} templates.`);
      process.exit(0);
    } else {
      console.error('Import failed:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unhandled error during import:', error);
    process.exit(1);
  });
