/**
 * Advanced Workout Templates
 * Based on scientific principles from Hipertrofia Maxima, Pure Bodybuilding Phase 2,
 * and other advanced bodybuilding methodologies.
 */

import { v4 as uuidv4 } from "uuid";
import { WorkoutRoutine, WorkoutDay, ExerciseSet } from "@/lib/types/training";

// Tipos para las plantillas avanzadas
export type AdvancedWorkoutTemplate = {
  id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'weight_loss';
  split: 'ppl' | 'upper_lower' | 'full_body' | 'body_part' | 'push_pull';
  frequency: number;
  duration: number; // En semanas
  includesDeload: boolean;
  deloadFrequency: number;
  days: AdvancedWorkoutDay[];
};

export type AdvancedWorkoutDay = {
  name: string;
  targetMuscleGroups: string[];
  exercises: AdvancedWorkoutExercise[];
};

export type AdvancedWorkoutExercise = {
  name: string;
  category: string;
  sets: number;
  repsRange: string;
  rir: number;
  restSeconds: number;
  notes?: string;
  isCompound: boolean;
  alternatives?: string[];
  techniques?: string[];
};

/**
 * Plantilla PPL (Push Pull Legs) avanzada para hipertrofia
 * Basada en Pure Bodybuilding Phase 2 Hypertrophy Handbook
 */
export const ADVANCED_PPL_TEMPLATE: AdvancedWorkoutTemplate = {
  id: "advanced-ppl",
  name: "PPL Avanzado para Hipertrofia",
  description: "Rutina Push Pull Legs de 6 días con técnicas avanzadas para maximizar la hipertrofia muscular. Incluye periodización y semanas de descarga.",
  level: "advanced",
  goal: "hypertrophy",
  split: "ppl",
  frequency: 6,
  duration: 12,
  includesDeload: true,
  deloadFrequency: 4,
  days: [
    {
      name: "Empuje A (Pecho enfocado)",
      targetMuscleGroups: ["chest", "shoulders", "triceps"],
      exercises: [
        {
          name: "Press de banca",
          category: "chest",
          sets: 4,
          repsRange: "6-8",
          rir: 1,
          restSeconds: 180,
          isCompound: true,
          alternatives: ["Press de banca inclinado", "Press con mancuernas"],
          notes: "Enfocarse en la contracción del pecho. Última serie con drop set."
        },
        {
          name: "Press inclinado con mancuernas",
          category: "chest",
          sets: 4,
          repsRange: "8-10",
          rir: 2,
          restSeconds: 120,
          isCompound: true,
          alternatives: ["Press inclinado con barra", "Press en máquina"]
        },
        {
          name: "Aperturas en polea",
          category: "chest",
          sets: 3,
          repsRange: "10-12",
          rir: 1,
          restSeconds: 90,
          isCompound: false,
          techniques: ["Drop Set"]
        },
        {
          name: "Press militar con mancuernas",
          category: "shoulders",
          sets: 3,
          repsRange: "8-10",
          rir: 2,
          restSeconds: 120,
          isCompound: true,
          alternatives: ["Press militar con barra", "Press en máquina"]
        },
        {
          name: "Elevaciones laterales",
          category: "shoulders",
          sets: 4,
          repsRange: "12-15",
          rir: 1,
          restSeconds: 60,
          isCompound: false,
          techniques: ["Rest-Pause"]
        },
        {
          name: "Extensiones de tríceps en polea",
          category: "triceps",
          sets: 3,
          repsRange: "10-12",
          rir: 1,
          restSeconds: 60,
          isCompound: false,
          alternatives: ["Fondos en banco", "Extensiones con mancuerna"]
        }
      ]
    },
    {
      name: "Tirón A (Espalda enfocada)",
      targetMuscleGroups: ["back", "biceps", "forearms"],
      exercises: [
        {
          name: "Dominadas lastradas",
          category: "back",
          sets: 4,
          repsRange: "6-8",
          rir: 1,
          restSeconds: 180,
          isCompound: true,
          alternatives: ["Dominadas asistidas", "Jalón al pecho"],
          notes: "Usar peso adicional si es posible, o asistencia si es necesario."
        },
        {
          name: "Remo con barra",
          category: "back",
          sets: 4,
          repsRange: "8-10",
          rir: 2,
          restSeconds: 120,
          isCompound: true,
          alternatives: ["Remo con mancuerna", "Remo en máquina"]
        },
        {
          name: "Pullover con mancuerna",
          category: "back",
          sets: 3,
          repsRange: "10-12",
          rir: 2,
          restSeconds: 90,
          isCompound: false
        },
        {
          name: "Remo en polea baja",
          category: "back",
          sets: 3,
          repsRange: "10-12",
          rir: 1,
          restSeconds: 90,
          isCompound: false,
          techniques: ["Drop Set"]
        },
        {
          name: "Curl con barra",
          category: "biceps",
          sets: 3,
          repsRange: "8-10",
          rir: 1,
          restSeconds: 90,
          isCompound: false,
          alternatives: ["Curl con mancuernas", "Curl en máquina"]
        },
        {
          name: "Curl martillo",
          category: "biceps",
          sets: 3,
          repsRange: "10-12",
          rir: 1,
          restSeconds: 60,
          isCompound: false,
          techniques: ["Rest-Pause"]
        }
      ]
    },
    {
      name: "Piernas A (Cuádriceps enfocado)",
      targetMuscleGroups: ["quads", "hamstrings", "glutes", "calves"],
      exercises: [
        {
          name: "Sentadilla con barra",
          category: "legs",
          sets: 4,
          repsRange: "6-8",
          rir: 1,
          restSeconds: 180,
          isCompound: true,
          alternatives: ["Sentadilla frontal", "Prensa de piernas"],
          notes: "Enfocarse en la técnica y profundidad adecuada."
        },
        {
          name: "Prensa de piernas",
          category: "legs",
          sets: 4,
          repsRange: "8-10",
          rir: 2,
          restSeconds: 120,
          isCompound: true,
          alternatives: ["Hack squat", "Sentadilla en máquina"]
        },
        {
          name: "Extensiones de piernas",
          category: "quads",
          sets: 3,
          repsRange: "10-12",
          rir: 1,
          restSeconds: 90,
          isCompound: false,
          techniques: ["Drop Set"]
        },
        {
          name: "Peso muerto rumano",
          category: "hamstrings",
          sets: 3,
          repsRange: "8-10",
          rir: 2,
          restSeconds: 120,
          isCompound: true,
          alternatives: ["Buenos días", "Curl femoral acostado"]
        },
        {
          name: "Hip thrust",
          category: "glutes",
          sets: 3,
          repsRange: "10-12",
          rir: 2,
          restSeconds: 90,
          isCompound: false
        },
        {
          name: "Elevaciones de pantorrilla de pie",
          category: "calves",
          sets: 4,
          repsRange: "12-15",
          rir: 1,
          restSeconds: 60,
          isCompound: false,
          techniques: ["Rest-Pause"]
        }
      ]
    },
    {
      name: "Empuje B (Hombros enfocados)",
      targetMuscleGroups: ["shoulders", "chest", "triceps"],
      exercises: [
        {
          name: "Press militar con barra",
          category: "shoulders",
          sets: 4,
          repsRange: "6-8",
          rir: 1,
          restSeconds: 180,
          isCompound: true,
          alternatives: ["Press militar con mancuernas", "Press en máquina"],
          notes: "Mantener el core estable y evitar arquear la espalda."
        },
        {
          name: "Press inclinado con barra",
          category: "chest",
          sets: 4,
          repsRange: "8-10",
          rir: 2,
          restSeconds: 120,
          isCompound: true,
          alternatives: ["Press inclinado con mancuernas", "Press en máquina inclinado"]
        },
        {
          name: "Elevaciones laterales",
          category: "shoulders",
          sets: 4,
          repsRange: "12-15",
          rir: 1,
          restSeconds: 60,
          isCompound: false,
          techniques: ["Drop Set"]
        },
        {
          name: "Elevaciones posteriores",
          category: "shoulders",
          sets: 3,
          repsRange: "12-15",
          rir: 2,
          restSeconds: 60,
          isCompound: false
        },
        {
          name: "Fondos en paralelas",
          category: "triceps",
          sets: 3,
          repsRange: "8-10",
          rir: 1,
          restSeconds: 120,
          isCompound: true,
          alternatives: ["Fondos en banco", "Press cerrado"]
        },
        {
          name: "Extensiones de tríceps con cuerda",
          category: "triceps",
          sets: 3,
          repsRange: "10-12",
          rir: 1,
          restSeconds: 60,
          isCompound: false,
          techniques: ["Rest-Pause"]
        }
      ]
    },
    {
      name: "Tirón B (Espalda ancha enfocada)",
      targetMuscleGroups: ["back", "biceps", "forearms"],
      exercises: [
        {
          name: "Jalón al pecho agarre abierto",
          category: "back",
          sets: 4,
          repsRange: "8-10",
          rir: 1,
          restSeconds: 120,
          isCompound: true,
          alternatives: ["Dominadas agarre abierto", "Jalón en máquina"],
          notes: "Enfocarse en la contracción de los dorsales."
        },
        {
          name: "Remo con mancuerna",
          category: "back",
          sets: 4,
          repsRange: "8-10",
          rir: 2,
          restSeconds: 120,
          isCompound: true,
          alternatives: ["Remo con barra T", "Remo en máquina"]
        },
        {
          name: "Jalón al pecho agarre cerrado",
          category: "back",
          sets: 3,
          repsRange: "10-12",
          rir: 2,
          restSeconds: 90,
          isCompound: false
        },
        {
          name: "Hiperextensiones",
          category: "back",
          sets: 3,
          repsRange: "12-15",
          rir: 2,
          restSeconds: 60,
          isCompound: false
        },
        {
          name: "Curl predicador",
          category: "biceps",
          sets: 3,
          repsRange: "8-10",
          rir: 1,
          restSeconds: 90,
          isCompound: false,
          alternatives: ["Curl con cable", "Curl Scott"]
        },
        {
          name: "Curl de concentración",
          category: "biceps",
          sets: 3,
          repsRange: "10-12",
          rir: 1,
          restSeconds: 60,
          isCompound: false,
          techniques: ["Drop Set"]
        }
      ]
    },
    {
      name: "Piernas B (Isquiotibiales enfocados)",
      targetMuscleGroups: ["hamstrings", "quads", "glutes", "calves"],
      exercises: [
        {
          name: "Peso muerto",
          category: "legs",
          sets: 4,
          repsRange: "5-7",
          rir: 2,
          restSeconds: 180,
          isCompound: true,
          alternatives: ["Peso muerto sumo", "Peso muerto rumano"],
          notes: "Mantener la espalda recta y activar el core."
        },
        {
          name: "Curl femoral acostado",
          category: "hamstrings",
          sets: 4,
          repsRange: "8-10",
          rir: 1,
          restSeconds: 120,
          isCompound: false,
          alternatives: ["Curl femoral sentado", "Curl femoral de pie"],
          techniques: ["Drop Set"]
        },
        {
          name: "Sentadilla frontal",
          category: "quads",
          sets: 3,
          repsRange: "8-10",
          rir: 2,
          restSeconds: 120,
          isCompound: true,
          alternatives: ["Sentadilla Hack", "Sentadilla con mancuernas"]
        },
        {
          name: "Zancadas con mancuernas",
          category: "legs",
          sets: 3,
          repsRange: "10-12",
          rir: 1,
          restSeconds: 90,
          isCompound: true
        },
        {
          name: "Abducción de cadera",
          category: "glutes",
          sets: 3,
          repsRange: "12-15",
          rir: 2,
          restSeconds: 60,
          isCompound: false
        },
        {
          name: "Elevaciones de pantorrilla sentado",
          category: "calves",
          sets: 4,
          repsRange: "12-15",
          rir: 1,
          restSeconds: 60,
          isCompound: false,
          techniques: ["Rest-Pause"]
        }
      ]
    }
  ]
};

/**
 * Plantilla Upper/Lower avanzada para hipertrofia
 * Basada en Pure Bodybuilding Phase 2 Hypertrophy Handbook
 */
export const ADVANCED_UPPER_LOWER_TEMPLATE: AdvancedWorkoutTemplate = {
  id: "advanced-upper-lower",
  name: "Upper/Lower Avanzado para Hipertrofia",
  description: "Rutina de 4 días dividida en tren superior e inferior con técnicas avanzadas para maximizar la hipertrofia muscular. Incluye periodización y semanas de descarga.",
  level: "advanced",
  goal: "hypertrophy",
  split: "upper_lower",
  frequency: 4,
  duration: 12,
  includesDeload: true,
  deloadFrequency: 4,
  days: [
    {
      name: "Tren Superior A (Pecho/Espalda enfocado)",
      targetMuscleGroups: ["chest", "back", "shoulders", "triceps", "biceps"],
      exercises: [
        {
          name: "Press de banca",
          category: "chest",
          sets: 4,
          repsRange: "6-8",
          rir: 1,
          restSeconds: 180,
          isCompound: true,
          alternatives: ["Press con mancuernas", "Press en máquina"],
          notes: "Enfocarse en la contracción del pecho."
        },
        {
          name: "Dominadas lastradas",
          category: "back",
          sets: 4,
          repsRange: "6-8",
          rir: 1,
          restSeconds: 180,
          isCompound: true,
          alternatives: ["Jalón al pecho", "Dominadas asistidas"]
        },
        {
          name: "Press inclinado con mancuernas",
          category: "chest",
          sets: 3,
          repsRange: "8-10",
          rir: 2,
          restSeconds: 120,
          isCompound: true,
          techniques: ["Drop Set"]
        },
        {
          name: "Remo con barra",
          category: "back",
          sets: 3,
          repsRange: "8-10",
          rir: 2,
          restSeconds: 120,
          isCompound: true
        },
        {
          name: "Elevaciones laterales",
          category: "shoulders",
          sets: 3,
          repsRange: "12-15",
          rir: 1,
          restSeconds: 60,
          isCompound: false,
          techniques: ["Rest-Pause"]
        },
        {
          name: "Extensiones de tríceps en polea",
          category: "triceps",
          sets: 3,
          repsRange: "10-12",
          rir: 1,
          restSeconds: 60,
          isCompound: false
        },
        {
          name: "Curl con barra",
          category: "biceps",
          sets: 3,
          repsRange: "8-10",
          rir: 1,
          restSeconds: 60,
          isCompound: false,
          techniques: ["Drop Set"]
        }
      ]
    },
    {
      name: "Tren Inferior A (Cuádriceps enfocado)",
      targetMuscleGroups: ["quads", "hamstrings", "glutes", "calves"],
      exercises: [
        {
          name: "Sentadilla con barra",
          category: "legs",
          sets: 4,
          repsRange: "6-8",
          rir: 1,
          restSeconds: 180,
          isCompound: true,
          alternatives: ["Sentadilla frontal", "Prensa de piernas"],
          notes: "Enfocarse en la técnica y profundidad adecuada."
        },
        {
          name: "Peso muerto rumano",
          category: "hamstrings",
          sets: 4,
          repsRange: "8-10",
          rir: 2,
          restSeconds: 120,
          isCompound: true,
          alternatives: ["Buenos días", "Curl femoral acostado"]
        },
        {
          name: "Prensa de piernas",
          category: "legs",
          sets: 3,
          repsRange: "10-12",
          rir: 1,
          restSeconds: 120,
          isCompound: true,
          techniques: ["Drop Set"]
        },
        {
          name: "Extensiones de piernas",
          category: "quads",
          sets: 3,
          repsRange: "12-15",
          rir: 1,
          restSeconds: 60,
          isCompound: false
        },
        {
          name: "Hip thrust",
          category: "glutes",
          sets: 3,
          repsRange: "10-12",
          rir: 2,
          restSeconds: 90,
          isCompound: false
        },
        {
          name: "Elevaciones de pantorrilla de pie",
          category: "calves",
          sets: 4,
          repsRange: "12-15",
          rir: 1,
          restSeconds: 60,
          isCompound: false,
          techniques: ["Rest-Pause"]
        }
      ]
    },
    {
      name: "Tren Superior B (Hombros/Brazos enfocado)",
      targetMuscleGroups: ["shoulders", "chest", "back", "triceps", "biceps"],
      exercises: [
        {
          name: "Press militar con barra",
          category: "shoulders",
          sets: 4,
          repsRange: "6-8",
          rir: 1,
          restSeconds: 180,
          isCompound: true,
          alternatives: ["Press con mancuernas", "Press en máquina"],
          notes: "Mantener el core estable y evitar arquear la espalda."
        },
        {
          name: "Press inclinado con barra",
          category: "chest",
          sets: 3,
          repsRange: "8-10",
          rir: 2,
          restSeconds: 120,
          isCompound: true
        },
        {
          name: "Jalón al pecho",
          category: "back",
          sets: 3,
          repsRange: "8-10",
          rir: 2,
          restSeconds: 120,
          isCompound: true
        },
        {
          name: "Elevaciones laterales",
          category: "shoulders",
          sets: 3,
          repsRange: "12-15",
          rir: 1,
          restSeconds: 60,
          isCompound: false,
          techniques: ["Drop Set"]
        },
        {
          name: "Fondos en paralelas",
          category: "triceps",
          sets: 3,
          repsRange: "8-10",
          rir: 1,
          restSeconds: 90,
          isCompound: true,
          alternatives: ["Press cerrado", "Fondos en banco"]
        },
        {
          name: "Curl predicador",
          category: "biceps",
          sets: 3,
          repsRange: "8-10",
          rir: 1,
          restSeconds: 60,
          isCompound: false
        },
        {
          name: "Extensiones de tríceps con cuerda",
          category: "triceps",
          sets: 3,
          repsRange: "10-12",
          rir: 1,
          restSeconds: 60,
          isCompound: false,
          techniques: ["Rest-Pause"]
        }
      ]
    },
    {
      name: "Tren Inferior B (Isquiotibiales enfocado)",
      targetMuscleGroups: ["hamstrings", "quads", "glutes", "calves"],
      exercises: [
        {
          name: "Peso muerto",
          category: "legs",
          sets: 4,
          repsRange: "5-7",
          rir: 2,
          restSeconds: 180,
          isCompound: true,
          alternatives: ["Peso muerto sumo", "Peso muerto rumano"],
          notes: "Mantener la espalda recta y activar el core."
        },
        {
          name: "Sentadilla frontal",
          category: "quads",
          sets: 3,
          repsRange: "8-10",
          rir: 2,
          restSeconds: 120,
          isCompound: true,
          alternatives: ["Sentadilla Hack", "Sentadilla con mancuernas"]
        },
        {
          name: "Curl femoral acostado",
          category: "hamstrings",
          sets: 4,
          repsRange: "8-10",
          rir: 1,
          restSeconds: 90,
          isCompound: false,
          techniques: ["Drop Set"]
        },
        {
          name: "Zancadas con mancuernas",
          category: "legs",
          sets: 3,
          repsRange: "10-12",
          rir: 1,
          restSeconds: 90,
          isCompound: true
        },
        {
          name: "Abducción de cadera",
          category: "glutes",
          sets: 3,
          repsRange: "12-15",
          rir: 2,
          restSeconds: 60,
          isCompound: false
        },
        {
          name: "Elevaciones de pantorrilla sentado",
          category: "calves",
          sets: 4,
          repsRange: "12-15",
          rir: 1,
          restSeconds: 60,
          isCompound: false,
          techniques: ["Rest-Pause"]
        }
      ]
    }
  ]
};

/**
 * Función para convertir una plantilla avanzada al formato de WorkoutRoutine
 */
export function convertTemplateToRoutine(
  template: AdvancedWorkoutTemplate,
  userId: string,
  availableExercises: any[]
): WorkoutRoutine {
  // Crear los días de entrenamiento
  const days: WorkoutDay[] = template.days.map(day => {
    // Crear las series para cada ejercicio
    const exerciseSets: ExerciseSet[] = [];
    
    day.exercises.forEach(exercise => {
      // Buscar el ejercicio en la base de datos
      const exerciseData = availableExercises.find(
        e => e.name.toLowerCase() === exercise.name.toLowerCase()
      );
      
      const exerciseId = exerciseData?.id || uuidv4();
      
      // Extraer rango de repeticiones
      const [minReps, maxReps] = exercise.repsRange.split('-').map(Number);
      const targetReps = Math.round((minReps + maxReps) / 2);
      
      // Crear las series
      for (let i = 0; i < exercise.sets; i++) {
        exerciseSets.push({
          id: uuidv4(),
          exerciseId,
          targetReps,
          targetRir: exercise.rir,
          restTime: exercise.restSeconds,
          isDropSet: i === exercise.sets - 1 && exercise.techniques?.includes("Drop Set"),
          isWarmup: i === 0 && exercise.isCompound,
          notes: i === 0 ? exercise.notes : undefined
        });
      }
    });
    
    // Crear el día
    return {
      id: uuidv4(),
      name: day.name,
      description: `Entrenamiento de ${day.name}`,
      exerciseSets,
      targetMuscleGroups: day.targetMuscleGroups,
      difficulty: template.level,
      estimatedDuration: exerciseSets.length * 3 // Estimación simple: 3 minutos por serie
    };
  });
  
  // Crear la rutina completa
  return {
    id: uuidv4(),
    userId,
    name: template.name,
    description: template.description,
    days,
    frequency: template.frequency,
    goal: template.goal,
    level: template.level,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + template.duration * 7 * 24 * 60 * 60 * 1000).toISOString()
  };
}

// Exportar todas las plantillas
export const ADVANCED_TEMPLATES = [
  ADVANCED_PPL_TEMPLATE,
  ADVANCED_UPPER_LOWER_TEMPLATE
];
