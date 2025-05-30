import { supabase } from "@/lib/supabase-client"
import { handleSupabaseError } from "@/lib/utils/error-handler"

export interface EnhancedTrainingPlan {
  id: string
  user_id: string
  name: string
  description: string
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general_fitness'
  level: 'beginner' | 'intermediate' | 'advanced'
  duration_weeks: number
  sessions_per_week: number
  created_at: string
  updated_at: string
  ai_recommendations: AIRecommendation[]
  personalization_data: PersonalizationData
  progress_tracking: ProgressMetrics
}

export interface AIRecommendation {
  id: string
  type: 'exercise' | 'intensity' | 'volume' | 'recovery' | 'nutrition'
  title: string
  description: string
  reasoning: string
  confidence_score: number
  priority: 'low' | 'medium' | 'high'
  created_at: string
}

export interface PersonalizationData {
  user_preferences: {
    preferred_workout_time: string
    available_equipment: string[]
    injury_history: string[]
    fitness_goals: string[]
  }
  performance_metrics: {
    strength_level: number
    endurance_level: number
    flexibility_level: number
    recovery_rate: number
  }
  adaptation_factors: {
    training_age: number
    response_to_volume: 'low' | 'medium' | 'high'
    response_to_intensity: 'low' | 'medium' | 'high'
    fatigue_resistance: number
  }
}

export interface ProgressMetrics {
  strength_gains: { [exercise: string]: number }
  volume_progression: number[]
  adherence_rate: number
  fatigue_levels: number[]
  performance_trends: {
    improving: string[]
    plateauing: string[]
    declining: string[]
  }
}

export interface WorkoutRecommendation {
  exercise_id: string
  exercise_name: string
  sets: number
  reps: string
  weight_percentage: number
  rest_time: number
  intensity_rpe: number
  notes: string
  alternatives: string[]
}

/**
 * Servicio mejorado de entrenamiento con IA
 */
export class EnhancedTrainingService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Generar plan de entrenamiento personalizado con IA
   */
  async generatePersonalizedPlan(
    goal: string,
    level: string,
    preferences: any
  ): Promise<EnhancedTrainingPlan | null> {
    try {
      // Obtener datos del usuario para personalización
      const userProfile = await this.getUserProfile()
      const trainingHistory = await this.getTrainingHistory()
      const performanceData = await this.getPerformanceMetrics()

      // Generar recomendaciones de IA
      const aiRecommendations = await this.generateAIRecommendations(
        userProfile,
        trainingHistory,
        performanceData,
        goal,
        level
      )

      // Crear datos de personalización
      const personalizationData: PersonalizationData = {
        user_preferences: {
          preferred_workout_time: preferences.workout_time || 'morning',
          available_equipment: preferences.equipment || [],
          injury_history: preferences.injuries || [],
          fitness_goals: [goal]
        },
        performance_metrics: {
          strength_level: performanceData?.strength_level || 5,
          endurance_level: performanceData?.endurance_level || 5,
          flexibility_level: performanceData?.flexibility_level || 5,
          recovery_rate: performanceData?.recovery_rate || 5
        },
        adaptation_factors: {
          training_age: trainingHistory?.training_age || 1,
          response_to_volume: 'medium',
          response_to_intensity: 'medium',
          fatigue_resistance: 5
        }
      }

      // Crear plan base
      const planData = {
        user_id: this.userId,
        name: `Plan Personalizado - ${goal}`,
        description: `Plan de entrenamiento personalizado para ${goal} nivel ${level}`,
        goal: goal as any,
        level: level as any,
        duration_weeks: this.calculateOptimalDuration(level, goal),
        sessions_per_week: this.calculateOptimalFrequency(level, preferences),
        ai_recommendations: aiRecommendations,
        personalization_data: personalizationData,
        progress_tracking: {
          strength_gains: {},
          volume_progression: [],
          adherence_rate: 0,
          fatigue_levels: [],
          performance_trends: {
            improving: [],
            plateauing: [],
            declining: []
          }
        }
      }

      // Guardar en Supabase
      const { data, error } = await supabase
        .from('enhanced_training_plans')
        .insert(planData)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, { context: 'Crear plan de entrenamiento personalizado', showToast: true })
        return null
      }

      return data as EnhancedTrainingPlan

    } catch (error) {
      console.error('Error al generar plan personalizado:', error)
      return null
    }
  }

  /**
   * Generar recomendaciones de IA basadas en datos del usuario
   */
  private async generateAIRecommendations(
    userProfile: any,
    trainingHistory: any,
    performanceData: any,
    goal: string,
    level: string
  ): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = []

    // Recomendación de ejercicios basada en historial
    if (trainingHistory?.weak_points?.length > 0) {
      recommendations.push({
        id: `rec_${Date.now()}_1`,
        type: 'exercise',
        title: 'Ejercicios para puntos débiles',
        description: `Incluir más trabajo en: ${trainingHistory.weak_points.join(', ')}`,
        reasoning: 'Análisis de tu historial muestra áreas que necesitan más atención',
        confidence_score: 0.85,
        priority: 'high',
        created_at: new Date().toISOString()
      })
    }

    // Recomendación de intensidad basada en nivel
    const intensityRec = this.getIntensityRecommendation(level, performanceData)
    recommendations.push({
      id: `rec_${Date.now()}_2`,
      type: 'intensity',
      title: intensityRec.title,
      description: intensityRec.description,
      reasoning: intensityRec.reasoning,
      confidence_score: 0.9,
      priority: 'medium',
      created_at: new Date().toISOString()
    })

    // Recomendación de volumen
    const volumeRec = this.getVolumeRecommendation(level, goal, trainingHistory)
    recommendations.push({
      id: `rec_${Date.now()}_3`,
      type: 'volume',
      title: volumeRec.title,
      description: volumeRec.description,
      reasoning: volumeRec.reasoning,
      confidence_score: 0.8,
      priority: 'medium',
      created_at: new Date().toISOString()
    })

    // Recomendación de recuperación
    if (performanceData?.fatigue_level > 7) {
      recommendations.push({
        id: `rec_${Date.now()}_4`,
        type: 'recovery',
        title: 'Enfoque en recuperación',
        description: 'Incluir más días de descanso y trabajo de movilidad',
        reasoning: 'Tus niveles de fatiga están elevados',
        confidence_score: 0.75,
        priority: 'high',
        created_at: new Date().toISOString()
      })
    }

    return recommendations
  }

  /**
   * Obtener recomendaciones de ejercicios para el entrenamiento de hoy
   */
  async getTodayWorkoutRecommendations(): Promise<WorkoutRecommendation[]> {
    try {
      // Obtener plan actual del usuario
      const { data: currentPlan } = await supabase
        .from('enhanced_training_plans')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!currentPlan) {
        return this.getDefaultWorkoutRecommendations()
      }

      // Obtener historial reciente para evitar repeticiones
      const recentWorkouts = await this.getRecentWorkouts(7)
      
      // Generar recomendaciones basadas en el plan y historial
      return this.generateWorkoutRecommendations(currentPlan, recentWorkouts)

    } catch (error) {
      console.error('Error al obtener recomendaciones de entrenamiento:', error)
      return this.getDefaultWorkoutRecommendations()
    }
  }

  /**
   * Actualizar métricas de progreso
   */
  async updateProgressMetrics(
    planId: string,
    workoutData: any
  ): Promise<boolean> {
    try {
      // Obtener plan actual
      const { data: plan } = await supabase
        .from('enhanced_training_plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (!plan) return false

      // Calcular nuevas métricas
      const updatedMetrics = this.calculateProgressMetrics(
        plan.progress_tracking,
        workoutData
      )

      // Actualizar en base de datos
      const { error } = await supabase
        .from('enhanced_training_plans')
        .update({ progress_tracking: updatedMetrics })
        .eq('id', planId)

      if (error) {
        handleSupabaseError(error, { context: 'Actualizar métricas de progreso', showToast: false })
        return false
      }

      return true

    } catch (error) {
      console.error('Error al actualizar métricas de progreso:', error)
      return false
    }
  }

  /**
   * Obtener análisis de rendimiento con IA
   */
  async getPerformanceAnalysis(): Promise<any> {
    try {
      const trainingHistory = await this.getTrainingHistory()
      const currentMetrics = await this.getPerformanceMetrics()
      
      return {
        trends: this.analyzeTrends(trainingHistory),
        recommendations: await this.generatePerformanceRecommendations(currentMetrics),
        predictions: this.generatePerformancePredictions(trainingHistory),
        areas_for_improvement: this.identifyImprovementAreas(currentMetrics)
      }

    } catch (error) {
      console.error('Error al obtener análisis de rendimiento:', error)
      return null
    }
  }

  // Métodos auxiliares privados
  private async getUserProfile(): Promise<any> {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', this.userId)
      .single()
    
    return data
  }

  private async getTrainingHistory(): Promise<any> {
    const { data } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', this.userId)
      .order('date', { ascending: false })
      .limit(50)
    
    return this.analyzeTrainingHistory(data || [])
  }

  private async getPerformanceMetrics(): Promise<any> {
    const { data } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    return data
  }

  private calculateOptimalDuration(level: string, goal: string): number {
    const baseDuration = {
      'beginner': 8,
      'intermediate': 12,
      'advanced': 16
    }
    
    const goalModifier = {
      'strength': 1.2,
      'hypertrophy': 1.0,
      'endurance': 1.1,
      'weight_loss': 0.8,
      'general_fitness': 1.0
    }
    
    return Math.round(baseDuration[level as keyof typeof baseDuration] * goalModifier[goal as keyof typeof goalModifier])
  }

  private calculateOptimalFrequency(level: string, preferences: any): number {
    const baseFrequency = {
      'beginner': 3,
      'intermediate': 4,
      'advanced': 5
    }
    
    return Math.min(baseFrequency[level as keyof typeof baseFrequency], preferences.max_sessions_per_week || 6)
  }

  private getIntensityRecommendation(level: string, performanceData: any) {
    const recommendations = {
      'beginner': {
        title: 'Intensidad moderada',
        description: 'Mantén RPE entre 6-7 para adaptación gradual',
        reasoning: 'Como principiante, es importante construir una base sólida'
      },
      'intermediate': {
        title: 'Intensidad variable',
        description: 'Alterna entre RPE 7-8 con días de recuperación activa',
        reasoning: 'Tu nivel permite mayor variabilidad en la intensidad'
      },
      'advanced': {
        title: 'Intensidad alta controlada',
        description: 'Incluye trabajo a RPE 8-9 con periodización adecuada',
        reasoning: 'Tu experiencia permite entrenamientos de alta intensidad'
      }
    }
    
    return recommendations[level as keyof typeof recommendations]
  }

  private getVolumeRecommendation(level: string, goal: string, history: any) {
    return {
      title: 'Volumen progresivo',
      description: `Incrementa volumen gradualmente según tu ${goal}`,
      reasoning: 'Basado en tu historial y objetivo actual'
    }
  }

  private async getRecentWorkouts(days: number): Promise<any[]> {
    const { data } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', this.userId)
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: false })
    
    return data || []
  }

  private generateWorkoutRecommendations(plan: any, recentWorkouts: any[]): WorkoutRecommendation[] {
    // Lógica para generar recomendaciones específicas basadas en el plan y historial
    return [
      {
        exercise_id: 'squat',
        exercise_name: 'Sentadilla',
        sets: 4,
        reps: '8-10',
        weight_percentage: 75,
        rest_time: 180,
        intensity_rpe: 7,
        notes: 'Enfócate en la profundidad y control',
        alternatives: ['Sentadilla frontal', 'Sentadilla búlgara']
      },
      {
        exercise_id: 'bench-press',
        exercise_name: 'Press de banca',
        sets: 4,
        reps: '6-8',
        weight_percentage: 80,
        rest_time: 180,
        intensity_rpe: 8,
        notes: 'Mantén tensión en todo el rango de movimiento',
        alternatives: ['Press con mancuernas', 'Press inclinado']
      }
    ]
  }

  private getDefaultWorkoutRecommendations(): WorkoutRecommendation[] {
    return [
      {
        exercise_id: 'bodyweight-squat',
        exercise_name: 'Sentadilla con peso corporal',
        sets: 3,
        reps: '12-15',
        weight_percentage: 0,
        rest_time: 60,
        intensity_rpe: 6,
        notes: 'Ejercicio básico para comenzar',
        alternatives: ['Sentadilla asistida']
      }
    ]
  }

  private calculateProgressMetrics(currentMetrics: any, workoutData: any): ProgressMetrics {
    // Lógica para calcular métricas actualizadas
    return {
      ...currentMetrics,
      adherence_rate: this.calculateAdherenceRate(workoutData),
      volume_progression: [...(currentMetrics.volume_progression || []), workoutData.total_volume]
    }
  }

  private calculateAdherenceRate(workoutData: any): number {
    // Calcular tasa de adherencia basada en entrenamientos completados
    return 85 // Placeholder
  }

  private analyzeTrainingHistory(sessions: any[]): any {
    // Analizar historial para identificar patrones
    return {
      training_age: sessions.length > 0 ? Math.floor(sessions.length / 12) : 0,
      weak_points: ['Piernas', 'Core'], // Placeholder
      strong_points: ['Pecho', 'Brazos'] // Placeholder
    }
  }

  private analyzeTrends(history: any): any {
    return {
      strength_trend: 'improving',
      volume_trend: 'stable',
      consistency_trend: 'improving'
    }
  }

  private async generatePerformanceRecommendations(metrics: any): Promise<string[]> {
    return [
      'Incrementar volumen de entrenamiento de piernas',
      'Incluir más trabajo de movilidad',
      'Mejorar consistencia en el entrenamiento'
    ]
  }

  private generatePerformancePredictions(history: any): any {
    return {
      strength_prediction: '+15% en 3 meses',
      endurance_prediction: '+20% en 2 meses'
    }
  }

  private identifyImprovementAreas(metrics: any): string[] {
    return [
      'Fuerza de piernas',
      'Resistencia cardiovascular',
      'Flexibilidad'
    ]
  }
}

export default EnhancedTrainingService
