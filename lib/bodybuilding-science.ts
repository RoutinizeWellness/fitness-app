/**
 * Bodybuilding Science - Utility functions for advanced workout programming
 * Based on scientific principles from Hypertrophy Handbook, Pure Bodybuilding,
 * Jeff Nippard's programs, and Spanish bodybuilding resources.
 *
 * This file contains comprehensive functions for:
 * - Calculating optimal volume based on training experience
 * - Determining rest periods based on exercise type and goal
 * - Implementation of deload strategies
 * - Progressive overload mechanisms
 * - Advanced training techniques
 * - Periodization models
 * - Exercise selection and alternatives
 */

import { Exercise, WorkoutRoutine, WorkoutDay } from "@/lib/types/training";
import { v4 as uuidv4 } from "uuid";

// Tipos para la configuración de entrenamiento avanzado
export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingGoal = 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'weight_loss';
export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'full_body';
export type ExerciseType = 'compound' | 'isolation' | 'accessory';
export type TrainingPhase = 'accumulation' | 'intensification' | 'deload' | 'peak';
export type TrainingSplit = 'ppl' | 'upper_lower' | 'full_body' | 'body_part' | 'push_pull' | 'custom';

// Interfaz para configuración de volumen por grupo muscular
export interface MuscleGroupVolume {
  muscleGroup: MuscleGroup;
  setsPerWeek: {
    min: number;
    optimal: number;
    max: number;
  };
  frequency: {
    min: number;
    optimal: number;
    max: number;
  };
}

// Interfaz para configuración de descanso entre series
export interface RestPeriodConfig {
  exerciseType: ExerciseType;
  goal: TrainingGoal;
  restSeconds: number;
}

// Interfaz para configuración de deload
export interface DeloadStrategy {
  type: 'volume' | 'intensity' | 'both' | 'frequency';
  volumeReduction: number; // Porcentaje de reducción (0-100)
  intensityReduction: number; // Porcentaje de reducción (0-100)
  frequencyReduction: number; // Días reducidos
  duration: number; // Duración en días
}

// Interfaz para configuración de técnicas avanzadas
export interface AdvancedTechnique {
  name: string;
  description: string;
  applicableGoals: TrainingGoal[];
  recommendedExerciseTypes: ExerciseType[];
  fatigueImpact: number; // 1-10 escala
  recoveryRequirement: number; // 1-10 escala
}

// Volumen óptimo de entrenamiento por grupo muscular y nivel
// Basado en investigaciones científicas sobre hipertrofia
export const OPTIMAL_VOLUME_BY_LEVEL: Record<TrainingLevel, MuscleGroupVolume[]> = {
  beginner: [
    {
      muscleGroup: 'chest',
      setsPerWeek: { min: 8, optimal: 10, max: 12 },
      frequency: { min: 1, optimal: 2, max: 3 }
    },
    {
      muscleGroup: 'back',
      setsPerWeek: { min: 8, optimal: 10, max: 12 },
      frequency: { min: 1, optimal: 2, max: 3 }
    },
    {
      muscleGroup: 'legs',
      setsPerWeek: { min: 8, optimal: 10, max: 12 },
      frequency: { min: 1, optimal: 2, max: 3 }
    },
    {
      muscleGroup: 'shoulders',
      setsPerWeek: { min: 6, optimal: 8, max: 10 },
      frequency: { min: 1, optimal: 2, max: 3 }
    },
    {
      muscleGroup: 'arms',
      setsPerWeek: { min: 6, optimal: 8, max: 10 },
      frequency: { min: 1, optimal: 2, max: 3 }
    },
    {
      muscleGroup: 'core',
      setsPerWeek: { min: 4, optimal: 6, max: 8 },
      frequency: { min: 1, optimal: 2, max: 3 }
    }
  ],
  intermediate: [
    {
      muscleGroup: 'chest',
      setsPerWeek: { min: 10, optimal: 14, max: 18 },
      frequency: { min: 2, optimal: 2, max: 3 }
    },
    {
      muscleGroup: 'back',
      setsPerWeek: { min: 10, optimal: 14, max: 18 },
      frequency: { min: 2, optimal: 2, max: 3 }
    },
    {
      muscleGroup: 'legs',
      setsPerWeek: { min: 12, optimal: 16, max: 20 },
      frequency: { min: 2, optimal: 2, max: 3 }
    },
    {
      muscleGroup: 'shoulders',
      setsPerWeek: { min: 8, optimal: 12, max: 16 },
      frequency: { min: 2, optimal: 2, max: 3 }
    },
    {
      muscleGroup: 'arms',
      setsPerWeek: { min: 8, optimal: 12, max: 16 },
      frequency: { min: 2, optimal: 2, max: 3 }
    },
    {
      muscleGroup: 'core',
      setsPerWeek: { min: 6, optimal: 8, max: 12 },
      frequency: { min: 2, optimal: 2, max: 3 }
    }
  ],
  advanced: [
    {
      muscleGroup: 'chest',
      setsPerWeek: { min: 12, optimal: 18, max: 22 },
      frequency: { min: 2, optimal: 3, max: 4 }
    },
    {
      muscleGroup: 'back',
      setsPerWeek: { min: 14, optimal: 18, max: 22 },
      frequency: { min: 2, optimal: 3, max: 4 }
    },
    {
      muscleGroup: 'legs',
      setsPerWeek: { min: 14, optimal: 18, max: 22 },
      frequency: { min: 2, optimal: 3, max: 4 }
    },
    {
      muscleGroup: 'shoulders',
      setsPerWeek: { min: 10, optimal: 14, max: 18 },
      frequency: { min: 2, optimal: 3, max: 4 }
    },
    {
      muscleGroup: 'arms',
      setsPerWeek: { min: 10, optimal: 14, max: 18 },
      frequency: { min: 2, optimal: 3, max: 4 }
    },
    {
      muscleGroup: 'core',
      setsPerWeek: { min: 8, optimal: 10, max: 14 },
      frequency: { min: 2, optimal: 3, max: 4 }
    }
  ]
};

// Configuración de descanso entre series según tipo de ejercicio y objetivo
export const REST_PERIODS: RestPeriodConfig[] = [
  { exerciseType: 'compound', goal: 'strength', restSeconds: 180 },
  { exerciseType: 'compound', goal: 'hypertrophy', restSeconds: 120 },
  { exerciseType: 'compound', goal: 'endurance', restSeconds: 60 },
  { exerciseType: 'compound', goal: 'power', restSeconds: 180 },
  { exerciseType: 'compound', goal: 'weight_loss', restSeconds: 45 },

  { exerciseType: 'isolation', goal: 'strength', restSeconds: 120 },
  { exerciseType: 'isolation', goal: 'hypertrophy', restSeconds: 90 },
  { exerciseType: 'isolation', goal: 'endurance', restSeconds: 45 },
  { exerciseType: 'isolation', goal: 'power', restSeconds: 120 },
  { exerciseType: 'isolation', goal: 'weight_loss', restSeconds: 30 },

  { exerciseType: 'accessory', goal: 'strength', restSeconds: 90 },
  { exerciseType: 'accessory', goal: 'hypertrophy', restSeconds: 60 },
  { exerciseType: 'accessory', goal: 'endurance', restSeconds: 30 },
  { exerciseType: 'accessory', goal: 'power', restSeconds: 90 },
  { exerciseType: 'accessory', goal: 'weight_loss', restSeconds: 20 }
];

// Estrategias de deload
export const DELOAD_STRATEGIES: DeloadStrategy[] = [
  {
    type: 'volume',
    volumeReduction: 40, // Reducir volumen en un 40%
    intensityReduction: 0, // Mantener intensidad
    frequencyReduction: 0, // Mantener frecuencia
    duration: 7 // Una semana
  },
  {
    type: 'intensity',
    volumeReduction: 0, // Mantener volumen
    intensityReduction: 20, // Reducir intensidad en un 20%
    frequencyReduction: 0, // Mantener frecuencia
    duration: 7 // Una semana
  },
  {
    type: 'both',
    volumeReduction: 30, // Reducir volumen en un 30%
    intensityReduction: 15, // Reducir intensidad en un 15%
    frequencyReduction: 0, // Mantener frecuencia
    duration: 7 // Una semana
  },
  {
    type: 'frequency',
    volumeReduction: 0, // Mantener volumen por sesión
    intensityReduction: 0, // Mantener intensidad
    frequencyReduction: 1, // Reducir un día de entrenamiento
    duration: 7 // Una semana
  }
];

// Técnicas avanzadas de entrenamiento
export const ADVANCED_TECHNIQUES: AdvancedTechnique[] = [
  {
    name: 'Drop Sets',
    description: 'Realizar una serie hasta el fallo y luego reducir el peso para continuar inmediatamente',
    applicableGoals: ['hypertrophy', 'endurance'],
    recommendedExerciseTypes: ['isolation', 'accessory'],
    fatigueImpact: 8,
    recoveryRequirement: 7
  },
  {
    name: 'Super Sets',
    description: 'Realizar dos ejercicios consecutivos sin descanso entre ellos',
    applicableGoals: ['hypertrophy', 'endurance', 'weight_loss'],
    recommendedExerciseTypes: ['isolation', 'accessory'],
    fatigueImpact: 6,
    recoveryRequirement: 5
  },
  {
    name: 'Rest-Pause',
    description: 'Realizar una serie hasta el fallo, descansar 10-15 segundos y continuar',
    applicableGoals: ['strength', 'hypertrophy'],
    recommendedExerciseTypes: ['compound', 'isolation'],
    fatigueImpact: 7,
    recoveryRequirement: 6
  },
  {
    name: 'Tempo Training',
    description: 'Manipular la velocidad de las fases concéntrica y excéntrica',
    applicableGoals: ['strength', 'hypertrophy'],
    recommendedExerciseTypes: ['compound', 'isolation'],
    fatigueImpact: 5,
    recoveryRequirement: 4
  },
  {
    name: 'Cluster Sets',
    description: 'Dividir una serie en mini-series con descansos muy cortos',
    applicableGoals: ['strength', 'power'],
    recommendedExerciseTypes: ['compound'],
    fatigueImpact: 6,
    recoveryRequirement: 7
  },
  {
    name: 'Giant Sets',
    description: 'Realizar 3-5 ejercicios consecutivos para el mismo grupo muscular sin descanso',
    applicableGoals: ['hypertrophy', 'endurance', 'weight_loss'],
    recommendedExerciseTypes: ['isolation', 'accessory'],
    fatigueImpact: 9,
    recoveryRequirement: 8
  },
  {
    name: 'Myo-reps',
    description: 'Serie activadora seguida de mini-series con descansos cortos para maximizar la hipertrofia',
    applicableGoals: ['hypertrophy'],
    recommendedExerciseTypes: ['isolation', 'accessory'],
    fatigueImpact: 7,
    recoveryRequirement: 6
  },
  {
    name: 'Pre-fatiga',
    description: 'Realizar un ejercicio de aislamiento antes de un ejercicio compuesto para el mismo grupo muscular',
    applicableGoals: ['hypertrophy'],
    recommendedExerciseTypes: ['isolation', 'compound'],
    fatigueImpact: 7,
    recoveryRequirement: 6
  },
  {
    name: 'Post-fatiga',
    description: 'Realizar un ejercicio de aislamiento después de un ejercicio compuesto para el mismo grupo muscular',
    applicableGoals: ['hypertrophy'],
    recommendedExerciseTypes: ['isolation', 'compound'],
    fatigueImpact: 6,
    recoveryRequirement: 5
  },
  {
    name: 'Series Mecánicas',
    description: 'Cambiar la mecánica del ejercicio durante la serie para atacar diferentes ángulos musculares',
    applicableGoals: ['hypertrophy'],
    recommendedExerciseTypes: ['isolation'],
    fatigueImpact: 7,
    recoveryRequirement: 6
  },
  {
    name: 'Repeticiones Parciales',
    description: 'Realizar repeticiones en un rango de movimiento limitado después de llegar al fallo',
    applicableGoals: ['hypertrophy', 'strength'],
    recommendedExerciseTypes: ['compound', 'isolation'],
    fatigueImpact: 8,
    recoveryRequirement: 7
  },
  {
    name: 'Isometría',
    description: 'Mantener una posición estática durante un tiempo determinado',
    applicableGoals: ['strength', 'hypertrophy'],
    recommendedExerciseTypes: ['compound', 'isolation'],
    fatigueImpact: 6,
    recoveryRequirement: 5
  }
];

/**
 * Calcula el volumen óptimo de entrenamiento para un grupo muscular
 */
export function getOptimalVolume(
  muscleGroup: MuscleGroup,
  level: TrainingLevel,
  goal: TrainingGoal
): { setsPerWeek: number, frequency: number } {
  // Obtener configuración base por nivel
  const volumeConfig = OPTIMAL_VOLUME_BY_LEVEL[level].find(
    config => config.muscleGroup === muscleGroup
  );

  if (!volumeConfig) {
    return { setsPerWeek: 10, frequency: 2 }; // Valores por defecto
  }

  // Ajustar según el objetivo
  let setsMultiplier = 1;
  let frequencyMultiplier = 1;

  switch (goal) {
    case 'strength':
      setsMultiplier = 0.8; // Menos series pero más intensas
      frequencyMultiplier = 0.8; // Menor frecuencia para mejor recuperación
      break;
    case 'hypertrophy':
      setsMultiplier = 1.0; // Volumen óptimo para hipertrofia
      frequencyMultiplier = 1.0;
      break;
    case 'endurance':
      setsMultiplier = 1.2; // Más series con menos peso
      frequencyMultiplier = 1.2; // Mayor frecuencia
      break;
    case 'power':
      setsMultiplier = 0.7; // Menos series pero muy intensas
      frequencyMultiplier = 0.7; // Menor frecuencia para recuperación completa
      break;
    case 'weight_loss':
      setsMultiplier = 1.1; // Más volumen para mayor gasto calórico
      frequencyMultiplier = 1.1; // Mayor frecuencia
      break;
  }

  return {
    setsPerWeek: Math.round(volumeConfig.setsPerWeek.optimal * setsMultiplier),
    frequency: Math.min(
      Math.round(volumeConfig.frequency.optimal * frequencyMultiplier),
      volumeConfig.frequency.max
    )
  };
}

/**
 * Obtiene el tiempo de descanso recomendado entre series
 */
export function getRecommendedRest(
  exerciseType: ExerciseType,
  goal: TrainingGoal
): number {
  const config = REST_PERIODS.find(
    config => config.exerciseType === exerciseType && config.goal === goal
  );

  return config ? config.restSeconds : 60; // 60 segundos por defecto
}

/**
 * Obtiene la estrategia de deload recomendada según el nivel y objetivo
 */
export function getRecommendedDeload(
  level: TrainingLevel,
  goal: TrainingGoal
): DeloadStrategy {
  // Para principiantes, deload de volumen
  if (level === 'beginner') {
    return DELOAD_STRATEGIES.find(strategy => strategy.type === 'volume') || DELOAD_STRATEGIES[0];
  }

  // Para fuerza, deload de intensidad
  if (goal === 'strength' || goal === 'power') {
    return DELOAD_STRATEGIES.find(strategy => strategy.type === 'intensity') || DELOAD_STRATEGIES[1];
  }

  // Para hipertrofia avanzada, deload combinado
  if (level === 'advanced' && goal === 'hypertrophy') {
    return DELOAD_STRATEGIES.find(strategy => strategy.type === 'both') || DELOAD_STRATEGIES[2];
  }

  // Por defecto, deload de volumen
  return DELOAD_STRATEGIES[0];
}

/**
 * Determina si un ejercicio es adecuado para una técnica avanzada
 */
export function isTechniqueApplicable(
  technique: string,
  exerciseType: ExerciseType,
  goal: TrainingGoal
): boolean {
  const techConfig = ADVANCED_TECHNIQUES.find(tech => tech.name === technique);

  if (!techConfig) return false;

  return (
    techConfig.recommendedExerciseTypes.includes(exerciseType) &&
    techConfig.applicableGoals.includes(goal)
  );
}

/**
 * Obtiene las técnicas avanzadas recomendadas para un tipo de ejercicio y objetivo
 */
export function getRecommendedTechniques(
  exerciseType: ExerciseType,
  goal: TrainingGoal
): AdvancedTechnique[] {
  return ADVANCED_TECHNIQUES.filter(technique =>
    technique.recommendedExerciseTypes.includes(exerciseType) &&
    technique.applicableGoals.includes(goal)
  );
}

/**
 * Tipos de variantes de ejercicios
 */
export type ExerciseVariant = {
  name: string;
  description: string;
  targetMuscleEmphasis: string[];
  difficultyModifier: number; // -1 (más fácil) a +1 (más difícil)
  applicableExercises: string[];
};

/**
 * Variantes de ejercicios para diferentes ángulos y énfasis muscular
 */
export const EXERCISE_VARIANTS: ExerciseVariant[] = [
  {
    name: 'Inclinado',
    description: 'Versión inclinada del ejercicio, enfatiza la parte superior del músculo',
    targetMuscleEmphasis: ['upper_chest', 'front_delts'],
    difficultyModifier: 0,
    applicableExercises: ['press_banca', 'press_mancuernas', 'aperturas']
  },
  {
    name: 'Declinado',
    description: 'Versión declinada del ejercicio, enfatiza la parte inferior del músculo',
    targetMuscleEmphasis: ['lower_chest', 'triceps'],
    difficultyModifier: 0,
    applicableExercises: ['press_banca', 'press_mancuernas', 'aperturas']
  },
  {
    name: 'Agarre cerrado',
    description: 'Versión con agarre más estrecho, enfatiza los tríceps',
    targetMuscleEmphasis: ['triceps', 'inner_chest'],
    difficultyModifier: 0.5,
    applicableExercises: ['press_banca', 'dominadas', 'remo']
  },
  {
    name: 'Agarre abierto',
    description: 'Versión con agarre más amplio, enfatiza los dorsales',
    targetMuscleEmphasis: ['lats', 'rear_delts'],
    difficultyModifier: 0.5,
    applicableExercises: ['dominadas', 'remo', 'jalon']
  },
  {
    name: 'Unilateral',
    description: 'Versión con un solo brazo/pierna, mejora el equilibrio y corrige desequilibrios',
    targetMuscleEmphasis: ['stabilizers', 'core'],
    difficultyModifier: 0.5,
    applicableExercises: ['press_mancuernas', 'remo', 'curl', 'extension', 'sentadilla', 'peso_muerto']
  },
  {
    name: 'Barra',
    description: 'Versión con barra, permite usar más peso',
    targetMuscleEmphasis: ['primary_movers'],
    difficultyModifier: 0,
    applicableExercises: ['press', 'remo', 'curl', 'sentadilla', 'peso_muerto']
  },
  {
    name: 'Mancuernas',
    description: 'Versión con mancuernas, mayor rango de movimiento y trabajo independiente',
    targetMuscleEmphasis: ['stabilizers'],
    difficultyModifier: 0.2,
    applicableExercises: ['press', 'remo', 'curl', 'extension', 'elevaciones']
  },
  {
    name: 'Máquina',
    description: 'Versión en máquina, más segura y aislada',
    targetMuscleEmphasis: ['primary_movers'],
    difficultyModifier: -0.5,
    applicableExercises: ['press', 'remo', 'curl', 'extension', 'sentadilla']
  },
  {
    name: 'Cable',
    description: 'Versión con polea, tensión constante durante todo el movimiento',
    targetMuscleEmphasis: ['primary_movers'],
    difficultyModifier: 0,
    applicableExercises: ['press', 'remo', 'curl', 'extension', 'aperturas']
  },
  {
    name: 'Sumo',
    description: 'Versión con postura más amplia, enfatiza aductores e isquiotibiales mediales',
    targetMuscleEmphasis: ['adductors', 'inner_hamstrings', 'glutes'],
    difficultyModifier: 0.2,
    applicableExercises: ['sentadilla', 'peso_muerto']
  },
  {
    name: 'Frontal',
    description: 'Versión frontal, enfatiza cuádriceps y core',
    targetMuscleEmphasis: ['quads', 'core'],
    difficultyModifier: 0.5,
    applicableExercises: ['sentadilla']
  },
  {
    name: 'Rumano',
    description: 'Versión con menor flexión de rodilla, enfatiza isquiotibiales y glúteos',
    targetMuscleEmphasis: ['hamstrings', 'glutes', 'lower_back'],
    difficultyModifier: 0.3,
    applicableExercises: ['peso_muerto']
  }
];

/**
 * Obtiene variantes recomendadas para un ejercicio
 */
export function getExerciseVariants(exerciseName: string): ExerciseVariant[] {
  // Normalizar el nombre del ejercicio para la búsqueda
  const normalizedName = exerciseName.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[áéíóúüñ]/g, c =>
      ({ 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ñ': 'n' }[c] || c)
    );

  // Determinar el tipo base de ejercicio
  let baseExerciseType = '';

  if (normalizedName.includes('press') || normalizedName.includes('bench')) {
    baseExerciseType = 'press';
  } else if (normalizedName.includes('remo') || normalizedName.includes('row')) {
    baseExerciseType = 'remo';
  } else if (normalizedName.includes('curl')) {
    baseExerciseType = 'curl';
  } else if (normalizedName.includes('extension') || normalizedName.includes('pushdown')) {
    baseExerciseType = 'extension';
  } else if (normalizedName.includes('sentadilla') || normalizedName.includes('squat')) {
    baseExerciseType = 'sentadilla';
  } else if (normalizedName.includes('peso_muerto') || normalizedName.includes('deadlift')) {
    baseExerciseType = 'peso_muerto';
  } else if (normalizedName.includes('elevacion') || normalizedName.includes('raise')) {
    baseExerciseType = 'elevaciones';
  } else if (normalizedName.includes('apertura') || normalizedName.includes('fly')) {
    baseExerciseType = 'aperturas';
  } else if (normalizedName.includes('dominada') || normalizedName.includes('pull_up')) {
    baseExerciseType = 'dominadas';
  } else if (normalizedName.includes('jalon') || normalizedName.includes('pulldown')) {
    baseExerciseType = 'jalon';
  }

  // Filtrar variantes aplicables
  return EXERCISE_VARIANTS.filter(variant =>
    variant.applicableExercises.some(ex =>
      ex === baseExerciseType || normalizedName.includes(ex)
    )
  );
}

/**
 * Métodos de progresión para entrenamiento avanzado
 */
export type ProgressionMethod = {
  name: string;
  description: string;
  applicableGoals: TrainingGoal[];
  implementation: string;
};

/**
 * Métodos de progresión para diferentes objetivos
 */
export const PROGRESSION_METHODS: ProgressionMethod[] = [
  {
    name: 'Doble Progresión',
    description: 'Aumentar repeticiones hasta el límite superior del rango, luego aumentar peso y volver al límite inferior',
    applicableGoals: ['strength', 'hypertrophy'],
    implementation: 'Ejemplo: 3x8-12. Cuando logres 3x12, aumenta el peso y vuelve a 3x8.'
  },
  {
    name: 'Periodización Lineal',
    description: 'Aumentar progresivamente la intensidad y reducir el volumen a lo largo del tiempo',
    applicableGoals: ['strength', 'power'],
    implementation: 'Semana 1: 3x12 (70%), Semana 2: 4x8 (75%), Semana 3: 5x5 (80%), Semana 4: 6x3 (85%)'
  },
  {
    name: 'Periodización Ondulada',
    description: 'Variar la intensidad y el volumen dentro de la misma semana',
    applicableGoals: ['strength', 'hypertrophy', 'power'],
    implementation: 'Lunes: 3x12 (70%), Miércoles: 4x8 (75%), Viernes: 5x5 (80%)'
  },
  {
    name: 'Periodización por Bloques',
    description: 'Dividir el entrenamiento en bloques con objetivos específicos',
    applicableGoals: ['strength', 'hypertrophy', 'power', 'endurance'],
    implementation: 'Bloque 1 (4 semanas): Hipertrofia, Bloque 2 (4 semanas): Fuerza, Bloque 3 (2 semanas): Potencia'
  },
  {
    name: 'Progresión por RIR',
    description: 'Mantener un RIR específico y aumentar el peso cuando sea demasiado fácil',
    applicableGoals: ['strength', 'hypertrophy'],
    implementation: 'Mantener RIR=2. Cuando puedas hacer las series con RIR>2, aumenta el peso.'
  },
  {
    name: 'Progresión por Volumen',
    description: 'Aumentar progresivamente el volumen (series x repeticiones) antes de aumentar la intensidad',
    applicableGoals: ['hypertrophy', 'endurance'],
    implementation: 'Semana 1: 3x10, Semana 2: 4x10, Semana 3: 5x10, Semana 4: 3x10 (más peso)'
  }
];

/**
 * Nuevas funciones para periodización avanzada y mesociclos
 */

// Tipos para periodización avanzada
export type MesocyclePhase = 'accumulation' | 'intensification' | 'peak' | 'deload';
export type MesocycleStructure = {
  name: string;
  duration: number; // en semanas
  phases: MesocyclePhaseConfig[];
  deloadStrategy: DeloadStrategy;
  recommendedFor: TrainingGoal[];
  trainingLevels: TrainingLevel[];
};

export type MesocyclePhaseConfig = {
  phase: MesocyclePhase;
  duration: number; // en semanas
  volumeMultiplier: number; // multiplicador del volumen base
  intensityMultiplier: number; // multiplicador de la intensidad base
  rirTarget: number; // objetivo de RIR (repeticiones en reserva)
  recommendedTechniques: string[]; // técnicas recomendadas para esta fase
};

// Configuraciones de mesociclos predefinidos
export const MESOCYCLE_STRUCTURES: MesocycleStructure[] = [
  {
    name: 'Hipertrofia Estándar',
    duration: 8,
    phases: [
      {
        phase: 'accumulation',
        duration: 3,
        volumeMultiplier: 1.2,
        intensityMultiplier: 0.9,
        rirTarget: 2,
        recommendedTechniques: ['Super Sets', 'Drop Sets', 'Giant Sets']
      },
      {
        phase: 'intensification',
        duration: 3,
        volumeMultiplier: 1.0,
        intensityMultiplier: 1.1,
        rirTarget: 1,
        recommendedTechniques: ['Rest-Pause', 'Tempo Training', 'Myo-reps']
      },
      {
        phase: 'peak',
        duration: 1,
        volumeMultiplier: 0.8,
        intensityMultiplier: 1.2,
        rirTarget: 0,
        recommendedTechniques: ['Cluster Sets', 'Repeticiones Parciales']
      },
      {
        phase: 'deload',
        duration: 1,
        volumeMultiplier: 0.6,
        intensityMultiplier: 0.8,
        rirTarget: 3,
        recommendedTechniques: []
      }
    ],
    deloadStrategy: {
      type: 'both',
      volumeReduction: 40,
      intensityReduction: 20,
      frequencyReduction: 0,
      duration: 7
    },
    recommendedFor: ['hypertrophy'],
    trainingLevels: ['intermediate', 'advanced']
  },
  {
    name: 'Fuerza Pura',
    duration: 8,
    phases: [
      {
        phase: 'accumulation',
        duration: 2,
        volumeMultiplier: 1.1,
        intensityMultiplier: 0.85,
        rirTarget: 3,
        recommendedTechniques: ['Tempo Training']
      },
      {
        phase: 'intensification',
        duration: 4,
        volumeMultiplier: 0.9,
        intensityMultiplier: 1.1,
        rirTarget: 2,
        recommendedTechniques: ['Cluster Sets', 'Rest-Pause']
      },
      {
        phase: 'peak',
        duration: 1,
        volumeMultiplier: 0.7,
        intensityMultiplier: 1.2,
        rirTarget: 1,
        recommendedTechniques: ['Isometría']
      },
      {
        phase: 'deload',
        duration: 1,
        volumeMultiplier: 0.5,
        intensityMultiplier: 0.7,
        rirTarget: 4,
        recommendedTechniques: []
      }
    ],
    deloadStrategy: {
      type: 'intensity',
      volumeReduction: 0,
      intensityReduction: 30,
      frequencyReduction: 0,
      duration: 7
    },
    recommendedFor: ['strength', 'power'],
    trainingLevels: ['intermediate', 'advanced']
  },
  {
    name: 'Definición Avanzada',
    duration: 6,
    phases: [
      {
        phase: 'accumulation',
        duration: 2,
        volumeMultiplier: 1.3,
        intensityMultiplier: 0.8,
        rirTarget: 2,
        recommendedTechniques: ['Super Sets', 'Giant Sets']
      },
      {
        phase: 'intensification',
        duration: 2,
        volumeMultiplier: 1.1,
        intensityMultiplier: 0.9,
        rirTarget: 1,
        recommendedTechniques: ['Drop Sets', 'Super Sets']
      },
      {
        phase: 'peak',
        duration: 1,
        volumeMultiplier: 1.0,
        intensityMultiplier: 1.0,
        rirTarget: 0,
        recommendedTechniques: ['Giant Sets', 'Drop Sets']
      },
      {
        phase: 'deload',
        duration: 1,
        volumeMultiplier: 0.6,
        intensityMultiplier: 0.8,
        rirTarget: 3,
        recommendedTechniques: []
      }
    ],
    deloadStrategy: {
      type: 'volume',
      volumeReduction: 40,
      intensityReduction: 0,
      frequencyReduction: 0,
      duration: 7
    },
    recommendedFor: ['weight_loss', 'endurance'],
    trainingLevels: ['intermediate', 'advanced']
  }
];

/**
 * Obtiene la estructura de mesociclo recomendada según el nivel y objetivo
 */
export function getRecommendedMesocycle(
  level: TrainingLevel,
  goal: TrainingGoal
): MesocycleStructure {
  // Buscar mesociclo que coincida con el nivel y objetivo
  const recommendedMesocycle = MESOCYCLE_STRUCTURES.find(
    mesocycle =>
      mesocycle.trainingLevels.includes(level) &&
      mesocycle.recommendedFor.includes(goal)
  );

  // Si no hay coincidencia, devolver el mesociclo de hipertrofia estándar
  return recommendedMesocycle || MESOCYCLE_STRUCTURES[0];
}

/**
 * Calcula el volumen óptimo para un mesociclo específico
 */
export function calculateMesocycleVolume(
  baseVolume: { setsPerWeek: number, frequency: number },
  mesocycle: MesocycleStructure,
  currentWeek: number
): { setsPerWeek: number, frequency: number, intensity: number, rir: number } {
  // Determinar en qué fase del mesociclo estamos
  let currentPhase: MesocyclePhaseConfig | undefined;
  let weekInPhase = currentWeek;

  for (const phase of mesocycle.phases) {
    if (weekInPhase <= phase.duration) {
      currentPhase = phase;
      break;
    }
    weekInPhase -= phase.duration;
  }

  // Si no se encuentra la fase (por ejemplo, si currentWeek > duración total), usar la última fase
  if (!currentPhase) {
    currentPhase = mesocycle.phases[mesocycle.phases.length - 1];
  }

  // Calcular volumen ajustado según la fase
  const adjustedSetsPerWeek = Math.round(baseVolume.setsPerWeek * currentPhase.volumeMultiplier);

  // La frecuencia generalmente se mantiene constante durante el mesociclo
  const adjustedFrequency = baseVolume.frequency;

  // Intensidad relativa (1.0 = 100% de la intensidad normal)
  const intensity = currentPhase.intensityMultiplier;

  // RIR objetivo para esta fase
  const rir = currentPhase.rirTarget;

  return {
    setsPerWeek: adjustedSetsPerWeek,
    frequency: adjustedFrequency,
    intensity,
    rir
  };
}

/**
 * Calcula el peso recomendado basado en RIR y progresión
 */
export function calculateWeightByRIR(
  baseWeight: number,
  targetRIR: number,
  currentRIR: number
): number {
  // Si el RIR actual es menor que el objetivo, el peso es demasiado alto
  if (currentRIR < targetRIR) {
    // Reducir el peso en 5-10%
    return baseWeight * 0.925; // Reducción del 7.5%
  }

  // Si el RIR actual es mayor que el objetivo, el peso es demasiado bajo
  if (currentRIR > targetRIR) {
    // Aumentar el peso en 2.5-5%
    const increment = (currentRIR - targetRIR) * 0.025; // 2.5% por cada punto de RIR de diferencia
    return baseWeight * (1 + Math.min(increment, 0.1)); // Máximo 10% de incremento
  }

  // Si el RIR actual es igual al objetivo, mantener el peso
  return baseWeight;
}

/**
 * Genera un plan de entrenamiento completo basado en un mesociclo
 */
export function generateMesocyclePlan(
  userId: string,
  level: TrainingLevel,
  goal: TrainingGoal,
  split: TrainingSplit,
  frequency: number,
  includeDeload: boolean = true
): WorkoutRoutine {
  // Obtener el mesociclo recomendado
  const mesocycle = getRecommendedMesocycle(level, goal);

  // Calcular la duración total (incluyendo o no la semana de deload)
  const totalDuration = includeDeload ? mesocycle.duration : mesocycle.duration - 1;

  // Generar los días de entrenamiento según el split y frecuencia
  const workoutDays: WorkoutDay[] = generateWorkoutDaysForSplit(split, frequency, level, goal);

  // Crear la rutina
  return {
    id: uuidv4(),
    userId,
    name: `${mesocycle.name} - ${split.toUpperCase()}`,
    description: `Mesociclo de ${totalDuration} semanas para ${goal}, nivel ${level}`,
    days: workoutDays,
    frequency,
    goal,
    level,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + totalDuration * 7 * 24 * 60 * 60 * 1000).toISOString(),
    includesDeload,
    deloadFrequency: mesocycle.duration - 1,
    deloadStrategy: mesocycle.deloadStrategy.type,
    source: "Bodybuilding Science",
    tags: [level, goal, split, "mesociclo", "periodización"],
    split
  };
}

/**
 * Genera días de entrenamiento para un split específico
 */
export function generateWorkoutDaysForSplit(
  split: TrainingSplit,
  frequency: number,
  level: TrainingLevel,
  goal: TrainingGoal
): WorkoutDay[] {
  // Definir los días según el split
  const splitDays = getSplitDays(split, frequency);

  // Crear los días de entrenamiento
  return splitDays.map((day, index) => {
    return {
      id: uuidv4(),
      name: day.name,
      targetMuscleGroups: getMuscleGroupsForDay(day.type),
      difficulty: level,
      exerciseSets: [], // Los ejercicios específicos se añadirían después
      estimatedDuration: 60, // Duración estimada en minutos
      order: index + 1
    };
  });
}

/**
 * Obtiene los grupos musculares para un tipo de día
 */
function getMuscleGroupsForDay(dayType: string): MuscleGroup[] {
  switch (dayType) {
    case 'push':
      return ['chest', 'shoulders', 'arms'];
    case 'pull':
      return ['back', 'arms'];
    case 'legs':
      return ['legs', 'core'];
    case 'upper':
      return ['chest', 'back', 'shoulders', 'arms'];
    case 'lower':
      return ['legs', 'core'];
    case 'chest':
      return ['chest', 'arms'];
    case 'back':
      return ['back', 'arms'];
    case 'shoulders':
      return ['shoulders', 'arms'];
    case 'arms':
      return ['arms'];
    case 'full_body':
    default:
      return ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
  }
}

/**
 * Tipos para técnicas avanzadas específicas
 */
export type AdvancedTechniqueType =
  | 'intensity'
  | 'volume'
  | 'tempo'
  | 'mechanical'
  | 'metabolic'
  | 'compound'
  | 'specialized';

/**
 * Interfaz extendida para técnicas avanzadas
 */
export interface AdvancedTechniqueExtended extends AdvancedTechnique {
  type: AdvancedTechniqueType;
  muscleGroupFocus: MuscleGroup[];
  implementation: string;
  examples: string[];
  scientificBasis: string;
  recommendedExerciseNames: string[];
}

/**
 * Técnicas avanzadas extendidas con más información
 */
export const EXTENDED_TECHNIQUES: AdvancedTechniqueExtended[] = [
  {
    name: 'Drop Sets',
    description: 'Realizar una serie hasta el fallo y luego reducir el peso para continuar inmediatamente',
    applicableGoals: ['hypertrophy', 'endurance'],
    recommendedExerciseTypes: ['isolation', 'accessory'],
    fatigueImpact: 8,
    recoveryRequirement: 7,
    type: 'intensity',
    muscleGroupFocus: ['chest', 'back', 'shoulders', 'arms'],
    implementation: 'Realizar una serie hasta el fallo técnico, reducir el peso en 20-30% y continuar inmediatamente hasta el fallo nuevamente. Repetir 2-3 veces.',
    examples: ['Press de banca con drop set', 'Curl de bíceps con drop set', 'Elevaciones laterales con drop set'],
    scientificBasis: 'Maximiza el reclutamiento de fibras musculares y el estrés metabólico, factores clave para la hipertrofia según estudios recientes.',
    recommendedExerciseNames: ['Press de banca', 'Curl de bíceps', 'Elevaciones laterales', 'Extensiones de tríceps', 'Jalón al pecho']
  },
  {
    name: 'Rest-Pause',
    description: 'Realizar una serie hasta el fallo, descansar 10-15 segundos y continuar',
    applicableGoals: ['strength', 'hypertrophy'],
    recommendedExerciseTypes: ['compound', 'isolation'],
    fatigueImpact: 7,
    recoveryRequirement: 6,
    type: 'volume',
    muscleGroupFocus: ['chest', 'back', 'legs', 'shoulders'],
    implementation: 'Realizar una serie hasta el fallo técnico, descansar 10-15 segundos, y continuar hasta el fallo nuevamente. Repetir 2-3 veces.',
    examples: ['Press militar con rest-pause', 'Sentadilla con rest-pause', 'Remo con barra con rest-pause'],
    scientificBasis: 'Permite acumular más volumen efectivo en menos tiempo, aumentando la densidad del entrenamiento y el estímulo para la hipertrofia.',
    recommendedExerciseNames: ['Press militar', 'Sentadilla', 'Remo con barra', 'Press de banca', 'Peso muerto']
  },
  {
    name: 'Myo-reps',
    description: 'Serie activadora seguida de mini-series con descansos cortos para maximizar la hipertrofia',
    applicableGoals: ['hypertrophy'],
    recommendedExerciseTypes: ['isolation', 'accessory'],
    fatigueImpact: 7,
    recoveryRequirement: 6,
    type: 'specialized',
    muscleGroupFocus: ['shoulders', 'arms', 'chest'],
    implementation: 'Realizar una serie activadora de 12-15 repeticiones hasta casi el fallo, descansar 5-10 segundos, realizar 3-5 repeticiones, descansar 5-10 segundos, y repetir hasta completar 5 mini-series.',
    examples: ['Elevaciones laterales con myo-reps', 'Curl de bíceps con myo-reps', 'Extensiones de tríceps con myo-reps'],
    scientificBasis: 'Desarrollado por Borge Fagerli, combina la activación muscular máxima con un alto volumen de trabajo efectivo en poco tiempo.',
    recommendedExerciseNames: ['Elevaciones laterales', 'Curl de bíceps', 'Extensiones de tríceps', 'Aperturas en polea', 'Face pulls']
  }
];

/**
 * Obtiene técnicas avanzadas extendidas recomendadas
 */
export function getExtendedTechniques(
  exerciseType: ExerciseType,
  goal: TrainingGoal,
  muscleGroup?: MuscleGroup
): AdvancedTechniqueExtended[] {
  let techniques = EXTENDED_TECHNIQUES.filter(technique =>
    technique.recommendedExerciseTypes.includes(exerciseType) &&
    technique.applicableGoals.includes(goal)
  );

  // Si se especifica un grupo muscular, filtrar también por eso
  if (muscleGroup) {
    techniques = techniques.filter(technique =>
      technique.muscleGroupFocus.includes(muscleGroup)
    );
  }

  return techniques;
}

/**
 * Obtiene técnicas avanzadas recomendadas para un ejercicio específico
 */
export function getTechniquesForExercise(
  exerciseName: string,
  exerciseType: ExerciseType,
  goal: TrainingGoal
): AdvancedTechniqueExtended[] {
  // Normalizar el nombre del ejercicio
  const normalizedName = exerciseName.toLowerCase();

  return EXTENDED_TECHNIQUES.filter(technique => {
    // Verificar si el tipo de ejercicio y objetivo son compatibles
    const isTypeAndGoalCompatible =
      technique.recommendedExerciseTypes.includes(exerciseType) &&
      technique.applicableGoals.includes(goal);

    // Verificar si el ejercicio está en la lista de ejercicios recomendados
    const isExerciseRecommended = technique.recommendedExerciseNames.some(name =>
      normalizedName.includes(name.toLowerCase())
    );

    return isTypeAndGoalCompatible && isExerciseRecommended;
  });
}