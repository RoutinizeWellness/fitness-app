import { supabase } from '@/lib/supabase-client'
import { WorkoutLog, WorkoutRoutine, Exercise } from '@/lib/types/training'
import { NutritionProfile, MealLog } from '@/lib/types/nutrition'
import { v4 as uuidv4 } from 'uuid'

/**
 * Interfaz para los datos de fatiga del usuario
 */
export interface UserFatigue {
  userId: string
  currentFatigue: number // 0-100
  baselineFatigue: number // 0-100
  recoveryRate: number // 0-10
  recoveryStatus?: 'excellent' | 'good' | 'moderate' | 'poor'
  readyToTrain?: boolean
  muscleGroupFatigue?: Record<string, number>
  lastUpdated: string
}

/**
 * Interfaz para las preferencias de entrenamiento del usuario
 */
export interface TrainingPreferences {
  userId: string
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'any'
  preferredDuration: number // en minutos
  preferredExercisesPerWorkout: number
  preferredFrequency: number // días por semana
  lastUpdated: string
}

/**
 * Interfaz para el historial de adaptaciones
 */
export interface AdaptationHistory {
  id: string
  userId: string
  date: string
  adaptationType: 'volume' | 'intensity' | 'frequency' | 'deload' | 'exercise_selection' | 'nutrition' | 'recovery'
  previousValue: number | string
  newValue: number | string
  reason: string
  success: boolean | null // null si aún no se ha evaluado
  feedback?: string
  metrics?: Record<string, any>
}

/**
 * Interfaz para el perfil de aprendizaje del usuario
 */
export interface LearningProfile {
  userId: string
  responseToVolume: number // 0-10, qué tan bien responde a volumen alto
  responseToIntensity: number // 0-10, qué tan bien responde a intensidad alta
  responseToFrequency: number // 0-10, qué tan bien responde a frecuencia alta
  recoveryCapacity: number // 0-10, capacidad de recuperación
  nutritionAdherence: number // 0-10, adherencia a la dieta
  exercisePreferences: string[] // IDs de ejercicios preferidos
  exerciseAvoidances: string[] // IDs de ejercicios a evitar
  learningRate: number // 0-10, qué tan rápido se adapta
  lastUpdated: string
}

/**
 * Interfaz para recomendaciones personalizadas
 */
export interface PersonalizedRecommendation {
  id: string
  userId: string
  type: 'training' | 'nutrition' | 'recovery' | 'lifestyle'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  baseReason: string
  dataPoints: Record<string, any>
  created: string
  expires?: string
  implemented: boolean
  result?: string
}

/**
 * Interfaz para el seguimiento de progreso
 */
export interface ProgressTracking {
  userId: string
  metrics: {
    strength: ProgressMetric[]
    hypertrophy: ProgressMetric[]
    endurance: ProgressMetric[]
    bodyComposition: ProgressMetric[]
    nutrition: ProgressMetric[]
    recovery: ProgressMetric[]
  }
  lastUpdated: string
}

/**
 * Interfaz para métricas de progreso
 */
export interface ProgressMetric {
  name: string
  value: number
  unit: string
  date: string
  target?: number
  percentageToTarget?: number
}

/**
 * Interfaz para el perfil de respuesta a ejercicios
 */
export interface ExerciseResponseProfile {
  userId: string
  exerciseId: string
  effectivenessScore: number // 0-10
  fatigueImpact: number // 0-10
  recoveryTime: number // en horas
  preferredRepRange: [number, number]
  preferredRirRange: [number, number]
  notes: string
  lastUpdated: string
}

/**
 * Obtiene la fatiga actual del usuario
 * @param userId - ID del usuario
 * @returns - Datos de fatiga o null en caso de error
 */
export const getUserFatigue = async (userId: string): Promise<UserFatigue | null> => {
  try {
    if (!userId) {
      console.error('Error: userId es requerido para obtener datos de fatiga')
      return null
    }

    console.log('Obteniendo datos de fatiga para el usuario:', userId)

    // Intentar obtener datos de Supabase
    const { data, error } = await supabase
      .from('user_fatigue')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Crear valores por defecto
    const defaultFatigue: UserFatigue = {
      userId,
      currentFatigue: 30, // Valor inicial moderado
      baselineFatigue: 20, // Nivel base de fatiga
      recoveryRate: 5, // Tasa de recuperación media
      recoveryStatus: 'moderate',
      readyToTrain: true,
      muscleGroupFatigue: {
        chest: 30,
        back: 25,
        legs: 40,
        shoulders: 20,
        arms: 35,
        core: 15
      },
      lastUpdated: new Date().toISOString()
    }

    if (error) {
      console.error('Error al obtener datos de fatiga:', error)

      // Si el error es porque no se encontraron datos, crear un registro por defecto
      if (error.code === 'PGRST116') {
        console.log('No se encontraron datos de fatiga, creando valores por defecto')

        // Insertar valores por defecto en la base de datos
        const { error: insertError } = await supabase
          .from('user_fatigue')
          .insert([{
            user_id: userId,
            current_fatigue: defaultFatigue.currentFatigue,
            baseline_fatigue: defaultFatigue.baselineFatigue,
            recovery_rate: defaultFatigue.recoveryRate,
            recovery_status: defaultFatigue.recoveryStatus,
            ready_to_train: defaultFatigue.readyToTrain,
            muscle_group_fatigue: defaultFatigue.muscleGroupFatigue,
            last_updated: defaultFatigue.lastUpdated
          }])

        if (insertError) {
          console.error('Error al insertar datos de fatiga por defecto:', insertError)
        } else {
          console.log('Datos de fatiga por defecto insertados correctamente')
        }
      }

      // Devolver valores por defecto
      return defaultFatigue
    }

    console.log('Datos de fatiga obtenidos correctamente:', data)

    // Transformar los datos al formato esperado
    return {
      userId: data.user_id,
      currentFatigue: data.current_fatigue,
      baselineFatigue: data.baseline_fatigue,
      recoveryRate: data.recovery_rate,
      recoveryStatus: data.recovery_status || 'moderate',
      readyToTrain: data.ready_to_train !== false,
      muscleGroupFatigue: data.muscle_group_fatigue || {
        chest: 30,
        back: 25,
        legs: 40,
        shoulders: 20,
        arms: 35,
        core: 15
      },
      lastUpdated: data.last_updated
    }
  } catch (error) {
    console.error('Error al obtener datos de fatiga:', error)
    return null
  }
}

/**
 * Actualiza la fatiga del usuario después de un entrenamiento
 * @param userId - ID del usuario
 * @param workoutIntensity - Intensidad del entrenamiento (0-100)
 * @returns - Datos de fatiga actualizados o null en caso de error
 */
export const updateFatigueAfterWorkout = async (
  userId: string,
  workoutIntensity: number
): Promise<UserFatigue | null> => {
  try {
    // Obtener datos actuales de fatiga
    const currentFatigue = await getUserFatigue(userId)

    if (!currentFatigue) {
      return null
    }

    // Calcular nueva fatiga
    // La fatiga aumenta según la intensidad del entrenamiento
    const newFatigue = Math.min(100, currentFatigue.currentFatigue + workoutIntensity * 0.5)

    // Determinar estado de recuperación basado en la fatiga
    let recoveryStatus: 'excellent' | 'good' | 'moderate' | 'poor' = 'moderate'
    if (newFatigue < 30) recoveryStatus = 'excellent'
    else if (newFatigue < 50) recoveryStatus = 'good'
    else if (newFatigue < 70) recoveryStatus = 'moderate'
    else recoveryStatus = 'poor'

    // Determinar si está listo para entrenar
    const readyToTrain = newFatigue < 80

    // Actualizar en Supabase
    const { data, error } = await supabase
      .from('user_fatigue')
      .upsert({
        user_id: userId,
        current_fatigue: newFatigue,
        baseline_fatigue: currentFatigue.baselineFatigue,
        recovery_rate: currentFatigue.recoveryRate,
        recovery_status: recoveryStatus,
        ready_to_train: readyToTrain,
        muscle_group_fatigue: currentFatigue.muscleGroupFatigue,
        last_updated: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error al actualizar fatiga:', error)
      return null
    }

    // Devolver datos actualizados
    return {
      userId,
      currentFatigue: newFatigue,
      baselineFatigue: currentFatigue.baselineFatigue,
      recoveryRate: currentFatigue.recoveryRate,
      recoveryStatus,
      readyToTrain,
      muscleGroupFatigue: currentFatigue.muscleGroupFatigue,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error al actualizar fatiga:', error)
    return null
  }
}

/**
 * Actualiza la fatiga del usuario después de un día de descanso
 * @param userId - ID del usuario
 * @returns - Datos de fatiga actualizados o null en caso de error
 */
export const updateFatigueAfterRest = async (userId: string): Promise<UserFatigue | null> => {
  try {
    // Obtener datos actuales de fatiga
    const currentFatigue = await getUserFatigue(userId)

    if (!currentFatigue) {
      return null
    }

    // Calcular nueva fatiga
    // La fatiga disminuye según la tasa de recuperación
    const newFatigue = Math.max(
      currentFatigue.baselineFatigue,
      currentFatigue.currentFatigue - currentFatigue.recoveryRate
    )

    // Determinar estado de recuperación basado en la fatiga
    let recoveryStatus: 'excellent' | 'good' | 'moderate' | 'poor' = 'moderate'
    if (newFatigue < 30) recoveryStatus = 'excellent'
    else if (newFatigue < 50) recoveryStatus = 'good'
    else if (newFatigue < 70) recoveryStatus = 'moderate'
    else recoveryStatus = 'poor'

    // Determinar si está listo para entrenar
    const readyToTrain = newFatigue < 80

    // Actualizar en Supabase
    const { data, error } = await supabase
      .from('user_fatigue')
      .upsert({
        user_id: userId,
        current_fatigue: newFatigue,
        baseline_fatigue: currentFatigue.baselineFatigue,
        recovery_rate: currentFatigue.recoveryRate,
        recovery_status: recoveryStatus,
        ready_to_train: readyToTrain,
        muscle_group_fatigue: currentFatigue.muscleGroupFatigue,
        last_updated: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error al actualizar fatiga:', error)
      return null
    }

    // Devolver datos actualizados
    return {
      userId,
      currentFatigue: newFatigue,
      baselineFatigue: currentFatigue.baselineFatigue,
      recoveryRate: currentFatigue.recoveryRate,
      recoveryStatus,
      readyToTrain,
      muscleGroupFatigue: currentFatigue.muscleGroupFatigue,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error al actualizar fatiga:', error)
    return null
  }
}

/**
 * Obtiene las preferencias de entrenamiento del usuario
 * @param userId - ID del usuario
 * @returns - Preferencias de entrenamiento o null en caso de error
 */
export const getTrainingPreferences = async (userId: string): Promise<TrainingPreferences | null> => {
  try {
    // Intentar obtener datos de Supabase
    const { data, error } = await supabase
      .from('training_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error al obtener preferencias de entrenamiento:', error)

      // Si no hay datos, crear valores por defecto
      return {
        userId,
        preferredTime: 'any',
        preferredDuration: 60,
        preferredExercisesPerWorkout: 6,
        preferredFrequency: 4,
        lastUpdated: new Date().toISOString()
      }
    }

    // Transformar los datos al formato esperado
    return {
      userId: data.user_id,
      preferredTime: data.preferred_time,
      preferredDuration: data.preferred_duration,
      preferredExercisesPerWorkout: data.preferred_exercises_per_workout,
      preferredFrequency: data.preferred_frequency,
      lastUpdated: data.last_updated
    }
  } catch (error) {
    console.error('Error al obtener preferencias de entrenamiento:', error)
    return null
  }
}

/**
 * Determina si el usuario necesita una semana de descarga
 * @param userId - ID del usuario
 * @param workoutLogs - Registros de entrenamiento
 * @returns - True si necesita descarga, false en caso contrario
 */
export const needsDeloadWeek = async (
  userId: string,
  workoutLogs: WorkoutLog[]
): Promise<boolean> => {
  try {
    // Obtener datos de fatiga
    const fatigue = await getUserFatigue(userId)

    if (!fatigue) {
      return false
    }

    // Criterios para determinar si necesita descarga:
    // 1. Fatiga alta (>70) durante más de una semana
    // 2. Más de 3 semanas consecutivas de entrenamiento intenso
    // 3. Disminución en el rendimiento (menos peso, menos repeticiones)

    // Verificar fatiga alta
    if (fatigue.currentFatigue > 70) {
      return true
    }

    // Verificar semanas consecutivas de entrenamiento
    const now = new Date()
    const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000)

    // Contar entrenamientos en las últimas 3 semanas
    const recentWorkouts = workoutLogs.filter(log =>
      new Date(log.date) >= threeWeeksAgo
    )

    // Si ha entrenado más de 12 veces en 3 semanas (4+ por semana)
    if (recentWorkouts.length > 12) {
      return true
    }

    // Por defecto, no necesita descarga
    return false
  } catch (error) {
    console.error('Error al determinar si necesita descarga:', error)
    return false
  }
}

/**
 * Aprende de los patrones de entrenamiento del usuario
 * @param userId - ID del usuario
 * @param workoutLogs - Registros de entrenamiento
 * @returns - Preferencias actualizadas o null en caso de error
 */
export const learnFromWorkoutPatterns = async (
  userId: string,
  workoutLogs: WorkoutLog[]
): Promise<TrainingPreferences | null> => {
  try {
    if (workoutLogs.length < 5) {
      // No hay suficientes datos para aprender
      return null
    }

    // Obtener preferencias actuales
    const currentPreferences = await getTrainingPreferences(userId)

    if (!currentPreferences) {
      return null
    }

    // Analizar patrones de hora del día
    const workoutTimes = workoutLogs.map(log => {
      const date = new Date(log.date)
      const hour = date.getHours()

      if (hour < 12) return 'morning'
      if (hour < 18) return 'afternoon'
      return 'evening'
    })

    // Contar frecuencias
    const timeFrequency: Record<string, number> = {
      morning: 0,
      afternoon: 0,
      evening: 0
    }

    workoutTimes.forEach(time => {
      timeFrequency[time]++
    })

    // Determinar la hora preferida
    let preferredTime: 'morning' | 'afternoon' | 'evening' | 'any' = 'any'
    let maxFrequency = 0

    Object.entries(timeFrequency).forEach(([time, frequency]) => {
      if (frequency > maxFrequency) {
        maxFrequency = frequency
        preferredTime = time as any
      }
    })

    // Analizar duración promedio
    const totalDuration = workoutLogs.reduce((acc, log) => acc + (log.duration || 0), 0)
    const avgDuration = Math.round(totalDuration / workoutLogs.length)

    // Analizar número de ejercicios promedio
    const totalExercises = workoutLogs.reduce((acc, log) => {
      // Contar ejercicios únicos en cada entrenamiento
      const exercises = new Set()
      log.completedSets?.forEach(set => exercises.add(set.exerciseId))
      return acc + exercises.size
    }, 0)
    const avgExercises = Math.round(totalExercises / workoutLogs.length)

    // Analizar frecuencia semanal
    // Agrupar por semana
    const weekMap: Record<string, number> = {}

    workoutLogs.forEach(log => {
      const date = new Date(log.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Domingo como inicio de semana
      const weekKey = weekStart.toISOString().split('T')[0]

      weekMap[weekKey] = (weekMap[weekKey] || 0) + 1
    })

    // Calcular frecuencia promedio
    const totalWeeks = Object.keys(weekMap).length
    const totalWorkouts = workoutLogs.length
    const avgFrequency = Math.round(totalWorkouts / totalWeeks)

    // Crear nuevas preferencias
    const newPreferences: TrainingPreferences = {
      userId,
      preferredTime,
      preferredDuration: avgDuration,
      preferredExercisesPerWorkout: avgExercises,
      preferredFrequency: avgFrequency,
      lastUpdated: new Date().toISOString()
    }

    // Actualizar en Supabase
    const { data, error } = await supabase
      .from('training_preferences')
      .upsert({
        user_id: userId,
        preferred_time: newPreferences.preferredTime,
        preferred_duration: newPreferences.preferredDuration,
        preferred_exercises_per_workout: newPreferences.preferredExercisesPerWorkout,
        preferred_frequency: newPreferences.preferredFrequency,
        last_updated: newPreferences.lastUpdated
      })
      .select()

    if (error) {
      console.error('Error al actualizar preferencias:', error)
      return null
    }

    return newPreferences
  } catch (error) {
    console.error('Error al aprender de patrones:', error)
    return null
  }
}

/**
 * Genera recomendaciones para el próximo entrenamiento
 * @param userId - ID del usuario
 * @param routine - Rutina actual
 * @returns - Recomendaciones para el próximo entrenamiento
 */
export const getNextWorkoutRecommendations = async (
  userId: string,
  routine: WorkoutRoutine
): Promise<any> => {
  try {
    // Obtener datos de fatiga
    const fatigue = await getUserFatigue(userId)

    // Obtener preferencias
    const preferences = await getTrainingPreferences(userId)

    if (!fatigue || !preferences) {
      return null
    }

    // Determinar ajustes según la fatiga
    let volumeAdjustment = 0
    let intensityAdjustment = 0

    if (fatigue.currentFatigue > 70) {
      // Fatiga alta: reducir volumen e intensidad
      volumeAdjustment = -20
      intensityAdjustment = -10
    } else if (fatigue.currentFatigue > 50) {
      // Fatiga moderada: reducir ligeramente
      volumeAdjustment = -10
      intensityAdjustment = -5
    } else if (fatigue.currentFatigue < 30) {
      // Fatiga baja: aumentar volumen e intensidad
      volumeAdjustment = 10
      intensityAdjustment = 5
    }

    // Determinar el día de la rutina a recomendar
    // Por simplicidad, recomendamos el primer día si no hay lógica específica
    const recommendedDay = routine.days[0]

    // Ajustar el número de series según la fatiga
    const adjustedSets = recommendedDay.exercises.map(exercise => {
      const adjustedSetsCount = Math.max(
        1,
        Math.round(exercise.sets.length * (1 + volumeAdjustment / 100))
      )

      // Mantener solo el número necesario de series
      const newSets = [...exercise.sets].slice(0, adjustedSetsCount)

      // Ajustar RIR según la fatiga
      newSets.forEach(set => {
        set.targetRir = Math.max(0, (set.targetRir || 2) - Math.round(intensityAdjustment / 10))
      })

      return {
        ...exercise,
        sets: newSets
      }
    })

    // Si hay demasiados ejercicios según las preferencias, reducir
    const adjustedExercises = adjustedSets.slice(0, preferences.preferredExercisesPerWorkout)

    return {
      recommendedDay: {
        ...recommendedDay,
        exercises: adjustedExercises
      },
      fatigueLevel: fatigue.currentFatigue,
      volumeAdjustment,
      intensityAdjustment,
      message: getFatigueMessage(fatigue.currentFatigue)
    }
  } catch (error) {
    console.error('Error al generar recomendaciones:', error)
    return null
  }
}

/**
 * Obtiene un mensaje según el nivel de fatiga
 * @param fatigueLevel - Nivel de fatiga (0-100)
 * @returns - Mensaje descriptivo
 */
const getFatigueMessage = (fatigueLevel: number): string => {
  if (fatigueLevel > 80) {
    return "Fatiga muy alta. Considera tomar un día de descanso o hacer un entrenamiento ligero de recuperación."
  } else if (fatigueLevel > 60) {
    return "Fatiga alta. Reduce el volumen y la intensidad del entrenamiento de hoy."
  } else if (fatigueLevel > 40) {
    return "Fatiga moderada. Entrena con normalidad pero escucha a tu cuerpo."
  } else if (fatigueLevel > 20) {
    return "Fatiga baja. Buen momento para un entrenamiento productivo."
  } else {
    return "Fatiga muy baja. Aprovecha para un entrenamiento intenso o de alto volumen."
  }
}

/**
 * Calcula el peso ideal para un ejercicio basado en la fatiga acumulada y el rendimiento anterior
 * @param userId - ID del usuario
 * @param exerciseId - ID del ejercicio
 * @param targetReps - Repeticiones objetivo
 * @param targetRir - RIR objetivo
 * @param options - Opciones adicionales para el cálculo
 * @returns - Peso recomendado en kg con explicación detallada
 */
export const calculateIdealWeight = async (
  userId: string,
  exerciseId: string,
  targetReps: number,
  targetRir: number,
  options: {
    considerFatigue?: boolean,
    considerSleep?: boolean,
    considerNutrition?: boolean,
    considerRecovery?: boolean,
    timeAvailable?: number, // en minutos
    equipmentAvailable?: string[],
    isDeloadWeek?: boolean,
    trainingPhase?: 'volume' | 'strength' | 'power' | 'deload' | 'maintenance',
    previousPerformance?: 'improved' | 'maintained' | 'decreased'
  } = {}
): Promise<{
  recommendedWeight: number,
  explanation: string,
  factors: {factor: string, impact: number}[],
  alternativeWeights: {conservative: number, standard: number, aggressive: number}
} | null> => {
  try {
    // Obtener datos de fatiga
    const fatigue = await getUserFatigue(userId)

    // Obtener datos de sueño si está habilitado
    let sleepQuality = null
    if (options.considerSleep) {
      const { data: sleepData } = await supabase
        .from('sleep_logs')
        .select('quality, duration')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)

      if (sleepData && sleepData.length > 0) {
        sleepQuality = sleepData[0].quality
      }
    }

    // Obtener datos de nutrición si está habilitado
    let nutritionAdherence = null
    if (options.considerNutrition) {
      const { data: nutritionData } = await supabase
        .from('nutrition_logs')
        .select('adherence_score')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)

      if (nutritionData && nutritionData.length > 0) {
        nutritionAdherence = nutritionData[0].adherence_score
      }
    }

    if (!fatigue) {
      return null
    }

    // Obtener historial del ejercicio con más detalles
    const { data: exerciseHistory, error } = await supabase
      .from('exercise_history')
      .select('*, workout_logs(date, perceived_exertion, notes)')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .order('date', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error al obtener historial del ejercicio:', error)
      return null
    }

    // Si no hay historial, no podemos calcular
    if (!exerciseHistory || exerciseHistory.length === 0) {
      return null
    }

    // Obtener el último peso utilizado
    const lastWeight = exerciseHistory[0].weight

    // Inicializar factores de ajuste
    const factors: {factor: string, impact: number}[] = []

    // Calcular ajuste basado en fatiga
    let fatigueAdjustment = 0
    if (options.considerFatigue !== false) { // Por defecto considerar fatiga
      if (fatigue.currentFatigue > 70) {
        // Fatiga alta: reducir peso
        fatigueAdjustment = -0.1 // -10%
      } else if (fatigue.currentFatigue < 30) {
        // Fatiga baja: aumentar peso
        fatigueAdjustment = 0.05 // +5%
      }

      factors.push({
        factor: `Nivel de fatiga (${fatigue.currentFatigue}/100)`,
        impact: fatigueAdjustment * 100 // Convertir a porcentaje
      })
    }

    // Calcular ajuste basado en RIR
    // Si el RIR objetivo es menor que el último RIR, aumentar peso
    const lastRir = exerciseHistory[0].rir || 2
    const rirDifference = lastRir - targetRir
    const rirAdjustment = rirDifference * 0.025 // 2.5% por cada punto de RIR
    factors.push({
      factor: `Cambio en RIR objetivo (de ${lastRir} a ${targetRir})`,
      impact: rirAdjustment * 100
    })

    // Calcular ajuste basado en repeticiones
    // Si las repeticiones objetivo son menores, aumentar peso
    const lastReps = exerciseHistory[0].reps
    const repsDifference = lastReps - targetReps
    const repsAdjustment = repsDifference > 0 ? repsDifference * 0.02 : 0 // 2% por cada repetición menos
    if (repsDifference !== 0) {
      factors.push({
        factor: `Cambio en repeticiones objetivo (de ${lastReps} a ${targetReps})`,
        impact: repsAdjustment * 100
      })
    }

    // Ajuste basado en calidad del sueño
    let sleepAdjustment = 0
    if (options.considerSleep && sleepQuality !== null) {
      // sleepQuality en escala 1-10
      sleepAdjustment = ((sleepQuality - 5) / 10) * 0.05 // -2.5% a +2.5%
      factors.push({
        factor: `Calidad del sueño (${sleepQuality}/10)`,
        impact: sleepAdjustment * 100
      })
    }

    // Ajuste basado en nutrición
    let nutritionAdjustment = 0
    if (options.considerNutrition && nutritionAdherence !== null) {
      // nutritionAdherence en escala 1-10
      nutritionAdjustment = ((nutritionAdherence - 5) / 10) * 0.05 // -2.5% a +2.5%
      factors.push({
        factor: `Adherencia nutricional (${nutritionAdherence}/10)`,
        impact: nutritionAdjustment * 100
      })
    }

    // Ajuste basado en fase de entrenamiento
    let phaseAdjustment = 0
    if (options.trainingPhase) {
      switch (options.trainingPhase) {
        case 'strength':
          phaseAdjustment = 0.05 // +5% para fase de fuerza
          break
        case 'power':
          phaseAdjustment = 0.075 // +7.5% para fase de potencia
          break
        case 'deload':
          phaseAdjustment = -0.15 // -15% para fase de descarga
          break
        case 'maintenance':
          phaseAdjustment = 0 // 0% para mantenimiento
          break
        default: // 'volume'
          phaseAdjustment = -0.05 // -5% para fase de volumen
      }
      factors.push({
        factor: `Fase de entrenamiento (${options.trainingPhase})`,
        impact: phaseAdjustment * 100
      })
    }

    // Ajuste basado en rendimiento anterior
    let performanceAdjustment = 0
    if (options.previousPerformance) {
      switch (options.previousPerformance) {
        case 'improved':
          performanceAdjustment = 0.025 // +2.5% si mejoró
          break
        case 'decreased':
          performanceAdjustment = -0.025 // -2.5% si empeoró
          break
        default: // 'maintained'
          performanceAdjustment = 0 // 0% si se mantuvo
      }
      factors.push({
        factor: `Rendimiento anterior (${options.previousPerformance})`,
        impact: performanceAdjustment * 100
      })
    }

    // Calcular peso recomendado con todos los factores
    const totalAdjustment = fatigueAdjustment + rirAdjustment + repsAdjustment +
                           sleepAdjustment + nutritionAdjustment + phaseAdjustment +
                           performanceAdjustment

    const recommendedWeight = lastWeight * (1 + totalAdjustment)

    // Redondear a incrementos de 2.5kg para mejor aplicación práctica
    const roundedWeight = Math.round(recommendedWeight / 2.5) * 2.5

    // Generar pesos alternativos
    const conservativeWeight = Math.round((recommendedWeight * 0.95) / 2.5) * 2.5
    const aggressiveWeight = Math.round((recommendedWeight * 1.05) / 2.5) * 2.5

    // Generar explicación
    let explanation = `Basado en tu último peso (${lastWeight}kg), `

    if (totalAdjustment > 0) {
      explanation += `se recomienda un aumento del ${Math.round(totalAdjustment * 100)}% `
    } else if (totalAdjustment < 0) {
      explanation += `se recomienda una reducción del ${Math.abs(Math.round(totalAdjustment * 100))}% `
    } else {
      explanation += `se recomienda mantener el mismo peso `
    }

    explanation += `considerando tu nivel de fatiga, objetivos de repeticiones y RIR.`

    return {
      recommendedWeight: roundedWeight,
      explanation,
      factors,
      alternativeWeights: {
        conservative: conservativeWeight,
        standard: roundedWeight,
        aggressive: aggressiveWeight
      }
    }
  } catch (error) {
    console.error('Error al calcular peso ideal:', error)
    return null
  }
}

/**
 * Analiza la fatiga muscular por grupo muscular
 * @param userId - ID del usuario
 * @param workoutLogs - Registros de entrenamiento
 * @returns - Mapa de fatiga por grupo muscular (0-100)
 */
export const analyzeMuscleGroupFatigue = async (
  userId: string,
  workoutLogs: WorkoutLog[]
): Promise<Record<string, number>> => {
  try {
    // Definir grupos musculares
    const muscleGroups = [
      'chest', 'back', 'legs', 'shoulders', 'arms', 'core',
      'quads', 'hamstrings', 'glutes', 'calves', 'biceps', 'triceps',
      'forearms', 'traps', 'lats', 'abs', 'lower_back', 'upper_back'
    ]

    // Inicializar mapa de fatiga
    const fatigueMap: Record<string, number> = {}
    muscleGroups.forEach(group => {
      fatigueMap[group] = 0
    })

    // Obtener datos de fatiga general
    const fatigue = await getUserFatigue(userId)

    if (!fatigue) {
      return fatigueMap
    }

    // Calcular fatiga por grupo muscular basado en entrenamientos recientes
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Filtrar logs recientes
    const recentLogs = workoutLogs.filter(log =>
      new Date(log.date) >= oneWeekAgo
    )

    // Analizar cada log
    for (const log of recentLogs) {
      // Obtener ejercicios completados
      const completedExercises = log.completedSets || []

      // Agrupar por ejercicio
      const exerciseIds = new Set(completedExercises.map(set => set.exerciseId))

      // Para cada ejercicio, obtener grupos musculares
      for (const exerciseId of exerciseIds) {
        const { data: exercise, error } = await supabase
          .from('exercises')
          .select('muscle_group, secondary_muscles')
          .eq('id', exerciseId)
          .single()

        if (error || !exercise) continue

        // Calcular volumen total para este ejercicio
        const exerciseSets = completedExercises.filter(set => set.exerciseId === exerciseId)
        const totalVolume = exerciseSets.reduce((sum, set) => {
          return sum + (set.weight || 0) * (set.reps || 0) * (set.completedRpe ? (10 - set.completedRpe) / 10 + 0.5 : 1)
        }, 0)

        // Calcular días desde el entrenamiento
        const daysSince = Math.floor((now.getTime() - new Date(log.date).getTime()) / (24 * 60 * 60 * 1000))

        // Factor de decaimiento de la fatiga basado en días transcurridos
        const decayFactor = Math.max(0, 1 - (daysSince * 0.2)) // 20% menos por día

        // Incrementar fatiga para músculos primarios
        const primaryMuscles = Array.isArray(exercise.muscle_group) ? exercise.muscle_group : [exercise.muscle_group]
        primaryMuscles.forEach(group => {
          if (fatigueMap[group] !== undefined) {
            // La fatiga es proporcional al volumen y decae con el tiempo
            const fatigueContribution = totalVolume * 0.01 * decayFactor
            fatigueMap[group] += fatigueContribution
          }
        })

        // Incrementar fatiga para músculos secundarios (menor impacto)
        const secondaryMuscles = Array.isArray(exercise.secondary_muscles) ? exercise.secondary_muscles : []
        secondaryMuscles.forEach(group => {
          if (fatigueMap[group] !== undefined) {
            // Los músculos secundarios reciben menos fatiga
            const fatigueContribution = totalVolume * 0.005 * decayFactor
            fatigueMap[group] += fatigueContribution
          }
        })
      }
    }

    // Normalizar valores (máximo 100)
    Object.keys(fatigueMap).forEach(group => {
      fatigueMap[group] = Math.min(100, fatigueMap[group])
    })

    return fatigueMap
  } catch (error) {
    console.error('Error al analizar fatiga por grupo muscular:', error)
    return {}
  }
}

/**
 * Obtiene el perfil de aprendizaje del usuario
 * @param userId - ID del usuario
 * @returns - Perfil de aprendizaje o null en caso de error
 */
export const getLearningProfile = async (userId: string): Promise<LearningProfile | null> => {
  try {
    // Intentar obtener datos de Supabase
    const { data, error } = await supabase
      .from('learning_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error al obtener perfil de aprendizaje:', error)

      // Si no hay datos, crear valores por defecto
      return {
        userId,
        responseToVolume: 5,
        responseToIntensity: 5,
        responseToFrequency: 5,
        recoveryCapacity: 5,
        nutritionAdherence: 5,
        exercisePreferences: [],
        exerciseAvoidances: [],
        learningRate: 5,
        lastUpdated: new Date().toISOString()
      }
    }

    // Transformar los datos al formato esperado
    return {
      userId: data.user_id,
      responseToVolume: data.response_to_volume,
      responseToIntensity: data.response_to_intensity,
      responseToFrequency: data.response_to_frequency,
      recoveryCapacity: data.recovery_capacity,
      nutritionAdherence: data.nutrition_adherence,
      exercisePreferences: data.exercise_preferences || [],
      exerciseAvoidances: data.exercise_avoidances || [],
      learningRate: data.learning_rate,
      lastUpdated: data.last_updated
    }
  } catch (error) {
    console.error('Error al obtener perfil de aprendizaje:', error)
    return null
  }
}

/**
 * Actualiza el perfil de aprendizaje basado en resultados
 * @param userId - ID del usuario
 * @param workoutLogs - Registros de entrenamiento
 * @param mealLogs - Registros de comidas
 * @returns - Perfil de aprendizaje actualizado o null en caso de error
 */
export const updateLearningProfile = async (
  userId: string,
  workoutLogs: WorkoutLog[],
  mealLogs: MealLog[]
): Promise<LearningProfile | null> => {
  try {
    // Obtener perfil actual
    const currentProfile = await getLearningProfile(userId)

    if (!currentProfile) {
      return null
    }

    // Necesitamos al menos 10 entrenamientos para hacer un análisis significativo
    if (workoutLogs.length < 10) {
      return currentProfile
    }

    // Analizar respuesta a volumen
    const highVolumeSessions = workoutLogs.filter(log => {
      const totalSets = log.completedSets?.length || 0
      return totalSets > 20 // Consideramos alto volumen más de 20 series
    })

    // Verificar si hay sesiones de alto volumen
    if (highVolumeSessions.length > 0) {
      // Calcular progreso después de sesiones de alto volumen
      const progressAfterHighVolume = calculateProgressAfterSessions(userId, highVolumeSessions)

      // Ajustar respuesta a volumen
      if (progressAfterHighVolume > 0.1) {
        // Buena respuesta a volumen
        currentProfile.responseToVolume = Math.min(10, currentProfile.responseToVolume + 0.5)
      } else if (progressAfterHighVolume < 0) {
        // Mala respuesta a volumen
        currentProfile.responseToVolume = Math.max(1, currentProfile.responseToVolume - 0.5)
      }
    }

    // Analizar respuesta a intensidad
    const highIntensitySessions = workoutLogs.filter(log => {
      // Calcular RPE promedio
      const sets = log.completedSets || []
      if (sets.length === 0) return false

      const avgRpe = sets.reduce((sum, set) => sum + (set.completedRpe || 0), 0) / sets.length
      return avgRpe > 8 // Consideramos alta intensidad RPE > 8
    })

    // Verificar si hay sesiones de alta intensidad
    if (highIntensitySessions.length > 0) {
      // Calcular progreso después de sesiones de alta intensidad
      const progressAfterHighIntensity = calculateProgressAfterSessions(userId, highIntensitySessions)

      // Ajustar respuesta a intensidad
      if (progressAfterHighIntensity > 0.1) {
        // Buena respuesta a intensidad
        currentProfile.responseToIntensity = Math.min(10, currentProfile.responseToIntensity + 0.5)
      } else if (progressAfterHighIntensity < 0) {
        // Mala respuesta a intensidad
        currentProfile.responseToIntensity = Math.max(1, currentProfile.responseToIntensity - 0.5)
      }
    }

    // Analizar respuesta a frecuencia
    // Agrupar entrenamientos por semana
    const weekMap: Record<string, number> = {}

    workoutLogs.forEach(log => {
      const date = new Date(log.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]

      weekMap[weekKey] = (weekMap[weekKey] || 0) + 1
    })

    // Identificar semanas de alta frecuencia
    const highFrequencyWeeks = Object.entries(weekMap)
      .filter(([_, count]) => count >= 5) // 5+ entrenamientos por semana
      .map(([week]) => week)

    if (highFrequencyWeeks.length > 0) {
      // Calcular progreso en semanas de alta frecuencia
      let totalProgress = 0

      for (const week of highFrequencyWeeks) {
        const weekStart = new Date(week)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)

        // Filtrar logs de esta semana
        const weekLogs = workoutLogs.filter(log => {
          const logDate = new Date(log.date)
          return logDate >= weekStart && logDate <= weekEnd
        })

        const progressThisWeek = calculateProgressAfterSessions(userId, weekLogs)
        totalProgress += progressThisWeek
      }

      const avgProgress = totalProgress / highFrequencyWeeks.length

      // Ajustar respuesta a frecuencia
      if (avgProgress > 0.1) {
        // Buena respuesta a frecuencia alta
        currentProfile.responseToFrequency = Math.min(10, currentProfile.responseToFrequency + 0.5)
      } else if (avgProgress < 0) {
        // Mala respuesta a frecuencia alta
        currentProfile.responseToFrequency = Math.max(1, currentProfile.responseToFrequency - 0.5)
      }
    }

    // Analizar capacidad de recuperación
    // Buscar días consecutivos de entrenamiento
    const sortedLogs = [...workoutLogs].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    let consecutiveDays = 0
    let maxConsecutiveDays = 0

    for (let i = 1; i < sortedLogs.length; i++) {
      const prevDate = new Date(sortedLogs[i-1].date)
      const currDate = new Date(sortedLogs[i].date)

      // Calcular diferencia en días
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000))

      if (diffDays === 1) {
        consecutiveDays++
      } else {
        maxConsecutiveDays = Math.max(maxConsecutiveDays, consecutiveDays)
        consecutiveDays = 0
      }
    }

    maxConsecutiveDays = Math.max(maxConsecutiveDays, consecutiveDays)

    // Ajustar capacidad de recuperación basado en días consecutivos
    if (maxConsecutiveDays >= 4) {
      // Buena capacidad de recuperación
      currentProfile.recoveryCapacity = Math.min(10, currentProfile.recoveryCapacity + 0.5)
    } else if (maxConsecutiveDays <= 1) {
      // Posible baja capacidad de recuperación
      currentProfile.recoveryCapacity = Math.max(1, currentProfile.recoveryCapacity - 0.5)
    }

    // Analizar adherencia a la nutrición
    if (mealLogs.length > 0) {
      // Calcular días con registros completos
      const daysWithLogs = new Set(mealLogs.map(log => log.date.split('T')[0]))

      // Calcular período total
      const firstLogDate = new Date(Math.min(...mealLogs.map(log => new Date(log.date).getTime())))
      const lastLogDate = new Date(Math.max(...mealLogs.map(log => new Date(log.date).getTime())))

      const totalDays = Math.floor((lastLogDate.getTime() - firstLogDate.getTime()) / (24 * 60 * 60 * 1000)) + 1

      // Calcular tasa de adherencia
      const adherenceRate = daysWithLogs.size / totalDays

      // Ajustar adherencia a la nutrición
      if (adherenceRate > 0.8) {
        // Alta adherencia
        currentProfile.nutritionAdherence = Math.min(10, currentProfile.nutritionAdherence + 0.5)
      } else if (adherenceRate < 0.5) {
        // Baja adherencia
        currentProfile.nutritionAdherence = Math.max(1, currentProfile.nutritionAdherence - 0.5)
      }
    }

    // Actualizar en Supabase
    const { data, error } = await supabase
      .from('learning_profiles')
      .upsert({
        user_id: userId,
        response_to_volume: currentProfile.responseToVolume,
        response_to_intensity: currentProfile.responseToIntensity,
        response_to_frequency: currentProfile.responseToFrequency,
        recovery_capacity: currentProfile.recoveryCapacity,
        nutrition_adherence: currentProfile.nutritionAdherence,
        exercise_preferences: currentProfile.exercisePreferences,
        exercise_avoidances: currentProfile.exerciseAvoidances,
        learning_rate: currentProfile.learningRate,
        last_updated: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error al actualizar perfil de aprendizaje:', error)
      return null
    }

    return currentProfile
  } catch (error) {
    console.error('Error al actualizar perfil de aprendizaje:', error)
    return null
  }
}

/**
 * Calcula el progreso después de sesiones de entrenamiento
 * @param userId - ID del usuario
 * @param sessions - Sesiones de entrenamiento
 * @returns - Valor de progreso (-1 a 1)
 */
const calculateProgressAfterSessions = (
  userId: string,
  sessions: WorkoutLog[]
): number => {
  // Esta es una implementación simplificada
  // En una implementación real, se analizarían métricas de progreso

  // Por ahora, devolvemos un valor aleatorio
  return Math.random() * 2 - 1
}

/**
 * Genera recomendaciones personalizadas basadas en el perfil de aprendizaje
 * @param userId - ID del usuario
 * @returns - Lista de recomendaciones personalizadas
 */
export const generatePersonalizedRecommendations = async (
  userId: string
): Promise<PersonalizedRecommendation[]> => {
  try {
    // Obtener perfil de aprendizaje
    const learningProfile = await getLearningProfile(userId)

    if (!learningProfile) {
      return []
    }

    // Obtener datos de fatiga
    const fatigue = await getUserFatigue(userId)

    if (!fatigue) {
      return []
    }

    // Obtener preferencias de entrenamiento
    const trainingPreferences = await getTrainingPreferences(userId)

    if (!trainingPreferences) {
      return []
    }

    // Lista de recomendaciones
    const recommendations: PersonalizedRecommendation[] = []

    // Recomendación basada en respuesta a volumen
    if (learningProfile.responseToVolume > 7) {
      recommendations.push({
        id: uuidv4(),
        userId,
        type: 'training',
        title: 'Aumentar volumen de entrenamiento',
        description: 'Tus resultados muestran una excelente respuesta al volumen alto. Considera aumentar el número de series por grupo muscular en un 15-20%.',
        priority: 'high',
        baseReason: 'Alta respuesta a volumen',
        dataPoints: {
          responseToVolume: learningProfile.responseToVolume,
          currentFatigue: fatigue.currentFatigue
        },
        created: new Date().toISOString(),
        implemented: false
      })
    } else if (learningProfile.responseToVolume < 3) {
      recommendations.push({
        id: uuidv4(),
        userId,
        type: 'training',
        title: 'Reducir volumen de entrenamiento',
        description: 'Tus resultados muestran una respuesta subóptima al volumen alto. Considera reducir el número de series por grupo muscular en un 15-20% y aumentar la intensidad.',
        priority: 'medium',
        baseReason: 'Baja respuesta a volumen',
        dataPoints: {
          responseToVolume: learningProfile.responseToVolume,
          currentFatigue: fatigue.currentFatigue
        },
        created: new Date().toISOString(),
        implemented: false
      })
    }

    // Recomendación basada en respuesta a intensidad
    if (learningProfile.responseToIntensity > 7) {
      recommendations.push({
        id: uuidv4(),
        userId,
        type: 'training',
        title: 'Aumentar intensidad de entrenamiento',
        description: 'Tus resultados muestran una excelente respuesta a la intensidad alta. Considera entrenar con RPE 8-9 en tus series principales.',
        priority: 'high',
        baseReason: 'Alta respuesta a intensidad',
        dataPoints: {
          responseToIntensity: learningProfile.responseToIntensity,
          currentFatigue: fatigue.currentFatigue
        },
        created: new Date().toISOString(),
        implemented: false
      })
    } else if (learningProfile.responseToIntensity < 3) {
      recommendations.push({
        id: uuidv4(),
        userId,
        type: 'training',
        title: 'Reducir intensidad de entrenamiento',
        description: 'Tus resultados muestran una respuesta subóptima a la intensidad alta. Considera entrenar con RPE 6-7 y aumentar el volumen.',
        priority: 'medium',
        baseReason: 'Baja respuesta a intensidad',
        dataPoints: {
          responseToIntensity: learningProfile.responseToIntensity,
          currentFatigue: fatigue.currentFatigue
        },
        created: new Date().toISOString(),
        implemented: false
      })
    }

    // Recomendación basada en capacidad de recuperación
    if (learningProfile.recoveryCapacity < 4 && fatigue.currentFatigue > 60) {
      recommendations.push({
        id: uuidv4(),
        userId,
        type: 'recovery',
        title: 'Mejorar estrategias de recuperación',
        description: 'Tu capacidad de recuperación es baja y tu fatiga actual es alta. Considera implementar técnicas de recuperación activa como yoga, estiramientos o baños de contraste.',
        priority: 'high',
        baseReason: 'Baja capacidad de recuperación con fatiga alta',
        dataPoints: {
          recoveryCapacity: learningProfile.recoveryCapacity,
          currentFatigue: fatigue.currentFatigue
        },
        created: new Date().toISOString(),
        implemented: false
      })
    }

    // Recomendación basada en adherencia a la nutrición
    if (learningProfile.nutritionAdherence < 5) {
      recommendations.push({
        id: uuidv4(),
        userId,
        type: 'nutrition',
        title: 'Mejorar adherencia nutricional',
        description: 'Tu adherencia a la nutrición es baja. Considera simplificar tu plan nutricional o implementar comidas pre-preparadas para facilitar el seguimiento.',
        priority: 'medium',
        baseReason: 'Baja adherencia nutricional',
        dataPoints: {
          nutritionAdherence: learningProfile.nutritionAdherence
        },
        created: new Date().toISOString(),
        implemented: false
      })
    }

    // Guardar recomendaciones en Supabase
    if (recommendations.length > 0) {
      const { error } = await supabase
        .from('personalized_recommendations')
        .insert(recommendations.map(rec => ({
          id: rec.id,
          user_id: rec.userId,
          type: rec.type,
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          base_reason: rec.baseReason,
          data_points: rec.dataPoints,
          created: rec.created,
          implemented: rec.implemented
        })))

      if (error) {
        console.error('Error al guardar recomendaciones:', error)
      }
    }

    return recommendations
  } catch (error) {
    console.error('Error al generar recomendaciones personalizadas:', error)
    return []
  }
}

/**
 * Registra la respuesta a un ejercicio específico
 * @param userId - ID del usuario
 * @param exerciseId - ID del ejercicio
 * @param effectivenessScore - Puntuación de efectividad (0-10)
 * @param fatigueImpact - Impacto en fatiga (0-10)
 * @param notes - Notas adicionales
 * @returns - Perfil de respuesta actualizado o null en caso de error
 */
export const recordExerciseResponse = async (
  userId: string,
  exerciseId: string,
  effectivenessScore: number,
  fatigueImpact: number,
  notes: string = ""
): Promise<ExerciseResponseProfile | null> => {
  try {
    // Obtener perfil actual si existe
    const { data: existingProfile, error: fetchError } = await supabase
      .from('exercise_response_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .single()

    // Determinar valores para el perfil
    let profile: ExerciseResponseProfile

    if (fetchError || !existingProfile) {
      // Crear nuevo perfil
      profile = {
        userId,
        exerciseId,
        effectivenessScore,
        fatigueImpact,
        recoveryTime: fatigueImpact * 12, // Estimación simple: 12 horas por punto de fatiga
        preferredRepRange: [8, 12], // Valores por defecto
        preferredRirRange: [1, 3], // Valores por defecto
        notes,
        lastUpdated: new Date().toISOString()
      }
    } else {
      // Actualizar perfil existente con promedio ponderado
      const oldWeight = 0.7 // Peso de los datos históricos
      const newWeight = 0.3 // Peso de los nuevos datos

      profile = {
        userId,
        exerciseId,
        effectivenessScore: existingProfile.effectiveness_score * oldWeight + effectivenessScore * newWeight,
        fatigueImpact: existingProfile.fatigue_impact * oldWeight + fatigueImpact * newWeight,
        recoveryTime: existingProfile.recovery_time * oldWeight + (fatigueImpact * 12) * newWeight,
        preferredRepRange: existingProfile.preferred_rep_range,
        preferredRirRange: existingProfile.preferred_rir_range,
        notes: notes || existingProfile.notes,
        lastUpdated: new Date().toISOString()
      }
    }

    // Guardar en Supabase
    const { data, error } = await supabase
      .from('exercise_response_profiles')
      .upsert({
        user_id: profile.userId,
        exercise_id: profile.exerciseId,
        effectiveness_score: profile.effectivenessScore,
        fatigue_impact: profile.fatigueImpact,
        recovery_time: profile.recoveryTime,
        preferred_rep_range: profile.preferredRepRange,
        preferred_rir_range: profile.preferredRirRange,
        notes: profile.notes,
        last_updated: profile.lastUpdated
      })
      .select()

    if (error) {
      console.error('Error al guardar perfil de respuesta a ejercicio:', error)
      return null
    }

    return profile
  } catch (error) {
    console.error('Error al registrar respuesta a ejercicio:', error)
    return null
  }
}
