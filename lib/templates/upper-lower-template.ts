import { v4 as uuidv4 } from "uuid";
import { WorkoutRoutine, WorkoutDay, ExerciseSet } from "@/lib/types/training";

// Función para crear un día de entrenamiento de tren superior A (enfocado en pecho/espalda)
const createUpperDayA = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Tren Superior A (Pecho/Espalda)",
    targetMuscleGroups: ["chest", "back", "shoulders", "triceps", "biceps"],
    difficulty: "intermediate",
    exerciseSets: [
      {
        id: uuidv4(),
        exerciseId: "bench-press",
        exerciseName: "Press de banca",
        targetReps: 8,
        targetRir: 2,
        weight: 0,
        restSeconds: 180,
        notes: "Enfócate en la técnica y en mantener la tensión en el pecho",
        order: 1,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "barbell-row",
        exerciseName: "Remo con barra",
        targetReps: 10,
        targetRir: 2,
        weight: 0,
        restSeconds: 180,
        notes: "Mantén la espalda recta y tira hacia el abdomen",
        order: 2,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "incline-dumbbell-press",
        exerciseName: "Press inclinado con mancuernas",
        targetReps: 10,
        targetRir: 2,
        weight: 0,
        restSeconds: 120,
        notes: "Inclinación a 30 grados para mayor activación del pecho superior",
        order: 3,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "pull-up",
        exerciseName: "Dominadas",
        targetReps: 10,
        targetRir: 2,
        weight: 0,
        restSeconds: 120,
        notes: "Si es necesario, usa banda elástica para asistencia",
        order: 4,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "overhead-press",
        exerciseName: "Press militar",
        targetReps: 10,
        targetRir: 2,
        weight: 0,
        restSeconds: 120,
        notes: "Mantén el core activado para proteger la zona lumbar",
        order: 5,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "barbell-curl",
        exerciseName: "Curl de bíceps con barra",
        targetReps: 12,
        targetRir: 1,
        weight: 0,
        restSeconds: 90,
        notes: "Evita balancear el cuerpo",
        order: 6,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "tricep-extension",
        exerciseName: "Extensiones de tríceps",
        targetReps: 12,
        targetRir: 1,
        weight: 0,
        restSeconds: 90,
        notes: "Mantén los codos cerca del cuerpo",
        order: 7,
        isWarmupSet: false
      }
    ]
  };
};

// Función para crear un día de entrenamiento de tren inferior A (enfocado en cuádriceps)
const createLowerDayA = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Tren Inferior A (Cuádriceps)",
    targetMuscleGroups: ["quads", "hamstrings", "glutes", "calves", "core"],
    difficulty: "intermediate",
    exerciseSets: [
      {
        id: uuidv4(),
        exerciseId: "squat",
        exerciseName: "Sentadilla con barra",
        targetReps: 8,
        targetRir: 2,
        weight: 0,
        restSeconds: 180,
        notes: "Profundidad completa, rodillas en línea con los pies",
        order: 1,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "romanian-deadlift",
        exerciseName: "Peso muerto rumano",
        targetReps: 10,
        targetRir: 2,
        weight: 0,
        restSeconds: 180,
        notes: "Mantén la espalda recta y las rodillas ligeramente flexionadas",
        order: 2,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "leg-press",
        exerciseName: "Prensa de piernas",
        targetReps: 12,
        targetRir: 1,
        weight: 0,
        restSeconds: 120,
        notes: "Coloca los pies a la altura de los hombros",
        order: 3,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "leg-extension",
        exerciseName: "Extensiones de cuádriceps",
        targetReps: 15,
        targetRir: 1,
        weight: 0,
        restSeconds: 90,
        notes: "Enfócate en la contracción en la parte superior",
        order: 4,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "calf-raise",
        exerciseName: "Elevaciones de pantorrilla",
        targetReps: 15,
        targetRir: 1,
        weight: 0,
        restSeconds: 60,
        notes: "Estira completamente en la parte inferior",
        order: 5,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "ab-crunch",
        exerciseName: "Abdominales",
        targetReps: 20,
        targetRir: 1,
        weight: 0,
        restSeconds: 60,
        notes: "Contracción completa en cada repetición",
        order: 6,
        isWarmupSet: false
      }
    ]
  };
};

// Función para crear un día de entrenamiento de tren superior B (enfocado en hombros/brazos)
const createUpperDayB = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Tren Superior B (Hombros/Brazos)",
    targetMuscleGroups: ["shoulders", "triceps", "biceps", "chest", "back"],
    difficulty: "intermediate",
    exerciseSets: [
      {
        id: uuidv4(),
        exerciseId: "overhead-press",
        exerciseName: "Press militar",
        targetReps: 8,
        targetRir: 2,
        weight: 0,
        restSeconds: 180,
        notes: "Mantén el core activado para proteger la zona lumbar",
        order: 1,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "weighted-pull-up",
        exerciseName: "Dominadas lastradas",
        targetReps: 8,
        targetRir: 2,
        weight: 0,
        restSeconds: 180,
        notes: "Añade peso si es posible, o usa banda para asistencia si es necesario",
        order: 2,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "incline-bench-press",
        exerciseName: "Press de banca inclinado",
        targetReps: 10,
        targetRir: 2,
        weight: 0,
        restSeconds: 120,
        notes: "Inclinación a 30-45 grados",
        order: 3,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "lateral-raise",
        exerciseName: "Elevaciones laterales",
        targetReps: 15,
        targetRir: 1,
        weight: 0,
        restSeconds: 90,
        notes: "Mantén una ligera flexión en los codos",
        order: 4,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "face-pull",
        exerciseName: "Face pulls",
        targetReps: 15,
        targetRir: 1,
        weight: 0,
        restSeconds: 90,
        notes: "Enfócate en la rotación externa de los hombros",
        order: 5,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "dumbbell-curl",
        exerciseName: "Curl con mancuernas",
        targetReps: 12,
        targetRir: 1,
        weight: 0,
        restSeconds: 60,
        notes: "Alterna los brazos o realiza ambos a la vez",
        order: 6,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "skull-crusher",
        exerciseName: "Extensiones de tríceps tumbado",
        targetReps: 12,
        targetRir: 1,
        weight: 0,
        restSeconds: 60,
        notes: "Mantén los codos fijos apuntando al techo",
        order: 7,
        isWarmupSet: false
      }
    ]
  };
};

// Función para crear un día de entrenamiento de tren inferior B (enfocado en isquiotibiales/glúteos)
const createLowerDayB = (): WorkoutDay => {
  return {
    id: uuidv4(),
    name: "Tren Inferior B (Isquios/Glúteos)",
    targetMuscleGroups: ["hamstrings", "glutes", "quads", "calves", "core"],
    difficulty: "intermediate",
    exerciseSets: [
      {
        id: uuidv4(),
        exerciseId: "deadlift",
        exerciseName: "Peso muerto",
        targetReps: 6,
        targetRir: 2,
        weight: 0,
        restSeconds: 180,
        notes: "Mantén la espalda recta y activa el core",
        order: 1,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "bulgarian-split-squat",
        exerciseName: "Zancada búlgara",
        targetReps: 10,
        targetRir: 2,
        weight: 0,
        restSeconds: 120,
        notes: "Realiza 10 repeticiones por pierna",
        order: 2,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "leg-curl",
        exerciseName: "Curl femoral",
        targetReps: 12,
        targetRir: 1,
        weight: 0,
        restSeconds: 90,
        notes: "Contracción completa en cada repetición",
        order: 3,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "hip-thrust",
        exerciseName: "Hip thrust",
        targetReps: 12,
        targetRir: 1,
        weight: 0,
        restSeconds: 90,
        notes: "Enfócate en la contracción de glúteos en la parte superior",
        order: 4,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "seated-calf-raise",
        exerciseName: "Elevaciones de pantorrilla sentado",
        targetReps: 15,
        targetRir: 1,
        weight: 0,
        restSeconds: 60,
        notes: "Estira completamente en la parte inferior",
        order: 5,
        isWarmupSet: false
      },
      {
        id: uuidv4(),
        exerciseId: "plank",
        exerciseName: "Plancha",
        targetReps: 3,
        targetRir: 0,
        weight: 0,
        restSeconds: 60,
        notes: "Mantén 30-60 segundos por serie",
        order: 6,
        isWarmupSet: false
      }
    ]
  };
};

// Función para crear la rutina Upper/Lower completa
export const createUpperLowerTemplate = (userId: string): WorkoutRoutine => {
  return {
    id: uuidv4(),
    userId: userId,
    name: "Upper/Lower Split Avanzado",
    description: "Rutina de 4 días dividida en tren superior e inferior con técnicas avanzadas para maximizar la hipertrofia muscular. Incluye periodización y semanas de descarga.",
    days: [
      createUpperDayA(),
      createLowerDayA(),
      createUpperDayB(),
      createLowerDayB()
    ],
    frequency: 4,
    goal: "hypertrophy",
    level: "intermediate",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    startDate: new Date().toISOString(),
    includesDeload: true,
    deloadFrequency: 4,
    source: "Pure Bodybuilding Phase 2",
    tags: ["upper_lower", "hipertrofia", "fuerza", "4 días"],
    split: "upper_lower"
  };
};
