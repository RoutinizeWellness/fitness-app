/**
 * Sistema de Detección de Fatiga Avanzado
 * 
 * Monitorea múltiples indicadores de fatiga para proporcionar
 * recomendaciones inteligentes de recuperación y ajustes de entrenamiento
 */

import { supabase } from './supabase-client'
import { getUserAdaptiveProfile } from './adaptive-routine-engine'

export interface FatigueMetrics {
  userId: string
  date: string
  
  // Métricas subjetivas (1-10 scale)
  perceivedFatigue: number
  sleepQuality: number
  mood: number
  motivation: number
  energyLevel: number
  musclesSoreness: number
  stressLevel: number
  
  // Métricas objetivas
  restingHeartRate?: number
  heartRateVariability?: number
  sleepDuration?: number // hours
  sleepEfficiency?: number // percentage
  
  // Métricas de rendimiento
  performanceDecline?: number // percentage vs baseline
  volumeCompletion: number // percentage of planned volume completed
  intensityMaintained: number // percentage of planned intensity maintained
  
  // Contexto adicional
  workStress?: number // 1-10 scale
  nutritionQuality?: number // 1-10 scale
  hydrationLevel?: number // 1-10 scale
  
  // Calculado automáticamente
  overallFatigueScore: number // 0-100
  fatigueCategory: 'low' | 'moderate' | 'high' | 'severe'
  recoveryRecommendation: string
}

export interface FatigueTrend {
  userId: string
  period: 'daily' | 'weekly' | 'monthly'
  trend: 'improving' | 'stable' | 'worsening'
  averageFatigue: number
  peakFatigue: number
  recoveryRate: number // days to return to baseline
  riskLevel: 'low' | 'moderate' | 'high' | 'critical'
}

export interface RecoveryRecommendation {
  id: string
  type: 'rest_day' | 'deload_week' | 'sleep_optimization' | 'stress_management' | 'nutrition_focus' | 'active_recovery'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  actionItems: string[]
  expectedBenefit: string
  timeframe: string
  confidence: number
}

/**
 * Registra métricas de fatiga del usuario
 */
export async function recordFatigueMetrics(metrics: Omit<FatigueMetrics, 'overallFatigueScore' | 'fatigueCategory' | 'recoveryRecommendation'>): Promise<FatigueMetrics> {
  try {
    // Calcular puntuación general de fatiga
    const fatigueScore = calculateOverallFatigueScore(metrics)
    const category = categorizeFatigue(fatigueScore)
    const recommendation = generateBasicRecoveryRecommendation(category)

    const completeFatigueMetrics: FatigueMetrics = {
      ...metrics,
      overallFatigueScore: fatigueScore,
      fatigueCategory: category,
      recoveryRecommendation: recommendation
    }

    // Guardar en base de datos
    const { data, error } = await supabase
      .from('fatigue_metrics')
      .insert({
        user_id: metrics.userId,
        date: metrics.date,
        perceived_fatigue: metrics.perceivedFatigue,
        sleep_quality: metrics.sleepQuality,
        mood: metrics.mood,
        motivation: metrics.motivation,
        energy_level: metrics.energyLevel,
        muscles_soreness: metrics.musclesSoreness,
        stress_level: metrics.stressLevel,
        resting_heart_rate: metrics.restingHeartRate,
        heart_rate_variability: metrics.heartRateVariability,
        sleep_duration: metrics.sleepDuration,
        sleep_efficiency: metrics.sleepEfficiency,
        performance_decline: metrics.performanceDecline,
        volume_completion: metrics.volumeCompletion,
        intensity_maintained: metrics.intensityMaintained,
        work_stress: metrics.workStress,
        nutrition_quality: metrics.nutritionQuality,
        hydration_level: metrics.hydrationLevel,
        overall_fatigue_score: fatigueScore,
        fatigue_category: category,
        recovery_recommendation: recommendation
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving fatigue metrics:', error)
      throw error
    }

    return completeFatigueMetrics
  } catch (error) {
    console.error('Error in recordFatigueMetrics:', error)
    throw error
  }
}

/**
 * Calcula la puntuación general de fatiga
 */
function calculateOverallFatigueScore(metrics: Partial<FatigueMetrics>): number {
  const weights = {
    perceivedFatigue: 0.25,
    sleepQuality: 0.20,
    energyLevel: 0.15,
    mood: 0.10,
    motivation: 0.10,
    musclesSoreness: 0.10,
    stressLevel: 0.10
  }

  let totalScore = 0
  let totalWeight = 0

  // Métricas subjetivas (invertir escala para que mayor = más fatiga)
  if (metrics.perceivedFatigue !== undefined) {
    totalScore += metrics.perceivedFatigue * weights.perceivedFatigue
    totalWeight += weights.perceivedFatigue
  }

  if (metrics.sleepQuality !== undefined) {
    totalScore += (11 - metrics.sleepQuality) * weights.sleepQuality // Invertir
    totalWeight += weights.sleepQuality
  }

  if (metrics.energyLevel !== undefined) {
    totalScore += (11 - metrics.energyLevel) * weights.energyLevel // Invertir
    totalWeight += weights.energyLevel
  }

  if (metrics.mood !== undefined) {
    totalScore += (11 - metrics.mood) * weights.mood // Invertir
    totalWeight += weights.mood
  }

  if (metrics.motivation !== undefined) {
    totalScore += (11 - metrics.motivation) * weights.motivation // Invertir
    totalWeight += weights.motivation
  }

  if (metrics.musclesSoreness !== undefined) {
    totalScore += metrics.musclesSoreness * weights.musclesSoreness
    totalWeight += weights.musclesSoreness
  }

  if (metrics.stressLevel !== undefined) {
    totalScore += metrics.stressLevel * weights.stressLevel
    totalWeight += weights.stressLevel
  }

  // Ajustes basados en métricas objetivas
  let objectiveAdjustment = 0

  if (metrics.performanceDecline !== undefined && metrics.performanceDecline > 10) {
    objectiveAdjustment += 1 // Aumentar fatiga si hay declive significativo
  }

  if (metrics.volumeCompletion !== undefined && metrics.volumeCompletion < 80) {
    objectiveAdjustment += 0.5 // Aumentar fatiga si no se completa el volumen
  }

  if (metrics.sleepDuration !== undefined && metrics.sleepDuration < 7) {
    objectiveAdjustment += 1 // Aumentar fatiga por sueño insuficiente
  }

  // Normalizar a escala 0-100
  const baseScore = totalWeight > 0 ? (totalScore / totalWeight) * 10 : 5
  const finalScore = Math.min(100, Math.max(0, (baseScore + objectiveAdjustment) * 10))

  return Math.round(finalScore)
}

/**
 * Categoriza el nivel de fatiga
 */
function categorizeFatigue(score: number): 'low' | 'moderate' | 'high' | 'severe' {
  if (score <= 25) return 'low'
  if (score <= 50) return 'moderate'
  if (score <= 75) return 'high'
  return 'severe'
}

/**
 * Genera recomendación básica de recuperación
 */
function generateBasicRecoveryRecommendation(category: string): string {
  switch (category) {
    case 'low':
      return 'Continúa con tu plan de entrenamiento normal. Mantén buenos hábitos de sueño y nutrición.'
    case 'moderate':
      return 'Considera reducir la intensidad del entrenamiento. Prioriza el sueño y la hidratación.'
    case 'high':
      return 'Reduce significativamente el volumen e intensidad. Enfócate en recuperación activa.'
    case 'severe':
      return 'Toma un día de descanso completo. Evalúa factores de estrés y considera consultar un profesional.'
    default:
      return 'Monitorea tu estado y ajusta el entrenamiento según sea necesario.'
  }
}

/**
 * Obtiene las métricas de fatiga más recientes del usuario
 */
export async function getRecentFatigueMetrics(userId: string, days: number = 7): Promise<FatigueMetrics[]> {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('fatigue_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching fatigue metrics:', error)
      return []
    }

    return data.map(row => ({
      userId: row.user_id,
      date: row.date,
      perceivedFatigue: row.perceived_fatigue,
      sleepQuality: row.sleep_quality,
      mood: row.mood,
      motivation: row.motivation,
      energyLevel: row.energy_level,
      musclesSoreness: row.muscles_soreness,
      stressLevel: row.stress_level,
      restingHeartRate: row.resting_heart_rate,
      heartRateVariability: row.heart_rate_variability,
      sleepDuration: row.sleep_duration,
      sleepEfficiency: row.sleep_efficiency,
      performanceDecline: row.performance_decline,
      volumeCompletion: row.volume_completion,
      intensityMaintained: row.intensity_maintained,
      workStress: row.work_stress,
      nutritionQuality: row.nutrition_quality,
      hydrationLevel: row.hydration_level,
      overallFatigueScore: row.overall_fatigue_score,
      fatigueCategory: row.fatigue_category,
      recoveryRecommendation: row.recovery_recommendation
    }))
  } catch (error) {
    console.error('Error in getRecentFatigueMetrics:', error)
    return []
  }
}

/**
 * Analiza las tendencias de fatiga del usuario
 */
export async function analyzeFatigueTrends(userId: string): Promise<FatigueTrend> {
  try {
    const recentMetrics = await getRecentFatigueMetrics(userId, 30) // Últimos 30 días

    if (recentMetrics.length === 0) {
      return {
        userId,
        period: 'monthly',
        trend: 'stable',
        averageFatigue: 50,
        peakFatigue: 50,
        recoveryRate: 3,
        riskLevel: 'low'
      }
    }

    // Calcular métricas
    const scores = recentMetrics.map(m => m.overallFatigueScore)
    const averageFatigue = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const peakFatigue = Math.max(...scores)

    // Analizar tendencia
    const recentAvg = scores.slice(0, 7).reduce((sum, score) => sum + score, 0) / Math.min(7, scores.length)
    const olderAvg = scores.slice(7, 14).reduce((sum, score) => sum + score, 0) / Math.min(7, scores.slice(7).length)
    
    let trend: 'improving' | 'stable' | 'worsening' = 'stable'
    if (recentAvg > olderAvg + 10) trend = 'worsening'
    else if (recentAvg < olderAvg - 10) trend = 'improving'

    // Calcular tasa de recuperación
    const recoveryRate = calculateRecoveryRate(recentMetrics)

    // Determinar nivel de riesgo
    const riskLevel = determineRiskLevel(averageFatigue, peakFatigue, trend)

    return {
      userId,
      period: 'monthly',
      trend,
      averageFatigue: Math.round(averageFatigue),
      peakFatigue,
      recoveryRate,
      riskLevel
    }
  } catch (error) {
    console.error('Error analyzing fatigue trends:', error)
    throw error
  }
}

/**
 * Calcula la tasa de recuperación promedio
 */
function calculateRecoveryRate(metrics: FatigueMetrics[]): number {
  // Buscar picos de fatiga y medir tiempo de recuperación
  const recoveryTimes: number[] = []
  
  for (let i = 0; i < metrics.length - 1; i++) {
    if (metrics[i].overallFatigueScore > 70) { // Pico de fatiga
      // Buscar cuándo vuelve a niveles normales
      for (let j = i + 1; j < metrics.length; j++) {
        if (metrics[j].overallFatigueScore < 50) {
          recoveryTimes.push(j - i)
          break
        }
      }
    }
  }

  return recoveryTimes.length > 0 
    ? recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length
    : 3 // Default 3 días
}

/**
 * Determina el nivel de riesgo basado en métricas
 */
function determineRiskLevel(avgFatigue: number, peakFatigue: number, trend: string): 'low' | 'moderate' | 'high' | 'critical' {
  if (peakFatigue > 85 || (avgFatigue > 70 && trend === 'worsening')) {
    return 'critical'
  }
  if (avgFatigue > 60 || trend === 'worsening') {
    return 'high'
  }
  if (avgFatigue > 40 || peakFatigue > 70) {
    return 'moderate'
  }
  return 'low'
}

/**
 * Genera recomendaciones avanzadas de recuperación
 */
export async function generateAdvancedRecoveryRecommendations(userId: string): Promise<RecoveryRecommendation[]> {
  try {
    const [recentMetrics, trends, profile] = await Promise.all([
      getRecentFatigueMetrics(userId, 7),
      analyzeFatigueTrends(userId),
      getUserAdaptiveProfile(userId)
    ])

    const recommendations: RecoveryRecommendation[] = []

    if (recentMetrics.length === 0) return recommendations

    const latestMetrics = recentMetrics[0]
    const avgSleepQuality = recentMetrics.reduce((sum, m) => sum + m.sleepQuality, 0) / recentMetrics.length

    // Recomendación de descanso
    if (latestMetrics.overallFatigueScore > 75) {
      recommendations.push({
        id: 'rest_day_critical',
        type: 'rest_day',
        priority: 'critical',
        title: 'Día de Descanso Inmediato',
        description: 'Tu nivel de fatiga es muy alto. Es crucial tomar un descanso completo.',
        actionItems: [
          'Cancela el entrenamiento de hoy',
          'Enfócate en hidratación y nutrición',
          'Considera una siesta de 20-30 minutos',
          'Practica técnicas de relajación'
        ],
        expectedBenefit: 'Reducción significativa de fatiga en 24-48 horas',
        timeframe: '1-2 días',
        confidence: 0.9
      })
    }

    // Recomendación de sueño
    if (avgSleepQuality < 6) {
      recommendations.push({
        id: 'sleep_optimization',
        type: 'sleep_optimization',
        priority: 'high',
        title: 'Optimización del Sueño',
        description: 'Tu calidad de sueño está afectando tu recuperación.',
        actionItems: [
          'Establece una rutina de sueño consistente',
          'Evita pantallas 1 hora antes de dormir',
          'Mantén el dormitorio fresco y oscuro',
          'Considera suplementos de magnesio'
        ],
        expectedBenefit: 'Mejora en energía y reducción de fatiga',
        timeframe: '3-7 días',
        confidence: 0.85
      })
    }

    // Recomendación de deload
    if (trends.trend === 'worsening' && trends.averageFatigue > 60) {
      recommendations.push({
        id: 'deload_week',
        type: 'deload_week',
        priority: 'high',
        title: 'Semana de Descarga',
        description: 'Tu fatiga ha estado aumentando. Una semana de descarga te ayudará.',
        actionItems: [
          'Reduce el volumen de entrenamiento en 40%',
          'Mantén la intensidad pero con menos series',
          'Incluye más trabajo de movilidad',
          'Enfócate en técnica y conexión mente-músculo'
        ],
        expectedBenefit: 'Recuperación completa y preparación para nueva progresión',
        timeframe: '1 semana',
        confidence: 0.8
      })
    }

    // Recomendación de manejo de estrés
    if (latestMetrics.stressLevel > 7) {
      recommendations.push({
        id: 'stress_management',
        type: 'stress_management',
        priority: 'medium',
        title: 'Manejo del Estrés',
        description: 'Los altos niveles de estrés están impactando tu recuperación.',
        actionItems: [
          'Practica meditación diaria (10-15 minutos)',
          'Incluye caminatas al aire libre',
          'Considera yoga o tai chi',
          'Evalúa y reduce factores de estrés'
        ],
        expectedBenefit: 'Mejor calidad de sueño y reducción de fatiga',
        timeframe: '1-2 semanas',
        confidence: 0.75
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  } catch (error) {
    console.error('Error generating recovery recommendations:', error)
    return []
  }
}

/**
 * Determina si el usuario necesita un día de descanso
 */
export async function shouldTakeRestDay(userId: string): Promise<{
  shouldRest: boolean
  reason: string
  confidence: number
}> {
  try {
    const recentMetrics = await getRecentFatigueMetrics(userId, 3)
    
    if (recentMetrics.length === 0) {
      return {
        shouldRest: false,
        reason: 'Datos insuficientes para evaluación',
        confidence: 0.3
      }
    }

    const latestMetrics = recentMetrics[0]
    const avgFatigue = recentMetrics.reduce((sum, m) => sum + m.overallFatigueScore, 0) / recentMetrics.length

    // Criterios para día de descanso
    if (latestMetrics.overallFatigueScore > 80) {
      return {
        shouldRest: true,
        reason: 'Fatiga extrema detectada',
        confidence: 0.95
      }
    }

    if (avgFatigue > 70 && latestMetrics.sleepQuality < 5) {
      return {
        shouldRest: true,
        reason: 'Combinación de alta fatiga y mal sueño',
        confidence: 0.85
      }
    }

    if (latestMetrics.volumeCompletion < 70 && latestMetrics.intensityMaintained < 80) {
      return {
        shouldRest: true,
        reason: 'Declive significativo en rendimiento',
        confidence: 0.8
      }
    }

    return {
      shouldRest: false,
      reason: 'Niveles de fatiga dentro de rangos normales',
      confidence: 0.7
    }
  } catch (error) {
    console.error('Error in shouldTakeRestDay:', error)
    return {
      shouldRest: false,
      reason: 'Error en evaluación',
      confidence: 0.1
    }
  }
}
