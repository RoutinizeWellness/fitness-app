"use client"

import { supabase } from "@/lib/supabase-client"
import { aiSystem } from "@/lib/admin/ai-core-system"

// Core Elite Training System Types
export interface TrainingJournalEntry {
  id: string
  userId: string
  date: Date
  title: string
  content: string // Rich text content
  tags: string[]
  templateId?: string
  objectiveData: ObjectiveMetrics
  subjectiveData: SubjectiveMetrics
  attachments: MediaAttachment[]
  createdAt: Date
  updatedAt: Date
}

export interface ObjectiveMetrics {
  workoutData?: {
    exercises: ExerciseData[]
    totalVolume: number
    averageIntensity: number
    duration: number
    rpe: number
  }
  nutritionData?: {
    calories: number
    protein: number
    carbs: number
    fats: number
    hydration: number
  }
  biometrics?: {
    weight: number
    bodyFat?: number
    heartRate?: number
    bloodPressure?: string
    temperature?: number
  }
  sleepData?: {
    duration: number
    quality: number
    deepSleep?: number
    remSleep?: number
    sleepEfficiency?: number
  }
}

export interface SubjectiveMetrics {
  mood: number // 1-10 scale
  energy: number // 1-10 scale
  motivation: number // 1-10 scale
  stress: number // 1-10 scale
  soreness: number // 1-10 scale
  jointPain?: { [joint: string]: number }
  notes: string
  perceivedRecovery: number // 1-10 scale
}

export interface ExerciseData {
  exerciseId: string
  exerciseName: string
  sets: SetData[]
  notes?: string
  formScore?: number
}

export interface SetData {
  weight: number
  reps: number
  rpe: number
  rir: number
  restTime?: number
  tempo?: string
}

export interface MediaAttachment {
  id: string
  type: 'photo' | 'video' | 'audio'
  url: string
  caption?: string
  timestamp: Date
}

export interface FitnessTest {
  id: string
  userId: string
  testType: TestType
  date: Date
  results: TestResults
  conditions: TestConditions
  notes?: string
  comparedToBaseline?: boolean
  percentileRank?: number
}

export interface TestType {
  category: 'strength' | 'power' | 'endurance' | 'body_composition' | 'flexibility' | 'balance'
  name: string
  protocol: string
  equipment: string[]
  duration: number
  instructions: string[]
}

export interface TestResults {
  primaryMetric: {
    value: number
    unit: string
    percentile?: number
  }
  secondaryMetrics?: {
    [key: string]: {
      value: number
      unit: string
    }
  }
  rawData?: any
}

export interface TestConditions {
  temperature: number
  humidity?: number
  timeOfDay: string
  lastMeal: number // hours ago
  sleepQuality: number
  stressLevel: number
  priorActivity: string
}

export interface Goal {
  id: string
  userId: string
  type: 'primary' | 'secondary' | 'micro'
  category: 'performance' | 'body_composition' | 'skill' | 'competitive'
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  deadline: Date
  priority: number
  parentGoalId?: string
  subGoals: string[]
  milestones: Milestone[]
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  successProbability?: number
  createdAt: Date
  updatedAt: Date
}

export interface Milestone {
  id: string
  title: string
  targetValue: number
  targetDate: Date
  completed: boolean
  completedDate?: Date
}

export interface TrainingPlan {
  id: string
  userId: string
  name: string
  description: string
  type: 'strength' | 'hypertrophy' | 'power' | 'endurance' | 'sport_specific'
  duration: number // weeks
  currentWeek: number
  goals: string[] // Goal IDs
  phases: TrainingPhase[]
  autoAdjustments: boolean
  lastOptimized: Date
  createdAt: Date
}

export interface TrainingPhase {
  id: string
  name: string
  duration: number // weeks
  focus: string[]
  volumeMultiplier: number
  intensityRange: { min: number; max: number }
  exercises: PhaseExercise[]
  deloadWeek?: number
}

export interface PhaseExercise {
  exerciseId: string
  priority: 'primary' | 'secondary' | 'accessory'
  volumeTarget: { min: number; max: number }
  intensityTarget: { min: number; max: number }
  progressionScheme: string
  alternatives: string[]
}

export interface PatternAnalysis {
  id: string
  userId: string
  type: 'correlation' | 'trend' | 'anomaly'
  variables: string[]
  correlation: number
  confidence: number
  timeframe: { start: Date; end: Date }
  insights: string[]
  recommendations: string[]
  significance: 'low' | 'medium' | 'high'
  createdAt: Date
}

export class EliteTrainingSystem {
  private static instance: EliteTrainingSystem

  static getInstance(): EliteTrainingSystem {
    if (!EliteTrainingSystem.instance) {
      EliteTrainingSystem.instance = new EliteTrainingSystem()
    }
    return EliteTrainingSystem.instance
  }

  // Training Journal Methods
  async createJournalEntry(entry: Omit<TrainingJournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<TrainingJournalEntry> {
    try {
      const newEntry: TrainingJournalEntry = {
        ...entry,
        id: `journal_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const { error } = await supabase
        .from('training_journal_entries')
        .insert(newEntry)

      if (error) throw error

      // Trigger pattern analysis
      await this.analyzePatterns(entry.userId)

      return newEntry
    } catch (error) {
      console.error('Error creating journal entry:', error)
      throw error
    }
  }

  async searchJournalEntries(
    userId: string,
    filters: {
      keywords?: string
      tags?: string[]
      dateRange?: { start: Date; end: Date }
      rpeRange?: { min: number; max: number }
      moodRange?: { min: number; max: number }
    }
  ): Promise<TrainingJournalEntry[]> {
    try {
      let query = supabase
        .from('training_journal_entries')
        .select('*')
        .eq('user_id', userId)

      if (filters.dateRange) {
        query = query
          .gte('date', filters.dateRange.start.toISOString())
          .lte('date', filters.dateRange.end.toISOString())
      }

      if (filters.keywords) {
        query = query.or(`title.ilike.%${filters.keywords}%,content.ilike.%${filters.keywords}%`)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags)
      }

      const { data, error } = await query.order('date', { ascending: false })

      if (error) throw error

      // Apply additional filters that can't be done in SQL
      let filteredData = data || []

      if (filters.rpeRange) {
        filteredData = filteredData.filter(entry => {
          const rpe = entry.objective_data?.workoutData?.rpe
          return rpe && rpe >= filters.rpeRange!.min && rpe <= filters.rpeRange!.max
        })
      }

      if (filters.moodRange) {
        filteredData = filteredData.filter(entry => {
          const mood = entry.subjective_data?.mood
          return mood && mood >= filters.moodRange!.min && mood <= filters.moodRange!.max
        })
      }

      return filteredData
    } catch (error) {
      console.error('Error searching journal entries:', error)
      throw error
    }
  }

  // Pattern Analysis Methods
  async analyzePatterns(userId: string): Promise<PatternAnalysis[]> {
    try {
      // Get recent journal entries for analysis
      const { data: entries } = await supabase
        .from('training_journal_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('date', { ascending: true })

      if (!entries || entries.length < 10) {
        return [] // Need sufficient data for analysis
      }

      const patterns: PatternAnalysis[] = []

      // Analyze sleep vs performance correlation
      const sleepPerformanceCorr = this.calculateCorrelation(
        entries.map(e => e.objective_data?.sleepData?.quality || 0),
        entries.map(e => e.objective_data?.workoutData?.averageIntensity || 0)
      )

      if (Math.abs(sleepPerformanceCorr) > 0.3) {
        patterns.push({
          id: `pattern_${Date.now()}_1`,
          userId,
          type: 'correlation',
          variables: ['sleep_quality', 'workout_intensity'],
          correlation: sleepPerformanceCorr,
          confidence: this.calculateConfidence(sleepPerformanceCorr, entries.length),
          timeframe: {
            start: new Date(entries[0].date),
            end: new Date(entries[entries.length - 1].date)
          },
          insights: [
            sleepPerformanceCorr > 0
              ? 'Better sleep quality correlates with higher workout intensity'
              : 'Poor sleep quality appears to negatively impact workout performance'
          ],
          recommendations: [
            sleepPerformanceCorr > 0
              ? 'Prioritize sleep quality on days before important training sessions'
              : 'Consider adjusting training intensity based on sleep quality scores'
          ],
          significance: Math.abs(sleepPerformanceCorr) > 0.5 ? 'high' : 'medium',
          createdAt: new Date()
        })
      }

      // Analyze nutrition vs energy correlation
      const nutritionEnergyCorr = this.calculateCorrelation(
        entries.map(e => e.objective_data?.nutritionData?.calories || 0),
        entries.map(e => e.subjective_data?.energy || 0)
      )

      if (Math.abs(nutritionEnergyCorr) > 0.3) {
        patterns.push({
          id: `pattern_${Date.now()}_2`,
          userId,
          type: 'correlation',
          variables: ['caloric_intake', 'energy_levels'],
          correlation: nutritionEnergyCorr,
          confidence: this.calculateConfidence(nutritionEnergyCorr, entries.length),
          timeframe: {
            start: new Date(entries[0].date),
            end: new Date(entries[entries.length - 1].date)
          },
          insights: [
            nutritionEnergyCorr > 0
              ? 'Higher caloric intake correlates with increased energy levels'
              : 'Caloric restriction may be impacting energy levels'
          ],
          recommendations: [
            nutritionEnergyCorr > 0
              ? 'Maintain adequate caloric intake for sustained energy'
              : 'Consider adjusting caloric intake or timing for better energy management'
          ],
          significance: Math.abs(nutritionEnergyCorr) > 0.5 ? 'high' : 'medium',
          createdAt: new Date()
        })
      }

      // Save patterns to database
      if (patterns.length > 0) {
        const { error } = await supabase
          .from('pattern_analyses')
          .insert(patterns)

        if (error) throw error
      }

      return patterns
    } catch (error) {
      console.error('Error analyzing patterns:', error)
      throw error
    }
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0

    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    return denominator === 0 ? 0 : numerator / denominator
  }

  private calculateConfidence(correlation: number, sampleSize: number): number {
    // Simplified confidence calculation based on correlation strength and sample size
    const baseConfidence = Math.abs(correlation) * 100
    const sampleAdjustment = Math.min(sampleSize / 30, 1) * 20
    return Math.min(100, baseConfidence + sampleAdjustment)
  }

  // Fitness Testing Methods
  async createFitnessTest(test: Omit<FitnessTest, 'id'>): Promise<FitnessTest> {
    try {
      const newTest: FitnessTest = {
        ...test,
        id: `test_${Date.now()}`
      }

      const { error } = await supabase
        .from('fitness_tests')
        .insert(newTest)

      if (error) throw error

      // Update related goals if applicable
      await this.updateGoalProgress(test.userId)

      return newTest
    } catch (error) {
      console.error('Error creating fitness test:', error)
      throw error
    }
  }

  async getTestHistory(userId: string, testType?: string): Promise<FitnessTest[]> {
    try {
      let query = supabase
        .from('fitness_tests')
        .select('*')
        .eq('user_id', userId)

      if (testType) {
        query = query.eq('test_type->name', testType)
      }

      const { data, error } = await query.order('date', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error getting test history:', error)
      throw error
    }
  }

  // Goal Management Methods
  async createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    try {
      const newGoal: Goal = {
        ...goal,
        id: `goal_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Calculate initial success probability
      newGoal.successProbability = await this.calculateSuccessProbability(newGoal)

      const { error } = await supabase
        .from('goals')
        .insert(newGoal)

      if (error) throw error

      return newGoal
    } catch (error) {
      console.error('Error creating goal:', error)
      throw error
    }
  }

  async updateGoalProgress(userId: string): Promise<void> {
    try {
      // Get all active goals for user
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')

      if (!goals) return

      // Update progress for each goal based on recent data
      for (const goal of goals) {
        const updatedGoal = await this.calculateGoalProgress(goal)

        await supabase
          .from('goals')
          .update({
            current_value: updatedGoal.currentValue,
            success_probability: updatedGoal.successProbability,
            updated_at: new Date().toISOString()
          })
          .eq('id', goal.id)
      }
    } catch (error) {
      console.error('Error updating goal progress:', error)
      throw error
    }
  }

  private async calculateSuccessProbability(goal: Goal): Promise<number> {
    // Simplified success probability calculation
    // In a real implementation, this would use ML models and historical data

    const timeRemaining = goal.deadline.getTime() - Date.now()
    const totalTime = goal.deadline.getTime() - goal.createdAt.getTime()
    const timeProgress = 1 - (timeRemaining / totalTime)

    const valueProgress = goal.currentValue / goal.targetValue

    // Basic heuristic: if progress is ahead of time, higher probability
    if (valueProgress > timeProgress) {
      return Math.min(95, 70 + (valueProgress - timeProgress) * 50)
    } else {
      return Math.max(10, 70 - (timeProgress - valueProgress) * 40)
    }
  }

  private async calculateGoalProgress(goal: Goal): Promise<Goal> {
    // This would fetch recent test results or training data to update current value
    // For now, we'll return the goal unchanged
    return goal
  }

  // Goal Management Methods
  async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from('elite_training_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(goal => ({
        id: goal.id,
        userId: goal.user_id,
        type: goal.type,
        category: goal.category,
        title: goal.title,
        description: goal.description,
        targetValue: goal.target_value,
        currentValue: goal.current_value,
        unit: goal.unit,
        deadline: new Date(goal.deadline),
        priority: goal.priority,
        parentGoalId: goal.parent_goal_id,
        subGoals: [],
        milestones: goal.milestones || [],
        status: goal.status,
        successProbability: goal.success_probability,
        createdAt: new Date(goal.created_at),
        updatedAt: new Date(goal.updated_at)
      }))
    } catch (error) {
      console.error('Error getting user goals:', error)
      throw error
    }
  }

  async createGoal(goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    try {
      const { data, error } = await supabase
        .from('elite_training_goals')
        .insert({
          user_id: goalData.userId,
          type: goalData.type,
          category: goalData.category,
          title: goalData.title,
          description: goalData.description,
          target_value: goalData.targetValue,
          current_value: goalData.currentValue,
          unit: goalData.unit,
          deadline: goalData.deadline.toISOString(),
          priority: goalData.priority,
          parent_goal_id: goalData.parentGoalId,
          milestones: goalData.milestones,
          status: goalData.status
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        category: data.category,
        title: data.title,
        description: data.description,
        targetValue: data.target_value,
        currentValue: data.current_value,
        unit: data.unit,
        deadline: new Date(data.deadline),
        priority: data.priority,
        parentGoalId: data.parent_goal_id,
        subGoals: [],
        milestones: data.milestones || [],
        status: data.status,
        successProbability: data.success_probability,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error creating goal:', error)
      throw error
    }
  }

  async updateGoalProgress(goalId: string, newValue: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('elite_training_goals')
        .update({
          current_value: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating goal progress:', error)
      throw error
    }
  }

  // Training Plan Methods
  async getUserTrainingPlans(userId: string): Promise<TrainingPlan[]> {
    try {
      const { data, error } = await supabase
        .from('elite_training_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(plan => ({
        id: plan.id,
        userId: plan.user_id,
        name: plan.name,
        description: plan.description,
        type: plan.type,
        duration: plan.duration_weeks,
        currentWeek: plan.current_week,
        goals: plan.goal_ids || [],
        phases: plan.phases || [],
        autoAdjustments: plan.auto_adjustments,
        lastOptimized: plan.last_optimized ? new Date(plan.last_optimized) : new Date(),
        createdAt: new Date(plan.created_at),
        updatedAt: new Date(plan.updated_at)
      }))
    } catch (error) {
      console.error('Error getting user training plans:', error)
      throw error
    }
  }

  async createTrainingPlan(planData: Omit<TrainingPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<TrainingPlan> {
    try {
      const { data, error } = await supabase
        .from('elite_training_plans')
        .insert({
          user_id: planData.userId,
          name: planData.name,
          description: planData.description,
          type: planData.type,
          duration_weeks: planData.duration,
          current_week: planData.currentWeek,
          goal_ids: planData.goals,
          phases: planData.phases,
          auto_adjustments: planData.autoAdjustments
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description,
        type: data.type,
        duration: data.duration_weeks,
        currentWeek: data.current_week,
        goals: data.goal_ids || [],
        phases: data.phases || [],
        autoAdjustments: data.auto_adjustments,
        lastOptimized: data.last_optimized ? new Date(data.last_optimized) : new Date(),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error creating training plan:', error)
      throw error
    }
  }

  // Training Plan Optimization
  async optimizeTrainingPlan(userId: string, planId: string): Promise<TrainingPlan> {
    try {
      // Get current plan
      const { data: plan } = await supabase
        .from('elite_training_plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (!plan) throw new Error('Plan not found')

      // Get recent performance data
      const recentData = await this.getRecentPerformanceData(userId)

      // Use AI to optimize plan
      const optimizedPlan = await this.generateOptimizedPlan(plan, recentData)

      // Update plan in database
      const { error } = await supabase
        .from('elite_training_plans')
        .update({
          ...optimizedPlan,
          last_optimized: new Date().toISOString()
        })
        .eq('id', planId)

      if (error) throw error

      return optimizedPlan
    } catch (error) {
      console.error('Error optimizing training plan:', error)
      throw error
    }
  }

  private async getRecentPerformanceData(userId: string): Promise<any> {
    // Get recent journal entries, test results, and goal progress
    const [journalData, testData, goalData] = await Promise.all([
      this.getJournalEntries(userId, 30), // Last 30 days
      this.getTestHistory(userId),
      this.getUserGoals(userId)
    ])

    return {
      journalEntries: journalData,
      testResults: testData,
      goals: goalData,
      timestamp: new Date()
    }
  }

  private async generateOptimizedPlan(plan: any, performanceData: any): Promise<TrainingPlan> {
    // AI optimization logic would go here
    // For now, return the plan with minor adjustments

    // Simulate AI optimization by adjusting phases based on performance
    const optimizedPhases = plan.phases.map((phase: any) => ({
      ...phase,
      volumeMultiplier: phase.volumeMultiplier * (0.95 + Math.random() * 0.1), // ±5% adjustment
      intensityRange: {
        min: Math.max(phase.intensityRange.min - 2, 50),
        max: Math.min(phase.intensityRange.max + 2, 100)
      }
    }))

    return {
      id: plan.id,
      userId: plan.user_id,
      name: plan.name,
      description: plan.description,
      type: plan.type,
      duration: plan.duration_weeks,
      currentWeek: plan.current_week,
      goals: plan.goal_ids || [],
      phases: optimizedPhases,
      autoAdjustments: plan.auto_adjustments,
      lastOptimized: new Date(),
      createdAt: new Date(plan.created_at),
      updatedAt: new Date()
    }
  }

  // Additional helper methods
  async getJournalEntries(userId: string, days?: number): Promise<TrainingJournalEntry[]> {
    try {
      let query = supabase
        .from('training_journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (days) {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        query = query.gte('date', startDate.toISOString())
      }

      const { data, error } = await query

      if (error) throw error

      return data.map(entry => ({
        id: entry.id,
        userId: entry.user_id,
        date: new Date(entry.date),
        title: entry.title,
        content: entry.content,
        tags: entry.tags || [],
        templateId: entry.template_id,
        objectiveData: entry.objective_data || {},
        subjectiveData: entry.subjective_data || {},
        attachments: entry.attachments || [],
        createdAt: new Date(entry.created_at),
        updatedAt: new Date(entry.updated_at)
      }))
    } catch (error) {
      console.error('Error getting journal entries:', error)
      throw error
    }
  }
}

// Export singleton instance
export const eliteTrainingSystem = EliteTrainingSystem.getInstance()
