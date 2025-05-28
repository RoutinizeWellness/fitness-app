"use strict";

/**
 * Push/Pull/Legs (PPL) Templates
 *
 * Implements advanced PPL training templates with:
 * - 5-day and 7-day frequency options
 * - Based on Jeff Nippard and Chris Bumstead training systems
 * - Periodized structure with volume and intensity phases
 * - Programmed deload weeks
 *
 * References:
 * - Pure Bodybuilding Phase 2 Hypertrophy Handbook
 * - Jeff Nippard's Push/Pull/Legs System
 * - Chris Bumstead's Training Methodology
 * - Université Mohammed V de Rabat Hypertrophy Research
 */

import { v4 as uuidv4 } from "uuid";
import { WorkoutRoutine, WorkoutDay, ExerciseSet } from "@/lib/types/training";
import { TrainingLevel, TrainingGoal } from "@/lib/types/periodization";

// PPL Template Types
export type PplFrequency = 5 | 6 | 7;
export type PplVariant = 'standard' | 'nippard' | 'cbum' | 'volume_focus' | 'strength_focus';
export type PplPhase = 'volume' | 'intensity' | 'strength' | 'deload';

// Interface for PPL template configuration
export interface PplTemplateConfig {
  userId: string;
  level: TrainingLevel;
  goal: TrainingGoal;
  frequency: PplFrequency;
  variant: PplVariant;
  phase?: PplPhase;
  includeDeload?: boolean;
  priorityMuscleGroups?: string[];
  equipment?: string[];
}

/**
 * Create a Push/Pull/Legs (PPL) routine based on configuration
 */
export function createPplRoutine(config: PplTemplateConfig): WorkoutRoutine {
  const {
    userId,
    level,
    goal,
    frequency,
    variant,
    phase = 'volume',
    includeDeload = true,
    priorityMuscleGroups = [],
    equipment = []
  } = config;

  // Generate routine name
  const routineName = generateRoutineName(frequency, variant, phase);

  // Generate routine description
  const routineDescription = generateRoutineDescription(frequency, variant, level, goal, phase);

  // Generate workout days based on frequency
  const workoutDays = generateWorkoutDays(frequency, variant, level, phase, priorityMuscleGroups, equipment);

  // Create the routine
  const routine: WorkoutRoutine = {
    id: uuidv4(),
    userId,
    name: routineName,
    description: routineDescription,
    days: workoutDays,
    frequency: frequency,
    goal: goal,
    level: level,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    includesDeload,
    deloadFrequency: level === 'beginner' ? 8 : level === 'intermediate' ? 6 : 4,
    deloadStrategy: goal === 'strength' ? 'intensity' : 'volume',
    source: variant === 'nippard' ? 'Jeff Nippard' : variant === 'cbum' ? 'Chris Bumstead' : 'Scientific PPL',
    tags: [
      `${frequency}-day`,
      'push_pull_legs',
      goal,
      level,
      phase,
      variant
    ],
    split: 'push_pull_legs'
  };

  return routine;
}

/**
 * Generate a name for the PPL routine
 */
function generateRoutineName(frequency: PplFrequency, variant: PplVariant, phase: PplPhase): string {
  const variantName = variant === 'nippard' ? 'Jeff Nippard' :
                     variant === 'cbum' ? 'Chris Bumstead' :
                     variant === 'volume_focus' ? 'Volume-Focused' :
                     variant === 'strength_focus' ? 'Strength-Focused' : 'Standard';

  const phaseName = phase === 'volume' ? 'Volume Phase' :
                   phase === 'intensity' ? 'Intensity Phase' :
                   phase === 'strength' ? 'Strength Phase' : 'Deload';

  return `${frequency}-Day PPL: ${variantName} (${phaseName})`;
}

/**
 * Generate a description for the PPL routine
 */
function generateRoutineDescription(
  frequency: PplFrequency,
  variant: PplVariant,
  level: TrainingLevel,
  goal: TrainingGoal,
  phase: PplPhase
): string {
  let description = `${frequency}-day Push/Pull/Legs split `;

  // Add variant-specific description
  if (variant === 'nippard') {
    description += `based on Jeff Nippard's scientific approach to hypertrophy training. `;
  } else if (variant === 'cbum') {
    description += `inspired by Chris Bumstead's championship-winning training methodology. `;
  } else if (variant === 'volume_focus') {
    description += `with emphasis on training volume for maximum muscle growth. `;
  } else if (variant === 'strength_focus') {
    description += `with focus on strength development through progressive overload. `;
  } else {
    description += `designed for balanced development of all major muscle groups. `;
  }

  // Add phase-specific description
  if (phase === 'volume') {
    description += `This volume phase emphasizes higher rep ranges and total work volume to maximize hypertrophy stimulus. `;
  } else if (phase === 'intensity') {
    description += `This intensity phase focuses on heavier weights and lower rep ranges to build strength and density. `;
  } else if (phase === 'strength') {
    description += `This strength phase prioritizes compound movements and progressive overload for maximal strength gains. `;
  } else if (phase === 'deload') {
    description += `This deload phase reduces volume and/or intensity to facilitate recovery and supercompensation. `;
  }

  // Add level-specific description
  description += `Designed for ${level} trainees with a primary goal of ${goal}.`;

  return description;
}

/**
 * Generate workout days based on frequency
 */
function generateWorkoutDays(
  frequency: PplFrequency,
  variant: PplVariant,
  level: TrainingLevel,
  phase: PplPhase,
  priorityMuscleGroups: string[],
  equipment: string[]
): WorkoutDay[] {
  // This is a placeholder - the full implementation will be added in the next edit
  const workoutDays: WorkoutDay[] = [];

  if (frequency === 5) {
    // 5-day PPL typically follows: Push, Pull, Legs, Upper, Lower
    workoutDays.push(
      createPushDay(variant, level, phase, priorityMuscleGroups, equipment, 1),
      createPullDay(variant, level, phase, priorityMuscleGroups, equipment, 1),
      createLegDay(variant, level, phase, priorityMuscleGroups, equipment, 1),
      createUpperDay(variant, level, phase, priorityMuscleGroups, equipment),
      createLowerDay(variant, level, phase, priorityMuscleGroups, equipment)
    );
  } else if (frequency === 6) {
    // 6-day PPL typically follows: Push, Pull, Legs, Push, Pull, Legs
    workoutDays.push(
      createPushDay(variant, level, phase, priorityMuscleGroups, equipment, 1),
      createPullDay(variant, level, phase, priorityMuscleGroups, equipment, 1),
      createLegDay(variant, level, phase, priorityMuscleGroups, equipment, 1),
      createPushDay(variant, level, phase, priorityMuscleGroups, equipment, 2),
      createPullDay(variant, level, phase, priorityMuscleGroups, equipment, 2),
      createLegDay(variant, level, phase, priorityMuscleGroups, equipment, 2)
    );
  } else if (frequency === 7) {
    // 7-day PPL typically adds a specialized day: Push, Pull, Legs, Push, Pull, Legs, Specialization
    workoutDays.push(
      createPushDay(variant, level, phase, priorityMuscleGroups, equipment, 1),
      createPullDay(variant, level, phase, priorityMuscleGroups, equipment, 1),
      createLegDay(variant, level, phase, priorityMuscleGroups, equipment, 1),
      createPushDay(variant, level, phase, priorityMuscleGroups, equipment, 2),
      createPullDay(variant, level, phase, priorityMuscleGroups, equipment, 2),
      createLegDay(variant, level, phase, priorityMuscleGroups, equipment, 2),
      createSpecializationDay(variant, level, phase, priorityMuscleGroups, equipment)
    );
  }

  return workoutDays;
}

/**
 * Create a Push day workout
 */
function createPushDay(
  variant: PplVariant,
  level: TrainingLevel,
  phase: PplPhase,
  priorityMuscleGroups: string[],
  equipment: string[],
  dayNumber: number
): WorkoutDay {
  // Determine if chest or shoulders are priority
  const isChestPriority = priorityMuscleGroups.includes('chest');
  const isShouldersPrority = priorityMuscleGroups.includes('shoulders');
  const isTricepsPriority = priorityMuscleGroups.includes('triceps');

  // Adjust description based on priorities
  let description = `Chest, shoulders, and triceps training`;
  if (isChestPriority) description = `Chest-focused push training with shoulders and triceps`;
  if (isShouldersPrority) description = `Shoulder-focused push training with chest and triceps`;
  if (isTricepsPriority) description = `Triceps-focused push training with chest and shoulders`;

  // Create the workout day structure
  const workoutDay: WorkoutDay = {
    id: uuidv4(),
    name: `Push Day ${dayNumber}`,
    description,
    targetMuscleGroups: ['chest', 'shoulders', 'triceps'],
    difficulty: level,
    estimatedDuration: level === 'beginner' ? 60 : level === 'intermediate' ? 75 : 90,
    exerciseSets: []
  };

  // Add exercises based on variant, level, and phase
  const exercises = getPushDayExercises(variant, level, phase, dayNumber, priorityMuscleGroups, equipment);
  workoutDay.exerciseSets = exercises;

  return workoutDay;
}

/**
 * Get exercises for Push day
 */
function getPushDayExercises(
  variant: PplVariant,
  level: TrainingLevel,
  phase: PplPhase,
  dayNumber: number,
  priorityMuscleGroups: string[],
  equipment: string[]
): ExerciseSet[] {
  const exercises: ExerciseSet[] = [];

  // Determine if this is a volume or intensity phase
  const isVolumePhase = phase === 'volume';
  const isIntensityPhase = phase === 'intensity' || phase === 'strength';
  const isDeloadPhase = phase === 'deload';

  // Determine if chest or shoulders are priority
  const isChestPriority = priorityMuscleGroups.includes('chest');
  const isShouldersPrority = priorityMuscleGroups.includes('shoulders');
  const isTricepsPriority = priorityMuscleGroups.includes('triceps');

  // Check available equipment
  const hasBarbell = equipment.includes('barbell');
  const hasDumbbell = equipment.includes('dumbbell');
  const hasCableMachine = equipment.includes('cable');
  const hasSmithMachine = equipment.includes('smith_machine');

  // Adjust volume based on phase and level
  const volumeMultiplier = isDeloadPhase ? 0.5 :
                          isVolumePhase ? 1.2 : 1.0;

  const intensityMultiplier = isDeloadPhase ? 0.8 :
                             isIntensityPhase ? 1.2 : 1.0;

  // Base sets and reps by level
  let baseSets = level === 'beginner' ? 3 :
                level === 'intermediate' ? 4 : 5;

  // Adjust for deload
  if (isDeloadPhase) {
    baseSets = Math.max(2, Math.floor(baseSets * 0.6));
  }

  // Adjust for priority muscle groups
  const prioritySetBonus = 1;

  // Determine exercise order and selection based on variant
  if (variant === 'nippard') {
    // Jeff Nippard's approach - scientific, balanced, with emphasis on compound movements

    // Day 1 focuses more on chest, Day 2 more on shoulders (if applicable)
    const isChestFocusDay = dayNumber === 1;

    // Compound movements first
    if (isChestFocusDay) {
      // Start with chest compound movement
      if (hasBarbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'barbell_bench_press',
          name: 'Barbell Bench Press',
          sets: isDeloadPhase ? 2 : isChestPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '4-6' : isVolumePhase ? '8-10' : '6-8',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 180 : 120,
          notes: 'Focus on full range of motion and controlled eccentric',
          order: 1
        });
      } else if (hasDumbbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'dumbbell_bench_press',
          name: 'Dumbbell Bench Press',
          sets: isDeloadPhase ? 2 : isChestPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Full range of motion with slight stretch at bottom',
          order: 1
        });
      }

      // Second compound movement - shoulder focused
      if (hasBarbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'overhead_press',
          name: 'Overhead Press',
          sets: isDeloadPhase ? 2 : isShouldersPrority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '5-7' : isVolumePhase ? '8-10' : '6-8',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 180 : 120,
          notes: 'Press directly overhead, avoid excessive arching',
          order: 2
        });
      } else if (hasDumbbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'dumbbell_shoulder_press',
          name: 'Dumbbell Shoulder Press',
          sets: isDeloadPhase ? 2 : isShouldersPrority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '10-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Control the weights throughout the movement',
          order: 2
        });
      }
    } else {
      // Day 2 - Start with shoulder compound movement
      if (hasBarbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'overhead_press',
          name: 'Overhead Press',
          sets: isDeloadPhase ? 2 : isShouldersPrority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '5-7' : isVolumePhase ? '8-10' : '6-8',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 180 : 120,
          notes: 'Press directly overhead, avoid excessive arching',
          order: 1
        });
      } else if (hasDumbbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'dumbbell_shoulder_press',
          name: 'Dumbbell Shoulder Press',
          sets: isDeloadPhase ? 2 : isShouldersPrority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '10-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Control the weights throughout the movement',
          order: 1
        });
      }

      // Second compound movement - chest focused
      if (hasBarbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'incline_bench_press',
          name: 'Incline Bench Press',
          sets: isDeloadPhase ? 2 : isChestPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-10' : '6-8',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 180 : 120,
          notes: 'Use a moderate incline (30-45 degrees)',
          order: 2
        });
      } else if (hasDumbbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'incline_dumbbell_press',
          name: 'Incline Dumbbell Press',
          sets: isDeloadPhase ? 2 : isChestPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Use a moderate incline (30-45 degrees)',
          order: 2
        });
      }
    }

    // Add isolation exercises
    // Chest isolation
    if (hasCableMachine) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'cable_chest_fly',
        name: 'Cable Chest Fly',
        sets: isDeloadPhase ? 2 : isChestPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: isIntensityPhase ? '10-12' : isVolumePhase ? '12-15' : '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Focus on chest contraction at the midline',
        order: exercises.length + 1
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'dumbbell_fly',
        name: 'Dumbbell Fly',
        sets: isDeloadPhase ? 2 : isChestPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: isIntensityPhase ? '10-12' : isVolumePhase ? '12-15' : '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Keep slight bend in elbows, focus on stretch',
        order: exercises.length + 1
      });
    }

    // Shoulder isolation
    exercises.push({
      id: uuidv4(),
      exerciseId: 'lateral_raise',
      name: 'Lateral Raise',
      sets: isDeloadPhase ? 2 : isShouldersPrority ? baseSets + 1 : baseSets,
      reps: isIntensityPhase ? '10-12' : isVolumePhase ? '12-15' : '12-15',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 60,
      notes: 'Lead with elbows, slight bend in arm',
      order: exercises.length + 1
    });

    // Triceps isolation
    if (hasCableMachine) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'tricep_pushdown',
        name: 'Tricep Pushdown',
        sets: isDeloadPhase ? 2 : isTricepsPriority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '8-10' : isVolumePhase ? '12-15' : '10-12',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: 60,
        notes: 'Keep elbows tucked to sides',
        order: exercises.length + 1
      });
    } else {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'tricep_dips',
        name: 'Tricep Dips',
        sets: isDeloadPhase ? 2 : isTricepsPriority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-15' : '8-12',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: 90,
        notes: 'Keep body upright to target triceps',
        order: exercises.length + 1
      });
    }

    // Add one more isolation exercise for priority muscle group
    if (isChestPriority && !isDeloadPhase) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'chest_dips',
        name: 'Chest Dips',
        sets: Math.max(2, baseSets - 1),
        reps: isIntensityPhase ? '8-10' : '10-15',
        rir: isIntensityPhase ? 1 : 2,
        restSeconds: 90,
        notes: 'Lean forward to target chest more',
        order: exercises.length + 1
      });
    } else if (isShouldersPrority && !isDeloadPhase) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'rear_delt_fly',
        name: 'Rear Delt Fly',
        sets: Math.max(2, baseSets - 1),
        reps: '12-15',
        rir: 2,
        restSeconds: 60,
        notes: 'Pull elbows back and up',
        order: exercises.length + 1
      });
    } else if (isTricepsPriority && !isDeloadPhase) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'overhead_tricep_extension',
        name: 'Overhead Tricep Extension',
        sets: Math.max(2, baseSets - 1),
        reps: isIntensityPhase ? '8-10' : '10-15',
        rir: isIntensityPhase ? 1 : 2,
        restSeconds: 60,
        notes: 'Keep elbows close to head',
        order: exercises.length + 1
      });
    }
  } else if (variant === 'cbum') {
    // Chris Bumstead's approach - high volume, intensity techniques, focus on mind-muscle connection

    // Day 1 focuses more on chest, Day 2 more on shoulders (if applicable)
    const isChestFocusDay = dayNumber === 1;

    // Compound movements first
    if (isChestFocusDay) {
      // Start with chest compound movement
      if (hasBarbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'barbell_bench_press',
          name: 'Barbell Bench Press',
          sets: isDeloadPhase ? 2 : isChestPriority ? baseSets + 2 : baseSets + 1,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 180 : 120,
          notes: 'Focus on chest contraction at top',
          order: 1
        });
      } else if (hasDumbbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'dumbbell_bench_press',
          name: 'Dumbbell Bench Press',
          sets: isDeloadPhase ? 2 : isChestPriority ? baseSets + 2 : baseSets + 1,
          reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-15' : '8-12',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Full range of motion with controlled tempo',
          order: 1
        });
      }

      // Second chest movement
      if (hasBarbell || hasSmithMachine) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'incline_bench_press',
          name: 'Incline Bench Press',
          sets: isDeloadPhase ? 2 : isChestPriority ? baseSets + 1 : baseSets,
          reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Use a moderate incline (30 degrees)',
          order: 2
        });
      } else if (hasDumbbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'incline_dumbbell_press',
          name: 'Incline Dumbbell Press',
          sets: isDeloadPhase ? 2 : isChestPriority ? baseSets + 1 : baseSets,
          reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-15' : '8-12',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Use a moderate incline (30 degrees)',
          order: 2
        });
      }
    } else {
      // Day 2 - Start with shoulder compound movement
      if (hasBarbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'overhead_press',
          name: 'Overhead Press',
          sets: isDeloadPhase ? 2 : isShouldersPrority ? baseSets + 2 : baseSets + 1,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 180 : 120,
          notes: 'Press directly overhead, avoid excessive arching',
          order: 1
        });
      } else if (hasDumbbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'dumbbell_shoulder_press',
          name: 'Dumbbell Shoulder Press',
          sets: isDeloadPhase ? 2 : isShouldersPrority ? baseSets + 2 : baseSets + 1,
          reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-15' : '8-12',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Control the weights throughout the movement',
          order: 1
        });
      }
    }

    // Add isolation exercises - CBUM style uses more isolation with higher volume
    // Chest isolation
    if (hasCableMachine) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'cable_chest_fly',
        name: 'Cable Chest Fly',
        sets: isDeloadPhase ? 2 : isChestPriority ? baseSets + 1 : baseSets,
        reps: '12-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 60,
        notes: 'Squeeze chest at peak contraction, hold briefly',
        order: exercises.length + 1
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'dumbbell_fly',
        name: 'Dumbbell Fly',
        sets: isDeloadPhase ? 2 : isChestPriority ? baseSets + 1 : baseSets,
        reps: '12-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 60,
        notes: 'Focus on stretch at bottom, controlled movement',
        order: exercises.length + 1
      });
    }

    // Shoulder isolation - CBUM style uses multiple shoulder exercises
    exercises.push({
      id: uuidv4(),
      exerciseId: 'lateral_raise',
      name: 'Lateral Raise',
      sets: isDeloadPhase ? 2 : isShouldersPrority ? baseSets + 2 : baseSets + 1,
      reps: '12-15',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 60,
      notes: 'Partial drop set on last set',
      order: exercises.length + 1
    });

    if (!isDeloadPhase) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'front_raise',
        name: 'Front Raise',
        sets: isShouldersPrority ? baseSets : Math.max(2, baseSets - 1),
        reps: '12-15',
        rir: 2,
        restSeconds: 60,
        notes: 'Alternate arms for better control',
        order: exercises.length + 1
      });
    }

    // Triceps - CBUM style uses multiple tricep exercises
    if (hasCableMachine) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'tricep_pushdown',
        name: 'Tricep Pushdown',
        sets: isDeloadPhase ? 2 : isTricepsPriority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '10-12' : '12-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 60,
        notes: 'Keep elbows tucked, focus on contraction',
        order: exercises.length + 1
      });

      if (!isDeloadPhase) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'overhead_tricep_extension',
          name: 'Overhead Tricep Extension',
          sets: isTricepsPriority ? baseSets : Math.max(2, baseSets - 1),
          reps: '10-15',
          rir: 2,
          restSeconds: 60,
          notes: 'Full stretch at bottom of movement',
          order: exercises.length + 1
        });
      }
    } else {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'skull_crushers',
        name: 'Skull Crushers',
        sets: isDeloadPhase ? 2 : isTricepsPriority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '8-10' : '10-12',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 60,
        notes: 'Keep elbows pointed to ceiling',
        order: exercises.length + 1
      });

      if (!isDeloadPhase) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'tricep_dips',
          name: 'Tricep Dips',
          sets: isTricepsPriority ? baseSets : Math.max(2, baseSets - 1),
          reps: '10-15',
          rir: 2,
          restSeconds: 60,
          notes: 'Keep body upright to target triceps',
          order: exercises.length + 1
        });
      }
    }
  } else {
    // Standard PPL approach - balanced, with moderate volume and intensity

    // Compound movements first
    if (hasBarbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'barbell_bench_press',
        name: 'Barbell Bench Press',
        sets: isDeloadPhase ? 2 : isChestPriority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '5-8' : isVolumePhase ? '8-12' : '6-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 180 : 120,
        notes: 'Focus on full range of motion',
        order: 1
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'dumbbell_bench_press',
        name: 'Dumbbell Bench Press',
        sets: isDeloadPhase ? 2 : isChestPriority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '6-10' : isVolumePhase ? '8-12' : '8-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 150 : 120,
        notes: 'Control the weights throughout the movement',
        order: 1
      });
    }

    // Second compound movement
    if (hasBarbell || hasSmithMachine) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'overhead_press',
        name: 'Overhead Press',
        sets: isDeloadPhase ? 2 : isShouldersPrority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-12' : '6-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 150 : 120,
        notes: 'Press directly overhead',
        order: 2
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'dumbbell_shoulder_press',
        name: 'Dumbbell Shoulder Press',
        sets: isDeloadPhase ? 2 : isShouldersPrority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '6-10' : isVolumePhase ? '10-12' : '8-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 150 : 120,
        notes: 'Control the weights throughout the movement',
        order: 2
      });
    }

    // Chest isolation
    if (hasCableMachine) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'cable_chest_fly',
        name: 'Cable Chest Fly',
        sets: isDeloadPhase ? 2 : isChestPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Focus on chest contraction',
        order: 3
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'dumbbell_fly',
        name: 'Dumbbell Fly',
        sets: isDeloadPhase ? 2 : isChestPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Keep slight bend in elbows',
        order: 3
      });
    }

    // Shoulder isolation
    exercises.push({
      id: uuidv4(),
      exerciseId: 'lateral_raise',
      name: 'Lateral Raise',
      sets: isDeloadPhase ? 2 : isShouldersPrority ? baseSets : Math.max(2, baseSets - 1),
      reps: '12-15',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 60,
      notes: 'Lead with elbows',
      order: 4
    });

    // Triceps isolation
    if (hasCableMachine) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'tricep_pushdown',
        name: 'Tricep Pushdown',
        sets: isDeloadPhase ? 2 : isTricepsPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 60,
        notes: 'Keep elbows tucked',
        order: 5
      });
    } else {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'skull_crushers',
        name: 'Skull Crushers',
        sets: isDeloadPhase ? 2 : isTricepsPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: '10-12',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 60,
        notes: 'Keep elbows pointed to ceiling',
        order: 5
      });
    }
  }

  return exercises;
}

/**
 * Create a Pull day workout
 */
function createPullDay(
  variant: PplVariant,
  level: TrainingLevel,
  phase: PplPhase,
  priorityMuscleGroups: string[],
  equipment: string[],
  dayNumber: number
): WorkoutDay {
  // Determine if back or biceps are priority
  const isBackPriority = priorityMuscleGroups.includes('back');
  const isBicepsPriority = priorityMuscleGroups.includes('biceps');
  const isRearDeltsPriority = priorityMuscleGroups.includes('rear_delts');

  // Adjust description based on priorities
  let description = `Back, biceps, and rear delts training`;
  if (isBackPriority) description = `Back-focused pull training with biceps and rear delts`;
  if (isBicepsPriority) description = `Biceps-focused pull training with back and rear delts`;
  if (isRearDeltsPriority) description = `Rear delts-focused pull training with back and biceps`;

  // Create the workout day structure
  const workoutDay: WorkoutDay = {
    id: uuidv4(),
    name: `Pull Day ${dayNumber}`,
    description,
    targetMuscleGroups: ['back', 'biceps', 'rear_delts'],
    difficulty: level,
    estimatedDuration: level === 'beginner' ? 60 : level === 'intermediate' ? 75 : 90,
    exerciseSets: []
  };

  // Add exercises based on variant, level, and phase
  const exercises = getPullDayExercises(variant, level, phase, dayNumber, priorityMuscleGroups, equipment);
  workoutDay.exerciseSets = exercises;

  return workoutDay;
}

/**
 * Get exercises for Pull day
 */
function getPullDayExercises(
  variant: PplVariant,
  level: TrainingLevel,
  phase: PplPhase,
  dayNumber: number,
  priorityMuscleGroups: string[],
  equipment: string[]
): ExerciseSet[] {
  const exercises: ExerciseSet[] = [];

  // Determine if this is a volume or intensity phase
  const isVolumePhase = phase === 'volume';
  const isIntensityPhase = phase === 'intensity' || phase === 'strength';
  const isDeloadPhase = phase === 'deload';

  // Determine if back or biceps are priority
  const isBackPriority = priorityMuscleGroups.includes('back');
  const isBicepsPriority = priorityMuscleGroups.includes('biceps');
  const isRearDeltsPriority = priorityMuscleGroups.includes('rear_delts');

  // Check available equipment
  const hasBarbell = equipment.includes('barbell');
  const hasDumbbell = equipment.includes('dumbbell');
  const hasCableMachine = equipment.includes('cable');
  const hasPullupBar = equipment.includes('pullup_bar');

  // Adjust volume based on phase and level
  const volumeMultiplier = isDeloadPhase ? 0.5 :
                          isVolumePhase ? 1.2 : 1.0;

  const intensityMultiplier = isDeloadPhase ? 0.8 :
                             isIntensityPhase ? 1.2 : 1.0;

  // Base sets and reps by level
  let baseSets = level === 'beginner' ? 3 :
                level === 'intermediate' ? 4 : 5;

  // Adjust for deload
  if (isDeloadPhase) {
    baseSets = Math.max(2, Math.floor(baseSets * 0.6));
  }

  // Adjust for priority muscle groups
  const prioritySetBonus = 1;

  // Determine exercise order and selection based on variant
  if (variant === 'nippard') {
    // Jeff Nippard's approach - scientific, balanced, with emphasis on compound movements

    // Day 1 focuses more on vertical pulling, Day 2 more on horizontal pulling (if applicable)
    const isVerticalFocusDay = dayNumber === 1;

    // Compound movements first
    if (isVerticalFocusDay) {
      // Start with vertical pull
      if (hasPullupBar) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'pullups',
          name: 'Pull-ups',
          sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '5-8' : isVolumePhase ? '8-12' : '6-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 180 : 120,
          notes: 'Full range of motion, controlled eccentric',
          order: 1
        });
      } else if (hasCableMachine) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'lat_pulldown',
          name: 'Lat Pulldown',
          sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '10-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Pull to upper chest, focus on lats',
          order: 1
        });
      }

      // Second compound movement - horizontal pull
      if (hasBarbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'barbell_row',
          name: 'Barbell Row',
          sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-10' : '6-8',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Pull to lower chest/upper abs, control the eccentric',
          order: 2
        });
      } else if (hasDumbbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'single_arm_dumbbell_row',
          name: 'Single-Arm Dumbbell Row',
          sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 120 : 90,
          notes: 'Full stretch at bottom, squeeze at top',
          order: 2
        });
      }
    } else {
      // Day 2 - Start with horizontal pull
      if (hasBarbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'barbell_row',
          name: 'Barbell Row',
          sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-10' : '6-8',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Pull to lower chest/upper abs, control the eccentric',
          order: 1
        });
      } else if (hasDumbbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'chest_supported_row',
          name: 'Chest-Supported Row',
          sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Keep chest against pad, pull elbows back',
          order: 1
        });
      }

      // Second compound movement - vertical pull
      if (hasPullupBar) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'weighted_pullups',
          name: 'Weighted Pull-ups',
          sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '5-8' : isVolumePhase ? '8-10' : '6-8',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 180 : 120,
          notes: 'Add weight if needed to stay in rep range',
          order: 2
        });
      } else if (hasCableMachine) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'close_grip_lat_pulldown',
          name: 'Close-Grip Lat Pulldown',
          sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '10-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Keep elbows close to body, focus on lower lats',
          order: 2
        });
      }
    }

    // Add isolation exercises
    // Back isolation
    if (hasCableMachine) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'straight_arm_pulldown',
        name: 'Straight Arm Pulldown',
        sets: isDeloadPhase ? 2 : isBackPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: isIntensityPhase ? '10-12' : isVolumePhase ? '12-15' : '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Keep arms straight, focus on lat contraction',
        order: exercises.length + 1
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'dumbbell_pullover',
        name: 'Dumbbell Pullover',
        sets: isDeloadPhase ? 2 : isBackPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: isIntensityPhase ? '10-12' : isVolumePhase ? '12-15' : '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Focus on lat stretch at top, contraction at bottom',
        order: exercises.length + 1
      });
    }

    // Rear delt isolation
    exercises.push({
      id: uuidv4(),
      exerciseId: 'face_pull',
      name: 'Face Pull',
      sets: isDeloadPhase ? 2 : isRearDeltsPriority ? baseSets + 1 : baseSets,
      reps: '12-15',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 60,
      notes: 'Pull to face with external rotation at end',
      order: exercises.length + 1
    });

    // Biceps isolation
    if (hasBarbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'barbell_curl',
        name: 'Barbell Curl',
        sets: isDeloadPhase ? 2 : isBicepsPriority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-12' : '8-12',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: 60,
        notes: 'Keep elbows at sides, control the eccentric',
        order: exercises.length + 1
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'dumbbell_curl',
        name: 'Dumbbell Curl',
        sets: isDeloadPhase ? 2 : isBicepsPriority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-12' : '8-12',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: 60,
        notes: 'Alternate arms, supinate wrist at top',
        order: exercises.length + 1
      });
    }

    // Add one more isolation exercise for priority muscle group
    if (isBackPriority && !isDeloadPhase) {
      if (hasCableMachine) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'cable_row',
          name: 'Cable Row',
          sets: Math.max(2, baseSets - 1),
          reps: isIntensityPhase ? '8-10' : '10-15',
          rir: isIntensityPhase ? 1 : 2,
          restSeconds: 90,
          notes: 'Use different attachments for variety',
          order: exercises.length + 1
        });
      }
    } else if (isBicepsPriority && !isDeloadPhase) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'hammer_curl',
        name: 'Hammer Curl',
        sets: Math.max(2, baseSets - 1),
        reps: '10-15',
        rir: 2,
        restSeconds: 60,
        notes: 'Neutral grip targets brachialis',
        order: exercises.length + 1
      });
    } else if (isRearDeltsPriority && !isDeloadPhase) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'reverse_pec_deck',
        name: 'Reverse Pec Deck',
        sets: Math.max(2, baseSets - 1),
        reps: '12-15',
        rir: 2,
        restSeconds: 60,
        notes: 'Focus on rear delt contraction',
        order: exercises.length + 1
      });
    }
  } else if (variant === 'cbum') {
    // Chris Bumstead's approach - high volume, intensity techniques, focus on mind-muscle connection

    // Day 1 focuses more on width, Day 2 more on thickness (if applicable)
    const isWidthFocusDay = dayNumber === 1;

    // Compound movements first
    if (isWidthFocusDay) {
      // Start with width-focused movement
      if (hasPullupBar) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'weighted_pullups',
          name: 'Weighted Pull-ups',
          sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + 2 : baseSets + 1,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-12' : '6-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 180 : 120,
          notes: 'Focus on full stretch at bottom, controlled movement',
          order: 1
        });
      } else if (hasCableMachine) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'lat_pulldown',
          name: 'Lat Pulldown',
          sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + 2 : baseSets + 1,
          reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-15' : '8-12',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Focus on lat contraction, slight lean back at bottom',
          order: 1
        });
      }

      // Second back movement
      if (hasCableMachine) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'cable_row',
          name: 'Cable Row',
          sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + 1 : baseSets,
          reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Use V-handle, drive elbows back',
          order: 2
        });
      } else if (hasDumbbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'chest_supported_row',
          name: 'Chest-Supported Row',
          sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + 1 : baseSets,
          reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-15' : '8-12',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Keep chest against pad, pull elbows high',
          order: 2
        });
      }
    } else {
      // Day 2 - Start with thickness-focused movement
      if (hasBarbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'barbell_row',
          name: 'Barbell Row',
          sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + 2 : baseSets + 1,
          reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Slight bend in knees, pull to lower chest',
          order: 1
        });
      } else if (hasDumbbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'single_arm_dumbbell_row',
          name: 'Single-Arm Dumbbell Row',
          sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + 2 : baseSets + 1,
          reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-15' : '8-12',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 120 : 90,
          notes: 'Keep back parallel to ground, full range of motion',
          order: 1
        });
      }
    }

    // Add isolation exercises - CBUM style uses more isolation with higher volume
    // Back isolation
    if (hasCableMachine) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'straight_arm_pulldown',
        name: 'Straight Arm Pulldown',
        sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + 1 : baseSets,
        reps: '12-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 60,
        notes: 'Keep slight bend in elbows, focus on lat stretch and contraction',
        order: exercises.length + 1
      });

      if (!isDeloadPhase) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'cable_pullover',
          name: 'Cable Pullover',
          sets: isBackPriority ? baseSets : Math.max(2, baseSets - 1),
          reps: '12-15',
          rir: 2,
          restSeconds: 60,
          notes: 'Use rope attachment, focus on lat stretch',
          order: exercises.length + 1
        });
      }
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'dumbbell_pullover',
        name: 'Dumbbell Pullover',
        sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + 1 : baseSets,
        reps: '12-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 60,
        notes: 'Full stretch at top, focus on lats throughout movement',
        order: exercises.length + 1
      });
    }

    // Rear delt isolation - CBUM style uses multiple rear delt exercises
    exercises.push({
      id: uuidv4(),
      exerciseId: 'face_pull',
      name: 'Face Pull',
      sets: isDeloadPhase ? 2 : isRearDeltsPriority ? baseSets + 2 : baseSets + 1,
      reps: '15-20',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 60,
      notes: 'External rotation at end of movement',
      order: exercises.length + 1
    });

    if (!isDeloadPhase) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'reverse_pec_deck',
        name: 'Reverse Pec Deck',
        sets: isRearDeltsPriority ? baseSets + 1 : baseSets,
        reps: '15-20',
        rir: 2,
        restSeconds: 60,
        notes: 'Squeeze rear delts at peak contraction',
        order: exercises.length + 1
      });
    }

    // Biceps - CBUM style uses multiple bicep exercises
    if (hasBarbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'barbell_curl',
        name: 'Barbell Curl',
        sets: isDeloadPhase ? 2 : isBicepsPriority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '8-10' : '10-12',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 60,
        notes: 'Controlled eccentric, squeeze at top',
        order: exercises.length + 1
      });

      if (!isDeloadPhase) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'preacher_curl',
          name: 'Preacher Curl',
          sets: isBicepsPriority ? baseSets : Math.max(2, baseSets - 1),
          reps: '10-15',
          rir: 2,
          restSeconds: 60,
          notes: 'Full stretch at bottom, focus on peak contraction',
          order: exercises.length + 1
        });
      }
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'incline_dumbbell_curl',
        name: 'Incline Dumbbell Curl',
        sets: isDeloadPhase ? 2 : isBicepsPriority ? baseSets + 1 : baseSets,
        reps: '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 60,
        notes: 'Full stretch at bottom position',
        order: exercises.length + 1
      });

      if (!isDeloadPhase) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'hammer_curl',
          name: 'Hammer Curl',
          sets: isBicepsPriority ? baseSets : Math.max(2, baseSets - 1),
          reps: '10-15',
          rir: 2,
          restSeconds: 60,
          notes: 'Neutral grip targets brachialis',
          order: exercises.length + 1
        });
      }
    }
  } else {
    // Standard PPL approach - balanced, with moderate volume and intensity

    // Compound movements first
    if (hasPullupBar) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'pullups',
        name: 'Pull-ups',
        sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '5-8' : isVolumePhase ? '8-12' : '6-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 180 : 120,
        notes: 'Full range of motion',
        order: 1
      });
    } else if (hasCableMachine) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'lat_pulldown',
        name: 'Lat Pulldown',
        sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '6-10' : isVolumePhase ? '10-12' : '8-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 150 : 120,
        notes: 'Pull to upper chest',
        order: 1
      });
    }

    // Second compound movement
    if (hasBarbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'barbell_row',
        name: 'Barbell Row',
        sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-12' : '6-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 150 : 120,
        notes: 'Pull to lower chest',
        order: 2
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'single_arm_dumbbell_row',
        name: 'Single-Arm Dumbbell Row',
        sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '6-10' : isVolumePhase ? '8-12' : '8-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 120 : 90,
        notes: 'Full range of motion',
        order: 2
      });
    }

    // Back isolation
    if (hasCableMachine) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'cable_row',
        name: 'Cable Row',
        sets: isDeloadPhase ? 2 : isBackPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Focus on back contraction',
        order: 3
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'dumbbell_pullover',
        name: 'Dumbbell Pullover',
        sets: isDeloadPhase ? 2 : isBackPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Focus on lat stretch',
        order: 3
      });
    }

    // Rear delt isolation
    exercises.push({
      id: uuidv4(),
      exerciseId: 'face_pull',
      name: 'Face Pull',
      sets: isDeloadPhase ? 2 : isRearDeltsPriority ? baseSets : Math.max(2, baseSets - 1),
      reps: '12-15',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 60,
      notes: 'External rotation at end',
      order: 4
    });

    // Biceps isolation
    if (hasBarbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'barbell_curl',
        name: 'Barbell Curl',
        sets: isDeloadPhase ? 2 : isBicepsPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: '10-12',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 60,
        notes: 'Keep elbows at sides',
        order: 5
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'dumbbell_curl',
        name: 'Dumbbell Curl',
        sets: isDeloadPhase ? 2 : isBicepsPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: '10-12',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 60,
        notes: 'Alternate arms',
        order: 5
      });
    }
  }

  return exercises;
}

/**
 * Create a Leg day workout
 */
function createLegDay(
  variant: PplVariant,
  level: TrainingLevel,
  phase: PplPhase,
  priorityMuscleGroups: string[],
  equipment: string[],
  dayNumber: number
): WorkoutDay {
  // Determine if quads, hamstrings, or glutes are priority
  const isQuadsPriority = priorityMuscleGroups.includes('quadriceps');
  const isHamstringsPriority = priorityMuscleGroups.includes('hamstrings');
  const isGlutesPriority = priorityMuscleGroups.includes('glutes');
  const isCalvesPriority = priorityMuscleGroups.includes('calves');

  // Adjust description based on priorities
  let description = `Quadriceps, hamstrings, glutes, and calves training`;
  if (isQuadsPriority) description = `Quad-focused leg training with hamstrings, glutes, and calves`;
  if (isHamstringsPriority) description = `Hamstring-focused leg training with quads, glutes, and calves`;
  if (isGlutesPriority) description = `Glute-focused leg training with quads, hamstrings, and calves`;
  if (isCalvesPriority) description = `Calf-focused leg training with quads, hamstrings, and glutes`;

  // Create the workout day structure
  const workoutDay: WorkoutDay = {
    id: uuidv4(),
    name: `Leg Day ${dayNumber}`,
    description,
    targetMuscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    difficulty: level,
    estimatedDuration: level === 'beginner' ? 60 : level === 'intermediate' ? 75 : 90,
    exerciseSets: []
  };

  // Add exercises based on variant, level, and phase
  const exercises = getLegDayExercises(variant, level, phase, dayNumber, priorityMuscleGroups, equipment);
  workoutDay.exerciseSets = exercises;

  return workoutDay;
}

/**
 * Get exercises for Leg day
 */
function getLegDayExercises(
  variant: PplVariant,
  level: TrainingLevel,
  phase: PplPhase,
  dayNumber: number,
  priorityMuscleGroups: string[],
  equipment: string[]
): ExerciseSet[] {
  const exercises: ExerciseSet[] = [];

  // Determine if this is a volume or intensity phase
  const isVolumePhase = phase === 'volume';
  const isIntensityPhase = phase === 'intensity' || phase === 'strength';
  const isDeloadPhase = phase === 'deload';

  // Determine if quads, hamstrings, or glutes are priority
  const isQuadsPriority = priorityMuscleGroups.includes('quadriceps');
  const isHamstringsPriority = priorityMuscleGroups.includes('hamstrings');
  const isGlutesPriority = priorityMuscleGroups.includes('glutes');
  const isCalvesPriority = priorityMuscleGroups.includes('calves');

  // Check available equipment
  const hasBarbell = equipment.includes('barbell');
  const hasDumbbell = equipment.includes('dumbbell');
  const hasLegPress = equipment.includes('leg_press');
  const hasHackSquat = equipment.includes('hack_squat');
  const hasLegExtension = equipment.includes('leg_extension');
  const hasLegCurl = equipment.includes('leg_curl');

  // Adjust volume based on phase and level
  const volumeMultiplier = isDeloadPhase ? 0.5 :
                          isVolumePhase ? 1.2 : 1.0;

  const intensityMultiplier = isDeloadPhase ? 0.8 :
                             isIntensityPhase ? 1.2 : 1.0;

  // Base sets and reps by level
  let baseSets = level === 'beginner' ? 3 :
                level === 'intermediate' ? 4 : 5;

  // Adjust for deload
  if (isDeloadPhase) {
    baseSets = Math.max(2, Math.floor(baseSets * 0.6));
  }

  // Adjust for priority muscle groups
  const prioritySetBonus = 1;

  // Determine exercise order and selection based on variant
  if (variant === 'nippard') {
    // Jeff Nippard's approach - scientific, balanced, with emphasis on compound movements

    // Day 1 focuses more on quads, Day 2 more on hamstrings/glutes (if applicable)
    const isQuadFocusDay = dayNumber === 1;

    // Compound movements first
    if (isQuadFocusDay) {
      // Start with quad-dominant compound movement
      if (hasBarbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'barbell_squat',
          name: 'Barbell Squat',
          sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '4-6' : isVolumePhase ? '8-10' : '6-8',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 180 : 150,
          notes: 'Focus on depth and knee tracking',
          order: 1
        });
      } else if (hasHackSquat) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'hack_squat',
          name: 'Hack Squat',
          sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '10-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Control eccentric, focus on quads',
          order: 1
        });
      } else if (hasLegPress) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'leg_press',
          name: 'Leg Press',
          sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '10-15' : '8-12',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Feet shoulder width, focus on full range of motion',
          order: 1
        });
      }

      // Second compound movement - hamstring/glute focused
      if (hasBarbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'romanian_deadlift',
          name: 'Romanian Deadlift',
          sets: isDeloadPhase ? 2 : (isHamstringsPriority || isGlutesPriority) ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-10' : '6-8',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Focus on hip hinge, feel stretch in hamstrings',
          order: 2
        });
      } else if (hasDumbbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'dumbbell_rdl',
          name: 'Dumbbell Romanian Deadlift',
          sets: isDeloadPhase ? 2 : (isHamstringsPriority || isGlutesPriority) ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 120 : 90,
          notes: 'Push hips back, maintain neutral spine',
          order: 2
        });
      }
    } else {
      // Day 2 - Start with hamstring/glute compound movement
      if (hasBarbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'romanian_deadlift',
          name: 'Romanian Deadlift',
          sets: isDeloadPhase ? 2 : (isHamstringsPriority || isGlutesPriority) ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-10' : '6-8',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Focus on hip hinge, feel stretch in hamstrings',
          order: 1
        });
      } else if (hasDumbbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'dumbbell_rdl',
          name: 'Dumbbell Romanian Deadlift',
          sets: isDeloadPhase ? 2 : (isHamstringsPriority || isGlutesPriority) ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 120 : 90,
          notes: 'Push hips back, maintain neutral spine',
          order: 1
        });
      }

      // Second compound movement - quad focused
      if (hasLegPress) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'leg_press',
          name: 'Leg Press',
          sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '10-15' : '8-12',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Feet shoulder width, focus on full range of motion',
          order: 2
        });
      } else if (hasHackSquat) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'hack_squat',
          name: 'Hack Squat',
          sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '10-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Control eccentric, focus on quads',
          order: 2
        });
      } else if (hasDumbbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'dumbbell_split_squat',
          name: 'Dumbbell Split Squat',
          sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets + prioritySetBonus : baseSets,
          reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 120 : 90,
          notes: 'Keep front knee tracking over toe',
          order: 2
        });
      }
    }

    // Add isolation exercises
    // Quad isolation
    if (hasLegExtension) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'leg_extension',
        name: 'Leg Extension',
        sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: isIntensityPhase ? '10-12' : isVolumePhase ? '12-15' : '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Focus on quad contraction at top',
        order: exercises.length + 1
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'dumbbell_lunge',
        name: 'Dumbbell Walking Lunge',
        sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: '10-12 per leg',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Take long strides, keep torso upright',
        order: exercises.length + 1
      });
    }

    // Hamstring isolation
    if (hasLegCurl) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'lying_leg_curl',
        name: 'Lying Leg Curl',
        sets: isDeloadPhase ? 2 : isHamstringsPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: isIntensityPhase ? '8-10' : isVolumePhase ? '12-15' : '10-12',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Focus on hamstring contraction',
        order: exercises.length + 1
      });
    } else {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'glute_ham_raise',
        name: 'Glute Ham Raise',
        sets: isDeloadPhase ? 2 : isHamstringsPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: '8-12',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Control the eccentric portion',
        order: exercises.length + 1
      });
    }

    // Glute isolation
    exercises.push({
      id: uuidv4(),
      exerciseId: 'hip_thrust',
      name: 'Hip Thrust',
      sets: isDeloadPhase ? 2 : isGlutesPriority ? baseSets + 1 : baseSets,
      reps: isIntensityPhase ? '8-10' : isVolumePhase ? '12-15' : '10-12',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 90,
      notes: 'Focus on glute contraction at top',
      order: exercises.length + 1
    });

    // Calf exercise
    exercises.push({
      id: uuidv4(),
      exerciseId: 'standing_calf_raise',
      name: 'Standing Calf Raise',
      sets: isDeloadPhase ? 2 : isCalvesPriority ? baseSets + 1 : baseSets,
      reps: '12-15',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 60,
      notes: 'Full stretch at bottom, full contraction at top',
      order: exercises.length + 1
    });

    // Add one more isolation exercise for priority muscle group
    if (isQuadsPriority && !isDeloadPhase) {
      if (hasLegPress) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'narrow_leg_press',
          name: 'Narrow Stance Leg Press',
          sets: Math.max(2, baseSets - 1),
          reps: '10-15',
          rir: 2,
          restSeconds: 90,
          notes: 'Feet close together, focus on quads',
          order: exercises.length + 1
        });
      }
    } else if (isHamstringsPriority && !isDeloadPhase) {
      if (hasLegCurl) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'seated_leg_curl',
          name: 'Seated Leg Curl',
          sets: Math.max(2, baseSets - 1),
          reps: '10-15',
          rir: 2,
          restSeconds: 90,
          notes: 'Different angle than lying leg curl',
          order: exercises.length + 1
        });
      }
    } else if (isGlutesPriority && !isDeloadPhase) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'cable_kickback',
        name: 'Cable Kickback',
        sets: Math.max(2, baseSets - 1),
        reps: '12-15 per leg',
        rir: 2,
        restSeconds: 60,
        notes: 'Focus on glute contraction',
        order: exercises.length + 1
      });
    } else if (isCalvesPriority && !isDeloadPhase) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'seated_calf_raise',
        name: 'Seated Calf Raise',
        sets: Math.max(2, baseSets - 1),
        reps: '15-20',
        rir: 2,
        restSeconds: 60,
        notes: 'Targets soleus muscle',
        order: exercises.length + 1
      });
    }
  } else if (variant === 'cbum') {
    // Chris Bumstead's approach - high volume, intensity techniques, focus on mind-muscle connection

    // Day 1 focuses more on quads, Day 2 more on hamstrings/glutes (if applicable)
    const isQuadFocusDay = dayNumber === 1;

    // Compound movements first
    if (isQuadFocusDay) {
      // Start with quad-dominant compound movement
      if (hasBarbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'barbell_squat',
          name: 'Barbell Squat',
          sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets + 2 : baseSets + 1,
          reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-12' : '6-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 180 : 150,
          notes: 'Focus on controlled eccentric, drive through heels',
          order: 1
        });
      } else if (hasHackSquat) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'hack_squat',
          name: 'Hack Squat',
          sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets + 2 : baseSets + 1,
          reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-15' : '8-12',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Control the eccentric, pause at bottom',
          order: 1
        });
      }

      // Second quad movement
      if (hasLegPress) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'leg_press',
          name: 'Leg Press',
          sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets + 1 : baseSets,
          reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-15' : '8-12',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Vary foot position for different emphasis',
          order: 2
        });
      }
    } else {
      // Day 2 - Start with hamstring/glute compound movement
      if (hasBarbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'romanian_deadlift',
          name: 'Romanian Deadlift',
          sets: isDeloadPhase ? 2 : (isHamstringsPriority || isGlutesPriority) ? baseSets + 2 : baseSets + 1,
          reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-12' : '8-10',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 150 : 120,
          notes: 'Focus on hamstring stretch, squeeze glutes at top',
          order: 1
        });
      } else if (hasDumbbell) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'dumbbell_rdl',
          name: 'Dumbbell Romanian Deadlift',
          sets: isDeloadPhase ? 2 : (isHamstringsPriority || isGlutesPriority) ? baseSets + 2 : baseSets + 1,
          reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-15' : '8-12',
          rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
          restSeconds: isIntensityPhase ? 120 : 90,
          notes: 'Push hips back, maintain neutral spine',
          order: 1
        });
      }
    }

    // Add isolation exercises - CBUM style uses more isolation with higher volume
    // Quad isolation
    if (hasLegExtension) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'leg_extension',
        name: 'Leg Extension',
        sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets + 1 : baseSets,
        reps: '15-20',
        rir: isDeloadPhase ? 3 : 1,
        restSeconds: 60,
        notes: 'Drop set on last set, focus on peak contraction',
        order: exercises.length + 1
      });
    }

    // Hamstring isolation
    if (hasLegCurl) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'lying_leg_curl',
        name: 'Lying Leg Curl',
        sets: isDeloadPhase ? 2 : isHamstringsPriority ? baseSets + 1 : baseSets,
        reps: '12-15',
        rir: isDeloadPhase ? 3 : 1,
        restSeconds: 60,
        notes: 'Slow eccentric, focus on contraction',
        order: exercises.length + 1
      });

      if (!isDeloadPhase && (isHamstringsPriority || dayNumber === 2)) {
        exercises.push({
          id: uuidv4(),
          exerciseId: 'seated_leg_curl',
          name: 'Seated Leg Curl',
          sets: isHamstringsPriority ? baseSets : Math.max(2, baseSets - 1),
          reps: '12-15',
          rir: 2,
          restSeconds: 60,
          notes: 'Different angle than lying leg curl',
          order: exercises.length + 1
        });
      }
    }

    // Glute isolation
    exercises.push({
      id: uuidv4(),
      exerciseId: 'hip_thrust',
      name: 'Hip Thrust',
      sets: isDeloadPhase ? 2 : isGlutesPriority ? baseSets + 1 : baseSets,
      reps: '12-15',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 60,
      notes: 'Pause at top of movement',
      order: exercises.length + 1
    });

    if (!isDeloadPhase && (isGlutesPriority || dayNumber === 2)) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'cable_kickback',
        name: 'Cable Kickback',
        sets: isGlutesPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: '15-20 per leg',
        rir: 2,
        restSeconds: 45,
        notes: 'Focus on glute contraction',
        order: exercises.length + 1
      });
    }

    // Calf exercises - CBUM style uses multiple calf exercises
    exercises.push({
      id: uuidv4(),
      exerciseId: 'standing_calf_raise',
      name: 'Standing Calf Raise',
      sets: isDeloadPhase ? 2 : isCalvesPriority ? baseSets + 2 : baseSets + 1,
      reps: '12-15',
      rir: isDeloadPhase ? 3 : 1,
      restSeconds: 60,
      notes: 'Full range of motion, pause at bottom',
      order: exercises.length + 1
    });

    if (!isDeloadPhase) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'seated_calf_raise',
        name: 'Seated Calf Raise',
        sets: isCalvesPriority ? baseSets + 1 : baseSets,
        reps: '15-20',
        rir: 2,
        restSeconds: 60,
        notes: 'Targets soleus muscle',
        order: exercises.length + 1
      });
    }
  } else {
    // Standard PPL approach - balanced, with moderate volume and intensity

    // Compound movements first
    if (hasBarbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'barbell_squat',
        name: 'Barbell Squat',
        sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '5-8' : isVolumePhase ? '8-12' : '6-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 180 : 150,
        notes: 'Focus on depth and form',
        order: 1
      });
    } else if (hasLegPress) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'leg_press',
        name: 'Leg Press',
        sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '6-10' : isVolumePhase ? '10-15' : '8-12',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 150 : 120,
        notes: 'Full range of motion',
        order: 1
      });
    }

    // Second compound movement
    if (hasBarbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'romanian_deadlift',
        name: 'Romanian Deadlift',
        sets: isDeloadPhase ? 2 : (isHamstringsPriority || isGlutesPriority) ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-12' : '6-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 150 : 120,
        notes: 'Focus on hamstring stretch',
        order: 2
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'dumbbell_rdl',
        name: 'Dumbbell Romanian Deadlift',
        sets: isDeloadPhase ? 2 : (isHamstringsPriority || isGlutesPriority) ? baseSets + 1 : baseSets,
        reps: isIntensityPhase ? '6-10' : isVolumePhase ? '8-12' : '8-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 120 : 90,
        notes: 'Maintain neutral spine',
        order: 2
      });
    }

    // Quad isolation
    if (hasLegExtension) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'leg_extension',
        name: 'Leg Extension',
        sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Focus on quad contraction',
        order: 3
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'dumbbell_lunge',
        name: 'Dumbbell Lunge',
        sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: '10-12 per leg',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Keep torso upright',
        order: 3
      });
    }

    // Hamstring isolation
    if (hasLegCurl) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'lying_leg_curl',
        name: 'Lying Leg Curl',
        sets: isDeloadPhase ? 2 : isHamstringsPriority ? baseSets : Math.max(2, baseSets - 1),
        reps: '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Focus on hamstring contraction',
        order: 4
      });
    }

    // Calf exercise
    exercises.push({
      id: uuidv4(),
      exerciseId: 'standing_calf_raise',
      name: 'Standing Calf Raise',
      sets: isDeloadPhase ? 2 : isCalvesPriority ? baseSets : Math.max(2, baseSets - 1),
      reps: '12-15',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 60,
      notes: 'Full range of motion',
      order: 5
    });
  }

  return exercises;
}

/**
 * Create an Upper day workout (for 5-day split)
 */
function createUpperDay(
  variant: PplVariant,
  level: TrainingLevel,
  phase: PplPhase,
  priorityMuscleGroups: string[],
  equipment: string[]
): WorkoutDay {
  // Determine priority muscle groups
  const isChestPriority = priorityMuscleGroups.includes('chest');
  const isBackPriority = priorityMuscleGroups.includes('back');
  const isShouldersPrority = priorityMuscleGroups.includes('shoulders');
  const isBicepsPriority = priorityMuscleGroups.includes('biceps');
  const isTricepsPriority = priorityMuscleGroups.includes('triceps');

  // Adjust description based on priorities
  let description = `Full upper body training with emphasis on weak points`;
  if (isChestPriority) description = `Upper body training with emphasis on chest`;
  if (isBackPriority) description = `Upper body training with emphasis on back`;
  if (isShouldersPrority) description = `Upper body training with emphasis on shoulders`;
  if (isBicepsPriority) description = `Upper body training with emphasis on biceps`;
  if (isTricepsPriority) description = `Upper body training with emphasis on triceps`;

  // Create the workout day structure
  const workoutDay: WorkoutDay = {
    id: uuidv4(),
    name: `Upper Body`,
    description,
    targetMuscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
    difficulty: level,
    estimatedDuration: level === 'beginner' ? 60 : level === 'intermediate' ? 75 : 90,
    exerciseSets: []
  };

  // Add exercises based on variant, level, and phase
  const exercises = getUpperDayExercises(variant, level, phase, priorityMuscleGroups, equipment);
  workoutDay.exerciseSets = exercises;

  return workoutDay;
}

/**
 * Get exercises for Upper day
 */
function getUpperDayExercises(
  variant: PplVariant,
  level: TrainingLevel,
  phase: PplPhase,
  priorityMuscleGroups: string[],
  equipment: string[]
): ExerciseSet[] {
  const exercises: ExerciseSet[] = [];

  // Determine if this is a volume or intensity phase
  const isVolumePhase = phase === 'volume';
  const isIntensityPhase = phase === 'intensity' || phase === 'strength';
  const isDeloadPhase = phase === 'deload';

  // Determine priority muscle groups
  const isChestPriority = priorityMuscleGroups.includes('chest');
  const isBackPriority = priorityMuscleGroups.includes('back');
  const isShouldersPrority = priorityMuscleGroups.includes('shoulders');
  const isBicepsPriority = priorityMuscleGroups.includes('biceps');
  const isTricepsPriority = priorityMuscleGroups.includes('triceps');

  // Check available equipment
  const hasBarbell = equipment.includes('barbell');
  const hasDumbbell = equipment.includes('dumbbell');
  const hasCableMachine = equipment.includes('cable');
  const hasPullupBar = equipment.includes('pullup_bar');

  // Adjust volume based on phase and level
  const volumeMultiplier = isDeloadPhase ? 0.5 :
                          isVolumePhase ? 1.2 : 1.0;

  const intensityMultiplier = isDeloadPhase ? 0.8 :
                             isIntensityPhase ? 1.2 : 1.0;

  // Base sets and reps by level
  let baseSets = level === 'beginner' ? 3 :
                level === 'intermediate' ? 4 : 4;

  // Adjust for deload
  if (isDeloadPhase) {
    baseSets = Math.max(2, Math.floor(baseSets * 0.6));
  }

  // Adjust for priority muscle groups
  const prioritySetBonus = 1;

  // Upper day is a balanced mix of push and pull exercises
  // Start with horizontal push (chest)
  if (hasBarbell) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'barbell_bench_press',
      name: 'Barbell Bench Press',
      sets: isDeloadPhase ? 2 : isChestPriority ? baseSets + prioritySetBonus : baseSets,
      reps: isIntensityPhase ? '5-8' : isVolumePhase ? '8-12' : '6-10',
      rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
      restSeconds: isIntensityPhase ? 180 : 120,
      notes: 'Focus on full range of motion',
      order: 1
    });
  } else if (hasDumbbell) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'dumbbell_bench_press',
      name: 'Dumbbell Bench Press',
      sets: isDeloadPhase ? 2 : isChestPriority ? baseSets + prioritySetBonus : baseSets,
      reps: isIntensityPhase ? '6-10' : isVolumePhase ? '8-12' : '8-10',
      rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
      restSeconds: isIntensityPhase ? 150 : 120,
      notes: 'Control the weights throughout the movement',
      order: 1
    });
  }

  // Horizontal pull (back)
  if (hasBarbell) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'barbell_row',
      name: 'Barbell Row',
      sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + prioritySetBonus : baseSets,
      reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-12' : '6-10',
      rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
      restSeconds: isIntensityPhase ? 150 : 120,
      notes: 'Pull to lower chest, control the eccentric',
      order: 2
    });
  } else if (hasDumbbell) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'single_arm_dumbbell_row',
      name: 'Single-Arm Dumbbell Row',
      sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + prioritySetBonus : baseSets,
      reps: isIntensityPhase ? '6-10' : isVolumePhase ? '8-12' : '8-10',
      rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
      restSeconds: isIntensityPhase ? 120 : 90,
      notes: 'Full stretch at bottom, squeeze at top',
      order: 2
    });
  }

  // Vertical push (shoulders)
  if (hasBarbell) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'overhead_press',
      name: 'Overhead Press',
      sets: isDeloadPhase ? 2 : isShouldersPrority ? baseSets + prioritySetBonus : baseSets,
      reps: isIntensityPhase ? '5-8' : isVolumePhase ? '8-12' : '6-10',
      rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
      restSeconds: isIntensityPhase ? 150 : 120,
      notes: 'Press directly overhead, avoid excessive arching',
      order: 3
    });
  } else if (hasDumbbell) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'dumbbell_shoulder_press',
      name: 'Dumbbell Shoulder Press',
      sets: isDeloadPhase ? 2 : isShouldersPrority ? baseSets + prioritySetBonus : baseSets,
      reps: isIntensityPhase ? '6-10' : isVolumePhase ? '8-12' : '8-10',
      rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
      restSeconds: isIntensityPhase ? 150 : 120,
      notes: 'Control the weights throughout the movement',
      order: 3
    });

  // Vertical pull (back)
  if (hasPullupBar) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'pullups',
      name: 'Pull-ups',
      sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + prioritySetBonus : baseSets,
      reps: isIntensityPhase ? '5-8' : isVolumePhase ? '8-12' : '6-10',
      rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
      restSeconds: isIntensityPhase ? 150 : 120,
      notes: 'Full range of motion, controlled eccentric',
      order: 4
    });
  } else if (hasCableMachine) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'lat_pulldown',
      name: 'Lat Pulldown',
      sets: isDeloadPhase ? 2 : isBackPriority ? baseSets + prioritySetBonus : baseSets,
      reps: isIntensityPhase ? '6-10' : isVolumePhase ? '8-12' : '8-10',
      rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
      restSeconds: isIntensityPhase ? 150 : 120,
      notes: 'Pull to upper chest, focus on lats',
      order: 4
    });
  }

  // Add isolation exercises for each muscle group
  // Chest isolation
  if (hasCableMachine) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'cable_chest_fly',
      name: 'Cable Chest Fly',
      sets: isDeloadPhase ? 2 : isChestPriority ? baseSets : Math.max(2, baseSets - 1),
      reps: '10-15',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 90,
      notes: 'Focus on chest contraction at the midline',
      order: exercises.length + 1
    });
  } else if (hasDumbbell) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'dumbbell_fly',
      name: 'Dumbbell Fly',
      sets: isDeloadPhase ? 2 : isChestPriority ? baseSets : Math.max(2, baseSets - 1),
      reps: '10-15',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 90,
      notes: 'Keep slight bend in elbows, focus on stretch',
      order: exercises.length + 1
    });
  }

  // Shoulder isolation
  exercises.push({
    id: uuidv4(),
    exerciseId: 'lateral_raise',
    name: 'Lateral Raise',
    sets: isDeloadPhase ? 2 : isShouldersPrority ? baseSets : Math.max(2, baseSets - 1),
    reps: '12-15',
    rir: isDeloadPhase ? 3 : 2,
    restSeconds: 60,
    notes: 'Lead with elbows, slight bend in arm',
    order: exercises.length + 1
  });

  // Biceps isolation
  if (hasBarbell) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'barbell_curl',
      name: 'Barbell Curl',
      sets: isDeloadPhase ? 2 : isBicepsPriority ? baseSets : Math.max(2, baseSets - 1),
      reps: '10-12',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 60,
      notes: 'Keep elbows at sides, control the eccentric',
      order: exercises.length + 1
    });
  } else if (hasDumbbell) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'dumbbell_curl',
      name: 'Dumbbell Curl',
      sets: isDeloadPhase ? 2 : isBicepsPriority ? baseSets : Math.max(2, baseSets - 1),
      reps: '10-12',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 60,
      notes: 'Alternate arms, supinate wrist at top',
      order: exercises.length + 1
    });
  }

  // Triceps isolation
  if (hasCableMachine) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'tricep_pushdown',
      name: 'Tricep Pushdown',
      sets: isDeloadPhase ? 2 : isTricepsPriority ? baseSets : Math.max(2, baseSets - 1),
      reps: '10-15',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 60,
      notes: 'Keep elbows tucked to sides',
      order: exercises.length + 1
    });
  } else {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'tricep_dips',
      name: 'Tricep Dips',
      sets: isDeloadPhase ? 2 : isTricepsPriority ? baseSets : Math.max(2, baseSets - 1),
      reps: '10-15',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 60,
      notes: 'Keep body upright to target triceps',
      order: exercises.length + 1
    });
  }

  // Add one more exercise for priority muscle group
  if (isChestPriority && !isDeloadPhase) {
    if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'incline_dumbbell_press',
        name: 'Incline Dumbbell Press',
        sets: Math.max(2, baseSets - 1),
        reps: '10-12',
        rir: 2,
        restSeconds: 90,
        notes: 'Use a moderate incline (30 degrees)',
        order: exercises.length + 1
      });
    }
  } else if (isBackPriority && !isDeloadPhase) {
    if (hasCableMachine) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'straight_arm_pulldown',
        name: 'Straight Arm Pulldown',
        sets: Math.max(2, baseSets - 1),
        reps: '12-15',
        rir: 2,
        restSeconds: 60,
        notes: 'Keep arms straight, focus on lats',
        order: exercises.length + 1
      });
    }
  } else if (isShouldersPrority && !isDeloadPhase) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'rear_delt_fly',
      name: 'Rear Delt Fly',
      sets: Math.max(2, baseSets - 1),
      reps: '12-15',
      rir: 2,
      restSeconds: 60,
      notes: 'Pull elbows back and up',
      order: exercises.length + 1
    });
  } else if (isBicepsPriority && !isDeloadPhase) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'hammer_curl',
      name: 'Hammer Curl',
      sets: Math.max(2, baseSets - 1),
      reps: '10-12',
      rir: 2,
      restSeconds: 60,
      notes: 'Neutral grip targets brachialis',
      order: exercises.length + 1
    });
  } else if (isTricepsPriority && !isDeloadPhase) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'overhead_tricep_extension',
      name: 'Overhead Tricep Extension',
      sets: Math.max(2, baseSets - 1),
      reps: '10-12',
      rir: 2,
      restSeconds: 60,
      notes: 'Keep elbows close to head',
      order: exercises.length + 1
    });
  }

  return exercises;
}

/**
 * Create a Lower day workout (for 5-day split)
 */
function createLowerDay(
  variant: PplVariant,
  level: TrainingLevel,
  phase: PplPhase,
  priorityMuscleGroups: string[],
  equipment: string[]
): WorkoutDay {
  // Determine if quads, hamstrings, or glutes are priority
  const isQuadsPriority = priorityMuscleGroups.includes('quadriceps');
  const isHamstringsPriority = priorityMuscleGroups.includes('hamstrings');
  const isGlutesPriority = priorityMuscleGroups.includes('glutes');
  const isCalvesPriority = priorityMuscleGroups.includes('calves');

  // Adjust description based on priorities
  let description = `Full lower body training with emphasis on weak points`;
  if (isQuadsPriority) description = `Lower body training with emphasis on quadriceps`;
  if (isHamstringsPriority) description = `Lower body training with emphasis on hamstrings`;
  if (isGlutesPriority) description = `Lower body training with emphasis on glutes`;
  if (isCalvesPriority) description = `Lower body training with emphasis on calves`;

  // Create the workout day structure
  const workoutDay: WorkoutDay = {
    id: uuidv4(),
    name: `Lower Body`,
    description,
    targetMuscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    difficulty: level,
    estimatedDuration: level === 'beginner' ? 60 : level === 'intermediate' ? 75 : 90,
    exerciseSets: []
  };

  // Add exercises based on variant, level, and phase
  const exercises = getLowerDayExercises(variant, level, phase, priorityMuscleGroups, equipment);
  workoutDay.exerciseSets = exercises;

  return workoutDay;
}

/**
 * Get exercises for Lower day
 */
function getLowerDayExercises(
  variant: PplVariant,
  level: TrainingLevel,
  phase: PplPhase,
  priorityMuscleGroups: string[],
  equipment: string[]
): ExerciseSet[] {
  const exercises: ExerciseSet[] = [];

  // Determine if this is a volume or intensity phase
  const isVolumePhase = phase === 'volume';
  const isIntensityPhase = phase === 'intensity' || phase === 'strength';
  const isDeloadPhase = phase === 'deload';

  // Determine if quads, hamstrings, or glutes are priority
  const isQuadsPriority = priorityMuscleGroups.includes('quadriceps');
  const isHamstringsPriority = priorityMuscleGroups.includes('hamstrings');
  const isGlutesPriority = priorityMuscleGroups.includes('glutes');
  const isCalvesPriority = priorityMuscleGroups.includes('calves');

  // Check available equipment
  const hasBarbell = equipment.includes('barbell');
  const hasDumbbell = equipment.includes('dumbbell');
  const hasLegPress = equipment.includes('leg_press');
  const hasHackSquat = equipment.includes('hack_squat');
  const hasLegExtension = equipment.includes('leg_extension');
  const hasLegCurl = equipment.includes('leg_curl');

  // Adjust volume based on phase and level
  const volumeMultiplier = isDeloadPhase ? 0.5 :
                          isVolumePhase ? 1.2 : 1.0;

  const intensityMultiplier = isDeloadPhase ? 0.8 :
                             isIntensityPhase ? 1.2 : 1.0;

  // Base sets and reps by level
  let baseSets = level === 'beginner' ? 3 :
                level === 'intermediate' ? 4 : 4;

  // Adjust for deload
  if (isDeloadPhase) {
    baseSets = Math.max(2, Math.floor(baseSets * 0.6));
  }

  // Adjust for priority muscle groups
  const prioritySetBonus = 1;

  // Lower day is focused on all lower body muscles
  // Start with quad-dominant compound movement
  if (hasBarbell) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'barbell_squat',
      name: 'Barbell Squat',
      sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets + prioritySetBonus : baseSets,
      reps: isIntensityPhase ? '5-8' : isVolumePhase ? '8-12' : '6-10',
      rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
      restSeconds: isIntensityPhase ? 180 : 150,
      notes: 'Focus on depth and form',
      order: 1
    });
  } else if (hasLegPress) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'leg_press',
      name: 'Leg Press',
      sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets + prioritySetBonus : baseSets,
      reps: isIntensityPhase ? '6-10' : isVolumePhase ? '10-15' : '8-12',
      rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
      restSeconds: isIntensityPhase ? 150 : 120,
      notes: 'Full range of motion',
      order: 1
    });
  } else if (hasDumbbell) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'dumbbell_goblet_squat',
      name: 'Dumbbell Goblet Squat',
      sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets + prioritySetBonus : baseSets,
      reps: isIntensityPhase ? '8-10' : isVolumePhase ? '10-15' : '8-12',
      rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
      restSeconds: isIntensityPhase ? 150 : 120,
      notes: 'Keep torso upright, full depth',
      order: 1
    });

  // Hamstring/glute-dominant compound movement
  if (hasBarbell) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'romanian_deadlift',
      name: 'Romanian Deadlift',
      sets: isDeloadPhase ? 2 : (isHamstringsPriority || isGlutesPriority) ? baseSets + prioritySetBonus : baseSets,
      reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-12' : '6-10',
      rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
      restSeconds: isIntensityPhase ? 150 : 120,
      notes: 'Focus on hamstring stretch, maintain neutral spine',
      order: 2
    });
  } else if (hasDumbbell) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'dumbbell_rdl',
      name: 'Dumbbell Romanian Deadlift',
      sets: isDeloadPhase ? 2 : (isHamstringsPriority || isGlutesPriority) ? baseSets + prioritySetBonus : baseSets,
      reps: isIntensityPhase ? '6-10' : isVolumePhase ? '8-12' : '8-10',
      rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
      restSeconds: isIntensityPhase ? 120 : 90,
      notes: 'Push hips back, feel stretch in hamstrings',
      order: 2
    });
  }

  // Quad isolation
  if (hasLegExtension) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'leg_extension',
      name: 'Leg Extension',
      sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets : Math.max(2, baseSets - 1),
      reps: '10-15',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 90,
      notes: 'Focus on quad contraction at top',
      order: 3
    });
  } else if (hasDumbbell) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'dumbbell_split_squat',
      name: 'Dumbbell Split Squat',
      sets: isDeloadPhase ? 2 : isQuadsPriority ? baseSets : Math.max(2, baseSets - 1),
      reps: '10-12 per leg',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 90,
      notes: 'Keep front knee tracking over toe',
      order: 3
    });
  }

  // Hamstring isolation
  if (hasLegCurl) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'lying_leg_curl',
      name: 'Lying Leg Curl',
      sets: isDeloadPhase ? 2 : isHamstringsPriority ? baseSets : Math.max(2, baseSets - 1),
      reps: '10-15',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 90,
      notes: 'Focus on hamstring contraction',
      order: 4
    });
  } else {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'glute_ham_raise',
      name: 'Glute Ham Raise',
      sets: isDeloadPhase ? 2 : isHamstringsPriority ? baseSets : Math.max(2, baseSets - 1),
      reps: '8-12',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 90,
      notes: 'Control the eccentric portion',
      order: 4
    });
  }

  // Glute isolation
  exercises.push({
    id: uuidv4(),
    exerciseId: 'hip_thrust',
    name: 'Hip Thrust',
    sets: isDeloadPhase ? 2 : isGlutesPriority ? baseSets : Math.max(2, baseSets - 1),
    reps: '10-15',
    rir: isDeloadPhase ? 3 : 2,
    restSeconds: 90,
    notes: 'Focus on glute contraction at top',
    order: 5
  });

  // Calf exercise
  exercises.push({
    id: uuidv4(),
    exerciseId: 'standing_calf_raise',
    name: 'Standing Calf Raise',
    sets: isDeloadPhase ? 2 : isCalvesPriority ? baseSets : Math.max(2, baseSets - 1),
    reps: '12-15',
    rir: isDeloadPhase ? 3 : 2,
    restSeconds: 60,
    notes: 'Full range of motion',
    order: 6
  });

  // Add one more exercise for priority muscle group
  if (isQuadsPriority && !isDeloadPhase) {
    if (hasLegPress) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'narrow_leg_press',
        name: 'Narrow Stance Leg Press',
        sets: Math.max(2, baseSets - 1),
        reps: '10-15',
        rir: 2,
        restSeconds: 90,
        notes: 'Feet close together, focus on quads',
        order: exercises.length + 1
      });
    }
  } else if (isHamstringsPriority && !isDeloadPhase) {
    if (hasLegCurl) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'seated_leg_curl',
        name: 'Seated Leg Curl',
        sets: Math.max(2, baseSets - 1),
        reps: '10-15',
        rir: 2,
        restSeconds: 90,
        notes: 'Different angle than lying leg curl',
        order: exercises.length + 1
      });
    }
  } else if (isGlutesPriority && !isDeloadPhase) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'cable_kickback',
      name: 'Cable Kickback',
      sets: Math.max(2, baseSets - 1),
      reps: '12-15 per leg',
      rir: 2,
      restSeconds: 60,
      notes: 'Focus on glute contraction',
      order: exercises.length + 1
    });
  } else if (isCalvesPriority && !isDeloadPhase) {
    exercises.push({
      id: uuidv4(),
      exerciseId: 'seated_calf_raise',
      name: 'Seated Calf Raise',
      sets: Math.max(2, baseSets - 1),
      reps: '15-20',
      rir: 2,
      restSeconds: 60,
      notes: 'Targets soleus muscle',
      order: exercises.length + 1
    });
  }

  return exercises;
}

/**
 * Create a Specialization day workout (for 7-day split)
 */
function createSpecializationDay(
  variant: PplVariant,
  level: TrainingLevel,
  phase: PplPhase,
  priorityMuscleGroups: string[],
  equipment: string[]
): WorkoutDay {
  // Determine specialization focus based on priority muscle groups
  const focus = priorityMuscleGroups.length > 0 ? priorityMuscleGroups[0] : 'full_body';

  // Create a descriptive name based on the focus
  let name = 'Specialization Day';
  let description = 'Focused training for lagging or priority muscle groups';

  if (focus === 'chest') {
    name = 'Chest Specialization';
    description = 'Focused chest training with multiple angles and techniques';
  } else if (focus === 'back') {
    name = 'Back Specialization';
    description = 'Focused back training targeting width and thickness';
  } else if (focus === 'shoulders') {
    name = 'Shoulder Specialization';
    description = 'Focused shoulder training for all three deltoid heads';
  } else if (focus === 'biceps' || focus === 'triceps') {
    name = 'Arm Specialization';
    description = 'Focused arm training for biceps and triceps development';
  } else if (focus === 'quadriceps' || focus === 'hamstrings' || focus === 'glutes') {
    name = 'Leg Specialization';
    description = 'Focused leg training with emphasis on lagging muscle groups';
  } else if (focus === 'calves') {
    name = 'Calf Specialization';
    description = 'Focused calf training for both gastrocnemius and soleus';
  }

  // Create the workout day structure
  const workoutDay: WorkoutDay = {
    id: uuidv4(),
    name,
    description,
    targetMuscleGroups: priorityMuscleGroups.length > 0 ? priorityMuscleGroups : ['full_body'],
    difficulty: level,
    estimatedDuration: level === 'beginner' ? 60 : level === 'intermediate' ? 75 : 90,
    exerciseSets: []
  };

  // Add exercises based on variant, level, phase, and focus
  const exercises = getSpecializationDayExercises(variant, level, phase, priorityMuscleGroups, equipment);
  workoutDay.exerciseSets = exercises;

  return workoutDay;
}

/**
 * Get exercises for Specialization day
 */
function getSpecializationDayExercises(
  variant: PplVariant,
  level: TrainingLevel,
  phase: PplPhase,
  priorityMuscleGroups: string[],
  equipment: string[]
): ExerciseSet[] {
  const exercises: ExerciseSet[] = [];

  // Determine if this is a volume or intensity phase
  const isVolumePhase = phase === 'volume';
  const isIntensityPhase = phase === 'intensity' || phase === 'strength';
  const isDeloadPhase = phase === 'deload';

  // Determine focus muscle group
  const focus = priorityMuscleGroups.length > 0 ? priorityMuscleGroups[0] : 'full_body';

  // Check available equipment
  const hasBarbell = equipment.includes('barbell');
  const hasDumbbell = equipment.includes('dumbbell');
  const hasCableMachine = equipment.includes('cable');
  const hasPullupBar = equipment.includes('pullup_bar');
  const hasLegPress = equipment.includes('leg_press');
  const hasLegExtension = equipment.includes('leg_extension');
  const hasLegCurl = equipment.includes('leg_curl');

  // Base sets and reps by level
  let baseSets = level === 'beginner' ? 3 :
                level === 'intermediate' ? 4 : 5;

  // Adjust for deload
  if (isDeloadPhase) {
    baseSets = Math.max(2, Math.floor(baseSets * 0.6));
  }

  // Specialization day has higher volume for the focus muscle group
  const specialSetBonus = 2;

  // Create exercises based on focus muscle group
  if (focus === 'chest') {
    // Chest specialization

    // Compound movements first - multiple angles
    if (hasBarbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'barbell_bench_press',
        name: 'Barbell Bench Press',
        sets: isDeloadPhase ? 3 : baseSets + specialSetBonus,
        reps: isIntensityPhase ? '5-8' : isVolumePhase ? '8-12' : '6-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 180 : 120,
        notes: 'Focus on full range of motion',
        order: 1
      });

      exercises.push({
        id: uuidv4(),
        exerciseId: 'incline_bench_press',
        name: 'Incline Bench Press',
        sets: isDeloadPhase ? 3 : baseSets + 1,
        reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-12' : '6-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 150 : 120,
        notes: 'Use a moderate incline (30 degrees)',
        order: 2
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'dumbbell_bench_press',
        name: 'Dumbbell Bench Press',
        sets: isDeloadPhase ? 3 : baseSets + specialSetBonus,
        reps: isIntensityPhase ? '6-10' : isVolumePhase ? '8-12' : '8-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 150 : 120,
        notes: 'Control the weights throughout the movement',
        order: 1
      });

      exercises.push({
        id: uuidv4(),
        exerciseId: 'incline_dumbbell_press',
        name: 'Incline Dumbbell Press',
        sets: isDeloadPhase ? 3 : baseSets + 1,
        reps: isIntensityPhase ? '6-10' : isVolumePhase ? '8-12' : '8-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 150 : 120,
        notes: 'Use a moderate incline (30 degrees)',
        order: 2
      });
    }

    // Add isolation exercises - multiple angles and techniques
    if (hasCableMachine) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'cable_chest_fly',
        name: 'Cable Chest Fly',
        sets: isDeloadPhase ? 2 : baseSets + 1,
        reps: '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Focus on chest contraction at the midline',
        order: 3
      });

      exercises.push({
        id: uuidv4(),
        exerciseId: 'high_to_low_cable_fly',
        name: 'High-to-Low Cable Fly',
        sets: isDeloadPhase ? 2 : baseSets,
        reps: '12-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Focus on lower chest contraction',
        order: 4
      });

      exercises.push({
        id: uuidv4(),
        exerciseId: 'low_to_high_cable_fly',
        name: 'Low-to-High Cable Fly',
        sets: isDeloadPhase ? 2 : baseSets,
        reps: '12-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Focus on upper chest contraction',
        order: 5
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'dumbbell_fly',
        name: 'Dumbbell Fly',
        sets: isDeloadPhase ? 2 : baseSets + 1,
        reps: '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Keep slight bend in elbows, focus on stretch',
        order: 3
      });

      exercises.push({
        id: uuidv4(),
        exerciseId: 'incline_dumbbell_fly',
        name: 'Incline Dumbbell Fly',
        sets: isDeloadPhase ? 2 : baseSets,
        reps: '12-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Focus on upper chest stretch',
        order: 4
      });

      exercises.push({
        id: uuidv4(),
        exerciseId: 'decline_dumbbell_fly',
        name: 'Decline Dumbbell Fly',
        sets: isDeloadPhase ? 2 : baseSets,
        reps: '12-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Focus on lower chest stretch',
        order: 5
      });
    }

    // Add one more compound movement
    exercises.push({
      id: uuidv4(),
      exerciseId: 'chest_dips',
      name: 'Chest Dips',
      sets: isDeloadPhase ? 2 : baseSets,
      reps: '8-12',
      rir: isDeloadPhase ? 3 : 2,
      restSeconds: 90,
      notes: 'Lean forward to target chest more',
      order: 6
    });
  } else if (focus === 'back') {
    // Back specialization - implement similar structure with back exercises
    // Vertical pull
    if (hasPullupBar) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'pullups',
        name: 'Pull-ups',
        sets: isDeloadPhase ? 3 : baseSets + specialSetBonus,
        reps: isIntensityPhase ? '5-8' : isVolumePhase ? '8-12' : '6-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 180 : 120,
        notes: 'Full range of motion, controlled eccentric',
        order: 1
      });
    } else if (hasCableMachine) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'lat_pulldown',
        name: 'Lat Pulldown',
        sets: isDeloadPhase ? 3 : baseSets + specialSetBonus,
        reps: isIntensityPhase ? '6-10' : isVolumePhase ? '8-12' : '8-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 150 : 120,
        notes: 'Pull to upper chest, focus on lats',
        order: 1
      });
    }

    // Horizontal pull
    if (hasBarbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'barbell_row',
        name: 'Barbell Row',
        sets: isDeloadPhase ? 3 : baseSets + 1,
        reps: isIntensityPhase ? '6-8' : isVolumePhase ? '8-12' : '6-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 150 : 120,
        notes: 'Pull to lower chest, control the eccentric',
        order: 2
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'single_arm_dumbbell_row',
        name: 'Single-Arm Dumbbell Row',
        sets: isDeloadPhase ? 3 : baseSets + 1,
        reps: isIntensityPhase ? '6-10' : isVolumePhase ? '8-12' : '8-10',
        rir: isDeloadPhase ? 3 : isIntensityPhase ? 1 : 2,
        restSeconds: isIntensityPhase ? 120 : 90,
        notes: 'Full stretch at bottom, squeeze at top',
        order: 2
      });
    }

    // Add isolation exercises
    if (hasCableMachine) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'straight_arm_pulldown',
        name: 'Straight Arm Pulldown',
        sets: isDeloadPhase ? 2 : baseSets + 1,
        reps: '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Keep arms straight, focus on lat stretch',
        order: 3
      });

      exercises.push({
        id: uuidv4(),
        exerciseId: 'cable_row',
        name: 'Cable Row',
        sets: isDeloadPhase ? 2 : baseSets,
        reps: '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Use different attachments for variety',
        order: 4
      });

      exercises.push({
        id: uuidv4(),
        exerciseId: 'face_pull',
        name: 'Face Pull',
        sets: isDeloadPhase ? 2 : baseSets,
        reps: '12-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Pull to face with external rotation',
        order: 5
      });
    } else if (hasDumbbell) {
      exercises.push({
        id: uuidv4(),
        exerciseId: 'dumbbell_pullover',
        name: 'Dumbbell Pullover',
        sets: isDeloadPhase ? 2 : baseSets + 1,
        reps: '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Focus on lat stretch',
        order: 3
      });

      exercises.push({
        id: uuidv4(),
        exerciseId: 'chest_supported_row',
        name: 'Chest-Supported Row',
        sets: isDeloadPhase ? 2 : baseSets,
        reps: '10-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Keep chest against pad',
        order: 4
      });

      exercises.push({
        id: uuidv4(),
        exerciseId: 'rear_delt_fly',
        name: 'Rear Delt Fly',
        sets: isDeloadPhase ? 2 : baseSets,
        reps: '12-15',
        rir: isDeloadPhase ? 3 : 2,
        restSeconds: 90,
        notes: 'Focus on rear delt contraction',
        order: 5
      });
    }
  } else if (focus === 'shoulders') {
    // Shoulders specialization - implement similar structure with shoulder exercises
    // Implement similar structure for other focus areas
  } else if (focus === 'biceps' || focus === 'triceps') {
    // Arms specialization
  } else if (focus === 'quadriceps' || focus === 'hamstrings' || focus === 'glutes') {
    // Legs specialization
  } else if (focus === 'calves') {
    // Calves specialization
  } else {
    // Full body - balanced workout with a bit of everything
  }

  return exercises;
}