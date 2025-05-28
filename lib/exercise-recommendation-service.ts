/**
 * Exercise Recommendation Service
 *
 * Este servicio proporciona recomendaciones inteligentes de ejercicios alternativos
 * basados en patrones de movimiento, grupos musculares y equipamiento disponible.
 */

import { supabase } from './supabase-client';
import { Exercise } from './types/training';

interface RecommendationOptions {
  preferSameEquipment?: boolean;
  preferSameDifficulty?: boolean;
  preferSamePattern?: boolean;
  maxResults?: number;
  excludeIds?: string[];
  userEquipment?: string[];
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
}

interface RecommendationResult {
  exercise: Exercise;
  matchScore: number;
  matchReason: string;
}

/**
 * Servicio para recomendar ejercicios alternativos
 */
export class ExerciseRecommendationService {

  /**
   * Recomienda ejercicios alternativos basados en un ejercicio de referencia
   * Utiliza datos reales del usuario para personalizar las recomendaciones
   */
  public static async getAlternativeExercises(
    referenceExercise: Exercise,
    options: RecommendationOptions = {}
  ): Promise<RecommendationResult[]> {
    try {
      // Opciones por defecto
      const defaultOptions: RecommendationOptions = {
        preferSameEquipment: true,
        preferSameDifficulty: true,
        preferSamePattern: true,
        maxResults: 5,
        excludeIds: [referenceExercise.id],
        userEquipment: [],
        userLevel: 'intermediate',
        userFatigue: 50, // Nivel de fatiga neutral por defecto
        availableTime: 60, // Tiempo disponible en minutos por defecto
        userPreferences: [], // Preferencias de ejercicios del usuario
        userAvoidances: [], // Ejercicios que el usuario prefiere evitar
        userInjuries: [] // Lesiones o limitaciones del usuario
      };

      const mergedOptions = { ...defaultOptions, ...options };

      // Intentar obtener ejercicios de Supabase y datos del usuario
      let exercises: Exercise[] = [];
      let userProfile = null;

      try {
        // Obtener ejercicios de la base de datos
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('exercises')
          .select('*');

        // Obtener perfil del usuario si se proporciona userId
        if (options.userId) {
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', options.userId)
            .single();

          if (!profileError && profileData) {
            userProfile = profileData;

            // Actualizar opciones con datos del perfil del usuario
            if (userProfile.equipment) mergedOptions.userEquipment = userProfile.equipment;
            if (userProfile.fitness_level) mergedOptions.userLevel = userProfile.fitness_level;
            if (userProfile.exercise_preferences) mergedOptions.userPreferences = userProfile.exercise_preferences;
            if (userProfile.exercise_avoidances) mergedOptions.userAvoidances = userProfile.exercise_avoidances;
            if (userProfile.injuries) mergedOptions.userInjuries = userProfile.injuries;
          }
        }

        if (exercisesError) {
          console.error('Error al cargar ejercicios desde Supabase:', exercisesError);
          exercises = await this.getLocalExercises();
        } else if (exercisesData && exercisesData.length > 0) {
          // Transformar datos de Supabase al formato Exercise
          exercises = exercisesData.map(ex => ({
            id: ex.id,
            name: ex.name || "",
            spanishName: ex.spanish_name || ex.name || "",
            description: ex.description || "",
            muscleGroup: ex.muscle_group ? (Array.isArray(ex.muscle_group) ? ex.muscle_group : [ex.muscle_group]) : [],
            equipment: ex.equipment ? (Array.isArray(ex.equipment) ? ex.equipment : [ex.equipment]) : [],
            difficulty: ex.difficulty || "intermediate",
            category: ex.category || "",
            videoUrl: ex.video_url || "",
            imageUrl: ex.image_url || "",
            pattern: ex.movement_pattern || "",
            alternatives: ex.alternatives || [],
            isCompound: ex.is_compound || false,
            sets: ex.sets || 3,
            repsMin: ex.reps_min || 8,
            repsMax: ex.reps_max || 12,
            rest: ex.rest || 60,
            instructions: ex.instructions || ""
          }));
        } else {
          console.warn('No se encontraron ejercicios en Supabase');
          exercises = await this.getLocalExercises();
        }
      } catch (error) {
        console.error('Error al obtener ejercicios:', error);
        exercises = await this.getLocalExercises();
      }

      // Filtrar ejercicios excluidos
      exercises = exercises.filter(ex => !mergedOptions.excludeIds?.includes(ex.id));

      // Calcular puntuación de coincidencia para cada ejercicio
      const scoredExercises = exercises.map(exercise => {
        const matchScore = this.calculateMatchScore(referenceExercise, exercise, mergedOptions);
        const matchReason = this.generateMatchReason(referenceExercise, exercise, matchScore);

        return {
          exercise,
          matchScore,
          matchReason
        };
      });

      // Ordenar por puntuación de coincidencia (mayor a menor)
      const sortedResults = scoredExercises
        .filter(result => result.matchScore > 0) // Solo incluir coincidencias relevantes
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, mergedOptions.maxResults);

      return sortedResults;
    } catch (error) {
      console.error('Error al recomendar ejercicios alternativos:', error);
      return [];
    }
  }

  /**
   * Calcula una puntuación de coincidencia entre el ejercicio de referencia y un posible alternativo
   * Utiliza datos reales del usuario para personalizar las recomendaciones
   */
  private static calculateMatchScore(
    reference: Exercise,
    candidate: Exercise,
    options: RecommendationOptions
  ): number {
    let score = 0;
    let adjustments: {factor: string, points: number}[] = [];

    // Coincidencia de patrón de movimiento (mayor importancia)
    if (reference.pattern && candidate.pattern) {
      if (reference.pattern === candidate.pattern) {
        score += 50;
        adjustments.push({factor: "Mismo patrón de movimiento", points: 50});
      }
    }

    // Coincidencia de grupos musculares
    if (reference.muscleGroup && reference.muscleGroup.length > 0 &&
        candidate.muscleGroup && candidate.muscleGroup.length > 0) {
      // Calcular intersección de grupos musculares
      const commonMuscles = reference.muscleGroup.filter(m =>
        candidate.muscleGroup.includes(m)
      );

      // Añadir puntos basados en el porcentaje de coincidencia
      const percentMatch = commonMuscles.length / reference.muscleGroup.length;
      const muscleScore = Math.round(30 * percentMatch);
      score += muscleScore;

      if (muscleScore > 0) {
        adjustments.push({factor: `${commonMuscles.length} grupos musculares en común`, points: muscleScore});
      }
    }

    // Coincidencia de equipamiento
    if (options.preferSameEquipment &&
        reference.equipment && reference.equipment.length > 0 &&
        candidate.equipment && candidate.equipment.length > 0) {
      // Verificar si hay algún equipamiento en común
      const hasCommonEquipment = reference.equipment.some(e =>
        candidate.equipment.includes(e)
      );

      if (hasCommonEquipment) {
        score += 15;
        adjustments.push({factor: "Equipamiento similar", points: 15});
      }
    }

    // Coincidencia de dificultad
    if (options.preferSameDifficulty && reference.difficulty === candidate.difficulty) {
      score += 10;
      adjustments.push({factor: "Misma dificultad", points: 10});
    }

    // Coincidencia de tipo (compuesto vs aislamiento)
    if (reference.isCompound === candidate.isCompound) {
      score += 10;
      adjustments.push({factor: reference.isCompound ? "Ambos son ejercicios compuestos" : "Ambos son ejercicios de aislamiento", points: 10});
    }

    // Ajuste por equipamiento disponible del usuario
    if (options.userEquipment && options.userEquipment.length > 0 &&
        candidate.equipment && candidate.equipment.length > 0) {
      const hasUserEquipment = candidate.equipment.some(e =>
        options.userEquipment?.includes(e)
      );

      if (hasUserEquipment) {
        score += 15;
        adjustments.push({factor: "Equipamiento disponible para el usuario", points: 15});
      } else {
        // Penalizar ejercicios que requieren equipamiento no disponible
        score -= 20;
        adjustments.push({factor: "Equipamiento no disponible para el usuario", points: -20});
      }
    }

    // Ajuste por nivel del usuario
    if (options.userLevel && candidate.difficulty) {
      // Mapear niveles a valores numéricos
      const levelMap = {
        'beginner': 1,
        'intermediate': 2,
        'advanced': 3
      };

      const userLevelValue = levelMap[options.userLevel];
      const exerciseLevelValue = levelMap[candidate.difficulty as keyof typeof levelMap];

      // Penalizar ejercicios demasiado avanzados para principiantes
      if (userLevelValue < exerciseLevelValue) {
        const levelPenalty = 15 * (exerciseLevelValue - userLevelValue);
        score -= levelPenalty;
        adjustments.push({factor: "Ejercicio demasiado avanzado para el nivel del usuario", points: -levelPenalty});
      }
    }

    // Considerar nivel de fatiga del usuario
    if (options.userFatigue !== undefined) {
      // Si el usuario está muy fatigado, favorecer ejercicios menos intensos
      if (options.userFatigue > 70) {
        if (candidate.difficulty === 'beginner' || candidate.intensity === 'low') {
          score += 25;
          adjustments.push({factor: "Baja intensidad (adecuado para fatiga alta)", points: 25});
        } else if (candidate.difficulty === 'advanced' || candidate.intensity === 'high') {
          score -= 15;
          adjustments.push({factor: "Alta intensidad (no recomendado con fatiga alta)", points: -15});
        }
      }
    }

    // Considerar preferencias del usuario
    if (options.userPreferences && options.userPreferences.length > 0) {
      if (options.userPreferences.includes(candidate.id)) {
        score += 20;
        adjustments.push({factor: "Ejercicio preferido por el usuario", points: 20});
      }
    }

    // Considerar ejercicios a evitar
    if (options.userAvoidances && options.userAvoidances.length > 0) {
      if (options.userAvoidances.includes(candidate.id)) {
        score -= 50; // Fuerte penalización
        adjustments.push({factor: "Ejercicio que el usuario prefiere evitar", points: -50});
      }
    }

    // Guardar los ajustes para explicaciones detalladas
    if (options.debug) {
      console.log(`Ajustes para ${candidate.name}:`, adjustments);
    }

    return Math.max(0, score); // Asegurar que la puntuación no sea negativa
  }

  /**
   * Genera una explicación detallada de por qué se recomienda este ejercicio
   * Incluye información sobre equipamiento, fatiga y preferencias del usuario
   */
  private static generateMatchReason(
    reference: Exercise,
    candidate: Exercise,
    score: number,
    options?: RecommendationOptions
  ): string {
    if (score <= 0) {
      return "No es una buena alternativa";
    }

    const reasons: string[] = [];

    // Razón principal basada en patrón de movimiento
    if (reference.pattern && candidate.pattern && reference.pattern === candidate.pattern) {
      reasons.push(`Mismo patrón de movimiento (${candidate.pattern})`);
    }

    // Razón basada en grupos musculares
    if (reference.muscleGroup && reference.muscleGroup.length > 0 &&
        candidate.muscleGroup && candidate.muscleGroup.length > 0) {
      const commonMuscles = reference.muscleGroup.filter(m =>
        candidate.muscleGroup.includes(m)
      );

      if (commonMuscles.length > 0) {
        if (commonMuscles.length === reference.muscleGroup.length) {
          reasons.push("Trabaja los mismos grupos musculares");
        } else {
          reasons.push(`Trabaja ${commonMuscles.length} de los mismos grupos musculares (${commonMuscles.join(', ')})`);
        }
      }
    }

    // Razón basada en equipamiento
    if (reference.equipment && reference.equipment.length > 0 &&
        candidate.equipment && candidate.equipment.length > 0) {
      const commonEquipment = reference.equipment.filter(e =>
        candidate.equipment.includes(e)
      );

      if (commonEquipment.length > 0) {
        reasons.push("Usa equipamiento similar");
      } else {
        // Verificar si el usuario tiene el equipamiento necesario
        if (options?.userEquipment && options.userEquipment.length > 0) {
          const hasUserEquipment = candidate.equipment.some(e =>
            options.userEquipment?.includes(e)
          );

          if (hasUserEquipment) {
            reasons.push("Alternativa con equipamiento disponible para ti");
          } else {
            reasons.push("Alternativa con diferente equipamiento (no disponible)");
          }
        } else {
          reasons.push("Alternativa con diferente equipamiento");
        }
      }
    }

    // Razón basada en nivel de dificultad
    if (reference.difficulty !== candidate.difficulty) {
      if (candidate.difficulty === 'beginner') {
        reasons.push("Versión más sencilla del ejercicio original");
      } else if (candidate.difficulty === 'advanced' && reference.difficulty !== 'advanced') {
        reasons.push("Versión más avanzada del ejercicio original");
      }
    }

    // Razón basada en fatiga del usuario
    if (options?.userFatigue !== undefined && options.userFatigue > 70) {
      if (candidate.difficulty === 'beginner' || candidate.intensity === 'low') {
        reasons.push("Adecuado para tu nivel actual de fatiga");
      }
    }

    // Razón basada en preferencias del usuario
    if (options?.userPreferences && options.userPreferences.includes(candidate.id)) {
      reasons.push("Ejercicio que has marcado como preferido");
    }

    // Si no hay razones específicas pero hay puntuación
    if (reasons.length === 0 && score > 0) {
      reasons.push("Alternativa viable para este ejercicio");
    }

    return reasons.join(". ");
  }

  /**
   * Obtiene una lista de ejercicios local cuando no se puede acceder a Supabase
   */
  private static async getLocalExercises(): Promise<Exercise[]> {
    // Datos de ejemplo ampliados
    return [
      {
        id: "1",
        name: "Barbell Squat",
        spanishName: "Sentadilla con Barra",
        description: "Ejercicio compuesto para piernas",
        muscleGroup: ["quadriceps", "glutes", "hamstrings"],
        equipment: ["barbell"],
        difficulty: "intermediate",
        category: "compound",
        pattern: "squat",
        isCompound: true,
        sets: 4,
        repsMin: 8,
        repsMax: 12,
        rest: 90,
        instructions: "Mantén la espalda recta y las rodillas alineadas con los pies."
      },
      {
        id: "2",
        name: "Leg Press",
        spanishName: "Prensa de Piernas",
        description: "Ejercicio para cuádriceps en máquina",
        muscleGroup: ["quadriceps", "glutes"],
        equipment: ["machine"],
        difficulty: "beginner",
        category: "compound",
        pattern: "squat",
        isCompound: true,
        sets: 3,
        repsMin: 10,
        repsMax: 15,
        rest: 60,
        instructions: "Ajusta el asiento para que las rodillas formen un ángulo de 90 grados."
      },
      {
        id: "3",
        name: "Dumbbell Lunges",
        spanishName: "Zancadas con Mancuernas",
        description: "Ejercicio unilateral para piernas",
        muscleGroup: ["quadriceps", "glutes", "hamstrings"],
        equipment: ["dumbbell"],
        difficulty: "intermediate",
        category: "unilateral",
        pattern: "lunge",
        isCompound: true,
        sets: 3,
        repsMin: 10,
        repsMax: 12,
        rest: 60,
        instructions: "Mantén el torso erguido y da un paso adelante, bajando hasta que la rodilla trasera casi toque el suelo."
      },
      {
        id: "4",
        name: "Bench Press",
        spanishName: "Press de Banca",
        description: "Ejercicio compuesto para pecho",
        muscleGroup: ["chest", "triceps", "shoulders"],
        equipment: ["barbell"],
        difficulty: "intermediate",
        category: "compound",
        pattern: "push",
        isCompound: true,
        sets: 4,
        repsMin: 8,
        repsMax: 12,
        rest: 90,
        instructions: "Mantén los hombros hacia atrás y los codos a 45 grados del cuerpo."
      },
      {
        id: "5",
        name: "Pull-up",
        spanishName: "Dominadas",
        description: "Ejercicio compuesto para espalda",
        muscleGroup: ["back", "biceps"],
        equipment: ["bodyweight"],
        difficulty: "advanced",
        category: "compound",
        pattern: "pull",
        isCompound: true,
        sets: 3,
        repsMin: 6,
        repsMax: 10,
        rest: 90,
        instructions: "Agarra la barra con las palmas hacia afuera y tira hasta que la barbilla supere la barra."
      },
      {
        id: "6",
        name: "Goblet Squat",
        spanishName: "Sentadilla Goblet",
        description: "Variante de sentadilla con mancuerna o kettlebell",
        muscleGroup: ["quadriceps", "glutes", "core"],
        equipment: ["dumbbell", "kettlebell"],
        difficulty: "beginner",
        category: "compound",
        pattern: "squat",
        isCompound: true,
        sets: 3,
        repsMin: 10,
        repsMax: 15,
        rest: 60,
        instructions: "Sostén una mancuerna o kettlebell cerca del pecho y realiza una sentadilla manteniendo la espalda recta."
      },
      {
        id: "7",
        name: "Bulgarian Split Squat",
        spanishName: "Sentadilla Búlgara",
        description: "Ejercicio unilateral para piernas",
        muscleGroup: ["quadriceps", "glutes", "hamstrings"],
        equipment: ["bodyweight", "dumbbell"],
        difficulty: "intermediate",
        category: "unilateral",
        pattern: "squat",
        isCompound: true,
        sets: 3,
        repsMin: 8,
        repsMax: 12,
        rest: 60,
        instructions: "Coloca un pie en un banco detrás de ti y baja hasta que la rodilla delantera forme un ángulo de 90 grados."
      },
      {
        id: "8",
        name: "Dumbbell Bench Press",
        spanishName: "Press de Banca con Mancuernas",
        description: "Variante del press de banca con mancuernas",
        muscleGroup: ["chest", "triceps", "shoulders"],
        equipment: ["dumbbell"],
        difficulty: "intermediate",
        category: "compound",
        pattern: "push",
        isCompound: true,
        sets: 3,
        repsMin: 8,
        repsMax: 12,
        rest: 60,
        instructions: "Acuéstate en un banco con una mancuerna en cada mano y presiona hacia arriba."
      },
      {
        id: "9",
        name: "Push-up",
        spanishName: "Flexiones",
        description: "Ejercicio básico para pecho con peso corporal",
        muscleGroup: ["chest", "triceps", "shoulders", "core"],
        equipment: ["bodyweight"],
        difficulty: "beginner",
        category: "compound",
        pattern: "push",
        isCompound: true,
        sets: 3,
        repsMin: 10,
        repsMax: 20,
        rest: 60,
        instructions: "Mantén el cuerpo recto como una tabla y baja hasta que los codos formen un ángulo de 90 grados."
      },
      {
        id: "10",
        name: "Lat Pulldown",
        spanishName: "Jalón al Pecho",
        description: "Ejercicio para espalda en máquina",
        muscleGroup: ["back", "biceps"],
        equipment: ["machine", "cable"],
        difficulty: "beginner",
        category: "compound",
        pattern: "pull",
        isCompound: true,
        sets: 3,
        repsMin: 10,
        repsMax: 15,
        rest: 60,
        instructions: "Siéntate en la máquina, agarra la barra y tira hacia abajo hasta que toque la parte superior del pecho."
      },
      {
        id: "11",
        name: "Bodyweight Squat",
        spanishName: "Sentadilla sin Peso",
        description: "Ejercicio básico de sentadilla con peso corporal",
        muscleGroup: ["quadriceps", "glutes", "hamstrings"],
        equipment: ["bodyweight"],
        difficulty: "beginner",
        category: "compound",
        pattern: "squat",
        isCompound: true,
        sets: 3,
        repsMin: 15,
        repsMax: 20,
        rest: 45,
        instructions: "Coloca los pies a la anchura de los hombros y baja como si fueras a sentarte en una silla."
      },
      {
        id: "12",
        name: "Hack Squat",
        spanishName: "Sentadilla Hack",
        description: "Variante de sentadilla en máquina",
        muscleGroup: ["quadriceps", "glutes"],
        equipment: ["machine"],
        difficulty: "intermediate",
        category: "compound",
        pattern: "squat",
        isCompound: true,
        sets: 3,
        repsMin: 8,
        repsMax: 12,
        rest: 90,
        instructions: "Colócate en la máquina con la espalda contra el respaldo y baja hasta que las rodillas formen un ángulo de 90 grados."
      }
    ];
  }
}
