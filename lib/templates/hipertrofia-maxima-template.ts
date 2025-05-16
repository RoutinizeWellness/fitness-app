/**
 * Hipertrofia Maxima Template
 * Basado en el programa Hipertrofia Maxima Bazman Science 2
 * 
 * Características:
 * - Programa de 5 días por semana
 * - Periodización ondulante
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

// Día de Pecho y Hombros (Empuje A)
const createPechoHombrosDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Pecho y Hombros (Empuje A)",
    description: "Entrenamiento de pecho y hombros con técnicas avanzadas",
    targetMuscleGroups: ["chest", "shoulders", "triceps"],
    difficulty: "advanced",
    estimatedDuration: 75,
    exerciseSets: [
      // Ejercicio compuesto principal con calentamiento
      ...createExerciseSet("bench-press", 6, 1, 4, "incline-bench-press", true, "Calentamiento progresivo. Técnica: Series Descendentes-Ascendentes", 180),
      
      // Ejercicio compuesto secundario
      ...createExerciseSet("incline-dumbbell-press", 8, 2, 3, "machine-chest-press", false, "Técnica: Drop Set en última serie", 120, true),
      
      // Ejercicio de aislamiento para pecho
      ...createExerciseSet("cable-fly", 12, 2, 3, "dumbbell-fly", false, "Enfoque en contracción máxima", 90),
      
      // Ejercicio compuesto para hombros
      ...createExerciseSet("overhead-press", 8, 2, 3, "dumbbell-shoulder-press", false, "Técnica: Rest-Pause en última serie", 120, false, true),
      
      // Ejercicio de aislamiento para hombros
      ...createExerciseSet("lateral-raise", 15, 2, 3, "cable-lateral-raise", false, "Técnica: Series Mecánicas", 60, false, false, true),
      
      // Ejercicio de aislamiento para tríceps
      ...createExerciseSet("triceps-pushdown", 12, 2, 3, "overhead-triceps-extension", false, "Superset con el siguiente ejercicio", 60)
    ]
  };
};

// Día de Espalda y Bíceps (Tirón A)
const createEspaldaBicepsDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Espalda y Bíceps (Tirón A)",
    description: "Entrenamiento de espalda y bíceps con técnicas avanzadas",
    targetMuscleGroups: ["back", "biceps", "forearms"],
    difficulty: "advanced",
    estimatedDuration: 75,
    exerciseSets: [
      // Ejercicio compuesto principal con calentamiento
      ...createExerciseSet("pull-up", 8, 1, 4, "lat-pulldown", true, "Calentamiento progresivo. Técnica: Entrenamiento 3/7", 180),
      
      // Ejercicio compuesto secundario
      ...createExerciseSet("barbell-row", 8, 2, 3, "t-bar-row", false, "Enfoque en retracción escapular", 120),
      
      // Ejercicio de aislamiento para espalda
      ...createExerciseSet("cable-row", 10, 2, 3, "seated-row", false, "Técnica: Drop Set en última serie", 90, true),
      
      // Ejercicio de aislamiento para espalda alta
      ...createExerciseSet("face-pull", 15, 2, 3, "reverse-fly", false, "Enfoque en rotación externa", 60),
      
      // Ejercicio compuesto para bíceps
      ...createExerciseSet("barbell-curl", 8, 1, 3, "ez-bar-curl", false, "Técnica: Rest-Pause en última serie", 90, false, true),
      
      // Ejercicio de aislamiento para bíceps
      ...createExerciseSet("hammer-curl", 12, 2, 3, "incline-dumbbell-curl", false, "Técnica: Series Mecánicas", 60, false, false, true)
    ]
  };
};

// Día de Piernas (Piernas A)
const createPiernasDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Piernas (Piernas A)",
    description: "Entrenamiento de piernas con técnicas avanzadas",
    targetMuscleGroups: ["quads", "hamstrings", "glutes", "calves"],
    difficulty: "advanced",
    estimatedDuration: 80,
    exerciseSets: [
      // Ejercicio compuesto principal con calentamiento
      ...createExerciseSet("squat", 6, 1, 4, "leg-press", true, "Calentamiento progresivo. Técnica: Series Descendentes-Ascendentes", 180),
      
      // Ejercicio compuesto secundario
      ...createExerciseSet("romanian-deadlift", 8, 2, 3, "good-morning", false, "Enfoque en isquiotibiales", 150),
      
      // Ejercicio de aislamiento para cuádriceps
      ...createExerciseSet("leg-extension", 12, 2, 3, "sissy-squat", false, "Técnica: Drop Set en última serie", 90, true),
      
      // Ejercicio de aislamiento para isquiotibiales
      ...createExerciseSet("leg-curl", 12, 2, 3, "glute-ham-raise", false, "Técnica: Rest-Pause en última serie", 90, false, true),
      
      // Ejercicio de aislamiento para glúteos
      ...createExerciseSet("hip-thrust", 12, 2, 3, "cable-kickback", false, "Enfoque en contracción máxima", 90),
      
      // Ejercicio de aislamiento para pantorrillas
      ...createExerciseSet("standing-calf-raise", 15, 1, 4, "seated-calf-raise", false, "Técnica: Series Mecánicas", 60, false, false, true)
    ]
  };
};

// Día de Empuje B (Pecho, Hombros, Tríceps)
const createEmpujeBDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Empuje B (Pecho, Hombros, Tríceps)",
    description: "Segundo entrenamiento de empuje con variantes y técnicas avanzadas",
    targetMuscleGroups: ["chest", "shoulders", "triceps"],
    difficulty: "advanced",
    estimatedDuration: 75,
    exerciseSets: [
      // Ejercicio compuesto principal con calentamiento
      ...createExerciseSet("incline-bench-press", 6, 1, 4, "bench-press", true, "Calentamiento progresivo. Método Holístico", 180),
      
      // Ejercicio compuesto secundario
      ...createExerciseSet("dumbbell-shoulder-press", 8, 2, 3, "arnold-press", false, "Técnica: Drop Set en última serie", 120, true),
      
      // Ejercicio de aislamiento para pecho
      ...createExerciseSet("pec-deck", 12, 2, 3, "cable-crossover", false, "Enfoque en contracción máxima", 90),
      
      // Ejercicio de aislamiento para hombros
      ...createExerciseSet("cable-lateral-raise", 15, 2, 3, "lateral-raise", false, "Técnica: Series Mecánicas", 60, false, false, true),
      
      // Ejercicio de aislamiento para tríceps
      ...createExerciseSet("skull-crusher", 10, 2, 3, "close-grip-bench-press", false, "Técnica: Rest-Pause en última serie", 90, false, true),
      
      // Ejercicio de aislamiento para tríceps
      ...createExerciseSet("rope-pushdown", 12, 2, 3, "overhead-extension", false, "Técnica: Drop Set en última serie", 60, true)
    ]
  };
};

// Día de Tirón B (Espalda, Bíceps, Trapecios)
const createTironBDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Tirón B (Espalda, Bíceps, Trapecios)",
    description: "Segundo entrenamiento de tirón con variantes y técnicas avanzadas",
    targetMuscleGroups: ["back", "biceps", "traps"],
    difficulty: "advanced",
    estimatedDuration: 75,
    exerciseSets: [
      // Ejercicio compuesto principal con calentamiento
      ...createExerciseSet("deadlift", 5, 1, 4, "rack-pull", true, "Calentamiento progresivo. Técnica: Series Compuestas Antagonistas", 180),
      
      // Ejercicio compuesto secundario
      ...createExerciseSet("lat-pulldown", 8, 2, 3, "pull-up", false, "Agarre cerrado, enfoque en dorsal", 120),
      
      // Ejercicio de aislamiento para espalda
      ...createExerciseSet("chest-supported-row", 10, 2, 3, "single-arm-row", false, "Técnica: Drop Set en última serie", 90, true),
      
      // Ejercicio de aislamiento para trapecios
      ...createExerciseSet("barbell-shrug", 12, 2, 3, "dumbbell-shrug", false, "Técnica: Series Mecánicas", 60, false, false, true),
      
      // Ejercicio compuesto para bíceps
      ...createExerciseSet("incline-curl", 10, 2, 3, "spider-curl", false, "Técnica: Rest-Pause en última serie", 90, false, true),
      
      // Ejercicio de aislamiento para bíceps
      ...createExerciseSet("concentration-curl", 12, 2, 3, "preacher-curl", false, "Enfoque en contracción máxima", 60)
    ]
  };
};

// Crear la rutina completa de Hipertrofia Maxima
export const createHipertrofiaMaximaTemplate = (userId: string): WorkoutRoutine => {
  return {
    id: uuidv4(),
    userId: userId,
    name: "Hipertrofia Maxima Bazman Science",
    description: "Programa avanzado de hipertrofia basado en Hipertrofia Maxima Bazman Science 2. Incluye periodización ondulante, técnicas avanzadas y alternativas de ejercicios.",
    days: [
      createPechoHombrosDay(),
      createEspaldaBicepsDay(),
      createPiernasDay(),
      createEmpujeBDay(),
      createTironBDay()
    ],
    frequency: 5,
    goal: "hypertrophy",
    level: "advanced",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    startDate: new Date().toISOString(),
    includesDeload: true,
    deloadFrequency: 4,
    deloadStrategy: "volume",
    source: "Hipertrofia Maxima Bazman Science 2",
    tags: ["hipertrofia", "avanzado", "5 días", "técnicas avanzadas", "periodización"],
    split: "push_pull"
  };
};
