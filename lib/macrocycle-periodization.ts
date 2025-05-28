/**
 * Advanced Macrocycle Periodization System
 *
 * Implements a comprehensive periodization structure with:
 * - Macrocycles (3-6 months)
 * - Mesocycles (3-6 weeks)
 * - Microcycles (7-10 days)
 * - Programmed deload phases
 * - Fatigue-based deload recommendations
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
  PeriodizationType,
  TrainingPhase,
  TrainingLevel,
  TrainingGoal,
  DeloadType,
  DeloadTiming
} from "@/lib/types/periodization";
import { getUserFatigue } from "@/lib/training-algorithm";
import { WorkoutRoutine, WorkoutDay } from "@/lib/types/training";

// Enhanced interfaces for comprehensive periodization
export interface EnhancedMicroCycle {
  id: string;
  name: string;
  description?: string;
  duration: number; // In days (7-10)
  volume: number; // Scale 1-10
  intensity: number; // Scale 1-10
  frequency: number; // Training days per microcycle
  isDeload: boolean;
  phase: TrainingPhase;
  weekNumber: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  // Advanced properties
  targetRIR: number; // Target Reps In Reserve
  targetRPE?: number; // Target Rate of Perceived Exertion
  volumeDistribution: Record<string, number>; // Muscle group -> % of total volume
  fatigueManagement: {
    expectedFatigue: number; // Expected fatigue level (1-10)
    recoveryStrategies: string[]; // Recovery strategies to implement
    readinessThreshold: number; // Minimum readiness score to proceed (1-10)
  };
  workoutRoutines?: WorkoutRoutine[]; // Associated workout routines
}

export interface EnhancedMesoCycle {
  id: string;
  name: string;
  description?: string;
  duration: number; // In weeks (3-6)
  microCycles: EnhancedMicroCycle[];
  phase: TrainingPhase;
  goal: TrainingGoal;
  volumeProgression: "ascending" | "descending" | "wave" | "step" | "constant";
  intensityProgression: "ascending" | "descending" | "wave" | "step" | "constant";
  includesDeload: boolean;
  deloadStrategy: DeloadType;
  deloadTiming: DeloadTiming;
  startDate?: string;
  endDate?: string;
  notes?: string;
  // Advanced properties
  primaryFocus: string[]; // Primary muscle groups or fitness components
  secondaryFocus: string[]; // Secondary muscle groups or fitness components
  specialTechniques: string[]; // Special techniques to incorporate
  progressionModel: string; // Detailed progression strategy
  adaptationMarkers: string[]; // What to look for to confirm adaptation
  nutritionStrategy?: {
    calorieAdjustment: 'surplus' | 'maintenance' | 'deficit';
    proteinTarget: number; // g/kg of bodyweight
    carbStrategy: 'cycling' | 'constant' | 'periodized';
  };
}

export interface EnhancedMacroCycle {
  id: string;
  userId: string;
  name: string;
  description?: string;
  duration: number; // In months (3-6)
  mesoCycles: EnhancedMesoCycle[];
  periodizationType: PeriodizationType;
  primaryGoal: TrainingGoal;
  secondaryGoals: TrainingGoal[];
  trainingLevel: TrainingLevel;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  // Advanced properties
  trainingFrequency: number; // Days per week
  targetMuscleGroups?: string[]; // Prioritized muscle groups
  trainingHistory?: {
    previousMacrocycles: number; // Number of completed macrocycles
    experienceWithGoal: number; // Months of experience with current goal
    previousResults?: string; // Description of previous results
  };
  deloadSchedule: {
    frequency: number; // Every X weeks
    strategy: DeloadType;
    timing: DeloadTiming;
    autoRegulated: boolean;
    fatigueThreshold: number; // Fatigue score that triggers deload (1-10)
  };
  nutritionPeriodization: {
    phases: {
      phase: 'accumulation' | 'intensification' | 'peak' | 'deload';
      calorieAdjustment: 'surplus' | 'maintenance' | 'deficit';
      proteinTarget: number; // g/kg of bodyweight
      carbStrategy: 'high' | 'moderate' | 'low' | 'cycling';
      fatStrategy: 'high' | 'moderate' | 'low';
      duration: number; // In weeks
    }[];
  };
}

/**
 * Creates a new macrocycle with comprehensive periodization structure
 */
export async function createEnhancedMacroCycle(
  userId: string,
  name: string,
  primaryGoal: TrainingGoal,
  trainingLevel: TrainingLevel,
  frequency: number,
  duration: number, // In months
  startDate: string,
  options?: {
    secondaryGoals?: TrainingGoal[];
    periodizationType?: PeriodizationType;
    targetMuscleGroups?: string[];
    includeNutritionPeriodization?: boolean;
  }
): Promise<EnhancedMacroCycle | null> {
  try {
    // Generate a unique ID for the macrocycle
    const macrocycleId = uuidv4();

    // Set default values for optional parameters
    const secondaryGoals = options?.secondaryGoals || [];
    const periodizationType = options?.periodizationType || 'block';
    const targetMuscleGroups = options?.targetMuscleGroups || [];
    const includeNutritionPeriodization = options?.includeNutritionPeriodization || true;

    // Calculate end date
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + duration);

    // Create the macrocycle structure
    const macrocycle: EnhancedMacroCycle = {
      id: macrocycleId,
      userId,
      name,
      description: `${duration}-month ${primaryGoal} program for ${trainingLevel} level`,
      duration,
      mesoCycles: [], // Will be populated below
      periodizationType,
      primaryGoal,
      secondaryGoals,
      trainingLevel,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trainingFrequency: frequency,
      targetMuscleGroups,
      deloadSchedule: {
        frequency: trainingLevel === 'beginner' ? 6 : trainingLevel === 'intermediate' ? 5 : 4,
        strategy: 'volume',
        timing: 'planned',
        autoRegulated: trainingLevel !== 'beginner',
        fatigueThreshold: 7.5
      },
      nutritionPeriodization: {
        phases: []
      }
    };

    // Generate mesocycles based on the macrocycle duration and goal
    macrocycle.mesoCycles = await generateMesoCycles(
      macrocycleId,
      primaryGoal,
      trainingLevel,
      frequency,
      duration,
      startDate
    );

    // Generate nutrition periodization if requested
    if (includeNutritionPeriodization) {
      macrocycle.nutritionPeriodization = generateNutritionPeriodization(
        primaryGoal,
        duration,
        trainingLevel
      );
    }

    // Save to database
    const { data, error } = await supabase
      .from('macrocycles')
      .insert([{
        id: macrocycle.id,
        user_id: macrocycle.userId,
        name: macrocycle.name,
        description: macrocycle.description,
        duration: macrocycle.duration,
        periodization_type: macrocycle.periodizationType,
        primary_goal: macrocycle.primaryGoal,
        secondary_goals: macrocycle.secondaryGoals,
        training_level: macrocycle.trainingLevel,
        start_date: macrocycle.startDate,
        end_date: macrocycle.endDate,
        is_active: macrocycle.isActive,
        training_frequency: macrocycle.trainingFrequency,
        target_muscle_groups: macrocycle.targetMuscleGroups,
        deload_schedule: macrocycle.deloadSchedule,
        nutrition_periodization: macrocycle.nutritionPeriodization,
        created_at: macrocycle.createdAt,
        updated_at: macrocycle.updatedAt
      }])
      .select();

    if (error) {
      console.error('Error creating macrocycle:', error);
      return null;
    }

    return macrocycle;
  } catch (error) {
    console.error('Error in createEnhancedMacroCycle:', error);
    return null;
  }
}

/**
 * Generate mesocycles for a macrocycle
 * Creates a comprehensive periodization structure with appropriate phases
 */
async function generateMesoCycles(
  macrocycleId: string,
  primaryGoal: TrainingGoal,
  trainingLevel: TrainingLevel,
  frequency: number,
  durationMonths: number,
  startDate: string
): Promise<EnhancedMesoCycle[]> {
  try {
    const mesocycles: EnhancedMesoCycle[] = [];
    const start = new Date(startDate);

    // Determine mesocycle duration based on training level
    const mesocycleDuration = trainingLevel === 'beginner' ? 6 :
                             trainingLevel === 'intermediate' ? 5 : 4;

    // Determine deload frequency based on training level
    const deloadFrequency = trainingLevel === 'beginner' ? 6 :
                           trainingLevel === 'intermediate' ? 5 : 4;

    // Calculate total number of mesocycles
    const totalWeeks = durationMonths * 4.33; // Average weeks per month
    const totalMesocycles = Math.ceil(totalWeeks / mesocycleDuration);

    // Determine phase sequence based on goal
    let phaseSequence: TrainingPhase[] = [];

    switch (primaryGoal) {
      case 'hypertrophy':
        phaseSequence = [
          'foundation',
          'hypertrophy_volume',
          'hypertrophy_intensity',
          'deload',
          'hypertrophy_volume',
          'progressive_overload',
          'deload'
        ];
        break;
      case 'strength':
        phaseSequence = [
          'hypertrophy',
          'strength',
          'deload',
          'strength',
          'strength_peaking',
          'deload'
        ];
        break;
      case 'weight_loss':
        phaseSequence = [
          'metabolic_phase',
          'hypertrophy',
          'deload',
          'metabolic_phase',
          'intensity_phase',
          'deload'
        ];
        break;
      default:
        phaseSequence = [
          'anatomical_adaptation',
          'hypertrophy',
          'deload',
          'strength',
          'maintenance',
          'deload'
        ];
    }

    // Create mesocycles
    let currentDate = new Date(start);

    for (let i = 0; i < totalMesocycles; i++) {
      // Determine the phase for this mesocycle
      const phaseIndex = i % phaseSequence.length;
      const phase = phaseSequence[phaseIndex];

      // Determine if this is a deload mesocycle
      const isDeload = phase.includes('deload');

      // Calculate mesocycle duration (deload mesocycles are shorter)
      const duration = isDeload ? 1 : mesocycleDuration;

      // Calculate end date
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + (duration * 7));

      // Create the mesocycle
      const mesocycle: EnhancedMesoCycle = {
        id: uuidv4(),
        name: `${capitalizeFirstLetter(phase.replace('_', ' '))} Mesocycle`,
        description: getMesocycleDescription(phase, primaryGoal),
        duration,
        microCycles: [], // Will be populated below
        phase,
        goal: primaryGoal,
        volumeProgression: getVolumeProgression(phase),
        intensityProgression: getIntensityProgression(phase),
        includesDeload: isDeload || (i + 1) % (deloadFrequency / mesocycleDuration) === 0,
        deloadStrategy: getDeloadStrategy(trainingLevel, primaryGoal),
        deloadTiming: trainingLevel === 'beginner' ? 'planned' : 'autoregulated',
        startDate: currentDate.toISOString(),
        endDate: endDate.toISOString(),
        primaryFocus: getPrimaryFocus(phase, primaryGoal),
        secondaryFocus: getSecondaryFocus(phase, primaryGoal),
        specialTechniques: getSpecialTechniques(phase, trainingLevel),
        progressionModel: getProgressionModel(phase, trainingLevel),
        adaptationMarkers: getAdaptationMarkers(phase)
      };

      // Generate microcycles for this mesocycle
      mesocycle.microCycles = generateMicroCycles(
        mesocycle.id,
        phase,
        duration,
        frequency,
        trainingLevel,
        currentDate.toISOString(),
        isDeload
      );

      // Add to mesocycles array
      mesocycles.push(mesocycle);

      // Update current date for next mesocycle
      currentDate = new Date(endDate);
    }

    return mesocycles;
  } catch (error) {
    console.error('Error in generateMesoCycles:', error);
    return [];
  }
}

/**
 * Generate microcycles for a mesocycle
 */
function generateMicroCycles(
  mesocycleId: string,
  phase: TrainingPhase,
  durationWeeks: number,
  frequency: number,
  trainingLevel: TrainingLevel,
  startDate: string,
  isDeload: boolean
): EnhancedMicroCycle[] {
  const microcycles: EnhancedMicroCycle[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < durationWeeks; i++) {
    // Calculate start and end dates for this microcycle
    const microStart = new Date(start);
    microStart.setDate(microStart.getDate() + (i * 7));
    const microEnd = new Date(microStart);
    microEnd.setDate(microEnd.getDate() + 7);

    // Determine volume and intensity based on phase and week number
    let volume = 5; // Base volume on scale 1-10
    let intensity = 5; // Base intensity on scale 1-10
    let targetRIR = 2; // Default RIR

    if (isDeload) {
      // Deload microcycle
      volume = 3;
      intensity = 3;
      targetRIR = 4;
    } else {
      // Adjust based on phase
      switch (phase) {
        case 'hypertrophy_volume':
          volume = 7 + i * 0.5; // Progressive increase
          intensity = 6;
          targetRIR = 2;
          break;
        case 'hypertrophy_intensity':
          volume = 6;
          intensity = 7 + i * 0.5; // Progressive increase
          targetRIR = 1;
          break;
        case 'strength':
          volume = 5;
          intensity = 8 + i * 0.5; // Progressive increase
          targetRIR = 1;
          break;
        case 'strength_peaking':
          volume = 4;
          intensity = 9;
          targetRIR = 0;
          break;
        case 'metabolic_phase':
          volume = 8;
          intensity = 5;
          targetRIR = 1;
          break;
        case 'foundation':
          volume = 6 + i * 0.5;
          intensity = 5;
          targetRIR = 3;
          break;
        case 'progressive_overload':
          volume = 6 + i * 0.3;
          intensity = 6 + i * 0.3;
          targetRIR = 2 - i * 0.5;
          break;
        default:
          volume = 5 + i * 0.5;
          intensity = 5 + i * 0.5;
          targetRIR = 2;
      }
    }

    // Create the microcycle
    const microcycle: EnhancedMicroCycle = {
      id: uuidv4(),
      name: `Week ${i + 1}${isDeload ? ' (Deload)' : ''}`,
      duration: 7, // 7 days
      volume: Math.min(10, Math.round(volume * 10) / 10), // Cap at 10
      intensity: Math.min(10, Math.round(intensity * 10) / 10), // Cap at 10
      frequency: isDeload ? Math.max(2, frequency - 1) : frequency, // Reduce frequency during deload
      isDeload,
      phase,
      weekNumber: i + 1,
      startDate: microStart.toISOString(),
      endDate: microEnd.toISOString(),
      targetRIR: Math.max(0, Math.round(targetRIR * 10) / 10), // Ensure non-negative
      volumeDistribution: getVolumeDistribution(phase),
      fatigueManagement: {
        expectedFatigue: isDeload ? 3 : Math.min(10, 5 + i),
        recoveryStrategies: getRecoveryStrategies(isDeload, trainingLevel),
        readinessThreshold: isDeload ? 5 : 7
      }
    };

    microcycles.push(microcycle);
  }

  return microcycles;
}

/**
 * Helper function to get volume progression type based on phase
 */
function getVolumeProgression(phase: TrainingPhase): "ascending" | "descending" | "wave" | "step" | "constant" {
  switch (phase) {
    case 'hypertrophy_volume':
    case 'foundation':
    case 'progressive_overload':
      return 'ascending';
    case 'strength_peaking':
    case 'deload':
    case 'deload_volume':
    case 'deload_intensity':
    case 'deload_frequency':
      return 'descending';
    case 'hypertrophy_intensity':
      return 'constant';
    case 'strength':
      return 'step';
    default:
      return 'wave';
  }
}

/**
 * Helper function to get intensity progression type based on phase
 */
function getIntensityProgression(phase: TrainingPhase): "ascending" | "descending" | "wave" | "step" | "constant" {
  switch (phase) {
    case 'hypertrophy_intensity':
    case 'strength':
    case 'strength_peaking':
    case 'progressive_overload':
      return 'ascending';
    case 'deload':
    case 'deload_volume':
    case 'deload_intensity':
    case 'deload_frequency':
      return 'descending';
    case 'hypertrophy_volume':
    case 'foundation':
      return 'constant';
    case 'metabolic_phase':
      return 'wave';
    default:
      return 'step';
  }
}

/**
 * Helper function to get deload strategy based on training level and goal
 */
function getDeloadStrategy(trainingLevel: TrainingLevel, goal: TrainingGoal): DeloadType {
  if (trainingLevel === 'beginner') {
    return 'volume';
  }

  switch (goal) {
    case 'strength':
      return trainingLevel === 'advanced' ? 'intensity' : 'combined';
    case 'hypertrophy':
      return 'volume';
    case 'power':
      return 'frequency';
    case 'weight_loss':
      return 'active_recovery';
    default:
      return 'volume';
  }
}

/**
 * Helper function to get primary focus based on phase and goal
 */
function getPrimaryFocus(phase: TrainingPhase, goal: TrainingGoal): string[] {
  switch (phase) {
    case 'hypertrophy_volume':
      return ['muscle growth', 'volume accumulation', 'time under tension'];
    case 'hypertrophy_intensity':
      return ['muscle growth', 'mechanical tension', 'progressive overload'];
    case 'strength':
      return ['neural efficiency', 'force production', 'strength development'];
    case 'strength_peaking':
      return ['maximal strength', 'neural drive', 'technique perfection'];
    case 'metabolic_phase':
      return ['calorie expenditure', 'metabolic stress', 'conditioning'];
    case 'foundation':
      return ['technique development', 'work capacity', 'muscle balance'];
    case 'progressive_overload':
      return ['systematic progression', 'adaptation', 'performance improvement'];
    case 'deload':
    case 'deload_volume':
    case 'deload_intensity':
    case 'deload_frequency':
      return ['recovery', 'supercompensation', 'fatigue reduction'];
    default:
      return ['general fitness', 'balanced development'];
  }
}

/**
 * Generate nutrition periodization strategy based on training goal
 */
function generateNutritionPeriodization(
  primaryGoal: TrainingGoal,
  durationMonths: number,
  trainingLevel: TrainingLevel
): {
  phases: {
    phase: 'accumulation' | 'intensification' | 'peak' | 'deload';
    calorieAdjustment: 'surplus' | 'maintenance' | 'deficit';
    proteinTarget: number;
    carbStrategy: 'high' | 'moderate' | 'low' | 'cycling';
    fatStrategy: 'high' | 'moderate' | 'low';
    duration: number;
  }[];
} {
  const phases: {
    phase: 'accumulation' | 'intensification' | 'peak' | 'deload';
    calorieAdjustment: 'surplus' | 'maintenance' | 'deficit';
    proteinTarget: number;
    carbStrategy: 'high' | 'moderate' | 'low' | 'cycling';
    fatStrategy: 'high' | 'moderate' | 'low';
    duration: number;
  }[] = [];

  // Base protein target on training level
  const baseProteinTarget = trainingLevel === 'beginner' ? 1.6 :
                           trainingLevel === 'intermediate' ? 1.8 : 2.0;

  switch (primaryGoal) {
    case 'hypertrophy':
      phases.push(
        {
          phase: 'accumulation',
          calorieAdjustment: 'surplus',
          proteinTarget: baseProteinTarget + 0.2,
          carbStrategy: 'high',
          fatStrategy: 'moderate',
          duration: Math.ceil(durationMonths * 0.6) // 60% of total duration
        },
        {
          phase: 'intensification',
          calorieAdjustment: 'surplus',
          proteinTarget: baseProteinTarget + 0.3,
          carbStrategy: 'cycling',
          fatStrategy: 'moderate',
          duration: Math.floor(durationMonths * 0.3) // 30% of total duration
        },
        {
          phase: 'deload',
          calorieAdjustment: 'maintenance',
          proteinTarget: baseProteinTarget,
          carbStrategy: 'moderate',
          fatStrategy: 'moderate',
          duration: Math.max(1, Math.floor(durationMonths * 0.1)) // 10% of total duration
        }
      );
      break;

    case 'strength':
      phases.push(
        {
          phase: 'accumulation',
          calorieAdjustment: 'surplus',
          proteinTarget: baseProteinTarget + 0.1,
          carbStrategy: 'high',
          fatStrategy: 'moderate',
          duration: Math.ceil(durationMonths * 0.4) // 40% of total duration
        },
        {
          phase: 'intensification',
          calorieAdjustment: 'maintenance',
          proteinTarget: baseProteinTarget + 0.2,
          carbStrategy: 'cycling',
          fatStrategy: 'moderate',
          duration: Math.floor(durationMonths * 0.4) // 40% of total duration
        },
        {
          phase: 'peak',
          calorieAdjustment: 'maintenance',
          proteinTarget: baseProteinTarget + 0.3,
          carbStrategy: 'cycling',
          fatStrategy: 'low',
          duration: Math.floor(durationMonths * 0.1) // 10% of total duration
        },
        {
          phase: 'deload',
          calorieAdjustment: 'maintenance',
          proteinTarget: baseProteinTarget,
          carbStrategy: 'moderate',
          fatStrategy: 'moderate',
          duration: Math.max(1, Math.floor(durationMonths * 0.1)) // 10% of total duration
        }
      );
      break;

    case 'weight_loss':
      phases.push(
        {
          phase: 'accumulation',
          calorieAdjustment: 'deficit',
          proteinTarget: baseProteinTarget + 0.4, // Higher protein during deficit
          carbStrategy: 'low',
          fatStrategy: 'moderate',
          duration: Math.ceil(durationMonths * 0.7) // 70% of total duration
        },
        {
          phase: 'intensification',
          calorieAdjustment: 'deficit',
          proteinTarget: baseProteinTarget + 0.5,
          carbStrategy: 'cycling',
          fatStrategy: 'low',
          duration: Math.floor(durationMonths * 0.2) // 20% of total duration
        },
        {
          phase: 'deload',
          calorieAdjustment: 'maintenance',
          proteinTarget: baseProteinTarget + 0.3,
          carbStrategy: 'moderate',
          fatStrategy: 'moderate',
          duration: Math.max(1, Math.floor(durationMonths * 0.1)) // 10% of total duration
        }
      );
      break;

    default:
      phases.push(
        {
          phase: 'accumulation',
          calorieAdjustment: 'maintenance',
          proteinTarget: baseProteinTarget,
          carbStrategy: 'moderate',
          fatStrategy: 'moderate',
          duration: Math.ceil(durationMonths * 0.8) // 80% of total duration
        },
        {
          phase: 'deload',
          calorieAdjustment: 'maintenance',
          proteinTarget: baseProteinTarget,
          carbStrategy: 'moderate',
          fatStrategy: 'moderate',
          duration: Math.max(1, Math.floor(durationMonths * 0.2)) // 20% of total duration
        }
      );
  }

  return { phases };
}

/**
 * Helper function to get secondary focus based on phase and goal
 */
function getSecondaryFocus(phase: TrainingPhase, goal: TrainingGoal): string[] {
  switch (phase) {
    case 'hypertrophy_volume':
      return ['strength foundation', 'metabolic conditioning', 'recovery capacity'];
    case 'hypertrophy_intensity':
      return ['strength development', 'neural efficiency', 'muscle density'];
    case 'strength':
      return ['hypertrophy maintenance', 'technique refinement', 'joint health'];
    case 'strength_peaking':
      return ['neural efficiency', 'psychological preparation', 'technique mastery'];
    case 'metabolic_phase':
      return ['muscle preservation', 'cardiovascular health', 'recovery enhancement'];
    case 'foundation':
      return ['movement patterns', 'structural balance', 'injury prevention'];
    case 'progressive_overload':
      return ['technique consistency', 'recovery optimization', 'mental focus'];
    case 'deload':
    case 'deload_volume':
    case 'deload_intensity':
    case 'deload_frequency':
      return ['technique refinement', 'mental recovery', 'injury prevention'];
    default:
      return ['balanced development', 'functional strength', 'overall fitness'];
  }
}

/**
 * Helper function to get special techniques based on phase and training level
 */
function getSpecialTechniques(phase: TrainingPhase, trainingLevel: TrainingLevel): string[] {
  // Base techniques available to all levels
  const baseTechniques = ['progressive overload', 'proper warm-up', 'controlled eccentrics'];

  // Techniques based on training level
  const levelTechniques: Record<TrainingLevel, string[]> = {
    'beginner': [],
    'intermediate': ['supersets', 'drop sets', 'tempo training'],
    'advanced': ['rest-pause', 'mechanical drop sets', 'partial reps', 'cluster sets'],
    'elite': ['intra-set stretching', 'accommodating resistance', 'pre-exhaustion', 'post-activation potentiation']
  };

  // Techniques based on phase
  const phaseTechniques: Record<string, string[]> = {
    'hypertrophy_volume': ['supersets', 'giant sets', 'time under tension', 'high-rep finishers'],
    'hypertrophy_intensity': ['drop sets', 'rest-pause', 'mechanical drop sets', 'partial reps'],
    'strength': ['cluster sets', 'wave loading', 'accommodating resistance', 'heavy negatives'],
    'strength_peaking': ['post-activation potentiation', 'contrast method', 'wave loading', 'heavy singles'],
    'metabolic_phase': ['circuit training', 'EMOM', 'AMRAP', 'tabata intervals'],
    'foundation': ['tempo training', 'paused reps', 'isometric holds', 'mind-muscle connection'],
    'progressive_overload': ['double progression', 'micro-loading', 'density training', 'volume landmarks'],
    'deload': ['light technique work', 'active recovery', 'mobility training', 'skill practice']
  };

  // Combine techniques based on level and phase
  let techniques = [...baseTechniques];

  // Add level-specific techniques
  if (trainingLevel in levelTechniques) {
    techniques = [...techniques, ...levelTechniques[trainingLevel]];
  }

  // Add phase-specific techniques
  const phaseKey = Object.keys(phaseTechniques).find(key => phase.includes(key)) || '';
  if (phaseKey && phaseKey in phaseTechniques) {
    techniques = [...techniques, ...phaseTechniques[phaseKey]];
  }

  // Limit number of techniques based on training level
  const maxTechniques = trainingLevel === 'beginner' ? 3 :
                       trainingLevel === 'intermediate' ? 5 :
                       trainingLevel === 'advanced' ? 7 : 10;

  // Remove duplicates and limit to max techniques
  return [...new Set(techniques)].slice(0, maxTechniques);
}

/**
 * Helper function to get progression model based on phase and training level
 */
function getProgressionModel(phase: TrainingPhase, trainingLevel: TrainingLevel): string {
  switch (phase) {
    case 'hypertrophy_volume':
      return trainingLevel === 'beginner' ? 'Linear progression with focus on adding reps' :
             trainingLevel === 'intermediate' ? 'Double progression (reps then weight)' :
             'Undulating periodization with volume focus';
    case 'hypertrophy_intensity':
      return trainingLevel === 'beginner' ? 'Linear progression with focus on adding weight' :
             trainingLevel === 'intermediate' ? 'Double progression (weight then reps)' :
             'Undulating periodization with intensity focus';
    case 'strength':
      return trainingLevel === 'beginner' ? 'Linear progression with fixed sets and reps' :
             trainingLevel === 'intermediate' ? 'Wave loading (3-2-1 rep scheme)' :
             'Block periodization with intensity emphasis';
    case 'strength_peaking':
      return 'Intensity-based progression with reduced volume';
    case 'metabolic_phase':
      return 'Density-based progression (more work in less time)';
    case 'foundation':
      return 'Technique-focused progression with gradual volume increase';
    case 'progressive_overload':
      return trainingLevel === 'beginner' ? 'Linear progression' :
             trainingLevel === 'intermediate' ? 'Double progression' :
             'Triple progression (reps, sets, weight)';
    case 'deload':
    case 'deload_volume':
    case 'deload_intensity':
    case 'deload_frequency':
      return 'Reduced volume and/or intensity with focus on recovery';
    default:
      return 'Balanced progression across all variables';
  }
}

/**
 * Helper function to get adaptation markers based on phase
 */
function getAdaptationMarkers(phase: TrainingPhase): string[] {
  switch (phase) {
    case 'hypertrophy_volume':
      return [
        'Increased muscle fullness',
        'Better pumps during training',
        'Improved work capacity',
        'Reduced soreness after similar volume',
        'Ability to complete more total sets'
      ];
    case 'hypertrophy_intensity':
      return [
        'Strength increases at same rep ranges',
        'Improved mind-muscle connection',
        'Better muscle density and hardness',
        'Ability to generate more tension',
        'Improved recovery between sets'
      ];
    case 'strength':
      return [
        'Increased 1-5 rep maxes',
        'Improved bar speed with submaximal weights',
        'Better technique under heavy loads',
        'Reduced perceived effort at same loads',
        'Improved neural efficiency'
      ];
    case 'strength_peaking':
      return [
        'New 1RM personal records',
        'Improved performance consistency',
        'Better psychological readiness',
        'Reduced perceived effort at near-maximal loads',
        'Improved technique under maximal loads'
      ];
    case 'metabolic_phase':
      return [
        'Improved work capacity',
        'Reduced rest times needed',
        'Better recovery between sessions',
        'Increased caloric expenditure',
        'Improved cardiovascular markers'
      ];
    case 'foundation':
      return [
        'Improved technique across exercises',
        'Better movement patterns',
        'Reduced compensatory patterns',
        'Improved mind-muscle connection',
        'Better structural balance'
      ];
    case 'progressive_overload':
      return [
        'Consistent performance improvements',
        'Better recovery between sessions',
        'Improved work capacity',
        'Strength increases across rep ranges',
        'Reduced perceived effort at same loads'
      ];
    case 'deload':
    case 'deload_volume':
    case 'deload_intensity':
    case 'deload_frequency':
      return [
        'Reduced overall fatigue',
        'Improved motivation and readiness',
        'Reduced joint pain/discomfort',
        'Improved sleep quality',
        'Mental refreshment'
      ];
    default:
      return [
        'Improved overall performance',
        'Better recovery capacity',
        'Increased work capacity',
        'Improved technique',
        'Better mind-muscle connection'
      ];
  }
}

/**
 * Helper function to get volume distribution based on phase
 */
function getVolumeDistribution(phase: TrainingPhase): Record<string, number> {
  switch (phase) {
    case 'hypertrophy_volume':
      return {
        'chest': 20,
        'back': 20,
        'legs': 25,
        'shoulders': 15,
        'arms': 15,
        'core': 5
      };
    case 'hypertrophy_intensity':
      return {
        'chest': 20,
        'back': 20,
        'legs': 20,
        'shoulders': 15,
        'arms': 20,
        'core': 5
      };
    case 'strength':
      return {
        'chest': 15,
        'back': 20,
        'legs': 30,
        'shoulders': 15,
        'arms': 10,
        'core': 10
      };
    case 'strength_peaking':
      return {
        'chest': 15,
        'back': 15,
        'legs': 40,
        'shoulders': 15,
        'arms': 5,
        'core': 10
      };
    case 'metabolic_phase':
      return {
        'chest': 15,
        'back': 15,
        'legs': 30,
        'shoulders': 10,
        'arms': 10,
        'core': 20
      };
    case 'foundation':
      return {
        'chest': 15,
        'back': 25,
        'legs': 25,
        'shoulders': 15,
        'arms': 10,
        'core': 10
      };
    default:
      return {
        'chest': 20,
        'back': 20,
        'legs': 25,
        'shoulders': 15,
        'arms': 10,
        'core': 10
      };
  }
}

/**
 * Helper function to get recovery strategies based on deload status and training level
 */
function getRecoveryStrategies(isDeload: boolean, trainingLevel: TrainingLevel): string[] {
  const baseStrategies = [
    'adequate sleep (7-9 hours)',
    'proper nutrition',
    'hydration',
    'active recovery'
  ];

  const advancedStrategies = [
    'contrast showers',
    'foam rolling',
    'massage',
    'stretching',
    'meditation',
    'stress management'
  ];

  const eliteStrategies = [
    'cold therapy',
    'compression garments',
    'targeted mobility work',
    'blood flow restriction recovery',
    'neuromuscular electrical stimulation',
    'supplementation (approved)'
  ];

  let strategies = [...baseStrategies];

  // Add strategies based on training level
  if (trainingLevel === 'intermediate' || trainingLevel === 'advanced' || trainingLevel === 'elite') {
    strategies = [...strategies, ...advancedStrategies];
  }

  if (trainingLevel === 'advanced' || trainingLevel === 'elite') {
    strategies = [...strategies, ...eliteStrategies];
  }

  // Add deload-specific strategies
  if (isDeload) {
    strategies.push(
      'reduced training volume',
      'reduced training intensity',
      'focus on technique',
      'extra sleep',
      'mental recovery'
    );
  }

  // Remove duplicates
  return [...new Set(strategies)];
}

/**
 * Helper function to capitalize first letter of a string
 */
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Helper function to get mesocycle description based on phase and goal
 */
function getMesocycleDescription(phase: TrainingPhase, goal: TrainingGoal): string {
  switch (phase) {
    case 'hypertrophy_volume':
      return `High volume training phase focused on muscle growth through accumulated training volume. Emphasizes time under tension and metabolic stress.`;
    case 'hypertrophy_intensity':
      return `Intensity-focused hypertrophy phase emphasizing mechanical tension and progressive overload for muscle growth.`;
    case 'strength':
      return `Strength development phase focusing on neural adaptations and force production capabilities.`;
    case 'strength_peaking':
      return `Peaking phase designed to maximize strength expression and prepare for testing maximal strength.`;
    case 'metabolic_phase':
      return `Metabolic conditioning phase focused on calorie expenditure, work capacity, and cardiovascular health.`;
    case 'foundation':
      return `Foundation building phase emphasizing technique development, structural balance, and work capacity.`;
    case 'progressive_overload':
      return `Systematic progression phase focused on gradually increasing training demands for continued adaptation.`;
    case 'deload':
    case 'deload_volume':
    case 'deload_intensity':
    case 'deload_frequency':
      return `Recovery-focused phase with reduced training demands to allow for supercompensation and fatigue dissipation.`;
    default:
      return `Balanced training phase addressing multiple fitness components with a primary focus on ${goal}.`;
  }
}
