/**
 * Pure Bodybuilding PPL (Push Pull Legs) Program
 * Basado en el programa Pure Bodybuilding Phase 2 PPL Sheet
 *
 * Características:
 * - Programa PPL de 6 días por semana
 * - Periodización por bloques
 * - Técnicas avanzadas específicas
 * - Alternativas de ejercicios
 * - Gestión de fatiga y descargas
 * - Implementación de conceptos de Hipertrofia Maxima Bazman Science
 */

import { WorkoutRoutine, WorkoutDay, ExerciseSet } from "@/lib/types/training";
import { v4 as uuidv4 } from "uuid";

// Helper function to create exercise sets
const createExerciseSet = (
  exerciseId: string,
  targetReps: number,
  targetRir: number,
  sets: number = 3,
  alternativeExerciseId?: string,
  isWarmup: boolean = false,
  notes?: string,
  restTime: number = 90,
  isDropSet: boolean = false,
  isRestPause: boolean = false,
  isMechanicalSet: boolean = false,
  isPartialReps: boolean = false
): ExerciseSet[] => {
  return Array(sets).fill(0).map((_, index) => ({
    id: uuidv4(),
    exerciseId,
    alternativeExerciseId,
    targetReps,
    targetRir,
    isWarmup: isWarmup && index === 0,
    notes: index === 0 ? notes : undefined,
    restTime,
    isDropSet: isDropSet && index === sets - 1,
    isRestPause: isRestPause && index === sets - 1,
    isMechanicalSet: isMechanicalSet && index === sets - 1,
    isPartialReps: isPartialReps && index === sets - 1
  }));
};

// Push Day A (Chest focus)
export const createPushDayA = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Push A (Pecho)",
    description: "Día de empuje con enfoque en pecho, hombros y tríceps",
    targetMuscleGroups: ["chest", "shoulders", "triceps"],
    difficulty: "advanced",
    estimatedDuration: 75,
    exerciseSets: [
      // Compound movements with warmup
      ...createExerciseSet("bench-press", 6, 1, 4, "incline-bench-press", true, "Calentamiento progresivo. Técnica: Series Descendentes-Ascendentes", 180),
      ...createExerciseSet("incline-dumbbell-press", 8, 2, 4, "machine-chest-press", false, "Enfoque en parte superior del pecho. Doble progresión.", 120),
      ...createExerciseSet("seated-dumbbell-press", 8, 2, 3, "machine-shoulder-press", false, "Enfoque en deltoides anterior. RIR controlado.", 150),

      // Isolation movements with advanced techniques
      ...createExerciseSet("cable-fly", 10, 2, 3, "dumbbell-fly", false, "Aislamiento para pecho con tensión constante. Técnica: Drop Set en última serie", 90, true),
      ...createExerciseSet("lateral-raise", 12, 2, 3, "cable-lateral-raise", false, "Aislamiento para deltoides laterales. Técnica: Rest-Pause en última serie", 60, false, true),
      ...createExerciseSet("triceps-pushdown", 10, 2, 3, "overhead-triceps-extension", false, "Aislamiento para tríceps. Técnica: Series Mecánicas en última serie", 60, false, false, true)
    ]
  };
};

// Push Day B (Shoulder focus)
export const createPushDayB = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Push B (Hombros)",
    description: "Día de empuje con enfoque en hombros, pecho y tríceps",
    targetMuscleGroups: ["shoulders", "chest", "triceps"],
    difficulty: "advanced",
    estimatedDuration: 75,
    exerciseSets: [
      // Compound movements with warmup
      ...createExerciseSet("overhead-press", 6, 1, 4, "seated-dumbbell-press", true, "Calentamiento progresivo. Método Holístico.", 180),
      ...createExerciseSet("incline-bench-press", 8, 2, 3, "landmine-press", false, "Enfoque en parte superior del pecho. Técnica: Entrenamiento 3/7", 150),
      ...createExerciseSet("dumbbell-shoulder-press", 10, 2, 3, "arnold-press", false, "Variante con mancuernas para hombros. Doble progresión.", 120),

      // Isolation movements with advanced techniques
      ...createExerciseSet("lateral-raise", 12, 2, 4, "cable-lateral-raise", false, "Aislamiento para deltoides laterales. Técnica: Drop Set en última serie", 60, true),
      ...createExerciseSet("reverse-fly", 12, 2, 3, "face-pull", false, "Enfoque en deltoides posterior. Técnica: Series Mecánicas", 60, false, false, true),
      ...createExerciseSet("close-grip-bench-press", 8, 2, 3, "dips", false, "Compuesto para tríceps. Técnica: Rest-Pause en última serie", 90, false, true),
      ...createExerciseSet("overhead-triceps-extension", 10, 2, 3, "skull-crusher", false, "Aislamiento para tríceps. Técnica: Drop Set en última serie", 60, true)
    ]
  };
};

// Pull Day A (Back focus)
export const createPullDayA = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Pull A (Espalda)",
    description: "Día de tirón con enfoque en espalda y bíceps",
    targetMuscleGroups: ["back", "biceps", "rear_delts"],
    difficulty: "advanced",
    estimatedDuration: 75,
    exerciseSets: [
      // Compound movements with warmup
      ...createExerciseSet("pull-up", 8, 1, 4, "lat-pulldown", true, "Calentamiento progresivo. Técnica: Entrenamiento 3/7", 180),
      ...createExerciseSet("barbell-row", 8, 2, 4, "t-bar-row", false, "Remo con barra para espalda media. Enfoque en retracción escapular", 150),
      ...createExerciseSet("seated-cable-row", 10, 2, 3, "chest-supported-row", false, "Remo con cable para espalda baja. Técnica: Drop Set en última serie", 120, true),

      // Isolation movements with advanced techniques
      ...createExerciseSet("lat-pulldown", 10, 2, 3, "straight-arm-pulldown", false, "Jalón para dorsales. Técnica: Series Mecánicas", 90, false, false, true),
      ...createExerciseSet("face-pull", 15, 2, 3, "reverse-fly", false, "Para deltoides posteriores y rotadores. Enfoque en rotación externa", 60),
      ...createExerciseSet("barbell-curl", 8, 1, 3, "ez-bar-curl", false, "Curl con barra para bíceps. Técnica: Rest-Pause en última serie", 90, false, true),
      ...createExerciseSet("incline-dumbbell-curl", 10, 2, 3, "hammer-curl", false, "Curl inclinado para bíceps. Técnica: Método de Contracción Máxima", 60)
    ]
  };
};

// Pull Day B (Biceps focus)
export const createPullDayB = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Pull B (Bíceps)",
    description: "Día de tirón con enfoque en bíceps y espalda",
    targetMuscleGroups: ["biceps", "back", "rear_delts"],
    difficulty: "advanced",
    estimatedDuration: 75,
    exerciseSets: [
      // Compound movements with warmup
      ...createExerciseSet("deadlift", 5, 1, 3, "rack-pull", true, "Peso muerto para espalda baja y posterior. Calentamiento progresivo.", 210),
      ...createExerciseSet("weighted-pull-up", 6, 1, 4, "lat-pulldown", false, "Dominadas lastradas. Técnica: Series Compuestas Antagonistas", 180),
      ...createExerciseSet("pendlay-row", 8, 2, 3, "chest-supported-row", false, "Remo Pendlay para espalda media. Enfoque en explosividad", 120),

      // Isolation movements with advanced techniques
      ...createExerciseSet("single-arm-row", 10, 2, 3, "meadows-row", false, "Remo unilateral. Técnica: Rest-Pause en última serie", 90, false, true),
      ...createExerciseSet("barbell-curl", 8, 1, 4, "ez-bar-curl", false, "Curl con barra para bíceps. Técnica: Drop Set en última serie", 90, true),
      ...createExerciseSet("preacher-curl", 10, 2, 3, "spider-curl", false, "Curl predicador para bíceps. Enfoque en porción larga del bíceps", 60),
      ...createExerciseSet("hammer-curl", 12, 2, 3, "cross-body-curl", false, "Curl martillo para braquial y bíceps. Técnica: Series Mecánicas", 60, false, false, true),
      ...createExerciseSet("rear-delt-fly", 15, 2, 3, "face-pull", false, "Aislamiento para deltoides posteriores. Técnica: Entrenamiento de Rango Parcial Extendido", 60, false, false, false, true)
    ]
  };
};

// Legs Day A (Quad focus)
export const createLegsDayA = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Legs A (Cuádriceps)",
    description: "Día de piernas con enfoque en cuádriceps",
    targetMuscleGroups: ["quads", "glutes", "calves"],
    difficulty: "advanced",
    estimatedDuration: 80,
    exerciseSets: [
      // Compound movements with warmup
      ...createExerciseSet("squat", 6, 1, 4, "leg-press", true, "Sentadilla para cuádriceps y glúteos. Calentamiento progresivo. Doble progresión.", 210),
      ...createExerciseSet("leg-press", 10, 2, 3, "hack-squat", false, "Prensa para cuádriceps. Pies juntos para enfoque en cuádriceps", 180),
      ...createExerciseSet("lunges", 8, 2, 3, "bulgarian-split-squat", false, "Zancadas para cuádriceps y glúteos. Técnica: Series Descendentes-Ascendentes", 120),

      // Isolation movements with advanced techniques
      ...createExerciseSet("leg-extension", 12, 2, 3, "sissy-squat", false, "Aislamiento para cuádriceps. Técnica: Drop Set en última serie", 90, true),
      ...createExerciseSet("romanian-deadlift", 8, 2, 3, "good-morning", false, "Peso muerto rumano para isquiotibiales. Enfoque en isquiotibiales", 150),
      ...createExerciseSet("leg-curl", 12, 2, 3, "glute-ham-raise", false, "Aislamiento para isquiotibiales. Técnica: Rest-Pause en última serie", 90, false, true),
      ...createExerciseSet("standing-calf-raise", 15, 1, 4, "seated-calf-raise", false, "Aislamiento para pantorrillas. Técnica: Series Mecánicas", 60, false, false, true)
    ]
  };
};

// Legs Day B (Hamstring focus)
export const createLegsDayB = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Legs B (Isquiotibiales)",
    description: "Día de piernas con enfoque en isquiotibiales",
    targetMuscleGroups: ["hamstrings", "glutes", "calves"],
    difficulty: "advanced",
    estimatedDuration: 80,
    exerciseSets: [
      // Compound movements with warmup
      ...createExerciseSet("romanian-deadlift", 6, 1, 4, "good-morning", true, "Peso muerto rumano para isquiotibiales. Calentamiento progresivo. Doble progresión.", 210),
      ...createExerciseSet("bulgarian-split-squat", 8, 2, 3, "walking-lunge", false, "Sentadilla búlgara para glúteos. Enfoque en unilateralidad", 120),
      ...createExerciseSet("hack-squat", 10, 2, 3, "leg-press", false, "Hack squat para cuádriceps. Técnica: Método de Fatiga Selectiva", 180),

      // Isolation movements with advanced techniques
      ...createExerciseSet("lying-leg-curl", 10, 2, 4, "seated-leg-curl", false, "Curl femoral tumbado. Técnica: Drop Set en última serie", 90, true),
      ...createExerciseSet("hip-thrust", 10, 2, 3, "glute-bridge", false, "Empuje de cadera para glúteos. Enfoque en contracción máxima", 120),
      ...createExerciseSet("leg-extension", 12, 2, 3, "sissy-squat", false, "Extensión de piernas. Técnica: Rest-Pause en última serie", 90, false, true),
      ...createExerciseSet("seated-calf-raise", 15, 1, 4, "standing-calf-raise", false, "Elevación de talones sentado para sóleo. Técnica: Series Mecánicas", 60, false, false, true),
      ...createExerciseSet("adductor-machine", 15, 2, 3, "sumo-squat", false, "Máquina de aductores. Técnica: Entrenamiento de Oclusión Controlada", 60)
    ]
  };
};

// Deload Push Day
export const createDeloadPushDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Push (Deload)",
    description: "Día de empuje con carga reducida para recuperación",
    targetMuscleGroups: ["chest", "shoulders", "triceps"],
    difficulty: "beginner",
    estimatedDuration: 45,
    exerciseSets: [
      ...createExerciseSet("bench-press", 8, 3, 2, "incline-bench-press", false, "50-60% del peso habitual. Enfoque en técnica perfecta.", 120),
      ...createExerciseSet("overhead-press", 8, 3, 2, "seated-dumbbell-press", false, "50-60% del peso habitual. Enfoque en técnica perfecta.", 120),
      ...createExerciseSet("cable-fly", 10, 3, 2, "dumbbell-fly", false, "50-60% del peso habitual. Enfoque en conexión mente-músculo.", 60),
      ...createExerciseSet("lateral-raise", 12, 3, 2, "cable-lateral-raise", false, "50-60% del peso habitual. Enfoque en conexión mente-músculo.", 60),
      ...createExerciseSet("triceps-pushdown", 12, 3, 2, "overhead-triceps-extension", false, "50-60% del peso habitual. Enfoque en conexión mente-músculo.", 60)
    ]
  };
};

// Deload Pull Day
export const createDeloadPullDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Pull (Deload)",
    description: "Día de tirón con carga reducida para recuperación",
    targetMuscleGroups: ["back", "biceps", "rear_delts"],
    difficulty: "beginner",
    estimatedDuration: 45,
    exerciseSets: [
      ...createExerciseSet("lat-pulldown", 8, 3, 2, "pull-up", false, "50-60% del peso habitual. Enfoque en técnica perfecta.", 120),
      ...createExerciseSet("cable-row", 8, 3, 2, "chest-supported-row", false, "50-60% del peso habitual. Enfoque en retracción escapular.", 120),
      ...createExerciseSet("face-pull", 12, 3, 2, "reverse-fly", false, "50-60% del peso habitual. Enfoque en rotación externa.", 60),
      ...createExerciseSet("bicep-curl", 12, 3, 2, "hammer-curl", false, "50-60% del peso habitual. Enfoque en conexión mente-músculo.", 60),
      ...createExerciseSet("straight-arm-pulldown", 12, 3, 2, "pullover", false, "50-60% del peso habitual. Enfoque en estiramiento del dorsal.", 60)
    ]
  };
};

// Deload Legs Day
export const createDeloadLegsDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Legs (Deload)",
    description: "Día de piernas con carga reducida para recuperación",
    targetMuscleGroups: ["quads", "hamstrings", "glutes", "calves"],
    difficulty: "beginner",
    estimatedDuration: 45,
    exerciseSets: [
      ...createExerciseSet("leg-press", 8, 3, 2, "squat", false, "50-60% del peso habitual. Enfoque en técnica perfecta.", 120),
      ...createExerciseSet("romanian-deadlift", 8, 3, 2, "good-morning", false, "50-60% del peso habitual. Enfoque en bisagra de cadera.", 120),
      ...createExerciseSet("leg-extension", 12, 3, 2, "sissy-squat", false, "50-60% del peso habitual. Enfoque en conexión mente-músculo.", 60),
      ...createExerciseSet("leg-curl", 12, 3, 2, "glute-ham-raise", false, "50-60% del peso habitual. Enfoque en conexión mente-músculo.", 60),
      ...createExerciseSet("calf-raise", 15, 3, 2, "seated-calf-raise", false, "50-60% del peso habitual. Enfoque en estiramiento completo.", 60),
      ...createExerciseSet("hip-thrust", 12, 3, 2, "glute-bridge", false, "50-60% del peso habitual. Enfoque en contracción glútea.", 60)
    ]
  };
};

// Create the full PPL routine
export const createPureBodybuildingPPL = (userId: string): WorkoutRoutine => {
  return {
    id: uuidv4(),
    userId: userId,
    name: "Pure Bodybuilding PPL",
    description: "Rutina Push Pull Legs de 6 días para maximizar la hipertrofia con técnicas avanzadas y periodización.",
    days: [
      createPushDayA(),
      createPullDayA(),
      createLegsDayA(),
      createPushDayB(),
      createPullDayB(),
      createLegsDayB()
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
    source: "Pure Bodybuilding Phase 2 PPL Sheet",
    tags: ["hipertrofia", "avanzado", "6 días", "ppl", "técnicas avanzadas", "periodización"],
    split: "push_pull_legs"
  };
};

// Create the deload week
export const createPureBodybuildingPPLDeload = (userId: string): WorkoutRoutine => {
  return {
    id: uuidv4(),
    userId: userId,
    name: "Pure Bodybuilding PPL (Deload)",
    description: "Semana de descarga para la rutina PPL. Reduce el volumen y la intensidad para facilitar la recuperación.",
    days: [
      createDeloadPushDay(),
      createDeloadPullDay(),
      createDeloadLegsDay()
    ],
    frequency: 3,
    goal: "hypertrophy",
    level: "beginner",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: false,
    startDate: new Date().toISOString(),
    includesDeload: true,
    deloadFrequency: 4,
    deloadStrategy: "volume",
    source: "Pure Bodybuilding Phase 2 PPL Sheet",
    tags: ["deload", "recuperación", "3 días", "ppl", "técnicas básicas"],
    split: "push_pull_legs"
  };
};
