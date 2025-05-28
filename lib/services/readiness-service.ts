import { supabase } from '@/lib/supabase-client'
import { v4 as uuidv4 } from 'uuid'
import { 
  ReadinessScore, 
  ReadinessStats,
  TrainingAdjustment,
  SleepEntry,
  MoodEntry
} from '@/lib/types/wellness'
import { SleepService } from './sleep-service'
import { WellnessService } from './wellness-service'

/**
 * Servicio para gestionar los datos de readiness
 */
export class ReadinessService {
  /**
   * Calcula y guarda la puntuación de readiness para un usuario en una fecha específica
   * @param userId - ID del usuario
   * @param date - Fecha para la que calcular la puntuación (formato YYYY-MM-DD)
   * @returns - Puntuación de readiness calculada
   */
  static async calculateReadinessScore(
    userId: string,
    date: string
  ): Promise<{ data: ReadinessScore | null; error: any }> {
    try {
      // Obtener datos de sueño para la fecha
      const { data: sleepEntries } = await SleepService.getSleepEntries(userId, {
        startDate: date,
        endDate: date
      })

      // Obtener datos de estado emocional para la fecha
      const { data: moodEntries } = await WellnessService.getMoodEntries(userId, {
        startDate: date,
        endDate: date
      })

      // Si no hay datos de sueño o estado emocional, no se puede calcular la puntuación
      if (!sleepEntries || sleepEntries.length === 0 || !moodEntries || moodEntries.length === 0) {
        return { 
          data: null, 
          error: 'No hay suficientes datos para calcular la puntuación de readiness' 
        }
      }

      // Usar el último registro de sueño y estado emocional del día
      const sleepEntry = sleepEntries[0]
      const moodEntry = moodEntries[0]

      // Calcular puntuación de sueño (30%)
      const sleepScore = this.calculateSleepScore(sleepEntry)

      // Calcular puntuación física (25%)
      const physicalScore = this.calculatePhysicalScore(moodEntry)

      // Calcular puntuación mental (25%)
      const mentalScore = this.calculateMentalScore(moodEntry)

      // Calcular puntuación de estilo de vida (20%)
      const lifestyleScore = this.calculateLifestyleScore(sleepEntry, moodEntry)

      // Calcular puntuación general
      const overallScore = Math.round(
        (sleepScore * 0.3) + 
        (physicalScore * 0.25) + 
        (mentalScore * 0.25) + 
        (lifestyleScore * 0.2)
      )

      // Determinar ajuste de entrenamiento
      const trainingAdjustment = this.determineTrainingAdjustment(overallScore)

      // Generar recomendaciones
      const recommendations = this.generateRecommendations(
        sleepScore, 
        physicalScore, 
        mentalScore, 
        lifestyleScore, 
        overallScore
      )

      // Crear objeto de puntuación de readiness
      const readinessScore: ReadinessScore = {
        userId,
        date,
        overallScore,
        sleepScore,
        physicalScore,
        mentalScore,
        lifestyleScore,
        components: {
          sleep: {
            duration: sleepEntry.duration,
            quality: sleepEntry.quality,
            hrv: sleepEntry.hrv,
            restingHeartRate: sleepEntry.restingHeartRate,
            deepSleepPercentage: sleepEntry.deepSleep 
              ? (sleepEntry.deepSleep / sleepEntry.duration) * 100 
              : undefined
          },
          physical: {
            muscleSoreness: moodEntry.factors?.includes('muscle_soreness') ? 7 : 3,
            fatigue: 10 - moodEntry.energyLevel,
            previousDayRpe: 7, // Valor de ejemplo, se obtendría de los datos de entrenamiento
            recovery: moodEntry.energyLevel
          },
          mental: {
            stress: moodEntry.stressLevel,
            mood: moodEntry.moodLevel,
            mentalClarity: moodEntry.mentalClarity,
            anxiety: moodEntry.anxietyLevel
          },
          lifestyle: {
            nutrition: moodEntry.factors?.includes('poor_nutrition') ? 4 : 8,
            hydration: moodEntry.factors?.includes('dehydration') ? 4 : 8,
            alcohol: sleepEntry.factors?.alcohol || false,
            activeRecovery: moodEntry.factors?.includes('active_recovery') || false
          }
        },
        recommendations,
        trainingAdjustment
      }

      // Guardar puntuación en la base de datos
      return this.saveReadinessScore(readinessScore)
    } catch (error) {
      console.error('Error al calcular puntuación de readiness:', error)
      return { data: null, error }
    }
  }

  /**
   * Guarda una puntuación de readiness
   * @param score - Datos de la puntuación
   * @returns - Puntuación guardada o null en caso de error
   */
  static async saveReadinessScore(
    score: Omit<ReadinessScore, 'id' | 'createdAt'> & { id?: string }
  ): Promise<{ data: ReadinessScore | null; error: any }> {
    try {
      // Crear un ID único si no se proporciona
      const scoreId = score.id || uuidv4()
      const now = new Date().toISOString()

      // Convertir los datos al formato de la base de datos
      const dbScore = {
        id: scoreId,
        user_id: score.userId,
        date: score.date,
        overall_score: score.overallScore,
        sleep_score: score.sleepScore,
        physical_score: score.physicalScore,
        mental_score: score.mentalScore,
        lifestyle_score: score.lifestyleScore,
        components: score.components,
        recommendations: score.recommendations,
        training_adjustment: score.trainingAdjustment,
        created_at: score.id ? undefined : now
      }

      // Insertar o actualizar la puntuación
      const { data, error } = await supabase
        .from('readiness_scores')
        .upsert(dbScore)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Convertir el resultado al formato de la interfaz
      const savedScore: ReadinessScore = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        overallScore: data.overall_score,
        sleepScore: data.sleep_score,
        physicalScore: data.physical_score,
        mentalScore: data.mental_score,
        lifestyleScore: data.lifestyle_score,
        components: data.components,
        recommendations: data.recommendations,
        trainingAdjustment: data.training_adjustment as TrainingAdjustment,
        createdAt: data.created_at
      }

      return { data: savedScore, error: null }
    } catch (error) {
      console.error('Error al guardar puntuación de readiness:', error)
      return { data: null, error }
    }
  }

  /**
   * Obtiene la puntuación de readiness de un usuario para una fecha específica
   * @param userId - ID del usuario
   * @param date - Fecha para la que obtener la puntuación (formato YYYY-MM-DD)
   * @returns - Puntuación de readiness
   */
  static async getReadinessScore(
    userId: string,
    date: string
  ): Promise<{ data: ReadinessScore | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('readiness_scores')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró ninguna puntuación, calcularla
          return this.calculateReadinessScore(userId, date)
        }
        throw error
      }

      // Convertir los datos al formato de la interfaz
      const readinessScore: ReadinessScore = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        overallScore: data.overall_score,
        sleepScore: data.sleep_score,
        physicalScore: data.physical_score,
        mentalScore: data.mental_score,
        lifestyleScore: data.lifestyle_score,
        components: data.components,
        recommendations: data.recommendations,
        trainingAdjustment: data.training_adjustment as TrainingAdjustment,
        createdAt: data.created_at
      }

      return { data: readinessScore, error: null }
    } catch (error) {
      console.error('Error al obtener puntuación de readiness:', error)
      return { data: null, error }
    }
  }

  /**
   * Obtiene las puntuaciones de readiness de un usuario
   * @param userId - ID del usuario
   * @param options - Opciones de consulta
   * @returns - Lista de puntuaciones de readiness
   */
  static async getReadinessScores(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
      orderBy?: { column: string; ascending: boolean };
    } = {}
  ): Promise<{ data: ReadinessScore[] | null; error: any }> {
    try {
      const { limit = 30, offset = 0, startDate, endDate, orderBy } = options

      let query = supabase
        .from('readiness_scores')
        .select('*')
        .eq('user_id', userId)

      if (startDate) {
        query = query.gte('date', startDate)
      }

      if (endDate) {
        query = query.lte('date', endDate)
      }

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending })
      } else {
        query = query.order('date', { ascending: false })
      }

      query = query.range(offset, offset + limit - 1)

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Convertir los datos de la base de datos al formato de la interfaz
      const readinessScores = data.map(score => ({
        id: score.id,
        userId: score.user_id,
        date: score.date,
        overallScore: score.overall_score,
        sleepScore: score.sleep_score,
        physicalScore: score.physical_score,
        mentalScore: score.mental_score,
        lifestyleScore: score.lifestyle_score,
        components: score.components,
        recommendations: score.recommendations,
        trainingAdjustment: score.training_adjustment as TrainingAdjustment,
        createdAt: score.created_at
      }))

      return { data: readinessScores, error: null }
    } catch (error) {
      console.error('Error al obtener puntuaciones de readiness:', error)
      return { data: null, error }
    }
  }

  /**
   * Obtiene estadísticas de readiness para un usuario
   * @param userId - ID del usuario
   * @param days - Número de días para calcular estadísticas
   * @returns - Estadísticas de readiness
   */
  static async getReadinessStats(
    userId: string,
    days: number = 30
  ): Promise<{ data: ReadinessStats | null; error: any }> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data: scores, error } = await this.getReadinessScores(userId, {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        orderBy: { column: 'date', ascending: true }
      })

      if (error) {
        throw error
      }

      if (!scores || scores.length === 0) {
        return { 
          data: {
            averageOverallScore: 0,
            averageSleepScore: 0,
            averagePhysicalScore: 0,
            averageMentalScore: 0,
            averageLifestyleScore: 0,
            trends: {
              overall: [],
              sleep: [],
              physical: [],
              mental: [],
              lifestyle: []
            },
            dates: [],
            trainingAdjustments: {
              reduce_intensity: 0,
              reduce_volume: 0,
              normal: 0,
              increase: 0
            }
          }, 
          error: null 
        }
      }

      // Calcular estadísticas
      const totalOverall = scores.reduce((sum, score) => sum + score.overallScore, 0)
      const totalSleep = scores.reduce((sum, score) => sum + score.sleepScore, 0)
      const totalPhysical = scores.reduce((sum, score) => sum + score.physicalScore, 0)
      const totalMental = scores.reduce((sum, score) => sum + score.mentalScore, 0)
      const totalLifestyle = scores.reduce((sum, score) => sum + score.lifestyleScore, 0)

      // Contar ajustes de entrenamiento
      const trainingAdjustments: Record<TrainingAdjustment, number> = {
        reduce_intensity: 0,
        reduce_volume: 0,
        normal: 0,
        increase: 0
      }

      scores.forEach(score => {
        if (score.trainingAdjustment) {
          trainingAdjustments[score.trainingAdjustment]++
        }
      })

      const stats: ReadinessStats = {
        averageOverallScore: totalOverall / scores.length,
        averageSleepScore: totalSleep / scores.length,
        averagePhysicalScore: totalPhysical / scores.length,
        averageMentalScore: totalMental / scores.length,
        averageLifestyleScore: totalLifestyle / scores.length,
        trends: {
          overall: scores.map(score => score.overallScore),
          sleep: scores.map(score => score.sleepScore),
          physical: scores.map(score => score.physicalScore),
          mental: scores.map(score => score.mentalScore),
          lifestyle: scores.map(score => score.lifestyleScore)
        },
        dates: scores.map(score => score.date),
        trainingAdjustments
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('Error al obtener estadísticas de readiness:', error)
      return { data: null, error }
    }
  }

  /**
   * Calcula la puntuación de sueño
   * @param sleepEntry - Registro de sueño
   * @returns - Puntuación de sueño (0-100)
   */
  private static calculateSleepScore(sleepEntry: SleepEntry): number {
    // Puntuación por duración (0-40 puntos)
    let durationScore = 0
    if (sleepEntry.duration >= 480) { // 8 horas o más
      durationScore = 40
    } else if (sleepEntry.duration >= 420) { // 7 horas o más
      durationScore = 35
    } else if (sleepEntry.duration >= 360) { // 6 horas o más
      durationScore = 25
    } else if (sleepEntry.duration >= 300) { // 5 horas o más
      durationScore = 15
    } else {
      durationScore = 5
    }

    // Puntuación por calidad (0-30 puntos)
    const qualityScore = (sleepEntry.quality / 10) * 30

    // Puntuación por HRV (0-15 puntos)
    let hrvScore = 0
    if (sleepEntry.hrv) {
      // Ejemplo: HRV > 70 ms es excelente, < 40 ms es pobre
      if (sleepEntry.hrv >= 70) {
        hrvScore = 15
      } else if (sleepEntry.hrv >= 60) {
        hrvScore = 12
      } else if (sleepEntry.hrv >= 50) {
        hrvScore = 9
      } else if (sleepEntry.hrv >= 40) {
        hrvScore = 6
      } else {
        hrvScore = 3
      }
    }

    // Puntuación por frecuencia cardíaca en reposo (0-15 puntos)
    let rhrScore = 0
    if (sleepEntry.restingHeartRate) {
      // Ejemplo: RHR < 50 bpm es excelente, > 70 bpm es pobre
      if (sleepEntry.restingHeartRate < 50) {
        rhrScore = 15
      } else if (sleepEntry.restingHeartRate < 55) {
        rhrScore = 12
      } else if (sleepEntry.restingHeartRate < 60) {
        rhrScore = 9
      } else if (sleepEntry.restingHeartRate < 65) {
        rhrScore = 6
      } else if (sleepEntry.restingHeartRate < 70) {
        rhrScore = 3
      } else {
        rhrScore = 0
      }
    }

    // Calcular puntuación total
    let totalScore = durationScore + qualityScore
    
    // Añadir puntuaciones de HRV y RHR si están disponibles
    if (sleepEntry.hrv && sleepEntry.restingHeartRate) {
      totalScore += hrvScore + rhrScore
    } else {
      // Si no están disponibles, ajustar la escala
      totalScore = (totalScore / 70) * 100
    }

    return Math.round(totalScore)
  }

  /**
   * Calcula la puntuación física
   * @param moodEntry - Registro de estado emocional
   * @returns - Puntuación física (0-100)
   */
  private static calculatePhysicalScore(moodEntry: MoodEntry): number {
    // Puntuación por nivel de energía (0-50 puntos)
    const energyScore = (moodEntry.energyLevel / 10) * 50

    // Puntuación por nivel de estrés físico (0-50 puntos)
    // Invertir la escala: menor estrés = mayor puntuación
    const stressScore = ((10 - moodEntry.stressLevel) / 10) * 50

    // Calcular puntuación total
    const totalScore = energyScore + stressScore

    return Math.round(totalScore)
  }

  /**
   * Calcula la puntuación mental
   * @param moodEntry - Registro de estado emocional
   * @returns - Puntuación mental (0-100)
   */
  private static calculateMentalScore(moodEntry: MoodEntry): number {
    // Puntuación por estado de ánimo (0-30 puntos)
    const moodScore = (moodEntry.moodLevel / 10) * 30

    // Puntuación por claridad mental (0-30 puntos)
    const clarityScore = (moodEntry.mentalClarity / 10) * 30

    // Puntuación por nivel de ansiedad (0-40 puntos)
    // Invertir la escala: menor ansiedad = mayor puntuación
    const anxietyScore = ((10 - moodEntry.anxietyLevel) / 10) * 40

    // Calcular puntuación total
    const totalScore = moodScore + clarityScore + anxietyScore

    return Math.round(totalScore)
  }

  /**
   * Calcula la puntuación de estilo de vida
   * @param sleepEntry - Registro de sueño
   * @param moodEntry - Registro de estado emocional
   * @returns - Puntuación de estilo de vida (0-100)
   */
  private static calculateLifestyleScore(sleepEntry: SleepEntry, moodEntry: MoodEntry): number {
    // Puntuación base
    let score = 80

    // Factores que reducen la puntuación
    if (sleepEntry.factors?.alcohol) {
      score -= 20 // El alcohol afecta negativamente
    }

    if (moodEntry.factors?.includes('poor_nutrition')) {
      score -= 15 // Mala nutrición afecta negativamente
    }

    if (moodEntry.factors?.includes('dehydration')) {
      score -= 15 // Deshidratación afecta negativamente
    }

    if (sleepEntry.factors?.stress) {
      score -= 10 // El estrés afecta negativamente
    }

    // Factores que aumentan la puntuación
    if (moodEntry.factors?.includes('active_recovery')) {
      score += 10 // Recuperación activa afecta positivamente
    }

    if (moodEntry.factors?.includes('good_nutrition')) {
      score += 10 // Buena nutrición afecta positivamente
    }

    // Asegurar que la puntuación esté en el rango 0-100
    return Math.max(0, Math.min(100, score))
  }

  /**
   * Determina el ajuste de entrenamiento basado en la puntuación general
   * @param overallScore - Puntuación general
   * @returns - Ajuste de entrenamiento recomendado
   */
  private static determineTrainingAdjustment(overallScore: number): TrainingAdjustment {
    if (overallScore < 40) {
      return 'reduce_intensity'
    } else if (overallScore < 60) {
      return 'reduce_volume'
    } else if (overallScore < 80) {
      return 'normal'
    } else {
      return 'increase'
    }
  }

  /**
   * Genera recomendaciones basadas en las puntuaciones
   * @param sleepScore - Puntuación de sueño
   * @param physicalScore - Puntuación física
   * @param mentalScore - Puntuación mental
   * @param lifestyleScore - Puntuación de estilo de vida
   * @param overallScore - Puntuación general
   * @returns - Lista de recomendaciones
   */
  private static generateRecommendations(
    sleepScore: number,
    physicalScore: number,
    mentalScore: number,
    lifestyleScore: number,
    overallScore: number
  ): string[] {
    const recommendations: string[] = []

    // Recomendaciones basadas en la puntuación de sueño
    if (sleepScore < 50) {
      recommendations.push('Prioriza mejorar tu sueño. Intenta acostarte más temprano y mantén un horario constante.')
      recommendations.push('Considera una siesta corta (20-30 minutos) hoy para compensar la falta de sueño.')
    } else if (sleepScore < 70) {
      recommendations.push('Tu sueño podría mejorar. Evita la cafeína después del mediodía y las pantallas antes de dormir.')
    }

    // Recomendaciones basadas en la puntuación física
    if (physicalScore < 50) {
      recommendations.push('Tu cuerpo necesita recuperación. Considera un entrenamiento ligero o un día de descanso activo.')
    } else if (physicalScore < 70) {
      recommendations.push('Modifica la intensidad de tu entrenamiento hoy. Enfócate en técnica y volumen moderado.')
    }

    // Recomendaciones basadas en la puntuación mental
    if (mentalScore < 50) {
      recommendations.push('Tu estado mental indica fatiga. Dedica 10 minutos a la meditación o respiración profunda.')
    } else if (mentalScore < 70) {
      recommendations.push('Considera actividades que mejoren tu estado mental, como un paseo al aire libre o yoga suave.')
    }

    // Recomendaciones basadas en la puntuación de estilo de vida
    if (lifestyleScore < 50) {
      recommendations.push('Prioriza la hidratación y una alimentación equilibrada hoy para mejorar tu recuperación.')
    } else if (lifestyleScore < 70) {
      recommendations.push('Pequeños ajustes en tu estilo de vida, como mejor hidratación, pueden mejorar tu rendimiento.')
    }

    // Recomendaciones basadas en la puntuación general
    if (overallScore < 40) {
      recommendations.push('Tu nivel de preparación es bajo. Considera un día de recuperación completa o entrenamiento muy ligero.')
    } else if (overallScore < 60) {
      recommendations.push('Reduce el volumen de entrenamiento hoy. Enfócate en calidad sobre cantidad.')
    } else if (overallScore < 80) {
      recommendations.push('Estás en un buen nivel de preparación. Procede con tu entrenamiento planificado.')
    } else {
      recommendations.push('Tu nivel de preparación es excelente. Es un buen día para un entrenamiento desafiante o una sesión clave.')
    }

    return recommendations
  }
}
