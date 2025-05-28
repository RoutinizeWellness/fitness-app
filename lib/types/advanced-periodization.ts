/**
 * Tipos para el sistema de periodización avanzada
 */

// Tipos de periodización
export type PeriodizationType =
  | 'linear'
  | 'undulating'
  | 'block'
  | 'conjugate'
  | 'dup' // Daily Undulating Periodization
  | 'wup'; // Weekly Undulating Periodization

// Fases de entrenamiento
export type TrainingPhase =
  | 'hypertrophy'
  | 'strength'
  | 'power'
  | 'endurance'
  | 'deload';

// Niveles de entrenamiento
export type TrainingLevel =
  | 'intermediate'
  | 'advanced'
  | 'elite';

// Objetivos de entrenamiento
export type TrainingGoal =
  | 'hypertrophy'
  | 'strength'
  | 'power'
  | 'endurance'
  | 'fat_loss'
  | 'maintenance'
  | 'general_fitness';

// Estrategias de deload
export type DeloadStrategy =
  | 'volume_reduction' // Reducción de volumen
  | 'intensity_reduction' // Reducción de intensidad
  | 'both_reduction' // Reducción de ambos
  | 'frequency_reduction' // Reducción de frecuencia
  | 'active_recovery'; // Recuperación activa

// Prioridad de objetivos
export type ObjectivePriority =
  | 'primary'
  | 'secondary'
  | 'tertiary';

// Interfaces principales

export interface PeriodizationProgram {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  periodization_type: PeriodizationType;
  start_date?: string;
  end_date?: string;
  goal: TrainingGoal;
  training_level: TrainingLevel;
  frequency: number; // días por semana
  structure?: any;
  is_template?: boolean;
  created_at?: string;
  updated_at?: string;
  mesocycles?: Mesocycle[];
}

export interface Mesocycle {
  id?: string;
  program_id?: string;
  name: string;
  description?: string;
  phase: TrainingPhase;
  duration_weeks: number;
  position: number;
  start_date?: string;
  end_date?: string;
  volume_level?: number; // 1-10
  intensity_level?: number; // 1-10
  includes_deload: boolean;
  deload_strategy?: DeloadStrategy;
  objectives?: TrainingObjective[];
  created_at?: string;
  updated_at?: string;
  microcycles?: Microcycle[];
}

export interface Microcycle {
  id?: string;
  mesocycle_id?: string;
  week_number: number;
  name: string;
  description?: string;
  volume_multiplier: number;
  intensity_multiplier: number;
  is_deload: boolean;
  objectives?: TrainingObjective[];
  created_at?: string;
  updated_at?: string;
  sessions?: PeriodizedSession[];
}

export interface PeriodizedSession {
  id?: string;
  microcycle_id?: string;
  day_of_week: number; // 1 (lunes) a 7 (domingo)
  name: string;
  description?: string;
  focus: string[];
  duration_minutes?: number;
  rpe_target?: number;
  rir_target?: number;
  exercises?: PeriodizedExercise[];
  special_techniques?: SpecialTechnique[];
  notes?: string;
  created_at?: string;
}

export interface PeriodizedExercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // Puede ser un rango como "8-12"
  weight?: string; // Puede ser un porcentaje o valor absoluto
  rir?: number;
  rpe?: number;
  rest_seconds?: number;
  tempo?: string; // Formato "4-1-2-0"
  special_technique_id?: string; // Referencia a una técnica especial aplicada
  exercise_order?: number; // Orden en la sesión
  superset_group_id?: string; // Para agrupar ejercicios en superseries
  notes?: string;
}

export interface SpecialTechnique {
  id: string;
  name: string;
  description?: string;
  parameters?: any; // Parámetros específicos de la técnica
  is_template?: boolean;
  created_at?: string;
}

export interface TrainingObjective {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  category: 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'skill';
  target_value?: number;
  current_value?: number;
  units?: string;
  deadline?: string;
  associated_exercise?: string;
  measurement_protocol?: string;
  success_criteria?: string;
  is_achieved?: boolean;
  created_at?: string;
  updated_at?: string;
  priority?: ObjectivePriority;
  expected_progress?: number;
}

export interface ObjectiveAssociation {
  id?: string;
  objective_id: string;
  entity_type: 'program' | 'mesocycle' | 'microcycle' | 'session';
  entity_id: string;
  priority: ObjectivePriority;
  expected_progress?: number;
  notes?: string;
  created_at?: string;
}

export interface PeriodizationTemplate {
  id?: string;
  name: string;
  description?: string;
  periodization_type: PeriodizationType;
  training_level: TrainingLevel;
  goal: TrainingGoal;
  duration_weeks: number;
  structure: any;
  is_official?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Tipos para el editor visual
export interface VisualProgramBlock {
  id: string;
  type: 'mesocycle' | 'microcycle' | 'session';
  name: string;
  phase?: TrainingPhase;
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
  color?: string;
  data: Mesocycle | Microcycle | PeriodizedSession;
  parentId?: string;
  childrenIds?: string[];
}

// Configuraciones para diferentes tipos de periodización
export interface PeriodizationConfig {
  name: string;
  description: string;
  type: PeriodizationType;
  recommendedFor: TrainingLevel[];
  bestSuitedGoals: TrainingGoal[];
  typicalDuration: number; // semanas
  phasesSequence: TrainingPhase[];
  volumePattern: 'ascending' | 'descending' | 'wave' | 'step' | 'constant';
  intensityPattern: 'ascending' | 'descending' | 'wave' | 'step' | 'constant';
  deloadFrequency: number; // cada cuántas semanas
  pros: string[];
  cons: string[];
}
