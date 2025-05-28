import { supabase } from '@/lib/supabase-client'
import { handleSupabaseError, checkSupabaseConnection, checkTableExists } from '@/lib/error-handling'
import { v4 as uuidv4 } from 'uuid'

// Tipos para rutinas de entrenamiento
export interface WorkoutRoutine {
  id: string
  userId: string
  name: string
  description?: string
  level: string
  goal: string
  frequency: string
  days: WorkoutDay[]
  isActive: boolean
  isTemplate: boolean
  createdAt: string
  updatedAt?: string
}

export interface WorkoutDay {
  id: string
  name: string
  exercises: WorkoutExercise[]
  targetMuscleGroups: string[]
  restDay: boolean
  notes?: string
}

export interface WorkoutExercise {
  id: string
  name: string
  sets: number
  reps: string
  rest: number
  weight?: string
  notes?: string
  alternatives?: string[]
}

// Datos de ejemplo para usar cuando hay errores
const getSampleWorkoutRoutines = (userId: string): WorkoutRoutine[] => {
  return [
    {
      id: 'sample-routine-1',
      userId,
      name: 'Rutina de ejemplo - Full Body',
      description: 'Rutina de cuerpo completo para principiantes',
      level: 'beginner',
      goal: 'general_fitness',
      frequency: '3 días por semana',
      isActive: true,
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      days: [
        {
          id: 'sample-day-1',
          name: 'Día 1 - Cuerpo Completo',
          targetMuscleGroups: ['Piernas', 'Pecho', 'Espalda', 'Hombros', 'Brazos'],
          restDay: false,
          exercises: [
            {
              id: 'sample-ex-1',
              name: 'Sentadilla',
              sets: 3,
              reps: '10-12',
              rest: 90
            },
            {
              id: 'sample-ex-2',
              name: 'Press de banca',
              sets: 3,
              reps: '10-12',
              rest: 90
            },
            {
              id: 'sample-ex-3',
              name: 'Remo con barra',
              sets: 3,
              reps: '10-12',
              rest: 90
            }
          ]
        }
      ]
    }
  ]
}

/**
 * Obtener todas las rutinas de entrenamiento de un usuario
 * @param userId ID del usuario
 * @returns Lista de rutinas o error
 */
export const getUserWorkoutRoutines = async (userId: string) => {
  try {
    if (!userId) {
      return { data: [], error: new Error('userId es requerido') }
    }

    // Verificar conexión a Supabase
    const { connected, error: connectionError } = await checkSupabaseConnection()
    if (!connected) {
      console.warn('No hay conexión a Supabase, usando datos de ejemplo')
      return { data: getSampleWorkoutRoutines(userId), error: connectionError }
    }

    // Verificar si la tabla existe
    const { exists, error: tableError } = await checkTableExists('workout_routines')
    if (!exists) {
      console.warn('La tabla workout_routines no existe, usando datos de ejemplo')
      return { data: getSampleWorkoutRoutines(userId), error: tableError }
    }

    // Obtener rutinas
    const { data, error } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener rutinas:', error)
      return { data: getSampleWorkoutRoutines(userId), error: handleSupabaseError(error, 'Error al obtener rutinas de entrenamiento') }
    }

    // Si no hay datos, devolver array vacío
    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transformar datos al formato de la aplicación
    const routines: WorkoutRoutine[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      name: item.name,
      description: item.description,
      level: item.level || 'beginner',
      goal: item.goal || 'general_fitness',
      frequency: item.frequency || '3-4 días por semana',
      days: item.days || [],
      isActive: item.is_active !== false, // Por defecto true
      isTemplate: item.is_template || false,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))

    return { data: routines, error: null }
  } catch (error) {
    console.error('Error inesperado al obtener rutinas:', error)
    return { data: getSampleWorkoutRoutines(userId), error: handleSupabaseError(error, 'Error inesperado al obtener rutinas') }
  }
}

/**
 * Obtener una rutina de entrenamiento por ID
 * @param routineId ID de la rutina
 * @param userId ID del usuario (para verificar acceso)
 * @returns Rutina o error
 */
export const getWorkoutRoutineById = async (routineId: string, userId: string) => {
  try {
    if (!routineId) {
      return { data: null, error: new Error('routineId es requerido') }
    }

    // Verificar conexión a Supabase
    const { connected, error: connectionError } = await checkSupabaseConnection()
    if (!connected) {
      console.warn('No hay conexión a Supabase, usando datos de ejemplo')
      return { data: getSampleWorkoutRoutines(userId)[0], error: connectionError }
    }

    // Obtener rutina
    const { data, error } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('id', routineId)
      .maybeSingle()

    if (error) {
      console.error('Error al obtener rutina:', error)
      return { data: getSampleWorkoutRoutines(userId)[0], error: handleSupabaseError(error, 'Error al obtener rutina de entrenamiento') }
    }

    // Si no hay datos, devolver null
    if (!data) {
      return { data: null, error: new Error('Rutina no encontrada') }
    }

    // Verificar que el usuario tiene acceso a esta rutina
    if (data.user_id !== userId && !data.is_template) {
      return { data: null, error: new Error('No tienes permiso para acceder a esta rutina') }
    }

    // Transformar datos al formato de la aplicación
    const routine: WorkoutRoutine = {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      level: data.level || 'beginner',
      goal: data.goal || 'general_fitness',
      frequency: data.frequency || '3-4 días por semana',
      days: data.days || [],
      isActive: data.is_active !== false, // Por defecto true
      isTemplate: data.is_template || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return { data: routine, error: null }
  } catch (error) {
    console.error('Error inesperado al obtener rutina:', error)
    return { data: getSampleWorkoutRoutines(userId)[0], error: handleSupabaseError(error, 'Error inesperado al obtener rutina') }
  }
}

/**
 * Guardar una rutina de entrenamiento (crear o actualizar)
 * @param routine Datos de la rutina
 * @returns Rutina guardada o error
 */
export const saveWorkoutRoutine = async (routine: WorkoutRoutine) => {
  try {
    if (!routine.userId) {
      return { data: null, error: new Error('userId es requerido') }
    }

    // Asignar ID si es una nueva rutina
    if (!routine.id) {
      routine.id = uuidv4()
    }

    // Verificar conexión a Supabase
    const { connected, error: connectionError } = await checkSupabaseConnection()
    if (!connected) {
      console.warn('No hay conexión a Supabase, simulando guardado')
      return { data: routine, error: connectionError }
    }

    // Preparar datos para Supabase
    const routineData = {
      id: routine.id,
      user_id: routine.userId,
      name: routine.name,
      description: routine.description || '',
      level: routine.level || 'beginner',
      goal: routine.goal || 'general_fitness',
      frequency: routine.frequency || '3-4 días por semana',
      days: routine.days || [],
      is_active: routine.isActive,
      is_template: routine.isTemplate || false,
      created_at: routine.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Verificar si la rutina existe
    const { data: existingData, error: checkError } = await supabase
      .from('workout_routines')
      .select('id')
      .eq('id', routine.id)
      .maybeSingle()

    if (checkError) {
      console.error('Error al verificar si la rutina existe:', checkError)
      return { data: routine, error: handleSupabaseError(checkError, 'Error al verificar si la rutina existe') }
    }

    let result

    if (!existingData) {
      // Si no existe, insertarla
      result = await supabase
        .from('workout_routines')
        .insert(routineData)
        .select()
    } else {
      // Si existe, actualizarla
      result = await supabase
        .from('workout_routines')
        .update(routineData)
        .eq('id', routine.id)
        .select()
    }

    const { data, error } = result

    if (error) {
      console.error('Error al guardar rutina:', error)

      // Manejar errores vacíos
      if (typeof error === 'object' && Object.keys(error).length === 0) {
        console.warn('Error vacío detectado al guardar rutina. Verificando si la columna frequency existe...')

        try {
          // Verificar si la columna frequency existe
          const { data: columnInfo, error: columnError } = await supabase.rpc(
            'check_column_exists',
            { table_name: 'workout_routines', column_name: 'frequency' }
          )

          if (columnError) {
            console.error('Error al verificar columna frequency:', columnError)
          } else if (!columnInfo) {
            console.warn('La columna frequency no existe en la tabla workout_routines')

            // Intentar crear la columna
            try {
              await supabase.rpc(
                'add_column_if_not_exists',
                { table_name: 'workout_routines', column_name: 'frequency', column_type: 'TEXT' }
              )
              console.info('Columna frequency añadida correctamente')

              // Reintentar guardar la rutina
              const retryResult = await supabase
                .from('workout_routines')
                .upsert(routineData)
                .select()

              if (retryResult.error) {
                return { data: routine, error: handleSupabaseError(retryResult.error, 'Error al reintentar guardar rutina') }
              }

              // Transformar datos al formato de la aplicación
              const savedRoutine: WorkoutRoutine = {
                id: retryResult.data[0].id,
                userId: retryResult.data[0].user_id,
                name: retryResult.data[0].name,
                description: retryResult.data[0].description,
                level: retryResult.data[0].level,
                goal: retryResult.data[0].goal,
                frequency: retryResult.data[0].frequency || '3-4 días por semana',
                days: retryResult.data[0].days || [],
                isActive: retryResult.data[0].is_active,
                isTemplate: retryResult.data[0].is_template,
                createdAt: retryResult.data[0].created_at,
                updatedAt: retryResult.data[0].updated_at
              }

              return { data: savedRoutine, error: null }
            } catch (rpcError) {
              console.error('Error al añadir columna frequency:', rpcError)
            }
          }
        } catch (checkError) {
          console.error('Error al verificar columna frequency:', checkError)
        }
      }

      return { data: routine, error: handleSupabaseError(error, 'Error al guardar rutina de entrenamiento') }
    }

    // Transformar datos al formato de la aplicación
    const savedRoutine: WorkoutRoutine = {
      id: data[0].id,
      userId: data[0].user_id,
      name: data[0].name,
      description: data[0].description,
      level: data[0].level,
      goal: data[0].goal,
      frequency: data[0].frequency,
      days: data[0].days || [],
      isActive: data[0].is_active,
      isTemplate: data[0].is_template,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at
    }

    return { data: savedRoutine, error: null }
  } catch (error) {
    console.error('Error inesperado al guardar rutina:', error)
    return { data: routine, error: handleSupabaseError(error, 'Error inesperado al guardar rutina') }
  }
}

/**
 * Eliminar una rutina de entrenamiento
 * @param routineId ID de la rutina
 * @param userId ID del usuario (para verificar propiedad)
 * @returns Éxito o error
 */
export const deleteWorkoutRoutine = async (routineId: string, userId: string) => {
  try {
    if (!routineId) {
      return { success: false, error: new Error('routineId es requerido') }
    }

    if (!userId) {
      return { success: false, error: new Error('userId es requerido') }
    }

    // Verificar conexión a Supabase
    const { connected, error: connectionError } = await checkSupabaseConnection()
    if (!connected) {
      console.warn('No hay conexión a Supabase, simulando eliminación')
      return { success: true, error: connectionError }
    }

    // Eliminar la rutina
    const { error } = await supabase
      .from('workout_routines')
      .delete()
      .eq('id', routineId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error al eliminar rutina:', error)
      return { success: false, error: handleSupabaseError(error, 'Error al eliminar rutina de entrenamiento') }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error inesperado al eliminar rutina:', error)
    return { success: false, error: handleSupabaseError(error, 'Error inesperado al eliminar rutina') }
  }
}
