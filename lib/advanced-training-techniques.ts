/**
 * Advanced Training Techniques
 * Implementation of advanced bodybuilding and strength training techniques
 * based on Spanish fitness resources and scientific research.
 */

import { TrainingGoal, TrainingLevel } from "./enhanced-periodization";
import { ExerciseType, MuscleGroup } from "./bodybuilding-science";

// Types for advanced techniques
export type TechniqueCategory = 
  | "intensity" 
  | "volume" 
  | "tempo" 
  | "mechanical" 
  | "metabolic" 
  | "compound" 
  | "specialized";

export type TechniqueDifficulty = 
  | "beginner" 
  | "intermediate" 
  | "advanced" 
  | "elite";

export type ExerciseSuitability = 
  | "compound" 
  | "isolation" 
  | "machine" 
  | "free_weights" 
  | "bodyweight" 
  | "cable";

export interface TechniqueDetails {
  name: string;
  spanishName: string;
  description: string;
  category: TechniqueCategory;
  difficulty: TechniqueDifficulty;
  suitableExercises: ExerciseSuitability[];
  applicableGoals: TrainingGoal[];
  fatigueImpact: number; // 1-10 scale
  recoveryRequirement: number; // 1-10 scale
  recommendedFrequency: string;
  implementationNotes: string;
  benefits: string[];
  cautions: string[];
  recommendedMuscleGroups?: MuscleGroup[];
  videoUrl?: string;
}

// Advanced training techniques catalog
export const ADVANCED_TECHNIQUES: Record<string, TechniqueDetails> = {
  // Intensity techniques
  "drop_sets": {
    name: "Drop Sets",
    spanishName: "Series Descendentes",
    description: "Realizar una serie hasta el fallo o cerca del fallo, reducir el peso inmediatamente y continuar sin descanso.",
    category: "intensity",
    difficulty: "intermediate",
    suitableExercises: ["isolation", "machine", "cable"],
    applicableGoals: ["hypertrophy", "endurance"],
    fatigueImpact: 8,
    recoveryRequirement: 7,
    recommendedFrequency: "1-2 veces por semana por grupo muscular",
    implementationNotes: "Reducir el peso un 20-30% en cada drop. Realizar 2-3 drops por serie. Limitar a 1-2 ejercicios por sesión.",
    benefits: [
      "Aumenta el tiempo bajo tensión",
      "Recluta más fibras musculares",
      "Incrementa el estrés metabólico",
      "Permite más volumen en menos tiempo"
    ],
    cautions: [
      "Alta fatiga sistémica y local",
      "Puede comprometer la recuperación",
      "No recomendable para principiantes",
      "Evitar en ejercicios complejos multiarticulares"
    ]
  },
  
  "rest_pause": {
    name: "Rest-Pause",
    spanishName: "Pausa-Descanso",
    description: "Realizar una serie hasta el fallo o cerca del fallo, descansar brevemente (10-20 segundos), y continuar con el mismo peso para más repeticiones.",
    category: "intensity",
    difficulty: "intermediate",
    suitableExercises: ["compound", "isolation", "machine", "free_weights"],
    applicableGoals: ["hypertrophy", "strength"],
    fatigueImpact: 7,
    recoveryRequirement: 6,
    recommendedFrequency: "1-2 veces por semana por grupo muscular",
    implementationNotes: "Realizar 1-3 mini-series después de la serie principal. Usar con moderación (1-2 ejercicios por sesión).",
    benefits: [
      "Aumenta el tiempo bajo tensión",
      "Recluta más fibras musculares",
      "Incrementa el estrés metabólico",
      "Permite más volumen en menos tiempo"
    ],
    cautions: [
      "Alta fatiga sistémica y local",
      "Puede comprometer la recuperación",
      "No recomendable para principiantes",
      "Evitar en ejercicios complejos multiarticulares"
    ]
  },
  
  "mechanical_drop_set": {
    name: "Mechanical Drop Set",
    spanishName: "Series Mecánicas",
    description: "Cambiar la mecánica del ejercicio para continuar después del fallo muscular, manteniendo el mismo peso pero modificando la palanca o el ángulo.",
    category: "mechanical",
    difficulty: "intermediate",
    suitableExercises: ["compound", "isolation", "free_weights"],
    applicableGoals: ["hypertrophy"],
    fatigueImpact: 8,
    recoveryRequirement: 7,
    recommendedFrequency: "1 vez por semana por grupo muscular",
    implementationNotes: "Ejemplos: curl de bíceps inclinado → curl de pie → curl predicador, o press de banca inclinado → plano → declinado.",
    benefits: [
      "Estimula diferentes ángulos del músculo",
      "Permite continuar más allá del fallo",
      "Aumenta el tiempo bajo tensión",
      "Proporciona un estímulo único para el crecimiento"
    ],
    cautions: [
      "Requiere planificación previa",
      "Alta fatiga muscular local",
      "Necesita equipamiento específico",
      "No adecuado para todos los ejercicios"
    ]
  },
  
  "super_sets": {
    name: "Super Sets",
    spanishName: "Super Series",
    description: "Realizar dos ejercicios consecutivos sin descanso entre ellos.",
    category: "volume",
    difficulty: "beginner",
    suitableExercises: ["compound", "isolation", "machine", "free_weights", "cable"],
    applicableGoals: ["hypertrophy", "endurance", "weight_loss"],
    fatigueImpact: 6,
    recoveryRequirement: 5,
    recommendedFrequency: "2-3 veces por semana",
    implementationNotes: "Pueden ser para el mismo grupo muscular (agonista), músculos opuestos (antagonista) o músculos no relacionados.",
    benefits: [
      "Ahorra tiempo",
      "Aumenta la densidad del entrenamiento",
      "Incrementa el gasto calórico",
      "Mejora la congestión muscular"
    ],
    cautions: [
      "Puede comprometer la técnica si se fatiga demasiado",
      "Requiere buena condición cardiovascular",
      "Puede requerir menos peso en el segundo ejercicio"
    ]
  },
  
  "giant_sets": {
    name: "Giant Sets",
    spanishName: "Series Gigantes",
    description: "Realizar 3-5 ejercicios consecutivos para el mismo grupo muscular sin descanso entre ellos.",
    category: "volume",
    difficulty: "advanced",
    suitableExercises: ["compound", "isolation", "machine", "free_weights", "cable"],
    applicableGoals: ["hypertrophy", "endurance", "weight_loss"],
    fatigueImpact: 9,
    recoveryRequirement: 8,
    recommendedFrequency: "1 vez por semana por grupo muscular",
    implementationNotes: "Comenzar con ejercicios compuestos y terminar con aislamientos. Descansar 2-3 minutos entre rondas completas.",
    benefits: [
      "Máxima congestión muscular",
      "Alto estrés metabólico",
      "Estimulación completa del grupo muscular",
      "Eficiente en tiempo"
    ],
    cautions: [
      "Extremadamente fatigante",
      "Requiere excelente condición física",
      "Puede comprometer la recuperación",
      "No recomendable para principiantes"
    ]
  },
  
  "myo_reps": {
    name: "Myo-Reps",
    spanishName: "Myo-Reps",
    description: "Una serie de activación seguida de mini-series con descansos muy cortos, manteniendo la tensión muscular.",
    category: "intensity",
    difficulty: "intermediate",
    suitableExercises: ["isolation", "machine", "cable"],
    applicableGoals: ["hypertrophy"],
    fatigueImpact: 7,
    recoveryRequirement: 6,
    recommendedFrequency: "1-2 veces por semana por grupo muscular",
    implementationNotes: "Serie de activación de 12-15 reps, descanso de 3-5 respiraciones, luego 3-5 reps, repetir 4-5 veces.",
    benefits: [
      "Eficiente en tiempo",
      "Maximiza la activación muscular",
      "Estimula fibras de contracción rápida",
      "Aumenta la señalización anabólica"
    ],
    cautions: [
      "Requiere buena conexión mente-músculo",
      "No adecuado para ejercicios técnicamente complejos",
      "Puede ser demasiado intenso para principiantes"
    ]
  },
  
  "cluster_sets": {
    name: "Cluster Sets",
    spanishName: "Series Cluster",
    description: "Dividir una serie en mini-series con micro-descansos para manejar cargas más pesadas o más volumen total.",
    category: "intensity",
    difficulty: "advanced",
    suitableExercises: ["compound", "free_weights"],
    applicableGoals: ["strength", "power", "hypertrophy"],
    fatigueImpact: 8,
    recoveryRequirement: 7,
    recommendedFrequency: "1 vez por semana por patrón de movimiento",
    implementationNotes: "Ejemplo: 5 series de 2 reps con 20-30s de descanso entre mini-series, para un total de 10 reps con peso cercano al 90% 1RM.",
    benefits: [
      "Permite manejar cargas más pesadas",
      "Mejora la calidad de las repeticiones",
      "Reduce la fatiga técnica",
      "Aumenta el volumen de alta intensidad"
    ],
    cautions: [
      "Requiere concentración constante",
      "Alta demanda del sistema nervioso",
      "Necesita cronometraje preciso",
      "No adecuado para todos los ejercicios"
    ]
  },
  
  "tempo_training": {
    name: "Tempo Training",
    spanishName: "Entrenamiento con Tempo",
    description: "Manipular la velocidad de las fases excéntrica, isométrica y concéntrica para aumentar el tiempo bajo tensión.",
    category: "tempo",
    difficulty: "intermediate",
    suitableExercises: ["compound", "isolation", "machine", "free_weights", "cable"],
    applicableGoals: ["hypertrophy", "strength"],
    fatigueImpact: 6,
    recoveryRequirement: 5,
    recommendedFrequency: "2-3 veces por semana",
    implementationNotes: "Notación: 4-1-2-0 (4s excéntrica, 1s pausa inferior, 2s concéntrica, 0s pausa superior)",
    benefits: [
      "Aumenta el tiempo bajo tensión",
      "Mejora el control y la técnica",
      "Incrementa la conciencia muscular",
      "Reduce el riesgo de lesiones"
    ],
    cautions: [
      "Requiere reducir el peso utilizado",
      "Puede ser mentalmente desafiante",
      "No siempre adecuado para ejercicios de potencia"
    ]
  },
  
  "pre_exhaustion": {
    name: "Pre-Exhaustion",
    spanishName: "Pre-Fatiga",
    description: "Realizar un ejercicio de aislamiento antes de un ejercicio compuesto para el mismo grupo muscular.",
    category: "specialized",
    difficulty: "intermediate",
    suitableExercises: ["isolation", "compound"],
    applicableGoals: ["hypertrophy"],
    fatigueImpact: 7,
    recoveryRequirement: 6,
    recommendedFrequency: "1-2 veces por semana por grupo muscular",
    implementationNotes: "Ejemplo: Aperturas para pecho seguidas de press de banca, o extensiones de cuádriceps seguidas de sentadillas.",
    benefits: [
      "Aumenta la fatiga del músculo objetivo",
      "Mejora la conexión mente-músculo",
      "Puede superar estancamientos",
      "Útil cuando los músculos secundarios limitan el rendimiento"
    ],
    cautions: [
      "Reduce el peso que se puede usar en el ejercicio compuesto",
      "Puede comprometer la técnica si se fatiga demasiado",
      "No recomendable para principiantes"
    ]
  },
  
  "post_exhaustion": {
    name: "Post-Exhaustion",
    spanishName: "Post-Fatiga",
    description: "Realizar un ejercicio de aislamiento inmediatamente después de un ejercicio compuesto para el mismo grupo muscular.",
    category: "specialized",
    difficulty: "intermediate",
    suitableExercises: ["isolation", "compound"],
    applicableGoals: ["hypertrophy"],
    fatigueImpact: 8,
    recoveryRequirement: 7,
    recommendedFrequency: "1-2 veces por semana por grupo muscular",
    implementationNotes: "Ejemplo: Press de banca seguido de aperturas para pecho, o sentadillas seguidas de extensiones de cuádriceps.",
    benefits: [
      "Maximiza la fatiga muscular",
      "Asegura que el músculo objetivo se trabaje completamente",
      "Aumenta la congestión muscular",
      "Puede superar estancamientos"
    ],
    cautions: [
      "Extremadamente fatigante",
      "Puede comprometer la recuperación",
      "Requiere buena técnica incluso en estado de fatiga"
    ]
  },
  
  "partial_reps": {
    name: "Partial Reps",
    spanishName: "Repeticiones Parciales",
    description: "Realizar repeticiones en un rango de movimiento limitado, generalmente en la parte más difícil del ejercicio.",
    category: "mechanical",
    difficulty: "intermediate",
    suitableExercises: ["compound", "isolation", "machine", "free_weights"],
    applicableGoals: ["strength", "hypertrophy"],
    fatigueImpact: 7,
    recoveryRequirement: 6,
    recommendedFrequency: "1-2 veces por semana por grupo muscular",
    implementationNotes: "Pueden realizarse después de repeticiones completas o como técnica independiente. Útiles en puntos de estancamiento.",
    benefits: [
      "Permite manejar cargas más pesadas",
      "Enfoca la tensión en rangos específicos",
      "Útil para superar puntos débiles",
      "Puede aumentar la hipertrofia en zonas específicas"
    ],
    cautions: [
      "No debe reemplazar completamente las repeticiones completas",
      "Puede crear desequilibrios si se abusa",
      "Requiere buena técnica para evitar lesiones"
    ]
  }
};

/**
 * Get recommended techniques based on training goal and level
 */
export function getRecommendedTechniques(
  goal: TrainingGoal,
  level: TrainingLevel
): TechniqueDetails[] {
  // Filter techniques based on goal and difficulty level
  const appropriateDifficulty: TechniqueDifficulty[] = [];
  
  switch (level) {
    case "beginner":
      appropriateDifficulty.push("beginner");
      break;
    case "intermediate":
      appropriateDifficulty.push("beginner", "intermediate");
      break;
    case "advanced":
    case "elite":
      appropriateDifficulty.push("beginner", "intermediate", "advanced");
      if (level === "elite") appropriateDifficulty.push("elite");
      break;
  }
  
  return Object.values(ADVANCED_TECHNIQUES).filter(technique => 
    technique.applicableGoals.includes(goal) && 
    appropriateDifficulty.includes(technique.difficulty)
  );
}

/**
 * Get techniques by category
 */
export function getTechniquesByCategory(category: TechniqueCategory): TechniqueDetails[] {
  return Object.values(ADVANCED_TECHNIQUES).filter(technique => 
    technique.category === category
  );
}

/**
 * Get techniques suitable for specific exercise types
 */
export function getTechniquesForExerciseType(exerciseType: ExerciseSuitability): TechniqueDetails[] {
  return Object.values(ADVANCED_TECHNIQUES).filter(technique => 
    technique.suitableExercises.includes(exerciseType)
  );
}

/**
 * Get techniques suitable for specific muscle groups
 */
export function getTechniquesForMuscleGroup(muscleGroup: MuscleGroup): TechniqueDetails[] {
  return Object.values(ADVANCED_TECHNIQUES).filter(technique => 
    !technique.recommendedMuscleGroups || 
    technique.recommendedMuscleGroups.includes(muscleGroup)
  );
}
