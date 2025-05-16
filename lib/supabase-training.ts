import { createClient } from '@supabase/supabase-js'
import {
  WorkoutRoutine,
  WorkoutDay,
  ExerciseSet,
  WorkoutLog,
  Exercise,
  UserTrainingProfile,
  TrainingAlgorithmData
} from '@/lib/types/training'
import { exerciseData } from '@/lib/exercise-data'

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verificar que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Las variables de entorno de Supabase no están definidas')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Definida' : 'No definida')
}

// Crear el cliente de Supabase
const supabase = createClient(
  supabaseUrl || 'https://soviwrzrgskhvgcmujfj.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdml3cnpyZ3NraHZnY211amZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTIzMzIsImV4cCI6MjA2MTY4ODMzMn0.dBGIib2YNrXTrGFvMQaUf3w8jbIRX-pixujAj_SPn5s'
)

// Funciones para obtener datos de entrenamiento

/**
 * Obtiene una rutina de entrenamiento por su ID
 */
export async function getWorkoutRoutineById(routineId: string) {
  try {
    console.log('Obteniendo rutina con ID:', routineId)

    if (!routineId) {
      console.warn('Se intentó obtener una rutina sin proporcionar un ID')
      return { data: null, error: new Error('Se requiere un ID de rutina válido') }
    }

    // Obtenemos la rutina principal
    const { data: routineData, error: routineError } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('id', routineId)
      .single()

    if (routineError) {
      console.error('Error al obtener rutina de Supabase:', routineError)
      console.error('Detalles del error:', JSON.stringify(routineError, null, 2))
      return { data: null, error: routineError }
    }

    if (!routineData) {
      console.log('No se encontró la rutina con ID:', routineId)
      return { data: null, error: new Error('Rutina no encontrada') }
    }

    // Procesar los días de la rutina
    let days: WorkoutDay[] = [];

    // Primero intentamos obtener los días de la tabla workout_days
    const { data: daysData, error: daysError } = await supabase
      .from('workout_days')
      .select('*')
      .eq('routine_id', routineId)
      .order('name')

    if (!daysError && daysData && daysData.length > 0) {
      // Si encontramos días en la tabla, los procesamos
      days = await Promise.all(daysData.map(async day => {
        // Obtener los ejercicios para este día
        const { data: exerciseSetsData, error: exerciseSetsError } = await supabase
          .from('workout_exercise_sets')
          .select('*')
          .eq('day_id', day.id)

        let exerciseSets: ExerciseSet[] = [];

        if (!exerciseSetsError && exerciseSetsData && exerciseSetsData.length > 0) {
          exerciseSets = exerciseSetsData.map(set => ({
            id: set.id,
            exerciseId: set.exercise_id,
            alternativeExerciseId: set.alternative_exercise_id || undefined,
            targetReps: set.target_reps,
            targetRir: set.target_rir,
            weight: set.weight || undefined,
            restTime: set.rest_time || undefined,
            isWarmup: set.is_warmup || false,
            isDropSet: set.is_drop_set || false,
            isSupersetWith: set.is_superset_with || undefined
          }));
        }

        return {
          id: day.id,
          name: day.name,
          description: day.description || undefined,
          targetMuscleGroups: day.target_muscle_groups || [],
          estimatedDuration: day.estimated_duration || undefined,
          difficulty: day.difficulty as 'beginner' | 'intermediate' | 'advanced',
          notes: day.notes || undefined,
          exerciseSets
        };
      }));
    } else {
      // Si no encontramos días en la tabla, intentamos obtenerlos del campo exercises
      try {
        let exercisesData = routineData.exercises;

        // Si es un string, intentamos parsearlo
        if (typeof exercisesData === 'string') {
          exercisesData = JSON.parse(exercisesData);
        }

        // Si es un array, lo procesamos
        if (Array.isArray(exercisesData)) {
          days = exercisesData.map(day => {
            // Convertir los exercise_sets a exerciseSets si es necesario
            let exerciseSets = day.exerciseSets || [];

            if (day.exercise_sets && Array.isArray(day.exercise_sets)) {
              exerciseSets = day.exercise_sets.map((set: any) => ({
                id: set.id,
                exerciseId: set.exercise_id,
                alternativeExerciseId: set.alternative_exercise_id || undefined,
                targetReps: set.target_reps,
                targetRir: set.target_rir,
                weight: set.weight || undefined,
                restTime: set.rest_time || undefined,
                isWarmup: set.is_warmup || false,
                isDropSet: set.is_drop_set || false,
                isSupersetWith: set.is_superset_with || undefined
              }));
            }

            return {
              id: day.id,
              name: day.name,
              description: day.description || undefined,
              targetMuscleGroups: day.target_muscle_groups || day.targetMuscleGroups || [],
              estimatedDuration: day.estimated_duration || day.estimatedDuration || undefined,
              difficulty: (day.difficulty || 'intermediate') as 'beginner' | 'intermediate' | 'advanced',
              notes: day.notes || undefined,
              exerciseSets
            };
          });
        }
      } catch (parseError) {
        console.error('Error al procesar los días de la rutina:', parseError, routineData.exercises)
        days = [];
      }
    }

    // Transformar los datos al formato esperado por la aplicación
    const routine: WorkoutRoutine = {
      id: routineData.id,
      userId: routineData.user_id,
      name: routineData.name,
      description: routineData.description || undefined,
      days: days,
      frequency: routineData.frequency || 3,
      goal: (routineData.goal || 'hypertrophy') as 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general_fitness',
      level: (routineData.level || 'intermediate') as 'beginner' | 'intermediate' | 'advanced',
      createdAt: routineData.created_at,
      updatedAt: routineData.updated_at,
      isActive: routineData.is_template === false,
      startDate: routineData.start_date || undefined,
      endDate: routineData.end_date || undefined,
      periodizationId: routineData.periodization_id || undefined
    };

    return { data: routine, error: null }
  } catch (error) {
    console.error('Error general en getWorkoutRoutineById:', error)
    // Proporcionar información detallada sobre el error
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message)
      console.error('Stack trace:', error.stack)
    } else {
      console.error('Error desconocido:', JSON.stringify(error, null, 2))
    }
    return { data: null, error: error }
  }
}

/**
 * Actualiza una rutina de entrenamiento existente
 */
export async function updateWorkoutRoutine(routine: WorkoutRoutine) {
  try {
    console.log('Actualizando rutina:', routine.name)

    if (!routine.id) {
      console.warn('Se intentó actualizar una rutina sin proporcionar un ID')
      return { data: null, error: new Error('Se requiere un ID de rutina válido') }
    }

    // Preparar los datos para Supabase
    // Procesamos los días para guardarlos correctamente
    const processedDays = routine.days.map(day => ({
      id: day.id,
      name: day.name,
      description: day.description || '',
      target_muscle_groups: day.targetMuscleGroups || [],
      difficulty: day.difficulty || 'intermediate',
      estimated_duration: day.estimatedDuration || 0,
      notes: day.notes || '',
      exercise_sets: day.exerciseSets.map(set => ({
        id: set.id,
        exercise_id: set.exerciseId,
        alternative_exercise_id: set.alternativeExerciseId || null,
        target_reps: set.targetReps,
        target_rir: set.targetRir,
        weight: set.weight || null,
        rest_time: set.restTime || null,
        is_warmup: set.isWarmup || false,
        is_drop_set: set.isDropSet || false,
        is_superset_with: set.isSupersetWith || null
      }))
    }));

    const supabaseData = {
      name: routine.name,
      description: routine.description || '',
      level: routine.level || 'intermediate',
      exercises: processedDays, // Guardar como JSONB
      updated_at: new Date().toISOString()
    }

    // Actualizar en Supabase
    const { data, error } = await supabase
      .from('workout_routines')
      .update(supabaseData)
      .eq('id', routine.id)
      .select()

    if (error) {
      console.error('Error al actualizar rutina en Supabase:', error)
      console.error('Detalles del error:', JSON.stringify(error, null, 2))
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      console.error('No se recibieron datos de Supabase al actualizar la rutina')
      return { data: null, error: new Error('No se recibieron datos de Supabase') }
    }

    console.log('Rutina actualizada exitosamente en Supabase:', data[0].id)

    return { data: routine, error: null }
  } catch (error) {
    console.error('Error general en updateWorkoutRoutine:', error)
    // Proporcionar información detallada sobre el error
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message)
      console.error('Stack trace:', error.stack)
    } else {
      console.error('Error desconocido:', JSON.stringify(error, null, 2))
    }
    return { data: null, error }
  }
}

/**
 * Obtiene las rutinas de entrenamiento de un usuario
 */
export async function getWorkoutRoutines(userId: string, isTemplate: boolean = false) {
  try {
    console.log('Obteniendo rutinas para el usuario:', userId)

    if (!userId) {
      console.warn('Se intentó obtener rutinas sin proporcionar un userId')
      return { data: [], error: new Error('Se requiere un ID de usuario válido') }
    }

    // Caso especial para plantillas públicas
    if (userId === "public") {
      console.log('Obteniendo plantillas públicas predefinidas')
      // Para plantillas públicas, usamos datos predefinidos en lugar de consultar la base de datos
      // ya que "public" no es un UUID válido
      const predefinedTemplates = [
        {
          id: "template-fullbody-1",
          name: "Rutina Full Body para Principiantes",
          description: "Rutina de cuerpo completo ideal para principiantes, 3 días por semana",
          level: "beginner",
          goal: "general_fitness",
          frequency: 3,
          userId: "system",
          days: [
            {
              id: "day-fullbody-1",
              name: "Entrenamiento A",
              targetMuscleGroups: ["pecho", "espalda", "piernas", "hombros"],
              difficulty: "beginner",
              exerciseSets: [
                { id: "set-1", exerciseId: "squat", targetReps: 10, targetRir: 2, weight: 0 },
                { id: "set-2", exerciseId: "push-up", targetReps: 10, targetRir: 2, weight: 0 },
                { id: "set-3", exerciseId: "lat-pulldown", targetReps: 10, targetRir: 2, weight: 0 }
              ]
            },
            {
              id: "day-fullbody-2",
              name: "Entrenamiento B",
              targetMuscleGroups: ["piernas", "brazos", "core"],
              difficulty: "beginner",
              exerciseSets: [
                { id: "set-4", exerciseId: "lunge", targetReps: 10, targetRir: 2, weight: 0 },
                { id: "set-5", exerciseId: "bicep-curl", targetReps: 10, targetRir: 2, weight: 0 },
                { id: "set-6", exerciseId: "plank", targetReps: 30, targetRir: 2, weight: 0 }
              ]
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isTemplate: true,
          isPublic: true
        },
        {
          id: "template-ppl-1",
          name: "Push Pull Legs",
          description: "Rutina dividida en empuje, tirón y piernas para nivel intermedio",
          level: "intermediate",
          goal: "hypertrophy",
          frequency: 6,
          userId: "system",
          days: [
            {
              id: "day-push-1",
              name: "Empuje",
              targetMuscleGroups: ["pecho", "hombros", "tríceps"],
              difficulty: "intermediate",
              exerciseSets: [
                { id: "set-7", exerciseId: "bench-press", targetReps: 8, targetRir: 2, weight: 0 },
                { id: "set-8", exerciseId: "overhead-press", targetReps: 8, targetRir: 2, weight: 0 },
                { id: "set-9", exerciseId: "tricep-extension", targetReps: 10, targetRir: 2, weight: 0 }
              ]
            },
            {
              id: "day-pull-1",
              name: "Tirón",
              targetMuscleGroups: ["espalda", "bíceps", "antebrazos"],
              difficulty: "intermediate",
              exerciseSets: [
                { id: "set-10", exerciseId: "pull-up", targetReps: 8, targetRir: 2, weight: 0 },
                { id: "set-11", exerciseId: "row", targetReps: 8, targetRir: 2, weight: 0 },
                { id: "set-12", exerciseId: "bicep-curl", targetReps: 10, targetRir: 2, weight: 0 }
              ]
            },
            {
              id: "day-legs-1",
              name: "Piernas",
              targetMuscleGroups: ["cuádriceps", "isquiotibiales", "glúteos", "pantorrillas"],
              difficulty: "intermediate",
              exerciseSets: [
                { id: "set-13", exerciseId: "squat", targetReps: 8, targetRir: 2, weight: 0 },
                { id: "set-14", exerciseId: "deadlift", targetReps: 8, targetRir: 2, weight: 0 },
                { id: "set-15", exerciseId: "calf-raise", targetReps: 15, targetRir: 2, weight: 0 }
              ]
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isTemplate: true,
          isPublic: true
        }
      ];

      return { data: predefinedTemplates, error: null };
    }

    // Obtenemos las rutinas principales
    const { data: routinesData, error: routinesError } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (routinesError) {
      console.error('Error al obtener rutinas de Supabase:', routinesError)
      console.error('Detalles del error:', JSON.stringify(routinesError, null, 2))
      return { data: [], error: routinesError }
    }

    if (!routinesData || routinesData.length === 0) {
      console.log('No se encontraron rutinas para el usuario:', userId)
      return { data: [], error: null }
    }

    // Transformar los datos al formato esperado por la aplicación
    const routines: WorkoutRoutine[] = await Promise.all(routinesData.map(async routine => {
      // Procesar los días de la rutina
      let days: WorkoutDay[] = [];

      // Primero intentamos obtener los días de la tabla workout_days
      const { data: daysData, error: daysError } = await supabase
        .from('workout_days')
        .select('*')
        .eq('routine_id', routine.id)
        .order('name')

      if (!daysError && daysData && daysData.length > 0) {
        // Si encontramos días en la tabla, los procesamos
        days = await Promise.all(daysData.map(async day => {
          // Obtener los ejercicios para este día
          const { data: exerciseSetsData, error: exerciseSetsError } = await supabase
            .from('workout_exercise_sets')
            .select('*')
            .eq('day_id', day.id)

          let exerciseSets: ExerciseSet[] = [];

          if (!exerciseSetsError && exerciseSetsData && exerciseSetsData.length > 0) {
            exerciseSets = exerciseSetsData.map(set => ({
              id: set.id,
              exerciseId: set.exercise_id,
              alternativeExerciseId: set.alternative_exercise_id || undefined,
              targetReps: set.target_reps,
              targetRir: set.target_rir,
              weight: set.weight || undefined,
              restTime: set.rest_time || undefined,
              isWarmup: set.is_warmup || false,
              isDropSet: set.is_drop_set || false,
              isSupersetWith: set.is_superset_with || undefined
            }));
          }

          return {
            id: day.id,
            name: day.name,
            description: day.description || undefined,
            targetMuscleGroups: day.target_muscle_groups || [],
            estimatedDuration: day.estimated_duration || undefined,
            difficulty: day.difficulty as 'beginner' | 'intermediate' | 'advanced',
            notes: day.notes || undefined,
            exerciseSets
          };
        }));
      } else {
        // Si no encontramos días en la tabla, intentamos obtenerlos del campo exercises
        try {
          let exercisesData = routine.exercises;

          // Si es un string, intentamos parsearlo
          if (typeof exercisesData === 'string') {
            exercisesData = JSON.parse(exercisesData);
          }

          // Si es un array, lo procesamos
          if (Array.isArray(exercisesData)) {
            days = exercisesData.map(day => {
              // Convertir los exercise_sets a exerciseSets si es necesario
              let exerciseSets = day.exerciseSets || [];

              if (day.exercise_sets && Array.isArray(day.exercise_sets)) {
                exerciseSets = day.exercise_sets.map((set: any) => ({
                  id: set.id,
                  exerciseId: set.exercise_id,
                  alternativeExerciseId: set.alternative_exercise_id || undefined,
                  targetReps: set.target_reps,
                  targetRir: set.target_rir,
                  weight: set.weight || undefined,
                  restTime: set.rest_time || undefined,
                  isWarmup: set.is_warmup || false,
                  isDropSet: set.is_drop_set || false,
                  isSupersetWith: set.is_superset_with || undefined
                }));
              }

              return {
                id: day.id,
                name: day.name,
                description: day.description || undefined,
                targetMuscleGroups: day.target_muscle_groups || day.targetMuscleGroups || [],
                estimatedDuration: day.estimated_duration || day.estimatedDuration || undefined,
                difficulty: (day.difficulty || 'intermediate') as 'beginner' | 'intermediate' | 'advanced',
                notes: day.notes || undefined,
                exerciseSets
              };
            });
          }
        } catch (parseError) {
          console.error('Error al procesar los días de la rutina:', parseError, routine.exercises)
          days = [];
        }
      }

      return {
        id: routine.id,
        userId: routine.user_id,
        name: routine.name,
        description: routine.description || undefined,
        days: days,
        frequency: 3, // Valor por defecto
        goal: 'hypertrophy' as 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general_fitness', // Valor por defecto
        level: (routine.level || 'intermediate') as 'beginner' | 'intermediate' | 'advanced',
        createdAt: routine.created_at,
        updatedAt: routine.updated_at,
        isActive: routine.is_template === false, // Si no es template, consideramos que está activa
        startDate: undefined,
        endDate: undefined
      };
    }));

    return { data: routines, error: null }
  } catch (error) {
    console.error('Error general en getWorkoutRoutines:', error)
    // Proporcionar información detallada sobre el error
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message)
      console.error('Stack trace:', error.stack)
    } else {
      console.error('Error desconocido:', JSON.stringify(error, null, 2))
    }
    return { data: [], error: error }
  }
}

/**
 * Obtiene los registros de entrenamiento de un usuario
 */
export async function getWorkoutLogs(userId: string) {
  const { data, error } = await supabase
    .from('workout_logs')
    .select(`
      *,
      completed_sets:workout_log_sets(*)
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error al obtener registros de entrenamiento:', error)
    return { data: null, error }
  }

  // Transformar los datos al formato esperado por la aplicación
  const logs: WorkoutLog[] = data.map(log => ({
    id: log.id,
    userId: log.user_id,
    routineId: log.routine_id,
    dayId: log.day_id,
    date: log.date,
    duration: log.duration,
    notes: log.notes || undefined,
    overallFatigue: log.overall_fatigue,
    muscleGroupFatigue: log.muscle_group_fatigue || {},
    performance: log.performance || 'same',
    completedSets: log.completed_sets.map((set: any) => ({
      id: set.id,
      exerciseId: set.exercise_id,
      alternativeExerciseId: set.alternative_exercise_id || undefined,
      targetReps: set.target_reps,
      targetRir: set.target_rir,
      weight: set.weight || undefined,
      completedReps: set.completed_reps,
      completedWeight: set.completed_weight,
      completedRir: set.completed_rir,
      notes: set.notes || undefined,
      restTime: set.rest_time || undefined,
      isWarmup: set.is_warmup || false,
      isDropSet: set.is_drop_set || false,
      isSupersetWith: set.is_superset_with || undefined
    }))
  }))

  return { data: logs, error: null }
}

/**
 * Obtiene ejercicios alternativos para un ejercicio específico
 */
export async function getExerciseAlternatives(exerciseId: string) {
  try {
    // Primero obtenemos el ejercicio original para conocer sus características
    const { data: originalExercise, error: originalError } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single()

    if (originalError) {
      console.error('Error al obtener ejercicio original:', originalError)
      return { data: [], error: originalError }
    }

    if (!originalExercise) {
      return { data: [], error: new Error('No se encontró el ejercicio original') }
    }

    // Procesar los arrays si vienen como strings
    let muscleGroup = originalExercise.muscle_group || []
    let alternatives = originalExercise.alternatives || []

    if (typeof muscleGroup === 'string') {
      try {
        muscleGroup = JSON.parse(muscleGroup)
      } catch (e) {
        muscleGroup = muscleGroup.split(',').map((item: string) => item.trim())
      }
    }

    if (typeof alternatives === 'string') {
      try {
        alternatives = JSON.parse(alternatives)
      } catch (e) {
        alternatives = alternatives.split(',').map((item: string) => item.trim())
      }
    }

    // Si el ejercicio tiene alternativas definidas, las usamos
    if (alternatives && alternatives.length > 0) {
      const { data: alternativeExercises, error: alternativesError } = await supabase
        .from('exercises')
        .select('*')
        .in('id', alternatives)

      if (alternativesError) {
        console.error('Error al obtener ejercicios alternativos:', alternativesError)
        return { data: [], error: alternativesError }
      }

      if (!alternativeExercises || alternativeExercises.length === 0) {
        console.log('No se encontraron ejercicios alternativos definidos')
      } else {
        // Transformar los datos al formato esperado
        const exercises: Exercise[] = alternativeExercises.map(exercise => {
          // Procesar los arrays si vienen como strings
          let exMuscleGroup = exercise.muscle_group || []
          let equipment = exercise.equipment || []

          if (typeof exMuscleGroup === 'string') {
            try {
              exMuscleGroup = JSON.parse(exMuscleGroup)
            } catch (e) {
              exMuscleGroup = exMuscleGroup.split(',').map((item: string) => item.trim())
            }
          }

          if (typeof equipment === 'string') {
            try {
              equipment = JSON.parse(equipment)
            } catch (e) {
              equipment = equipment.split(',').map((item: string) => item.trim())
            }
          }

          return {
            id: exercise.id,
            name: exercise.name,
            category: exercise.category || 'other',
            muscleGroup: exMuscleGroup,
            equipment: equipment,
            description: exercise.description || undefined,
            videoUrl: exercise.video_url || undefined,
            imageUrl: exercise.image_url || undefined,
            alternatives: undefined,
            difficulty: (exercise.difficulty || 'intermediate') as 'beginner' | 'intermediate' | 'advanced',
            isCompound: exercise.is_compound || false
          }
        })

        return { data: exercises, error: null }
      }
    }

    // Si no hay alternativas definidas o no se encontraron, buscamos ejercicios similares
    // Buscar ejercicios que trabajen los mismos grupos musculares
    const { data: similarExercises, error: similarError } = await supabase
      .from('exercises')
      .select('*')
      .neq('id', exerciseId)
      .eq('category', originalExercise.category)
      .limit(10)

    if (similarError) {
      console.error('Error al obtener ejercicios similares:', similarError)
      return { data: [], error: similarError }
    }

    if (!similarExercises || similarExercises.length === 0) {
      return { data: [], error: null }
    }

    // Transformar los datos al formato esperado
    const exercises: Exercise[] = similarExercises.map(exercise => {
      // Procesar los arrays si vienen como strings
      let exMuscleGroup = exercise.muscle_group || []
      let equipment = exercise.equipment || []

      if (typeof exMuscleGroup === 'string') {
        try {
          exMuscleGroup = JSON.parse(exMuscleGroup)
        } catch (e) {
          exMuscleGroup = exMuscleGroup.split(',').map((item: string) => item.trim())
        }
      }

      if (typeof equipment === 'string') {
        try {
          equipment = JSON.parse(equipment)
        } catch (e) {
          equipment = equipment.split(',').map((item: string) => item.trim())
        }
      }

      return {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category || 'other',
        muscleGroup: exMuscleGroup,
        equipment: equipment,
        description: exercise.description || undefined,
        videoUrl: exercise.video_url || undefined,
        imageUrl: exercise.image_url || undefined,
        alternatives: undefined,
        difficulty: (exercise.difficulty || 'intermediate') as 'beginner' | 'intermediate' | 'advanced',
        isCompound: exercise.is_compound || false
      }
    })

    return { data: exercises, error: null }
  } catch (error) {
    console.error('Error general en getExerciseAlternatives:', error)
    return { data: [], error }
  }
}

/**
 * Obtiene los ejercicios disponibles
 */
export async function getExercises() {
  try {
    console.log('Obteniendo ejercicios disponibles')

    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error al obtener ejercicios de Supabase:', error)
      console.error('Detalles del error:', JSON.stringify(error, null, 2))
      // Si hay error, usamos los datos locales como respaldo
      console.log('Usando datos de ejercicios locales debido a error en Supabase')
      return { data: exerciseData, error: error }
    }

    if (!data || data.length === 0) {
      console.log('No se encontraron ejercicios en Supabase, usando datos locales')
      return { data: exerciseData, error: null }
    }

    // Transformar los datos al formato esperado por la aplicación
    const exercises: Exercise[] = data.map(exercise => {
      // Procesar los arrays si vienen como strings
      let muscleGroup = exercise.muscle_group || [];
      let equipment = exercise.equipment || [];
      let alternatives = exercise.alternatives || undefined;

      // Convertir string a array si es necesario
      if (typeof muscleGroup === 'string') {
        try {
          muscleGroup = JSON.parse(muscleGroup);
        } catch (e) {
          muscleGroup = muscleGroup.split(',').map(item => item.trim());
        }
      }

      if (typeof equipment === 'string') {
        try {
          equipment = JSON.parse(equipment);
        } catch (e) {
          equipment = equipment.split(',').map(item => item.trim());
        }
      }

      if (typeof alternatives === 'string') {
        try {
          alternatives = JSON.parse(alternatives);
        } catch (e) {
          alternatives = alternatives.split(',').map(item => item.trim());
        }
      }

      return {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category || 'other',
        muscleGroup: muscleGroup,
        equipment: equipment,
        description: exercise.description || undefined,
        videoUrl: exercise.video_url || undefined,
        imageUrl: exercise.image_url || undefined,
        alternatives: alternatives,
        difficulty: (exercise.difficulty || 'intermediate') as 'beginner' | 'intermediate' | 'advanced',
        isCompound: exercise.is_compound || false
      };
    });

    console.log(`Se encontraron ${exercises.length} ejercicios en Supabase`)
    return { data: exercises, error: null }
  } catch (error) {
    console.error('Error general en getExercises:', error)
    // Proporcionar información detallada sobre el error
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message)
      console.error('Stack trace:', error.stack)
    } else {
      console.error('Error desconocido:', JSON.stringify(error, null, 2))
    }
    // En caso de error, devolvemos los datos locales como respaldo
    return { data: exerciseData, error: error }
  }
}

/**
 * Obtiene el perfil de entrenamiento de un usuario
 */
export async function getUserTrainingProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_training_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No se encontró el perfil, creamos uno por defecto
      return {
        data: {
          userId,
          experience: 'beginner',
          goals: ['general_fitness'],
          preferredEquipment: ['bodyweight', 'dumbbell'],
          availableTime: 60,
          frequency: 3
        } as UserTrainingProfile,
        error: null
      }
    }
    console.error('Error al obtener perfil de entrenamiento:', error)
    return { data: null, error }
  }

  // Transformar los datos al formato esperado por la aplicación
  const profile: UserTrainingProfile = {
    userId: data.user_id,
    experience: data.experience,
    goals: data.goals || [],
    preferredEquipment: data.preferred_equipment || [],
    availableTime: data.available_time,
    frequency: data.frequency,
    injuryHistory: data.injury_history || undefined,
    benchmarkLifts: data.benchmark_lifts || undefined,
    bodyweight: data.bodyweight || undefined,
    height: data.height || undefined,
    age: data.age || undefined,
    gender: data.gender || undefined,
    preferredExercises: data.preferred_exercises || undefined,
    excludedExercises: data.excluded_exercises || undefined
  }

  return { data: profile, error: null }
}

/**
 * Obtiene los datos del algoritmo de entrenamiento de un usuario
 */
export async function getTrainingAlgorithmData(userId: string) {
  const { data, error } = await supabase
    .from('training_algorithm_data')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No se encontraron datos del algoritmo, creamos uno por defecto
      return {
        data: {
          userId,
          exerciseProgressions: {},
          muscleGroupRecovery: {
            chest: 48,
            back: 48,
            legs: 72,
            shoulders: 48,
            arms: 24,
            core: 24
          },
          overallRecoveryRate: 1,
          trainingAge: 0,
          adaptationRate: 1,
          preferredTrainingStyle: {
            intensityPreference: 'moderate',
            volumePreference: 'moderate',
            frequencyPreference: 'moderate',
            restPeriodPreference: 'moderate',
            exerciseVarietyPreference: 'moderate'
          },
          trainingPatterns: {
            preferredTimeOfDay: 'afternoon',
            averageSessionDuration: 60,
            consistencyScore: 50,
            preferredDaysOfWeek: []
          },
          lastUpdated: new Date().toISOString()
        } as TrainingAlgorithmData,
        error: null
      }
    }
    console.error('Error al obtener datos del algoritmo:', error)
    return { data: null, error }
  }

  // Transformar los datos al formato esperado por la aplicación
  const algorithmData: TrainingAlgorithmData = {
    userId: data.user_id,
    exerciseProgressions: data.exercise_progressions || {},
    muscleGroupRecovery: data.muscle_group_recovery || {
      chest: 48,
      back: 48,
      legs: 72,
      shoulders: 48,
      arms: 24,
      core: 24
    },
    overallRecoveryRate: data.overall_recovery_rate,
    trainingAge: data.training_age,
    adaptationRate: data.adaptation_rate,
    preferredTrainingStyle: data.preferred_training_style || {
      intensityPreference: 'moderate',
      volumePreference: 'moderate',
      frequencyPreference: 'moderate',
      restPeriodPreference: 'moderate',
      exerciseVarietyPreference: 'moderate'
    },
    trainingPatterns: data.training_patterns || {
      preferredTimeOfDay: 'afternoon',
      averageSessionDuration: 60,
      consistencyScore: 50,
      preferredDaysOfWeek: []
    },
    lastUpdated: data.last_updated
  }

  return { data: algorithmData, error: null }
}

/**
 * Guarda los datos del algoritmo de entrenamiento de un usuario
 */
export async function saveTrainingAlgorithmData(algorithmData: TrainingAlgorithmData) {
  try {
    // Preparar los datos para Supabase
    const supabaseData = {
      user_id: algorithmData.userId,
      exercise_progressions: algorithmData.exerciseProgressions,
      muscle_group_recovery: algorithmData.muscleGroupRecovery,
      overall_recovery_rate: algorithmData.overallRecoveryRate,
      training_age: algorithmData.trainingAge,
      adaptation_rate: algorithmData.adaptationRate,
      preferred_training_style: algorithmData.preferredTrainingStyle,
      training_patterns: algorithmData.trainingPatterns,
      last_updated: algorithmData.lastUpdated
    }

    // Intentar guardar en Supabase
    const { data, error } = await supabase
      .from('training_algorithm_data')
      .upsert(supabaseData)
      .select()

    if (error) {
      console.error('Error al guardar datos del algoritmo:', error)
      return { data: null, error }
    }

    return { data: algorithmData, error: null }
  } catch (error) {
    console.error('Error general al guardar datos del algoritmo:', error)
    return { data: null, error }
  }
}

// Funciones para guardar datos de entrenamiento

/**
 * Genera un UUID v4 válido
 */
function generateUUID() {
  // Implementación simple de UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Guarda una rutina de entrenamiento
 */
export async function saveWorkoutRoutine(routine: WorkoutRoutine) {
  try {
    console.log('Intentando guardar rutina:', routine.name)

    // Generar un UUID válido si no existe uno
    const routineId = routine.id && routine.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      ? routine.id
      : generateUUID();

    console.log('ID de rutina a usar:', routineId);

    // Verificar que el ID de usuario sea válido
    if (!routine.userId || !routine.userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.error('ID de usuario inválido:', routine.userId)
      console.log('Intentando obtener un usuario válido...')
    }

    // Intentar obtener un usuario válido
    let userId = routine.userId && routine.userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      ? routine.userId
      : null;

    // Obtener el usuario actual de la sesión
    const { user: currentUser } = await supabase.auth.getUser();

    // Si tenemos un usuario en la sesión, usarlo
    if (currentUser && currentUser.id) {
      console.log('Usuario actual encontrado en la sesión:', currentUser.id);
      userId = currentUser.id;
    }

    // Verificar si el usuario actual está autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (session && session.user) {
      console.log('Usuario autenticado encontrado:', session.user.id);
      userId = session.user.id;
    } else {
      console.warn('No hay usuario autenticado en la sesión actual');
    }

    // Si aún no tenemos un userId válido, usar el usuario predeterminado
    if (!userId || !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // Usar el ID del usuario predeterminado
      const defaultUserId = '5d0bb676-d00f-4798-938b-933565958855'; // Usuario default@routinize.com
      console.warn('Usando ID de usuario predeterminado:', defaultUserId);
      userId = defaultUserId;
    }

    // Verificar si podemos usar el usuario actual para guardar la rutina
    const { data: testData, error: testError } = await supabase
      .from('workout_routines')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (!testError) {
      console.log('El usuario puede acceder a workout_routines');
    } else {
      console.warn('El usuario no puede acceder a workout_routines, usando usuario predeterminado...');

      // Usar el ID del usuario predeterminado que sabemos que existe
      const defaultUserId = '5d0bb676-d00f-4798-938b-933565958855'; // Usuario default@routinize.com
      console.log('Usando usuario predeterminado:', defaultUserId);
      userId = defaultUserId;
    }

    // Crear un objeto simplificado para guardar
    const savedRoutine = {
      id: routineId,
      name: routine.name,
      description: routine.description,
      level: routine.level,
      days: routine.days,
      frequency: routine.frequency,
      goal: routine.goal,
      isActive: true,
      userId: userId,
      createdAt: routine.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Preparar los datos para Supabase
    // Primero, procesamos los días para guardarlos correctamente
    const processedDays = routine.days.map(day => ({
      id: day.id,
      name: day.name,
      description: day.description || '',
      target_muscle_groups: day.targetMuscleGroups || [],
      difficulty: day.difficulty || 'intermediate',
      estimated_duration: day.estimatedDuration || 0,
      notes: day.notes || '',
      exercise_sets: day.exerciseSets.map(set => ({
        id: set.id,
        exercise_id: set.exerciseId,
        alternative_exercise_id: set.alternativeExerciseId || null,
        target_reps: set.targetReps,
        target_rir: set.targetRir,
        weight: set.weight || null,
        rest_time: set.restTime || null,
        is_warmup: set.isWarmup || false,
        is_drop_set: set.isDropSet || false,
        is_superset_with: set.isSupersetWith || null
      }))
    }));

    const supabaseData = {
      id: routineId,
      user_id: userId,
      name: routine.name,
      description: routine.description || '',
      level: routine.level || 'intermediate',
      is_template: false,
      exercises: processedDays, // Guardar como JSONB
      created_at: routine.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Guardando en Supabase con datos:', JSON.stringify(supabaseData, null, 2))

    // Primero verificamos si el registro existe
    const { data: existingData, error: checkError } = await supabase
      .from('workout_routines')
      .select('id')
      .eq('id', routineId)
      .maybeSingle()

    if (checkError) {
      console.error('Error al verificar si la rutina existe:', checkError)
      return { data: savedRoutine, error: checkError }
    }

    let result;

    if (existingData) {
      // Si existe, actualizamos
      console.log('La rutina existe, actualizando...')
      result = await supabase
        .from('workout_routines')
        .update(supabaseData)
        .eq('id', routineId)
        .select()
    } else {
      // Si no existe, insertamos
      console.log('La rutina no existe, creando nueva...')
      result = await supabase
        .from('workout_routines')
        .insert(supabaseData)
        .select()
    }

    const { data, error } = result;

    if (error) {
      console.error('Error al guardar en Supabase:', error)
      console.error('Detalles del error:', JSON.stringify(error, null, 2))

      // Si el error es de clave foránea, intentar con el usuario predeterminado
      if (error.code === '23503' && error.message.includes('violates foreign key constraint')) {
        console.warn('Error de clave foránea, intentando con el usuario predeterminado...');

        // Usar el ID del usuario predeterminado que sabemos que existe
        const defaultUserId = '5d0bb676-d00f-4798-938b-933565958855'; // Usuario default@routinize.com
        console.log('Usando usuario predeterminado:', defaultUserId);

        // Actualizar los datos con el usuario predeterminado
        supabaseData.user_id = defaultUserId;

        // Intentar guardar nuevamente
        const retryResult = await supabase
          .from('workout_routines')
          .upsert(supabaseData)
          .select();

        if (retryResult.error) {
          console.error('Error al guardar con usuario predeterminado:', retryResult.error);
          return {
            data: savedRoutine,
            error: new Error('No se pudo guardar la rutina. Por favor, inicia sesión nuevamente.')
          };
        }

        if (!retryResult.data || retryResult.data.length === 0) {
          console.error('No se recibieron datos de Supabase al guardar con usuario predeterminado');
          return {
            data: savedRoutine,
            error: new Error('No se recibieron datos de Supabase')
          };
        }

        console.log('Datos guardados en Supabase con usuario predeterminado:', retryResult.data);

        // Actualizar el objeto savedRoutine con los datos de Supabase
        const updatedRoutine = {
          ...savedRoutine,
          id: retryResult.data[0].id,
          userId: defaultUserId, // Actualizar el userId
          createdAt: retryResult.data[0].created_at,
          updatedAt: retryResult.data[0].updated_at
        };

        return { data: updatedRoutine, error: null };
      }

      return { data: savedRoutine, error: error };
    }

    if (!data || data.length === 0) {
      console.error('No se recibieron datos de Supabase al guardar la rutina')
      return { data: savedRoutine, error: new Error('No se recibieron datos de Supabase') }
    }

    console.log('Datos guardados en Supabase:', data)

    // Actualizar el objeto savedRoutine con los datos de Supabase
    const updatedRoutine = {
      ...savedRoutine,
      id: data[0].id,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at
    }

    return { data: updatedRoutine, error: null }
  } catch (error) {
    console.error('Error general en saveWorkoutRoutine:', error)
    // Proporcionar información detallada sobre el error
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message)
      console.error('Stack trace:', error.stack)
    } else {
      console.error('Error desconocido:', JSON.stringify(error, null, 2))
    }
    return { data: null, error: error }
  }
}

/**
 * Guarda un registro de entrenamiento
 */
export async function saveWorkoutLog(log: WorkoutLog) {
  try {
    console.log('Intentando guardar registro de entrenamiento:', log.id)

    // Generar un ID válido si no existe uno
    const logId = log.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Generar un UUID para el usuario si no es válido
    const userId = log.userId && log.userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      ? log.userId
      : generateUUID();

    // Crear un objeto para guardar
    const savedLog = {
      id: logId,
      userId: userId,
      routineId: log.routineId,
      dayId: log.dayId,
      date: log.date,
      duration: log.duration,
      notes: log.notes,
      overallFatigue: log.overallFatigue,
      muscleGroupFatigue: log.muscleGroupFatigue,
      performance: log.performance,
      completedSets: log.completedSets
    }

    // Guardar en Supabase
    // Primero guardamos el registro principal
    const { data: logData, error: logError } = await supabase
      .from('workout_logs')
      .upsert({
        id: logId,
        user_id: userId,
        routine_id: log.routineId,
        day_id: log.dayId,
        date: log.date,
        duration: log.duration,
        notes: log.notes,
        overall_fatigue: log.overallFatigue,
        muscle_group_fatigue: log.muscleGroupFatigue,
        performance: log.performance
      })
      .select('id')
      .single()

    if (logError) {
      console.error('Error al guardar registro en Supabase:', logError)
      console.error('Detalles del error:', JSON.stringify(logError, null, 2))
      return { data: savedLog, error: logError }
    }

    if (!logData) {
      console.error('No se recibieron datos de Supabase al guardar el registro')
      return { data: savedLog, error: new Error('No se recibieron datos de Supabase') }
    }

    console.log('Registro guardado exitosamente en Supabase:', logData)

    // Luego guardamos los ejercicios completados
    let setsWithErrors = 0;
    for (const set of log.completedSets) {
      try {
        const { error: setError } = await supabase
          .from('workout_log_sets')
          .upsert({
            id: set.id || `set-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            log_id: logData.id,
            exercise_id: set.exerciseId,
            alternative_exercise_id: set.alternativeExerciseId || null,
            target_reps: set.targetReps,
            target_rir: set.targetRir,
            weight: set.weight || null,
            completed_reps: set.completedReps || 0,
            completed_weight: set.completedWeight || null,
            completed_rir: set.completedRir || null,
            notes: set.notes || null,
            rest_time: set.restTime || null,
            is_warmup: set.isWarmup || false,
            is_drop_set: set.isDropSet || false,
            is_superset_with: set.isSupersetWith || null
          })

        if (setError) {
          console.error('Error al guardar ejercicio completado:', setError)
          console.error('Detalles del error:', JSON.stringify(setError, null, 2))
          setsWithErrors++;
        }
      } catch (setError) {
        console.error('Error inesperado al guardar ejercicio completado:', setError)
        if (setError instanceof Error) {
          console.error('Mensaje de error:', setError.message)
          console.error('Stack trace:', setError.stack)
        } else {
          console.error('Error desconocido:', JSON.stringify(setError, null, 2))
        }
        setsWithErrors++;
      }
    }

    if (setsWithErrors > 0) {
      console.warn(`Se encontraron errores al guardar ${setsWithErrors} de ${log.completedSets.length} ejercicios completados`)
    }

    return {
      data: {
        ...logData,
        completedSets: log.completedSets,
        setsWithErrors
      },
      error: null
    }
  } catch (error) {
    console.error('Error general en saveWorkoutLog:', error)
    // Proporcionar información detallada sobre el error
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message)
      console.error('Stack trace:', error.stack)
    } else {
      console.error('Error desconocido:', JSON.stringify(error, null, 2))
    }
    return { data: null, error }
  }
}

/**
 * Guarda el perfil de entrenamiento de un usuario
 */
export async function saveUserTrainingProfile(profile: UserTrainingProfile) {
  const { data, error } = await supabase
    .from('user_training_profiles')
    .upsert({
      user_id: profile.userId,
      experience: profile.experience,
      goals: profile.goals,
      preferred_equipment: profile.preferredEquipment,
      available_time: profile.availableTime,
      frequency: profile.frequency,
      injury_history: profile.injuryHistory,
      benchmark_lifts: profile.benchmarkLifts,
      bodyweight: profile.bodyweight,
      height: profile.height,
      age: profile.age,
      gender: profile.gender,
      preferred_exercises: profile.preferredExercises,
      excluded_exercises: profile.excludedExercises
    })
    .select('*')
    .single()

  if (error) {
    console.error('Error al guardar perfil de entrenamiento:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// La función saveTrainingAlgorithmData ya está definida anteriormente en el archivo

// Suscripciones en tiempo real

/**
 * Suscribe a cambios en las rutinas de entrenamiento
 */
export function subscribeToWorkoutRoutines(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('workout-routines-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'workout_routines',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

/**
 * Suscribe a cambios en los registros de entrenamiento
 */
export function subscribeToWorkoutLogs(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('workout-logs-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'workout_logs',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}
