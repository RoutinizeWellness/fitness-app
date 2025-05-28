/**
 * Periodized Training Service
 *
 * Provides functionality to create and manage periodized training plans
 * with macrocycles, mesocycles, and microcycles.
 *
 * Integrates with:
 * - Push/Pull/Legs templates
 * - Deload recommendation system
 * - Nutrition periodization
 *
 * Based on:
 * - Pure Bodybuilding Phase 2 Hypertrophy Handbook
 * - Jeff Nippard's Push/Pull/Legs System
 * - Chris Bumstead's Training Methodology
 * - Université Mohammed V de Rabat Hypertrophy Research
 */

import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase-client";
import {
  EnhancedMacroCycle,
  EnhancedMesoCycle,
  EnhancedMicroCycle,
  createEnhancedMacroCycle
} from "@/lib/macrocycle-periodization";
import {
  PplFrequency,
  PplVariant,
  PplPhase,
  PplTemplateConfig,
  createPplRoutine
} from "@/lib/templates/ppl-templates-fixed";
import {
  analyzeAndRecommendDeload,
  DeloadRecommendation
} from "@/lib/deload-recommendation-service";
import {
  TrainingLevel,
  TrainingGoal,
  TrainingPhase,
  DeloadType,
  DeloadTiming
} from "@/lib/types/periodization";
import { WorkoutRoutine, WorkoutDay } from "@/lib/types/training";

/**
 * Create a periodized training plan with Push/Pull/Legs split
 */
export async function createPeriodizedPplPlan(
  userId: string,
  name: string,
  goal: TrainingGoal,
  level: TrainingLevel,
  frequency: PplFrequency,
  variant: PplVariant,
  durationMonths: number,
  startDate: string,
  options?: {
    priorityMuscleGroups?: string[];
    equipment?: string[];
    includeNutritionPlan?: boolean;
    includeDeloads?: boolean;
  }
): Promise<{
  macrocycle: EnhancedMacroCycle;
  routines: WorkoutRoutine[];
}> {
  try {
    // Set default values
    const priorityMuscleGroups = options?.priorityMuscleGroups || [];
    const equipment = options?.equipment || ['barbell', 'dumbbell', 'cable', 'pullup_bar', 'leg_press', 'leg_extension', 'leg_curl'];
    const includeNutritionPlan = options?.includeNutritionPlan !== undefined ? options.includeNutritionPlan : true;
    const includeDeloads = options?.includeDeloads !== undefined ? options.includeDeloads : true;

    // Create the macrocycle
    const macrocycle = await createEnhancedMacroCycle(
      userId,
      name,
      goal,
      level,
      frequency,
      durationMonths,
      startDate,
      {
        secondaryGoals: [],
        periodizationType: variant === 'nippard' ? 'scientific_ppl' :
                          variant === 'cbum' ? 'cbum_method' : 'block',
        targetMuscleGroups: priorityMuscleGroups,
        includeNutritionPeriodization: includeNutritionPlan
      }
    );

    if (!macrocycle) {
      throw new Error('Failed to create macrocycle');
    }

    // Create workout routines for each mesocycle
    const routines: WorkoutRoutine[] = [];

    // For each mesocycle, create appropriate routines
    for (const mesocycle of macrocycle.mesoCycles) {
      // Determine the phase for the PPL template
      const pplPhase: PplPhase = mesocycle.phase.includes('volume') ? 'volume' :
                               mesocycle.phase.includes('intensity') || mesocycle.phase.includes('strength') ? 'intensity' :
                               mesocycle.phase.includes('deload') ? 'deload' : 'volume';

      // Create the PPL routine
      const pplConfig: PplTemplateConfig = {
        userId,
        level,
        goal,
        frequency,
        variant,
        phase: pplPhase,
        includeDeload: includeDeloads && mesocycle.includesDeload,
        priorityMuscleGroups,
        equipment
      };

      const routine = createPplRoutine(pplConfig);

      // Add mesocycle information to the routine
      routine.mesocycleId = mesocycle.id;
      routine.startDate = mesocycle.startDate;
      routine.endDate = mesocycle.endDate;
      routine.phase = mesocycle.phase;

      // Save the routine to the database
      const { data, error } = await supabase
        .from('workout_routines')
        .insert([{
          id: routine.id,
          user_id: routine.userId,
          name: routine.name,
          description: routine.description,
          frequency: routine.frequency,
          goal: routine.goal,
          level: routine.level,
          is_active: routine.isActive,
          includes_deload: routine.includesDeload,
          deload_frequency: routine.deloadFrequency,
          deload_strategy: routine.deloadStrategy,
          source: routine.source,
          tags: routine.tags,
          split: routine.split,
          mesocycle_id: routine.mesocycleId,
          start_date: routine.startDate,
          end_date: routine.endDate,
          phase: routine.phase,
          created_at: routine.createdAt,
          updated_at: routine.updatedAt
        }])
        .select();

      if (error) {
        console.error('Error saving workout routine:', error);
      }

      // Save workout days
      for (const day of routine.days) {
        const { error: dayError } = await supabase
          .from('workout_days')
          .insert([{
            id: day.id,
            routine_id: routine.id,
            name: day.name,
            description: day.description,
            target_muscle_groups: day.targetMuscleGroups,
            difficulty: day.difficulty,
            estimated_duration: day.estimatedDuration,
            exercise_sets: day.exerciseSets
          }]);

        if (dayError) {
          console.error('Error saving workout day:', dayError);
        }
      }

      routines.push(routine);
    }

    return {
      macrocycle,
      routines
    };
  } catch (error) {
    console.error('Error in createPeriodizedPplPlan:', error);
    throw error;
  }
}

/**
 * Get the active periodized training plan for a user
 */
export async function getActivePeriodizedPlan(userId: string): Promise<{
  macrocycle: EnhancedMacroCycle | null;
  currentMesocycle: EnhancedMesoCycle | null;
  currentMicrocycle: EnhancedMicroCycle | null;
  currentRoutine: WorkoutRoutine | null;
  deloadRecommendation: DeloadRecommendation | null;
}> {
  try {
    // Get the active macrocycle
    const { data: macrocycleData, error: macrocycleError } = await supabase
      .from('macrocycles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (macrocycleError || !macrocycleData || macrocycleData.length === 0) {
      return {
        macrocycle: null,
        currentMesocycle: null,
        currentMicrocycle: null,
        currentRoutine: null,
        deloadRecommendation: null
      };
    }

    // Convert from database format to application format
    const macrocycle: EnhancedMacroCycle = {
      id: macrocycleData[0].id,
      userId: macrocycleData[0].user_id,
      name: macrocycleData[0].name,
      description: macrocycleData[0].description,
      duration: macrocycleData[0].duration,
      mesoCycles: macrocycleData[0].mesocycles || [],
      periodizationType: macrocycleData[0].periodization_type,
      primaryGoal: macrocycleData[0].primary_goal,
      secondaryGoals: macrocycleData[0].secondary_goals || [],
      trainingLevel: macrocycleData[0].training_level,
      startDate: macrocycleData[0].start_date,
      endDate: macrocycleData[0].end_date,
      isActive: macrocycleData[0].is_active,
      createdAt: macrocycleData[0].created_at,
      updatedAt: macrocycleData[0].updated_at,
      notes: macrocycleData[0].notes,
      trainingFrequency: macrocycleData[0].training_frequency,
      targetMuscleGroups: macrocycleData[0].target_muscle_groups,
      trainingHistory: macrocycleData[0].training_history,
      deloadSchedule: macrocycleData[0].deload_schedule,
      nutritionPeriodization: macrocycleData[0].nutrition_periodization
    };

    // Determine current mesocycle and microcycle based on date
    const now = new Date();
    const currentMesocycle = macrocycle.mesoCycles.find(meso => {
      const startDate = new Date(meso.startDate);
      const endDate = new Date(meso.endDate);
      return now >= startDate && now <= endDate;
    }) || null;

    const currentMicrocycle = currentMesocycle?.microCycles.find(micro => {
      const startDate = new Date(micro.startDate);
      const endDate = new Date(micro.endDate);
      return now >= startDate && now <= endDate;
    }) || null;

    // Get the current routine
    let currentRoutine: WorkoutRoutine | null = null;

    if (currentMesocycle) {
      const { data: routineData, error: routineError } = await supabase
        .from('workout_routines')
        .select(`
          *,
          days:workout_days(*)
        `)
        .eq('user_id', userId)
        .eq('mesocycle_id', currentMesocycle.id)
        .eq('is_active', true)
        .limit(1);

      if (!routineError && routineData && routineData.length > 0) {
        currentRoutine = {
          id: routineData[0].id,
          userId: routineData[0].user_id,
          name: routineData[0].name,
          description: routineData[0].description,
          days: routineData[0].days,
          frequency: routineData[0].frequency,
          goal: routineData[0].goal,
          level: routineData[0].level,
          isActive: routineData[0].is_active,
          createdAt: routineData[0].created_at,
          updatedAt: routineData[0].updated_at,
          includesDeload: routineData[0].includes_deload,
          deloadFrequency: routineData[0].deload_frequency,
          deloadStrategy: routineData[0].deload_strategy,
          source: routineData[0].source,
          tags: routineData[0].tags,
          split: routineData[0].split,
          mesocycleId: routineData[0].mesocycle_id,
          startDate: routineData[0].start_date,
          endDate: routineData[0].end_date,
          phase: routineData[0].phase
        };
      }
    }

    // Check if a deload is recommended
    const deloadRecommendation = await analyzeAndRecommendDeload(
      userId,
      macrocycle.trainingLevel,
      macrocycle.primaryGoal,
      {
        frequency: macrocycle.deloadSchedule.frequency,
        strategy: macrocycle.deloadSchedule.strategy,
        timing: macrocycle.deloadSchedule.timing,
        autoRegulated: macrocycle.deloadSchedule.autoRegulated,
        fatigueThreshold: macrocycle.deloadSchedule.fatigueThreshold
      }
    );

    return {
      macrocycle,
      currentMesocycle,
      currentMicrocycle,
      currentRoutine,
      deloadRecommendation
    };
  } catch (error) {
    console.error('Error in getActivePeriodizedPlan:', error);
    return {
      macrocycle: null,
      currentMesocycle: null,
      currentMicrocycle: null,
      currentRoutine: null,
      deloadRecommendation: null
    };
  }
}
