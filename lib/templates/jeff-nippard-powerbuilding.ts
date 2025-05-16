/**
 * Jeff Nippard Powerbuilding Program
 * Basado en el programa Powerbuilding de Jeff Nippard
 * 
 * Características:
 * - Programa de 4 días por semana
 * - Combina entrenamiento de fuerza y hipertrofia
 * - Incluye periodización de volumen e intensidad
 * - Semanas de descarga programadas
 * - Enfoque en los levantamientos principales
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
  restTime: number = 120,
  isDropSet: boolean = false,
  isRestPause: boolean = false,
  isMechanicalSet: boolean = false
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
    isMechanicalSet
  }));
};

// Upper Body A (Strength Focus)
export const createUpperBodyA = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Upper A (Fuerza)",
    description: "Día de tren superior con enfoque en fuerza para press de banca y movimientos de empuje",
    targetMuscleGroups: ["chest", "shoulders", "triceps", "back", "biceps"],
    difficulty: "intermediate",
    estimatedDuration: 75,
    exerciseSets: [
      // Main compound movements
      ...createExerciseSet("bench-press", 5, 2, 1, undefined, true, "Serie de calentamiento", 120),
      ...createExerciseSet("bench-press", 5, 2, 4, undefined, false, "Series principales con progresión de fuerza", 180),
      ...createExerciseSet("overhead-press", 8, 2, 3, undefined, false, "Press militar para hombros", 150),
      ...createExerciseSet("weighted-pull-up", 8, 2, 3, undefined, false, "Dominadas lastradas para espalda", 150),
      
      // Accessory movements
      ...createExerciseSet("incline-dumbbell-press", 10, 2, 3, undefined, false, "Press inclinado para pecho superior", 120),
      ...createExerciseSet("cable-row", 12, 2, 3, undefined, false, "Remo con cable para espalda media", 120),
      ...createExerciseSet("lateral-raise", 15, 1, 3, undefined, false, "Elevaciones laterales para deltoides", 60),
      ...createExerciseSet("triceps-pushdown", 12, 1, 3, undefined, false, "Extensiones de tríceps", 60),
      ...createExerciseSet("bicep-curl", 12, 1, 3, undefined, false, "Curl de bíceps", 60)
    ]
  };
};

// Lower Body A (Strength Focus)
export const createLowerBodyA = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Lower A (Fuerza)",
    description: "Día de tren inferior con enfoque en fuerza para sentadilla y movimientos de cuádriceps",
    targetMuscleGroups: ["quads", "hamstrings", "glutes", "calves"],
    difficulty: "intermediate",
    estimatedDuration: 75,
    exerciseSets: [
      // Main compound movements
      ...createExerciseSet("squat", 5, 2, 1, undefined, true, "Serie de calentamiento", 120),
      ...createExerciseSet("squat", 5, 2, 4, undefined, false, "Series principales con progresión de fuerza", 210),
      ...createExerciseSet("romanian-deadlift", 8, 2, 3, undefined, false, "Peso muerto rumano para isquiotibiales", 180),
      
      // Accessory movements
      ...createExerciseSet("leg-press", 10, 2, 3, undefined, false, "Prensa para cuádriceps", 150),
      ...createExerciseSet("leg-curl", 12, 1, 3, undefined, false, "Curl femoral para isquiotibiales", 90),
      ...createExerciseSet("walking-lunge", 12, 1, 3, undefined, false, "Zancadas para glúteos y cuádriceps", 90),
      ...createExerciseSet("calf-raise", 15, 1, 4, undefined, false, "Elevaciones de talones para pantorrillas", 60)
    ]
  };
};

// Upper Body B (Hypertrophy Focus)
export const createUpperBodyB = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Upper B (Hipertrofia)",
    description: "Día de tren superior con enfoque en hipertrofia para espalda y bíceps",
    targetMuscleGroups: ["back", "biceps", "chest", "shoulders", "triceps"],
    difficulty: "intermediate",
    estimatedDuration: 75,
    exerciseSets: [
      // Main compound movements
      ...createExerciseSet("barbell-row", 8, 2, 4, undefined, false, "Remo con barra para espalda", 150),
      ...createExerciseSet("incline-bench-press", 8, 2, 3, undefined, false, "Press inclinado para pecho superior", 150),
      ...createExerciseSet("lat-pulldown", 10, 2, 3, undefined, false, "Jalón al pecho para dorsales", 120),
      
      // Accessory movements
      ...createExerciseSet("dumbbell-shoulder-press", 10, 2, 3, undefined, false, "Press de hombros con mancuernas", 120),
      ...createExerciseSet("chest-fly", 12, 1, 3, undefined, false, "Aperturas para pecho", 90),
      ...createExerciseSet("face-pull", 15, 1, 3, undefined, false, "Face pulls para deltoides posteriores", 60),
      ...createExerciseSet("hammer-curl", 12, 1, 3, undefined, false, "Curl martillo para bíceps", 60),
      ...createExerciseSet("skull-crusher", 12, 1, 3, undefined, false, "Extensiones de tríceps tumbado", 60)
    ]
  };
};

// Lower Body B (Hypertrophy Focus)
export const createLowerBodyB = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Lower B (Hipertrofia)",
    description: "Día de tren inferior con enfoque en hipertrofia para isquiotibiales y glúteos",
    targetMuscleGroups: ["hamstrings", "glutes", "quads", "calves"],
    difficulty: "intermediate",
    estimatedDuration: 75,
    exerciseSets: [
      // Main compound movements
      ...createExerciseSet("deadlift", 5, 2, 1, undefined, true, "Serie de calentamiento", 120),
      ...createExerciseSet("deadlift", 5, 2, 4, undefined, false, "Series principales con progresión de fuerza", 210),
      ...createExerciseSet("front-squat", 8, 2, 3, undefined, false, "Sentadilla frontal para cuádriceps", 180),
      
      // Accessory movements
      ...createExerciseSet("bulgarian-split-squat", 10, 2, 3, undefined, false, "Sentadilla búlgara para glúteos", 120),
      ...createExerciseSet("leg-extension", 12, 1, 3, undefined, false, "Extensiones para cuádriceps", 90),
      ...createExerciseSet("hip-thrust", 12, 1, 3, undefined, false, "Hip thrust para glúteos", 120),
      ...createExerciseSet("seated-calf-raise", 15, 1, 4, undefined, false, "Elevaciones de talones sentado", 60)
    ]
  };
};

// Deload Upper Body
export const createDeloadUpperBody = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Upper (Deload)",
    description: "Día de tren superior con carga reducida para recuperación",
    targetMuscleGroups: ["chest", "back", "shoulders", "triceps", "biceps"],
    difficulty: "beginner",
    estimatedDuration: 60,
    exerciseSets: [
      ...createExerciseSet("bench-press", 5, 3, 3, undefined, false, "60% del peso habitual", 120),
      ...createExerciseSet("barbell-row", 8, 3, 3, undefined, false, "60% del peso habitual", 120),
      ...createExerciseSet("overhead-press", 8, 3, 2, undefined, false, "60% del peso habitual", 120),
      ...createExerciseSet("lat-pulldown", 10, 3, 2, undefined, false, "60% del peso habitual", 90),
      ...createExerciseSet("triceps-pushdown", 12, 3, 2, undefined, false, "60% del peso habitual", 60),
      ...createExerciseSet("bicep-curl", 12, 3, 2, undefined, false, "60% del peso habitual", 60)
    ]
  };
};

// Deload Lower Body
export const createDeloadLowerBody = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Lower (Deload)",
    description: "Día de tren inferior con carga reducida para recuperación",
    targetMuscleGroups: ["quads", "hamstrings", "glutes", "calves"],
    difficulty: "beginner",
    estimatedDuration: 60,
    exerciseSets: [
      ...createExerciseSet("squat", 5, 3, 3, undefined, false, "60% del peso habitual", 120),
      ...createExerciseSet("romanian-deadlift", 8, 3, 3, undefined, false, "60% del peso habitual", 120),
      ...createExerciseSet("leg-press", 10, 3, 2, undefined, false, "60% del peso habitual", 90),
      ...createExerciseSet("leg-curl", 12, 3, 2, undefined, false, "60% del peso habitual", 60),
      ...createExerciseSet("calf-raise", 15, 3, 2, undefined, false, "60% del peso habitual", 60)
    ]
  };
};

// Create the full Powerbuilding routine
export const createJeffNippardPowerbuilding = (userId: string): WorkoutRoutine => {
  return {
    id: uuidv4(),
    userId: userId,
    name: "Jeff Nippard Powerbuilding",
    description: "Programa que combina entrenamiento de fuerza y hipertrofia con 4 días por semana. Ideal para ganar fuerza y tamaño muscular.",
    days: [
      createUpperBodyA(),
      createLowerBodyA(),
      createUpperBodyB(),
      createLowerBodyB()
    ],
    frequency: 4,
    goal: "strength",
    level: "intermediate",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    startDate: new Date().toISOString(),
    includesDeload: true,
    deloadFrequency: 4,
    deloadStrategy: "volume",
    source: "Jeff Nippard",
    tags: ["powerbuilding", "fuerza", "hipertrofia", "4 días"],
    split: "upper_lower"
  };
};

// Create the deload week
export const createJeffNippardPowerbuildingDeload = (userId: string): WorkoutRoutine => {
  return {
    id: uuidv4(),
    userId: userId,
    name: "Jeff Nippard Powerbuilding (Deload)",
    description: "Semana de descarga para el programa Powerbuilding. Reduce el volumen y la intensidad para facilitar la recuperación.",
    days: [
      createDeloadUpperBody(),
      createDeloadLowerBody()
    ],
    frequency: 2,
    goal: "strength",
    level: "beginner",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: false,
    startDate: new Date().toISOString(),
    includesDeload: true,
    deloadFrequency: 4,
    deloadStrategy: "volume",
    source: "Jeff Nippard",
    tags: ["powerbuilding", "deload", "recuperación"],
    split: "upper_lower"
  };
};
