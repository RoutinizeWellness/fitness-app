/**
 * Deload Recommendation Service
 *
 * Implements an algorithm that recommends deload periods based on:
 * - Performance metrics
 * - Fatigue indicators
 * - User feedback
 * - Training history
 *
 * Based on principles from:
 * - Pure Bodybuilding Phase 2 Hypertrophy Handbook
 * - Jeff Nippard's Push/Pull/Legs System
 * - Chris Bumstead's Training Methodology
 * - Université Mohammed V de Rabat Hypertrophy Research
 */

import { supabase } from "@/lib/supabase-client";
import { v4 as uuidv4 } from "uuid";
import {
  DeloadType,
  DeloadTiming,
  TrainingLevel,
  TrainingGoal
} from "@/lib/types/periodization";
import { getUserFatigue } from "@/lib/training-algorithm";
import { WorkoutLog } from "@/lib/types/training";

// Interface for deload recommendation
export interface DeloadRecommendation {
  id: string;
  userId: string;
  recommendedDate: string;
  urgency: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number; // 0-100
  recommendedType: DeloadType;
  recommendedDuration: number; // In days
  reasons: string[];
  metrics: {
    fatigueScore: number; // 0-10
    performanceDecline: number; // Percentage
    recoveryCapacity: number; // 0-10
    technicalProficiency: number; // 0-10
    motivationLevel: number; // 0-10
    sleepQuality: number; // 0-10
    soreness: number; // 0-10
    readinessScore: number; // 0-10
  };
  createdAt: string;
}

// Interface for deload configuration
export interface DeloadConfig {
  frequency: number; // Every X weeks
  strategy: DeloadType;
  timing: DeloadTiming;
  autoRegulated: boolean;
  fatigueThreshold: number; // 0-10
  performanceThreshold: number; // Percentage decline
  minWeeksBetweenDeloads: number;
}

/**
 * Analyze user metrics and recommend a deload if needed
 */
export async function analyzeAndRecommendDeload(
  userId: string,
  trainingLevel: TrainingLevel,
  goal: TrainingGoal,
  config?: Partial<DeloadConfig>
): Promise<DeloadRecommendation | null> {
  try {
    // Get default config based on training level and goal
    const defaultConfig = getDefaultDeloadConfig(trainingLevel, goal);

    // Merge with provided config
    const deloadConfig: DeloadConfig = {
      ...defaultConfig,
      ...config
    };

    // Get user fatigue data
    const fatigue = await getUserFatigue(userId);

    // Get recent workout logs
    const { data: workoutLogs, error: workoutError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);

    if (workoutError) {
      console.error('Error fetching workout logs:', workoutError);
      return null;
    }

    // Get last deload
    const { data: lastDeload, error: deloadError } = await supabase
      .from('deload_weeks')
      .select('*')
      .eq('user_id', userId)
      .order('end_date', { ascending: false })
      .limit(1);

    if (deloadError) {
      console.error('Error fetching last deload:', deloadError);
      return null;
    }

    // Calculate metrics
    const fatigueScore = fatigue?.currentFatigue || 5;
    const performanceDecline = calculatePerformanceDecline(workoutLogs as WorkoutLog[]);
    const recoveryCapacity = calculateRecoveryCapacity(workoutLogs as WorkoutLog[]);
    const technicalProficiency = calculateTechnicalProficiency(workoutLogs as WorkoutLog[]);
    const motivationLevel = calculateMotivationLevel(workoutLogs as WorkoutLog[]);
    const sleepQuality = await getSleepQuality(userId);
    const soreness = calculateSoreness(workoutLogs as WorkoutLog[]);
    const readinessScore = calculateReadinessScore(
      fatigueScore,
      performanceDecline,
      recoveryCapacity,
      motivationLevel,
      sleepQuality,
      soreness
    );

    // Check if a deload is needed
    const weeksSinceLastDeload = lastDeload && lastDeload.length > 0
      ? Math.floor((Date.now() - new Date(lastDeload[0].end_date).getTime()) / (7 * 24 * 60 * 60 * 1000))
      : 999; // Large number if no previous deload

    const isDeloadNeeded = (
      (fatigueScore >= deloadConfig.fatigueThreshold) ||
      (performanceDecline >= deloadConfig.performanceThreshold) ||
      (readinessScore < 5 && weeksSinceLastDeload >= Math.floor(deloadConfig.minWeeksBetweenDeloads / 2)) ||
      (weeksSinceLastDeload >= deloadConfig.frequency)
    ) && (weeksSinceLastDeload >= deloadConfig.minWeeksBetweenDeloads);

    if (!isDeloadNeeded) {
      return null;
    }

    // Determine urgency
    let urgency: 'low' | 'moderate' | 'high' | 'critical' = 'low';

    if (fatigueScore >= 9 || performanceDecline >= 20 || readinessScore <= 3) {
      urgency = 'critical';
    } else if (fatigueScore >= 8 || performanceDecline >= 15 || readinessScore <= 4) {
      urgency = 'high';
    } else if (fatigueScore >= 7 || performanceDecline >= 10 || readinessScore <= 5) {
      urgency = 'moderate';
    }

    // Determine confidence
    const confidence = calculateConfidence(
      fatigueScore,
      performanceDecline,
      recoveryCapacity,
      weeksSinceLastDeload,
      deloadConfig.frequency
    );

    // Determine recommended deload type
    const recommendedType = determineDeloadType(
      fatigueScore,
      performanceDecline,
      technicalProficiency,
      trainingLevel,
      goal
    );

    // Determine recommended duration
    const recommendedDuration = urgency === 'critical' ? 7 :
                               urgency === 'high' ? 5 :
                               urgency === 'moderate' ? 4 : 3;

    // Generate reasons
    const reasons = generateDeloadReasons(
      fatigueScore,
      performanceDecline,
      recoveryCapacity,
      technicalProficiency,
      motivationLevel,
      sleepQuality,
      soreness,
      weeksSinceLastDeload,
      deloadConfig.frequency
    );

    // Create recommendation
    const recommendation: DeloadRecommendation = {
      id: uuidv4(),
      userId,
      recommendedDate: new Date().toISOString(),
      urgency,
      confidence,
      recommendedType,
      recommendedDuration,
      reasons,
      metrics: {
        fatigueScore,
        performanceDecline,
        recoveryCapacity,
        technicalProficiency,
        motivationLevel,
        sleepQuality,
        soreness,
        readinessScore
      },
      createdAt: new Date().toISOString()
    };

    // Save recommendation to database
    const { error: saveError } = await supabase
      .from('deload_recommendations')
      .insert([{
        id: recommendation.id,
        user_id: recommendation.userId,
        recommended_date: recommendation.recommendedDate,
        urgency: recommendation.urgency,
        confidence: recommendation.confidence,
        recommended_type: recommendation.recommendedType,
        recommended_duration: recommendation.recommendedDuration,
        reasons: recommendation.reasons,
        metrics: recommendation.metrics,
        created_at: recommendation.createdAt
      }]);

    if (saveError) {
      console.error('Error saving deload recommendation:', saveError);
    }

    return recommendation;
  } catch (error) {
    console.error('Error in analyzeAndRecommendDeload:', error);
    return null;
  }
}

/**
 * Get default deload configuration based on training level and goal
 */
function getDefaultDeloadConfig(trainingLevel: TrainingLevel, goal: TrainingGoal): DeloadConfig {
  // Base configuration by training level
  const baseConfig: Record<TrainingLevel, Partial<DeloadConfig>> = {
    'beginner': {
      frequency: 8,
      timing: 'planned',
      autoRegulated: false,
      fatigueThreshold: 8.5,
      performanceThreshold: 15,
      minWeeksBetweenDeloads: 6
    },
    'intermediate': {
      frequency: 6,
      timing: 'autoregulated',
      autoRegulated: true,
      fatigueThreshold: 7.5,
      performanceThreshold: 10,
      minWeeksBetweenDeloads: 4
    },
    'advanced': {
      frequency: 4,
      timing: 'autoregulated',
      autoRegulated: true,
      fatigueThreshold: 7.0,
      performanceThreshold: 8,
      minWeeksBetweenDeloads: 3
    },
    'elite': {
      frequency: 3,
      timing: 'autoregulated',
      autoRegulated: true,
      fatigueThreshold: 6.5,
      performanceThreshold: 5,
      minWeeksBetweenDeloads: 2
    }
  };

  // Strategy by goal
  const strategyByGoal: Record<TrainingGoal, DeloadType> = {
    'strength': 'intensity',
    'hypertrophy': 'volume',
    'power': 'frequency',
    'endurance': 'active_recovery',
    'weight_loss': 'volume',
    'body_recomposition': 'combined',
    'general_fitness': 'volume',
    'sport_specific': 'combined',
    'aesthetic': 'volume',
    'functional': 'active_recovery',
    'powerbuilding': 'combined',
    'crosstraining': 'frequency'
  };

  // Get base config for training level
  const config = baseConfig[trainingLevel] || baseConfig['intermediate'];

  // Get strategy for goal
  const strategy = strategyByGoal[goal] || 'volume';

  // Return complete config
  return {
    frequency: config.frequency!,
    strategy,
    timing: config.timing!,
    autoRegulated: config.autoRegulated!,
    fatigueThreshold: config.fatigueThreshold!,
    performanceThreshold: config.performanceThreshold!,
    minWeeksBetweenDeloads: config.minWeeksBetweenDeloads!
  };
}

/**
 * Calculate performance decline based on recent workout logs
 */
function calculatePerformanceDecline(workoutLogs: WorkoutLog[]): number {
  if (!workoutLogs || workoutLogs.length < 2) {
    return 0;
  }

  // Group logs by exercise to track performance
  const exercisePerformance: Record<string, { date: string; performance: number }[]> = {};

  // Process workout logs
  workoutLogs.forEach(log => {
    if (!log.exercises) return;

    log.exercises.forEach(exercise => {
      if (!exercise.sets || exercise.sets.length === 0) return;

      // Calculate average performance for this exercise (weight * reps)
      const totalPerformance = exercise.sets.reduce((sum, set) => {
        const weight = set.weight || 0;
        const reps = set.completedReps || set.targetReps || 0;
        return sum + (weight * reps);
      }, 0);

      const avgPerformance = totalPerformance / exercise.sets.length;

      // Add to exercise performance tracking
      if (!exercisePerformance[exercise.id]) {
        exercisePerformance[exercise.id] = [];
      }

      exercisePerformance[exercise.id].push({
        date: log.date,
        performance: avgPerformance
      });
    });
  });

  // Calculate performance decline for each exercise
  const declines: number[] = [];

  Object.values(exercisePerformance).forEach(performances => {
    if (performances.length < 2) return;

    // Sort by date (newest first)
    performances.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Get most recent and previous performance
    const recent = performances[0].performance;
    const previous = performances[1].performance;

    if (previous > 0) {
      const decline = Math.max(0, ((previous - recent) / previous) * 100);
      declines.push(decline);
    }
  });

  // Return average decline across exercises
  return declines.length > 0
    ? declines.reduce((sum, val) => sum + val, 0) / declines.length
    : 0;
}

/**
 * Calculate recovery capacity based on workout logs
 */
function calculateRecoveryCapacity(workoutLogs: WorkoutLog[]): number {
  if (!workoutLogs || workoutLogs.length < 3) {
    return 5; // Default middle value
  }

  // Calculate average days between workouts
  const dates = workoutLogs.map(log => new Date(log.date).getTime()).sort();
  let totalGaps = 0;

  for (let i = 1; i < dates.length; i++) {
    const gap = (dates[i] - dates[i-1]) / (24 * 60 * 60 * 1000); // Gap in days
    totalGaps += gap;
  }

  const avgGap = totalGaps / (dates.length - 1);

  // Calculate performance consistency
  const performanceConsistency = calculatePerformanceConsistency(workoutLogs);

  // Calculate reported fatigue (if available)
  const reportedFatigue = workoutLogs
    .filter(log => log.userFeedback && log.userFeedback.fatigue !== undefined)
    .map(log => log.userFeedback!.fatigue!);

  const avgFatigue = reportedFatigue.length > 0
    ? reportedFatigue.reduce((sum, val) => sum + val, 0) / reportedFatigue.length
    : 5;

  // Calculate recovery capacity (10 = excellent recovery, 1 = poor recovery)
  // Lower gaps, higher consistency, and lower fatigue indicate better recovery
  const gapScore = Math.min(10, Math.max(1, 11 - avgGap)); // Lower gaps = higher score
  const consistencyScore = performanceConsistency * 10; // 0-1 scaled to 0-10
  const fatigueScore = Math.min(10, Math.max(1, 11 - avgFatigue)); // Lower fatigue = higher score

  // Weighted average
  return (gapScore * 0.3) + (consistencyScore * 0.4) + (fatigueScore * 0.3);
}

/**
 * Calculate performance consistency from workout logs
 */
function calculatePerformanceConsistency(workoutLogs: WorkoutLog[]): number {
  if (!workoutLogs || workoutLogs.length < 3) {
    return 0.5; // Default middle value
  }

  // Group logs by exercise to track performance
  const exercisePerformance: Record<string, number[]> = {};

  // Process workout logs
  workoutLogs.forEach(log => {
    if (!log.exercises) return;

    log.exercises.forEach(exercise => {
      if (!exercise.sets || exercise.sets.length === 0) return;

      // Calculate average performance for this exercise (weight * reps)
      const totalPerformance = exercise.sets.reduce((sum, set) => {
        const weight = set.weight || 0;
        const reps = set.completedReps || set.targetReps || 0;
        return sum + (weight * reps);
      }, 0);

      const avgPerformance = totalPerformance / exercise.sets.length;

      // Add to exercise performance tracking
      if (!exercisePerformance[exercise.id]) {
        exercisePerformance[exercise.id] = [];
      }

      exercisePerformance[exercise.id].push(avgPerformance);
    });
  });

  // Calculate coefficient of variation for each exercise (lower = more consistent)
  const consistencyScores: number[] = [];

  Object.values(exercisePerformance).forEach(performances => {
    if (performances.length < 3) return;

    // Calculate mean
    const mean = performances.reduce((sum, val) => sum + val, 0) / performances.length;

    if (mean === 0) return;

    // Calculate standard deviation
    const squaredDiffs = performances.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / performances.length;
    const stdDev = Math.sqrt(variance);

    // Calculate coefficient of variation (CV)
    const cv = stdDev / mean;

    // Convert to consistency score (1 - CV, capped between 0 and 1)
    const consistencyScore = Math.min(1, Math.max(0, 1 - cv));
    consistencyScores.push(consistencyScore);
  });

  // Return average consistency across exercises
  return consistencyScores.length > 0
    ? consistencyScores.reduce((sum, val) => sum + val, 0) / consistencyScores.length
    : 0.5;
}

/**
 * Calculate technical proficiency from workout logs
 */
function calculateTechnicalProficiency(workoutLogs: WorkoutLog[]): number {
  if (!workoutLogs || workoutLogs.length === 0) {
    return 5; // Default middle value
  }

  // Extract technical proficiency ratings if available
  const technicalRatings = workoutLogs
    .filter(log => log.userFeedback && log.userFeedback.technicalProficiency !== undefined)
    .map(log => log.userFeedback!.technicalProficiency!);

  if (technicalRatings.length > 0) {
    // Return average of user-reported technical proficiency
    return technicalRatings.reduce((sum, val) => sum + val, 0) / technicalRatings.length;
  }

  // If no explicit ratings, estimate based on other factors

  // Check for failed reps (indicates potential technical issues)
  let totalTargetReps = 0;
  let totalCompletedReps = 0;

  workoutLogs.forEach(log => {
    if (!log.exercises) return;

    log.exercises.forEach(exercise => {
      if (!exercise.sets) return;

      exercise.sets.forEach(set => {
        if (set.targetReps) {
          totalTargetReps += set.targetReps;
          totalCompletedReps += set.completedReps || set.targetReps;
        }
      });
    });
  });

  // Calculate completion rate
  const completionRate = totalTargetReps > 0
    ? totalCompletedReps / totalTargetReps
    : 0.8; // Default if no target reps

  // Check for RIR consistency (consistent RIR indicates good technique)
  const rirConsistency = calculateRirConsistency(workoutLogs);

  // Estimate technical proficiency (scale 1-10)
  return Math.min(10, Math.max(1, (completionRate * 6) + (rirConsistency * 4)));
}

/**
 * Calculate RIR consistency from workout logs
 */
function calculateRirConsistency(workoutLogs: WorkoutLog[]): number {
  if (!workoutLogs || workoutLogs.length === 0) {
    return 0.5; // Default middle value
  }

  // Extract RIR values from sets
  const rirValues: number[] = [];

  workoutLogs.forEach(log => {
    if (!log.exercises) return;

    log.exercises.forEach(exercise => {
      if (!exercise.sets) return;

      exercise.sets.forEach(set => {
        if (set.rir !== undefined) {
          rirValues.push(set.rir);
        }
      });
    });
  });

  if (rirValues.length < 3) {
    return 0.5; // Not enough data
  }

  // Calculate standard deviation of RIR values
  const mean = rirValues.reduce((sum, val) => sum + val, 0) / rirValues.length;
  const squaredDiffs = rirValues.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / rirValues.length;
  const stdDev = Math.sqrt(variance);

  // Convert to consistency score (1 = perfect consistency, 0 = high variability)
  // Lower standard deviation means more consistent RIR
  return Math.min(1, Math.max(0, 1 - (stdDev / 5))); // Normalize by assuming max stdDev of 5
}

/**
 * Calculate motivation level from workout logs
 */
function calculateMotivationLevel(workoutLogs: WorkoutLog[]): number {
  if (!workoutLogs || workoutLogs.length === 0) {
    return 5; // Default middle value
  }

  // Extract motivation ratings if available
  const motivationRatings = workoutLogs
    .filter(log => log.userFeedback && log.userFeedback.motivation !== undefined)
    .map(log => log.userFeedback!.motivation!);

  if (motivationRatings.length > 0) {
    // Return average of user-reported motivation
    return motivationRatings.reduce((sum, val) => sum + val, 0) / motivationRatings.length;
  }

  // If no explicit ratings, estimate based on other factors

  // Check workout completion (did they finish all planned exercises?)
  const completionRates = workoutLogs.map(log => {
    if (!log.exercises) return 1;

    const completedExercises = log.exercises.filter(ex =>
      ex.sets && ex.sets.some(set => set.completedReps !== undefined)
    ).length;

    return completedExercises / log.exercises.length;
  });

  const avgCompletionRate = completionRates.reduce((sum, val) => sum + val, 0) / completionRates.length;

  // Check workout duration (shorter than expected might indicate low motivation)
  const durationRatios = workoutLogs
    .filter(log => log.duration && log.plannedDuration)
    .map(log => log.duration! / log.plannedDuration!);

  const avgDurationRatio = durationRatios.length > 0
    ? durationRatios.reduce((sum, val) => sum + val, 0) / durationRatios.length
    : 1;

  // Estimate motivation level (scale 1-10)
  return Math.min(10, Math.max(1, (avgCompletionRate * 5) + (avgDurationRatio * 5)));
}

/**
 * Get sleep quality data from sleep logs
 */
async function getSleepQuality(userId: string): Promise<number> {
  try {
    // Get recent sleep logs
    const { data: sleepLogs, error } = await supabase
      .from('sleep_logs')
      .select('quality, duration')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7);

    if (error || !sleepLogs || sleepLogs.length === 0) {
      return 5; // Default middle value
    }

    // Calculate average sleep quality
    const qualityValues = sleepLogs
      .filter(log => log.quality !== undefined && log.quality !== null)
      .map(log => log.quality);

    if (qualityValues.length === 0) {
      // If no explicit quality ratings, estimate based on duration
      const durationValues = sleepLogs
        .filter(log => log.duration !== undefined && log.duration !== null)
        .map(log => log.duration);

      if (durationValues.length === 0) {
        return 5; // Default if no data
      }

      // Calculate average duration
      const avgDuration = durationValues.reduce((sum, val) => sum + val, 0) / durationValues.length;

      // Convert to quality score (7-9 hours is optimal)
      if (avgDuration >= 7 && avgDuration <= 9) {
        return 8; // Optimal sleep duration
      } else if (avgDuration >= 6 && avgDuration < 7) {
        return 6; // Slightly below optimal
      } else if (avgDuration > 9 && avgDuration <= 10) {
        return 7; // Slightly above optimal
      } else if (avgDuration >= 5 && avgDuration < 6) {
        return 4; // Poor sleep duration
      } else {
        return 2; // Very poor sleep duration
      }
    }

    // Return average quality
    return qualityValues.reduce((sum, val) => sum + val, 0) / qualityValues.length;
  } catch (error) {
    console.error('Error in getSleepQuality:', error);
    return 5; // Default middle value
  }
}

/**
 * Calculate soreness level from workout logs
 */
function calculateSoreness(workoutLogs: WorkoutLog[]): number {
  if (!workoutLogs || workoutLogs.length === 0) {
    return 5; // Default middle value
  }

  // Extract soreness ratings if available
  const sorenessRatings = workoutLogs
    .filter(log => log.userFeedback && log.userFeedback.soreness !== undefined)
    .map(log => log.userFeedback!.soreness!);

  if (sorenessRatings.length > 0) {
    // Return average of user-reported soreness
    return sorenessRatings.reduce((sum, val) => sum + val, 0) / sorenessRatings.length;
  }

  // If no explicit ratings, estimate based on other factors

  // Check for volume increases (can indicate potential soreness)
  const volumeIncreases = [];

  for (let i = 1; i < workoutLogs.length; i++) {
    const currentLog = workoutLogs[i];
    const previousLog = workoutLogs[i - 1];

    if (!currentLog.totalVolume || !previousLog.totalVolume) continue;

    const volumeChange = (currentLog.totalVolume - previousLog.totalVolume) / previousLog.totalVolume;
    if (volumeChange > 0) {
      volumeIncreases.push(volumeChange);
    }
  }

  const avgVolumeIncrease = volumeIncreases.length > 0
    ? volumeIncreases.reduce((sum, val) => sum + val, 0) / volumeIncreases.length
    : 0;

  // Estimate soreness level (scale 1-10)
  // Higher volume increases and higher intensity correlate with more soreness
  const estimatedSoreness = 5 + (avgVolumeIncrease * 10);

  return Math.min(10, Math.max(1, estimatedSoreness));
}

/**
 * Calculate readiness score based on various metrics
 */
function calculateReadinessScore(
  fatigueScore: number,
  performanceDecline: number,
  recoveryCapacity: number,
  motivationLevel: number,
  sleepQuality: number,
  soreness: number
): number {
  // Convert fatigue to readiness (10 = no fatigue, 1 = max fatigue)
  const fatigueReadiness = 11 - fatigueScore;

  // Convert performance decline to readiness (0% decline = 10, 20%+ decline = 1)
  const performanceReadiness = Math.max(1, 10 - (performanceDecline / 2));

  // Recovery capacity is already on 1-10 scale

  // Motivation is already on 1-10 scale

  // Sleep quality is already on 1-10 scale

  // Convert soreness to readiness (1 = max soreness, 10 = no soreness)
  const sorenessReadiness = 11 - soreness;

  // Calculate weighted average
  return (
    (fatigueReadiness * 0.25) +
    (performanceReadiness * 0.2) +
    (recoveryCapacity * 0.15) +
    (motivationLevel * 0.15) +
    (sleepQuality * 0.15) +
    (sorenessReadiness * 0.1)
  );
}

/**
 * Calculate confidence in deload recommendation
 */
function calculateConfidence(
  fatigueScore: number,
  performanceDecline: number,
  recoveryCapacity: number,
  weeksSinceLastDeload: number,
  deloadFrequency: number
): number {
  // Base confidence on data quality
  let confidence = 50; // Start at 50%

  // Adjust based on fatigue score
  if (fatigueScore >= 8) {
    confidence += 20; // High fatigue is a strong indicator
  } else if (fatigueScore >= 6) {
    confidence += 10;
  }

  // Adjust based on performance decline
  if (performanceDecline >= 15) {
    confidence += 20; // Significant performance decline is a strong indicator
  } else if (performanceDecline >= 8) {
    confidence += 10;
  }

  // Adjust based on recovery capacity
  if (recoveryCapacity <= 3) {
    confidence += 15; // Poor recovery capacity is a good indicator
  } else if (recoveryCapacity <= 5) {
    confidence += 5;
  }

  // Adjust based on time since last deload
  if (weeksSinceLastDeload >= deloadFrequency * 1.5) {
    confidence += 15; // Well past scheduled deload
  } else if (weeksSinceLastDeload >= deloadFrequency) {
    confidence += 10; // At or past scheduled deload
  } else if (weeksSinceLastDeload >= deloadFrequency * 0.8) {
    confidence += 5; // Approaching scheduled deload
  }

  return Math.min(100, Math.max(0, confidence));
}

/**
 * Determine the most appropriate deload type based on metrics
 */
function determineDeloadType(
  fatigueScore: number,
  performanceDecline: number,
  technicalProficiency: number,
  trainingLevel: TrainingLevel,
  goal: TrainingGoal
): DeloadType {
  // For beginners, volume deload is safest
  if (trainingLevel === 'beginner') {
    return 'volume';
  }

  // For advanced/elite with strength/power goals and high technical proficiency,
  // intensity deload may be more appropriate
  if ((trainingLevel === 'advanced' || trainingLevel === 'elite') &&
      (goal === 'strength' || goal === 'power') &&
      technicalProficiency >= 7) {
    return 'intensity';
  }

  // For high fatigue with decent technical proficiency, frequency deload
  if (fatigueScore >= 8 && technicalProficiency >= 6) {
    return 'frequency';
  }

  // For significant performance decline, combined deload
  if (performanceDecline >= 15) {
    return 'combined';
  }

  // For poor technical proficiency, active recovery
  if (technicalProficiency <= 4) {
    return 'active_recovery';
  }

  // Default to volume deload as it's generally most effective
  return 'volume';
}

/**
 * Generate reasons for deload recommendation
 */
function generateDeloadReasons(
  fatigueScore: number,
  performanceDecline: number,
  recoveryCapacity: number,
  technicalProficiency: number,
  motivationLevel: number,
  sleepQuality: number,
  soreness: number,
  weeksSinceLastDeload: number,
  deloadFrequency: number
): string[] {
  const reasons: string[] = [];

  // Add reasons based on metrics
  if (fatigueScore >= 8) {
    reasons.push(`High fatigue level (${fatigueScore.toFixed(1)}/10) indicating accumulated systemic fatigue.`);
  } else if (fatigueScore >= 6) {
    reasons.push(`Moderate fatigue level (${fatigueScore.toFixed(1)}/10) suggesting need for recovery.`);
  }

  if (performanceDecline >= 15) {
    reasons.push(`Significant performance decline (${performanceDecline.toFixed(1)}%) across exercises.`);
  } else if (performanceDecline >= 8) {
    reasons.push(`Noticeable performance decline (${performanceDecline.toFixed(1)}%) indicating potential fatigue.`);
  }

  if (recoveryCapacity <= 4) {
    reasons.push(`Reduced recovery capacity (${recoveryCapacity.toFixed(1)}/10) suggesting accumulated fatigue.`);
  }

  if (technicalProficiency <= 5) {
    reasons.push(`Declining technical proficiency (${technicalProficiency.toFixed(1)}/10) indicating need for technique reset.`);
  }

  if (motivationLevel <= 5) {
    reasons.push(`Decreased motivation (${motivationLevel.toFixed(1)}/10) suggesting psychological fatigue.`);
  }

  if (sleepQuality <= 5) {
    reasons.push(`Poor sleep quality (${sleepQuality.toFixed(1)}/10) affecting recovery.`);
  }

  if (soreness >= 7) {
    reasons.push(`High muscle soreness (${soreness.toFixed(1)}/10) indicating incomplete recovery.`);
  }

  if (weeksSinceLastDeload >= deloadFrequency) {
    reasons.push(`${weeksSinceLastDeload} weeks since last deload (scheduled every ${deloadFrequency} weeks).`);
  }

  // Add default reason if none were added
  if (reasons.length === 0) {
    reasons.push(`Preventative deload recommended based on training schedule.`);
  }

  return reasons;
}
