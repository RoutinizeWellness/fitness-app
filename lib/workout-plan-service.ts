import { supabase } from '@/lib/supabase-client'
import { WorkoutPlan, WorkoutDay, WorkoutExercise } from '@/lib/workout-plan-generator'

/**
 * Obtiene el plan de entrenamiento activo de un usuario
 * @param userId - ID del usuario
 * @returns - Plan de entrenamiento activo o null si no existe
 */
export const getActiveWorkoutPlan = async (userId: string): Promise<WorkoutPlan | null> => {
  try {
    if (!userId) {
      console.error('Error: userId es requerido para obtener el plan de entrenamiento activo')
      return null
    }

    console.log('Obteniendo plan de entrenamiento activo para el usuario:', userId)

    // Obtener el plan activo de Supabase
    const { data, error } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Error al obtener el plan de entrenamiento activo:', error)
      return null
    }

    if (!data || data.length === 0) {
      console.log('No se encontró un plan de entrenamiento activo, buscando cualquier plan...')

      // Si no hay un plan activo, intentar obtener cualquier plan
      const { data: anyPlan, error: anyPlanError } = await supabase
        .from('workout_routines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (anyPlanError || !anyPlan || anyPlan.length === 0) {
        console.log('No se encontró ningún plan de entrenamiento')
        return null
      }

      // Activar este plan
      const { error: activateError } = await supabase
        .from('workout_routines')
        .update({ is_active: true })
        .eq('id', anyPlan[0].id)

      if (activateError) {
        console.error('Error al activar el plan de entrenamiento:', activateError)
      }

      console.log('Plan de entrenamiento activado:', anyPlan[0])

      // Verificar si el plan tiene días configurados
      if (!anyPlan[0].days || !Array.isArray(anyPlan[0].days)) {
        console.warn('El plan activado no tiene días configurados o no es un array:', anyPlan[0].days)
      } else {
        console.log(`El plan activado tiene ${anyPlan[0].days.length} días configurados:`,
          anyPlan[0].days.map((day: any, index: number) => `Día ${index + 1}: ${day.name || 'Sin nombre'} (ID: ${day.id})`))
      }

      // Asegurar que days sea siempre un array, incluso si es undefined o null
      const days = Array.isArray(anyPlan[0].days) ? anyPlan[0].days : []

      // Transformar los datos al formato esperado
      return {
        id: anyPlan[0].id,
        userId: anyPlan[0].user_id,
        name: anyPlan[0].name,
        description: anyPlan[0].description,
        level: anyPlan[0].level,
        goal: anyPlan[0].goal,
        duration: anyPlan[0].duration,
        daysPerWeek: anyPlan[0].days_per_week,
        createdAt: anyPlan[0].created_at,
        isActive: true,
        days: days // Usar la variable days que garantiza ser un array
      }
    }

    console.log('Plan de entrenamiento activo obtenido:', data[0])

    // Verificar si el plan tiene días configurados
    if (!data[0].days || !Array.isArray(data[0].days)) {
      console.warn('El plan no tiene días configurados o no es un array:', data[0].days)
    } else {
      console.log(`El plan tiene ${data[0].days.length} días configurados:`,
        data[0].days.map((day: any, index: number) => `Día ${index + 1}: ${day.name || 'Sin nombre'} (ID: ${day.id})`))
    }

    // Asegurar que days sea siempre un array, incluso si es undefined o null
    const days = Array.isArray(data[0].days) ? data[0].days : []

    // Transformar los datos al formato esperado
    return {
      id: data[0].id,
      userId: data[0].user_id,
      name: data[0].name,
      description: data[0].description,
      level: data[0].level,
      goal: data[0].goal,
      duration: data[0].duration,
      daysPerWeek: data[0].days_per_week,
      createdAt: data[0].created_at,
      isActive: data[0].is_active,
      days: days // Usar la variable days que garantiza ser un array
    }
  } catch (error) {
    console.error('Error al obtener el plan de entrenamiento activo:', error)
    return null
  }
}

/**
 * Obtiene todos los planes de entrenamiento de un usuario
 * @param userId - ID del usuario
 * @returns - Lista de planes de entrenamiento o array vacío en caso de error
 */
export const getUserWorkoutPlans = async (userId: string): Promise<WorkoutPlan[]> => {
  try {
    if (!userId) {
      console.error('Error: userId es requerido para obtener los planes de entrenamiento')
      return []
    }

    // Obtener los planes de Supabase
    const { data, error } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener los planes de entrenamiento:', error)
      return []
    }

    if (!data || data.length === 0) {
      console.log('No se encontraron planes de entrenamiento')
      return []
    }

    // Transformar los datos al formato esperado
    return data.map(plan => ({
      id: plan.id,
      userId: plan.user_id,
      name: plan.name,
      description: plan.description,
      level: plan.level,
      goal: plan.goal,
      duration: plan.duration,
      daysPerWeek: plan.days_per_week,
      createdAt: plan.created_at,
      isActive: plan.is_active,
      days: plan.days || []
    }))
  } catch (error) {
    console.error('Error al obtener los planes de entrenamiento:', error)
    return []
  }
}

/**
 * Obtiene un plan de entrenamiento específico
 * @param planId - ID del plan
 * @returns - Plan de entrenamiento o null si no existe
 */
export const getWorkoutPlan = async (planId: string): Promise<WorkoutPlan | null> => {
  try {
    if (!planId) {
      console.error('Error: planId es requerido para obtener el plan de entrenamiento')
      return null
    }

    // Obtener el plan de Supabase
    const { data, error } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('id', planId)
      .single()

    if (error) {
      console.error('Error al obtener el plan de entrenamiento:', error)
      return null
    }

    if (!data) {
      console.log('No se encontró el plan de entrenamiento')
      return null
    }

    // Verificar si el plan tiene días configurados
    if (!data.days || !Array.isArray(data.days)) {
      console.warn('El plan no tiene días configurados o no es un array:', data.days)
    } else {
      console.log(`El plan tiene ${data.days.length} días configurados:`,
        data.days.map((day: any, index: number) => `Día ${index + 1}: ${day.name || 'Sin nombre'} (ID: ${day.id})`))
    }

    // Asegurar que days sea siempre un array, incluso si es undefined o null
    const days = Array.isArray(data.days) ? data.days : []

    // Transformar los datos al formato esperado
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      level: data.level,
      goal: data.goal,
      duration: data.duration,
      daysPerWeek: data.days_per_week,
      createdAt: data.created_at,
      isActive: data.is_active,
      days: days // Usar la variable days que garantiza ser un array
    }
  } catch (error) {
    console.error('Error al obtener el plan de entrenamiento:', error)
    return null
  }
}

/**
 * Activa un plan de entrenamiento y desactiva los demás
 * @param planId - ID del plan a activar
 * @param userId - ID del usuario
 * @returns - Éxito o error
 */
export const activateWorkoutPlan = async (planId: string, userId: string): Promise<{ success: boolean, error?: any }> => {
  try {
    if (!planId || !userId) {
      console.error('Error: planId y userId son requeridos para activar el plan de entrenamiento')
      return { success: false, error: 'planId y userId son requeridos' }
    }

    // Primero, desactivar todos los planes del usuario
    const { error: deactivateError } = await supabase
      .from('workout_routines')
      .update({ is_active: false })
      .eq('user_id', userId)

    if (deactivateError) {
      console.error('Error al desactivar los planes de entrenamiento:', deactivateError)
      return { success: false, error: deactivateError }
    }

    // Luego, activar el plan específico
    const { error: activateError } = await supabase
      .from('workout_routines')
      .update({ is_active: true })
      .eq('id', planId)
      .eq('user_id', userId)

    if (activateError) {
      console.error('Error al activar el plan de entrenamiento:', activateError)
      return { success: false, error: activateError }
    }

    return { success: true }
  } catch (error) {
    console.error('Error al activar el plan de entrenamiento:', error)
    return { success: false, error }
  }
}

/**
 * Elimina un plan de entrenamiento
 * @param planId - ID del plan a eliminar
 * @param userId - ID del usuario
 * @returns - Éxito o error
 */
export const deleteWorkoutPlan = async (planId: string, userId: string): Promise<{ success: boolean, error?: any }> => {
  try {
    if (!planId || !userId) {
      console.error('Error: planId y userId son requeridos para eliminar el plan de entrenamiento')
      return { success: false, error: 'planId y userId son requeridos' }
    }

    // Eliminar el plan de Supabase
    const { error } = await supabase
      .from('workout_routines')
      .delete()
      .eq('id', planId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error al eliminar el plan de entrenamiento:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Error al eliminar el plan de entrenamiento:', error)
    return { success: false, error }
  }
}

/**
 * Reporta una discrepancia en el plan de entrenamiento
 * @param userId - ID del usuario
 * @param planId - ID del plan actual
 * @param reportType - Tipo de reporte (wrong_plan, missing_exercise, etc)
 * @param details - Detalles adicionales del reporte
 * @returns - Éxito o error
 */
export const reportWorkoutPlanDiscrepancy = async (
  userId: string,
  planId: string,
  reportType: string,
  details?: string
): Promise<{ success: boolean, error?: any }> => {
  try {
    if (!userId || !planId || !reportType) {
      console.error('Error: userId, planId y reportType son requeridos para reportar una discrepancia')
      return { success: false, error: 'Parámetros incompletos' }
    }

    // Guardar el reporte en Supabase
    const { error } = await supabase
      .from('workout_plan_reports')
      .insert({
        user_id: userId,
        plan_id: planId,
        report_type: reportType,
        details: details || '',
        status: 'pending',
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error al reportar la discrepancia:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Error al reportar la discrepancia:', error)
    return { success: false, error }
  }
}

/**
 * Actualiza un día de entrenamiento en un plan
 * @param planId - ID del plan
 * @param dayIndex - Índice del día a actualizar
 * @param updatedDay - Datos actualizados del día
 * @returns - Éxito o error
 */
export const updateWorkoutDay = async (
  planId: string,
  dayIndex: number,
  updatedDay: WorkoutDay
): Promise<{ success: boolean, error?: any }> => {
  try {
    if (!planId || dayIndex < 0 || !updatedDay) {
      console.error('Error: planId, dayIndex y updatedDay son requeridos para actualizar el día de entrenamiento')
      return { success: false, error: 'Parámetros inválidos' }
    }

    // Obtener el plan actual
    const plan = await getWorkoutPlan(planId)

    if (!plan) {
      return { success: false, error: 'Plan no encontrado' }
    }

    // Actualizar el día específico
    const updatedDays = [...plan.days]

    if (dayIndex >= updatedDays.length) {
      return { success: false, error: 'Índice de día fuera de rango' }
    }

    updatedDays[dayIndex] = updatedDay

    // Guardar el plan actualizado
    const { error } = await supabase
      .from('workout_routines')
      .update({ days: updatedDays })
      .eq('id', planId)

    if (error) {
      console.error('Error al actualizar el día de entrenamiento:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Error al actualizar el día de entrenamiento:', error)
    return { success: false, error }
  }
}

/**
 * Obtiene un día específico de entrenamiento por su ID
 * @param dayId - ID del día de entrenamiento
 * @returns - Día de entrenamiento o null si no existe
 */
export const getWorkoutDay = async (dayId: string): Promise<WorkoutDay | null> => {
  try {
    if (!dayId) {
      console.error('Error: dayId es requerido para obtener el día de entrenamiento')
      return null
    }

    console.log('Obteniendo día de entrenamiento:', dayId)

    // En un entorno real, aquí se haría una consulta a Supabase para obtener el día específico
    // Por ahora, simulamos la obtención del día desde los planes existentes

    // Obtener todos los planes (esto se optimizaría en un entorno real)
    const { data: plans, error } = await supabase
      .from('workout_routines')
      .select('*')

    if (error) {
      console.error('Error al obtener los planes para buscar el día:', error)
      return null
    }

    // Buscar el día en todos los planes
    for (const plan of plans || []) {
      if (plan.days && Array.isArray(plan.days)) {
        console.log(`Buscando día ${dayId} en plan ${plan.name} (${plan.id}) con ${plan.days.length} días`)

        // Registrar todos los IDs de días en este plan para depuración
        const dayIds = plan.days.map((d: any) => d.id)
        console.log('IDs de días en este plan:', dayIds)

        const day = plan.days.find((d: any) => d.id === dayId)
        if (day) {
          console.log('Día encontrado en el plan:', plan.name)

          // Añadir información del plan al día
          return {
            ...day,
            planId: plan.id,
            planName: plan.name
          }
        }
      }
    }

    console.log('No se encontró el día de entrenamiento:', dayId)
    return null
  } catch (error) {
    console.error('Error al obtener el día de entrenamiento:', error)
    return null
  }
}

/**
 * Obtiene los ejercicios para un día específico de entrenamiento
 * @param dayId - ID del día de entrenamiento
 * @returns - Lista de ejercicios o array vacío en caso de error
 */
export const getExercisesForDay = async (dayId: string): Promise<WorkoutExercise[]> => {
  try {
    if (!dayId) {
      console.error('Error: dayId es requerido para obtener los ejercicios')
      return []
    }

    console.log('Obteniendo ejercicios para el día:', dayId)

    // Obtener el día de entrenamiento
    const day = await getWorkoutDay(dayId)

    if (!day) {
      console.log('No se encontró el día de entrenamiento')
      return []
    }

    // Verificar si el día tiene ejercicios
    if (!day.exercises || !Array.isArray(day.exercises) || day.exercises.length === 0) {
      console.log('El día no tiene ejercicios configurados')
      return []
    }

    console.log('Ejercicios encontrados:', day.exercises.length)

    // Registrar detalles de cada ejercicio para depuración
    day.exercises.forEach((exercise, index) => {
      console.log(`Ejercicio ${index + 1}: ${exercise.name || 'Sin nombre'} (ID: ${exercise.id})`)
    })

    return day.exercises
  } catch (error) {
    console.error('Error al obtener los ejercicios del día:', error)
    return []
  }
}
