import { supabase } from "@/lib/supabase-client"
import { handleSupabaseError } from "@/lib/utils/error-handler"

// ===== TIPOS PARA RIR TRACKING =====

export interface RiREntry {
  id: string
  user_id: string
  exercise_id: string
  exercise_name: string
  set_number: number
  reps_performed: number
  weight_used: number
  rir_reported: number
  rir_target: number
  rpe_calculated: number
  session_id: string
  date: string
  notes?: string
}

export interface RiRProgression {
  exercise_id: string
  exercise_name: string
  week: number
  target_rir: number
  average_rir_achieved: number
  consistency_score: number
  progression_status: 'on_track' | 'ahead' | 'behind' | 'inconsistent'
  recommended_adjustment: string
}

export interface AutoregulationRecommendation {
  exercise_id: string
  exercise_name: string
  current_weight: number
  recommended_weight: number
  recommended_reps: string
  target_rir: number
  reasoning: string
  confidence: number
  adjustment_type: 'increase_weight' | 'increase_reps' | 'maintain' | 'decrease_load' | 'deload'
}

export interface RiRAnalytics {
  user_id: string
  period_weeks: number
  average_rir_accuracy: number
  consistency_score: number
  progression_rate: number
  fatigue_indicators: {
    declining_performance: boolean
    increasing_rir_gap: boolean
    reduced_consistency: boolean
  }
  recommendations: string[]
}

// ===== SERVICIO DE RIR TRACKING =====

export class RiRTrackingService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Registrar entrada de RiR
   */
  async recordRiREntry(
    exerciseId: string,
    exerciseName: string,
    setNumber: number,
    repsPerformed: number,
    weightUsed: number,
    rirReported: number,
    rirTarget: number,
    sessionId: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const rpeCalculated = this.calculateRPE(rirReported)

      const entryData = {
        user_id: this.userId,
        exercise_id: exerciseId,
        exercise_name: exerciseName,
        set_number: setNumber,
        reps_performed: repsPerformed,
        weight_used: weightUsed,
        rir_reported: rirReported,
        rir_target: rirTarget,
        rpe_calculated: rpeCalculated,
        session_id: sessionId,
        date: new Date().toISOString(),
        notes
      }

      const { error } = await supabase
        .from('rir_entries')
        .insert(entryData)

      if (error) {
        handleSupabaseError(error, { context: 'Registrar RiR', showToast: true })
        return false
      }

      return true

    } catch (error) {
      console.error('Error al registrar RiR:', error)
      return false
    }
  }

  /**
   * Calcular RPE basado en RiR
   */
  private calculateRPE(rir: number): number {
    // RPE = 10 - RiR
    return Math.max(1, Math.min(10, 10 - rir))
  }

  /**
   * Obtener progresión de RiR para un ejercicio
   */
  async getRiRProgression(exerciseId: string, weeks: number = 4): Promise<RiRProgression | null> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - (weeks * 7))

      const { data, error } = await supabase
        .from('rir_entries')
        .select('*')
        .eq('user_id', this.userId)
        .eq('exercise_id', exerciseId)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true })

      if (error) {
        handleSupabaseError(error, { context: 'Obtener progresión RiR', showToast: false })
        return null
      }

      if (!data || data.length === 0) return null

      return this.analyzeRiRProgression(data as RiREntry[], weeks)

    } catch (error) {
      console.error('Error al obtener progresión RiR:', error)
      return null
    }
  }

  /**
   * Analizar progresión de RiR
   */
  private analyzeRiRProgression(entries: RiREntry[], weeks: number): RiRProgression {
    const exerciseId = entries[0].exercise_id
    const exerciseName = entries[0].exercise_name

    // Calcular RiR promedio por semana
    const weeklyData = this.groupEntriesByWeek(entries)
    const currentWeek = this.getCurrentWeekNumber()

    // Calcular métricas
    const averageRiRTarget = this.calculateAverage(entries.map(e => e.rir_target))
    const averageRiRAchieved = this.calculateAverage(entries.map(e => e.rir_reported))
    const consistencyScore = this.calculateConsistencyScore(entries)
    const progressionStatus = this.determineProgressionStatus(entries, averageRiRTarget)

    return {
      exercise_id: exerciseId,
      exercise_name: exerciseName,
      week: currentWeek,
      target_rir: averageRiRTarget,
      average_rir_achieved: averageRiRAchieved,
      consistency_score: consistencyScore,
      progression_status: progressionStatus,
      recommended_adjustment: this.generateProgressionRecommendation(progressionStatus, averageRiRTarget, averageRiRAchieved)
    }
  }

  /**
   * Agrupar entradas por semana
   */
  private groupEntriesByWeek(entries: RiREntry[]): { [week: number]: RiREntry[] } {
    const grouped: { [week: number]: RiREntry[] } = {}

    entries.forEach(entry => {
      const week = this.getWeekNumber(new Date(entry.date))
      if (!grouped[week]) grouped[week] = []
      grouped[week].push(entry)
    })

    return grouped
  }

  /**
   * Calcular puntuación de consistencia
   */
  private calculateConsistencyScore(entries: RiREntry[]): number {
    if (entries.length === 0) return 0

    const deviations = entries.map(entry => 
      Math.abs(entry.rir_reported - entry.rir_target)
    )

    const averageDeviation = this.calculateAverage(deviations)
    
    // Convertir a puntuación de 0-100 (menor desviación = mayor puntuación)
    return Math.max(0, 100 - (averageDeviation * 25))
  }

  /**
   * Determinar estado de progresión
   */
  private determineProgressionStatus(
    entries: RiREntry[], 
    targetRiR: number
  ): 'on_track' | 'ahead' | 'behind' | 'inconsistent' {
    const recentEntries = entries.slice(-6) // Últimas 6 entradas
    const averageAchieved = this.calculateAverage(recentEntries.map(e => e.rir_reported))
    const deviation = Math.abs(averageAchieved - targetRiR)

    if (deviation <= 0.5) return 'on_track'
    if (averageAchieved < targetRiR - 0.5) return 'ahead' // Menos RiR = más intenso
    if (averageAchieved > targetRiR + 0.5) return 'behind' // Más RiR = menos intenso
    return 'inconsistent'
  }

  /**
   * Generar recomendación de progresión
   */
  private generateProgressionRecommendation(
    status: string, 
    targetRiR: number, 
    achievedRiR: number
  ): string {
    switch (status) {
      case 'on_track':
        return 'Progresión excelente. Mantener carga actual y continuar con el plan.'
      case 'ahead':
        return `Intensidad superior al objetivo (RiR ${achievedRiR.toFixed(1)} vs ${targetRiR}). Considerar incrementar carga.`
      case 'behind':
        return `Intensidad inferior al objetivo (RiR ${achievedRiR.toFixed(1)} vs ${targetRiR}). Revisar técnica o reducir carga.`
      case 'inconsistent':
        return 'Resultados inconsistentes. Enfocarse en mejorar percepción del esfuerzo.'
      default:
        return 'Continuar monitoreando progresión.'
    }
  }

  /**
   * Generar recomendaciones de autorregulación
   */
  async generateAutoregulationRecommendations(exerciseIds: string[]): Promise<AutoregulationRecommendation[]> {
    try {
      const recommendations: AutoregulationRecommendation[] = []

      for (const exerciseId of exerciseIds) {
        const progression = await this.getRiRProgression(exerciseId, 2)
        if (!progression) continue

        const lastEntries = await this.getLastEntriesForExercise(exerciseId, 3)
        if (lastEntries.length === 0) continue

        const recommendation = this.generateExerciseRecommendation(progression, lastEntries)
        recommendations.push(recommendation)
      }

      return recommendations

    } catch (error) {
      console.error('Error al generar recomendaciones de autorregulación:', error)
      return []
    }
  }

  /**
   * Obtener últimas entradas para un ejercicio
   */
  private async getLastEntriesForExercise(exerciseId: string, count: number): Promise<RiREntry[]> {
    try {
      const { data, error } = await supabase
        .from('rir_entries')
        .select('*')
        .eq('user_id', this.userId)
        .eq('exercise_id', exerciseId)
        .order('date', { ascending: false })
        .limit(count)

      if (error) {
        handleSupabaseError(error, { context: 'Obtener últimas entradas RiR', showToast: false })
        return []
      }

      return (data as RiREntry[]) || []

    } catch (error) {
      console.error('Error al obtener últimas entradas:', error)
      return []
    }
  }

  /**
   * Generar recomendación para ejercicio específico
   */
  private generateExerciseRecommendation(
    progression: RiRProgression, 
    lastEntries: RiREntry[]
  ): AutoregulationRecommendation {
    const lastEntry = lastEntries[0]
    const currentWeight = lastEntry.weight_used
    const currentReps = lastEntry.reps_performed
    const targetRiR = progression.target_rir
    const achievedRiR = progression.average_rir_achieved

    let recommendedWeight = currentWeight
    let recommendedReps = currentReps.toString()
    let adjustmentType: AutoregulationRecommendation['adjustment_type'] = 'maintain'
    let reasoning = ''
    let confidence = 0.8

    const rirDifference = achievedRiR - targetRiR

    if (Math.abs(rirDifference) <= 0.5) {
      // En objetivo
      adjustmentType = 'maintain'
      reasoning = 'RiR en objetivo. Mantener carga actual.'
      confidence = 0.9
    } else if (rirDifference < -0.5) {
      // Muy intenso (RiR menor al objetivo)
      if (progression.consistency_score > 80) {
        recommendedWeight = currentWeight * 1.025 // Incremento 2.5%
        adjustmentType = 'increase_weight'
        reasoning = 'Consistentemente por debajo del RiR objetivo. Incrementar carga.'
        confidence = 0.85
      } else {
        adjustmentType = 'maintain'
        reasoning = 'RiR bajo pero inconsistente. Mejorar percepción antes de incrementar.'
        confidence = 0.6
      }
    } else if (rirDifference > 0.5) {
      // Poco intenso (RiR mayor al objetivo)
      if (progression.consistency_score > 70) {
        recommendedWeight = currentWeight * 0.975 // Reducción 2.5%
        adjustmentType = 'decrease_load'
        reasoning = 'RiR consistentemente alto. Reducir carga para alcanzar intensidad objetivo.'
        confidence = 0.8
      } else {
        adjustmentType = 'maintain'
        reasoning = 'RiR alto e inconsistente. Enfocarse en técnica y percepción.'
        confidence = 0.6
      }
    }

    // Verificar fatiga acumulada
    if (this.detectFatiguePattern(lastEntries)) {
      adjustmentType = 'deload'
      recommendedWeight = currentWeight * 0.9
      reasoning = 'Patrón de fatiga detectado. Deload recomendado.'
      confidence = 0.9
    }

    return {
      exercise_id: progression.exercise_id,
      exercise_name: progression.exercise_name,
      current_weight: currentWeight,
      recommended_weight: recommendedWeight,
      recommended_reps: recommendedReps,
      target_rir: targetRiR,
      reasoning,
      confidence,
      adjustment_type: adjustmentType
    }
  }

  /**
   * Detectar patrón de fatiga
   */
  private detectFatiguePattern(entries: RiREntry[]): boolean {
    if (entries.length < 3) return false

    // Verificar si RiR ha aumentado consistentemente (indicando fatiga)
    const rirTrend = entries.map(e => e.rir_reported)
    let increasingTrend = 0

    for (let i = 1; i < rirTrend.length; i++) {
      if (rirTrend[i] > rirTrend[i-1]) increasingTrend++
    }

    return increasingTrend >= rirTrend.length - 1
  }

  /**
   * Obtener analíticas de RiR
   */
  async getRiRAnalytics(weeks: number = 4): Promise<RiRAnalytics | null> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - (weeks * 7))

      const { data, error } = await supabase
        .from('rir_entries')
        .select('*')
        .eq('user_id', this.userId)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true })

      if (error) {
        handleSupabaseError(error, { context: 'Obtener analíticas RiR', showToast: false })
        return null
      }

      if (!data || data.length === 0) return null

      return this.calculateRiRAnalytics(data as RiREntry[], weeks)

    } catch (error) {
      console.error('Error al obtener analíticas RiR:', error)
      return null
    }
  }

  /**
   * Calcular analíticas de RiR
   */
  private calculateRiRAnalytics(entries: RiREntry[], weeks: number): RiRAnalytics {
    const accuracyScores = entries.map(e => 
      Math.max(0, 100 - (Math.abs(e.rir_reported - e.rir_target) * 25))
    )

    const averageAccuracy = this.calculateAverage(accuracyScores)
    const consistencyScore = this.calculateConsistencyScore(entries)
    const progressionRate = this.calculateProgressionRate(entries)

    const fatigueIndicators = {
      declining_performance: this.detectDecliningPerformance(entries),
      increasing_rir_gap: this.detectIncreasingRiRGap(entries),
      reduced_consistency: consistencyScore < 70
    }

    const recommendations = this.generateAnalyticsRecommendations(
      averageAccuracy, 
      consistencyScore, 
      fatigueIndicators
    )

    return {
      user_id: this.userId,
      period_weeks: weeks,
      average_rir_accuracy: averageAccuracy,
      consistency_score: consistencyScore,
      progression_rate: progressionRate,
      fatigue_indicators: fatigueIndicators,
      recommendations
    }
  }

  /**
   * Detectar rendimiento declinante
   */
  private detectDecliningPerformance(entries: RiREntry[]): boolean {
    if (entries.length < 6) return false

    const recentEntries = entries.slice(-6)
    const weights = recentEntries.map(e => e.weight_used)
    
    let decliningCount = 0
    for (let i = 1; i < weights.length; i++) {
      if (weights[i] < weights[i-1]) decliningCount++
    }

    return decliningCount >= 3
  }

  /**
   * Detectar brecha creciente de RiR
   */
  private detectIncreasingRiRGap(entries: RiREntry[]): boolean {
    if (entries.length < 6) return false

    const recentEntries = entries.slice(-6)
    const gaps = recentEntries.map(e => Math.abs(e.rir_reported - e.rir_target))
    
    const firstHalf = gaps.slice(0, 3)
    const secondHalf = gaps.slice(3)

    return this.calculateAverage(secondHalf) > this.calculateAverage(firstHalf) + 0.5
  }

  /**
   * Calcular tasa de progresión
   */
  private calculateProgressionRate(entries: RiREntry[]): number {
    if (entries.length < 4) return 0

    const weights = entries.map(e => e.weight_used)
    const firstQuarter = weights.slice(0, Math.floor(weights.length / 4))
    const lastQuarter = weights.slice(-Math.floor(weights.length / 4))

    const firstAverage = this.calculateAverage(firstQuarter)
    const lastAverage = this.calculateAverage(lastQuarter)

    return ((lastAverage - firstAverage) / firstAverage) * 100
  }

  /**
   * Generar recomendaciones basadas en analíticas
   */
  private generateAnalyticsRecommendations(
    accuracy: number, 
    consistency: number, 
    fatigue: any
  ): string[] {
    const recommendations: string[] = []

    if (accuracy < 70) {
      recommendations.push('Mejorar percepción del esfuerzo con práctica y educación en RiR')
    }

    if (consistency < 70) {
      recommendations.push('Enfocarse en consistencia antes de progresión de carga')
    }

    if (fatigue.declining_performance) {
      recommendations.push('Considerar período de deload debido a rendimiento declinante')
    }

    if (fatigue.increasing_rir_gap) {
      recommendations.push('Revisar técnica y factores de recuperación')
    }

    if (fatigue.reduced_consistency) {
      recommendations.push('Implementar estrategias de manejo de fatiga')
    }

    if (recommendations.length === 0) {
      recommendations.push('Excelente progresión. Continuar con el plan actual.')
    }

    return recommendations
  }

  /**
   * Utilidades
   */
  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  }

  private getCurrentWeekNumber(): number {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
  }

  private getWeekNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
  }
}

export default RiRTrackingService
