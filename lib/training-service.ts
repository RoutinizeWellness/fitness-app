import { supabase } from '@/lib/supabase-client'
import {
  fetchDataFromSupabase,
  insertDataToSupabase,
  updateDataInSupabase,
  deleteDataFromSupabase
} from '@/lib/supabase-utils'
import {
  WorkoutRoutine,
  WorkoutDay,
  ExerciseSet,
  WorkoutLog,
  Exercise
} from '@/lib/types/training'
import { exerciseData } from '@/lib/exercise-data'

/**
 * Obtiene una rutina de entrenamiento específica por su ID
 * @param routineId - ID de la rutina
 * @returns - Rutina de entrenamiento o null en caso de error
 */
export const getUserRoutineById = async (routineId: string): Promise<{ data: WorkoutRoutine | null, error: any }> => {
  try {
    console.log("Buscando rutina con ID:", routineId)

    // Intentar obtener la rutina directamente de Supabase
    const { data: supabaseData, error } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('id', routineId)
      .maybeSingle();

    // Si hay error o no hay datos
    if (error) {
      console.error('Error al obtener rutina de Supabase:', error)
      return { data: null, error }
    }

    if (!supabaseData) {
      console.log('No se encontró la rutina en Supabase')

      // Intentar obtener de localStorage como respaldo
      try {
        // Buscar en todas las rutinas almacenadas localmente
        const allLocalStorageKeys = Object.keys(localStorage);
        const routineKeys = allLocalStorageKeys.filter(key => key.startsWith('routines_'));

        for (const key of routineKeys) {
          const localRoutines = localStorage.getItem(key);
          if (localRoutines) {
            const routines = JSON.parse(localRoutines);
            const foundRoutine = routines.find((r: WorkoutRoutine) => r.id === routineId);

            if (foundRoutine) {
              console.log('Rutina encontrada en localStorage')
              return { data: foundRoutine, error: null }
            }
          }
        }
      } catch (localStorageError) {
        console.error('Error al buscar en localStorage:', localStorageError)
      }

      return { data: null, error: new Error('Rutina no encontrada') }
    }

    // Transformar los datos de Supabase al formato esperado por la aplicación
    // Convertir el campo exercises a days
    const days = Array.isArray(supabaseData.exercises)
      ? supabaseData.exercises.map((ex: any) => ({
          id: ex.dayId,
          name: ex.dayName,
          exercises: ex.exercises || []
        }))
      : [];

    const transformedData: WorkoutRoutine = {
      id: supabaseData.id,
      userId: supabaseData.user_id,
      name: supabaseData.name,
      description: supabaseData.description || '',
      level: supabaseData.level || 'principiante',
      goal: 'general', // Valor por defecto ya que no existe en la tabla
      frequency: '3-4 días por semana', // Valor por defecto ya que no existe en la tabla
      days: days,
      isActive: true,
      createdAt: supabaseData.created_at,
      updatedAt: supabaseData.updated_at
    };

    console.log('Rutina obtenida y transformada:', transformedData);
    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error al obtener rutina de entrenamiento:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene las rutinas de entrenamiento del usuario
 * @param userId - ID del usuario
 * @returns - Rutinas de entrenamiento o null en caso de error
 */
export const getUserRoutines = async (userId: string): Promise<{ data: WorkoutRoutine[] | null, error: any }> => {
  try {
    // Intentar obtener rutinas directamente de Supabase para tener más control
    const { data: supabaseData, error } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Si hay error o no hay datos, intentar obtener de localStorage
    if (error || !supabaseData || supabaseData.length === 0) {
      console.log('Intentando obtener rutinas de localStorage')
      const localRoutines = localStorage.getItem(`routines_${userId}`)

      if (localRoutines) {
        return { data: JSON.parse(localRoutines), error: null }
      }

      // Si no hay datos en localStorage, devolver un array vacío
      if (error) {
        console.error('Error al obtener rutinas de Supabase:', error)
      }
      return { data: [], error }
    }

    // Transformar los datos de Supabase al formato esperado por la aplicación
    const transformedData: WorkoutRoutine[] = supabaseData.map(item => {
      // Convertir el campo exercises a days
      const days = Array.isArray(item.exercises)
        ? item.exercises.map((ex: any) => ({
            id: ex.dayId,
            name: ex.dayName,
            exercises: ex.exercises || []
          }))
        : [];

      return {
        id: item.id,
        userId: item.user_id,
        name: item.name,
        description: item.description || '',
        level: item.level || 'principiante',
        goal: 'general', // Valor por defecto ya que no existe en la tabla
        frequency: '3-4 días por semana', // Valor por defecto ya que no existe en la tabla
        days: days,
        isActive: true,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      };
    });

    console.log('Rutinas obtenidas y transformadas:', transformedData.length);
    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error al obtener rutinas de entrenamiento:', error)
    return { data: null, error }
  }
}

/**
 * Guarda una rutina de entrenamiento
 * @param routine - Rutina de entrenamiento
 * @returns - Rutina guardada o null en caso de error
 */
export const saveWorkoutRoutine = async (routine: WorkoutRoutine): Promise<{ data: WorkoutRoutine | null, error: any }> => {
  try {
    console.log('Iniciando guardado de rutina:', routine.id);

    // Validar datos de la rutina
    if (!routine.id) {
      const error = new Error('La rutina no tiene un ID válido');
      console.error(error);
      return { data: null, error };
    }

    if (!routine.userId) {
      const error = new Error('La rutina no tiene un ID de usuario válido');
      console.error(error);
      return { data: null, error };
    }

    if (!routine.name) {
      const error = new Error('La rutina debe tener un nombre');
      console.error(error);
      return { data: null, error };
    }

    // Guardar en localStorage como respaldo
    try {
      const localRoutines = localStorage.getItem(`routines_${routine.userId}`);
      let routines = localRoutines ? JSON.parse(localRoutines) : [];

      // Actualizar o añadir la rutina
      const existingIndex = routines.findIndex((r: WorkoutRoutine) => r.id === routine.id);

      if (existingIndex >= 0) {
        routines[existingIndex] = routine;
      } else {
        routines.push(routine);
      }

      localStorage.setItem(`routines_${routine.userId}`, JSON.stringify(routines));
      console.log('Rutina guardada en localStorage');
    } catch (localStorageError) {
      console.error('Error al guardar en localStorage:', localStorageError);
      // Continuar con el guardado en Supabase aunque falle localStorage
    }

    // Preparar datos para Supabase
    // Convertir la estructura de días a un formato compatible con la columna exercises
    const exercisesData = routine.days.map(day => ({
      dayId: day.id,
      dayName: day.name,
      exercises: day.exercises || []
    }));

    const supabaseData = {
      id: routine.id,
      user_id: routine.userId,
      name: routine.name,
      description: routine.description || '',
      level: routine.level || 'principiante',
      is_template: false,
      exercises: exercisesData,
      created_at: routine.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Datos preparados para Supabase:', JSON.stringify(supabaseData));

    // Intentar guardar en Supabase
    try {
      // Verificar primero si la rutina existe
      const { data: existingData, error: checkError } = await supabase
        .from('workout_routines')
        .select('id')
        .eq('id', routine.id)
        .maybeSingle();

      let result;

      if (checkError) {
        console.error('Error al verificar si la rutina existe:', checkError);
        return { data: routine, error: checkError };
      }

      if (!existingData) {
        console.log('La rutina no existe, creando nueva entrada...');
        // Si no existe, insertar
        result = await supabase
          .from('workout_routines')
          .insert(supabaseData)
          .select();
      } else {
        console.log('La rutina existe, actualizando...');
        // Si existe, actualizar
        result = await supabase
          .from('workout_routines')
          .update(supabaseData)
          .eq('id', routine.id)
          .select();
      }

      const { data, error } = result;

      if (error) {
        console.error('Error al guardar en Supabase:', error);
        console.error('Detalles del error:', JSON.stringify(error));
        return { data: routine, error };
      }

      console.log('Rutina guardada exitosamente en Supabase:', data);
      return { data: routine, error: null };
    } catch (supabaseError) {
      console.error('Error al ejecutar operación en Supabase:', supabaseError);
      return { data: routine, error: supabaseError };
    }
  } catch (error) {
    console.error('Error general al guardar rutina de entrenamiento:', error);
    return { data: null, error };
  }
}

/**
 * Elimina una rutina de entrenamiento
 * @param routineId - ID de la rutina
 * @param userId - ID del usuario
 * @returns - True si se eliminó correctamente, false en caso contrario
 */
export const deleteWorkoutRoutine = async (routineId: string, userId: string): Promise<{ success: boolean, error: any }> => {
  try {
    // Eliminar de localStorage
    const localRoutines = localStorage.getItem(`routines_${userId}`)

    if (localRoutines) {
      const routines = JSON.parse(localRoutines)
      const updatedRoutines = routines.filter((r: WorkoutRoutine) => r.id !== routineId)
      localStorage.setItem(`routines_${userId}`, JSON.stringify(updatedRoutines))
    }

    // Eliminar directamente de Supabase para tener más control
    const { error } = await supabase
      .from('workout_routines')
      .delete()
      .eq('id', routineId)

    if (error) {
      console.error('Error al eliminar rutina de Supabase:', error)
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error al eliminar rutina de entrenamiento:', error)
    return { success: false, error }
  }
}

/**
 * Obtiene los registros de entrenamiento del usuario
 * @param userId - ID del usuario
 * @returns - Registros de entrenamiento o null en caso de error
 */
export const getWorkoutLogs = async (userId: string): Promise<{ data: WorkoutLog[] | null, error: any }> => {
  try {
    // Intentar obtener registros de Supabase
    const { data, error } = await fetchDataFromSupabase<WorkoutLog>(
      'workout_logs',
      userId,
      {
        orderBy: { column: 'date', ascending: false }
      }
    )

    // Si hay error o no hay datos, intentar obtener de localStorage
    if (error || !data || data.length === 0) {
      console.log('Intentando obtener registros de localStorage')
      const localLogs = localStorage.getItem(`workout_logs_${userId}`)

      if (localLogs) {
        return { data: JSON.parse(localLogs), error: null }
      }
    }

    return { data, error }
  } catch (error) {
    console.error('Error al obtener registros de entrenamiento:', error)
    return { data: null, error }
  }
}

/**
 * Guarda un registro de entrenamiento
 * @param log - Registro de entrenamiento
 * @returns - Registro guardado o null en caso de error
 */
export const saveWorkoutLog = async (log: WorkoutLog): Promise<{ data: WorkoutLog | null, error: any }> => {
  try {
    // Guardar en localStorage como respaldo
    const localLogs = localStorage.getItem(`workout_logs_${log.userId}`)
    let logs = localLogs ? JSON.parse(localLogs) : []

    // Actualizar o añadir el registro
    const existingIndex = logs.findIndex((l: WorkoutLog) => l.id === log.id)

    if (existingIndex >= 0) {
      logs[existingIndex] = log
    } else {
      logs.push(log)
    }

    localStorage.setItem(`workout_logs_${log.userId}`, JSON.stringify(logs))

    // Preparar datos para Supabase
    const supabaseData = {
      id: log.id,
      user_id: log.userId,
      routine_id: log.routineId,
      day_id: log.dayId,
      date: log.date,
      duration: log.duration,
      completed_sets: log.completedSets,
      notes: log.notes,
      created_at: log.createdAt,
      updated_at: new Date().toISOString()
    }

    // Intentar guardar en Supabase
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .upsert(supabaseData)
        .select()

      if (error) {
        console.error('Error al guardar en Supabase:', error)
        return { data: log, error: null }
      }

      console.log('Registro guardado exitosamente en Supabase')
      return { data: log, error: null }
    } catch (supabaseError) {
      console.error('Error al ejecutar upsert en Supabase:', supabaseError)
      return { data: log, error: null }
    }
  } catch (error) {
    console.error('Error al guardar registro de entrenamiento:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene los ejercicios disponibles
 * @returns - Ejercicios disponibles o null en caso de error
 */
export const getExercises = async (): Promise<{ data: Exercise[] | null, error: any }> => {
  try {
    // Intentar obtener ejercicios de Supabase
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name')

    // Si hay error o no hay datos, usar datos locales
    if (error || !data || data.length === 0) {
      console.log('Usando datos de ejercicios locales')
      return { data: exerciseData, error: null }
    }

    // Transformar los datos al formato esperado
    const exercises: Exercise[] = data.map(exercise => ({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      muscleGroup: exercise.muscle_group || [],
      equipment: exercise.equipment || [],
      description: exercise.description || undefined,
      videoUrl: exercise.video_url || undefined,
      imageUrl: exercise.image_url || undefined,
      alternatives: exercise.alternatives || undefined,
      difficulty: exercise.difficulty || 'intermediate',
      isCompound: exercise.is_compound || false
    }))

    return { data: exercises, error: null }
  } catch (error) {
    console.error('Error al obtener ejercicios:', error)
    return { data: exerciseData, error: null }
  }
}

/**
 * Obtiene las estadísticas de entrenamiento del usuario
 * @param userId - ID del usuario
 * @returns - Estadísticas de entrenamiento o null en caso de error
 */
export const getTrainingStats = async (userId: string): Promise<{ data: any, error: any }> => {
  try {
    // Obtener registros de entrenamiento
    const { data: logs, error } = await getWorkoutLogs(userId)

    if (error || !logs) {
      return { data: null, error }
    }

    // Calcular estadísticas
    const totalWorkouts = logs.length
    const totalDuration = logs.reduce((acc, log) => acc + (log.duration || 0), 0)
    const totalSets = logs.reduce((acc, log) => acc + (log.completedSets?.length || 0), 0)

    // Calcular entrenamientos por semana
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const workoutsThisWeek = logs.filter(log => new Date(log.date) >= oneWeekAgo).length

    // Calcular entrenamientos por mes
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const workoutsThisMonth = logs.filter(log => new Date(log.date) >= oneMonthAgo).length

    // Calcular progreso
    const progressData = logs.map(log => ({
      date: log.date,
      duration: log.duration,
      sets: log.completedSets?.length || 0
    }))

    return {
      data: {
        totalWorkouts,
        totalDuration,
        totalSets,
        workoutsThisWeek,
        workoutsThisMonth,
        progressData
      },
      error: null
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de entrenamiento:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene la evaluación inicial de un usuario
 */
export async function getUserInitialAssessment(userId: string) {
  try {
    // Intentar obtener de la tabla initial_assessments primero
    const { data: initialAssessment, error: initialError } = await supabase
      .from("initial_assessments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (initialError) {
      throw initialError
    }

    if (initialAssessment) {
      return { data: initialAssessment, error: null }
    }

    // Si no hay datos en initial_assessments, intentar con training_assessments
    const { data: trainingAssessment, error: trainingError } = await supabase
      .from("training_assessments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (trainingError) {
      throw trainingError
    }

    return { data: trainingAssessment, error: null }
  } catch (error) {
    console.error("Error al obtener la evaluación inicial:", error)
    return { data: null, error }
  }
}

/**
 * Guarda un registro de entrenamiento
 */
export async function saveWorkoutLog(workoutLog: any) {
  try {
    // Verificar si el registro ya existe
    const { data: existingLog, error: checkError } = await supabase
      .from("workout_logs")
      .select("id")
      .eq("id", workoutLog.id)
      .maybeSingle()

    if (checkError) {
      throw checkError
    }

    let result

    if (existingLog) {
      // Actualizar registro existente
      const { data, error } = await supabase
        .from("workout_logs")
        .update({
          user_id: workoutLog.userId,
          routine_id: workoutLog.routineId,
          day_id: workoutLog.dayId,
          date: workoutLog.date,
          duration: workoutLog.duration,
          completed_sets: workoutLog.completedSets,
          notes: workoutLog.notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", workoutLog.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      result = { data, error: null }
    } else {
      // Insertar nuevo registro
      const { data, error } = await supabase
        .from("workout_logs")
        .insert({
          id: workoutLog.id,
          user_id: workoutLog.userId,
          routine_id: workoutLog.routineId,
          day_id: workoutLog.dayId,
          date: workoutLog.date,
          duration: workoutLog.duration,
          completed_sets: workoutLog.completedSets,
          notes: workoutLog.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      result = { data, error: null }
    }

    return result
  } catch (error) {
    console.error("Error al guardar el registro de entrenamiento:", error)
    return { data: null, error }
  }
}

/**
 * Obtiene los registros de entrenamiento de un usuario
 */
export async function getWorkoutLogs(userId: string) {
  try {
    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error al obtener los registros de entrenamiento:", error)
    return { data: null, error }
  }
}

/**
 * Obtiene un registro de entrenamiento por su ID
 */
export async function getWorkoutLogById(logId: string) {
  try {
    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("id", logId)
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error al obtener el registro de entrenamiento:", error)
    return { data: null, error }
  }
}

/**
 * Obtiene una rutina de usuario por su ID
 */
export async function getUserRoutineById(routineId: string) {
  try {
    const { data, error } = await supabase
      .from("workout_routines")
      .select("*")
      .eq("id", routineId)
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error al obtener la rutina de usuario:", error)
    return { data: null, error }
  }
}