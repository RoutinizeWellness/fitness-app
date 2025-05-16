/**
 * Sistema de Gestión de Fatiga y Algoritmo de Adaptación
 * Basado en principios científicos de gestión de fatiga y recuperación
 * Inspirado en documentos como "Planificación de entrenamiento HsP", "Mesociclo Hazlo tú mismo BASQUELIFTS",
 * "Aesthetic Strength INTERMEDIOS", entre otros.
 */

import { 
  TrainingLevel, 
  TrainingGoal, 
  FatigueManagement,
  DeloadStrategy
} from "./advanced-periodization";

// Interfaces para la gestión de fatiga
export interface FatigueMarkers {
  rpeIncrease: number; // Incremento en RPE para el mismo peso (0-10)
  strengthDecrease: number; // Porcentaje de disminución de fuerza (0-100)
  soreness: number; // Escala 1-10
  sleepQuality: number; // Escala 1-10
  motivation: number; // Escala 1-10
  restingHeartRate: number; // Incremento en BPM respecto a la línea base
  moodScore: number; // Escala 1-10
  stressScore: number; // Escala 1-10
  appetiteChanges: number; // Escala -5 a 5 (negativo = disminución, positivo = aumento)
  technicalProficiency: number; // Escala 1-10
}

export interface RecoveryMarkers {
  sleepHours: number;
  sleepQuality: number; // Escala 1-10
  nutrition: number; // Escala 1-10
  hydration: number; // Escala 1-10
  stressManagement: number; // Escala 1-10
  activeRecovery: boolean;
  mobilityWork: boolean;
  supplementation: boolean;
  massageTechniques: boolean;
  coldTherapy: boolean;
  heatTherapy: boolean;
}

export interface TrainingResponse {
  muscleGrowth: number; // Escala 1-10
  strengthGain: number; // Escala 1-10
  technicalImprovement: number; // Escala 1-10
  workCapacity: number; // Escala 1-10
  motivation: number; // Escala 1-10
  enjoyment: number; // Escala 1-10
  adherence: number; // Porcentaje (0-100)
}

export interface FatigueAlgorithmConfig {
  fatigueThreshold: number; // Umbral para recomendar deload (0-10)
  recoveryWeight: number; // Peso de los factores de recuperación (0-1)
  trainingResponseWeight: number; // Peso de la respuesta al entrenamiento (0-1)
  individualTolerance: number; // Factor de tolerancia individual (0.5-1.5)
  autoregulationEnabled: boolean;
}

// Valores de referencia para la gestión de fatiga según nivel y objetivo
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

// Algoritmo para calcular el nivel de fatiga acumulada
export function calculateFatigueScore(
  markers: FatigueMarkers,
  level: TrainingLevel,
  goal: TrainingGoal,
  individualTolerance: number = 1.0
): number {
  // Pesos de los diferentes marcadores según objetivo
  const weights = getMarkerWeights(goal);
  
  // Calcular puntuación ponderada
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
  
  // Ajustar por nivel de entrenamiento (los avanzados toleran más fatiga)
  const levelMultiplier = getLevelMultiplier(level);
  
  // Ajustar por tolerancia individual
  return (score / 10) * levelMultiplier * individualTolerance;
}

// Obtener pesos de los marcadores según objetivo
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

// Obtener multiplicador según nivel de entrenamiento
function getLevelMultiplier(level: TrainingLevel): number {
  switch (level) {
    case 'beginner': return 1.2; // Los principiantes acumulan fatiga más rápido
    case 'intermediate': return 1.0;
    case 'advanced': return 0.9; // Los avanzados toleran más fatiga
    case 'elite': return 0.8; // Los élite toleran aún más fatiga
    default: return 1.0;
  }
}

// Calcular el impacto de la recuperación
export function calculateRecoveryScore(markers: RecoveryMarkers): number {
  let score = 0;
  
  // Factores principales
  score += (markers.sleepHours >= 7) ? markers.sleepHours * 0.5 : markers.sleepHours * 0.3;
  score += markers.sleepQuality * 1.0;
  score += markers.nutrition * 1.0;
  score += markers.hydration * 0.8;
  score += markers.stressManagement * 0.8;
  
  // Factores secundarios
  if (markers.activeRecovery) score += 1.0;
  if (markers.mobilityWork) score += 0.8;
  if (markers.supplementation) score += 0.5;
  if (markers.massageTechniques) score += 0.7;
  if (markers.coldTherapy) score += 0.6;
  if (markers.heatTherapy) score += 0.6;
  
  // Normalizar a escala 1-10
  return Math.min(10, score / 5);
}

// Determinar si se necesita una descarga
export function needsDeload(
  fatigueScore: number,
  recoveryScore: number,
  trainingResponse: TrainingResponse,
  config: FatigueAlgorithmConfig,
  consecutiveHighFatigue: number
): boolean {
  // Calcular puntuación combinada
  const combinedScore = 
    fatigueScore - 
    (recoveryScore * config.recoveryWeight) - 
    ((trainingResponse.strengthGain + trainingResponse.muscleGrowth) / 2 * config.trainingResponseWeight);
  
  // Verificar si supera el umbral
  const exceedsThreshold = combinedScore > config.fatigueThreshold;
  
  // Verificar fatiga acumulada persistente
  const persistentFatigue = consecutiveHighFatigue >= 3;
  
  // Verificar señales de sobreentrenamiento
  const overtrainingRisk = 
    trainingResponse.motivation < 5 && 
    trainingResponse.strengthGain < 3 && 
    fatigueScore > config.fatigueThreshold * 0.8;
  
  return exceedsThreshold || persistentFatigue || overtrainingRisk;
}

// Generar recomendaciones de gestión de fatiga
export function generateFatigueManagementRecommendations(
  fatigueScore: number,
  recoveryScore: number,
  level: TrainingLevel,
  goal: TrainingGoal
): FatigueManagement {
  // Determinar nivel de fatiga actual
  const currentFatigue = fatigueScore;
  
  // Determinar capacidad de recuperación
  const recoveryCapacity = recoveryScore;
  
  // Calcular decremento de rendimiento estimado
  const performanceDecrement = Math.min(100, fatigueScore * 10);
  
  // Determinar disposición para entrenar
  const readinessToTrain = Math.max(1, 10 - fatigueScore);
  
  // Determinar acción recomendada
  let recommendedAction: 'proceed' | 'reduce_volume' | 'reduce_intensity' | 'active_recovery' | 'rest';
  
  if (fatigueScore < FATIGUE_THRESHOLDS[level][goal] * 0.6) {
    recommendedAction = 'proceed';
  } else if (fatigueScore < FATIGUE_THRESHOLDS[level][goal] * 0.8) {
    recommendedAction = 'reduce_volume';
  } else if (fatigueScore < FATIGUE_THRESHOLDS[level][goal]) {
    recommendedAction = 'reduce_intensity';
  } else if (fatigueScore < FATIGUE_THRESHOLDS[level][goal] * 1.2) {
    recommendedAction = 'active_recovery';
  } else {
    recommendedAction = 'rest';
  }
  
  // Crear objeto de gestión de fatiga
  return {
    currentFatigue,
    recoveryCapacity,
    sleepQuality: recoveryScore, // Simplificación
    stressLevel: 10 - recoveryScore, // Simplificación
    muscleSoreness: {}, // Se llenaría con datos específicos
    performanceDecrement,
    readinessToTrain,
    recommendedAction
  };
}

// Generar estrategia de deload personalizada
export function generatePersonalizedDeload(
  fatigueScore: number,
  recoveryScore: number,
  level: TrainingLevel,
  goal: TrainingGoal,
  baseStrategy: DeloadStrategy
): DeloadStrategy {
  // Clonar la estrategia base
  const personalizedStrategy: DeloadStrategy = { ...baseStrategy };
  
  // Ajustar según nivel de fatiga
  if (fatigueScore > FATIGUE_THRESHOLDS[level][goal] * 1.2) {
    // Fatiga muy alta - deload más agresivo
    personalizedStrategy.volumeReduction += 10;
    personalizedStrategy.intensityReduction += 5;
    personalizedStrategy.frequencyReduction += 1;
    personalizedStrategy.duration += 2;
  } else if (fatigueScore < FATIGUE_THRESHOLDS[level][goal] * 0.8) {
    // Fatiga baja - deload más suave
    personalizedStrategy.volumeReduction -= 10;
    personalizedStrategy.intensityReduction -= 5;
    personalizedStrategy.duration -= 2;
  }
  
  // Ajustar según capacidad de recuperación
  if (recoveryScore < 5) {
    // Mala recuperación - deload más largo
    personalizedStrategy.duration += 2;
  } else if (recoveryScore > 8) {
    // Buena recuperación - deload más corto
    personalizedStrategy.duration -= 1;
  }
  
  // Asegurar valores válidos
  personalizedStrategy.volumeReduction = Math.max(0, Math.min(100, personalizedStrategy.volumeReduction));
  personalizedStrategy.intensityReduction = Math.max(0, Math.min(100, personalizedStrategy.intensityReduction));
  personalizedStrategy.frequencyReduction = Math.max(0, personalizedStrategy.frequencyReduction);
  personalizedStrategy.duration = Math.max(3, personalizedStrategy.duration);
  
  // Añadir notas
  personalizedStrategy.notes = `Deload personalizado basado en nivel de fatiga (${fatigueScore.toFixed(1)}/10) y recuperación (${recoveryScore.toFixed(1)}/10).`;
  
  return personalizedStrategy;
}
