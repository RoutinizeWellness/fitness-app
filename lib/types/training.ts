// Tipos para el módulo de entrenamiento

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroup: string[];
  equipment: string[];
  description?: string;
  videoUrl?: string;
  imageUrl?: string;
  alternatives?: string[]; // IDs de ejercicios alternativos
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompound: boolean;
  exerciseId?: string; // ID del ejercicio en el catálogo de ejercicios
  sets?: number; // Número de series (para mostrar en la UI)
  repsMin?: number; // Número mínimo de repeticiones (para mostrar en la UI)
  repsMax?: number; // Número máximo de repeticiones (para mostrar en la UI)
  reps?: number; // Número de repeticiones (para mostrar en la UI) - Deprecated, usar repsMin/repsMax
  rir?: number; // RIR objetivo (para mostrar en la UI)
  rest?: number; // Tiempo de descanso en segundos (para mostrar en la UI)
  notes?: string; // Notas adicionales (para mostrar en la UI)
  instructions?: string; // Instrucciones de ejecución
  pattern?: string; // Patrón de movimiento (squat, hinge, push, pull, etc.)
  targetRir?: number; // RIR objetivo para este ejercicio específico
}

export interface ExerciseSet {
  id: string;
  exerciseId: string;
  alternativeExerciseId?: string; // Si se seleccionó una alternativa
  exerciseName?: string; // Nombre personalizado o variante del ejercicio
  targetReps: number;
  targetRir: number; // Reps in Reserve objetivo
  weight?: number; // Peso recomendado (kg)
  completedReps?: number; // Repeticiones completadas
  completedWeight?: number; // Peso utilizado (kg)
  completedRir?: number; // RiR real
  notes?: string;
  restTime?: number; // Tiempo de descanso en segundos
  isWarmup?: boolean;
  isDropSet?: boolean;
  isRestPause?: boolean; // Técnica Rest-Pause
  isMechanicalSet?: boolean; // Series mecánicas (cambio de ángulo/agarre)
  isPartialReps?: boolean; // Repeticiones parciales
  isGiantSet?: boolean; // Giant set (3+ ejercicios seguidos)
  isMyoReps?: boolean; // Myo-reps (activación + mini-series)
  isPreFatigue?: boolean; // Pre-fatiga (aislamiento antes de compuesto)
  isPostFatigue?: boolean; // Post-fatiga (compuesto antes de aislamiento)
  isIsometric?: boolean; // Contracción isométrica
  isSupersetWith?: string; // ID del siguiente ejercicio en el superset
  preFatigueWith?: string; // ID del ejercicio de pre-fatiga
  postFatigueWith?: string; // ID del ejercicio de post-fatiga
  tempoTiming?: string; // Tempo de la repetición (ej: "3-1-2-0")
  progressionMethod?: string; // Método de progresión aplicado
}

export interface WorkoutDay {
  id: string;
  name: string;
  description?: string;
  exerciseSets: ExerciseSet[];
  targetMuscleGroups: string[];
  estimatedDuration?: number; // En minutos
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  userId: string;
  name: string;
  description?: string;
  days: WorkoutDay[];
  frequency: number; // Número de días por semana
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general_fitness';
  level: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  periodizationId?: string; // ID del mesociclo asociado
  includesDeload?: boolean; // Indica si la rutina incluye semanas de descarga
  deloadFrequency?: number; // Cada cuántas semanas hay descarga
  deloadStrategy?: 'volume' | 'intensity' | 'frequency' | 'combined'; // Estrategia de descarga
  source?: string; // Fuente de la rutina (ej: "Pure Bodybuilding Program")
  tags?: string[]; // Etiquetas para categorizar la rutina
  templateId?: string; // ID de la plantilla si se creó a partir de una
  split?: 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part' | 'push_pull' | 'bro_split'; // Tipo de división
}

export interface WorkoutLog {
  id: string;
  userId: string;
  routineId: string;
  dayId: string;
  date: string;
  duration: number; // En minutos
  completedSets: ExerciseSet[];
  notes?: string;
  overallFatigue: number; // Escala 1-10
  muscleGroupFatigue: Record<string, number>; // Fatiga por grupo muscular (escala 1-10)
  performance: 'worse' | 'same' | 'better'; // Comparado con el entrenamiento anterior
}

export interface UserTrainingProfile {
  userId: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  preferredEquipment: string[];
  availableTime: number; // En minutos por sesión
  frequency: number; // Días por semana
  injuryHistory?: string[];
  benchmarkLifts?: {
    squat?: number;
    bench?: number;
    deadlift?: number;
    overhead?: number;
  };
  bodyweight?: number;
  height?: number;
  age?: number;
  gender?: string;
  preferredExercises?: string[]; // IDs de ejercicios preferidos
  excludedExercises?: string[]; // IDs de ejercicios a evitar
  isTrainer?: boolean; // Indica si el usuario es entrenador
  trainerInfo?: {
    specialties: string[];
    experience: number; // años de experiencia
    certifications: string[];
    bio: string;
    maxClients?: number; // Número máximo de clientes
  };
}

export interface TrainingAlgorithmData {
  userId: string;
  exerciseProgressions: Record<string, {
    lastWeight: number;
    lastReps: number;
    lastRir: number;
    progressionRate: number; // Tasa de progresión (% por semana)
    fatigueResponse: number; // Cómo responde el usuario a la fatiga (escala)
    optimalRepRange: [number, number]; // Rango óptimo de repeticiones
    optimalRirRange: [number, number]; // Rango óptimo de RIR
    volumeTolerance: number; // Tolerancia al volumen (escala)
    recoveryRate: number; // Tasa de recuperación (escala)
    preferredIntensity?: 'low' | 'moderate' | 'high'; // Preferencia de intensidad detectada
    bestPerformanceTime?: 'morning' | 'afternoon' | 'evening'; // Momento del día con mejor rendimiento
    history?: Array<{
      date: string;
      weight?: number;
      reps?: number;
      rir?: number;
      performance?: 'worse' | 'same' | 'better';
    }>;
  }>;
  muscleGroupRecovery: Record<string, number>; // Días necesarios para recuperación
  overallRecoveryRate: number; // Tasa general de recuperación
  trainingAge: number; // Años de entrenamiento
  adaptationRate: number; // Qué tan rápido se adapta el usuario
  preferredTrainingStyle?: {
    intensityPreference: 'low' | 'moderate' | 'high'; // Preferencia general de intensidad
    volumePreference: 'low' | 'moderate' | 'high'; // Preferencia de volumen
    frequencyPreference: 'low' | 'moderate' | 'high'; // Preferencia de frecuencia
    restPeriodPreference: 'short' | 'moderate' | 'long'; // Preferencia de descanso entre series
    exerciseVarietyPreference: 'low' | 'moderate' | 'high'; // Preferencia de variedad de ejercicios
  };
  trainingPatterns?: {
    preferredTimeOfDay: 'morning' | 'afternoon' | 'evening';
    averageSessionDuration: number; // En minutos
    consistencyScore: number; // 0-100, qué tan consistente es el usuario
    preferredDaysOfWeek: string[]; // Días de la semana preferidos
  };
  lastUpdated: string;
}

// Tipos para las recomendaciones del algoritmo
export interface ExerciseAdjustment {
  exerciseId: string;
  recommendedWeight: number;
  recommendedReps: number;
  recommendedRir: number;
  reason: string;
  confidenceLevel: number; // 0-1, qué tan seguro está el algoritmo
}

export interface WorkoutRecommendation {
  userId: string;
  date: string;
  routineId: string;
  dayId: string;
  adjustments: ExerciseAdjustment[];
  volumeAdjustment: 'decrease' | 'maintain' | 'increase';
  restAdjustment: 'decrease' | 'maintain' | 'increase';
  generalAdvice: string;
  fatigueManagement: string;
}

// Interfaces para la comunicación entrenador-usuario
export interface TrainerModification {
  id: string;
  trainerId: string;
  userId: string;
  routineId: string;
  dayId?: string;
  exerciseId?: string;
  modificationType: 'add_exercise' | 'remove_exercise' | 'replace_exercise' | 'adjust_sets' | 'adjust_reps' | 'adjust_weight' | 'adjust_routine' | 'general_feedback';
  originalValue?: any;
  newValue?: any;
  reason: string;
  status: 'pending' | 'applied' | 'rejected';
  createdAt: string;
  appliedAt?: string;
}

export interface TrainerFeedback {
  id: string;
  trainerId: string;
  userId: string;
  workoutLogId?: string;
  routineId?: string;
  type: 'performance' | 'technique' | 'progress' | 'general';
  message: string;
  rating?: number; // 1-5 estrellas
  createdAt: string;
  readByUser: boolean;
  userResponse?: string;
}

export interface TrainerClient {
  trainerId: string;
  userId: string;
  status: 'active' | 'pending' | 'inactive';
  startDate: string;
  endDate?: string;
  assignedRoutines: string[]; // IDs de rutinas asignadas
  notes?: string;
  goals?: string[];
  lastInteraction?: string;
}
