import { supabase } from "@/lib/supabase-client"
import { handleSupabaseError } from "@/lib/utils/error-handler"

// ===== TIPOS PARA VOLUME LANDMARKS =====

export interface VolumeLandmarks {
  muscle_group: string
  mev: number // Minimum Effective Volume
  mav: number // Maximum Adaptive Volume  
  mrv: number // Maximum Recoverable Volume
  current_weekly_sets: number
  status: 'below_mev' | 'optimal' | 'approaching_mrv' | 'above_mrv'
  recommendation: string
}

export interface MuscleGroupData {
  name: string
  spanish_name: string
  mev_beginner: number
  mev_intermediate: number
  mev_advanced: number
  mav_beginner: number
  mav_intermediate: number
  mav_advanced: number
  mrv_beginner: number
  mrv_intermediate: number
  mrv_advanced: number
  recovery_time_hours: number
}

export interface VolumeProgression {
  user_id: string
  muscle_group: string
  week: number
  sets_performed: number
  target_sets: number
  adaptation_response: 'positive' | 'neutral' | 'negative'
  fatigue_level: number
  notes: string
  created_at: string
}

export interface VolumeRecommendation {
  muscle_group: string
  current_volume: number
  recommended_volume: number
  adjustment_type: 'increase' | 'maintain' | 'decrease' | 'deload'
  reasoning: string
  confidence: number
  timeline_weeks: number
}

// ===== BASE DE DATOS DE VOLUME LANDMARKS =====

const MUSCLE_GROUP_DATA: MuscleGroupData[] = [
  {
    name: 'chest',
    spanish_name: 'Pecho',
    mev_beginner: 6, mev_intermediate: 8, mev_advanced: 10,
    mav_beginner: 14, mav_intermediate: 18, mav_advanced: 22,
    mrv_beginner: 18, mrv_intermediate: 22, mrv_advanced: 26,
    recovery_time_hours: 48
  },
  {
    name: 'back',
    spanish_name: 'Espalda',
    mev_beginner: 8, mev_intermediate: 10, mev_advanced: 12,
    mav_beginner: 16, mav_intermediate: 20, mav_advanced: 25,
    mrv_beginner: 20, mrv_intermediate: 25, mrv_advanced: 30,
    recovery_time_hours: 48
  },
  {
    name: 'shoulders',
    spanish_name: 'Hombros',
    mev_beginner: 6, mev_intermediate: 8, mev_advanced: 10,
    mav_beginner: 12, mav_intermediate: 16, mav_advanced: 20,
    mrv_beginner: 16, mrv_intermediate: 20, mrv_advanced: 24,
    recovery_time_hours: 36
  },
  {
    name: 'quadriceps',
    spanish_name: 'Cuádriceps',
    mev_beginner: 8, mev_intermediate: 10, mev_advanced: 12,
    mav_beginner: 16, mav_intermediate: 20, mav_advanced: 25,
    mrv_beginner: 20, mrv_intermediate: 25, mrv_advanced: 30,
    recovery_time_hours: 72
  },
  {
    name: 'hamstrings',
    spanish_name: 'Isquiotibiales',
    mev_beginner: 6, mev_intermediate: 8, mev_advanced: 10,
    mav_beginner: 12, mav_intermediate: 16, mav_advanced: 20,
    mrv_beginner: 16, mrv_intermediate: 20, mrv_advanced: 24,
    recovery_time_hours: 72
  },
  {
    name: 'glutes',
    spanish_name: 'Glúteos',
    mev_beginner: 6, mev_intermediate: 8, mev_advanced: 10,
    mav_beginner: 14, mav_intermediate: 18, mav_advanced: 22,
    mrv_beginner: 18, mrv_intermediate: 22, mrv_advanced: 26,
    recovery_time_hours: 48
  },
  {
    name: 'biceps',
    spanish_name: 'Bíceps',
    mev_beginner: 4, mev_intermediate: 6, mev_advanced: 8,
    mav_beginner: 10, mav_intermediate: 14, mav_advanced: 18,
    mrv_beginner: 14, mrv_intermediate: 18, mrv_advanced: 22,
    recovery_time_hours: 36
  },
  {
    name: 'triceps',
    spanish_name: 'Tríceps',
    mev_beginner: 4, mev_intermediate: 6, mev_advanced: 8,
    mav_beginner: 10, mav_intermediate: 14, mav_advanced: 18,
    mrv_beginner: 14, mrv_intermediate: 18, mrv_advanced: 22,
    recovery_time_hours: 36
  },
  {
    name: 'calves',
    spanish_name: 'Pantorrillas',
    mev_beginner: 6, mev_intermediate: 8, mev_advanced: 10,
    mav_beginner: 12, mav_intermediate: 16, mav_advanced: 20,
    mrv_beginner: 16, mrv_intermediate: 20, mrv_advanced: 24,
    recovery_time_hours: 24
  },
  {
    name: 'abs',
    spanish_name: 'Abdominales',
    mev_beginner: 6, mev_intermediate: 8, mev_advanced: 10,
    mav_beginner: 12, mav_intermediate: 16, mav_advanced: 20,
    mrv_beginner: 16, mrv_intermediate: 20, mrv_advanced: 24,
    recovery_time_hours: 24
  }
]

// ===== SERVICIO DE VOLUME LANDMARKS =====

export class VolumeLandmarksService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Obtener volume landmarks para un usuario según su nivel
   */
  async getVolumeLandmarksForUser(level: 'beginner' | 'intermediate' | 'advanced'): Promise<VolumeLandmarks[]> {
    try {
      // Obtener volumen actual del usuario
      const currentVolumes = await this.getCurrentWeeklyVolumes()
      
      return MUSCLE_GROUP_DATA.map(muscleData => {
        const currentVolume = currentVolumes[muscleData.name] || 0
        const mev = muscleData[`mev_${level}` as keyof MuscleGroupData] as number
        const mav = muscleData[`mav_${level}` as keyof MuscleGroupData] as number
        const mrv = muscleData[`mrv_${level}` as keyof MuscleGroupData] as number

        return {
          muscle_group: muscleData.spanish_name,
          mev,
          mav,
          mrv,
          current_weekly_sets: currentVolume,
          status: this.determineVolumeStatus(currentVolume, mev, mav, mrv),
          recommendation: this.generateVolumeRecommendation(currentVolume, mev, mav, mrv)
        }
      })

    } catch (error) {
      console.error('Error al obtener volume landmarks:', error)
      return []
    }
  }

  /**
   * Obtener volúmenes semanales actuales del usuario
   */
  private async getCurrentWeeklyVolumes(): Promise<{ [muscleGroup: string]: number }> {
    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          exercises:workout_exercises(
            exercise:exercises(muscle_groups),
            sets,
            reps
          )
        `)
        .eq('user_id', this.userId)
        .gte('date', oneWeekAgo.toISOString())

      if (error) {
        handleSupabaseError(error, { context: 'Obtener volúmenes semanales', showToast: false })
        return {}
      }

      const volumes: { [muscleGroup: string]: number } = {}

      // Procesar datos y calcular volúmenes por grupo muscular
      data?.forEach(session => {
        session.exercises?.forEach((exercise: any) => {
          const muscleGroups = exercise.exercise?.muscle_groups || []
          const sets = exercise.sets || 0

          muscleGroups.forEach((muscleGroup: string) => {
            const normalizedGroup = this.normalizeMuscleGroupName(muscleGroup)
            volumes[normalizedGroup] = (volumes[normalizedGroup] || 0) + sets
          })
        })
      })

      return volumes

    } catch (error) {
      console.error('Error al calcular volúmenes semanales:', error)
      return {}
    }
  }

  /**
   * Normalizar nombres de grupos musculares
   */
  private normalizeMuscleGroupName(muscleGroup: string): string {
    const mapping: { [key: string]: string } = {
      'Pecho': 'chest',
      'Espalda': 'back',
      'Hombros': 'shoulders',
      'Cuádriceps': 'quadriceps',
      'Isquiotibiales': 'hamstrings',
      'Glúteos': 'glutes',
      'Bíceps': 'biceps',
      'Tríceps': 'triceps',
      'Pantorrillas': 'calves',
      'Abdominales': 'abs'
    }

    return mapping[muscleGroup] || muscleGroup.toLowerCase()
  }

  /**
   * Determinar estado del volumen
   */
  private determineVolumeStatus(
    current: number, 
    mev: number, 
    mav: number, 
    mrv: number
  ): 'below_mev' | 'optimal' | 'approaching_mrv' | 'above_mrv' {
    if (current < mev) return 'below_mev'
    if (current > mrv) return 'above_mrv'
    if (current > mav * 0.9) return 'approaching_mrv'
    return 'optimal'
  }

  /**
   * Generar recomendación de volumen
   */
  private generateVolumeRecommendation(
    current: number, 
    mev: number, 
    mav: number, 
    mrv: number
  ): string {
    const status = this.determineVolumeStatus(current, mev, mav, mrv)

    switch (status) {
      case 'below_mev':
        return `Incrementar volumen a ${mev} series mínimo para estimular adaptaciones`
      case 'optimal':
        return `Volumen óptimo. Mantener entre ${mev}-${mav} series semanales`
      case 'approaching_mrv':
        return `Cerca del límite. Considerar deload o mantener volumen actual`
      case 'above_mrv':
        return `Volumen excesivo. Reducir a ${mav} series para optimizar recuperación`
      default:
        return 'Mantener volumen actual'
    }
  }

  /**
   * Registrar progresión de volumen
   */
  async recordVolumeProgression(
    muscleGroup: string,
    setsPerformed: number,
    targetSets: number,
    fatigueLevel: number,
    notes: string = ''
  ): Promise<boolean> {
    try {
      const currentWeek = this.getCurrentWeekNumber()
      
      const progressionData = {
        user_id: this.userId,
        muscle_group: muscleGroup,
        week: currentWeek,
        sets_performed: setsPerformed,
        target_sets: targetSets,
        adaptation_response: this.determineAdaptationResponse(setsPerformed, targetSets, fatigueLevel),
        fatigue_level: fatigueLevel,
        notes
      }

      const { error } = await supabase
        .from('volume_progressions')
        .insert(progressionData)

      if (error) {
        handleSupabaseError(error, { context: 'Registrar progresión de volumen', showToast: true })
        return false
      }

      return true

    } catch (error) {
      console.error('Error al registrar progresión de volumen:', error)
      return false
    }
  }

  /**
   * Determinar respuesta de adaptación
   */
  private determineAdaptationResponse(
    performed: number, 
    target: number, 
    fatigue: number
  ): 'positive' | 'neutral' | 'negative' {
    const completion = performed / target
    
    if (completion >= 1.0 && fatigue <= 6) return 'positive'
    if (completion >= 0.8 && fatigue <= 8) return 'neutral'
    return 'negative'
  }

  /**
   * Obtener número de semana actual
   */
  private getCurrentWeekNumber(): number {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
  }

  /**
   * Generar recomendaciones de volumen personalizadas
   */
  async generateVolumeRecommendations(level: 'beginner' | 'intermediate' | 'advanced'): Promise<VolumeRecommendation[]> {
    try {
      const landmarks = await this.getVolumeLandmarksForUser(level)
      const progressionHistory = await this.getVolumeProgressionHistory(4) // Últimas 4 semanas

      return landmarks.map(landmark => {
        const history = progressionHistory.filter(p => p.muscle_group === landmark.muscle_group)
        const trend = this.analyzeVolumeTrend(history)
        
        return this.generateRecommendationForMuscleGroup(landmark, trend, level)
      })

    } catch (error) {
      console.error('Error al generar recomendaciones de volumen:', error)
      return []
    }
  }

  /**
   * Obtener historial de progresión de volumen
   */
  private async getVolumeProgressionHistory(weeks: number): Promise<VolumeProgression[]> {
    try {
      const { data, error } = await supabase
        .from('volume_progressions')
        .select('*')
        .eq('user_id', this.userId)
        .gte('week', this.getCurrentWeekNumber() - weeks)
        .order('week', { ascending: false })

      if (error) {
        handleSupabaseError(error, { context: 'Obtener historial de volumen', showToast: false })
        return []
      }

      return data as VolumeProgression[]

    } catch (error) {
      console.error('Error al obtener historial de volumen:', error)
      return []
    }
  }

  /**
   * Analizar tendencia de volumen
   */
  private analyzeVolumeTrend(history: VolumeProgression[]): 'increasing' | 'stable' | 'decreasing' | 'inconsistent' {
    if (history.length < 2) return 'stable'

    const volumes = history.map(h => h.sets_performed).reverse()
    let increases = 0
    let decreases = 0

    for (let i = 1; i < volumes.length; i++) {
      if (volumes[i] > volumes[i-1]) increases++
      else if (volumes[i] < volumes[i-1]) decreases++
    }

    if (increases > decreases) return 'increasing'
    if (decreases > increases) return 'decreasing'
    if (increases === 0 && decreases === 0) return 'stable'
    return 'inconsistent'
  }

  /**
   * Generar recomendación para grupo muscular específico
   */
  private generateRecommendationForMuscleGroup(
    landmark: VolumeLandmarks,
    trend: string,
    level: string
  ): VolumeRecommendation {
    const { current_weekly_sets, mev, mav, mrv, status } = landmark

    let recommendedVolume = current_weekly_sets
    let adjustmentType: 'increase' | 'maintain' | 'decrease' | 'deload' = 'maintain'
    let reasoning = ''
    let confidence = 0.8
    let timelineWeeks = 2

    switch (status) {
      case 'below_mev':
        recommendedVolume = Math.min(mev + 2, mav)
        adjustmentType = 'increase'
        reasoning = `Volumen por debajo del mínimo efectivo. Incrementar gradualmente para estimular adaptaciones.`
        confidence = 0.9
        timelineWeeks = 2
        break

      case 'optimal':
        if (trend === 'increasing' && current_weekly_sets < mav * 0.8) {
          recommendedVolume = current_weekly_sets + 1
          adjustmentType = 'increase'
          reasoning = `Progresión positiva. Incremento conservador para continuar adaptaciones.`
        } else {
          adjustmentType = 'maintain'
          reasoning = `Volumen óptimo. Mantener para consolidar adaptaciones.`
        }
        break

      case 'approaching_mrv':
        if (trend === 'decreasing') {
          adjustmentType = 'maintain'
          reasoning = `Cerca del límite pero con tendencia descendente. Mantener volumen actual.`
        } else {
          recommendedVolume = Math.max(current_weekly_sets - 2, mav)
          adjustmentType = 'decrease'
          reasoning = `Acercándose al límite de recuperación. Reducir ligeramente.`
          timelineWeeks = 1
        }
        break

      case 'above_mrv':
        recommendedVolume = mav
        adjustmentType = 'deload'
        reasoning = `Volumen excesivo comprometiendo recuperación. Deload necesario.`
        confidence = 0.95
        timelineWeeks = 1
        break
    }

    return {
      muscle_group: landmark.muscle_group,
      current_volume: current_weekly_sets,
      recommended_volume: recommendedVolume,
      adjustment_type: adjustmentType,
      reasoning,
      confidence,
      timeline_weeks: timelineWeeks
    }
  }

  /**
   * Calcular volumen óptimo para objetivo específico
   */
  calculateOptimalVolumeForGoal(
    goal: 'strength' | 'hypertrophy' | 'endurance',
    level: 'beginner' | 'intermediate' | 'advanced',
    muscleGroup: string
  ): { min: number, optimal: number, max: number } {
    const muscleData = MUSCLE_GROUP_DATA.find(m => m.spanish_name === muscleGroup)
    if (!muscleData) return { min: 6, optimal: 12, max: 18 }

    const mev = muscleData[`mev_${level}` as keyof MuscleGroupData] as number
    const mav = muscleData[`mav_${level}` as keyof MuscleGroupData] as number
    const mrv = muscleData[`mrv_${level}` as keyof MuscleGroupData] as number

    switch (goal) {
      case 'strength':
        return {
          min: mev,
          optimal: Math.round(mev + (mav - mev) * 0.4),
          max: Math.round(mav * 0.8)
        }
      case 'hypertrophy':
        return {
          min: Math.round(mev + (mav - mev) * 0.3),
          optimal: mav,
          max: Math.round(mrv * 0.9)
        }
      case 'endurance':
        return {
          min: Math.round(mav * 0.6),
          optimal: Math.round(mav * 0.8),
          max: mrv
        }
      default:
        return { min: mev, optimal: mav, max: mrv }
    }
  }

  /**
   * Obtener datos de grupo muscular
   */
  getMuscleGroupData(muscleGroup: string): MuscleGroupData | null {
    return MUSCLE_GROUP_DATA.find(m => 
      m.spanish_name === muscleGroup || m.name === muscleGroup
    ) || null
  }

  /**
   * Obtener todos los grupos musculares disponibles
   */
  getAllMuscleGroups(): MuscleGroupData[] {
    return MUSCLE_GROUP_DATA
  }
}

export default VolumeLandmarksService
