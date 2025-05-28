// Tipos para programas de entrenamiento avanzados

import { WorkoutDay, WorkoutRoutine } from "./training";

// Tipo de microciclo (generalmente 1 semana)
export interface MicroCycle {
  id: string;
  name: string;
  description?: string;
  days: WorkoutDay[];
  duration: number; // Duración en días (típicamente 7 o 10)
  intensity: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  volume: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  isDeload: boolean; // Indica si es un microciclo de descarga
  deloadType?: 'volume' | 'intensity' | 'frequency' | 'complete'; // Tipo de descarga
  weekNumber: number; // Número de semana dentro del mesociclo
  totalSets?: number; // Total de series en el microciclo
  averageRIR?: number; // RIR promedio objetivo
  averageRPE?: number; // RPE promedio objetivo
  repRangeMin?: number; // Rango mínimo de repeticiones recomendado
  repRangeMax?: number; // Rango máximo de repeticiones recomendado
  restBetweenSets?: [number, number]; // Rango de descanso entre series en segundos
  tempoGuidelines?: string; // Recomendaciones de tempo (ej: "3-1-2-0")
  techniqueVariations?: string[]; // Variaciones técnicas a implementar
  notes?: string;
}

// Tipo de mesociclo (generalmente 4-6 semanas)
export interface MesoCycle {
  id: string;
  name: string;
  description?: string;
  microCycles: MicroCycle[];
  duration: number; // Duración en semanas
  focus: 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'mixed' | 'maintenance' | 'recovery';
  progressionModel: 'linear' | 'undulating' | 'block' | 'wave' | 'step' | 'custom';
  includesDeload: boolean;
  deloadStrategy?: 'volume' | 'intensity' | 'both' | 'frequency' | 'complete' | 'active_recovery';
  deloadWeek?: number; // Semana en la que se realiza el deload (ej: 4 para deload en la semana 4)
  deloadFrequency?: number; // Cada cuántas semanas se realiza un deload
  volumeProgression: 'ascending' | 'descending' | 'wave' | 'step' | 'constant';
  intensityProgression: 'ascending' | 'descending' | 'wave' | 'step' | 'constant';
  startingVolume: number; // Volumen inicial (series por grupo muscular por semana)
  peakVolume: number; // Volumen máximo (series por grupo muscular por semana)
  startingIntensity: number; // Intensidad inicial (% 1RM o RPE)
  peakIntensity: number; // Intensidad máxima (% 1RM o RPE)
  frequencyPerMuscleGroup: Record<string, number>; // Frecuencia por grupo muscular
  primaryMuscleGroups: string[]; // Grupos musculares prioritarios
  secondaryMuscleGroups: string[]; // Grupos musculares secundarios
  exerciseRotation: 'fixed' | 'rotating' | 'undulating'; // Estrategia de selección de ejercicios
  specialTechniques?: string[]; // Técnicas especiales a utilizar
  recommendedSupplements?: string[]; // Suplementos recomendados para esta fase
  expectedOutcomes?: string[]; // Resultados esperados
  cycleNumber?: number; // Número de ciclo dentro del macrociclo
  notes?: string;
}

// Tipo de macrociclo (generalmente 3-6 meses)
export interface MacroCycle {
  id: string;
  name: string;
  description?: string;
  mesoCycles: MesoCycle[];
  duration: number; // Duración en meses
  periodizationType: 'linear' | 'undulating' | 'block' | 'conjugate' | 'reverse_linear' | 'concurrent' | 'custom';
  primaryGoal: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general_fitness' | 'power' | 'recomposition';
  secondaryGoal?: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general_fitness' | 'power' | 'recomposition';
  startDate: string; // Fecha de inicio
  endDate: string; // Fecha de finalización
  trainingLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  trainingAge?: number; // Años de entrenamiento
  trainingPhases: {
    preparatory?: number; // Duración en semanas
    hypertrophy?: number; // Duración en semanas
    strength?: number; // Duración en semanas
    power?: number; // Duración en semanas
    peaking?: number; // Duración en semanas
    transition?: number; // Duración en semanas
  };
  nutritionPhases?: {
    maintenance?: number; // Duración en semanas
    surplus?: number; // Duración en semanas
    deficit?: number; // Duración en semanas
    refeed?: number; // Duración en semanas
  };
  deloadStrategy: 'regular' | 'autoregulated' | 'performance_based' | 'custom';
  deloadFrequency: number; // Cada cuántas semanas se programa un deload
  expectedProgressions: {
    strength?: number; // % de mejora esperado
    muscle_mass?: number; // % de mejora esperado
    endurance?: number; // % de mejora esperado
    body_composition?: number; // % de mejora esperado
  };
  seasonality?: 'off_season' | 'pre_season' | 'in_season' | 'post_season';
  competitionDates?: string[]; // Fechas de competición si aplica
  testingWeeks?: number[]; // Semanas en las que se realizan tests de rendimiento
  notes?: string;
}

// Tipo para programa de entrenamiento completo
export interface TrainingProgram {
  id: string;
  userId: string;
  name: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  type: 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part_split' | 'bro_split' | 'ppl_arnold' | 'custom';
  duration: number; // Duración en semanas
  frequency: number; // Días de entrenamiento por semana
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general_fitness' | 'power' | 'recomposition';
  targetMuscleGroups?: string[]; // Grupos musculares prioritarios
  structure: 'mesocycle' | 'macrocycle' | 'simple';
  mesoCycles?: MesoCycle[]; // Si structure es 'mesocycle'
  macroCycle?: MacroCycle; // Si structure es 'macrocycle'
  routines?: WorkoutRoutine[]; // Si structure es 'simple'
  createdAt: string;
  updatedAt: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isTemplate?: boolean;
  templateSource?: string; // Origen de la plantilla (ej: "Jeff Nippard PPL", "Chris Bumstead Split")
  deloadStrategy: 'regular' | 'autoregulated' | 'performance_based' | 'none';
  deloadFrequency?: number; // Cada cuántas semanas se programa un deload
  progressionStrategy: 'linear' | 'double_progression' | 'undulating' | 'percentage_based' | 'rpe_based' | 'custom';
  trainingSpecifics: {
    preferredRepRanges?: [number, number]; // Rango de repeticiones preferido
    preferredRIR?: number; // RIR (Reps In Reserve) preferido
    preferredRPE?: number; // RPE (Rate of Perceived Exertion) preferido
    restBetweenSets?: [number, number]; // Rango de descanso entre series en segundos
    tempoPreference?: string; // Preferencia de tempo (ej: "3-1-2-0")
    specialTechniques?: string[]; // Técnicas especiales preferidas
  };
  nutritionSyncEnabled?: boolean; // Indica si la sincronización con nutrición está habilitada
  adaptiveAdjustments?: boolean; // Indica si se permiten ajustes adaptativos basados en rendimiento
  userFeedback?: {
    recoveryRating?: number; // Valoración de recuperación (1-10)
    enjoymentRating?: number; // Valoración de disfrute (1-10)
    difficultyRating?: number; // Valoración de dificultad (1-10)
    effectivenessRating?: number; // Valoración de efectividad (1-10)
    comments?: string; // Comentarios del usuario
  };
  createdBy: string; // ID del usuario que creó el programa (admin o entrenador)
  assignedTo?: string[]; // IDs de usuarios a los que está asignado
  isTemplate: boolean;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipo para ejercicio con alternativas
export interface ExerciseWithAlternatives {
  mainExercise: string; // ID del ejercicio principal
  alternatives: string[]; // IDs de ejercicios alternativos
  userPreference?: string; // ID del ejercicio preferido por el usuario
}

// Tipo para día de entrenamiento con ejercicios alternativos
export interface WorkoutDayWithAlternatives extends Omit<WorkoutDay, 'exerciseSets'> {
  exercisesWithAlternatives: ExerciseWithAlternatives[];
  exerciseSets: any[]; // Mantener compatibilidad con WorkoutDay
}

// Tipo para seguimiento de progreso en el programa
export interface ProgramProgress {
  id: string;
  userId: string;
  programId: string;
  currentWeek: number;
  currentDay: number;
  completedWorkouts: number;
  totalWorkouts: number;
  adherenceRate: number; // Porcentaje de adherencia
  startDate: string;
  lastWorkoutDate?: string;
  isCompleted: boolean;
  completionDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipo para ajustes del programa
export interface ProgramAdjustment {
  id: string;
  programId: string;
  userId: string;
  adjustedBy: string; // ID del entrenador o sistema
  adjustmentType: 'volume' | 'intensity' | 'exercise' | 'frequency' | 'rest' | 'other';
  description: string;
  reason: string;
  originalValue?: any;
  newValue?: any;
  appliedDate: string;
  createdAt: string;
}

// Tipo para plantillas predefinidas de programas
export interface ProgramTemplate {
  id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  type: 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part_split' | 'custom';
  duration: number; // Duración en semanas
  frequency: number; // Días de entrenamiento por semana
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general_fitness';
  structure: 'mesocycle' | 'macrocycle' | 'simple';
  hasDeload: boolean;
  deloadFrequency?: number; // Cada cuántas semanas hay deload
  sampleExercises: string[]; // Ejemplos de ejercicios incluidos
  imageUrl?: string;
  popularity: number; // Indicador de popularidad (1-10)
  createdBy: string; // 'system' o ID del creador
  createdAt: string;
}

// Enumeraciones para opciones de programas
export enum TrainingFrequency {
  LOW = 2,
  MODERATE = 3,
  HIGH = 4,
  VERY_HIGH = 5,
  EXTREME = 6
}

export enum TrainingDuration {
  SHORT = 4, // 4 semanas
  MEDIUM = 8, // 8 semanas
  LONG = 12, // 12 semanas
  VERY_LONG = 16 // 16 semanas
}

export enum DeloadStrategy {
  VOLUME = 'volume',
  INTENSITY = 'intensity',
  BOTH = 'both',
  FREQUENCY = 'frequency',
  NONE = 'none'
}

export enum TrainingLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum TrainingGoal {
  STRENGTH = 'strength',
  HYPERTROPHY = 'hypertrophy',
  ENDURANCE = 'endurance',
  WEIGHT_LOSS = 'weight_loss',
  GENERAL_FITNESS = 'general_fitness'
}

export enum TrainingType {
  FULL_BODY = 'full_body',
  UPPER_LOWER = 'upper_lower',
  PUSH_PULL_LEGS = 'push_pull_legs',
  BODY_PART_SPLIT = 'body_part_split',
  CUSTOM = 'custom'
}

export enum MesocycleFocus {
  STRENGTH = 'strength',
  HYPERTROPHY = 'hypertrophy',
  ENDURANCE = 'endurance',
  POWER = 'power',
  MIXED = 'mixed'
}

export enum ProgressionModel {
  LINEAR = 'linear',
  UNDULATING = 'undulating',
  BLOCK = 'block',
  CUSTOM = 'custom'
}

// Constantes para opciones de programas
export const TRAINING_FREQUENCIES = [
  { value: TrainingFrequency.LOW, label: '2 días/semana', description: 'Ideal para principiantes o personas con poco tiempo' },
  { value: TrainingFrequency.MODERATE, label: '3 días/semana', description: 'Equilibrio entre resultados y recuperación' },
  { value: TrainingFrequency.HIGH, label: '4 días/semana', description: 'Para personas con experiencia y buena recuperación' },
  { value: TrainingFrequency.VERY_HIGH, label: '5 días/semana', description: 'Para atletas intermedios y avanzados' },
  { value: TrainingFrequency.EXTREME, label: '6 días/semana', description: 'Para atletas avanzados con excelente recuperación' }
];

export const TRAINING_DURATIONS = [
  { value: TrainingDuration.SHORT, label: '4 semanas', description: 'Programa corto para objetivos específicos' },
  { value: TrainingDuration.MEDIUM, label: '8 semanas', description: 'Duración estándar para ver resultados' },
  { value: TrainingDuration.LONG, label: '12 semanas', description: 'Programa completo para transformación' },
  { value: TrainingDuration.VERY_LONG, label: '16 semanas', description: 'Programa extenso para cambios significativos' }
];

export const DELOAD_STRATEGIES = [
  { value: DeloadStrategy.VOLUME, label: 'Reducción de volumen', description: 'Mantiene la intensidad pero reduce el número de series' },
  { value: DeloadStrategy.INTENSITY, label: 'Reducción de intensidad', description: 'Mantiene el volumen pero reduce el peso utilizado' },
  { value: DeloadStrategy.BOTH, label: 'Reducción completa', description: 'Reduce tanto el volumen como la intensidad' },
  { value: DeloadStrategy.FREQUENCY, label: 'Reducción de frecuencia', description: 'Reduce el número de días de entrenamiento' },
  { value: DeloadStrategy.NONE, label: 'Sin descarga', description: 'No incluye semana de descarga' }
];

export const TRAINING_LEVELS = [
  { value: TrainingLevel.BEGINNER, label: 'Principiante', description: 'Menos de 1 año de entrenamiento consistente' },
  { value: TrainingLevel.INTERMEDIATE, label: 'Intermedio', description: '1-3 años de entrenamiento consistente' },
  { value: TrainingLevel.ADVANCED, label: 'Avanzado', description: 'Más de 3 años de entrenamiento consistente' }
];

export const TRAINING_GOALS = [
  { value: TrainingGoal.STRENGTH, label: 'Fuerza', description: 'Enfocado en aumentar la fuerza máxima' },
  { value: TrainingGoal.HYPERTROPHY, label: 'Hipertrofia', description: 'Enfocado en aumentar el tamaño muscular' },
  { value: TrainingGoal.ENDURANCE, label: 'Resistencia', description: 'Enfocado en mejorar la resistencia muscular' },
  { value: TrainingGoal.WEIGHT_LOSS, label: 'Pérdida de peso', description: 'Enfocado en quemar calorías y perder grasa' },
  { value: TrainingGoal.GENERAL_FITNESS, label: 'Fitness general', description: 'Equilibrio entre fuerza, hipertrofia y resistencia' }
];

export const TRAINING_TYPES = [
  { value: TrainingType.FULL_BODY, label: 'Cuerpo completo', description: 'Entrena todo el cuerpo en cada sesión' },
  { value: TrainingType.UPPER_LOWER, label: 'Superior/Inferior', description: 'Alterna entre tren superior e inferior' },
  { value: TrainingType.PUSH_PULL_LEGS, label: 'Push/Pull/Legs', description: 'Divide en empuje, tirón y piernas' },
  { value: TrainingType.BODY_PART_SPLIT, label: 'Split por grupos musculares', description: 'Dedica cada día a grupos musculares específicos' },
  { value: TrainingType.CUSTOM, label: 'Personalizado', description: 'Estructura personalizada según necesidades' }
];
