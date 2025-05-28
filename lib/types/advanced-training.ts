/**
 * Tipos para el sistema de entrenamiento avanzado
 * Incluye definiciones para periodización compleja, técnicas avanzadas y análisis de rendimiento
 */

// Tipos de periodización
export type PeriodizationModel = 
  | 'linear'
  | 'undulating'
  | 'block'
  | 'conjugate'
  | 'concurrent'
  | 'reverse_linear'
  | 'step_loading'
  | 'wave_loading'
  | 'high_frequency'
  | 'high_intensity'
  | 'high_volume'
  | 'specialization'
  | 'scientific_ppl'
  | 'nippard_system'
  | 'cbum_method';

// Tipos de ciclos de entrenamiento
export type CycleType = 
  | 'macrocycle'   // Ciclo largo (6-12 meses)
  | 'mesocycle'    // Ciclo medio (3-6 semanas)
  | 'microcycle';  // Ciclo corto (1 semana)

// Fases de entrenamiento
export type TrainingPhase = 
  | 'accumulation'  // Acumulación de volumen
  | 'intensification' // Intensificación
  | 'realization'   // Realización/Pico
  | 'deload'        // Descarga
  | 'transition'    // Transición
  | 'maintenance';  // Mantenimiento

// Objetivos de entrenamiento
export type AdvancedTrainingGoal = 
  | 'strength'      // Fuerza máxima
  | 'hypertrophy'   // Hipertrofia
  | 'power'         // Potencia
  | 'endurance'     // Resistencia muscular
  | 'speed'         // Velocidad
  | 'technique'     // Técnica
  | 'competition'   // Preparación para competición
  | 'recomposition' // Recomposición corporal
  | 'maintenance';  // Mantenimiento

// Niveles de experiencia avanzados
export type AdvancedExperienceLevel = 
  | 'intermediate'  // Intermedio (1-3 años de entrenamiento consistente)
  | 'advanced'      // Avanzado (3-5 años de entrenamiento consistente)
  | 'elite';        // Elite (5+ años de entrenamiento consistente)

// Tipos de deload
export type DeloadStrategy = 
  | 'volume'        // Reducción de volumen
  | 'intensity'     // Reducción de intensidad
  | 'frequency'     // Reducción de frecuencia
  | 'complete'      // Descanso completo
  | 'active_recovery'; // Recuperación activa

// Técnicas avanzadas de entrenamiento
export type AdvancedTechnique = 
  | 'drop_set'      // Series descendentes
  | 'rest_pause'    // Descanso-pausa
  | 'super_set'     // Superseries
  | 'giant_set'     // Series gigantes
  | 'cluster_set'   // Series en clúster
  | 'myo_reps'      // Myo-reps
  | 'pre_exhaust'   // Pre-agotamiento
  | 'post_exhaust'  // Post-agotamiento
  | 'partial_reps'  // Repeticiones parciales
  | 'tempo'         // Tempo específico
  | 'isometric_hold' // Mantención isométrica
  | 'eccentric_emphasis' // Énfasis excéntrico
  | 'mechanical_drop_set' // Series descendentes mecánicas
  | 'blood_flow_restriction' // Restricción del flujo sanguíneo
  | 'accommodating_resistance'; // Resistencia acomodada (bandas/cadenas)

// Métricas de rendimiento
export type PerformanceMetric = 
  | 'e1rm'          // 1RM estimado
  | 'volume_load'   // Carga de volumen
  | 'rpe'           // RPE (Rating of Perceived Exertion)
  | 'rir'           // RIR (Reps in Reserve)
  | 'bar_speed'     // Velocidad de la barra
  | 'time_under_tension' // Tiempo bajo tensión
  | 'density'       // Densidad (volumen/tiempo)
  | 'fatigue'       // Fatiga acumulada
  | 'readiness'     // Disposición para entrenar
  | 'recovery_index'; // Índice de recuperación

// Interfaz para macrociclo
export interface Macrocycle {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  duration_weeks: number;
  periodization_model: PeriodizationModel;
  primary_goal: AdvancedTrainingGoal;
  secondary_goals?: AdvancedTrainingGoal[];
  experience_level: AdvancedExperienceLevel;
  competition_dates?: string[];
  notes?: string;
  mesocycles: Mesocycle[];
  created_at: string;
  updated_at: string;
}

// Interfaz para mesociclo
export interface Mesocycle {
  id: string;
  macrocycle_id?: string;
  name: string;
  description?: string;
  phase: TrainingPhase;
  start_date: string;
  end_date: string;
  duration_weeks: number;
  volume_level: number; // 1-10
  intensity_level: number; // 1-10
  frequency_per_week: number;
  primary_focus: string; // Ej: "Pecho/Espalda", "Fuerza", etc.
  secondary_focus?: string[];
  includes_deload: boolean;
  deload_strategy?: DeloadStrategy;
  deload_week?: number; // Semana de deload (1 = primera semana, -1 = última semana)
  volume_progression: 'linear' | 'step' | 'wave' | 'undulating';
  intensity_progression: 'linear' | 'step' | 'wave' | 'undulating';
  microcycles: Microcycle[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Interfaz para microciclo
export interface Microcycle {
  id: string;
  mesocycle_id: string;
  week_number: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_deload: boolean;
  volume_level: number; // 1-10
  intensity_level: number; // 1-10
  fatigue_target: number; // 1-10
  sessions: AdvancedTrainingSession[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Interfaz para sesión de entrenamiento avanzada
export interface AdvancedTrainingSession {
  id: string;
  microcycle_id: string;
  day_of_week: number; // 1-7 (lunes-domingo)
  name: string;
  description?: string;
  primary_focus: string;
  secondary_focus?: string[];
  duration_minutes: number;
  exercises: AdvancedExerciseConfig[];
  special_techniques?: AdvancedTechniqueConfig[];
  warm_up_protocol?: string;
  cool_down_protocol?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Interfaz para configuración avanzada de ejercicio
export interface AdvancedExerciseConfig {
  id: string;
  exercise_id: string;
  order: number;
  sets: AdvancedSet[];
  rest_between_sets: number; // segundos
  tempo?: string; // Formato: "4-1-2-0" (excéntrico-pausa inferior-concéntrico-pausa superior)
  special_technique?: AdvancedTechnique;
  special_technique_config?: any;
  notes?: string;
}

// Interfaz para serie avanzada
export interface AdvancedSet {
  set_number: number;
  reps: number | string; // Puede ser un número o un rango (ej: "8-12")
  weight?: number | string; // Puede ser un número o un porcentaje (ej: "80%")
  rpe?: number; // Rating of Perceived Exertion (1-10)
  rir?: number; // Reps in Reserve (0-5)
  is_amrap?: boolean; // As Many Reps As Possible
  is_warmup?: boolean;
  tempo?: string; // Puede sobrescribir el tempo del ejercicio
  rest_after?: number; // Descanso después de esta serie (segundos)
  notes?: string;
}

// Interfaz para configuración de técnica avanzada
export interface AdvancedTechniqueConfig {
  id: string;
  technique: AdvancedTechnique;
  exercise_ids: string[]; // Ejercicios a los que se aplica
  parameters: {
    [key: string]: any; // Parámetros específicos de la técnica
  };
  notes?: string;
}

// Interfaz para análisis de rendimiento
export interface PerformanceAnalysis {
  id: string;
  user_id: string;
  date: string;
  period_start: string;
  period_end: string;
  metrics: {
    [key in PerformanceMetric]?: number | {
      value: number;
      change: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
  };
  volume_landmarks?: {
    mev?: number; // Minimum Effective Volume
    mav?: number; // Maximum Adaptive Volume
    mrv?: number; // Maximum Recoverable Volume
  };
  fatigue_analysis?: {
    current_level: number; // 1-10
    recovery_status: number; // 1-10
    recommendations: string[];
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Interfaz para configuración de volumen por grupo muscular
export interface MuscleGroupVolumeConfig {
  muscle_group: string;
  weekly_sets: {
    minimum: number;
    optimal: number;
    maximum: number;
  };
  frequency: {
    minimum: number;
    optimal: number;
    maximum: number;
  };
  recovery_time: number; // Horas estimadas para recuperación completa
  priority_level: number; // 1-5 (1 = máxima prioridad)
  notes?: string;
}

// Interfaz para perfil de entrenamiento avanzado
export interface AdvancedTrainingProfile {
  user_id: string;
  experience_level: AdvancedExperienceLevel;
  training_age: number; // Años de entrenamiento
  primary_goal: AdvancedTrainingGoal;
  secondary_goals: AdvancedTrainingGoal[];
  weekly_availability: number; // Horas disponibles por semana
  session_duration_preference: number; // Minutos
  equipment_access: string[];
  training_preferences: {
    preferred_split: string;
    preferred_frequency: number;
    preferred_volume: number; // 1-10
    preferred_intensity: number; // 1-10
    preferred_exercise_selection: string[];
    avoided_exercise_selection: string[];
  };
  strength_profile: {
    [key: string]: number; // Ejercicio -> 1RM
  };
  volume_landmarks: {
    [key: string]: {
      mev: number; // Minimum Effective Volume (series semanales)
      mav: number; // Maximum Adaptive Volume (series semanales)
      mrv: number; // Maximum Recoverable Volume (series semanales)
    };
  };
  recovery_profile: {
    general_recovery: number; // 1-10
    sleep_quality: number; // 1-10
    stress_level: number; // 1-10
    nutrition_quality: number; // 1-10
  };
  created_at: string;
  updated_at: string;
}
