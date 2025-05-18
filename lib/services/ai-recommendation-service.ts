import { supabase } from "@/lib/supabase-client"
import { EnhancedUserProfile } from "@/lib/types/user-profile"
import { getEnhancedUserProfile } from "@/lib/services/user-profile-service"

interface RecommendationOptions {
  type: "workout" | "nutrition" | "wellness" | "recovery" | "all"
  context?: "morning" | "afternoon" | "evening" | "weekend" | "weekday" | "current"
  count?: number
  includeReasoning?: boolean
}

export interface Recommendation {
  id: string
  type: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  actionable: boolean
  actionUrl?: string
  reasoning?: string
  expiresAt?: string
  tags: string[]
  metadata?: any
}

/**
 * Genera recomendaciones personalizadas para el usuario
 */
export async function generateRecommendations(
  userId: string,
  options: RecommendationOptions = { type: "all", count: 5 }
): Promise<Recommendation[]> {
  try {
    // Obtener el perfil mejorado del usuario
    const userProfile = await getEnhancedUserProfile(userId)
    
    if (!userProfile) {
      console.error('No se pudo obtener el perfil del usuario')
      return []
    }

    // Obtener datos adicionales según el tipo de recomendación
    const additionalData = await getAdditionalDataForRecommendations(userId, options.type)
    
    // Generar recomendaciones basadas en el perfil y los datos adicionales
    const recommendations = await generateRecommendationsFromData(userProfile, additionalData, options)
    
    // Guardar las recomendaciones generadas en la base de datos
    await saveRecommendations(userId, recommendations)
    
    return recommendations
  } catch (error) {
    console.error('Error al generar recomendaciones:', error)
    return []
  }
}

/**
 * Obtiene recomendaciones guardadas para el usuario
 */
export async function getSavedRecommendations(
  userId: string,
  options: RecommendationOptions = { type: "all", count: 5 }
): Promise<Recommendation[]> {
  try {
    let query = supabase
      .from('user_recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false })
    
    // Filtrar por tipo si no es "all"
    if (options.type !== "all") {
      query = query.eq('type', options.type)
    }
    
    // Limitar el número de resultados
    if (options.count) {
      query = query.limit(options.count)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error al obtener recomendaciones guardadas:', error)
      return []
    }
    
    return data.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      priority: item.priority,
      actionable: item.actionable,
      actionUrl: item.action_url,
      reasoning: item.reasoning,
      expiresAt: item.expires_at,
      tags: item.tags,
      metadata: item.metadata
    }))
  } catch (error) {
    console.error('Error al obtener recomendaciones guardadas:', error)
    return []
  }
}

/**
 * Marca una recomendación como descartada
 */
export async function dismissRecommendation(userId: string, recommendationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_recommendations')
      .update({ 
        is_dismissed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', recommendationId)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error al descartar recomendación:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error inesperado al descartar recomendación:', error)
    return false
  }
}

/**
 * Marca una recomendación como completada
 */
export async function completeRecommendation(userId: string, recommendationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_recommendations')
      .update({ 
        is_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', recommendationId)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error al completar recomendación:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error inesperado al completar recomendación:', error)
    return false
  }
}

/**
 * Obtiene datos adicionales para generar recomendaciones
 */
async function getAdditionalDataForRecommendations(
  userId: string, 
  type: string
): Promise<any> {
  // Datos específicos según el tipo de recomendación
  switch (type) {
    case "workout":
      return getWorkoutData(userId)
    case "nutrition":
      return getNutritionData(userId)
    case "wellness":
      return getWellnessData(userId)
    case "recovery":
      return getRecoveryData(userId)
    case "all":
      return {
        workout: await getWorkoutData(userId),
        nutrition: await getNutritionData(userId),
        wellness: await getWellnessData(userId),
        recovery: await getRecoveryData(userId)
      }
    default:
      return {}
  }
}

/**
 * Obtiene datos de entrenamiento para recomendaciones
 */
async function getWorkoutData(userId: string): Promise<any> {
  try {
    // Obtener sesiones de entrenamiento recientes
    const { data: recentSessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10)
    
    if (sessionsError) {
      console.error('Error al obtener sesiones recientes:', sessionsError)
    }
    
    // Obtener rutinas activas
    const { data: activeRoutines, error: routinesError } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
    
    if (routinesError) {
      console.error('Error al obtener rutinas activas:', routinesError)
    }
    
    // Obtener datos de fatiga
    const { data: fatigueData, error: fatigueError } = await supabase
      .from('wellness_scores')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7)
    
    if (fatigueError) {
      console.error('Error al obtener datos de fatiga:', fatigueError)
    }
    
    return {
      recentSessions: recentSessions || [],
      activeRoutines: activeRoutines || [],
      fatigueData: fatigueData || []
    }
  } catch (error) {
    console.error('Error al obtener datos de entrenamiento:', error)
    return {
      recentSessions: [],
      activeRoutines: [],
      fatigueData: []
    }
  }
}

/**
 * Obtiene datos de nutrición para recomendaciones
 */
async function getNutritionData(userId: string): Promise<any> {
  try {
    // Obtener registros de comidas recientes
    const { data: recentMeals, error: mealsError } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10)
    
    if (mealsError) {
      console.error('Error al obtener comidas recientes:', mealsError)
    }
    
    // Obtener datos de peso recientes
    const { data: weightData, error: weightError } = await supabase
      .from('user_metrics_history')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_type', 'weight')
      .order('date', { ascending: false })
      .limit(10)
    
    if (weightError) {
      console.error('Error al obtener datos de peso:', weightError)
    }
    
    return {
      recentMeals: recentMeals || [],
      weightData: weightData || []
    }
  } catch (error) {
    console.error('Error al obtener datos de nutrición:', error)
    return {
      recentMeals: [],
      weightData: []
    }
  }
}

/**
 * Obtiene datos de bienestar para recomendaciones
 */
async function getWellnessData(userId: string): Promise<any> {
  try {
    // Obtener puntuaciones de bienestar recientes
    const { data: wellnessScores, error: wellnessError } = await supabase
      .from('wellness_scores')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(14)
    
    if (wellnessError) {
      console.error('Error al obtener puntuaciones de bienestar:', wellnessError)
    }
    
    // Obtener entradas del diario emocional recientes
    const { data: journalEntries, error: journalError } = await supabase
      .from('emotional_journal')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5)
    
    if (journalError) {
      console.error('Error al obtener entradas del diario:', journalError)
    }
    
    return {
      wellnessScores: wellnessScores || [],
      journalEntries: journalEntries || []
    }
  } catch (error) {
    console.error('Error al obtener datos de bienestar:', error)
    return {
      wellnessScores: [],
      journalEntries: []
    }
  }
}

/**
 * Obtiene datos de recuperación para recomendaciones
 */
async function getRecoveryData(userId: string): Promise<any> {
  try {
    // Obtener sesiones de recuperación recientes
    const { data: recoverySessions, error: recoveryError } = await supabase
      .from('recovery_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (recoveryError) {
      console.error('Error al obtener sesiones de recuperación:', recoveryError)
    }
    
    // Obtener datos de sueño recientes
    const { data: sleepData, error: sleepError } = await supabase
      .from('wellness_scores')
      .select('date, sleep_hours, mood')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7)
    
    if (sleepError) {
      console.error('Error al obtener datos de sueño:', sleepError)
    }
    
    return {
      recoverySessions: recoverySessions || [],
      sleepData: sleepData || []
    }
  } catch (error) {
    console.error('Error al obtener datos de recuperación:', error)
    return {
      recoverySessions: [],
      sleepData: []
    }
  }
}

/**
 * Genera recomendaciones basadas en los datos del usuario
 * Esta función contiene la lógica principal de recomendación
 */
async function generateRecommendationsFromData(
  userProfile: EnhancedUserProfile,
  additionalData: any,
  options: RecommendationOptions
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = []
  const count = options.count || 5
  
  // Determinar el contexto actual si es "current"
  if (options.context === "current") {
    const now = new Date()
    const hour = now.getHours()
    const isWeekend = now.getDay() === 0 || now.getDay() === 6
    
    if (hour < 12) {
      options.context = "morning"
    } else if (hour < 18) {
      options.context = "afternoon"
    } else {
      options.context = "evening"
    }
    
    if (isWeekend) {
      options.context = "weekend"
    } else {
      options.context = "weekday"
    }
  }
  
  // Generar recomendaciones según el tipo
  if (options.type === "workout" || options.type === "all") {
    const workoutRecommendations = generateWorkoutRecommendations(userProfile, additionalData, options)
    recommendations.push(...workoutRecommendations)
  }
  
  if (options.type === "nutrition" || options.type === "all") {
    const nutritionRecommendations = generateNutritionRecommendations(userProfile, additionalData, options)
    recommendations.push(...nutritionRecommendations)
  }
  
  if (options.type === "wellness" || options.type === "all") {
    const wellnessRecommendations = generateWellnessRecommendations(userProfile, additionalData, options)
    recommendations.push(...wellnessRecommendations)
  }
  
  if (options.type === "recovery" || options.type === "all") {
    const recoveryRecommendations = generateRecoveryRecommendations(userProfile, additionalData, options)
    recommendations.push(...recoveryRecommendations)
  }
  
  // Ordenar por prioridad y limitar el número de recomendaciones
  const priorityOrder = { "high": 0, "medium": 1, "low": 2 }
  const sortedRecommendations = recommendations
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, count)
  
  return sortedRecommendations
}

/**
 * Genera recomendaciones de entrenamiento
 */
function generateWorkoutRecommendations(
  userProfile: EnhancedUserProfile,
  data: any,
  options: RecommendationOptions
): Recommendation[] {
  const recommendations: Recommendation[] = []
  const workoutData = options.type === "all" ? data.workout : data
  
  // Ejemplo: Recomendar descanso si hay signos de fatiga
  if (workoutData.fatigueData && workoutData.fatigueData.length > 0) {
    const recentFatigue = workoutData.fatigueData[0]
    
    if (recentFatigue.recovery_score < 50) {
      recommendations.push({
        id: `workout-rest-${Date.now()}`,
        type: "workout",
        title: "Día de descanso recomendado",
        description: "Tus niveles de fatiga indican que necesitas un día de descanso para recuperarte adecuadamente.",
        priority: "high",
        actionable: true,
        actionUrl: "/recovery",
        reasoning: options.includeReasoning 
          ? `Tu puntuación de recuperación es ${recentFatigue.recovery_score}/100, lo que indica fatiga acumulada.` 
          : undefined,
        tags: ["descanso", "recuperación", "fatiga"]
      })
    }
  }
  
  // Ejemplo: Recomendar un tipo de entrenamiento según el día de la semana
  const today = new Date()
  const dayOfWeek = today.getDay()
  const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
  
  // Verificar si hoy es un día preferido de entrenamiento
  const isPreferredDay = userProfile.preferences.trainingPreferences.preferredWorkoutDays.includes(dayNames[dayOfWeek])
  
  if (isPreferredDay) {
    // Recomendar un entrenamiento específico según los objetivos
    const goals = userProfile.preferences.trainingPreferences.trainingGoals
    
    if (goals.includes("muscle_gain")) {
      recommendations.push({
        id: `workout-strength-${Date.now()}`,
        type: "workout",
        title: "Entrenamiento de fuerza recomendado",
        description: "Hoy es un buen día para un entrenamiento de fuerza enfocado en hipertrofia.",
        priority: "medium",
        actionable: true,
        actionUrl: "/workouts/strength",
        reasoning: options.includeReasoning 
          ? `Hoy es ${dayNames[dayOfWeek]}, uno de tus días preferidos de entrenamiento, y tu objetivo principal es ganar masa muscular.` 
          : undefined,
        tags: ["fuerza", "hipertrofia", "entrenamiento"]
      })
    } else if (goals.includes("fat_loss")) {
      recommendations.push({
        id: `workout-hiit-${Date.now()}`,
        type: "workout",
        title: "Entrenamiento HIIT recomendado",
        description: "Un entrenamiento HIIT sería ideal hoy para maximizar la quema de calorías.",
        priority: "medium",
        actionable: true,
        actionUrl: "/workouts/hiit",
        reasoning: options.includeReasoning 
          ? `Hoy es ${dayNames[dayOfWeek]}, uno de tus días preferidos de entrenamiento, y tu objetivo principal es perder grasa.` 
          : undefined,
        tags: ["hiit", "cardio", "quema de grasa"]
      })
    }
  }
  
  // Más recomendaciones específicas según el contexto...
  
  return recommendations
}

/**
 * Genera recomendaciones de nutrición
 */
function generateNutritionRecommendations(
  userProfile: EnhancedUserProfile,
  data: any,
  options: RecommendationOptions
): Recommendation[] {
  const recommendations: Recommendation[] = []
  const nutritionData = options.type === "all" ? data.nutrition : data
  
  // Ejemplo: Recomendar ajuste de calorías según tendencia de peso
  if (nutritionData.weightData && nutritionData.weightData.length >= 2) {
    const latestWeight = nutritionData.weightData[0].value
    const previousWeight = nutritionData.weightData[1].value
    const weightDiff = latestWeight - previousWeight
    
    if (weightDiff > 0.5 && userProfile.preferences.trainingPreferences.trainingGoals.includes("fat_loss")) {
      recommendations.push({
        id: `nutrition-calories-${Date.now()}`,
        type: "nutrition",
        title: "Ajuste de calorías recomendado",
        description: "Considera reducir ligeramente tu ingesta calórica para alinearte con tu objetivo de pérdida de grasa.",
        priority: "medium",
        actionable: true,
        actionUrl: "/nutrition/adjust-calories",
        reasoning: options.includeReasoning 
          ? `Has aumentado ${weightDiff.toFixed(1)} kg desde tu última medición, lo que sugiere un superávit calórico.` 
          : undefined,
        tags: ["calorías", "ajuste", "pérdida de peso"]
      })
    }
  }
  
  // Ejemplo: Recomendar hidratación
  const waterIntake = userProfile.metrics.nutritionMetrics.waterIntake
  const waterGoal = userProfile.preferences.nutritionPreferences.waterIntakeGoal
  
  if (waterIntake < waterGoal * 0.7) {
    recommendations.push({
      id: `nutrition-water-${Date.now()}`,
      type: "nutrition",
      title: "Aumenta tu hidratación",
      description: `Estás bebiendo menos del 70% de tu objetivo diario de agua (${waterGoal} ml).`,
      priority: "high",
      actionable: true,
      actionUrl: "/nutrition/water-tracking",
      reasoning: options.includeReasoning 
        ? `Tu ingesta actual de agua es de ${waterIntake} ml, que es significativamente menor que tu objetivo de ${waterGoal} ml.` 
        : undefined,
      tags: ["hidratación", "agua", "salud"]
    })
  }
  
  // Más recomendaciones específicas según el contexto...
  
  return recommendations
}

/**
 * Genera recomendaciones de bienestar
 */
function generateWellnessRecommendations(
  userProfile: EnhancedUserProfile,
  data: any,
  options: RecommendationOptions
): Recommendation[] {
  const recommendations: Recommendation[] = []
  const wellnessData = options.type === "all" ? data.wellness : data
  
  // Ejemplo: Recomendar meditación si el nivel de estrés es alto
  if (wellnessData.wellnessScores && wellnessData.wellnessScores.length > 0) {
    const recentScore = wellnessData.wellnessScores[0]
    
    if (recentScore.stress_level > 7) {
      recommendations.push({
        id: `wellness-meditation-${Date.now()}`,
        type: "wellness",
        title: "Sesión de meditación recomendada",
        description: "Una breve sesión de meditación podría ayudarte a reducir tu nivel de estrés actual.",
        priority: "high",
        actionable: true,
        actionUrl: "/wellness/recovery?type=meditation",
        reasoning: options.includeReasoning 
          ? `Tu nivel de estrés actual es ${recentScore.stress_level}/10, lo que indica un estrés elevado.` 
          : undefined,
        tags: ["meditación", "estrés", "mindfulness"]
      })
    }
  }
  
  // Ejemplo: Recomendar escribir en el diario si ha pasado tiempo desde la última entrada
  if (wellnessData.journalEntries && wellnessData.journalEntries.length > 0) {
    const lastEntryDate = new Date(wellnessData.journalEntries[0].date)
    const today = new Date()
    const daysSinceLastEntry = Math.floor((today.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceLastEntry > 3) {
      recommendations.push({
        id: `wellness-journal-${Date.now()}`,
        type: "wellness",
        title: "Actualiza tu diario emocional",
        description: `Han pasado ${daysSinceLastEntry} días desde tu última entrada en el diario.`,
        priority: "medium",
        actionable: true,
        actionUrl: "/wellness/recovery?tab=journal",
        reasoning: options.includeReasoning 
          ? `Registrar regularmente tus emociones puede ayudarte a gestionar mejor el estrés y mejorar tu bienestar general.` 
          : undefined,
        tags: ["diario", "emociones", "bienestar"]
      })
    }
  }
  
  // Más recomendaciones específicas según el contexto...
  
  return recommendations
}

/**
 * Genera recomendaciones de recuperación
 */
function generateRecoveryRecommendations(
  userProfile: EnhancedUserProfile,
  data: any,
  options: RecommendationOptions
): Recommendation[] {
  const recommendations: Recommendation[] = []
  const recoveryData = options.type === "all" ? data.recovery : data
  
  // Ejemplo: Recomendar mejorar el sueño si la calidad es baja
  if (recoveryData.sleepData && recoveryData.sleepData.length > 0) {
    const recentSleep = recoveryData.sleepData[0]
    
    if (recentSleep.sleep_hours < userProfile.preferences.wellnessPreferences.sleepGoal - 1) {
      recommendations.push({
        id: `recovery-sleep-${Date.now()}`,
        type: "recovery",
        title: "Mejora tu sueño",
        description: `Dormiste menos de lo recomendado. Intenta acostarte más temprano esta noche.`,
        priority: "high",
        actionable: true,
        actionUrl: "/wellness/recovery?type=sleep",
        reasoning: options.includeReasoning 
          ? `Dormiste ${recentSleep.sleep_hours} horas, que es menos que tu objetivo de ${userProfile.preferences.wellnessPreferences.sleepGoal} horas.` 
          : undefined,
        tags: ["sueño", "recuperación", "descanso"]
      })
    }
  }
  
  // Ejemplo: Recomendar estiramientos si no se han hecho recientemente
  if (recoveryData.recoverySessions && recoveryData.recoverySessions.length > 0) {
    const stretchingSessions = recoveryData.recoverySessions.filter(
      (session: any) => session.type === "stretching"
    )
    
    if (stretchingSessions.length === 0 || 
        new Date(stretchingSessions[0].created_at).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000) {
      recommendations.push({
        id: `recovery-stretching-${Date.now()}`,
        type: "recovery",
        title: "Sesión de estiramientos recomendada",
        description: "Ha pasado tiempo desde tu última sesión de estiramientos. Sería beneficioso hacer una hoy.",
        priority: "medium",
        actionable: true,
        actionUrl: "/wellness/recovery?type=stretching",
        reasoning: options.includeReasoning 
          ? `Los estiramientos regulares mejoran la flexibilidad, reducen el dolor muscular y ayudan a prevenir lesiones.` 
          : undefined,
        tags: ["estiramientos", "flexibilidad", "recuperación"]
      })
    }
  }
  
  // Más recomendaciones específicas según el contexto...
  
  return recommendations
}

/**
 * Guarda las recomendaciones generadas en la base de datos
 */
async function saveRecommendations(userId: string, recommendations: Recommendation[]): Promise<boolean> {
  try {
    if (recommendations.length === 0) {
      return true
    }
    
    const recommendationsToSave = recommendations.map(rec => ({
      user_id: userId,
      type: rec.type,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      actionable: rec.actionable,
      action_url: rec.actionUrl,
      reasoning: rec.reasoning,
      expires_at: rec.expiresAt,
      tags: rec.tags,
      metadata: rec.metadata,
      is_dismissed: false,
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    
    const { error } = await supabase
      .from('user_recommendations')
      .insert(recommendationsToSave)
    
    if (error) {
      console.error('Error al guardar recomendaciones:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error inesperado al guardar recomendaciones:', error)
    return false
  }
}
