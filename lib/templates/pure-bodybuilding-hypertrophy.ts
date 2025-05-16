/**
 * Pure Bodybuilding Phase 2 - Hypertrophy Handbook Template
 * Basado en el programa Pure Bodybuilding Phase 2 Hypertrophy Handbook
 * 
 * Características:
 * - Programa PPL de 6 días por semana
 * - Periodización por bloques
 * - Técnicas avanzadas específicas
 * - Alternativas de ejercicios
 * - Gestión de fatiga y descargas
 */

import { v4 as uuidv4 } from "uuid";
import { WorkoutRoutine, WorkoutDay, ExerciseSet } from "@/lib/types/training";

// Función auxiliar para crear series de ejercicios
const createExerciseSet = (
  exerciseId: string,
  reps: number,
  rir: number,
  sets: number,
  alternativeExerciseId?: string,
  isWarmup: boolean = false,
  notes?: string,
  restTime: number = 90,
  isDropSet: boolean = false,
  isRestPause: boolean = false,
  isMechanicalSet: boolean = false
): ExerciseSet[] => {
  const result: ExerciseSet[] = [];
  
  for (let i = 0; i < sets; i++) {
    result.push({
      id: uuidv4(),
      exerciseId,
      alternativeExerciseId,
      targetReps: reps,
      targetRir: rir,
      restTime,
      isWarmup: isWarmup && i === 0,
      isDropSet: isDropSet && i === sets - 1,
      isRestPause: isRestPause && i === sets - 1,
      isMechanicalSet: isMechanicalSet && i === sets - 1,
      notes: i === 0 ? notes : undefined
    });
  }
  
  return result;
};

// Día de Push A (Pecho enfocado)
const createPushADay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Push A (Pecho enfocado)",
    description: "Entrenamiento de empuje con enfoque en pecho",
    targetMuscleGroups: ["chest", "shoulders", "triceps"],
    difficulty: "advanced",
    estimatedDuration: 75,
    exerciseSets: [
      // Ejercicio compuesto principal con calentamiento
      ...createExerciseSet("bench-press", 6, 1, 4, "incline-bench-press", true, "Calentamiento progresivo. Doble progresión.", 180),
      
      // Ejercicio compuesto secundario
      ...createExerciseSet("incline-dumbbell-press", 8, 2, 4, "machine-chest-press", false, "Enfoque en parte superior del pecho", 120),
      
      // Ejercicio de aislamiento para pecho
      ...createExerciseSet("cable-fly", 10, 2, 3, "dumbbell-fly", false, "Técnica: Drop Set en última serie", 90, true),
      
      // Ejercicio compuesto para hombros
      ...createExerciseSet("seated-dumbbell-press", 8, 2, 3, "machine-shoulder-press", false, "Enfoque en deltoides anterior", 120),
      
      // Ejercicio de aislamiento para hombros
      ...createExerciseSet("lateral-raise", 12, 2, 3, "cable-lateral-raise", false, "Técnica: Rest-Pause en última serie", 60, false, true),
      
      // Ejercicio de aislamiento para tríceps
      ...createExerciseSet("triceps-pushdown", 10, 2, 3, "overhead-triceps-extension", false, "Técnica: Drop Set en última serie", 60, true)
    ]
  };
};

// Día de Pull A (Espalda enfocado)
const createPullADay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Pull A (Espalda enfocado)",
    description: "Entrenamiento de tirón con enfoque en espalda",
    targetMuscleGroups: ["back", "biceps", "forearms"],
    difficulty: "advanced",
    estimatedDuration: 75,
    exerciseSets: [
      // Ejercicio compuesto principal con calentamiento
      ...createExerciseSet("pull-up", 8, 1, 4, "lat-pulldown", true, "Calentamiento progresivo. Doble progresión.", 180),
      
      // Ejercicio compuesto secundario
      ...createExerciseSet("barbell-row", 8, 2, 4, "t-bar-row", false, "Enfoque en retracción escapular", 120),
      
      // Ejercicio de aislamiento para espalda
      ...createExerciseSet("seated-cable-row", 10, 2, 3, "chest-supported-row", false, "Técnica: Drop Set en última serie", 90, true),
      
      // Ejercicio de aislamiento para espalda alta
      ...createExerciseSet("face-pull", 15, 2, 3, "reverse-fly", false, "Enfoque en rotación externa", 60),
      
      // Ejercicio compuesto para bíceps
      ...createExerciseSet("barbell-curl", 8, 1, 3, "ez-bar-curl", false, "Técnica: Rest-Pause en última serie", 90, false, true),
      
      // Ejercicio de aislamiento para bíceps
      ...createExerciseSet("incline-dumbbell-curl", 10, 2, 3, "hammer-curl", false, "Técnica: Series Mecánicas", 60, false, false, true)
    ]
  };
};

// Día de Legs A (Cuádriceps enfocado)
const createLegsADay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Legs A (Cuádriceps enfocado)",
    description: "Entrenamiento de piernas con enfoque en cuádriceps",
    targetMuscleGroups: ["quads", "hamstrings", "glutes", "calves"],
    difficulty: "advanced",
    estimatedDuration: 80,
    exerciseSets: [
      // Ejercicio compuesto principal con calentamiento
      ...createExerciseSet("squat", 6, 1, 4, "leg-press", true, "Calentamiento progresivo. Doble progresión.", 180),
      
      // Ejercicio compuesto secundario
      ...createExerciseSet("leg-press", 10, 2, 3, "hack-squat", false, "Pies juntos para enfoque en cuádriceps", 150),
      
      // Ejercicio de aislamiento para cuádriceps
      ...createExerciseSet("leg-extension", 12, 2, 3, "sissy-squat", false, "Técnica: Drop Set en última serie", 90, true),
      
      // Ejercicio compuesto para isquiotibiales
      ...createExerciseSet("romanian-deadlift", 8, 2, 3, "good-morning", false, "Enfoque en isquiotibiales", 120),
      
      // Ejercicio de aislamiento para isquiotibiales
      ...createExerciseSet("leg-curl", 12, 2, 3, "glute-ham-raise", false, "Técnica: Rest-Pause en última serie", 90, false, true),
      
      // Ejercicio de aislamiento para pantorrillas
      ...createExerciseSet("standing-calf-raise", 15, 1, 4, "seated-calf-raise", false, "Técnica: Series Mecánicas", 60, false, false, true)
    ]
  };
};

// Día de Push B (Hombros enfocado)
const createPushBDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Push B (Hombros enfocado)",
    description: "Entrenamiento de empuje con enfoque en hombros",
    targetMuscleGroups: ["shoulders", "chest", "triceps"],
    difficulty: "advanced",
    estimatedDuration: 75,
    exerciseSets: [
      // Ejercicio compuesto principal con calentamiento
      ...createExerciseSet("overhead-press", 6, 1, 4, "seated-dumbbell-press", true, "Calentamiento progresivo. Doble progresión.", 180),
      
      // Ejercicio compuesto secundario
      ...createExerciseSet("incline-bench-press", 8, 2, 3, "landmine-press", false, "Enfoque en parte superior del pecho", 120),
      
      // Ejercicio de aislamiento para hombros
      ...createExerciseSet("lateral-raise", 12, 2, 4, "cable-lateral-raise", false, "Técnica: Drop Set en última serie", 60, true),
      
      // Ejercicio de aislamiento para hombros posteriores
      ...createExerciseSet("reverse-fly", 12, 2, 3, "face-pull", false, "Enfoque en deltoides posterior", 60),
      
      // Ejercicio compuesto para tríceps
      ...createExerciseSet("close-grip-bench-press", 8, 2, 3, "dips", false, "Técnica: Rest-Pause en última serie", 90, false, true),
      
      // Ejercicio de aislamiento para tríceps
      ...createExerciseSet("overhead-triceps-extension", 10, 2, 3, "skull-crusher", false, "Técnica: Drop Set en última serie", 60, true)
    ]
  };
};

// Día de Pull B (Bíceps enfocado)
const createPullBDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Pull B (Bíceps enfocado)",
    description: "Entrenamiento de tirón con enfoque en bíceps",
    targetMuscleGroups: ["biceps", "back", "forearms"],
    difficulty: "advanced",
    estimatedDuration: 75,
    exerciseSets: [
      // Ejercicio compuesto principal con calentamiento
      ...createExerciseSet("weighted-pull-up", 6, 1, 4, "lat-pulldown", true, "Calentamiento progresivo. Doble progresión.", 180),
      
      // Ejercicio compuesto secundario
      ...createExerciseSet("pendlay-row", 8, 2, 3, "chest-supported-row", false, "Enfoque en explosividad", 120),
      
      // Ejercicio de aislamiento para espalda
      ...createExerciseSet("single-arm-row", 10, 2, 3, "meadows-row", false, "Técnica: Rest-Pause en última serie", 90, false, true),
      
      // Ejercicio compuesto para bíceps
      ...createExerciseSet("barbell-curl", 8, 1, 4, "ez-bar-curl", false, "Técnica: Drop Set en última serie", 90, true),
      
      // Ejercicio de aislamiento para bíceps
      ...createExerciseSet("preacher-curl", 10, 2, 3, "spider-curl", false, "Enfoque en porción larga del bíceps", 60),
      
      // Ejercicio de aislamiento para bíceps
      ...createExerciseSet("hammer-curl", 12, 2, 3, "cross-body-curl", false, "Técnica: Series Mecánicas", 60, false, false, true)
    ]
  };
};

// Día de Legs B (Isquiotibiales enfocado)
const createLegsBDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Legs B (Isquiotibiales enfocado)",
    description: "Entrenamiento de piernas con enfoque en isquiotibiales",
    targetMuscleGroups: ["hamstrings", "glutes", "quads", "calves"],
    difficulty: "advanced",
    estimatedDuration: 80,
    exerciseSets: [
      // Ejercicio compuesto principal con calentamiento
      ...createExerciseSet("romanian-deadlift", 6, 1, 4, "good-morning", true, "Calentamiento progresivo. Doble progresión.", 180),
      
      // Ejercicio compuesto secundario
      ...createExerciseSet("bulgarian-split-squat", 8, 2, 3, "walking-lunge", false, "Enfoque en unilateralidad", 120),
      
      // Ejercicio de aislamiento para isquiotibiales
      ...createExerciseSet("lying-leg-curl", 10, 2, 4, "seated-leg-curl", false, "Técnica: Drop Set en última serie", 90, true),
      
      // Ejercicio compuesto para glúteos
      ...createExerciseSet("hip-thrust", 10, 2, 3, "glute-bridge", false, "Enfoque en contracción máxima", 120),
      
      // Ejercicio de aislamiento para cuádriceps
      ...createExerciseSet("leg-extension", 12, 2, 3, "sissy-squat", false, "Técnica: Rest-Pause en última serie", 90, false, true),
      
      // Ejercicio de aislamiento para pantorrillas
      ...createExerciseSet("seated-calf-raise", 15, 1, 4, "standing-calf-raise", false, "Técnica: Series Mecánicas", 60, false, false, true)
    ]
  };
};

// Crear la rutina completa de Pure Bodybuilding Phase 2
export const createPureBodybuildingHypertrophyTemplate = (userId: string): WorkoutRoutine => {
  return {
    id: uuidv4(),
    userId: userId,
    name: "Pure Bodybuilding Phase 2 - Hypertrophy",
    description: "Programa avanzado de hipertrofia basado en Pure Bodybuilding Phase 2 Hypertrophy Handbook. Incluye periodización por bloques, técnicas avanzadas y alternativas de ejercicios.",
    days: [
      createPushADay(),
      createPullADay(),
      createLegsADay(),
      createPushBDay(),
      createPullBDay(),
      createLegsBDay()
    ],
    frequency: 6,
    goal: "hypertrophy",
    level: "advanced",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    startDate: new Date().toISOString(),
    includesDeload: true,
    deloadFrequency: 4,
    deloadStrategy: "volume",
    source: "Pure Bodybuilding Phase 2 Hypertrophy Handbook",
    tags: ["hipertrofia", "avanzado", "6 días", "ppl", "técnicas avanzadas"],
    split: "push_pull_legs"
  };
};
