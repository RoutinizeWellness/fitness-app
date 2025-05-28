/**
 * Progressive Overload Calculator - Calculadora de Sobrecarga Progresiva
 * 
 * Sistema inteligente para calcular automáticamente la progresión de:
 * - Peso/Resistencia
 * - Repeticiones
 * - Series
 * - Densidad (tiempo de descanso)
 * - Volumen total
 */

import { supabase } from './supabase-client'
import { ExerciseSet, WorkoutSession, Exercise } from './types/training'
import { getUserAdaptiveProfile } from './adaptive-routine-engine'

export interface ProgressionData {
  exerciseId: string
  userId: string
  currentWeight: number
  currentReps: number
  currentSets: number
  currentRir: number
  lastPerformance: ExercisePerformance[]
  progressionHistory: ProgressionEntry[]
  strengthCurve: StrengthPoint[]
}

export interface ExercisePerformance {
  date: string
  weight: number
  reps: number
  sets: number
  rir: number
  rpe: number
  notes?: string
  completionRate: number // 0-1
}

export interface ProgressionEntry {
  date: string
  type: 'weight' | 'reps' | 'sets' | 'density'
  previousValue: number
  newValue: number
  reason: string
  success: boolean
  adaptationPeriod: number // days to adapt
}

export interface StrengthPoint {
  date: string
  estimatedMax: number
  confidence: number
  method: 'calculated' | 'tested' | 'extrapolated'
}

export interface ProgressionRecommendation {
  type: 'increase_weight' | 'increase_reps' | 'increase_sets' | 'decrease_rest' | 'maintain' | 'deload'
  value: number
  confidence: number
  reasoning: string[]
  expectedOutcome: string
  timeframe: string
  riskLevel: 'low' | 'moderate' | 'high'
  alternatives?: ProgressionRecommendation[]
}

/**
 * Calcula la progresión recomendada para un ejercicio específico
 */
export async function calculateProgressiveOverload(
  userId: string,
  exerciseId: string,
  currentSet: ExerciseSet
): Promise<ProgressionRecommendation> {
  try {
    // Obtener datos de progresión histórica
    const progressionData = await getProgressionData(userId, exerciseId)
    
    // Obtener perfil adaptativo del usuario
    const profile = await getUserAdaptiveProfile(userId)
    
    if (!profile || !progressionData) {
      return getDefaultProgression(currentSet, 'beginner')
    }

    // Analizar rendimiento reciente
    const recentPerformance = analyzeRecentPerformance(progressionData.lastPerformance)
    
    // Calcular recomendación basada en múltiples factores
    const recommendation = await generateProgressionRecommendation(
      progressionData,
      recentPerformance,
      profile,
      currentSet
    )

    return recommendation
  } catch (error) {
    console.error('Error calculating progressive overload:', error)
    return getDefaultProgression(currentSet, 'intermediate')
  }
}

/**
 * Obtiene los datos de progresión histórica para un ejercicio
 */
async function getProgressionData(userId: string, exerciseId: string): Promise<ProgressionData | null> {
  try {
    // Obtener historial de entrenamientos
    const { data: workoutHistory, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        exercise_logs (
          exercise_id,
          sets_data,
          performance_metrics,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching workout history:', error)
      return null
    }

    // Filtrar y procesar datos del ejercicio específico
    const exercisePerformances: ExercisePerformance[] = []
    const progressionEntries: ProgressionEntry[] = []

    for (const session of workoutHistory || []) {
      const exerciseLog = session.exercise_logs?.find((log: any) => log.exercise_id === exerciseId)
      if (exerciseLog && exerciseLog.sets_data) {
        const setsData = exerciseLog.sets_data
        const avgWeight = setsData.reduce((sum: number, set: any) => sum + (set.weight || 0), 0) / setsData.length
        const avgReps = setsData.reduce((sum: number, set: any) => sum + (set.reps || 0), 0) / setsData.length
        const avgRir = setsData.reduce((sum: number, set: any) => sum + (set.rir || 3), 0) / setsData.length

        exercisePerformances.push({
          date: session.created_at,
          weight: avgWeight,
          reps: avgReps,
          sets: setsData.length,
          rir: avgRir,
          rpe: 10 - avgRir,
          completionRate: exerciseLog.performance_metrics?.completion_rate || 1
        })
      }
    }

    // Calcular curva de fuerza
    const strengthCurve = calculateStrengthCurve(exercisePerformances)

    return {
      exerciseId,
      userId,
      currentWeight: exercisePerformances[0]?.weight || 0,
      currentReps: exercisePerformances[0]?.reps || 0,
      currentSets: exercisePerformances[0]?.sets || 0,
      currentRir: exercisePerformances[0]?.rir || 3,
      lastPerformance: exercisePerformances.slice(0, 5),
      progressionHistory: progressionEntries,
      strengthCurve
    }
  } catch (error) {
    console.error('Error getting progression data:', error)
    return null
  }
}

/**
 * Calcula la curva de fuerza basada en el historial de rendimiento
 */
function calculateStrengthCurve(performances: ExercisePerformance[]): StrengthPoint[] {
  return performances.map(perf => {
    // Fórmula de Epley para estimar 1RM
    const estimatedMax = perf.weight * (1 + perf.reps / 30)
    
    return {
      date: perf.date,
      estimatedMax,
      confidence: perf.completionRate * 0.9, // Ajustar confianza basada en completitud
      method: 'calculated'
    }
  })
}

/**
 * Analiza el rendimiento reciente para identificar tendencias
 */
function analyzeRecentPerformance(performances: ExercisePerformance[]) {
  if (performances.length < 2) {
    return {
      trend: 'insufficient_data',
      consistency: 0.5,
      readinessForProgression: 0.5,
      fatigueIndicators: []
    }
  }

  // Analizar tendencia de peso
  const weightTrend = calculateTrend(performances.map(p => p.weight))
  const repsTrend = calculateTrend(performances.map(p => p.reps))
  const rirTrend = calculateTrend(performances.map(p => p.rir))

  // Calcular consistencia (variabilidad en el rendimiento)
  const weightCV = calculateCoefficientOfVariation(performances.map(p => p.weight))
  const consistency = Math.max(0, 1 - weightCV)

  // Indicadores de fatiga
  const fatigueIndicators = []
  if (rirTrend > 0.5) fatigueIndicators.push('increasing_rir')
  if (performances[0].completionRate < 0.9) fatigueIndicators.push('incomplete_sets')
  if (repsTrend < -0.3) fatigueIndicators.push('declining_reps')

  // Preparación para progresión
  const readinessForProgression = calculateReadiness(performances, fatigueIndicators)

  return {
    trend: weightTrend > 0.2 ? 'improving' : weightTrend < -0.2 ? 'declining' : 'stable',
    consistency,
    readinessForProgression,
    fatigueIndicators
  }
}

/**
 * Calcula la tendencia de una serie de valores (-1 a 1)
 */
function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0

  const n = values.length
  const sumX = (n * (n - 1)) / 2
  const sumY = values.reduce((sum, val) => sum + val, 0)
  const sumXY = values.reduce((sum, val, index) => sum + val * index, 0)
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const avgY = sumY / n

  // Normalizar la pendiente como porcentaje del valor promedio
  return avgY !== 0 ? slope / avgY : 0
}

/**
 * Calcula el coeficiente de variación
 */
function calculateCoefficientOfVariation(values: number[]): number {
  if (values.length === 0) return 1

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)

  return mean !== 0 ? stdDev / mean : 1
}

/**
 * Calcula la preparación para progresión
 */
function calculateReadiness(performances: ExercisePerformance[], fatigueIndicators: string[]): number {
  let readiness = 0.7 // Base readiness

  // Ajustar basado en RIR promedio
  const avgRir = performances.reduce((sum, p) => sum + p.rir, 0) / performances.length
  if (avgRir >= 3) readiness += 0.2
  else if (avgRir <= 1) readiness -= 0.3

  // Ajustar basado en tasa de completitud
  const avgCompletion = performances.reduce((sum, p) => sum + p.completionRate, 0) / performances.length
  readiness += (avgCompletion - 0.8) * 0.5

  // Penalizar por indicadores de fatiga
  readiness -= fatigueIndicators.length * 0.1

  return Math.max(0, Math.min(1, readiness))
}

/**
 * Genera la recomendación de progresión
 */
async function generateProgressionRecommendation(
  data: ProgressionData,
  analysis: any,
  profile: any,
  currentSet: ExerciseSet
): Promise<ProgressionRecommendation> {
  const { experienceLevel, progressionPreferences } = profile
  const { readinessForProgression, fatigueIndicators, trend } = analysis

  // Determinar tipo de progresión basado en preparación y experiencia
  if (readinessForProgression < 0.4 || fatigueIndicators.length >= 2) {
    return {
      type: 'maintain',
      value: 0,
      confidence: 0.8,
      reasoning: [
        'Indicadores de fatiga detectados',
        'Rendimiento inconsistente reciente',
        'Necesidad de consolidación'
      ],
      expectedOutcome: 'Consolidación de adaptaciones actuales',
      timeframe: '1-2 semanas',
      riskLevel: 'low'
    }
  }

  if (readinessForProgression < 0.3) {
    return {
      type: 'deload',
      value: -0.1, // 10% reduction
      confidence: 0.9,
      reasoning: [
        'Fatiga acumulada significativa',
        'Declive en rendimiento',
        'Necesidad de recuperación activa'
      ],
      expectedOutcome: 'Recuperación y preparación para nueva progresión',
      timeframe: '1 semana',
      riskLevel: 'low'
    }
  }

  // Progresión normal
  const weightIncrement = getWeightIncrement(profile, data.exerciseId)
  
  if (readinessForProgression >= 0.7 && analysis.trend !== 'declining') {
    return {
      type: 'increase_weight',
      value: weightIncrement,
      confidence: Math.min(0.9, readinessForProgression + 0.1),
      reasoning: [
        `RIR promedio permite progresión (${data.currentRir.toFixed(1)})`,
        'Rendimiento consistente en sesiones recientes',
        'Sin indicadores significativos de fatiga'
      ],
      expectedOutcome: `Aumento de fuerza y adaptación neuromuscular`,
      timeframe: '1-2 semanas',
      riskLevel: 'low',
      alternatives: [
        {
          type: 'increase_reps',
          value: 1,
          confidence: 0.7,
          reasoning: ['Alternativa más conservadora', 'Enfoque en resistencia muscular'],
          expectedOutcome: 'Mejora en resistencia muscular',
          timeframe: '1-2 semanas',
          riskLevel: 'low'
        }
      ]
    }
  }

  // Progresión conservadora
  return {
    type: 'increase_reps',
    value: 1,
    confidence: 0.6,
    reasoning: [
      'Progresión conservadora recomendada',
      'Consolidación antes de aumentar peso',
      'Mejora de resistencia muscular'
    ],
    expectedOutcome: 'Mejora gradual en capacidad de trabajo',
    timeframe: '2-3 semanas',
    riskLevel: 'low'
  }
}

/**
 * Obtiene el incremento de peso recomendado basado en el ejercicio y perfil
 */
function getWeightIncrement(profile: any, exerciseId: string): number {
  const baseIncrement = profile.progressionPreferences?.weightIncrement || 2.5

  // Ajustar basado en tipo de ejercicio
  // TODO: Obtener información del ejercicio desde la base de datos
  // Por ahora, usar incrementos estándar
  
  const experienceMultipliers = {
    beginner: 1.2,
    intermediate: 1.0,
    advanced: 0.8,
    expert: 0.6
  }

  const multiplier = experienceMultipliers[profile.experienceLevel] || 1.0
  return baseIncrement * multiplier
}

/**
 * Obtiene una progresión por defecto cuando no hay datos suficientes
 */
function getDefaultProgression(currentSet: ExerciseSet, level: string): ProgressionRecommendation {
  const increments = {
    beginner: 2.5,
    intermediate: 2.5,
    advanced: 1.25,
    expert: 1.25
  }

  return {
    type: 'increase_weight',
    value: increments[level as keyof typeof increments] || 2.5,
    confidence: 0.5,
    reasoning: [
      'Progresión estándar para nivel de experiencia',
      'Datos insuficientes para análisis personalizado'
    ],
    expectedOutcome: 'Progresión gradual estándar',
    timeframe: '1-2 semanas',
    riskLevel: 'low'
  }
}

/**
 * Aplica la progresión recomendada a un set de ejercicio
 */
export function applyProgression(
  currentSet: ExerciseSet,
  recommendation: ProgressionRecommendation
): ExerciseSet {
  const newSet = { ...currentSet }

  switch (recommendation.type) {
    case 'increase_weight':
      newSet.targetWeight = (newSet.targetWeight || 0) + recommendation.value
      break
    
    case 'increase_reps':
      newSet.targetReps = (newSet.targetReps || 0) + recommendation.value
      break
    
    case 'increase_sets':
      // Este caso se manejaría a nivel de ejercicio, no de set individual
      break
    
    case 'decrease_rest':
      newSet.restTime = Math.max(30, (newSet.restTime || 120) - recommendation.value)
      break
    
    case 'deload':
      newSet.targetWeight = Math.max(0, (newSet.targetWeight || 0) * (1 + recommendation.value))
      break
    
    case 'maintain':
    default:
      // No changes
      break
  }

  return newSet
}

/**
 * Registra una progresión aplicada para seguimiento futuro
 */
export async function recordProgression(
  userId: string,
  exerciseId: string,
  progression: ProgressionEntry
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('progression_history')
      .insert({
        user_id: userId,
        exercise_id: exerciseId,
        progression_type: progression.type,
        previous_value: progression.previousValue,
        new_value: progression.newValue,
        reason: progression.reason,
        success: progression.success,
        adaptation_period: progression.adaptationPeriod,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error recording progression:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in recordProgression:', error)
    return false
  }
}

/**
 * Calcula el volumen total de entrenamiento para un ejercicio
 */
export function calculateTrainingVolume(sets: ExerciseSet[]): number {
  return sets.reduce((total, set) => {
    const weight = set.actualWeight || set.targetWeight || 0
    const reps = set.actualReps || set.targetReps || 0
    return total + (weight * reps)
  }, 0)
}

/**
 * Estima el 1RM basado en peso y repeticiones
 */
export function estimate1RM(weight: number, reps: number, formula: 'epley' | 'brzycki' | 'lander' = 'epley'): number {
  switch (formula) {
    case 'epley':
      return weight * (1 + reps / 30)
    
    case 'brzycki':
      return weight * (36 / (37 - reps))
    
    case 'lander':
      return weight * (100 / (101.3 - 2.67123 * reps))
    
    default:
      return weight * (1 + reps / 30)
  }
}
