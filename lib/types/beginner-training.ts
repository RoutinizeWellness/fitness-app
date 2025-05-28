/**
 * Tipos para el módulo de fundamentos del entrenamiento para principiantes
 */

// Tipo de ejercicio
export type ExerciseType = 
  | 'compound' // Ejercicio compuesto (involucra múltiples articulaciones)
  | 'isolation' // Ejercicio de aislamiento (involucra una sola articulación)
  | 'functional' // Ejercicio funcional (simula movimientos cotidianos)
  | 'mobility' // Ejercicio de movilidad (mejora el rango de movimiento)
  | 'stability' // Ejercicio de estabilidad (mejora el equilibrio y la postura)
  | 'cardio'; // Ejercicio cardiovascular

// Nivel de dificultad
export type DifficultyLevel = 
  | 'level_0' // Absoluto principiante
  | 'level_1' // Principiante
  | 'level_2' // Principiante avanzado
  | 'level_3' // Intermedio
  | 'level_4' // Intermedio avanzado
  | 'level_5'; // Avanzado

// Equipamiento necesario
export type RequiredEquipment = 
  | 'none' // Sin equipamiento
  | 'dumbbells' // Mancuernas
  | 'resistance_bands' // Bandas elásticas
  | 'mat' // Esterilla
  | 'bench' // Banco
  | 'pull_up_bar' // Barra de dominadas
  | 'kettlebell' // Pesa rusa
  | 'jump_rope' // Cuerda para saltar
  | 'machine'; // Máquina de gimnasio

// Grupo muscular
export type MuscleGroup = 
  | 'chest' // Pecho
  | 'back' // Espalda
  | 'shoulders' // Hombros
  | 'biceps' // Bíceps
  | 'triceps' // Tríceps
  | 'forearms' // Antebrazos
  | 'abs' // Abdominales
  | 'quads' // Cuádriceps
  | 'hamstrings' // Isquiotibiales
  | 'glutes' // Glúteos
  | 'calves' // Gemelos
  | 'full_body'; // Cuerpo completo

// Tipo de entrenamiento
export type TrainingType = 
  | 'strength' // Fuerza
  | 'hypertrophy' // Hipertrofia
  | 'endurance' // Resistencia
  | 'power' // Potencia
  | 'flexibility' // Flexibilidad
  | 'cardio' // Cardiovascular
  | 'recovery'; // Recuperación

// Fase de entrenamiento
export type TrainingPhase = 
  | 'warm_up' // Calentamiento
  | 'main_workout' // Entrenamiento principal
  | 'cool_down'; // Enfriamiento

// Interfaz para ejercicios
export interface BeginnerExercise {
  id: string;
  name: string;
  description: string;
  type: ExerciseType;
  difficulty: DifficultyLevel;
  equipment: RequiredEquipment[];
  muscles: {
    primary: MuscleGroup[];
    secondary: MuscleGroup[];
  };
  instructions: string[];
  tips: string[];
  common_mistakes: string[];
  variations: {
    easier: string[];
    harder: string[];
  };
  video_url?: string;
  image_url?: string;
  duration?: number; // En segundos
}

// Interfaz para series
export interface ExerciseSet {
  reps?: number; // Número de repeticiones
  duration?: number; // Duración en segundos (para ejercicios isométricos)
  weight?: number; // Peso en kg
  rest: number; // Descanso después de la serie en segundos
  rir?: number; // Repeticiones en reserva (0-5)
}

// Interfaz para ejercicios en una rutina
export interface RoutineExercise {
  exercise_id: string;
  sets: ExerciseSet[];
  notes?: string;
}

// Interfaz para rutinas de entrenamiento
export interface BeginnerRoutine {
  id: string;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  duration: number; // En minutos
  type: TrainingType;
  phases: {
    warm_up: RoutineExercise[];
    main_workout: RoutineExercise[];
    cool_down: RoutineExercise[];
  };
  equipment_needed: RequiredEquipment[];
  suitable_for: {
    limitations: string[];
    goals: string[];
  };
  created_at: string;
  updated_at: string;
}

// Interfaz para plan de entrenamiento semanal
export interface BeginnerTrainingPlan {
  id: string;
  user_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  days_per_week: number;
  routines: {
    day: number; // 1-7 (lunes a domingo)
    routine_id: string;
  }[];
  created_at: string;
  updated_at: string;
}

// Interfaz para logros de entrenamiento
export interface TrainingAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: {
    type: 'workouts_completed' | 'days_streak' | 'specific_exercise' | 'total_time';
    value: number;
    exercise_id?: string;
  };
  reward?: string;
  unlocked_at?: string;
}

// Interfaz para progreso de entrenamiento
export interface BeginnerTrainingProgress {
  user_id: string;
  workouts_completed: number;
  total_time: number; // En minutos
  current_streak: number;
  longest_streak: number;
  last_workout_date?: string;
  achievements: string[]; // IDs de logros desbloqueados
  exercise_progress: {
    exercise_id: string;
    times_performed: number;
    best_weight?: number;
    best_reps?: number;
  }[];
  created_at: string;
  updated_at: string;
}
