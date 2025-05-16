/**
 * Advanced Weight Calculation Algorithm
 * 
 * This algorithm calculates ideal weights based on:
 * - Target RIR (Repetitions in Reserve)
 * - Previous performance
 * - Accumulated fatigue
 * - Exercise type
 * - Training phase
 * 
 * Based on concepts from Hipertrofia Maxima Bazman Science and Pure Bodybuilding
 */

import { WorkoutLog, ExerciseLog, ExerciseSet } from "@/lib/types/training";

// Types for the algorithm
export interface FatigueData {
  globalFatigue: number; // 0-100
  muscleGroupFatigue: {
    [key: string]: number; // 0-100 for each muscle group
  };
  recoveryRate: number; // % per day
}

export interface PerformanceData {
  exerciseId: string;
  exerciseName: string;
  lastWeight: number;
  lastReps: number;
  lastRir: number;
  estimatedOneRepMax: number;
  progressionTrend: 'increasing' | 'plateau' | 'decreasing';
  bestWeight: number;
  bestReps: number;
  bestOneRepMax: number;
  dateOfBest: string;
}

export interface WeightCalculationParams {
  exerciseId: string;
  targetReps: number;
  targetRir: number;
  exerciseType: 'compound' | 'isolation';
  muscleGroups: string[];
  previousLogs?: ExerciseLog[];
  fatigueData?: FatigueData;
  trainingPhase?: 'volume' | 'intensity' | 'deload' | 'strength';
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  isWarmupSet?: boolean;
  isBackoffSet?: boolean;
  isDropSet?: boolean;
}

export interface WeightRecommendation {
  recommendedWeight: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  explanation: string;
  adjustmentFactors: {
    [key: string]: {
      factor: number;
      explanation: string;
    }
  };
  alternativeWeights: {
    conservative: number;
    aggressive: number;
  };
}

// Constants for the algorithm
const RIR_PERCENTAGE_MAP = {
  0: 1.00, // 0 RIR = 100% of e1RM for that rep range
  1: 0.97, // 1 RIR = 97% of e1RM for that rep range
  2: 0.94, // 2 RIR = 94% of e1RM for that rep range
  3: 0.91, // 3 RIR = 91% of e1RM for that rep range
  4: 0.88, // 4 RIR = 88% of e1RM for that rep range
};

const REP_PERCENTAGE_MAP = {
  1: 1.00,   // 1 rep = 100% of 1RM
  2: 0.97,   // 2 reps = 97% of 1RM
  3: 0.94,   // 3 reps = 94% of 1RM
  4: 0.92,   // 4 reps = 92% of 1RM
  5: 0.89,   // 5 reps = 89% of 1RM
  6: 0.86,   // 6 reps = 86% of 1RM
  7: 0.83,   // 7 reps = 83% of 1RM
  8: 0.81,   // 8 reps = 81% of 1RM
  9: 0.78,   // 9 reps = 78% of 1RM
  10: 0.75,  // 10 reps = 75% of 1RM
  11: 0.73,  // 11 reps = 73% of 1RM
  12: 0.71,  // 12 reps = 71% of 1RM
  15: 0.65,  // 15 reps = 65% of 1RM
  20: 0.60,  // 20 reps = 60% of 1RM
};

// Helper function to estimate 1RM based on weight and reps
export const estimateOneRepMax = (weight: number, reps: number): number => {
  if (reps <= 1) return weight;
  
  // Brzycki Formula
  return weight / (1.0278 - 0.0278 * reps);
};

// Helper function to get percentage for a given rep count
export const getRepPercentage = (reps: number): number => {
  if (reps <= 1) return 1;
  if (reps >= 20) return 0.6;
  
  // Find exact match
  if (REP_PERCENTAGE_MAP[reps]) {
    return REP_PERCENTAGE_MAP[reps];
  }
  
  // Find closest values and interpolate
  const repCounts = Object.keys(REP_PERCENTAGE_MAP).map(Number).sort((a, b) => a - b);
  
  let lowerRep = 1;
  let upperRep = 20;
  
  for (let i = 0; i < repCounts.length; i++) {
    if (repCounts[i] <= reps && repCounts[i] > lowerRep) {
      lowerRep = repCounts[i];
    }
    if (repCounts[i] >= reps && repCounts[i] < upperRep) {
      upperRep = repCounts[i];
    }
  }
  
  const lowerPercentage = REP_PERCENTAGE_MAP[lowerRep];
  const upperPercentage = REP_PERCENTAGE_MAP[upperRep];
  
  // Linear interpolation
  return lowerPercentage + (upperPercentage - lowerPercentage) * (reps - lowerRep) / (upperRep - lowerRep);
};

// Helper function to get percentage for a given RIR
export const getRirPercentage = (rir: number): number => {
  if (rir <= 0) return 1;
  if (rir >= 4) return 0.88;
  
  // Find exact match
  if (RIR_PERCENTAGE_MAP[rir]) {
    return RIR_PERCENTAGE_MAP[rir];
  }
  
  // Find closest values and interpolate
  const rirValues = Object.keys(RIR_PERCENTAGE_MAP).map(Number).sort((a, b) => a - b);
  
  let lowerRir = 0;
  let upperRir = 4;
  
  for (let i = 0; i < rirValues.length; i++) {
    if (rirValues[i] <= rir && rirValues[i] > lowerRir) {
      lowerRir = rirValues[i];
    }
    if (rirValues[i] >= rir && rirValues[i] < upperRir) {
      upperRir = rirValues[i];
    }
  }
  
  const lowerPercentage = RIR_PERCENTAGE_MAP[lowerRir];
  const upperPercentage = RIR_PERCENTAGE_MAP[upperRir];
  
  // Linear interpolation
  return lowerPercentage + (upperPercentage - lowerPercentage) * (rir - lowerRir) / (upperRir - lowerRir);
};

// Helper function to analyze performance data from previous logs
export const analyzePerformanceData = (
  exerciseId: string,
  previousLogs: ExerciseLog[]
): PerformanceData | null => {
  if (!previousLogs || previousLogs.length === 0) {
    return null;
  }
  
  // Filter logs for the specific exercise
  const exerciseLogs = previousLogs.filter(log => log.exerciseId === exerciseId);
  
  if (exerciseLogs.length === 0) {
    return null;
  }
  
  // Sort logs by date (newest first)
  exerciseLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const lastLog = exerciseLogs[0];
  const exerciseName = lastLog.exerciseName || 'Unknown Exercise';
  
  // Calculate last performance metrics
  const lastWeight = lastLog.weight || 0;
  const lastReps = lastLog.completedReps || 0;
  const lastRir = lastLog.rir || 0;
  
  // Calculate estimated 1RM
  const lastOneRepMax = estimateOneRepMax(lastWeight, lastReps);
  
  // Find best performance
  let bestWeight = 0;
  let bestReps = 0;
  let bestOneRepMax = 0;
  let dateOfBest = '';
  
  exerciseLogs.forEach(log => {
    const weight = log.weight || 0;
    const reps = log.completedReps || 0;
    const oneRepMax = estimateOneRepMax(weight, reps);
    
    if (oneRepMax > bestOneRepMax) {
      bestOneRepMax = oneRepMax;
      bestWeight = weight;
      bestReps = reps;
      dateOfBest = log.date;
    }
  });
  
  // Determine progression trend
  let progressionTrend: 'increasing' | 'plateau' | 'decreasing' = 'plateau';
  
  if (exerciseLogs.length >= 3) {
    const recentLogs = exerciseLogs.slice(0, 3);
    const oneRepMaxes = recentLogs.map(log => 
      estimateOneRepMax(log.weight || 0, log.completedReps || 0)
    );
    
    if (oneRepMaxes[0] > oneRepMaxes[1] && oneRepMaxes[1] >= oneRepMaxes[2]) {
      progressionTrend = 'increasing';
    } else if (oneRepMaxes[0] < oneRepMaxes[1]) {
      progressionTrend = 'decreasing';
    }
  }
  
  return {
    exerciseId,
    exerciseName,
    lastWeight,
    lastReps,
    lastRir,
    estimatedOneRepMax: lastOneRepMax,
    progressionTrend,
    bestWeight,
    bestReps,
    bestOneRepMax,
    dateOfBest
  };
};

// Main function to calculate ideal weight
export const calculateIdealWeight = (params: WeightCalculationParams): WeightRecommendation => {
  const {
    exerciseId,
    targetReps,
    targetRir,
    exerciseType,
    muscleGroups,
    previousLogs = [],
    fatigueData,
    trainingPhase = 'volume',
    userLevel = 'intermediate',
    isWarmupSet = false,
    isBackoffSet = false,
    isDropSet = false
  } = params;
  
  // Initialize adjustment factors
  const adjustmentFactors: {
    [key: string]: {
      factor: number;
      explanation: string;
    }
  } = {};
  
  // Base weight calculation
  let baseWeight = 0;
  let confidenceLevel: 'high' | 'medium' | 'low' = 'medium';
  let explanation = '';
  
  // Analyze performance data
  const performanceData = analyzePerformanceData(exerciseId, previousLogs);
  
  if (performanceData) {
    // We have previous data for this exercise
    confidenceLevel = 'high';
    
    // Calculate target weight based on estimated 1RM
    const targetRepPercentage = getRepPercentage(targetReps);
    const targetRirPercentage = getRirPercentage(targetRir);
    
    // Calculate weight for target reps and RIR
    baseWeight = (performanceData.estimatedOneRepMax * targetRepPercentage * targetRirPercentage);
    
    explanation = `Based on your previous performance (${performanceData.lastWeight}kg x ${performanceData.lastReps} reps at RIR ${performanceData.lastRir}), your estimated 1RM is ${Math.round(performanceData.estimatedOneRepMax)}kg.`;
    
    // Adjust based on progression trend
    if (performanceData.progressionTrend === 'increasing') {
      adjustmentFactors['progression'] = {
        factor: 1.025,
        explanation: 'Your strength is increasing, adding 2.5% to encourage progression.'
      };
    } else if (performanceData.progressionTrend === 'decreasing') {
      adjustmentFactors['progression'] = {
        factor: 0.95,
        explanation: 'Your performance has decreased recently, reducing weight by 5% to help recovery.'
      };
    } else {
      adjustmentFactors['progression'] = {
        factor: 1,
        explanation: 'Your strength is stable.'
      };
    }
  } else {
    // No previous data, use a conservative estimate
    confidenceLevel = 'low';
    
    // Default weights based on exercise type and user level
    if (exerciseType === 'compound') {
      if (userLevel === 'beginner') baseWeight = 40;
      else if (userLevel === 'intermediate') baseWeight = 60;
      else baseWeight = 80;
    } else {
      if (userLevel === 'beginner') baseWeight = 10;
      else if (userLevel === 'intermediate') baseWeight = 15;
      else baseWeight = 20;
    }
    
    explanation = `No previous data found for this exercise. Using a conservative estimate based on your experience level.`;
    
    adjustmentFactors['noData'] = {
      factor: 0.9,
      explanation: 'Using a conservative weight due to lack of previous data.'
    };
  }
  
  // Adjust for fatigue if data is available
  if (fatigueData) {
    const relevantMuscleGroups = muscleGroups.filter(group => 
      fatigueData.muscleGroupFatigue[group] !== undefined
    );
    
    if (relevantMuscleGroups.length > 0) {
      // Calculate average fatigue for relevant muscle groups
      const avgFatigue = relevantMuscleGroups.reduce(
        (sum, group) => sum + fatigueData.muscleGroupFatigue[group], 0
      ) / relevantMuscleGroups.length;
      
      // Adjust weight based on fatigue level
      let fatigueFactor = 1;
      
      if (avgFatigue > 80) {
        fatigueFactor = 0.9; // High fatigue: reduce weight by 10%
      } else if (avgFatigue > 60) {
        fatigueFactor = 0.95; // Moderate fatigue: reduce weight by 5%
      } else if (avgFatigue < 30) {
        fatigueFactor = 1.05; // Low fatigue: increase weight by 5%
      }
      
      adjustmentFactors['fatigue'] = {
        factor: fatigueFactor,
        explanation: `Muscle fatigue level: ${Math.round(avgFatigue)}%. ${
          fatigueFactor < 1 
            ? `Reducing weight by ${Math.round((1 - fatigueFactor) * 100)}% to account for fatigue.` 
            : fatigueFactor > 1 
              ? `Increasing weight by ${Math.round((fatigueFactor - 1) * 100)}% due to low fatigue.`
              : 'Fatigue is at an optimal level.'
        }`
      };
    }
  }
  
  // Adjust for training phase
  let phaseFactor = 1;
  
  switch (trainingPhase) {
    case 'intensity':
      phaseFactor = 1.05; // Intensity phase: increase weight by 5%
      break;
    case 'deload':
      phaseFactor = 0.6; // Deload phase: reduce weight by 40%
      break;
    case 'strength':
      phaseFactor = 1.1; // Strength phase: increase weight by 10%
      break;
    default: // volume phase
      phaseFactor = 1;
  }
  
  adjustmentFactors['trainingPhase'] = {
    factor: phaseFactor,
    explanation: `Training phase: ${trainingPhase}. ${
      phaseFactor !== 1 
        ? `${phaseFactor > 1 ? 'Increasing' : 'Reducing'} weight by ${Math.abs(Math.round((phaseFactor - 1) * 100))}%.`
        : 'No adjustment needed for volume phase.'
    }`
  };
  
  // Adjust for special set types
  if (isWarmupSet) {
    adjustmentFactors['warmup'] = {
      factor: 0.6,
      explanation: 'Warm-up set: reducing weight by 40%.'
    };
  }
  
  if (isBackoffSet) {
    adjustmentFactors['backoff'] = {
      factor: 0.8,
      explanation: 'Back-off set: reducing weight by 20%.'
    };
  }
  
  if (isDropSet) {
    adjustmentFactors['dropSet'] = {
      factor: 0.7,
      explanation: 'Drop set: reducing weight by 30%.'
    };
  }
  
  // Apply all adjustment factors
  let finalWeight = baseWeight;
  
  Object.values(adjustmentFactors).forEach(adjustment => {
    finalWeight *= adjustment.factor;
  });
  
  // Round to nearest 2.5kg for better practical application
  const recommendedWeight = Math.round(finalWeight / 2.5) * 2.5;
  
  // Calculate alternative weights
  const conservativeWeight = Math.round((recommendedWeight * 0.9) / 2.5) * 2.5;
  const aggressiveWeight = Math.round((recommendedWeight * 1.1) / 2.5) * 2.5;
  
  return {
    recommendedWeight,
    confidenceLevel,
    explanation,
    adjustmentFactors,
    alternativeWeights: {
      conservative: conservativeWeight,
      aggressive: aggressiveWeight
    }
  };
};
