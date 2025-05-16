/**
 * Periodization Service
 * Implements advanced periodization concepts from Spanish fitness resources
 * for long-term training planning and progression.
 *
 * Based on principles from:
 * - Planificación de entrenamiento HsP
 * - Aesthetic Strength INTERMEDIOS
 * - Grande y Fuerte PBO Team Trinidad
 * - Progresa Con ENFAF
 * - Mesociclo Hazlo tú mismo BASQUELIFTS
 * - SKY IS THE LIMIT PLANIFICACION BANCA
 * - Técnicas Avanzadas
 */

import { supabase } from '@/lib/supabase-client';
import {
  PeriodizationPlan,
  TrainingCycle,
  PeriodizationType,
  TrainingPhase,
  TrainingLevel,
  TrainingGoal,
  CycleType,
  DeloadWeek,
  DeloadType,
  DeloadTiming,
  FatigueTracking,
  AdvancedTechnique,
  TechniqueCategory,
  CommunityChallenge,
  ChallengeType
} from '@/lib/types/periodization';
import { v4 as uuidv4 } from 'uuid';
import { getUserFatigue, updateFatigueAfterWorkout } from '@/lib/adaptive-learning-service';

// Periodization configurations based on Spanish fitness resources
export const PERIODIZATION_CONFIGS: Record<TrainingLevel, Record<TrainingGoal, {
  recommendedType: PeriodizationType,
  mesoCycleDuration: number, // In weeks
  deloadFrequency: number, // Every X weeks
  volumeRange: [number, number], // [min, max] in sets per muscle group per week
  intensityRange: [number, number], // [min, max] in % of 1RM or RPE
  frequencyRange: [number, number], // [min, max] in days per week
  phasesSequence: TrainingPhase[],
  // New fields from Spanish resources
  rirRange?: [number, number], // [min, max] RIR (Reps In Reserve)
  rpeRange?: [number, number], // [min, max] RPE (Rate of Perceived Exertion)
  tempoRecommendations?: Record<TrainingPhase, string>, // Recommended tempo for each phase
  restRecommendations?: Record<TrainingPhase, [number, number]>, // [min, max] rest in seconds
  exerciseRotation?: 'fixed' | 'rotating' | 'undulating', // Exercise selection strategy
  specialTechniques?: string[], // Advanced techniques to incorporate
  autoRegulationStrategy?: 'fatigue_based' | 'performance_based' | 'readiness_based' | 'none',
  progressionModel?: 'double' | 'triple' | 'wave' | 'step' | 'linear',
  nutritionStrategy?: {
    calorieAdjustment: 'surplus' | 'maintenance' | 'deficit',
    proteinTarget: number, // g/kg of bodyweight
    carbStrategy: 'cycling' | 'constant' | 'periodized'
  },
  recommendedDeloadType?: DeloadType,
  fatigueManagementThreshold?: number // Fatigue score that triggers intervention
}>> = {
  beginner: {
    strength: {
      recommendedType: 'linear',
      mesoCycleDuration: 8,
      deloadFrequency: 8,
      volumeRange: [10, 15],
      intensityRange: [70, 85],
      frequencyRange: [3, 4],
      phasesSequence: ['anatomical_adaptation', 'hypertrophy', 'strength', 'deload']
    },
    hypertrophy: {
      recommendedType: 'linear',
      mesoCycleDuration: 8,
      deloadFrequency: 8,
      volumeRange: [10, 20],
      intensityRange: [65, 80],
      frequencyRange: [3, 5],
      phasesSequence: ['anatomical_adaptation', 'hypertrophy', 'hypertrophy', 'deload']
    },
    endurance: {
      recommendedType: 'linear',
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [15, 25],
      intensityRange: [50, 70],
      frequencyRange: [3, 5],
      phasesSequence: ['anatomical_adaptation', 'endurance', 'endurance', 'deload']
    },
    power: {
      recommendedType: 'linear',
      mesoCycleDuration: 8,
      deloadFrequency: 8,
      volumeRange: [8, 12],
      intensityRange: [70, 90],
      frequencyRange: [3, 4],
      phasesSequence: ['anatomical_adaptation', 'strength', 'power', 'deload']
    },
    weight_loss: {
      recommendedType: 'concurrent',
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [12, 20],
      intensityRange: [60, 75],
      frequencyRange: [3, 5],
      phasesSequence: ['anatomical_adaptation', 'hypertrophy', 'endurance', 'deload']
    },
    body_recomposition: {
      recommendedType: 'concurrent',
      mesoCycleDuration: 8,
      deloadFrequency: 8,
      volumeRange: [12, 18],
      intensityRange: [65, 80],
      frequencyRange: [3, 5],
      phasesSequence: ['anatomical_adaptation', 'hypertrophy', 'strength', 'deload']
    },
    general_fitness: {
      recommendedType: 'concurrent',
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [10, 15],
      intensityRange: [60, 75],
      frequencyRange: [3, 4],
      phasesSequence: ['anatomical_adaptation', 'hypertrophy', 'endurance', 'deload']
    },
    sport_specific: {
      recommendedType: 'block',
      mesoCycleDuration: 8,
      deloadFrequency: 8,
      volumeRange: [8, 15],
      intensityRange: [65, 85],
      frequencyRange: [3, 5],
      phasesSequence: ['anatomical_adaptation', 'hypertrophy', 'strength', 'power', 'deload']
    }
  },
  intermediate: {
    strength: {
      recommendedType: 'block',
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [12, 18],
      intensityRange: [75, 90],
      frequencyRange: [4, 5],
      phasesSequence: ['hypertrophy', 'strength', 'strength', 'power', 'deload']
    },
    hypertrophy: {
      recommendedType: 'undulating',
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [14, 22],
      intensityRange: [65, 85],
      frequencyRange: [4, 6],
      phasesSequence: ['hypertrophy', 'hypertrophy', 'strength', 'hypertrophy', 'deload']
    },
    endurance: {
      recommendedType: 'concurrent',
      mesoCycleDuration: 5,
      deloadFrequency: 5,
      volumeRange: [18, 30],
      intensityRange: [55, 75],
      frequencyRange: [4, 6],
      phasesSequence: ['hypertrophy', 'endurance', 'endurance', 'deload']
    },
    power: {
      recommendedType: 'conjugate',
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [10, 16],
      intensityRange: [70, 95],
      frequencyRange: [4, 5],
      phasesSequence: ['strength', 'power', 'power', 'deload']
    },
    weight_loss: {
      recommendedType: 'undulating',
      mesoCycleDuration: 5,
      deloadFrequency: 5,
      volumeRange: [15, 25],
      intensityRange: [65, 80],
      frequencyRange: [4, 6],
      phasesSequence: ['hypertrophy', 'endurance', 'hypertrophy', 'endurance', 'deload']
    },
    body_recomposition: {
      recommendedType: 'undulating',
      mesoCycleDuration: 6,
      deloadFrequency: 6,
      volumeRange: [12, 20],
      intensityRange: [70, 85],
      frequencyRange: [4, 5],
      phasesSequence: ['hypertrophy', 'strength', 'hypertrophy', 'strength', 'deload']
    },
    general_fitness: {
      recommendedType: 'concurrent',
      mesoCycleDuration: 5,
      deloadFrequency: 5,
      volumeRange: [12, 18],
      intensityRange: [65, 80],
      frequencyRange: [4, 5],
      phasesSequence: ['hypertrophy', 'endurance', 'strength', 'deload']
    },
    sport_specific: {
      recommendedType: 'block',
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [10, 18],
      intensityRange: [70, 90],
      frequencyRange: [3, 5],
      phasesSequence: ['hypertrophy', 'strength', 'power', 'deload']
    }
  },
  advanced: {
    strength: {
      recommendedType: 'conjugate',
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [12, 20],
      intensityRange: [75, 95],
      frequencyRange: [4, 6],
      phasesSequence: ['hypertrophy', 'strength', 'power', 'deload'],
      // New fields from Spanish resources
      rirRange: [0, 2],
      rpeRange: [8, 10],
      tempoRecommendations: {
        hypertrophy: '3-0-1-0', // 3s eccentric, 0s bottom, 1s concentric, 0s top
        strength: '2-1-X-0', // 2s eccentric, 1s bottom, explosive concentric, 0s top
        power: '1-0-X-0', // 1s eccentric, 0s bottom, explosive concentric, 0s top
        deload: '2-0-2-0' // Controlled tempo during deload
      },
      restRecommendations: {
        hypertrophy: [90, 180],
        strength: [180, 300],
        power: [180, 300],
        deload: [120, 180]
      },
      exerciseRotation: 'rotating',
      specialTechniques: ['cluster_sets', 'accommodating_resistance', 'wave_loading', 'contrast_method'],
      autoRegulationStrategy: 'performance_based',
      progressionModel: 'wave',
      nutritionStrategy: {
        calorieAdjustment: 'surplus',
        proteinTarget: 2.2, // g/kg of bodyweight
        carbStrategy: 'cycling'
      },
      recommendedDeloadType: 'intensity',
      fatigueManagementThreshold: 7.5
    },
    hypertrophy: {
      recommendedType: 'undulating',
      mesoCycleDuration: 5,
      deloadFrequency: 5,
      volumeRange: [16, 25],
      intensityRange: [65, 85],
      frequencyRange: [5, 6],
      phasesSequence: ['hypertrophy', 'strength', 'hypertrophy', 'metabolic', 'deload'],
      // New fields from Spanish resources
      rirRange: [1, 3],
      rpeRange: [7, 9],
      tempoRecommendations: {
        hypertrophy: '3-1-2-0', // 3s eccentric, 1s bottom, 2s concentric, 0s top
        strength: '2-0-1-0', // 2s eccentric, 0s bottom, 1s concentric, 0s top
        metabolic: '2-0-2-0', // 2s eccentric, 0s bottom, 2s concentric, 0s top
        deload: '2-0-2-0' // Controlled tempo during deload
      },
      restRecommendations: {
        hypertrophy: [60, 120],
        strength: [120, 180],
        metabolic: [30, 60],
        deload: [90, 120]
      },
      exerciseRotation: 'undulating',
      specialTechniques: ['drop_sets', 'mechanical_drop_sets', 'pre_exhaustion', 'myo_reps', 'giant_sets'],
      autoRegulationStrategy: 'fatigue_based',
      progressionModel: 'double',
      nutritionStrategy: {
        calorieAdjustment: 'surplus',
        proteinTarget: 2.0, // g/kg of bodyweight
        carbStrategy: 'periodized'
      },
      recommendedDeloadType: 'volume',
      fatigueManagementThreshold: 8.0
    },
    endurance: {
      recommendedType: 'block',
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [20, 35],
      intensityRange: [60, 80],
      frequencyRange: [5, 7],
      phasesSequence: ['hypertrophy', 'endurance', 'endurance', 'deload']
    },
    power: {
      recommendedType: 'block',
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [8, 16],
      intensityRange: [80, 97],
      frequencyRange: [4, 6],
      phasesSequence: ['strength', 'power', 'peaking', 'deload']
    },
    weight_loss: {
      recommendedType: 'undulating',
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [18, 30],
      intensityRange: [70, 85],
      frequencyRange: [5, 6],
      phasesSequence: ['hypertrophy', 'metabolic', 'endurance', 'deload']
    },
    body_recomposition: {
      recommendedType: 'undulating',
      mesoCycleDuration: 5,
      deloadFrequency: 5,
      volumeRange: [15, 25],
      intensityRange: [70, 90],
      frequencyRange: [5, 6],
      phasesSequence: ['hypertrophy', 'strength', 'metabolic', 'hypertrophy', 'deload']
    },
    general_fitness: {
      recommendedType: 'concurrent',
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [14, 22],
      intensityRange: [65, 85],
      frequencyRange: [4, 6],
      phasesSequence: ['hypertrophy', 'endurance', 'strength', 'deload']
    },
    sport_specific: {
      recommendedType: 'conjugate',
      mesoCycleDuration: 3,
      deloadFrequency: 3,
      volumeRange: [10, 20],
      intensityRange: [75, 95],
      frequencyRange: [4, 6],
      phasesSequence: ['strength', 'power', 'deload']
    }
  },
  elite: {
    strength: {
      recommendedType: 'conjugate',
      mesoCycleDuration: 3,
      deloadFrequency: 3,
      volumeRange: [15, 25],
      intensityRange: [80, 100],
      frequencyRange: [5, 7],
      phasesSequence: ['hypertrophy', 'strength', 'deload']
    },
    hypertrophy: {
      recommendedType: 'undulating',
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [18, 30],
      intensityRange: [70, 90],
      frequencyRange: [5, 7],
      phasesSequence: ['hypertrophy', 'metabolic', 'hypertrophy', 'deload']
    },
    endurance: {
      recommendedType: 'block',
      mesoCycleDuration: 3,
      deloadFrequency: 3,
      volumeRange: [25, 40],
      intensityRange: [65, 85],
      frequencyRange: [6, 7],
      phasesSequence: ['endurance', 'endurance', 'deload']
    },
    power: {
      recommendedType: 'block',
      mesoCycleDuration: 3,
      deloadFrequency: 3,
      volumeRange: [10, 18],
      intensityRange: [85, 100],
      frequencyRange: [5, 6],
      phasesSequence: ['strength', 'power', 'deload']
    },
    weight_loss: {
      recommendedType: 'undulating',
      mesoCycleDuration: 3,
      deloadFrequency: 3,
      volumeRange: [20, 35],
      intensityRange: [75, 90],
      frequencyRange: [6, 7],
      phasesSequence: ['metabolic', 'endurance', 'deload']
    },
    body_recomposition: {
      recommendedType: 'undulating',
      mesoCycleDuration: 4,
      deloadFrequency: 4,
      volumeRange: [18, 28],
      intensityRange: [75, 95],
      frequencyRange: [5, 7],
      phasesSequence: ['hypertrophy', 'strength', 'metabolic', 'deload']
    },
    general_fitness: {
      recommendedType: 'concurrent',
      mesoCycleDuration: 3,
      deloadFrequency: 3,
      volumeRange: [15, 25],
      intensityRange: [70, 90],
      frequencyRange: [5, 6],
      phasesSequence: ['hypertrophy', 'endurance', 'deload']
    },
    sport_specific: {
      recommendedType: 'conjugate',
      mesoCycleDuration: 2,
      deloadFrequency: 2,
      volumeRange: [12, 22],
      intensityRange: [80, 100],
      frequencyRange: [5, 7],
      phasesSequence: ['power', 'deload']
    }
  }
};

/**
 * Create a new periodization plan with advanced concepts from Spanish fitness resources
 * @param userId - User ID
 * @param level - Training level
 * @param goal - Training goal
 * @param frequency - Training frequency (days per week)
 * @param name - Plan name
 * @param description - Plan description
 * @param initialAssessment - Optional initial assessment data
 * @returns Promise with the created plan or null on error
 */
export async function createPeriodizationPlan(
  userId: string,
  level: TrainingLevel,
  goal: TrainingGoal,
  frequency: number,
  name: string,
  description?: string,
  initialAssessment?: {
    strengthBaseline?: Record<string, number>;
    bodyComposition?: {
      weight: number;
      bodyFat?: number;
    };
  }
): Promise<PeriodizationPlan | null> {
  try {
    // Get recommended periodization type for this level and goal
    const config = PERIODIZATION_CONFIGS[level][goal];
    const type = config.recommendedType;

    // Prepare advanced configuration data from Spanish resources
    const progressionModel = {
      volumeProgressionRate: level === 'beginner' ? 5 : level === 'intermediate' ? 3 : 2, // % increase per cycle
      intensityProgressionRate: level === 'beginner' ? 2.5 : level === 'intermediate' ? 1.5 : 1, // % increase per cycle
      deloadStrategy: config.recommendedDeloadType || 'volume',
      autoRegulated: config.autoRegulationStrategy !== 'none',
      fatigueManagementThreshold: config.fatigueManagementThreshold || 7.0
    };

    // Special techniques based on level and goal
    const specialTechniques = config.specialTechniques ||
      (level === 'beginner' ? [] :
        level === 'intermediate' ? ['drop_sets', 'super_sets'] :
          ['drop_sets', 'super_sets', 'rest_pause', 'mechanical_drop_sets']);

    // Nutrition strategy
    const nutritionStrategy = config.nutritionStrategy || {
      calorieAdjustment: goal === 'weight_loss' ? 'deficit' :
                         goal === 'hypertrophy' ? 'surplus' : 'maintenance',
      proteinTarget: level === 'beginner' ? 1.6 : level === 'intermediate' ? 1.8 : 2.0,
      carbStrategy: 'constant'
    };

    // Create plan with advanced fields
    const { data, error } = await supabase
      .from('periodization_plans')
      .insert([{
        user_id: userId,
        name,
        description,
        type,
        level,
        goal,
        frequency,
        is_active: true,
        start_date: new Date().toISOString(),
        end_date: null,
        // Advanced fields from Spanish resources
        initial_assessment: initialAssessment || null,
        progression_model: progressionModel,
        special_techniques: specialTechniques,
        nutrition_strategy: nutritionStrategy,
        exercise_rotation: config.exerciseRotation || 'fixed',
        auto_regulation_strategy: config.autoRegulationStrategy || 'none'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating periodization plan:', error);
      return null;
    }

    // Convert to TypeScript interface with advanced fields
    const plan: PeriodizationPlan = {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      type: data.type,
      level: data.level,
      goal: data.goal,
      frequency: data.frequency,
      isActive: data.is_active,
      startDate: data.start_date,
      endDate: data.end_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      // Advanced fields from Spanish resources
      initialAssessment: data.initial_assessment,
      progressionModel: data.progression_model,
      specialTechniques: data.special_techniques,
      nutritionStrategy: data.nutrition_strategy
    };

    return plan;
  } catch (error) {
    console.error('Error creating periodization plan:', error);
    return null;
  }
}

/**
 * Generate training cycles for a periodization plan with advanced concepts from Spanish fitness resources
 * @param planId - Plan ID
 * @param level - Training level
 * @param goal - Training goal
 * @param startDate - Start date
 * @param duration - Duration in weeks
 * @param userId - User ID for fatigue tracking
 * @returns Promise with the created cycles or null on error
 */
export async function generateTrainingCycles(
  planId: string,
  level: TrainingLevel,
  goal: TrainingGoal,
  startDate: string,
  duration: number,
  userId?: string
): Promise<TrainingCycle[] | null> {
  try {
    const config = PERIODIZATION_CONFIGS[level][goal];
    const phasesSequence = config.phasesSequence;
    const mesoCycleDuration = config.mesoCycleDuration;
    const deloadFrequency = config.deloadFrequency;
    const volumeRange = config.volumeRange;
    const intensityRange = config.intensityRange;
    const frequencyRange = config.frequencyRange;

    // Advanced parameters from Spanish resources
    const rirRange = config.rirRange || [1, 3];
    const rpeRange = config.rpeRange || [7, 9];
    const tempoRecommendations = config.tempoRecommendations;
    const restRecommendations = config.restRecommendations;
    const exerciseRotation = config.exerciseRotation || 'fixed';
    const specialTechniques = config.specialTechniques || [];
    const autoRegulationStrategy = config.autoRegulationStrategy || 'none';
    const deloadType = config.recommendedDeloadType || 'volume';

    // Get user fatigue if available
    let userFatigue = null;
    if (userId) {
      userFatigue = await getUserFatigue(userId);
    }

    // Calculate number of mesocycles
    const numberOfMesocycles = Math.ceil(duration / mesoCycleDuration);

    // Create cycles
    const cycles: Omit<TrainingCycle, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < numberOfMesocycles; i++) {
      // Determine phases for this mesocycle
      const phasesForThisMesocycle = phasesSequence.slice(0, mesoCycleDuration);

      // Create microcycles (weeks)
      for (let week = 0; week < mesoCycleDuration && (i * mesoCycleDuration + week) < duration; week++) {
        const weekNumber = i * mesoCycleDuration + week + 1;

        // Determine if this is a deload week based on fixed schedule or fatigue
        let isDeloadWeek = weekNumber % deloadFrequency === 0;

        // If using auto-regulation and user fatigue is available, check if we need an early deload
        if (autoRegulationStrategy === 'fatigue_based' && userFatigue && !isDeloadWeek) {
          const fatigueThreshold = config.fatigueManagementThreshold || 7.0;
          if (userFatigue.currentFatigue > fatigueThreshold * 10) { // Convert to 0-100 scale
            isDeloadWeek = true;
            console.log(`Auto-regulated deload triggered due to high fatigue (${userFatigue.currentFatigue})`);
          }
        }

        const phase = isDeloadWeek ? 'deload' : phasesForThisMesocycle[week % phasesForThisMesocycle.length];

        // Calculate volume and intensity based on phase and progression
        let volume, intensity, rir, rpe;

        if (phase === 'deload') {
          // Different deload strategies based on Spanish resources
          if (deloadType === 'volume') {
            volume = volumeRange[0] * 0.5; // 50% of minimum volume
            intensity = intensityRange[0] + (intensityRange[1] - intensityRange[0]) * 0.7; // 70% of intensity range
            rir = rirRange[1] + 1; // Higher RIR (easier)
            rpe = rpeRange[0] - 1; // Lower RPE (easier)
          } else if (deloadType === 'intensity') {
            volume = volumeRange[0] * 0.7; // 70% of minimum volume
            intensity = intensityRange[0] * 0.8; // 80% of minimum intensity
            rir = rirRange[1] + 2; // Much higher RIR (easier)
            rpe = rpeRange[0] - 2; // Much lower RPE (easier)
          } else if (deloadType === 'frequency') {
            volume = volumeRange[0] * 0.7; // 70% of minimum volume
            intensity = intensityRange[0] + (intensityRange[1] - intensityRange[0]) * 0.5; // 50% of intensity range
            rir = rirRange[1]; // Normal RIR
            rpe = rpeRange[0]; // Normal RPE
          } else { // combined
            volume = volumeRange[0] * 0.6; // 60% of minimum volume
            intensity = intensityRange[0] * 0.8; // 80% of minimum intensity
            rir = rirRange[1] + 1; // Higher RIR (easier)
            rpe = rpeRange[0] - 1; // Lower RPE (easier)
          }
        } else if (phase === 'anatomical_adaptation') {
          volume = volumeRange[0] + (volumeRange[1] - volumeRange[0]) * 0.3;
          intensity = intensityRange[0];
          rir = rirRange[1]; // Higher RIR (easier)
          rpe = rpeRange[0]; // Lower RPE (easier)
        } else if (phase === 'hypertrophy') {
          volume = volumeRange[1];
          intensity = intensityRange[0] + (intensityRange[1] - intensityRange[0]) * 0.4;
          rir = rirRange[0] + (rirRange[1] - rirRange[0]) * 0.3; // Moderate RIR
          rpe = rpeRange[0] + (rpeRange[1] - rpeRange[0]) * 0.7; // Moderate-high RPE
        } else if (phase === 'strength') {
          volume = volumeRange[0] + (volumeRange[1] - volumeRange[0]) * 0.6;
          intensity = intensityRange[0] + (intensityRange[1] - intensityRange[0]) * 0.7;
          rir = rirRange[0] + (rirRange[1] - rirRange[0]) * 0.2; // Lower RIR (harder)
          rpe = rpeRange[0] + (rpeRange[1] - rpeRange[0]) * 0.8; // Higher RPE (harder)
        } else if (phase === 'power') {
          volume = volumeRange[0];
          intensity = intensityRange[1];
          rir = rirRange[0]; // Lowest RIR (hardest)
          rpe = rpeRange[1]; // Highest RPE (hardest)
        } else if (phase === 'endurance') {
          volume = volumeRange[1];
          intensity = intensityRange[0];
          rir = rirRange[1]; // Higher RIR (easier)
          rpe = rpeRange[0]; // Lower RPE (easier)
        } else if (phase === 'metabolic') {
          volume = volumeRange[1];
          intensity = intensityRange[0] + (intensityRange[1] - intensityRange[0]) * 0.3;
          rir = rirRange[0] + (rirRange[1] - rirRange[0]) * 0.3; // Moderate RIR
          rpe = rpeRange[0] + (rpeRange[1] - rpeRange[0]) * 0.7; // Moderate-high RPE
        } else if (phase === 'accumulation') {
          volume = volumeRange[1];
          intensity = intensityRange[0] + (intensityRange[1] - intensityRange[0]) * 0.3;
          rir = rirRange[0] + (rirRange[1] - rirRange[0]) * 0.5; // Moderate RIR
          rpe = rpeRange[0] + (rpeRange[1] - rpeRange[0]) * 0.5; // Moderate RPE
        } else if (phase === 'intensification') {
          volume = volumeRange[0] + (volumeRange[1] - volumeRange[0]) * 0.7;
          intensity = intensityRange[0] + (intensityRange[1] - intensityRange[0]) * 0.6;
          rir = rirRange[0] + (rirRange[1] - rirRange[0]) * 0.3; // Lower RIR (harder)
          rpe = rpeRange[0] + (rpeRange[1] - rpeRange[0]) * 0.7; // Higher RPE (harder)
        } else if (phase === 'realization') {
          volume = volumeRange[0] + (volumeRange[1] - volumeRange[0]) * 0.4;
          intensity = intensityRange[1];
          rir = rirRange[0]; // Lowest RIR (hardest)
          rpe = rpeRange[1]; // Highest RPE (hardest)
        } else {
          volume = volumeRange[0] + (volumeRange[1] - volumeRange[0]) * 0.5;
          intensity = intensityRange[0] + (intensityRange[1] - intensityRange[0]) * 0.5;
          rir = rirRange[0] + (rirRange[1] - rirRange[0]) * 0.5; // Middle RIR
          rpe = rpeRange[0] + (rpeRange[1] - rpeRange[0]) * 0.5; // Middle RPE
        }

        // Calculate dates
        const weekStartDate = new Date(currentDate);
        const weekEndDate = new Date(currentDate);
        weekEndDate.setDate(weekEndDate.getDate() + 6);

        // Get tempo and rest guidelines for this phase
        const tempo = tempoRecommendations ? tempoRecommendations[phase] || '2-0-2-0' : '2-0-2-0';
        const restGuidelines = restRecommendations ? restRecommendations[phase] || [60, 120] : [60, 120];

        // Determine techniques to emphasize based on phase
        const techniqueEmphasis = getRecommendedTechniquesForPhase(phase, specialTechniques, level);

        // Create cycle with advanced fields from Spanish resources
        cycles.push({
          planId,
          name: `Semana ${weekNumber} - ${phase.charAt(0).toUpperCase() + phase.slice(1).replace('_', ' ')}`,
          description: `Semana ${weekNumber} del plan de entrenamiento. Fase: ${phase.replace('_', ' ')}`,
          cycleType: 'microcycle',
          phase,
          startDate: weekStartDate.toISOString(),
          endDate: weekEndDate.toISOString(),
          duration: 7, // 7 days
          volume: Math.round(volume),
          intensity: Math.round(intensity),
          frequency: isDeloadWeek ?
            Math.max(frequencyRange[0] - 1, 2) : // Reduce frequency during deload
            Math.round(frequencyRange[0] + (frequencyRange[1] - frequencyRange[0]) * 0.5),
          isDeload: isDeloadWeek,
          weekNumber,
          notes: isDeloadWeek ?
            'Semana de descarga. Reduce el volumen y/o intensidad para permitir la recuperación.' :
            `Fase de ${phase.replace('_', ' ')}. Enfócate en ${getPhaseObjective(phase)}.`,
          // Advanced fields from Spanish resources
          rirRange: [Math.max(0, Math.floor(rir - 1)), Math.ceil(rir + 1)],
          rpeRange: [Math.max(1, Math.floor(rpe - 1)), Math.min(10, Math.ceil(rpe + 1))],
          tempoGuidelines: tempo,
          restGuidelines: {
            compound: restGuidelines,
            isolation: [Math.max(30, restGuidelines[0] - 30), restGuidelines[1] - 30]
          },
          techniqueEmphasis,
          exerciseRotation,
          progressionStrategy: getProgressionStrategyForPhase(phase, config.progressionModel || 'linear'),
          deloadStrategy: isDeloadWeek ? deloadType : undefined,
          adaptationMarkers: getAdaptationMarkersForPhase(phase),
          primaryFocus: getPrimaryFocusForPhase(phase, goal),
          secondaryFocus: getSecondaryFocusForPhase(phase, goal)
        });

        // Move to next week
        currentDate.setDate(currentDate.getDate() + 7);
      }
    }

    // Insert cycles into database
    const { data, error } = await supabase
      .from('training_cycles')
      .insert(cycles.map(cycle => ({
        plan_id: cycle.planId,
        name: cycle.name,
        description: cycle.description,
        cycle_type: cycle.cycleType,
        phase: cycle.phase,
        start_date: cycle.startDate,
        end_date: cycle.endDate,
        duration: cycle.duration,
        volume: cycle.volume,
        intensity: cycle.intensity,
        frequency: cycle.frequency,
        is_deload: cycle.isDeload,
        week_number: cycle.weekNumber,
        notes: cycle.notes
      })))
      .select();

    if (error) {
      console.error('Error creating training cycles:', error);
      return null;
    }

    // Convert to TypeScript interface
    return data.map((cycle: any) => ({
      id: cycle.id,
      planId: cycle.plan_id,
      name: cycle.name,
      description: cycle.description,
      cycleType: cycle.cycle_type,
      phase: cycle.phase,
      startDate: cycle.start_date,
      endDate: cycle.end_date,
      duration: cycle.duration,
      volume: cycle.volume,
      intensity: cycle.intensity,
      frequency: cycle.frequency,
      isDeload: cycle.is_deload,
      weekNumber: cycle.week_number,
      notes: cycle.notes,
      createdAt: cycle.created_at,
      updatedAt: cycle.updated_at
    }));
  } catch (error) {
    console.error('Error generating training cycles:', error);
    return null;
  }
}

/**
 * Get phase objective description
 * @param phase - Training phase
 * @returns Phase objective description
 */
function getPhaseObjective(phase: TrainingPhase): string {
  switch (phase) {
    case 'anatomical_adaptation':
      return 'preparar el cuerpo para el entrenamiento intenso, desarrollando una base de fuerza y resistencia';
    case 'hypertrophy':
      return 'aumentar el tamaño muscular con volumen moderado-alto e intensidad moderada';
    case 'strength':
      return 'desarrollar fuerza máxima con intensidad alta y volumen moderado';
    case 'power':
      return 'desarrollar potencia y velocidad con intensidad muy alta y volumen bajo';
    case 'endurance':
      return 'mejorar la resistencia muscular con volumen alto e intensidad moderada-baja';
    case 'metabolic':
      return 'maximizar el gasto calórico y el estrés metabólico con descansos cortos y alta densidad de entrenamiento';
    case 'peaking':
      return 'maximizar el rendimiento para un evento específico con intensidad muy alta y volumen bajo';
    case 'maintenance':
      return 'mantener las ganancias con volumen e intensidad moderados';
    case 'deload':
      return 'recuperación y regeneración con volumen e intensidad reducidos';
    case 'recovery':
      return 'recuperación completa con actividad mínima';
    case 'accumulation':
      return 'acumular volumen de entrenamiento para crear estímulo de crecimiento';
    case 'intensification':
      return 'incrementar la intensidad del entrenamiento para maximizar adaptaciones';
    case 'realization':
      return 'realizar el potencial de fuerza y rendimiento acumulado en fases previas';
    case 'volume_phase':
      return 'enfocarse en alto volumen de entrenamiento para estimular hipertrofia';
    case 'intensity_phase':
      return 'enfocarse en alta intensidad de entrenamiento para estimular fuerza';
    case 'technique_phase':
      return 'perfeccionar la técnica de los ejercicios para mejorar eficiencia';
    case 'metabolic_phase':
      return 'mejorar el acondicionamiento metabólico y la quema calórica';
    case 'specialization_phase':
      return 'especialización en grupos musculares específicos para desarrollo focalizado';
    default:
      return 'seguir el plan de entrenamiento';
  }
}

/**
 * Get recommended techniques for a specific training phase
 * Based on Spanish fitness resources
 */
function getRecommendedTechniquesForPhase(
  phase: TrainingPhase,
  availableTechniques: string[],
  level: TrainingLevel
): string[] {
  // Base techniques that are appropriate for each phase
  const phaseTechniques: Record<TrainingPhase, string[]> = {
    'anatomical_adaptation': ['tempo_training', 'isometrics'],
    'hypertrophy': ['drop_sets', 'super_sets', 'giant_sets', 'myo_reps', 'mechanical_drop_sets', 'pre_exhaustion', 'partial_reps'],
    'strength': ['cluster_sets', 'rest_pause', 'accommodating_resistance', 'wave_loading', 'heavy_negatives'],
    'power': ['contrast_method', 'complex_training', 'accommodating_resistance', 'plyometrics'],
    'peaking': ['heavy_singles', 'wave_loading', 'cluster_sets'],
    'maintenance': ['auto_regulation', 'undulating_periodization'],
    'deload': ['light_technique', 'active_recovery'],
    'recovery': ['mobility_work', 'active_recovery'],
    'accumulation': ['german_volume_training', 'high_rep_sets', 'time_under_tension'],
    'intensification': ['cluster_sets', 'wave_loading', 'heavy_negatives'],
    'realization': ['heavy_singles', 'contrast_method', 'peaking_techniques'],
    'volume_phase': ['high_volume_techniques', 'super_sets', 'giant_sets'],
    'intensity_phase': ['intensity_techniques', 'rest_pause', 'cluster_sets'],
    'technique_phase': ['tempo_training', 'paused_reps', 'controlled_eccentrics'],
    'metabolic_phase': ['circuit_training', 'emom', 'amrap', 'tabata'],
    'specialization_phase': ['pre_exhaustion', 'post_exhaustion', 'mechanical_advantage_drop_sets'],
    'endurance': ['circuit_training', 'amrap', 'emom', 'high_rep_sets'],
    'metabolic': ['drop_sets', 'super_sets', 'giant_sets', 'tabata']
  };

  // Get base techniques for this phase
  const baseTechniques = phaseTechniques[phase] || [];

  // Filter based on available techniques
  let recommendedTechniques = baseTechniques.filter(technique =>
    availableTechniques.length === 0 || availableTechniques.includes(technique)
  );

  // Limit number of techniques based on level
  const maxTechniques = level === 'beginner' ? 1 :
                        level === 'intermediate' ? 2 :
                        level === 'advanced' ? 3 : 4;

  // If we have too many techniques, prioritize
  if (recommendedTechniques.length > maxTechniques) {
    recommendedTechniques = recommendedTechniques.slice(0, maxTechniques);
  }

  return recommendedTechniques;
}

/**
 * Get progression strategy for a specific training phase
 * Based on Spanish fitness resources
 */
function getProgressionStrategyForPhase(phase: TrainingPhase, baseModel: string): string {
  switch (phase) {
    case 'anatomical_adaptation':
      return 'Progresión técnica y adaptación neuromuscular';
    case 'hypertrophy':
      return baseModel === 'double' ? 'Doble progresión: aumentar repeticiones, luego peso' :
             baseModel === 'triple' ? 'Triple progresión: aumentar repeticiones, luego series, luego peso' :
             'Progresión lineal de volumen';
    case 'strength':
      return baseModel === 'wave' ? 'Carga ondulatoria: alternar días pesados y ligeros' :
             baseModel === 'step' ? 'Carga escalonada: incrementos pequeños y consistentes' :
             'Progresión de intensidad con volumen controlado';
    case 'power':
      return 'Progresión de velocidad de ejecución y carga';
    case 'deload':
      return 'Reducción estratégica para facilitar recuperación';
    case 'accumulation':
      return 'Incremento progresivo de volumen total';
    case 'intensification':
      return 'Incremento progresivo de intensidad';
    case 'metabolic':
      return 'Reducción de descansos y aumento de densidad';
    default:
      return 'Progresión equilibrada de volumen e intensidad';
  }
}

/**
 * Get adaptation markers for a specific training phase
 * Based on Spanish fitness resources
 */
function getAdaptationMarkersForPhase(phase: TrainingPhase): string[] {
  switch (phase) {
    case 'anatomical_adaptation':
      return ['Mejora en la técnica', 'Reducción de dolor muscular', 'Mayor coordinación'];
    case 'hypertrophy':
      return ['Aumento de volumen muscular', 'Mejor bomba muscular', 'Capacidad para completar más volumen'];
    case 'strength':
      return ['Aumento en cargas máximas', 'Mejor eficiencia neuromuscular', 'Menor fatiga con cargas submáximas'];
    case 'power':
      return ['Mayor velocidad de ejecución', 'Mejor potencia explosiva', 'Menor tiempo de contacto'];
    case 'deload':
      return ['Reducción de fatiga percibida', 'Mejora en calidad del sueño', 'Recuperación de motivación'];
    case 'metabolic':
      return ['Mejor tolerancia al lactato', 'Recuperación más rápida entre series', 'Mayor capacidad de trabajo'];
    default:
      return ['Progreso en rendimiento', 'Mejora en sensaciones', 'Adaptación positiva al estímulo'];
  }
}

/**
 * Get primary focus for a specific training phase based on goal
 * Based on Spanish fitness resources
 */
function getPrimaryFocusForPhase(phase: TrainingPhase, goal: TrainingGoal): string[] {
  // Base focus for each phase
  const baseFocus: Record<TrainingPhase, string[]> = {
    'anatomical_adaptation': ['técnica', 'patrones de movimiento', 'estabilidad'],
    'hypertrophy': ['volumen', 'tiempo bajo tensión', 'congestión muscular'],
    'strength': ['intensidad', 'activación neural', 'fuerza máxima'],
    'power': ['velocidad', 'explosividad', 'potencia'],
    'deload': ['recuperación', 'técnica', 'movilidad'],
    'metabolic': ['densidad', 'resistencia muscular', 'quema calórica']
  };

  // Get base focus for this phase
  const focus = baseFocus[phase] || ['progresión general'];

  // Adjust based on goal
  if (goal === 'hypertrophy') {
    return [...focus, 'desarrollo muscular', 'estimulación metabólica'];
  } else if (goal === 'strength') {
    return [...focus, 'fuerza máxima', 'eficiencia neural'];
  } else if (goal === 'endurance') {
    return [...focus, 'resistencia muscular', 'capacidad aeróbica'];
  } else if (goal === 'weight_loss') {
    return [...focus, 'gasto calórico', 'preservación muscular'];
  }

  return focus;
}

/**
 * Get secondary focus for a specific training phase based on goal
 * Based on Spanish fitness resources
 */
function getSecondaryFocusForPhase(phase: TrainingPhase, goal: TrainingGoal): string[] {
  // Base secondary focus for each phase
  const baseSecondaryFocus: Record<TrainingPhase, string[]> = {
    'anatomical_adaptation': ['resistencia muscular', 'conexión mente-músculo'],
    'hypertrophy': ['fuerza', 'nutrición', 'recuperación'],
    'strength': ['hipertrofia', 'técnica', 'sistema nervioso'],
    'power': ['fuerza', 'coordinación', 'sistema nervioso'],
    'deload': ['nutrición', 'sueño', 'estrés'],
    'metabolic': ['hipertrofia', 'cardiovascular', 'quema de grasa']
  };

  // Get base secondary focus for this phase
  const secondaryFocus = baseSecondaryFocus[phase] || ['técnica', 'recuperación'];

  // Adjust based on goal
  if (goal === 'hypertrophy') {
    return [...secondaryFocus, 'nutrición', 'recuperación entre entrenamientos'];
  } else if (goal === 'strength') {
    return [...secondaryFocus, 'hipertrofia', 'recuperación del SNC'];
  } else if (goal === 'endurance') {
    return [...secondaryFocus, 'capacidad cardiovascular', 'eficiencia energética'];
  } else if (goal === 'weight_loss') {
    return [...secondaryFocus, 'déficit calórico', 'actividad NEAT'];
  }

  return secondaryFocus;
}

/**
 * Get periodization plan by ID
 * @param planId - Plan ID
 * @returns Promise with the plan or null if not found
 */
export async function getPeriodizationPlan(planId: string): Promise<PeriodizationPlan | null> {
  try {
    const { data, error } = await supabase
      .from('periodization_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) {
      console.error('Error getting periodization plan:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      type: data.type,
      level: data.level,
      goal: data.goal,
      frequency: data.frequency,
      isActive: data.is_active,
      startDate: data.start_date,
      endDate: data.end_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error getting periodization plan:', error);
    return null;
  }
}

/**
 * Get training cycles for a plan
 * @param planId - Plan ID
 * @returns Promise with the cycles or empty array if not found
 */
export async function getTrainingCycles(planId: string): Promise<TrainingCycle[]> {
  try {
    const { data, error } = await supabase
      .from('training_cycles')
      .select('*')
      .eq('plan_id', planId)
      .order('week_number', { ascending: true });

    if (error) {
      console.error('Error getting training cycles:', error);
      return [];
    }

    return data.map((cycle: any) => ({
      id: cycle.id,
      planId: cycle.plan_id,
      name: cycle.name,
      description: cycle.description,
      cycleType: cycle.cycle_type,
      phase: cycle.phase,
      startDate: cycle.start_date,
      endDate: cycle.end_date,
      duration: cycle.duration,
      volume: cycle.volume,
      intensity: cycle.intensity,
      frequency: cycle.frequency,
      isDeload: cycle.is_deload,
      weekNumber: cycle.week_number,
      notes: cycle.notes,
      createdAt: cycle.created_at,
      updatedAt: cycle.updated_at
    }));
  } catch (error) {
    console.error('Error getting training cycles:', error);
    return [];
  }
}

/**
 * Get active periodization plan for a user
 * @param userId - User ID
 * @returns Promise with the active plan or null if not found
 */
export async function getActivePeriodizationPlan(userId: string): Promise<PeriodizationPlan | null> {
  try {
    const { data, error } = await supabase
      .from('periodization_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error getting active periodization plan:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      type: data.type,
      level: data.level,
      goal: data.goal,
      frequency: data.frequency,
      isActive: data.is_active,
      startDate: data.start_date,
      endDate: data.end_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error getting active periodization plan:', error);
    return null;
  }
}

/**
 * Get current training cycle for a user
 * @param userId - User ID
 * @returns Promise with the current cycle or null if not found
 */
export async function getCurrentTrainingCycle(userId: string): Promise<TrainingCycle | null> {
  try {
    // Get active plan
    const plan = await getActivePeriodizationPlan(userId);
    if (!plan) {
      return null;
    }

    // Get current date
    const now = new Date();

    // Get cycle that includes current date
    const { data, error } = await supabase
      .from('training_cycles')
      .select('*')
      .eq('plan_id', plan.id)
      .lte('start_date', now.toISOString())
      .gte('end_date', now.toISOString())
      .single();

    if (error) {
      console.error('Error getting current training cycle:', error);
      return null;
    }

    return {
      id: data.id,
      planId: data.plan_id,
      name: data.name,
      description: data.description,
      cycleType: data.cycle_type,
      phase: data.phase,
      startDate: data.start_date,
      endDate: data.end_date,
      duration: data.duration,
      volume: data.volume,
      intensity: data.intensity,
      frequency: data.frequency,
      isDeload: data.is_deload,
      weekNumber: data.week_number,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error getting current training cycle:', error);
    return null;
  }
}
