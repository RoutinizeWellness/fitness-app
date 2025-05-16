/**
 * Sistema de ejercicios alternativos
 * Basado en los recursos científicos de entrenamiento
 * 
 * Este sistema permite ofrecer alternativas para cada ejercicio principal
 * agrupadas por patrones de movimiento y grupos musculares.
 */

import { MuscleGroup } from "./bodybuilding-science";

// Tipos de patrones de movimiento
export type MovementPattern = 
  | "horizontal_push" 
  | "vertical_push" 
  | "horizontal_pull" 
  | "vertical_pull" 
  | "hip_hinge" 
  | "squat" 
  | "lunge" 
  | "rotation" 
  | "carry" 
  | "isolation";

// Tipo de equipamiento
export type Equipment = 
  | "barbell" 
  | "dumbbell" 
  | "machine" 
  | "cable" 
  | "bodyweight" 
  | "kettlebell" 
  | "bands" 
  | "smith_machine" 
  | "specialty_bar";

// Interfaz para ejercicios
export interface Exercise {
  id: string;
  name: string;
  spanishName: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  movementPattern: MovementPattern;
  equipment: Equipment[];
  difficulty: "beginner" | "intermediate" | "advanced";
  isCompound: boolean;
  description?: string;
  videoUrl?: string;
  imageUrl?: string;
  tips?: string[];
  alternatives?: string[]; // IDs de ejercicios alternativos
}

// Interfaz para grupos de alternativas
export interface AlternativeGroup {
  id: string;
  name: string;
  description: string;
  primaryMuscle: MuscleGroup;
  movementPattern: MovementPattern;
  exercises: Exercise[];
}

// Ejercicios de press de pecho (horizontal push)
const chestPressExercises: Exercise[] = [
  {
    id: "barbell-bench-press",
    name: "Barbell Bench Press",
    spanishName: "Press de banca con barra",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    movementPattern: "horizontal_push",
    equipment: ["barbell"],
    difficulty: "intermediate",
    isCompound: true,
    description: "El press de banca es un ejercicio compuesto que trabaja principalmente el pecho, con participación de tríceps y hombros.",
    tips: [
      "Mantén los omóplatos retraídos y pegados al banco",
      "Los pies firmes en el suelo para estabilidad",
      "Baja la barra de forma controlada hasta rozar el pecho",
      "Empuja la barra hacia arriba y ligeramente hacia atrás"
    ]
  },
  {
    id: "dumbbell-bench-press",
    name: "Dumbbell Bench Press",
    spanishName: "Press de banca con mancuernas",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    movementPattern: "horizontal_push",
    equipment: ["dumbbell"],
    difficulty: "beginner",
    isCompound: true,
    description: "Variante con mancuernas que permite mayor rango de movimiento y trabajo independiente de cada lado.",
    tips: [
      "Mayor rango de movimiento que con barra",
      "Permite rotación natural de las muñecas",
      "Útil para corregir desequilibrios entre lados"
    ]
  },
  {
    id: "incline-barbell-bench-press",
    name: "Incline Barbell Bench Press",
    spanishName: "Press inclinado con barra",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts", "triceps"],
    movementPattern: "horizontal_push",
    equipment: ["barbell"],
    difficulty: "intermediate",
    isCompound: true,
    description: "Variante inclinada que enfatiza la parte superior del pecho y los deltoides anteriores.",
    tips: [
      "Inclinación ideal entre 30-45 grados",
      "Mayor activación de la parte superior del pecho",
      "Mayor participación del deltoides anterior"
    ]
  },
  {
    id: "decline-barbell-bench-press",
    name: "Decline Barbell Bench Press",
    spanishName: "Press declinado con barra",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps"],
    movementPattern: "horizontal_push",
    equipment: ["barbell"],
    difficulty: "intermediate",
    isCompound: true,
    description: "Variante declinada que enfatiza la parte inferior del pecho.",
    tips: [
      "Declinación ideal entre 15-30 grados",
      "Mayor activación de la parte inferior del pecho",
      "Menor participación de los deltoides"
    ]
  },
  {
    id: "machine-chest-press",
    name: "Machine Chest Press",
    spanishName: "Press de pecho en máquina",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    movementPattern: "horizontal_push",
    equipment: ["machine"],
    difficulty: "beginner",
    isCompound: true,
    description: "Versión en máquina que proporciona estabilidad y es ideal para principiantes o rehabilitación.",
    tips: [
      "Excelente para principiantes",
      "Útil para trabajo de alta repetición",
      "Permite enfocarse en la conexión mente-músculo"
    ]
  },
  {
    id: "cable-chest-press",
    name: "Cable Chest Press",
    spanishName: "Press de pecho con cables",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    movementPattern: "horizontal_push",
    equipment: ["cable"],
    difficulty: "intermediate",
    isCompound: true,
    description: "Versión con cables que mantiene tensión constante durante todo el movimiento.",
    tips: [
      "Mantiene tensión constante en el músculo",
      "Excelente para finalizaciones y trabajo de volumen",
      "Permite múltiples ángulos de trabajo"
    ]
  },
  {
    id: "smith-machine-bench-press",
    name: "Smith Machine Bench Press",
    spanishName: "Press de banca en máquina Smith",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    movementPattern: "horizontal_push",
    equipment: ["smith_machine"],
    difficulty: "beginner",
    isCompound: true,
    description: "Versión en máquina Smith que proporciona un patrón de movimiento fijo y mayor estabilidad.",
    tips: [
      "Patrón de movimiento fijo",
      "Útil para entrenar hasta el fallo con seguridad",
      "Permite posiciones específicas del banco para enfatizar diferentes partes del pecho"
    ]
  }
];

// Ejercicios de press de hombro (vertical push)
const shoulderPressExercises: Exercise[] = [
  {
    id: "overhead-press",
    name: "Overhead Press",
    spanishName: "Press militar con barra",
    primaryMuscles: ["shoulders"],
    secondaryMuscles: ["triceps", "upper_chest", "traps"],
    movementPattern: "vertical_push",
    equipment: ["barbell"],
    difficulty: "intermediate",
    isCompound: true,
    description: "Ejercicio compuesto que trabaja principalmente los deltoides, con participación de tríceps y trapecio.",
    tips: [
      "Mantén el core tenso durante todo el movimiento",
      "Evita arquear la espalda baja",
      "Empuja la barra en línea recta por encima de la cabeza",
      "Lleva la barra justo por delante de la cara, no por detrás"
    ]
  },
  {
    id: "dumbbell-shoulder-press",
    name: "Dumbbell Shoulder Press",
    spanishName: "Press de hombros con mancuernas",
    primaryMuscles: ["shoulders"],
    secondaryMuscles: ["triceps", "upper_chest", "traps"],
    movementPattern: "vertical_push",
    equipment: ["dumbbell"],
    difficulty: "beginner",
    isCompound: true,
    description: "Variante con mancuernas que permite mayor rango de movimiento y trabajo independiente de cada lado.",
    tips: [
      "Mayor rango de movimiento que con barra",
      "Permite rotación natural de las muñecas",
      "Útil para corregir desequilibrios entre lados"
    ]
  },
  {
    id: "seated-dumbbell-shoulder-press",
    name: "Seated Dumbbell Shoulder Press",
    spanishName: "Press de hombros sentado con mancuernas",
    primaryMuscles: ["shoulders"],
    secondaryMuscles: ["triceps", "upper_chest"],
    movementPattern: "vertical_push",
    equipment: ["dumbbell"],
    difficulty: "beginner",
    isCompound: true,
    description: "Versión sentada que proporciona mayor estabilidad y permite enfocarse en los deltoides.",
    tips: [
      "Mayor estabilidad que la versión de pie",
      "Permite usar más peso con seguridad",
      "Mantén la espalda apoyada en el respaldo para proteger la zona lumbar"
    ]
  },
  {
    id: "machine-shoulder-press",
    name: "Machine Shoulder Press",
    spanishName: "Press de hombros en máquina",
    primaryMuscles: ["shoulders"],
    secondaryMuscles: ["triceps"],
    movementPattern: "vertical_push",
    equipment: ["machine"],
    difficulty: "beginner",
    isCompound: true,
    description: "Versión en máquina que proporciona estabilidad y es ideal para principiantes o rehabilitación.",
    tips: [
      "Excelente para principiantes",
      "Útil para trabajo de alta repetición",
      "Permite enfocarse en la conexión mente-músculo"
    ]
  },
  {
    id: "arnold-press",
    name: "Arnold Press",
    spanishName: "Press Arnold",
    primaryMuscles: ["shoulders"],
    secondaryMuscles: ["triceps", "upper_chest"],
    movementPattern: "vertical_push",
    equipment: ["dumbbell"],
    difficulty: "intermediate",
    isCompound: true,
    description: "Variante que incorpora rotación de las mancuernas, trabajando más aspectos del deltoides.",
    tips: [
      "Comienza con las palmas hacia ti",
      "Rota las mancuernas durante el movimiento ascendente",
      "Termina con las palmas hacia adelante",
      "Mayor activación de los deltoides anteriores y laterales"
    ]
  }
];

// Ejercicios de dominadas y jalones (vertical pull)
const verticalPullExercises: Exercise[] = [
  {
    id: "pull-up",
    name: "Pull-up",
    spanishName: "Dominadas",
    primaryMuscles: ["back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts", "traps"],
    movementPattern: "vertical_pull",
    equipment: ["bodyweight"],
    difficulty: "intermediate",
    isCompound: true,
    description: "Ejercicio compuesto con peso corporal que trabaja principalmente la espalda y los bíceps.",
    tips: [
      "Agarre más ancho que los hombros para mayor activación de la espalda",
      "Mantén los omóplatos retraídos durante todo el movimiento",
      "Intenta llevar el pecho hacia la barra",
      "Controla la fase excéntrica (bajada)"
    ]
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    spanishName: "Jalón al pecho",
    primaryMuscles: ["back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    movementPattern: "vertical_pull",
    equipment: ["cable", "machine"],
    difficulty: "beginner",
    isCompound: true,
    description: "Versión asistida de las dominadas que permite ajustar el peso y es ideal para principiantes.",
    tips: [
      "Mantén una ligera inclinación hacia atrás",
      "Lleva la barra hacia el pecho, no el pecho hacia la barra",
      "Enfócate en usar los músculos de la espalda, no los brazos"
    ]
  },
  {
    id: "behind-neck-lat-pulldown",
    name: "Behind Neck Lat Pulldown",
    spanishName: "Jalón tras nuca",
    primaryMuscles: ["back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts", "traps"],
    movementPattern: "vertical_pull",
    equipment: ["cable", "machine"],
    difficulty: "intermediate",
    isCompound: true,
    description: "Variante donde la barra se lleva detrás de la cabeza, enfatizando más los trapecios y deltoides posteriores.",
    tips: [
      "Requiere buena movilidad de hombros",
      "Mayor activación de trapecios y deltoides posteriores",
      "No recomendado para personas con problemas de hombros"
    ]
  },
  {
    id: "assisted-pull-up",
    name: "Assisted Pull-up",
    spanishName: "Dominadas asistidas",
    primaryMuscles: ["back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    movementPattern: "vertical_pull",
    equipment: ["machine", "bands"],
    difficulty: "beginner",
    isCompound: true,
    description: "Versión asistida de las dominadas que permite ajustar la asistencia según el nivel.",
    tips: [
      "Ideal para progresar hacia dominadas completas",
      "Reduce gradualmente la asistencia conforme progresas",
      "Mantén la misma técnica que en las dominadas normales"
    ]
  },
  {
    id: "single-arm-lat-pulldown",
    name: "Single Arm Lat Pulldown",
    spanishName: "Jalón a una mano",
    primaryMuscles: ["back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts", "core"],
    movementPattern: "vertical_pull",
    equipment: ["cable"],
    difficulty: "intermediate",
    isCompound: true,
    description: "Versión unilateral que permite mayor rango de movimiento y trabajo del core.",
    tips: [
      "Mayor activación del core para estabilizar",
      "Permite identificar y corregir desequilibrios",
      "Enfócate en la contracción completa del dorsal"
    ]
  }
];

// Ejercicios de remo (horizontal pull)
const horizontalPullExercises: Exercise[] = [
  {
    id: "barbell-row",
    name: "Barbell Row",
    spanishName: "Remo con barra",
    primaryMuscles: ["back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts", "traps"],
    movementPattern: "horizontal_pull",
    equipment: ["barbell"],
    difficulty: "intermediate",
    isCompound: true,
    description: "Ejercicio compuesto que trabaja principalmente la espalda media y baja.",
    tips: [
      "Mantén la espalda recta con una ligera inclinación",
      "Lleva la barra hacia el abdomen, no hacia el pecho",
      "Mantén los codos cerca del cuerpo",
      "Contrae los omóplatos al final del movimiento"
    ]
  },
  {
    id: "dumbbell-row",
    name: "Dumbbell Row",
    spanishName: "Remo con mancuerna",
    primaryMuscles: ["back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts", "traps"],
    movementPattern: "horizontal_pull",
    equipment: ["dumbbell"],
    difficulty: "beginner",
    isCompound: true,
    description: "Versión unilateral que permite mayor rango de movimiento y trabajo independiente de cada lado.",
    tips: [
      "Apoya una rodilla y una mano en un banco para estabilidad",
      "Mantén la espalda paralela al suelo",
      "Lleva el codo hacia atrás y arriba",
      "Permite mayor rotación y rango de movimiento que con barra"
    ]
  },
  {
    id: "cable-row",
    name: "Cable Row",
    spanishName: "Remo con cable",
    primaryMuscles: ["back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    movementPattern: "horizontal_pull",
    equipment: ["cable"],
    difficulty: "beginner",
    isCompound: true,
    description: "Versión con cables que mantiene tensión constante durante todo el movimiento.",
    tips: [
      "Mantiene tensión constante en el músculo",
      "Mantén la espalda recta y el pecho elevado",
      "Lleva los codos hacia atrás, no hacia arriba",
      "Contrae los omóplatos al final del movimiento"
    ]
  },
  {
    id: "t-bar-row",
    name: "T-Bar Row",
    spanishName: "Remo en T",
    primaryMuscles: ["back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts", "traps"],
    movementPattern: "horizontal_pull",
    equipment: ["machine", "barbell"],
    difficulty: "intermediate",
    isCompound: true,
    description: "Versión que utiliza una barra fija en un extremo, permitiendo un agarre neutro o prono.",
    tips: [
      "Permite usar más peso que otras variantes",
      "Mantén la espalda recta con una ligera inclinación",
      "Diferentes agarres enfatizan diferentes partes de la espalda",
      "Contrae los omóplatos al final del movimiento"
    ]
  },
  {
    id: "chest-supported-row",
    name: "Chest Supported Row",
    spanishName: "Remo con soporte en pecho",
    primaryMuscles: ["back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    movementPattern: "horizontal_pull",
    equipment: ["dumbbell", "machine"],
    difficulty: "beginner",
    isCompound: true,
    description: "Versión que proporciona soporte para el pecho, reduciendo la participación de la zona lumbar.",
    tips: [
      "Ideal para personas con problemas lumbares",
      "Permite enfocarse exclusivamente en la espalda",
      "Mantén los codos cerca del cuerpo para mayor activación del dorsal",
      "Abre más los codos para mayor activación de los deltoides posteriores"
    ]
  }
];

// Grupos de alternativas
export const ALTERNATIVE_GROUPS: AlternativeGroup[] = [
  {
    id: "chest-press",
    name: "Press de Pecho",
    description: "Ejercicios de empuje horizontal para pecho",
    primaryMuscle: "chest",
    movementPattern: "horizontal_push",
    exercises: chestPressExercises
  },
  {
    id: "shoulder-press",
    name: "Press de Hombro",
    description: "Ejercicios de empuje vertical para hombros",
    primaryMuscle: "shoulders",
    movementPattern: "vertical_push",
    exercises: shoulderPressExercises
  },
  {
    id: "vertical-pull",
    name: "Jalones Verticales",
    description: "Ejercicios de tracción vertical para espalda",
    primaryMuscle: "back",
    movementPattern: "vertical_pull",
    exercises: verticalPullExercises
  },
  {
    id: "horizontal-pull",
    name: "Remos Horizontales",
    description: "Ejercicios de tracción horizontal para espalda",
    primaryMuscle: "back",
    movementPattern: "horizontal_pull",
    exercises: horizontalPullExercises
  }
];

/**
 * Obtiene alternativas para un ejercicio específico
 * @param exerciseId ID del ejercicio
 * @returns Array de ejercicios alternativos
 */
export function getAlternativesForExercise(exerciseId: string): Exercise[] {
  // Buscar el grupo al que pertenece el ejercicio
  for (const group of ALTERNATIVE_GROUPS) {
    const exercise = group.exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      // Devolver todos los ejercicios del grupo excepto el actual
      return group.exercises.filter(ex => ex.id !== exerciseId);
    }
  }
  return [];
}

/**
 * Obtiene un grupo de alternativas por patrón de movimiento
 * @param pattern Patrón de movimiento
 * @returns Grupo de alternativas
 */
export function getAlternativesByPattern(pattern: MovementPattern): AlternativeGroup[] {
  return ALTERNATIVE_GROUPS.filter(group => group.movementPattern === pattern);
}

/**
 * Obtiene un grupo de alternativas por grupo muscular principal
 * @param muscle Grupo muscular
 * @returns Grupo de alternativas
 */
export function getAlternativesByMuscle(muscle: MuscleGroup): AlternativeGroup[] {
  return ALTERNATIVE_GROUPS.filter(group => group.primaryMuscle === muscle);
}
