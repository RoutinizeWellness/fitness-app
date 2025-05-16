import { supabase } from "@/lib/supabase-client"

// Tipos para el servicio de personalización de entrenamiento
export interface TrainingProfile {
  userId: string
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  primaryGoal: string
  secondaryGoals: string[]
  weeklyAvailability: number
  trainingDays: string[] // Días de la semana seleccionados
  sessionDuration: number
  equipment: string[]
  trainingLocation: string
  injuries: string[]
  preferredExercises: string[]
  dislikedExercises: string[]
  priorityMuscleGroups: string[] // Grupos musculares a priorizar
  gender: 'male' | 'female' | 'other'
  currentWeight: number
  height: number
  bodyFatPercentage?: number
  lastUpdated: string
}

/**
 * Obtiene el perfil de entrenamiento del usuario
 */
export async function getTrainingProfile(userId: string) {
  try {
    // Intentar obtener datos de Supabase
    const { data, error } = await supabase
      .from('training_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST116') {
        // Tabla no existe o no se encontraron filas
        console.log('No se encontró perfil de entrenamiento, generando perfil por defecto')
        return { data: generateDefaultTrainingProfile(userId), error: null }
      }

      console.error('Error al obtener perfil de entrenamiento:', error)
      return { data: null, error }
    }

    if (data) {
      // Transformar datos al formato de la aplicación
      const assessmentData = data.assessment_data

      const trainingProfile: TrainingProfile = {
        userId,
        experienceLevel: assessmentData.experienceLevel || 'beginner',
        primaryGoal: assessmentData.primaryGoal || 'general_fitness',
        secondaryGoals: assessmentData.secondaryGoals || [],
        weeklyAvailability: assessmentData.weeklyAvailability || 3,
        trainingDays: assessmentData.trainingDays || [],
        sessionDuration: assessmentData.sessionDuration || 60,
        equipment: assessmentData.equipment || [],
        trainingLocation: assessmentData.trainingLocation || 'gym',
        injuries: assessmentData.injuries || [],
        preferredExercises: assessmentData.preferredExercises || [],
        dislikedExercises: assessmentData.dislikedExercises || [],
        priorityMuscleGroups: assessmentData.priorityMuscleGroups || [],
        gender: assessmentData.gender || 'male',
        currentWeight: assessmentData.currentWeight || 70,
        height: assessmentData.height || 170,
        bodyFatPercentage: assessmentData.bodyFatPercentage,
        lastUpdated: data.created_at
      }

      return { data: trainingProfile, error: null }
    }

    // Si no hay datos, generar perfil por defecto
    return { data: generateDefaultTrainingProfile(userId), error: null }
  } catch (error) {
    console.error('Error en getTrainingProfile:', error)
    return { data: generateDefaultTrainingProfile(userId), error }
  }
}

/**
 * Genera un perfil de entrenamiento por defecto
 */
function generateDefaultTrainingProfile(userId: string): TrainingProfile {
  return {
    userId,
    experienceLevel: 'beginner',
    primaryGoal: 'general_fitness',
    secondaryGoals: [],
    weeklyAvailability: 3,
    trainingDays: ['Lunes', 'Miércoles', 'Viernes'],
    sessionDuration: 60,
    equipment: ['Peso corporal'],
    trainingLocation: 'gym',
    injuries: [],
    preferredExercises: [],
    dislikedExercises: [],
    priorityMuscleGroups: [],
    gender: 'male',
    currentWeight: 70,
    height: 170,
    bodyFatPercentage: undefined,
    lastUpdated: new Date().toISOString()
  }
}
