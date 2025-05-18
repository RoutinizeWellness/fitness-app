import { supabase } from "@/lib/supabase-client"
import { EnhancedUserProfile, UserPreferences, UserMetrics, UserBehavior } from "@/lib/types/user-profile"

/**
 * Obtiene el perfil mejorado del usuario
 */
export async function getEnhancedUserProfile(userId: string): Promise<EnhancedUserProfile | null> {
  try {
    // Obtener el perfil básico
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Error al obtener el perfil básico:', profileError)
      return null
    }

    // Obtener las preferencias del usuario
    const { data: preferencesData, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Obtener las métricas del usuario
    const { data: metricsData, error: metricsError } = await supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Obtener el comportamiento del usuario
    const { data: behaviorData, error: behaviorError } = await supabase
      .from('user_behavior')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Obtener los insights de IA
    const { data: insightsData, error: insightsError } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Construir el perfil mejorado
    const enhancedProfile: EnhancedUserProfile = {
      userId,
      personalInfo: {
        firstName: profileData?.first_name || '',
        lastName: profileData?.last_name || '',
        email: profileData?.email || '',
        dateOfBirth: profileData?.date_of_birth || '',
        gender: profileData?.gender || '',
        occupation: profileData?.occupation || '',
        activityLevel: profileData?.activity_level || 'moderately_active',
      },
      preferences: preferencesData?.preferences || getDefaultPreferences(),
      metrics: metricsData?.metrics || getDefaultMetrics(),
      behavior: behaviorData?.behavior || getDefaultBehavior(),
      aiInsights: insightsData?.insights || undefined
    }

    return enhancedProfile
  } catch (error) {
    console.error('Error al obtener el perfil mejorado:', error)
    return null
  }
}

/**
 * Actualiza las preferencias del usuario
 */
export async function updateUserPreferences(userId: string, preferences: UserPreferences): Promise<boolean> {
  try {
    // Verificar si ya existen preferencias para este usuario
    const { data, error: checkError } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (checkError) {
      console.error('Error al verificar preferencias existentes:', checkError)
      return false
    }

    let updateError

    if (data) {
      // Actualizar preferencias existentes
      const { error } = await supabase
        .from('user_preferences')
        .update({ preferences, updated_at: new Date().toISOString() })
        .eq('user_id', userId)

      updateError = error
    } else {
      // Insertar nuevas preferencias
      const { error } = await supabase
        .from('user_preferences')
        .insert([{ 
          user_id: userId, 
          preferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      updateError = error
    }

    if (updateError) {
      console.error('Error al actualizar preferencias:', updateError)
      return false
    }

    return true
  } catch (error) {
    console.error('Error inesperado al actualizar preferencias:', error)
    return false
  }
}

/**
 * Actualiza las métricas del usuario
 */
export async function updateUserMetrics(userId: string, metrics: UserMetrics): Promise<boolean> {
  try {
    // Verificar si ya existen métricas para este usuario
    const { data, error: checkError } = await supabase
      .from('user_metrics')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (checkError) {
      console.error('Error al verificar métricas existentes:', checkError)
      return false
    }

    let updateError

    if (data) {
      // Actualizar métricas existentes
      const { error } = await supabase
        .from('user_metrics')
        .update({ metrics, updated_at: new Date().toISOString() })
        .eq('user_id', userId)

      updateError = error
    } else {
      // Insertar nuevas métricas
      const { error } = await supabase
        .from('user_metrics')
        .insert([{ 
          user_id: userId, 
          metrics,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      updateError = error
    }

    if (updateError) {
      console.error('Error al actualizar métricas:', updateError)
      return false
    }

    return true
  } catch (error) {
    console.error('Error inesperado al actualizar métricas:', error)
    return false
  }
}

/**
 * Actualiza el comportamiento del usuario
 * Esta función normalmente se llamaría automáticamente por el sistema
 */
export async function updateUserBehavior(userId: string, behavior: UserBehavior): Promise<boolean> {
  try {
    // Verificar si ya existe comportamiento para este usuario
    const { data, error: checkError } = await supabase
      .from('user_behavior')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (checkError) {
      console.error('Error al verificar comportamiento existente:', checkError)
      return false
    }

    let updateError

    if (data) {
      // Actualizar comportamiento existente
      const { error } = await supabase
        .from('user_behavior')
        .update({ behavior, updated_at: new Date().toISOString() })
        .eq('user_id', userId)

      updateError = error
    } else {
      // Insertar nuevo comportamiento
      const { error } = await supabase
        .from('user_behavior')
        .insert([{ 
          user_id: userId, 
          behavior,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      updateError = error
    }

    if (updateError) {
      console.error('Error al actualizar comportamiento:', updateError)
      return false
    }

    return true
  } catch (error) {
    console.error('Error inesperado al actualizar comportamiento:', error)
    return false
  }
}

/**
 * Registra una acción del usuario para análisis de comportamiento
 */
export async function trackUserAction(
  userId: string, 
  actionType: string, 
  actionData: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_actions')
      .insert([{ 
        user_id: userId, 
        action_type: actionType,
        action_data: actionData,
        created_at: new Date().toISOString()
      }])

    if (error) {
      console.error('Error al registrar acción del usuario:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error inesperado al registrar acción del usuario:', error)
    return false
  }
}

/**
 * Obtiene valores predeterminados para las preferencias del usuario
 */
function getDefaultPreferences(): UserPreferences {
  return {
    trainingPreferences: {
      preferredWorkoutDays: ["monday", "wednesday", "friday"],
      preferredWorkoutTime: "evening",
      workoutDuration: 60,
      exerciseIntensity: "moderate",
      focusAreas: ["full_body"],
      avoidedExercises: [],
      favoriteExercises: [],
      equipmentAvailable: ["bodyweight"],
      trainingExperience: "beginner",
      trainingGoals: ["general_fitness"],
      injuryHistory: []
    },
    nutritionPreferences: {
      dietType: "omnivore",
      mealsPerDay: 3,
      calorieGoal: 2000,
      macroRatios: {
        protein: 30,
        carbs: 40,
        fat: 30
      },
      allergies: [],
      dislikedFoods: [],
      favoriteFoods: [],
      mealPrepFrequency: "none",
      supplementsUsed: [],
      waterIntakeGoal: 2000
    },
    wellnessPreferences: {
      sleepGoal: 8,
      stressManagementTechniques: ["meditation"],
      recoveryMethods: ["stretching"],
      mindfulnessPreference: "guided",
      mindfulnessDuration: 10,
      wellnessReminders: true,
      wellnessReminderFrequency: "daily"
    },
    uiPreferences: {
      theme: "system",
      accentColor: "blue",
      dashboardLayout: "detailed",
      notificationsEnabled: true,
      notificationTypes: {
        workout: true,
        nutrition: true,
        wellness: true,
        progress: true,
        tips: true
      },
      language: "es",
      measurementSystem: "metric",
      dataVisualizationPreference: "charts"
    }
  }
}

/**
 * Obtiene valores predeterminados para las métricas del usuario
 */
function getDefaultMetrics(): UserMetrics {
  return {
    physicalMetrics: {
      height: 170,
      weight: 70
    },
    trainingMetrics: {
      workoutsPerWeek: 3,
      averageWorkoutDuration: 60
    },
    wellnessMetrics: {
      averageSleepDuration: 7,
      sleepQuality: 7,
      stressLevel: 5,
      energyLevel: 7,
      moodScore: 7,
      mindfulnessMinutesPerWeek: 0,
      recoverySessionsPerWeek: 0
    },
    nutritionMetrics: {
      averageCalorieIntake: 2000,
      averageMacros: {
        protein: 100,
        carbs: 200,
        fat: 67
      },
      waterIntake: 1500,
      mealAdherence: 80,
      nutritionScore: 70
    }
  }
}

/**
 * Obtiene valores predeterminados para el comportamiento del usuario
 */
function getDefaultBehavior(): UserBehavior {
  return {
    appUsage: {
      mostVisitedSections: ["workouts"],
      averageSessionDuration: 10,
      sessionsPerWeek: 3,
      preferredTimeOfUse: "evening",
      featureEngagement: {},
      completionRates: {
        workouts: 80,
        nutritionTracking: 50,
        wellnessActivities: 30
      }
    },
    trainingPatterns: {
      preferredExerciseTypes: ["bodyweight"],
      skippedExercises: [],
      modifiedExercises: [],
      restTimeBetweenSets: 60,
      workoutCompletionTime: 100,
      consistentWorkoutDays: ["monday", "wednesday", "friday"],
      missedWorkoutReasons: []
    },
    wellnessPatterns: {
      stressfulDays: [],
      recoveryTechniquesUsed: [],
      sleepScheduleConsistency: 70,
      mindfulnessSessionCompletion: 0,
      moodTrends: {}
    },
    nutritionPatterns: {
      mealTimings: {
        breakfast: "08:00",
        lunch: "13:00",
        dinner: "20:00",
        snacks: []
      },
      weekdayVsWeekendDifference: 20,
      commonNutritionChallenges: [],
      nutritionAdherenceTrends: {}
    }
  }
}
