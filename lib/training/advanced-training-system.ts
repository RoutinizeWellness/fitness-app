"use client"

import { supabase } from "@/lib/supabase-client"
import { aiSystem } from "@/lib/admin/ai-core-system"
import { computerVisionSystem } from "@/lib/admin/computer-vision-system"

// Advanced Training System Types
export interface VolumeLandmarks {
  MEV: number // Minimum Effective Volume
  MAV: number // Maximum Adaptive Volume
  MRV: number // Maximum Recoverable Volume
  currentVolume: number
  weeklyProgression: number[]
}

export interface PeriodizationCycle {
  id: string
  type: 'macrocycle' | 'mesocycle' | 'microcycle'
  name: string
  duration: number // weeks
  startDate: Date
  endDate: Date
  goals: string[]
  phases: TrainingPhase[]
  parentCycleId?: string
}

export interface TrainingPhase {
  id: string
  name: string
  duration: number // weeks
  intensityRange: { min: number; max: number }
  volumeMultiplier: number
  focusAreas: string[]
  deloadWeek?: boolean
}

export interface WorkoutSession {
  id: string
  userId: string
  routineId: string
  startTime: Date
  endTime?: Date
  status: 'planned' | 'in_progress' | 'completed' | 'skipped'
  exercises: ExerciseExecution[]
  totalVolume: number
  averageIntensity: number
  rpe: number // Rate of Perceived Exertion
  notes?: string
  aiRecommendations?: string[]
  formAnalysis?: FormAnalysisResult[]
}

export interface ExerciseExecution {
  id: string
  exerciseId: string
  exerciseName: string
  targetSets: number
  completedSets: ExerciseSet[]
  restTime: number
  formScore?: number
  aiSuggestions?: string[]
  videoAnalysis?: boolean
}

export interface ExerciseSet {
  setNumber: number
  weight: number
  reps: number
  rir: number // Reps in Reserve
  rpe: number
  duration?: number
  restTime?: number
  completed: boolean
  timestamp: Date
  formFeedback?: string[]
}

export interface FormAnalysisResult {
  exerciseId: string
  timestamp: Date
  formScore: number
  feedback: string[]
  corrections: string[]
  videoClip?: string
}

export interface TrainingMetrics {
  userId: string
  weeklyVolume: { [muscleGroup: string]: number }
  intensityDistribution: { [zone: string]: number }
  adherenceRate: number
  progressionRate: number
  fatigueIndex: number
  readinessScore: number
  volumeLandmarks: { [muscleGroup: string]: VolumeLandmarks }
}

export interface AITrainingRecommendation {
  type: 'exercise_selection' | 'volume_adjustment' | 'intensity_modification' | 'deload_suggestion' | 'progression'
  priority: 'low' | 'medium' | 'high'
  message: string
  reasoning: string
  implementation: string
  expectedOutcome: string
  confidence: number
}

export class AdvancedTrainingSystem {
  private static instance: AdvancedTrainingSystem
  private currentSession: WorkoutSession | null = null
  private realTimeMetrics: TrainingMetrics | null = null

  static getInstance(): AdvancedTrainingSystem {
    if (!AdvancedTrainingSystem.instance) {
      AdvancedTrainingSystem.instance = new AdvancedTrainingSystem()
    }
    return AdvancedTrainingSystem.instance
  }

  // Periodization Management
  async createPeriodizationPlan(userId: string, goals: string[], duration: number): Promise<PeriodizationCycle> {
    try {
      // Create macrocycle
      const macrocycle: PeriodizationCycle = {
        id: `macro_${Date.now()}`,
        type: 'macrocycle',
        name: `${duration}-Week Training Plan`,
        duration,
        startDate: new Date(),
        endDate: new Date(Date.now() + duration * 7 * 24 * 60 * 60 * 1000),
        goals,
        phases: this.generateTrainingPhases(goals, duration)
      }

      // Save to Supabase
      const { error } = await supabase
        .from('periodization_cycles')
        .insert(macrocycle)

      if (error) throw error

      // Generate mesocycles and microcycles
      await this.generateSubCycles(macrocycle)

      return macrocycle
    } catch (error) {
      console.error('Error creating periodization plan:', error)
      throw error
    }
  }

  private generateTrainingPhases(goals: string[], duration: number): TrainingPhase[] {
    const phases: TrainingPhase[] = []
    
    if (goals.includes('strength')) {
      phases.push({
        id: 'accumulation',
        name: 'Accumulation Phase',
        duration: Math.floor(duration * 0.4),
        intensityRange: { min: 65, max: 80 },
        volumeMultiplier: 1.2,
        focusAreas: ['volume', 'technique'],
        deloadWeek: false
      })

      phases.push({
        id: 'intensification',
        name: 'Intensification Phase',
        duration: Math.floor(duration * 0.4),
        intensityRange: { min: 80, max: 95 },
        volumeMultiplier: 0.8,
        focusAreas: ['intensity', 'strength'],
        deloadWeek: false
      })

      phases.push({
        id: 'realization',
        name: 'Realization Phase',
        duration: Math.floor(duration * 0.2),
        intensityRange: { min: 90, max: 105 },
        volumeMultiplier: 0.6,
        focusAreas: ['peak', 'testing'],
        deloadWeek: true
      })
    }

    return phases
  }

  private async generateSubCycles(macrocycle: PeriodizationCycle): Promise<void> {
    // Generate mesocycles (4-week blocks)
    const mesocycleCount = Math.ceil(macrocycle.duration / 4)
    
    for (let i = 0; i < mesocycleCount; i++) {
      const mesocycle: PeriodizationCycle = {
        id: `meso_${macrocycle.id}_${i}`,
        type: 'mesocycle',
        name: `Mesocycle ${i + 1}`,
        duration: 4,
        startDate: new Date(macrocycle.startDate.getTime() + i * 4 * 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(macrocycle.startDate.getTime() + (i + 1) * 4 * 7 * 24 * 60 * 60 * 1000),
        goals: macrocycle.goals,
        phases: macrocycle.phases,
        parentCycleId: macrocycle.id
      }

      await supabase.from('periodization_cycles').insert(mesocycle)

      // Generate microcycles (weekly)
      for (let j = 0; j < 4; j++) {
        const microcycle: PeriodizationCycle = {
          id: `micro_${mesocycle.id}_${j}`,
          type: 'microcycle',
          name: `Week ${j + 1}`,
          duration: 1,
          startDate: new Date(mesocycle.startDate.getTime() + j * 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(mesocycle.startDate.getTime() + (j + 1) * 7 * 24 * 60 * 60 * 1000),
          goals: mesocycle.goals,
          phases: j === 3 ? [{ ...mesocycle.phases[0], deloadWeek: true }] : mesocycle.phases,
          parentCycleId: mesocycle.id
        }

        await supabase.from('periodization_cycles').insert(microcycle)
      }
    }
  }

  // Volume Landmarks Tracking
  async calculateVolumeLandmarks(userId: string, muscleGroup: string): Promise<VolumeLandmarks> {
    try {
      // Get user's training history
      const { data: workoutHistory } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('start_time', { ascending: false })

      if (!workoutHistory || workoutHistory.length === 0) {
        // Default values for beginners
        return {
          MEV: 8,
          MAV: 16,
          MRV: 24,
          currentVolume: 0,
          weeklyProgression: []
        }
      }

      // Calculate volume landmarks based on historical data
      const weeklyVolumes = this.calculateWeeklyVolumes(workoutHistory, muscleGroup)
      const MEV = Math.min(...weeklyVolumes.filter(v => v > 0)) || 8
      const MRV = Math.max(...weeklyVolumes) * 1.2
      const MAV = MEV + (MRV - MEV) * 0.7

      return {
        MEV: Math.round(MEV),
        MAV: Math.round(MAV),
        MRV: Math.round(MRV),
        currentVolume: weeklyVolumes[0] || 0,
        weeklyProgression: weeklyVolumes.slice(0, 8)
      }
    } catch (error) {
      console.error('Error calculating volume landmarks:', error)
      throw error
    }
  }

  private calculateWeeklyVolumes(workoutHistory: any[], muscleGroup: string): number[] {
    const weeklyVolumes: number[] = []
    const weeks = this.groupWorkoutsByWeek(workoutHistory)

    weeks.forEach(week => {
      let weekVolume = 0
      week.forEach(workout => {
        if (workout.exercises) {
          workout.exercises.forEach((exercise: any) => {
            if (this.exerciseTargetsMuscleGroup(exercise.exerciseName, muscleGroup)) {
              exercise.completedSets?.forEach((set: any) => {
                if (set.completed) {
                  weekVolume += set.reps
                }
              })
            }
          })
        }
      })
      weeklyVolumes.push(weekVolume)
    })

    return weeklyVolumes
  }

  private groupWorkoutsByWeek(workouts: any[]): any[][] {
    const weeks: any[][] = []
    let currentWeek: any[] = []
    let currentWeekStart: Date | null = null

    workouts.forEach(workout => {
      const workoutDate = new Date(workout.start_time)
      const weekStart = new Date(workoutDate)
      weekStart.setDate(workoutDate.getDate() - workoutDate.getDay())

      if (!currentWeekStart || weekStart.getTime() !== currentWeekStart.getTime()) {
        if (currentWeek.length > 0) {
          weeks.push(currentWeek)
        }
        currentWeek = [workout]
        currentWeekStart = weekStart
      } else {
        currentWeek.push(workout)
      }
    })

    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    return weeks
  }

  private exerciseTargetsMuscleGroup(exerciseName: string, muscleGroup: string): boolean {
    const muscleGroupMappings: { [key: string]: string[] } = {
      'chest': ['bench press', 'push up', 'chest fly', 'dips'],
      'back': ['pull up', 'row', 'lat pulldown', 'deadlift'],
      'legs': ['squat', 'lunge', 'leg press', 'deadlift'],
      'shoulders': ['shoulder press', 'lateral raise', 'front raise'],
      'arms': ['curl', 'tricep', 'close grip']
    }

    const exercises = muscleGroupMappings[muscleGroup.toLowerCase()] || []
    return exercises.some(exercise => 
      exerciseName.toLowerCase().includes(exercise.toLowerCase())
    )
  }

  // AI-Powered Exercise Recommendations
  async generateExerciseRecommendations(userId: string, currentWorkout: any): Promise<AITrainingRecommendation[]> {
    try {
      const recommendations: AITrainingRecommendation[] = []

      // Get user's training metrics
      const metrics = await this.calculateTrainingMetrics(userId)
      
      // Get AI insights from the core system
      const aiRecommendations = await aiSystem.generateRuleBasedRecommendations(userId)

      // Volume-based recommendations
      Object.entries(metrics.volumeLandmarks).forEach(([muscleGroup, landmarks]) => {
        if (landmarks.currentVolume < landmarks.MEV) {
          recommendations.push({
            type: 'volume_adjustment',
            priority: 'high',
            message: `Increase ${muscleGroup} volume`,
            reasoning: `Current volume (${landmarks.currentVolume}) is below MEV (${landmarks.MEV})`,
            implementation: `Add 2-3 more sets for ${muscleGroup} exercises`,
            expectedOutcome: 'Improved muscle growth and strength gains',
            confidence: 0.85
          })
        } else if (landmarks.currentVolume > landmarks.MRV) {
          recommendations.push({
            type: 'deload_suggestion',
            priority: 'high',
            message: `Reduce ${muscleGroup} volume`,
            reasoning: `Current volume (${landmarks.currentVolume}) exceeds MRV (${landmarks.MRV})`,
            implementation: `Reduce sets by 30-40% for ${muscleGroup}`,
            expectedOutcome: 'Better recovery and sustained progress',
            confidence: 0.90
          })
        }
      })

      // Fatigue-based recommendations
      if (metrics.fatigueIndex > 7) {
        recommendations.push({
          type: 'deload_suggestion',
          priority: 'high',
          message: 'Deload week recommended',
          reasoning: `High fatigue index (${metrics.fatigueIndex}/10)`,
          implementation: 'Reduce intensity by 20% and volume by 30%',
          expectedOutcome: 'Improved recovery and performance',
          confidence: 0.88
        })
      }

      // Progression recommendations
      if (metrics.progressionRate < 0.02) {
        recommendations.push({
          type: 'progression',
          priority: 'medium',
          message: 'Consider exercise variation',
          reasoning: 'Slow progression rate detected',
          implementation: 'Introduce new exercise variations or rep ranges',
          expectedOutcome: 'Break through plateaus',
          confidence: 0.75
        })
      }

      return recommendations
    } catch (error) {
      console.error('Error generating exercise recommendations:', error)
      return []
    }
  }

  // Real-time Training Metrics
  async calculateTrainingMetrics(userId: string): Promise<TrainingMetrics> {
    try {
      const { data: recentWorkouts } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('start_time', { ascending: false })

      if (!recentWorkouts) {
        throw new Error('No workout data found')
      }

      // Calculate weekly volume by muscle group
      const weeklyVolume: { [muscleGroup: string]: number } = {}
      const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms']

      for (const muscleGroup of muscleGroups) {
        weeklyVolume[muscleGroup] = this.calculateWeeklyVolumes(recentWorkouts, muscleGroup)[0] || 0
      }

      // Calculate adherence rate
      const plannedWorkouts = await this.getPlannedWorkouts(userId)
      const adherenceRate = recentWorkouts.length / plannedWorkouts.length

      // Calculate progression rate
      const progressionRate = this.calculateProgressionRate(recentWorkouts)

      // Calculate fatigue index (simplified)
      const avgRPE = recentWorkouts.reduce((sum, w) => sum + (w.rpe || 5), 0) / recentWorkouts.length
      const fatigueIndex = Math.min(10, avgRPE * 1.2)

      // Calculate readiness score
      const readinessScore = Math.max(0, 10 - fatigueIndex + (adherenceRate * 2))

      // Calculate volume landmarks for each muscle group
      const volumeLandmarks: { [muscleGroup: string]: VolumeLandmarks } = {}
      for (const muscleGroup of muscleGroups) {
        volumeLandmarks[muscleGroup] = await this.calculateVolumeLandmarks(userId, muscleGroup)
      }

      return {
        userId,
        weeklyVolume,
        intensityDistribution: this.calculateIntensityDistribution(recentWorkouts),
        adherenceRate: Math.round(adherenceRate * 100) / 100,
        progressionRate: Math.round(progressionRate * 1000) / 1000,
        fatigueIndex: Math.round(fatigueIndex * 10) / 10,
        readinessScore: Math.round(readinessScore * 10) / 10,
        volumeLandmarks
      }
    } catch (error) {
      console.error('Error calculating training metrics:', error)
      throw error
    }
  }

  private async getPlannedWorkouts(userId: string): Promise<any[]> {
    const { data } = await supabase
      .from('planned_workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('planned_date', new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000).toISOString())

    return data || []
  }

  private calculateProgressionRate(workouts: any[]): number {
    if (workouts.length < 2) return 0

    const firstWorkout = workouts[workouts.length - 1]
    const lastWorkout = workouts[0]

    const firstVolume = firstWorkout.total_volume || 0
    const lastVolume = lastWorkout.total_volume || 0

    return lastVolume > 0 ? (lastVolume - firstVolume) / firstVolume : 0
  }

  private calculateIntensityDistribution(workouts: any[]): { [zone: string]: number } {
    const zones = { low: 0, moderate: 0, high: 0 }
    let totalSets = 0

    workouts.forEach(workout => {
      if (workout.exercises) {
        workout.exercises.forEach((exercise: any) => {
          exercise.completedSets?.forEach((set: any) => {
            if (set.completed) {
              totalSets++
              const intensity = set.rpe || 5
              if (intensity <= 6) zones.low++
              else if (intensity <= 8) zones.moderate++
              else zones.high++
            }
          })
        })
      }
    })

    return {
      low: totalSets > 0 ? Math.round((zones.low / totalSets) * 100) : 0,
      moderate: totalSets > 0 ? Math.round((zones.moderate / totalSets) * 100) : 0,
      high: totalSets > 0 ? Math.round((zones.high / totalSets) * 100) : 0
    }
  }

  // Deload Automation
  async checkDeloadRequirement(userId: string): Promise<boolean> {
    try {
      const metrics = await this.calculateTrainingMetrics(userId)
      
      // Deload criteria
      const highFatigue = metrics.fatigueIndex > 7.5
      const lowReadiness = metrics.readinessScore < 6
      const excessiveVolume = Object.values(metrics.volumeLandmarks)
        .some(landmarks => landmarks.currentVolume > landmarks.MRV)
      const poorAdherence = metrics.adherenceRate < 0.7

      return highFatigue || lowReadiness || excessiveVolume || poorAdherence
    } catch (error) {
      console.error('Error checking deload requirement:', error)
      return false
    }
  }

  async implementDeload(userId: string): Promise<void> {
    try {
      // Get current training plan
      const { data: currentPlan } = await supabase
        .from('training_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (currentPlan) {
        // Create deload version
        const deloadPlan = {
          ...currentPlan,
          id: `deload_${Date.now()}`,
          name: `${currentPlan.name} - Deload Week`,
          volume_multiplier: 0.6,
          intensity_multiplier: 0.8,
          duration: 1,
          is_deload: true,
          parent_plan_id: currentPlan.id
        }

        await supabase.from('training_plans').insert(deloadPlan)

        // Update current plan status
        await supabase
          .from('training_plans')
          .update({ status: 'deload_pause' })
          .eq('id', currentPlan.id)

        console.log('Deload week implemented for user:', userId)
      }
    } catch (error) {
      console.error('Error implementing deload:', error)
      throw error
    }
  }

  // Real-time Session Management
  async startWorkoutSession(userId: string, routineId: string): Promise<WorkoutSession> {
    try {
      const session: WorkoutSession = {
        id: `session_${Date.now()}`,
        userId,
        routineId,
        startTime: new Date(),
        status: 'in_progress',
        exercises: [],
        totalVolume: 0,
        averageIntensity: 0,
        rpe: 0
      }

      // Save to Supabase
      const { error } = await supabase
        .from('workout_sessions')
        .insert(session)

      if (error) throw error

      this.currentSession = session
      return session
    } catch (error) {
      console.error('Error starting workout session:', error)
      throw error
    }
  }

  async updateSessionProgress(sessionId: string, exerciseId: string, setData: ExerciseSet): Promise<void> {
    try {
      // Update local session
      if (this.currentSession && this.currentSession.id === sessionId) {
        const exercise = this.currentSession.exercises.find(e => e.exerciseId === exerciseId)
        if (exercise) {
          exercise.completedSets.push(setData)
        }
      }

      // Update in Supabase
      await supabase
        .from('exercise_sets')
        .insert({
          session_id: sessionId,
          exercise_id: exerciseId,
          ...setData
        })

      // Real-time update to admin dashboard
      await this.broadcastProgressUpdate(sessionId, exerciseId, setData)
    } catch (error) {
      console.error('Error updating session progress:', error)
      throw error
    }
  }

  private async broadcastProgressUpdate(sessionId: string, exerciseId: string, setData: ExerciseSet): Promise<void> {
    // Broadcast real-time update for admin monitoring
    const channel = supabase.channel('training_progress')
    channel.send({
      type: 'broadcast',
      event: 'set_completed',
      payload: {
        sessionId,
        exerciseId,
        setData,
        timestamp: new Date().toISOString()
      }
    })
  }

  async completeWorkoutSession(sessionId: string, rpe: number, notes?: string): Promise<void> {
    try {
      const session = this.currentSession
      if (!session || session.id !== sessionId) {
        throw new Error('Session not found')
      }

      // Calculate final metrics
      const totalVolume = session.exercises.reduce((total, exercise) => {
        return total + exercise.completedSets.reduce((exerciseTotal, set) => {
          return exerciseTotal + (set.completed ? set.weight * set.reps : 0)
        }, 0)
      }, 0)

      const averageIntensity = session.exercises.reduce((total, exercise) => {
        const exerciseIntensity = exercise.completedSets.reduce((sum, set) => sum + set.rpe, 0) / exercise.completedSets.length
        return total + exerciseIntensity
      }, 0) / session.exercises.length

      // Update session
      const updatedSession = {
        ...session,
        endTime: new Date(),
        status: 'completed' as const,
        totalVolume,
        averageIntensity,
        rpe,
        notes
      }

      await supabase
        .from('workout_sessions')
        .update(updatedSession)
        .eq('id', sessionId)

      // Update AI system with new data
      await this.updateAIWithSessionData(updatedSession)

      this.currentSession = null
    } catch (error) {
      console.error('Error completing workout session:', error)
      throw error
    }
  }

  private async updateAIWithSessionData(session: WorkoutSession): Promise<void> {
    try {
      // Feed session data to AI system for learning
      const sessionData = {
        userId: session.userId,
        completionRate: session.exercises.length > 0 ? 
          session.exercises.filter(e => e.completedSets.length > 0).length / session.exercises.length : 0,
        totalVolume: session.totalVolume,
        averageIntensity: session.averageIntensity,
        rpe: session.rpe,
        duration: session.endTime && session.startTime ? 
          (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60) : 0
      }

      // This would feed into the AI system for user segmentation and recommendations
      console.log('Feeding session data to AI system:', sessionData)
    } catch (error) {
      console.error('Error updating AI with session data:', error)
    }
  }
}

// Export singleton instance
export const advancedTrainingSystem = AdvancedTrainingSystem.getInstance()
