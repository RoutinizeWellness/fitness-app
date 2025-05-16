/**
 * Beginner Full Body Program
 * Programa de cuerpo completo para principiantes
 * 
 * Características:
 * - Programa de 3 días por semana
 * - Enfoque en los movimientos básicos
 * - Progresión lineal de peso
 * - Técnica y forma correcta
 * - Ideal para principiantes
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
  restTime: number = 90
): ExerciseSet[] => {
  return Array(sets).fill(0).map(() => ({
    id: uuidv4(),
    exerciseId,
    targetReps,
    targetRir,
    weight,
    isWarmup,
    notes,
    restTime
  }));
};

// Full Body Day A
export const createFullBodyDayA = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Full Body A",
    description: "Día de cuerpo completo con enfoque en sentadilla, press de banca y remo",
    targetMuscleGroups: ["chest", "back", "legs", "shoulders", "arms"],
    difficulty: "beginner",
    estimatedDuration: 60,
    exerciseSets: [
      // Main compound movements
      ...createExerciseSet("squat", 5, 2, 1, undefined, true, "Serie de calentamiento con peso ligero", 60),
      ...createExerciseSet("squat", 8, 2, 3, undefined, false, "Enfócate en la técnica y profundidad correcta", 120),
      ...createExerciseSet("bench-press", 8, 2, 3, undefined, false, "Mantén los omóplatos retraídos y pies firmes", 120),
      ...createExerciseSet("barbell-row", 10, 2, 3, undefined, false, "Mantén la espalda recta y tira hacia el abdomen", 120),
      
      // Accessory movements
      ...createExerciseSet("dumbbell-shoulder-press", 10, 2, 3, undefined, false, "Usa un peso con el que puedas mantener buena técnica", 90),
      ...createExerciseSet("leg-curl", 12, 2, 3, undefined, false, "Contrae completamente los isquiotibiales", 60),
      ...createExerciseSet("plank", 30, 0, 3, undefined, false, "Mantén 30 segundos, descansa 30 segundos", 30)
    ]
  };
};

// Full Body Day B
export const createFullBodyDayB = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Full Body B",
    description: "Día de cuerpo completo con enfoque en peso muerto, press militar y dominadas",
    targetMuscleGroups: ["back", "shoulders", "legs", "chest", "arms"],
    difficulty: "beginner",
    estimatedDuration: 60,
    exerciseSets: [
      // Main compound movements
      ...createExerciseSet("deadlift", 5, 2, 1, undefined, true, "Serie de calentamiento con peso ligero", 60),
      ...createExerciseSet("deadlift", 8, 2, 3, undefined, false, "Mantén la espalda recta y core tenso", 150),
      ...createExerciseSet("overhead-press", 8, 2, 3, undefined, false, "Mantén el core tenso y evita arquear la espalda", 120),
      ...createExerciseSet("lat-pulldown", 10, 2, 3, undefined, false, "Alternativa a dominadas para principiantes", 120),
      
      // Accessory movements
      ...createExerciseSet("dumbbell-lunge", 10, 2, 2, undefined, false, "5 repeticiones por pierna", 90),
      ...createExerciseSet("triceps-pushdown", 12, 2, 3, undefined, false, "Mantén los codos cerca del cuerpo", 60),
      ...createExerciseSet("bicep-curl", 12, 2, 3, undefined, false, "Evita balancear el cuerpo", 60)
    ]
  };
};

// Full Body Day C
export const createFullBodyDayC = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Full Body C",
    description: "Día de cuerpo completo con enfoque en sentadilla frontal, press inclinado y remo con mancuerna",
    targetMuscleGroups: ["legs", "chest", "back", "shoulders", "arms"],
    difficulty: "beginner",
    estimatedDuration: 60,
    exerciseSets: [
      // Main compound movements
      ...createExerciseSet("front-squat", 5, 2, 1, undefined, true, "Serie de calentamiento con peso ligero", 60),
      ...createExerciseSet("front-squat", 8, 2, 3, undefined, false, "Alternativa a la sentadilla tradicional", 120),
      ...createExerciseSet("incline-bench-press", 8, 2, 3, undefined, false, "Enfoca la parte superior del pecho", 120),
      ...createExerciseSet("dumbbell-row", 10, 2, 3, undefined, false, "Una mano y rodilla en banco para estabilidad", 120),
      
      // Accessory movements
      ...createExerciseSet("lateral-raise", 12, 2, 3, undefined, false, "Mantén una ligera flexión en los codos", 60),
      ...createExerciseSet("leg-extension", 12, 2, 3, undefined, false, "Extiende completamente las piernas", 60),
      ...createExerciseSet("cable-crunch", 15, 2, 3, undefined, false, "Mantén la tensión en los abdominales", 60)
    ]
  };
};

// Create the full Beginner Full Body routine
export const createBeginnerFullBody = (userId: string): WorkoutRoutine => {
  return {
    id: uuidv4(),
    userId: userId,
    name: "Beginner Full Body",
    description: "Programa de cuerpo completo para principiantes con 3 días por semana. Enfocado en aprender los movimientos básicos y desarrollar una base sólida.",
    days: [
      createFullBodyDayA(),
      createFullBodyDayB(),
      createFullBodyDayC()
    ],
    frequency: 3,
    goal: "general_fitness",
    level: "beginner",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    startDate: new Date().toISOString(),
    includesDeload: false,
    source: "Essentials Program",
    tags: ["principiante", "cuerpo completo", "3 días", "básicos"],
    split: "full_body"
  };
};

// Progression Guide for Beginners
export const beginnerProgressionGuide = {
  title: "Guía de Progresión para Principiantes",
  description: "Cómo progresar en el programa de cuerpo completo para principiantes",
  steps: [
    {
      week: "Semanas 1-2",
      focus: "Técnica y Adaptación",
      instructions: "Enfócate en aprender la técnica correcta de cada ejercicio. Usa pesos ligeros que te permitan completar todas las series con buena forma. No te preocupes por aumentar peso todavía."
    },
    {
      week: "Semanas 3-4",
      focus: "Establecer Línea Base",
      instructions: "Encuentra un peso con el que puedas completar todas las series y repeticiones con 2-3 RIR (repeticiones en reserva). Este será tu punto de partida para la progresión."
    },
    {
      week: "Semanas 5-8",
      focus: "Progresión Lineal",
      instructions: "Aumenta el peso en 2.5-5kg para ejercicios de tren inferior y 1-2.5kg para ejercicios de tren superior cada semana, siempre que puedas completar todas las series y repeticiones con buena técnica."
    },
    {
      week: "Semanas 9-12",
      focus: "Consolidación y Ajustes",
      instructions: "Si la progresión se ralentiza, mantén el peso durante 1-2 semanas antes de intentar aumentar de nuevo. Considera aumentar las repeticiones (de 8 a 10, por ejemplo) antes de aumentar el peso."
    }
  ],
  tips: [
    "Descansa al menos un día entre sesiones de entrenamiento",
    "Prioriza la técnica sobre el peso",
    "Anota tus entrenamientos para seguir tu progreso",
    "Asegúrate de calentar adecuadamente antes de cada sesión",
    "Mantén una nutrición adecuada con suficiente proteína (1.6-2g por kg de peso corporal)",
    "Duerme al menos 7-8 horas por noche para optimizar la recuperación",
    "Si te sientes excesivamente adolorido o fatigado, toma un día extra de descanso"
  ],
  commonMistakes: [
    "Aumentar el peso demasiado rápido sacrificando la técnica",
    "No descansar lo suficiente entre sesiones",
    "Añadir ejercicios extra sin necesidad",
    "Ignorar señales de fatiga excesiva o dolor",
    "No seguir una nutrición adecuada",
    "Compararse con otros en lugar de enfocarse en el progreso personal"
  ],
  whenToProgress: "Deberías considerar pasar a un programa intermedio cuando puedas realizar sentadillas con aproximadamente 1.5 veces tu peso corporal, press de banca con tu peso corporal, y peso muerto con 1.75 veces tu peso corporal por 5 repeticiones con buena técnica."
};
