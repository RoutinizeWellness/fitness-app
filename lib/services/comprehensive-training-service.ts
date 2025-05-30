import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export interface TrainingPlan {
  id: string
  user_id: string
  name: string
  description: string
  experience_level: 'beginner' | 'intermediate' | 'advanced'
  goal: string
  duration_weeks: number
  days_per_week: number
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface WorkoutSession {
  id: string
  user_id: string
  plan_id: string
  name: string
  date: string
  duration_minutes: number
  exercises_completed: number
  total_volume: number
  average_intensity: number
  fatigue_level: number
  satisfaction_rating: number
  notes?: string
  completed: boolean
  created_at: string
}

export interface PersonalizedRoutine {
  id: string
  user_id: string
  name: string
  type: 'push_pull_legs' | 'upper_lower' | 'full_body' | 'custom'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  exercises: Exercise[]
  estimated_duration: number
  target_muscle_groups: string[]
  equipment_needed: string[]
  created_at: string
  updated_at: string
}

export interface Exercise {
  id: string
  name: string
  muscle_groups: string[]
  equipment: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  instructions: string[]
  sets: ExerciseSet[]
  rest_time_seconds: number
  notes?: string
}

export interface ExerciseSet {
  set_number: number
  target_reps: number
  target_weight?: number
  target_duration_seconds?: number
  actual_reps?: number
  actual_weight?: number
  actual_duration_seconds?: number
  rpe?: number // Rate of Perceived Exertion (1-10)
  completed: boolean
}

export interface UserProgress {
  user_id: string
  exercise_id: string
  date: string
  best_1rm: number
  total_volume: number
  average_rpe: number
  progression_rate: number
  last_updated: string
}

/**
 * Comprehensive Training Service
 * Handles the complete training workflow from plan creation to progress tracking
 */
export class ComprehensiveTrainingService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Create a personalized training plan based on user profile and goals
   */
  async createPersonalizedTrainingPlan(
    userProfile: any,
    goals: string[],
    preferences: any
  ): Promise<TrainingPlan | null> {
    try {
      console.log('🎯 Creando plan de entrenamiento personalizado...')

      const experienceLevel = userProfile.experience_level || 'beginner'
      const primaryGoal = goals[0] || 'general_fitness'

      // Determine plan parameters based on experience level
      const planConfig = this.getPlanConfiguration(experienceLevel, primaryGoal)

      const trainingPlan: Omit<TrainingPlan, 'id' | 'created_at' | 'updated_at'> = {
        user_id: this.userId,
        name: `Plan ${experienceLevel === 'beginner' ? 'Principiante' : experienceLevel === 'intermediate' ? 'Intermedio' : 'Avanzado'} - ${this.getGoalName(primaryGoal)}`,
        description: `Plan personalizado para ${this.getGoalName(primaryGoal)} nivel ${experienceLevel}`,
        experience_level: experienceLevel,
        goal: primaryGoal,
        duration_weeks: planConfig.durationWeeks,
        days_per_week: planConfig.daysPerWeek,
        is_active: true
      }

      const { data, error } = await supabase
        .from('training_plans')
        .insert(trainingPlan)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creando plan de entrenamiento:', error)
        throw error
      }

      console.log('✅ Plan de entrenamiento creado:', data)
      return data as TrainingPlan

    } catch (error) {
      console.error('💥 Error en createPersonalizedTrainingPlan:', error)
      return null
    }
  }

  /**
   * Generate personalized routines based on user preferences and goals
   */
  async generatePersonalizedRoutines(
    trainingPlan: TrainingPlan,
    userPreferences: any
  ): Promise<PersonalizedRoutine[]> {
    try {
      console.log('🏋️ Generando rutinas personalizadas...')

      const routines: PersonalizedRoutine[] = []
      const { experience_level, goal, days_per_week } = trainingPlan

      // Generate routines based on training frequency
      if (days_per_week <= 3) {
        // Full body routines for lower frequency
        for (let i = 1; i <= days_per_week; i++) {
          const routine = await this.createFullBodyRoutine(experience_level, goal, i)
          if (routine) routines.push(routine)
        }
      } else if (days_per_week <= 4) {
        // Upper/Lower split
        const upperRoutine = await this.createUpperBodyRoutine(experience_level, goal)
        const lowerRoutine = await this.createLowerBodyRoutine(experience_level, goal)
        if (upperRoutine) routines.push(upperRoutine)
        if (lowerRoutine) routines.push(lowerRoutine)
      } else {
        // Push/Pull/Legs split
        const pushRoutine = await this.createPushRoutine(experience_level, goal)
        const pullRoutine = await this.createPullRoutine(experience_level, goal)
        const legsRoutine = await this.createLegsRoutine(experience_level, goal)
        if (pushRoutine) routines.push(pushRoutine)
        if (pullRoutine) routines.push(pullRoutine)
        if (legsRoutine) routines.push(legsRoutine)
      }

      console.log(`✅ Generadas ${routines.length} rutinas personalizadas`)
      return routines

    } catch (error) {
      console.error('💥 Error en generatePersonalizedRoutines:', error)
      return []
    }
  }

  /**
   * Start a workout session
   */
  async startWorkoutSession(
    planId: string,
    routineName: string
  ): Promise<WorkoutSession | null> {
    try {
      console.log('▶️ Iniciando sesión de entrenamiento...')

      const session: Omit<WorkoutSession, 'id' | 'created_at'> = {
        user_id: this.userId,
        plan_id: planId,
        name: routineName,
        date: new Date().toISOString(),
        duration_minutes: 0,
        exercises_completed: 0,
        total_volume: 0,
        average_intensity: 0,
        fatigue_level: 0,
        satisfaction_rating: 0,
        completed: false
      }

      const { data, error } = await supabase
        .from('workout_sessions')
        .insert(session)
        .select()
        .single()

      if (error) {
        console.error('❌ Error iniciando sesión de entrenamiento:', error)
        throw error
      }

      console.log('✅ Sesión de entrenamiento iniciada:', data)
      return data as WorkoutSession

    } catch (error) {
      console.error('💥 Error en startWorkoutSession:', error)
      return null
    }
  }

  /**
   * Complete a workout session and update progress
   */
  async completeWorkoutSession(
    sessionId: string,
    sessionData: Partial<WorkoutSession>,
    exerciseData: ExerciseSet[]
  ): Promise<boolean> {
    try {
      console.log('✅ Completando sesión de entrenamiento...')

      // Update session
      const { error: sessionError } = await supabase
        .from('workout_sessions')
        .update({
          ...sessionData,
          completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (sessionError) {
        console.error('❌ Error actualizando sesión:', sessionError)
        throw sessionError
      }

      // Update user progress
      await this.updateUserProgress(exerciseData)

      console.log('✅ Sesión de entrenamiento completada')
      return true

    } catch (error) {
      console.error('💥 Error en completeWorkoutSession:', error)
      return false
    }
  }

  /**
   * Get user's training progress and analytics
   */
  async getUserTrainingProgress(): Promise<any> {
    try {
      console.log('📊 Obteniendo progreso de entrenamiento...')

      const { data: sessions, error: sessionsError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', this.userId)
        .order('date', { ascending: false })
        .limit(30)

      if (sessionsError) {
        console.error('❌ Error obteniendo sesiones:', sessionsError)
        throw sessionsError
      }

      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', this.userId)
        .order('date', { ascending: false })

      if (progressError) {
        console.error('❌ Error obteniendo progreso:', progressError)
        throw progressError
      }

      return {
        sessions: sessions || [],
        progress: progress || [],
        analytics: this.calculateProgressAnalytics(sessions || [], progress || [])
      }

    } catch (error) {
      console.error('💥 Error en getUserTrainingProgress:', error)
      return null
    }
  }

  // Private helper methods
  private getPlanConfiguration(experienceLevel: string, goal: string) {
    const configs = {
      beginner: { durationWeeks: 8, daysPerWeek: 3 },
      intermediate: { durationWeeks: 12, daysPerWeek: 4 },
      advanced: { durationWeeks: 16, daysPerWeek: 5 }
    }

    return configs[experienceLevel as keyof typeof configs] || configs.beginner
  }

  private getGoalName(goal: string): string {
    const goalNames: Record<string, string> = {
      muscle_gain: 'Ganancia Muscular',
      strength: 'Fuerza',
      weight_loss: 'Pérdida de Peso',
      endurance: 'Resistencia',
      general_fitness: 'Fitness General'
    }

    return goalNames[goal] || 'Fitness General'
  }

  private async createFullBodyRoutine(
    experienceLevel: string,
    goal: string,
    dayNumber: number
  ): Promise<PersonalizedRoutine | null> {
    // Implementation for creating full body routine
    // This would include exercise selection, sets/reps, etc.
    return null // Placeholder
  }

  private async createUpperBodyRoutine(
    experienceLevel: string,
    goal: string
  ): Promise<PersonalizedRoutine | null> {
    // Implementation for creating upper body routine
    return null // Placeholder
  }

  private async createLowerBodyRoutine(
    experienceLevel: string,
    goal: string
  ): Promise<PersonalizedRoutine | null> {
    // Implementation for creating lower body routine
    return null // Placeholder
  }

  private async createPushRoutine(
    experienceLevel: string,
    goal: string
  ): Promise<PersonalizedRoutine | null> {
    // Implementation for creating push routine
    return null // Placeholder
  }

  private async createPullRoutine(
    experienceLevel: string,
    goal: string
  ): Promise<PersonalizedRoutine | null> {
    // Implementation for creating pull routine
    return null // Placeholder
  }

  private async createLegsRoutine(
    experienceLevel: string,
    goal: string
  ): Promise<PersonalizedRoutine | null> {
    // Implementation for creating legs routine
    return null // Placeholder
  }

  private async updateUserProgress(exerciseData: ExerciseSet[]): Promise<void> {
    // Implementation for updating user progress based on completed exercises
    console.log('📈 Actualizando progreso del usuario...')
  }

  private calculateProgressAnalytics(sessions: WorkoutSession[], progress: UserProgress[]): any {
    // Implementation for calculating progress analytics
    return {
      totalWorkouts: sessions.length,
      averageIntensity: sessions.reduce((acc, s) => acc + s.average_intensity, 0) / sessions.length || 0,
      totalVolume: sessions.reduce((acc, s) => acc + s.total_volume, 0),
      consistencyScore: this.calculateConsistencyScore(sessions)
    }
  }

  private calculateConsistencyScore(sessions: WorkoutSession[]): number {
    // Simple consistency calculation based on workout frequency
    if (sessions.length === 0) return 0
    
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const recentSessions = sessions.filter(s => new Date(s.date) >= thirtyDaysAgo)
    
    return Math.min(100, (recentSessions.length / 12) * 100) // Assuming 3 workouts per week target
  }
}
