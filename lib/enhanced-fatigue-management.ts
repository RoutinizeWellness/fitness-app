/**
 * Enhanced Fatigue Management System
 * Based on Spanish fitness resources for advanced training periodization
 * Implements concepts from "Planificación de entrenamiento HsP", "Mesociclo Hazlo tú mismo BASQUELIFTS",
 * and other Spanish fitness resources.
 */

import { supabase } from '@/lib/supabase-client';
import {
  TrainingLevel,
  TrainingGoal,
  DeloadWeek,
  FatigueTracking,
  DeloadType,
  DeloadTiming
} from '@/lib/types/periodization';
import { WorkoutLog } from '@/lib/types/training';

// Interfaces for fatigue management
export interface FatigueMarkers {
  rpeIncrease: number; // Increase in RPE for same weight (0-10)
  strengthDecrease: number; // Percentage decrease in strength (0-100)
  soreness: number; // Scale 1-10
  sleepQuality: number; // Scale 1-10
  motivation: number; // Scale 1-10
  restingHeartRate: number; // Increase in BPM from baseline
  moodScore: number; // Scale 1-10
  stressScore: number; // Scale 1-10
  appetiteChanges: number; // Scale -5 to 5
  technicalProficiency: number; // Scale 1-10
}

export interface FatigueManagementRecommendation {
  currentFatigue: number; // Scale 1-10
  recoveryCapacity: number; // Scale 1-10
  sleepQuality: number; // Scale 1-10
  stressLevel: number; // Scale 1-10
  muscleSoreness: Record<string, number>; // Muscle group -> soreness level (1-10)
  performanceDecrement: number; // Percentage (0-100)
  readinessToTrain: number; // Scale 1-10
  recommendedAction: 'proceed' | 'reduce_volume' | 'reduce_intensity' | 'active_recovery' | 'rest' | 'deload';
  specificRecommendations: string[];
  deloadRecommendation?: DeloadRecommendation;
}

export interface DeloadRecommendation {
  type: DeloadType;
  volumeReduction: number; // Percentage (0-100)
  intensityReduction: number; // Percentage (0-100)
  frequencyReduction: number; // Days reduced
  duration: number; // In days
  timing: DeloadTiming;
  notes?: string;
}

export interface TrainingResponse {
  strengthGain: number; // Scale 1-10
  muscleGrowth: number; // Scale 1-10
  motivation: number; // Scale 1-10
  technicalImprovement: number; // Scale 1-10
  recoverySpeed: number; // Scale 1-10
}

export interface FatigueAlgorithmConfig {
  fatigueThreshold: number; // Threshold for recommending deload (0-10)
  recoveryWeight: number; // Weight of recovery factors (0-1)
  trainingResponseWeight: number; // Weight of training response (0-1)
  individualTolerance: number; // Individual tolerance factor (0.5-1.5)
  autoregulationEnabled: boolean;
}

// Fatigue thresholds by training level and goal
export const FATIGUE_THRESHOLDS: Record<TrainingLevel, Record<TrainingGoal, number>> = {
  beginner: {
    strength: 7,
    hypertrophy: 6,
    endurance: 5,
    power: 7,
    weight_loss: 5,
    body_recomposition: 6,
    general_fitness: 5,
    sport_specific: 6
  },
  intermediate: {
    strength: 8,
    hypertrophy: 7,
    endurance: 6,
    power: 8,
    weight_loss: 6,
    body_recomposition: 7,
    general_fitness: 6,
    sport_specific: 7
  },
  advanced: {
    strength: 9,
    hypertrophy: 8,
    endurance: 7,
    power: 9,
    weight_loss: 7,
    body_recomposition: 8,
    general_fitness: 7,
    sport_specific: 8
  },
  elite: {
    strength: 9.5,
    hypertrophy: 9,
    endurance: 8,
    power: 9.5,
    weight_loss: 8,
    body_recomposition: 9,
    general_fitness: 8,
    sport_specific: 9
  }
};

// Default deload strategies by training level and goal
export const DEFAULT_DELOAD_STRATEGIES: Record<TrainingLevel, Record<TrainingGoal, DeloadRecommendation>> = {
  beginner: {
    strength: {
      type: 'volume',
      volumeReduction: 40,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    hypertrophy: {
      type: 'volume',
      volumeReduction: 50,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    // Other goals follow similar pattern...
    endurance: {
      type: 'intensity',
      volumeReduction: 0,
      intensityReduction: 30,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    power: {
      type: 'combined',
      volumeReduction: 30,
      intensityReduction: 20,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    weight_loss: {
      type: 'volume',
      volumeReduction: 30,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    body_recomposition: {
      type: 'volume',
      volumeReduction: 40,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    general_fitness: {
      type: 'frequency',
      volumeReduction: 0,
      intensityReduction: 0,
      frequencyReduction: 1,
      duration: 7,
      timing: 'planned'
    },
    sport_specific: {
      type: 'combined',
      volumeReduction: 30,
      intensityReduction: 20,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    }
  },
  // Other training levels follow similar pattern...
  intermediate: {
    strength: {
      type: 'combined',
      volumeReduction: 40,
      intensityReduction: 20,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    hypertrophy: {
      type: 'volume',
      volumeReduction: 60,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    // Other goals follow similar pattern...
    endurance: {
      type: 'intensity',
      volumeReduction: 0,
      intensityReduction: 40,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    power: {
      type: 'combined',
      volumeReduction: 40,
      intensityReduction: 30,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    weight_loss: {
      type: 'volume',
      volumeReduction: 40,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    body_recomposition: {
      type: 'volume',
      volumeReduction: 50,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    },
    general_fitness: {
      type: 'frequency',
      volumeReduction: 0,
      intensityReduction: 0,
      frequencyReduction: 1,
      duration: 7,
      timing: 'planned'
    },
    sport_specific: {
      type: 'combined',
      volumeReduction: 40,
      intensityReduction: 30,
      frequencyReduction: 0,
      duration: 7,
      timing: 'planned'
    }
  },
  advanced: {
    // Advanced level strategies...
    strength: {
      type: 'combined',
      volumeReduction: 50,
      intensityReduction: 30,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    hypertrophy: {
      type: 'volume',
      volumeReduction: 70,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    endurance: {
      type: 'intensity',
      volumeReduction: 0,
      intensityReduction: 50,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    power: {
      type: 'combined',
      volumeReduction: 50,
      intensityReduction: 40,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    weight_loss: {
      type: 'volume',
      volumeReduction: 50,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    body_recomposition: {
      type: 'volume',
      volumeReduction: 60,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    general_fitness: {
      type: 'frequency',
      volumeReduction: 0,
      intensityReduction: 0,
      frequencyReduction: 2,
      duration: 7,
      timing: 'autoregulated'
    },
    sport_specific: {
      type: 'combined',
      volumeReduction: 50,
      intensityReduction: 40,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    }
  },
  elite: {
    // Elite level strategies...
    strength: {
      type: 'combined',
      volumeReduction: 60,
      intensityReduction: 40,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    hypertrophy: {
      type: 'volume',
      volumeReduction: 80,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    endurance: {
      type: 'intensity',
      volumeReduction: 0,
      intensityReduction: 60,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    power: {
      type: 'combined',
      volumeReduction: 60,
      intensityReduction: 50,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    weight_loss: {
      type: 'volume',
      volumeReduction: 60,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    body_recomposition: {
      type: 'volume',
      volumeReduction: 70,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    },
    general_fitness: {
      type: 'frequency',
      volumeReduction: 0,
      intensityReduction: 0,
      frequencyReduction: 2,
      duration: 7,
      timing: 'autoregulated'
    },
    sport_specific: {
      type: 'combined',
      volumeReduction: 60,
      intensityReduction: 50,
      frequencyReduction: 0,
      duration: 7,
      timing: 'autoregulated'
    }
  }
};

/**
 * Calculate fatigue score based on various markers
 * @param markers - Fatigue markers
 * @param level - Training level
 * @param goal - Training goal
 * @param individualTolerance - Individual tolerance factor (0.5-1.5)
 * @returns Fatigue score (0-10)
 */
export function calculateFatigueScore(
  markers: FatigueMarkers,
  level: TrainingLevel,
  goal: TrainingGoal,
  individualTolerance: number = 1.0
): number {
  // Get weights for different markers based on training goal
  const weights = getMarkerWeights(goal);

  // Calculate weighted score
  let score = 0;
  score += markers.rpeIncrease * weights.rpeIncrease;
  score += markers.strengthDecrease * weights.strengthDecrease;
  score += markers.soreness * weights.soreness;
  score += (10 - markers.sleepQuality) * weights.sleepQuality;
  score += (10 - markers.motivation) * weights.motivation;
  score += markers.restingHeartRate * weights.restingHeartRate / 10;
  score += (10 - markers.moodScore) * weights.moodScore;
  score += markers.stressScore * weights.stressScore;
  score += Math.abs(markers.appetiteChanges) * weights.appetiteChanges;
  score += (10 - markers.technicalProficiency) * weights.technicalProficiency;

  // Adjust by level (advanced athletes can handle more fatigue)
  const levelMultiplier = getLevelMultiplier(level);

  // Adjust by individual tolerance
  return (score / 10) * levelMultiplier * individualTolerance;
}

/**
 * Get weights for different fatigue markers based on training goal
 * @param goal - Training goal
 * @returns Weights for different markers
 */
function getMarkerWeights(goal: TrainingGoal): Record<keyof FatigueMarkers, number> {
  switch (goal) {
    case 'strength':
      return {
        rpeIncrease: 1.5,
        strengthDecrease: 2.0,
        soreness: 0.8,
        sleepQuality: 1.0,
        motivation: 1.0,
        restingHeartRate: 0.7,
        moodScore: 0.8,
        stressScore: 1.0,
        appetiteChanges: 0.6,
        technicalProficiency: 1.5
      };
    case 'hypertrophy':
      return {
        rpeIncrease: 1.0,
        strengthDecrease: 1.0,
        soreness: 1.2,
        sleepQuality: 1.2,
        motivation: 1.0,
        restingHeartRate: 0.8,
        moodScore: 0.8,
        stressScore: 1.0,
        appetiteChanges: 1.0,
        technicalProficiency: 0.8
      };
    case 'power':
      return {
        rpeIncrease: 1.5,
        strengthDecrease: 1.8,
        soreness: 0.7,
        sleepQuality: 1.2,
        motivation: 1.2,
        restingHeartRate: 0.8,
        moodScore: 0.8,
        stressScore: 1.0,
        appetiteChanges: 0.6,
        technicalProficiency: 1.8
      };
    case 'endurance':
      return {
        rpeIncrease: 1.0,
        strengthDecrease: 0.7,
        soreness: 0.8,
        sleepQuality: 1.0,
        motivation: 1.0,
        restingHeartRate: 1.5,
        moodScore: 0.8,
        stressScore: 1.0,
        appetiteChanges: 0.8,
        technicalProficiency: 0.7
      };
    default:
      return {
        rpeIncrease: 1.0,
        strengthDecrease: 1.0,
        soreness: 1.0,
        sleepQuality: 1.0,
        motivation: 1.0,
        restingHeartRate: 1.0,
        moodScore: 1.0,
        stressScore: 1.0,
        appetiteChanges: 1.0,
        technicalProficiency: 1.0
      };
  }
}

/**
 * Get level multiplier for fatigue calculation
 * @param level - Training level
 * @returns Level multiplier
 */
function getLevelMultiplier(level: TrainingLevel): number {
  switch (level) {
    case 'beginner':
      return 1.2; // Beginners are more sensitive to fatigue
    case 'intermediate':
      return 1.0;
    case 'advanced':
      return 0.8; // Advanced athletes can handle more fatigue
    case 'elite':
      return 0.7; // Elite athletes can handle even more fatigue
    default:
      return 1.0;
  }
}

/**
 * Determine if a deload is needed based on fatigue and recovery metrics
 * @param fatigueScore - Current fatigue score
 * @param recoveryScore - Recovery capacity score
 * @param trainingResponse - Response to training
 * @param config - Algorithm configuration
 * @param consecutiveHighFatigue - Number of consecutive days with high fatigue
 * @returns Whether a deload is needed
 */
export function needsDeload(
  fatigueScore: number,
  recoveryScore: number,
  trainingResponse: TrainingResponse,
  config: FatigueAlgorithmConfig,
  consecutiveHighFatigue: number
): boolean {
  // Calculate combined score
  const combinedScore =
    fatigueScore -
    (recoveryScore * config.recoveryWeight) -
    ((trainingResponse.strengthGain + trainingResponse.muscleGrowth) / 2 * config.trainingResponseWeight);

  // Check if exceeds threshold
  const exceedsThreshold = combinedScore > config.fatigueThreshold;

  // Check for persistent fatigue
  const persistentFatigue = consecutiveHighFatigue >= 3;

  // Check for overtraining risk
  const overtrainingRisk =
    trainingResponse.motivation < 5 &&
    trainingResponse.strengthGain < 3 &&
    fatigueScore > config.fatigueThreshold * 0.8;

  return exceedsThreshold || persistentFatigue || overtrainingRisk;
}

/**
 * Generate fatigue management recommendations
 * @param fatigueScore - Current fatigue score
 * @param recoveryScore - Recovery capacity score
 * @param level - Training level
 * @param goal - Training goal
 * @returns Fatigue management recommendations
 */
export function generateFatigueManagementRecommendations(
  fatigueScore: number,
  recoveryScore: number,
  level: TrainingLevel,
  goal: TrainingGoal
): FatigueManagementRecommendation {
  // Determine current fatigue level
  const currentFatigue = fatigueScore;

  // Determine recovery capacity
  const recoveryCapacity = recoveryScore;

  // Calculate estimated performance decrement
  const performanceDecrement = Math.min(100, fatigueScore * 10);

  // Determine readiness to train
  const readinessToTrain = Math.max(1, 10 - fatigueScore);

  // Determine recommended action
  let recommendedAction: 'proceed' | 'reduce_volume' | 'reduce_intensity' | 'active_recovery' | 'rest' | 'deload';
  const specificRecommendations: string[] = [];

  if (fatigueScore < FATIGUE_THRESHOLDS[level][goal] * 0.6) {
    recommendedAction = 'proceed';
    specificRecommendations.push('Continúa con tu entrenamiento normal.');
    specificRecommendations.push('Tu nivel de fatiga es bajo, puedes entrenar a intensidad completa.');
  } else if (fatigueScore < FATIGUE_THRESHOLDS[level][goal] * 0.8) {
    recommendedAction = 'reduce_volume';
    specificRecommendations.push('Reduce el volumen de entrenamiento en un 20-30%.');
    specificRecommendations.push('Mantén la intensidad pero haz menos series totales.');
    specificRecommendations.push('Prioriza ejercicios compuestos y reduce los de aislamiento.');
  } else if (fatigueScore < FATIGUE_THRESHOLDS[level][goal]) {
    recommendedAction = 'reduce_intensity';
    specificRecommendations.push('Reduce la intensidad de entrenamiento en un 10-15%.');
    specificRecommendations.push('Usa pesos más ligeros y mantén un RIR (Repeticiones en Reserva) más alto.');
    specificRecommendations.push('Considera hacer más repeticiones con menos peso.');
  } else if (fatigueScore < FATIGUE_THRESHOLDS[level][goal] * 1.2) {
    recommendedAction = 'active_recovery';
    specificRecommendations.push('Realiza sesiones de recuperación activa.');
    specificRecommendations.push('Enfócate en movilidad, estiramientos y trabajo de muy baja intensidad.');
    specificRecommendations.push('Considera actividades como natación, caminata o yoga.');
  } else if (fatigueScore < FATIGUE_THRESHOLDS[level][goal] * 1.4) {
    recommendedAction = 'rest';
    specificRecommendations.push('Toma 1-2 días completos de descanso.');
    specificRecommendations.push('Prioriza el sueño y la nutrición para recuperarte.');
    specificRecommendations.push('Considera técnicas de recuperación como sauna, baños de contraste o masaje.');
  } else {
    recommendedAction = 'deload';
    specificRecommendations.push('Implementa una semana de descarga (deload).');
    specificRecommendations.push('Reduce significativamente el volumen y/o intensidad durante 5-7 días.');
    specificRecommendations.push('Enfócate en la recuperación completa antes de volver a entrenar normalmente.');
  }

  // Create fatigue management recommendation
  const recommendation: FatigueManagementRecommendation = {
    currentFatigue,
    recoveryCapacity,
    sleepQuality: recoveryScore, // Simplification
    stressLevel: 10 - recoveryScore, // Simplification
    muscleSoreness: {}, // Would be filled with specific data
    performanceDecrement,
    readinessToTrain,
    recommendedAction,
    specificRecommendations
  };

  // Add deload recommendation if needed
  if (recommendedAction === 'deload') {
    recommendation.deloadRecommendation = generatePersonalizedDeload(
      fatigueScore,
      recoveryScore,
      level,
      goal,
      DEFAULT_DELOAD_STRATEGIES[level][goal]
    );
  }

  return recommendation;
}

/**
 * Generate personalized deload strategy
 * @param fatigueScore - Current fatigue score
 * @param recoveryScore - Recovery capacity score
 * @param level - Training level
 * @param goal - Training goal
 * @param baseStrategy - Base deload strategy
 * @returns Personalized deload strategy
 */
export function generatePersonalizedDeload(
  fatigueScore: number,
  recoveryScore: number,
  level: TrainingLevel,
  goal: TrainingGoal,
  baseStrategy: DeloadRecommendation
): DeloadRecommendation {
  // Clone base strategy
  const personalizedStrategy: DeloadRecommendation = { ...baseStrategy };

  // Adjust based on fatigue level
  if (fatigueScore > FATIGUE_THRESHOLDS[level][goal] * 1.2) {
    // Very high fatigue - more aggressive deload
    personalizedStrategy.volumeReduction += 10;
    personalizedStrategy.intensityReduction += 5;
    personalizedStrategy.frequencyReduction += 1;
    personalizedStrategy.duration += 2;
    personalizedStrategy.notes = 'Fatiga muy alta - deload agresivo recomendado';
  } else if (fatigueScore < FATIGUE_THRESHOLDS[level][goal] * 0.8) {
    // Low fatigue - milder deload
    personalizedStrategy.volumeReduction -= 10;
    personalizedStrategy.intensityReduction -= 5;
    personalizedStrategy.duration -= 2;
    personalizedStrategy.notes = 'Fatiga moderada - deload suave recomendado';
  }

  // Adjust based on recovery capacity
  if (recoveryScore < 4) {
    // Poor recovery - extend deload
    personalizedStrategy.duration += 2;
    personalizedStrategy.volumeReduction += 5;
    personalizedStrategy.notes = (personalizedStrategy.notes || '') + ' - Capacidad de recuperación baja, deload extendido';
  } else if (recoveryScore > 7) {
    // Good recovery - shorter deload
    personalizedStrategy.duration = Math.max(3, personalizedStrategy.duration - 2);
    personalizedStrategy.notes = (personalizedStrategy.notes || '') + ' - Buena capacidad de recuperación, deload más corto';
  }

  return personalizedStrategy;
}

/**
 * Save fatigue tracking data to the database
 * @param fatigueData - Fatigue tracking data
 * @returns Promise with the saved data or null on error
 */
export async function saveFatigueTracking(
  fatigueData: Omit<FatigueTracking, 'id' | 'createdAt'>
): Promise<FatigueTracking | null> {
  try {
    const { data, error } = await supabase
      .from('fatigue_tracking')
      .insert([{
        user_id: fatigueData.userId,
        date: fatigueData.date,
        overall_fatigue: fatigueData.overallFatigue,
        muscle_group_fatigue: fatigueData.muscleGroupFatigue,
        rpe_increase: fatigueData.rpeIncrease,
        strength_decrease: fatigueData.strengthDecrease,
        soreness: fatigueData.soreness,
        sleep_quality: fatigueData.sleepQuality,
        motivation: fatigueData.motivation,
        resting_heart_rate: fatigueData.restingHeartRate,
        mood_score: fatigueData.moodScore,
        stress_score: fatigueData.stressScore,
        appetite_changes: fatigueData.appetiteChanges,
        technical_proficiency: fatigueData.technicalProficiency,
        notes: fatigueData.notes
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving fatigue tracking:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      overallFatigue: data.overall_fatigue,
      muscleGroupFatigue: data.muscle_group_fatigue,
      rpeIncrease: data.rpe_increase,
      strengthDecrease: data.strength_decrease,
      soreness: data.soreness,
      sleepQuality: data.sleep_quality,
      motivation: data.motivation,
      restingHeartRate: data.resting_heart_rate,
      moodScore: data.mood_score,
      stressScore: data.stress_score,
      appetiteChanges: data.appetite_changes,
      technicalProficiency: data.technical_proficiency,
      notes: data.notes,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error saving fatigue tracking:', error);
    return null;
  }
}

/**
 * Get latest fatigue tracking data for a user
 * @param userId - User ID
 * @returns Promise with the latest fatigue data or null if not found
 */
export async function getLatestFatigueTracking(userId: string): Promise<FatigueTracking | null> {
  try {
    const { data, error } = await supabase
      .from('fatigue_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error getting fatigue tracking:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      overallFatigue: data.overall_fatigue,
      muscleGroupFatigue: data.muscle_group_fatigue,
      rpeIncrease: data.rpe_increase,
      strengthDecrease: data.strength_decrease,
      soreness: data.soreness,
      sleepQuality: data.sleep_quality,
      motivation: data.motivation,
      restingHeartRate: data.resting_heart_rate,
      moodScore: data.mood_score,
      stressScore: data.stress_score,
      appetiteChanges: data.appetite_changes,
      technicalProficiency: data.technical_proficiency,
      notes: data.notes,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error getting fatigue tracking:', error);
    return null;
  }
}

/**
 * Save deload week to the database
 * @param deloadData - Deload week data
 * @returns Promise with the saved data or null on error
 */
export async function saveDeloadWeek(
  deloadData: Omit<DeloadWeek, 'id' | 'createdAt' | 'updatedAt'>
): Promise<DeloadWeek | null> {
  try {
    const { data, error } = await supabase
      .from('deload_weeks')
      .insert([{
        user_id: deloadData.userId,
        plan_id: deloadData.planId,
        cycle_id: deloadData.cycleId,
        start_date: deloadData.startDate,
        end_date: deloadData.endDate,
        type: deloadData.type,
        volume_reduction: deloadData.volumeReduction,
        intensity_reduction: deloadData.intensityReduction,
        frequency_reduction: deloadData.frequencyReduction,
        timing: deloadData.timing,
        reason: deloadData.reason,
        notes: deloadData.notes
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving deload week:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      planId: data.plan_id,
      cycleId: data.cycle_id,
      startDate: data.start_date,
      endDate: data.end_date,
      type: data.type,
      volumeReduction: data.volume_reduction,
      intensityReduction: data.intensity_reduction,
      frequencyReduction: data.frequency_reduction,
      timing: data.timing,
      reason: data.reason,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error saving deload week:', error);
    return null;
  }
}