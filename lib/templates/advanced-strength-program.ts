/**
 * Advanced Strength Program
 * Programa avanzado de fuerza basado en principios de periodización por bloques
 * 
 * Características:
 * - Programa de 4 días por semana
 * - Periodización por bloques (acumulación, intensificación, realización)
 * - Enfoque en los levantamientos principales
 * - Técnicas avanzadas como cluster sets y wave loading
 * - Deload estratégico
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
  restTime: number = 180,
  isClusterSet: boolean = false,
  isWaveLoading: boolean = false
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
    isClusterSet,
    isWaveLoading
  }));
};

// Squat Day (Lower Body A)
export const createSquatDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Día de Sentadilla",
    description: "Día enfocado en sentadilla y accesorios para tren inferior",
    targetMuscleGroups: ["quads", "glutes", "hamstrings", "core"],
    difficulty: "advanced",
    estimatedDuration: 90,
    exerciseSets: [
      // Warm-up
      ...createExerciseSet("squat", 5, 4, 2, undefined, true, "Series de calentamiento progresivas", 120),
      
      // Main movement - Wave Loading
      ...createExerciseSet("squat", 5, 1, 1, undefined, false, "85% 1RM - Primera ola", 180, false, true),
      ...createExerciseSet("squat", 3, 1, 1, undefined, false, "90% 1RM - Primera ola", 180, false, true),
      ...createExerciseSet("squat", 1, 1, 1, undefined, false, "95% 1RM - Primera ola", 180, false, true),
      ...createExerciseSet("squat", 5, 1, 1, undefined, false, "87.5% 1RM - Segunda ola", 180, false, true),
      ...createExerciseSet("squat", 3, 1, 1, undefined, false, "92.5% 1RM - Segunda ola", 180, false, true),
      ...createExerciseSet("squat", 1, 1, 1, undefined, false, "97.5% 1RM - Segunda ola", 240, false, true),
      
      // Secondary movement
      ...createExerciseSet("front-squat", 6, 2, 3, undefined, false, "75-80% 1RM", 150),
      
      // Accessory movements
      ...createExerciseSet("leg-press", 8, 2, 3, undefined, false, "Enfoque en cuádriceps", 120),
      ...createExerciseSet("romanian-deadlift", 10, 2, 3, undefined, false, "Enfoque en isquiotibiales", 120),
      ...createExerciseSet("weighted-plank", 30, 0, 3, undefined, false, "30 segundos con peso adicional", 60)
    ]
  };
};

// Bench Press Day (Upper Body A)
export const createBenchPressDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Día de Press Banca",
    description: "Día enfocado en press de banca y accesorios para tren superior",
    targetMuscleGroups: ["chest", "triceps", "shoulders", "back"],
    difficulty: "advanced",
    estimatedDuration: 90,
    exerciseSets: [
      // Warm-up
      ...createExerciseSet("bench-press", 5, 4, 2, undefined, true, "Series de calentamiento progresivas", 120),
      
      // Main movement - Cluster Sets
      ...createExerciseSet("bench-press", 3, 1, 5, undefined, false, "85-90% 1RM - Descanso de 20-30s entre reps", 180, true),
      
      // Secondary movement
      ...createExerciseSet("close-grip-bench-press", 6, 2, 4, undefined, false, "75-80% 1RM", 150),
      
      // Accessory movements
      ...createExerciseSet("weighted-dips", 8, 2, 3, undefined, false, "Con peso adicional", 120),
      ...createExerciseSet("dumbbell-row", 10, 2, 3, undefined, false, "Remo unilateral para equilibrio", 90),
      ...createExerciseSet("face-pull", 15, 2, 3, undefined, false, "Para salud de hombros", 60)
    ]
  };
};

// Deadlift Day (Lower Body B)
export const createDeadliftDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Día de Peso Muerto",
    description: "Día enfocado en peso muerto y accesorios para tren inferior",
    targetMuscleGroups: ["hamstrings", "glutes", "back", "traps"],
    difficulty: "advanced",
    estimatedDuration: 90,
    exerciseSets: [
      // Warm-up
      ...createExerciseSet("deadlift", 5, 4, 2, undefined, true, "Series de calentamiento progresivas", 120),
      
      // Main movement - Heavy singles
      ...createExerciseSet("deadlift", 1, 1, 5, undefined, false, "90-95% 1RM - Descanso completo entre singles", 240),
      
      // Secondary movement
      ...createExerciseSet("deficit-deadlift", 5, 2, 3, undefined, false, "70-75% 1RM - Desde plataforma de 2-3cm", 180),
      
      // Accessory movements
      ...createExerciseSet("good-morning", 8, 2, 3, undefined, false, "Para espalda baja e isquiotibiales", 120),
      ...createExerciseSet("bulgarian-split-squat", 10, 2, 3, undefined, false, "Para equilibrio y unilateralidad", 90),
      ...createExerciseSet("ab-wheel-rollout", 10, 2, 3, undefined, false, "Para core y estabilidad", 60)
    ]
  };
};

// Overhead Press Day (Upper Body B)
export const createOverheadPressDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Día de Press Militar",
    description: "Día enfocado en press militar y accesorios para tren superior",
    targetMuscleGroups: ["shoulders", "triceps", "upper_chest", "traps"],
    difficulty: "advanced",
    estimatedDuration: 90,
    exerciseSets: [
      // Warm-up
      ...createExerciseSet("overhead-press", 5, 4, 2, undefined, true, "Series de calentamiento progresivas", 120),
      
      // Main movement - Pyramid
      ...createExerciseSet("overhead-press", 5, 2, 1, undefined, false, "80% 1RM", 150),
      ...createExerciseSet("overhead-press", 3, 1, 1, undefined, false, "85% 1RM", 180),
      ...createExerciseSet("overhead-press", 1, 1, 1, undefined, false, "90% 1RM", 210),
      ...createExerciseSet("overhead-press", 3, 1, 1, undefined, false, "87.5% 1RM", 180),
      ...createExerciseSet("overhead-press", 5, 2, 1, undefined, false, "82.5% 1RM", 150),
      
      // Secondary movement
      ...createExerciseSet("push-press", 5, 2, 3, undefined, false, "85-90% del press militar", 150),
      
      // Accessory movements
      ...createExerciseSet("incline-bench-press", 8, 2, 3, undefined, false, "Para pecho superior y transición", 120),
      ...createExerciseSet("weighted-pull-up", 8, 2, 3, undefined, false, "Con peso adicional", 120),
      ...createExerciseSet("lateral-raise", 12, 2, 3, undefined, false, "Para deltoides laterales", 60)
    ]
  };
};

// Deload Squat/Bench Day
export const createDeloadSquatBenchDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Deload Sentadilla/Press",
    description: "Día de descarga para sentadilla y press de banca",
    targetMuscleGroups: ["quads", "chest", "triceps"],
    difficulty: "intermediate",
    estimatedDuration: 60,
    exerciseSets: [
      ...createExerciseSet("squat", 5, 3, 3, undefined, false, "60% 1RM", 120),
      ...createExerciseSet("bench-press", 5, 3, 3, undefined, false, "60% 1RM", 120),
      ...createExerciseSet("leg-extension", 12, 3, 2, undefined, false, "Peso ligero", 60),
      ...createExerciseSet("triceps-pushdown", 12, 3, 2, undefined, false, "Peso ligero", 60)
    ]
  };
};

// Deload Deadlift/OHP Day
export const createDeloadDeadliftOHPDay = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Deload Peso Muerto/Press Militar",
    description: "Día de descarga para peso muerto y press militar",
    targetMuscleGroups: ["hamstrings", "shoulders", "back"],
    difficulty: "intermediate",
    estimatedDuration: 60,
    exerciseSets: [
      ...createExerciseSet("deadlift", 5, 3, 2, undefined, false, "60% 1RM", 120),
      ...createExerciseSet("overhead-press", 5, 3, 3, undefined, false, "60% 1RM", 120),
      ...createExerciseSet("lat-pulldown", 12, 3, 2, undefined, false, "Peso ligero", 60),
      ...createExerciseSet("lateral-raise", 12, 3, 2, undefined, false, "Peso ligero", 60)
    ]
  };
};

// Create the full Advanced Strength routine
export const createAdvancedStrengthProgram = (userId: string): WorkoutRoutine => {
  return {
    id: uuidv4(),
    userId: userId,
    name: "Advanced Strength Program",
    description: "Programa avanzado de fuerza con periodización por bloques y técnicas especializadas para maximizar la fuerza en los levantamientos principales.",
    days: [
      createSquatDay(),
      createBenchPressDay(),
      createDeadliftDay(),
      createOverheadPressDay()
    ],
    frequency: 4,
    goal: "strength",
    level: "advanced",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    startDate: new Date().toISOString(),
    includesDeload: true,
    deloadFrequency: 4,
    deloadStrategy: "intensity",
    source: "Strength Science",
    tags: ["fuerza", "avanzado", "4 días", "periodización"],
    split: "upper_lower"
  };
};

// Create the deload week
export const createAdvancedStrengthDeload = (userId: string): WorkoutRoutine => {
  return {
    id: uuidv4(),
    userId: userId,
    name: "Advanced Strength (Deload)",
    description: "Semana de descarga para el programa avanzado de fuerza. Reduce la intensidad para facilitar la recuperación.",
    days: [
      createDeloadSquatBenchDay(),
      createDeloadDeadliftOHPDay()
    ],
    frequency: 2,
    goal: "strength",
    level: "intermediate",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: false,
    startDate: new Date().toISOString(),
    includesDeload: true,
    deloadFrequency: 4,
    deloadStrategy: "intensity",
    source: "Strength Science",
    tags: ["fuerza", "deload", "recuperación"],
    split: "upper_lower"
  };
};

// Advanced Strength Program Guide
export const advancedStrengthGuide = {
  title: "Guía del Programa Avanzado de Fuerza",
  description: "Cómo maximizar los resultados con el programa avanzado de fuerza",
  blocks: [
    {
      name: "Bloque de Acumulación (Semanas 1-3)",
      focus: "Volumen y Técnica",
      instructions: "Enfócate en acumular volumen de entrenamiento con pesos moderados (70-80% 1RM) y técnica perfecta. Prioriza la calidad de las repeticiones sobre el peso."
    },
    {
      name: "Bloque de Intensificación (Semanas 4-7)",
      focus: "Intensidad y Fuerza",
      instructions: "Aumenta la intensidad (80-90% 1RM) y reduce ligeramente el volumen. Implementa técnicas como wave loading y cluster sets para maximizar la adaptación neural."
    },
    {
      name: "Bloque de Realización (Semanas 8-10)",
      focus: "Pico de Fuerza",
      instructions: "Alcanza el pico de intensidad (90%+ 1RM) con volumen mínimo. Enfócate en singles y dobles pesados para preparar el sistema nervioso para cargas máximas."
    },
    {
      name: "Deload (Semana 11)",
      focus: "Recuperación",
      instructions: "Reduce drásticamente el volumen y la intensidad para permitir una recuperación completa antes de comenzar un nuevo ciclo."
    }
  ],
  advancedTechniques: [
    {
      name: "Wave Loading",
      description: "Alterna entre series de diferentes repeticiones (ej: 5,3,1) con pesos progresivamente más pesados, luego repite con pesos ligeramente más pesados que la primera ola.",
      benefits: "Permite manejar pesos más pesados gracias a la potenciación post-activación."
    },
    {
      name: "Cluster Sets",
      description: "Divide una serie en mini-series con descansos cortos (10-30s) entre repeticiones.",
      benefits: "Permite realizar más repeticiones de alta calidad con pesos cercanos al máximo."
    },
    {
      name: "Heavy Singles",
      description: "Realiza múltiples series de una repetición con pesos cercanos al máximo (90-95% 1RM).",
      benefits: "Maximiza la adaptación neural sin acumular demasiada fatiga."
    }
  ],
  tips: [
    "Prioriza la recuperación con 8-9 horas de sueño por noche",
    "Consume suficiente proteína (2g/kg) y calorías para soportar el entrenamiento intenso",
    "Implementa técnicas de recuperación como baños de contraste, masaje y movilidad",
    "Monitoriza cuidadosamente la fatiga y ajusta el entrenamiento según sea necesario",
    "Considera suplementos como creatina, cafeína y beta-alanina para mejorar el rendimiento",
    "Graba tus levantamientos principales para analizar y mejorar la técnica",
    "Trabaja con un compañero de entrenamiento para motivación y seguridad"
  ]
};
