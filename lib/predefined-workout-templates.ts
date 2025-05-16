/**
 * Predefined Workout Templates
 * Based on resources from:
 * - Pure Bodybuilding Program (PPL, Full Body, Upper/Lower)
 * - Jeff Nippard's programs (Power Building, Upper/Lower)
 * - The Hypertrophy Handbook
 * - The Muscle Ladder
 * - Essentials Program
 */

import { WorkoutRoutine, WorkoutDay, ExerciseSet } from "@/lib/types/training";
import { v4 as uuidv4 } from "uuid";

// Template types
export type TemplateCategory =
  | "hypertrophy"
  | "strength"
  | "powerbuilding"
  | "beginner"
  | "intermediate"
  | "advanced";

export type TemplateSplit =
  | "push_pull_legs"
  | "upper_lower"
  | "full_body"
  | "body_part"
  | "push_pull"
  | "bro_split";

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory[];
  split: TemplateSplit;
  level: "beginner" | "intermediate" | "advanced";
  daysPerWeek: number;
  duration: number; // in weeks
  includesDeload: boolean;
  deloadFrequency: number; // deload every X weeks
  source: string;
  tags: string[];
  imageUrl?: string;
  createFunction?: (userId: string) => any; // Función para crear la rutina completa
  guide?: any; // Guía de progresión o información adicional
  advancedTechniques?: string[]; // Técnicas avanzadas utilizadas
  periodizationType?: string; // Tipo de periodización
  targetMuscleGroups?: string[]; // Grupos musculares principales
  recommendedSupplements?: string[]; // Suplementos recomendados
  difficultyRating?: number; // Calificación de dificultad (1-10)
  estimatedTimePerSession?: number; // Tiempo estimado por sesión en minutos
}

// Helper function to create exercise sets
const createExerciseSet = (
  exerciseId: string,
  targetReps: number,
  targetRir: number,
  sets: number = 3,
  weight?: number,
  isWarmup: boolean = false,
  notes?: string
): ExerciseSet[] => {
  return Array(sets).fill(0).map(() => ({
    id: uuidv4(),
    exerciseId,
    targetReps,
    targetRir,
    weight,
    isWarmup,
    notes
  }));
};

// Pure Bodybuilding PPL Template
export const PURE_BODYBUILDING_PPL: WorkoutTemplate = {
  id: "pure-bodybuilding-ppl",
  name: "Pure Bodybuilding PPL",
  description: "Rutina Push Pull Legs de 6 días para maximizar la hipertrofia con técnicas avanzadas y periodización.",
  category: ["hypertrophy", "intermediate", "advanced"],
  split: "push_pull_legs",
  level: "intermediate",
  daysPerWeek: 6,
  duration: 12,
  includesDeload: true,
  deloadFrequency: 6,
  source: "Pure Bodybuilding Program",
  tags: ["hipertrofia", "volumen", "6 días", "ppl"]
};

// Jeff Nippard Upper Lower Template
export const JEFF_NIPPARD_UPPER_LOWER: WorkoutTemplate = {
  id: "jeff-nippard-upper-lower",
  name: "Jeff Nippard Upper/Lower",
  description: "Programa Upper/Lower de 4 días basado en principios científicos para maximizar fuerza e hipertrofia.",
  category: ["powerbuilding", "strength", "hypertrophy"],
  split: "upper_lower",
  level: "intermediate",
  daysPerWeek: 4,
  duration: 10,
  includesDeload: true,
  deloadFrequency: 5,
  source: "Jeff Nippard",
  tags: ["fuerza", "hipertrofia", "4 días", "upper lower"]
};

// Hypertrophy Handbook Template
export const HYPERTROPHY_HANDBOOK: WorkoutTemplate = {
  id: "hypertrophy-handbook",
  name: "Hypertrophy Handbook",
  description: "Programa de hipertrofia avanzado con periodización de volumen e intensidad para maximizar el crecimiento muscular.",
  category: ["hypertrophy", "advanced"],
  split: "push_pull_legs",
  level: "advanced",
  daysPerWeek: 5,
  duration: 12,
  includesDeload: true,
  deloadFrequency: 4,
  source: "The Hypertrophy Handbook",
  tags: ["hipertrofia avanzada", "volumen", "5 días", "técnicas avanzadas"]
};

// Muscle Ladder Template
export const MUSCLE_LADDER: WorkoutTemplate = {
  id: "muscle-ladder",
  name: "The Muscle Ladder",
  description: "Programa progresivo que escala en intensidad y volumen para romper mesetas y lograr un crecimiento muscular continuo.",
  category: ["hypertrophy", "intermediate", "advanced"],
  split: "body_part",
  level: "intermediate",
  daysPerWeek: 5,
  duration: 16,
  includesDeload: true,
  deloadFrequency: 4,
  source: "The Muscle Ladder",
  tags: ["progresión", "hipertrofia", "5 días", "especialización"]
};

// Essentials Program 4x Template
export const ESSENTIALS_PROGRAM: WorkoutTemplate = {
  id: "essentials-program",
  name: "Essentials Program 4x",
  description: "Programa fundamental de 4 días con enfoque en los ejercicios básicos y progresión lineal.",
  category: ["strength", "beginner", "intermediate"],
  split: "upper_lower",
  level: "beginner",
  daysPerWeek: 4,
  duration: 8,
  includesDeload: true,
  deloadFrequency: 8,
  source: "Essentials Program",
  tags: ["básicos", "fuerza", "4 días", "principiantes"]
};

// Jeff Nippard Power Building Phase 3
export const POWER_BUILDING_PHASE3: WorkoutTemplate = {
  id: "power-building-phase3",
  name: "Power Building Phase 3",
  description: "Fase 3 del programa Power Building de Jeff Nippard, combinando entrenamiento de fuerza y hipertrofia.",
  category: ["powerbuilding", "strength", "hypertrophy"],
  split: "upper_lower",
  level: "advanced",
  daysPerWeek: 5,
  duration: 8,
  includesDeload: true,
  deloadFrequency: 4,
  source: "Jeff Nippard",
  tags: ["powerbuilding", "fuerza", "hipertrofia", "5 días"]
};

// Full Body Workout Template
export const PURE_BODYBUILDING_FULL_BODY: WorkoutTemplate = {
  id: "pure-bodybuilding-full-body",
  name: "Pure Bodybuilding Full Body",
  description: "Rutina Full Body de 3-4 días para maximizar la frecuencia de entrenamiento y recuperación.",
  category: ["hypertrophy", "beginner", "intermediate"],
  split: "full_body",
  level: "intermediate",
  daysPerWeek: 3,
  duration: 8,
  includesDeload: true,
  deloadFrequency: 4,
  source: "Pure Bodybuilding Program",
  tags: ["full body", "frecuencia", "3 días", "recuperación"]
};

// Ultimate Push Pull Legs 6x Template
export const ULTIMATE_PPL_6X: WorkoutTemplate = {
  id: "ultimate-ppl-6x",
  name: "Ultimate Push Pull Legs 6x",
  description: "La rutina definitiva de Push Pull Legs para 6 días a la semana con alta frecuencia y volumen.",
  category: ["hypertrophy", "advanced"],
  split: "push_pull_legs",
  level: "advanced",
  daysPerWeek: 6,
  duration: 12,
  includesDeload: true,
  deloadFrequency: 6,
  source: "The Ultimate Push Pull Legs System",
  tags: ["ppl", "volumen", "6 días", "avanzado"]
};

// Importar nuevas plantillas
import { createJeffNippardPowerbuilding } from "./templates/jeff-nippard-powerbuilding";
import { createHypertrophySpecialization } from "./templates/hypertrophy-specialization";
import { createBeginnerFullBody, beginnerProgressionGuide } from "./templates/beginner-full-body";
import { createAdvancedStrengthProgram, advancedStrengthGuide } from "./templates/advanced-strength-program";
import { createHipertrofiaMaximaTemplate } from "./templates/hipertrofia-maxima-template";
import { createPureBodybuildingHypertrophyTemplate } from "./templates/pure-bodybuilding-hypertrophy";

// Nuevas plantillas detalladas
export const JEFF_NIPPARD_POWERBUILDING_DETAILED = {
  id: "jeff-nippard-powerbuilding-detailed",
  name: "Jeff Nippard Powerbuilding",
  description: "Programa que combina entrenamiento de fuerza y hipertrofia con 4 días por semana. Ideal para ganar fuerza y tamaño muscular.",
  category: ["powerbuilding", "strength", "hypertrophy"],
  split: "upper_lower",
  level: "intermediate",
  daysPerWeek: 4,
  duration: 8,
  includesDeload: true,
  deloadFrequency: 4,
  source: "Jeff Nippard",
  tags: ["powerbuilding", "fuerza", "hipertrofia", "4 días"],
  createFunction: createJeffNippardPowerbuilding
};

export const HYPERTROPHY_SPECIALIZATION_DETAILED = {
  id: "hypertrophy-specialization-detailed",
  name: "Hypertrophy Specialization",
  description: "Programa avanzado de hipertrofia con 5 días por semana y técnicas especializadas para maximizar el crecimiento muscular.",
  category: ["hypertrophy", "advanced"],
  split: "body_part",
  level: "advanced",
  daysPerWeek: 5,
  duration: 10,
  includesDeload: true,
  deloadFrequency: 5,
  source: "The Hypertrophy Handbook",
  tags: ["hipertrofia", "avanzado", "5 días", "técnicas avanzadas"],
  createFunction: createHypertrophySpecialization
};

export const BEGINNER_FULL_BODY_DETAILED = {
  id: "beginner-full-body-detailed",
  name: "Beginner Full Body",
  description: "Programa de cuerpo completo para principiantes con 3 días por semana. Enfocado en aprender los movimientos básicos y desarrollar una base sólida.",
  category: ["beginner", "strength", "general_fitness"],
  split: "full_body",
  level: "beginner",
  daysPerWeek: 3,
  duration: 12,
  includesDeload: false,
  deloadFrequency: 0,
  source: "Essentials Program",
  tags: ["principiante", "cuerpo completo", "3 días", "básicos"],
  createFunction: createBeginnerFullBody,
  guide: beginnerProgressionGuide
};

export const ADVANCED_STRENGTH_DETAILED = {
  id: "advanced-strength-detailed",
  name: "Advanced Strength Program",
  description: "Programa avanzado de fuerza con periodización por bloques y técnicas especializadas para maximizar la fuerza en los levantamientos principales.",
  category: ["strength", "advanced", "powerbuilding"],
  split: "upper_lower",
  level: "advanced",
  daysPerWeek: 4,
  duration: 11,
  includesDeload: true,
  deloadFrequency: 4,
  source: "Strength Science",
  tags: ["fuerza", "avanzado", "4 días", "periodización"],
  createFunction: createAdvancedStrengthProgram,
  guide: advancedStrengthGuide
};

// All templates collection
export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  PURE_BODYBUILDING_PPL,
  JEFF_NIPPARD_UPPER_LOWER,
  HYPERTROPHY_HANDBOOK,
  MUSCLE_LADDER,
  ESSENTIALS_PROGRAM,
  POWER_BUILDING_PHASE3,
  PURE_BODYBUILDING_FULL_BODY,
  ULTIMATE_PPL_6X
];

// Nuevas plantillas españolas detalladas
export const HIPERTROFIA_MAXIMA_DETAILED = {
  id: "hipertrofia-maxima-detailed",
  name: "Hipertrofia Maxima Bazman Science",
  description: "Programa avanzado de hipertrofia basado en Hipertrofia Maxima Bazman Science 2. Incluye periodización ondulante, técnicas avanzadas y alternativas de ejercicios.",
  category: ["hypertrophy", "advanced"],
  split: "push_pull",
  level: "advanced",
  daysPerWeek: 5,
  duration: 12,
  includesDeload: true,
  deloadFrequency: 4,
  source: "Hipertrofia Maxima Bazman Science 2",
  tags: ["hipertrofia", "avanzado", "5 días", "técnicas avanzadas", "periodización"],
  createFunction: createHipertrofiaMaximaTemplate,
  advancedTechniques: ["Drop Sets", "Rest-Pause", "Series Mecánicas", "Series Descendentes-Ascendentes", "Entrenamiento 3/7"],
  periodizationType: "ondulante"
};

export const PURE_BODYBUILDING_HYPERTROPHY_DETAILED = {
  id: "pure-bodybuilding-hypertrophy-detailed",
  name: "Pure Bodybuilding Phase 2 - Hypertrophy",
  description: "Programa avanzado de hipertrofia basado en Pure Bodybuilding Phase 2 Hypertrophy Handbook. Incluye periodización por bloques, técnicas avanzadas y alternativas de ejercicios.",
  category: ["hypertrophy", "advanced"],
  split: "push_pull_legs",
  level: "advanced",
  daysPerWeek: 6,
  duration: 12,
  includesDeload: true,
  deloadFrequency: 4,
  source: "Pure Bodybuilding Phase 2 Hypertrophy Handbook",
  tags: ["hipertrofia", "avanzado", "6 días", "ppl", "técnicas avanzadas"],
  createFunction: createPureBodybuildingHypertrophyTemplate,
  advancedTechniques: ["Drop Sets", "Rest-Pause", "Series Mecánicas", "Doble Progresión"],
  periodizationType: "bloques"
};

// All detailed templates with creation functions
export const DETAILED_WORKOUT_TEMPLATES = [
  JEFF_NIPPARD_POWERBUILDING_DETAILED,
  HYPERTROPHY_SPECIALIZATION_DETAILED,
  BEGINNER_FULL_BODY_DETAILED,
  ADVANCED_STRENGTH_DETAILED,
  HIPERTROFIA_MAXIMA_DETAILED,
  PURE_BODYBUILDING_HYPERTROPHY_DETAILED
];

// Function to get templates by category
export const getTemplatesByCategory = (category: TemplateCategory): WorkoutTemplate[] => {
  return WORKOUT_TEMPLATES.filter(template => template.category.includes(category));
};

// Function to get templates by level
export const getTemplatesByLevel = (level: "beginner" | "intermediate" | "advanced"): WorkoutTemplate[] => {
  return WORKOUT_TEMPLATES.filter(template => template.level === level);
};

// Function to get templates by split
export const getTemplatesBySplit = (split: TemplateSplit): WorkoutTemplate[] => {
  return WORKOUT_TEMPLATES.filter(template => template.split === split);
};

// Function to get templates by days per week
export const getTemplatesByDaysPerWeek = (days: number): WorkoutTemplate[] => {
  return WORKOUT_TEMPLATES.filter(template => template.daysPerWeek === days);
};
