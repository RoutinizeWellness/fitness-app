"use client"

import { supabase } from "@/lib/supabase-client"

// Core AI System Types
export interface UserSegment {
  id: string
  name: string
  criteria: SegmentCriteria
  userCount: number
  engagementScore: number
  retentionRate: number
  createdAt: Date
  updatedAt: Date
}

export interface SegmentCriteria {
  activityLevel: 'low' | 'medium' | 'high'
  commitmentScore: number // 0-100
  fitnessGoals: string[]
  completionRate: number // 0-100
  lastActiveWithin: number // days
  deviceTypes: string[]
  preferredWorkoutTimes: string[]
}

export interface AIRecommendation {
  id: string
  userId: string
  type: 'routine' | 'nutrition' | 'recovery' | 'motivation'
  content: any
  confidence: number // 0-1
  reasoning: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  createdAt: Date
  expiresAt: Date
}

export interface PredictiveAnalytics {
  userId: string
  churnRisk: number // 0-1
  engagementTrend: 'increasing' | 'stable' | 'decreasing'
  nextLikelyAction: string
  optimalInterventionTime: Date
  recommendedActions: string[]
}

export interface AIModelMetrics {
  modelName: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  lastTrainingDate: Date
  trainingDataSize: number
  status: 'active' | 'training' | 'deprecated'
}

// Progressive AI Learning System
export class ProgressiveAISystem {
  private static instance: ProgressiveAISystem
  private models: Map<string, AIModelMetrics> = new Map()

  static getInstance(): ProgressiveAISystem {
    if (!ProgressiveAISystem.instance) {
      ProgressiveAISystem.instance = new ProgressiveAISystem()
    }
    return ProgressiveAISystem.instance
  }

  // Rule-based recommendation engine (Phase 1)
  async generateRuleBasedRecommendations(userId: string): Promise<AIRecommendation[]> {
    try {
      // Get user profile and activity data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const { data: workoutLogs } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30)

      if (!profile || !workoutLogs) return []

      const recommendations: AIRecommendation[] = []

      // Rule 1: Beginner gets basic routines
      if (profile.experience_level === 'beginner') {
        recommendations.push({
          id: `rec_${Date.now()}_1`,
          userId,
          type: 'routine',
          content: {
            routineType: 'beginner_full_body',
            frequency: 3,
            duration: 30
          },
          confidence: 0.9,
          reasoning: 'User is a beginner, recommending full-body routine 3x per week',
          status: 'pending',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        })
      }

      // Rule 2: Low completion rate gets easier routines
      const completionRate = this.calculateCompletionRate(workoutLogs)
      if (completionRate < 0.5) {
        recommendations.push({
          id: `rec_${Date.now()}_2`,
          userId,
          type: 'routine',
          content: {
            adjustment: 'reduce_intensity',
            newDuration: Math.max(15, profile.preferred_workout_duration * 0.8)
          },
          confidence: 0.8,
          reasoning: `Low completion rate (${Math.round(completionRate * 100)}%), suggesting easier routines`,
          status: 'pending',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
        })
      }

      // Rule 3: Inactive users get motivational content
      const daysSinceLastWorkout = this.getDaysSinceLastActivity(workoutLogs)
      if (daysSinceLastWorkout > 7) {
        recommendations.push({
          id: `rec_${Date.now()}_3`,
          userId,
          type: 'motivation',
          content: {
            message: 'We miss you! Ready to get back on track?',
            incentive: 'quick_win_workout',
            duration: 10
          },
          confidence: 0.7,
          reasoning: `User inactive for ${daysSinceLastWorkout} days`,
          status: 'pending',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
        })
      }

      return recommendations
    } catch (error) {
      console.error('Error generating rule-based recommendations:', error)
      return []
    }
  }

  // Intelligent User Segmentation
  async segmentUsers(): Promise<UserSegment[]> {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')

      const { data: workoutLogs } = await supabase
        .from('workout_logs')
        .select('*')

      if (!profiles || !workoutLogs) return []

      const segments: UserSegment[] = []

      // Segment 1: High Performers
      const highPerformers = profiles.filter(profile => {
        const userLogs = workoutLogs.filter(log => log.user_id === profile.id)
        const completionRate = this.calculateCompletionRate(userLogs)
        const consistency = this.calculateConsistency(userLogs)
        return completionRate > 0.8 && consistency > 0.7
      })

      segments.push({
        id: 'high_performers',
        name: 'High Performers',
        criteria: {
          activityLevel: 'high',
          commitmentScore: 85,
          fitnessGoals: ['strength', 'endurance'],
          completionRate: 80,
          lastActiveWithin: 3,
          deviceTypes: ['mobile', 'wearable'],
          preferredWorkoutTimes: ['morning', 'evening']
        },
        userCount: highPerformers.length,
        engagementScore: 92,
        retentionRate: 95,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Segment 2: At Risk Users
      const atRiskUsers = profiles.filter(profile => {
        const userLogs = workoutLogs.filter(log => log.user_id === profile.id)
        const daysSinceLastActivity = this.getDaysSinceLastActivity(userLogs)
        const completionRate = this.calculateCompletionRate(userLogs)
        return daysSinceLastActivity > 7 || completionRate < 0.3
      })

      segments.push({
        id: 'at_risk',
        name: 'At Risk Users',
        criteria: {
          activityLevel: 'low',
          commitmentScore: 25,
          fitnessGoals: [],
          completionRate: 30,
          lastActiveWithin: 14,
          deviceTypes: ['mobile'],
          preferredWorkoutTimes: []
        },
        userCount: atRiskUsers.length,
        engagementScore: 35,
        retentionRate: 45,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Segment 3: Steady Progressors
      const steadyProgressors = profiles.filter(profile => {
        const userLogs = workoutLogs.filter(log => log.user_id === profile.id)
        const completionRate = this.calculateCompletionRate(userLogs)
        const consistency = this.calculateConsistency(userLogs)
        return completionRate >= 0.5 && completionRate <= 0.8 && consistency >= 0.5
      })

      segments.push({
        id: 'steady_progressors',
        name: 'Steady Progressors',
        criteria: {
          activityLevel: 'medium',
          commitmentScore: 65,
          fitnessGoals: ['general_fitness', 'weight_loss'],
          completionRate: 65,
          lastActiveWithin: 7,
          deviceTypes: ['mobile'],
          preferredWorkoutTimes: ['evening']
        },
        userCount: steadyProgressors.length,
        engagementScore: 72,
        retentionRate: 78,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return segments
    } catch (error) {
      console.error('Error segmenting users:', error)
      return []
    }
  }

  // Predictive Analytics for User Retention
  async generatePredictiveAnalytics(userId: string): Promise<PredictiveAnalytics | null> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const { data: workoutLogs } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(60)

      if (!profile || !workoutLogs) return null

      const completionRate = this.calculateCompletionRate(workoutLogs)
      const consistency = this.calculateConsistency(workoutLogs)
      const daysSinceLastActivity = this.getDaysSinceLastActivity(workoutLogs)
      const engagementTrend = this.calculateEngagementTrend(workoutLogs)

      // Calculate churn risk (0-1)
      let churnRisk = 0
      if (daysSinceLastActivity > 14) churnRisk += 0.4
      if (completionRate < 0.3) churnRisk += 0.3
      if (consistency < 0.4) churnRisk += 0.2
      if (engagementTrend === 'decreasing') churnRisk += 0.1

      churnRisk = Math.min(1, churnRisk)

      // Determine optimal intervention time
      const optimalInterventionTime = new Date()
      if (churnRisk > 0.7) {
        // High risk - intervene immediately
        optimalInterventionTime.setHours(optimalInterventionTime.getHours() + 2)
      } else if (churnRisk > 0.4) {
        // Medium risk - intervene within 24 hours
        optimalInterventionTime.setDate(optimalInterventionTime.getDate() + 1)
      } else {
        // Low risk - intervene within a week
        optimalInterventionTime.setDate(optimalInterventionTime.getDate() + 7)
      }

      // Generate recommended actions
      const recommendedActions: string[] = []
      if (churnRisk > 0.6) {
        recommendedActions.push('send_personalized_motivation')
        recommendedActions.push('offer_easier_routine')
        recommendedActions.push('schedule_check_in_call')
      } else if (churnRisk > 0.3) {
        recommendedActions.push('send_progress_reminder')
        recommendedActions.push('suggest_workout_buddy')
      } else {
        recommendedActions.push('celebrate_progress')
        recommendedActions.push('suggest_new_challenge')
      }

      return {
        userId,
        churnRisk,
        engagementTrend,
        nextLikelyAction: this.predictNextAction(workoutLogs, profile),
        optimalInterventionTime,
        recommendedActions
      }
    } catch (error) {
      console.error('Error generating predictive analytics:', error)
      return null
    }
  }

  // Helper methods
  private calculateCompletionRate(workoutLogs: any[]): number {
    if (workoutLogs.length === 0) return 0
    const completed = workoutLogs.filter(log => log.completed).length
    return completed / workoutLogs.length
  }

  private calculateConsistency(workoutLogs: any[]): number {
    if (workoutLogs.length < 7) return 0
    
    // Calculate workout frequency over the last 4 weeks
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    
    const recentLogs = workoutLogs.filter(log => 
      new Date(log.created_at) > fourWeeksAgo
    )
    
    const weeksWithWorkouts = new Set(
      recentLogs.map(log => {
        const date = new Date(log.created_at)
        return Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000))
      })
    ).size
    
    return weeksWithWorkouts / 4 // 4 weeks
  }

  private getDaysSinceLastActivity(workoutLogs: any[]): number {
    if (workoutLogs.length === 0) return Infinity
    const lastActivity = new Date(workoutLogs[0].created_at)
    const now = new Date()
    return Math.floor((now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000))
  }

  private calculateEngagementTrend(workoutLogs: any[]): 'increasing' | 'stable' | 'decreasing' {
    if (workoutLogs.length < 14) return 'stable'
    
    const recentLogs = workoutLogs.slice(0, 7)
    const olderLogs = workoutLogs.slice(7, 14)
    
    const recentCompletionRate = this.calculateCompletionRate(recentLogs)
    const olderCompletionRate = this.calculateCompletionRate(olderLogs)
    
    const difference = recentCompletionRate - olderCompletionRate
    
    if (difference > 0.1) return 'increasing'
    if (difference < -0.1) return 'decreasing'
    return 'stable'
  }

  private predictNextAction(workoutLogs: any[], profile: any): string {
    const daysSinceLastActivity = this.getDaysSinceLastActivity(workoutLogs)
    const completionRate = this.calculateCompletionRate(workoutLogs)
    
    if (daysSinceLastActivity > 3) return 'likely_to_skip_next_workout'
    if (completionRate > 0.8) return 'likely_to_complete_next_workout'
    if (completionRate < 0.3) return 'likely_to_need_motivation'
    return 'likely_to_continue_current_pattern'
  }
}

// Export singleton instance
export const aiSystem = ProgressiveAISystem.getInstance()
