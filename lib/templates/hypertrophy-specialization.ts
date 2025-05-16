/**
 * Hypertrophy Specialization Program
 * Basado en el Hypertrophy Handbook y principios avanzados de hipertrofia
 * 
 * Características:
 * - Programa de 5 días por semana
 * - Especialización en hipertrofia con técnicas avanzadas
 * - Periodización de volumen ondulante
 * - Semanas de descarga programadas
 * - Técnicas de intensidad y volumen avanzadas
 */

import { WorkoutRoutine, WorkoutDay, ExerciseSet } from "@/lib/types/training";
import { v4 as uuidv4 } from "uuid";

// Helper function to create exercise sets
const createExerciseSet = (
  exerciseId: string,
  targetReps: number,
  targetRir: number,
  sets: number = 3,
  weight?: number,
  isWarmup: boolean = false,
  notes?: string,
  restTime: number = 90,
  isDropSet: boolean = false,
  isRestPause: boolean = false,
  isMechanicalSet: boolean = false,
  isMyoReps: boolean = false,
  tempoTiming?: string
): ExerciseSet[] => {
  return Array(sets).fill(0).map(() => ({
    id: uuidv4(),
    exerciseId,
    targetReps,
    targetRir,
    weight,
    isWarmup,
    notes,
    restTime,
    isDropSet,
    isRestPause,
    isMechanicalSet,
    isMyoReps,
    tempoTiming
  }));
};

// Chest & Shoulders Day
export const createChestShouldersDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Pecho y Hombros",
    description: "Día de especialización en pecho y hombros con técnicas avanzadas de hipertrofia",
    targetMuscleGroups: ["chest", "shoulders", "triceps"],
    difficulty: "advanced",
    estimatedDuration: 80,
    exerciseSets: [
      // Compound movements
      ...createExerciseSet("incline-bench-press", 8, 2, 4, undefined, false, "Press inclinado como movimiento principal", 180),
      ...createExerciseSet("flat-dumbbell-press", 10, 1, 3, undefined, false, "Press con mancuernas para mayor rango de movimiento", 120),
      ...createExerciseSet("overhead-press", 8, 2, 3, undefined, false, "Press militar para hombros", 150),
      
      // Isolation with advanced techniques
      ...createExerciseSet("cable-fly", 12, 1, 3, undefined, false, "Aperturas con cable con tensión constante", 90, true),
      ...createExerciseSet("lateral-raise", 15, 1, 4, undefined, false, "Elevaciones laterales con técnica de gota", 60, true),
      ...createExerciseSet("rear-delt-fly", 15, 1, 3, undefined, false, "Aperturas para deltoides posteriores", 60),
      ...createExerciseSet("triceps-pushdown", 12, 1, 3, undefined, false, "Extensiones de tríceps con técnica rest-pause", 60, false, true),
      ...createExerciseSet("overhead-triceps-extension", 12, 1, 3, undefined, false, "Extensiones de tríceps sobre la cabeza", 60)
    ]
  };
};

// Back & Biceps Day
export const createBackBicepsDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Espalda y Bíceps",
    description: "Día de especialización en espalda y bíceps con enfoque en tiempo bajo tensión",
    targetMuscleGroups: ["back", "lats", "traps", "biceps", "forearms"],
    difficulty: "advanced",
    estimatedDuration: 80,
    exerciseSets: [
      // Compound movements
      ...createExerciseSet("weighted-pull-up", 8, 2, 4, undefined, false, "Dominadas lastradas para dorsales", 180),
      ...createExerciseSet("barbell-row", 10, 2, 4, undefined, false, "Remo con barra para espalda media", 150, false, false, false, false, "3-0-1-0"),
      ...createExerciseSet("chest-supported-row", 12, 1, 3, undefined, false, "Remo con soporte para espalda alta", 120),
      
      // Isolation with advanced techniques
      ...createExerciseSet("lat-pulldown", 12, 1, 3, undefined, false, "Jalón al pecho con agarre cerrado", 90),
      ...createExerciseSet("straight-arm-pulldown", 15, 1, 3, undefined, false, "Jalón con brazos rectos para dorsales", 60),
      ...createExerciseSet("face-pull", 15, 1, 3, undefined, false, "Face pulls para deltoides posteriores y trapecios", 60),
      ...createExerciseSet("barbell-curl", 10, 1, 3, undefined, false, "Curl con barra para bíceps", 90, false, true),
      ...createExerciseSet("incline-dumbbell-curl", 12, 1, 3, undefined, false, "Curl inclinado para bíceps con mayor estiramiento", 60, false, false, false, true)
    ]
  };
};

// Legs Day (Quad Focus)
export const createQuadFocusLegsDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Piernas (Cuádriceps)",
    description: "Día de piernas con enfoque en cuádriceps y técnicas de alta intensidad",
    targetMuscleGroups: ["quads", "glutes", "calves"],
    difficulty: "advanced",
    estimatedDuration: 85,
    exerciseSets: [
      // Compound movements
      ...createExerciseSet("squat", 6, 2, 5, undefined, false, "Sentadilla como movimiento principal", 210),
      ...createExerciseSet("hack-squat", 10, 1, 3, undefined, false, "Hack squat para cuádriceps", 180),
      ...createExerciseSet("leg-press", 12, 1, 3, undefined, false, "Prensa para cuádriceps con técnica de gota", 150, true),
      
      // Isolation with advanced techniques
      ...createExerciseSet("leg-extension", 15, 1, 4, undefined, false, "Extensiones para cuádriceps con isometría", 90, false, false, false, false, "2-2-1-0"),
      ...createExerciseSet("walking-lunge", 12, 1, 3, undefined, false, "Zancadas para glúteos y cuádriceps", 90),
      ...createExerciseSet("sissy-squat", 12, 1, 3, undefined, false, "Sissy squat para cuádriceps", 60),
      ...createExerciseSet("standing-calf-raise", 15, 1, 4, undefined, false, "Elevaciones de talones de pie", 60),
      ...createExerciseSet("seated-calf-raise", 15, 1, 3, undefined, false, "Elevaciones de talones sentado", 60, false, false, false, false, "2-1-1-1")
    ]
  };
};

// Legs Day (Hamstring Focus)
export const createHamstringFocusLegsDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Piernas (Isquiotibiales)",
    description: "Día de piernas con enfoque en isquiotibiales y glúteos",
    targetMuscleGroups: ["hamstrings", "glutes", "calves"],
    difficulty: "advanced",
    estimatedDuration: 80,
    exerciseSets: [
      // Compound movements
      ...createExerciseSet("romanian-deadlift", 8, 2, 4, undefined, false, "Peso muerto rumano como movimiento principal", 180),
      ...createExerciseSet("good-morning", 10, 2, 3, undefined, false, "Buenos días para isquiotibiales y espalda baja", 150),
      ...createExerciseSet("glute-ham-raise", 10, 1, 3, undefined, false, "GHR para isquiotibiales", 120),
      
      // Isolation with advanced techniques
      ...createExerciseSet("leg-curl", 12, 1, 4, undefined, false, "Curl femoral con técnica de gota", 90, true),
      ...createExerciseSet("hip-thrust", 12, 1, 4, undefined, false, "Hip thrust para glúteos", 120),
      ...createExerciseSet("cable-pull-through", 15, 1, 3, undefined, false, "Pull through para glúteos e isquiotibiales", 60),
      ...createExerciseSet("standing-calf-raise", 15, 1, 3, undefined, false, "Elevaciones de talones de pie", 60),
      ...createExerciseSet("seated-calf-raise", 15, 1, 3, undefined, false, "Elevaciones de talones sentado", 60, false, false, false, false, "2-1-1-1")
    ]
  };
};

// Arms & Shoulders Day
export const createArmsAndShouldersDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Brazos y Hombros",
    description: "Día de especialización en brazos y hombros con técnicas de intensidad",
    targetMuscleGroups: ["biceps", "triceps", "shoulders", "forearms"],
    difficulty: "advanced",
    estimatedDuration: 75,
    exerciseSets: [
      // Compound movements
      ...createExerciseSet("close-grip-bench-press", 8, 2, 4, undefined, false, "Press de banca agarre cerrado para tríceps", 150),
      ...createExerciseSet("dumbbell-shoulder-press", 10, 2, 3, undefined, false, "Press de hombros con mancuernas", 120),
      
      // Isolation with advanced techniques
      ...createExerciseSet("ez-bar-curl", 10, 1, 3, undefined, false, "Curl con barra EZ para bíceps", 90, false, true),
      ...createExerciseSet("incline-dumbbell-curl", 12, 1, 3, undefined, false, "Curl inclinado para bíceps", 60),
      ...createExerciseSet("hammer-curl", 12, 1, 3, undefined, false, "Curl martillo para braquial", 60),
      ...createExerciseSet("triceps-pushdown", 12, 1, 3, undefined, false, "Extensiones de tríceps con técnica de gota", 60, true),
      ...createExerciseSet("overhead-triceps-extension", 12, 1, 3, undefined, false, "Extensiones de tríceps sobre la cabeza", 60),
      ...createExerciseSet("lateral-raise", 15, 1, 4, undefined, false, "Elevaciones laterales con técnica myo-reps", 60, false, false, false, true),
      ...createExerciseSet("rear-delt-fly", 15, 1, 3, undefined, false, "Aperturas para deltoides posteriores", 60)
    ]
  };
};

// Deload Day (Upper Body)
export const createDeloadUpperBody = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Tren Superior (Deload)",
    description: "Día de tren superior con carga reducida para recuperación",
    targetMuscleGroups: ["chest", "back", "shoulders", "triceps", "biceps"],
    difficulty: "beginner",
    estimatedDuration: 60,
    exerciseSets: [
      ...createExerciseSet("bench-press", 8, 3, 2, undefined, false, "60% del peso habitual", 120),
      ...createExerciseSet("lat-pulldown", 10, 3, 2, undefined, false, "60% del peso habitual", 90),
      ...createExerciseSet("dumbbell-shoulder-press", 10, 3, 2, undefined, false, "60% del peso habitual", 90),
      ...createExerciseSet("cable-row", 12, 3, 2, undefined, false, "60% del peso habitual", 60),
      ...createExerciseSet("triceps-pushdown", 12, 3, 2, undefined, false, "60% del peso habitual", 60),
      ...createExerciseSet("bicep-curl", 12, 3, 2, undefined, false, "60% del peso habitual", 60)
    ]
  };
};

// Deload Day (Lower Body)
export const createDeloadLowerBody = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Tren Inferior (Deload)",
    description: "Día de tren inferior con carga reducida para recuperación",
    targetMuscleGroups: ["quads", "hamstrings", "glutes", "calves"],
    difficulty: "beginner",
    estimatedDuration: 60,
    exerciseSets: [
      ...createExerciseSet("leg-press", 10, 3, 2, undefined, false, "60% del peso habitual", 120),
      ...createExerciseSet("romanian-deadlift", 10, 3, 2, undefined, false, "60% del peso habitual", 120),
      ...createExerciseSet("leg-extension", 12, 3, 2, undefined, false, "60% del peso habitual", 60),
      ...createExerciseSet("leg-curl", 12, 3, 2, undefined, false, "60% del peso habitual", 60),
      ...createExerciseSet("calf-raise", 15, 3, 2, undefined, false, "60% del peso habitual", 60)
    ]
  };
};

// Create the full Hypertrophy Specialization routine
export const createHypertrophySpecialization = (userId: string): WorkoutRoutine => {
  return {
    id: uuidv4(),
    userId: userId,
    name: "Hypertrophy Specialization",
    description: "Programa avanzado de hipertrofia con 5 días por semana y técnicas especializadas para maximizar el crecimiento muscular.",
    days: [
      createChestShouldersDay(),
      createBackBicepsDay(),
      createQuadFocusLegsDay(),
      createArmsAndShouldersDay(),
      createHamstringFocusLegsDay()
    ],
    frequency: 5,
    goal: "hypertrophy",
    level: "advanced",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    startDate: new Date().toISOString(),
    includesDeload: true,
    deloadFrequency: 5,
    deloadStrategy: "volume",
    source: "The Hypertrophy Handbook",
    tags: ["hipertrofia", "avanzado", "5 días", "técnicas avanzadas"],
    split: "body_part"
  };
};

// Create the deload week
export const createHypertrophySpecializationDeload = (userId: string): WorkoutRoutine => {
  return {
    id: uuidv4(),
    userId: userId,
    name: "Hypertrophy Specialization (Deload)",
    description: "Semana de descarga para el programa de hipertrofia. Reduce el volumen y la intensidad para facilitar la recuperación.",
    days: [
      createDeloadUpperBody(),
      createDeloadLowerBody()
    ],
    frequency: 2,
    goal: "hypertrophy",
    level: "beginner",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: false,
    startDate: new Date().toISOString(),
    includesDeload: true,
    deloadFrequency: 5,
    deloadStrategy: "volume",
    source: "The Hypertrophy Handbook",
    tags: ["hipertrofia", "deload", "recuperación"],
    split: "upper_lower"
  };
};
