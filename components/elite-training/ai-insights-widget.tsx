"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain, TrendingUp, Target, Zap, AlertCircle, CheckCircle,
  Lightbulb, BarChart3, Calendar, Clock, Award, Star,
  ChevronRight, RefreshCw, Sparkles, Activity
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { format, addDays, differenceInDays } from "date-fns"

interface AIInsight {
  id: string
  type: 'recommendation' | 'prediction' | 'correlation' | 'warning' | 'achievement'
  title: string
  description: string
  confidence: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionable: boolean
  data?: any
  createdAt: Date
}

interface AIInsightsWidgetProps {
  userId: string
  goals: any[]
  journalEntries: any[]
  testResults: any[]
  trainingPlans: any[]
}

export function AIInsightsWidget({ 
  userId, 
  goals, 
  journalEntries, 
  testResults, 
  trainingPlans 
}: AIInsightsWidgetProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)

  useEffect(() => {
    generateInsights()
  }, [goals, journalEntries, testResults, trainingPlans])

  const generateInsights = async () => {
    setIsGenerating(true)
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const generatedInsights: AIInsight[] = []

    // Goal completion predictions
    goals.forEach(goal => {
      const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0
      const daysUntilDeadline = differenceInDays(goal.deadline, new Date())
      
      if (progress < 50 && daysUntilDeadline < 30) {
        generatedInsights.push({
          id: `goal_risk_${goal.id}`,
          type: 'warning',
          title: 'Goal at Risk',
          description: `"${goal.title}" may not be achieved by deadline. Consider adjusting target or timeline.`,
          confidence: 85,
          priority: 'high',
          actionable: true,
          data: { goalId: goal.id, progress, daysLeft: daysUntilDeadline },
          createdAt: new Date()
        })
      } else if (progress > 80) {
        generatedInsights.push({
          id: `goal_success_${goal.id}`,
          type: 'prediction',
          title: 'Goal Success Likely',
          description: `"${goal.title}" is on track for completion. Consider setting a stretch goal.`,
          confidence: 92,
          priority: 'medium',
          actionable: true,
          data: { goalId: goal.id, progress },
          createdAt: new Date()
        })
      }
    })

    // Training consistency analysis
    if (journalEntries.length >= 7) {
      const recentEntries = journalEntries.slice(0, 7)
      const avgMood = recentEntries.reduce((sum, entry) => sum + (entry.subjectiveData?.mood || 7), 0) / recentEntries.length
      const avgEnergy = recentEntries.reduce((sum, entry) => sum + (entry.subjectiveData?.energy || 7), 0) / recentEntries.length
      
      if (avgMood < 6) {
        generatedInsights.push({
          id: 'mood_trend',
          type: 'correlation',
          title: 'Mood Trend Analysis',
          description: `Your mood has been below average (${avgMood.toFixed(1)}/10). Consider adjusting training intensity or adding recovery days.`,
          confidence: 78,
          priority: 'medium',
          actionable: true,
          data: { avgMood, avgEnergy },
          createdAt: new Date()
        })
      }

      if (avgEnergy > 8) {
        generatedInsights.push({
          id: 'energy_optimization',
          type: 'recommendation',
          title: 'Energy Optimization',
          description: `High energy levels detected (${avgEnergy.toFixed(1)}/10). You may be able to increase training volume or intensity.`,
          confidence: 82,
          priority: 'medium',
          actionable: true,
          data: { avgEnergy },
          createdAt: new Date()
        })
      }
    }

    // Performance correlation insights
    if (testResults.length >= 2) {
      const latestTest = testResults[0]
      const previousTest = testResults[1]
      
      if (latestTest.results.score > previousTest.results.score) {
        const improvement = ((latestTest.results.score - previousTest.results.score) / previousTest.results.score) * 100
        generatedInsights.push({
          id: 'performance_improvement',
          type: 'achievement',
          title: 'Performance Improvement',
          description: `${improvement.toFixed(1)}% improvement in ${latestTest.testName}. Your training adaptations are working!`,
          confidence: 95,
          priority: 'high',
          actionable: false,
          data: { improvement, testName: latestTest.testName },
          createdAt: new Date()
        })
      }
    }

    // Training plan optimization suggestions
    if (trainingPlans.length > 0) {
      const activePlan = trainingPlans.find(plan => plan.currentWeek <= plan.duration)
      if (activePlan && activePlan.currentWeek > activePlan.duration * 0.5) {
        generatedInsights.push({
          id: 'plan_midpoint',
          type: 'recommendation',
          title: 'Plan Midpoint Review',
          description: `You're halfway through "${activePlan.name}". Consider scheduling a progress assessment and plan adjustment.`,
          confidence: 88,
          priority: 'medium',
          actionable: true,
          data: { planId: activePlan.id, progress: (activePlan.currentWeek / activePlan.duration) * 100 },
          createdAt: new Date()
        })
      }
    }

    // Recovery recommendations
    const recentHighIntensityDays = journalEntries.filter(entry => 
      entry.subjectiveData?.energy > 8 && 
      differenceInDays(new Date(), entry.date) <= 3
    ).length

    if (recentHighIntensityDays >= 3) {
      generatedInsights.push({
        id: 'recovery_needed',
        type: 'warning',
        title: 'Recovery Recommended',
        description: 'High intensity detected for 3+ consecutive days. Consider scheduling a recovery day to prevent overtraining.',
        confidence: 90,
        priority: 'high',
        actionable: true,
        data: { consecutiveDays: recentHighIntensityDays },
        createdAt: new Date()
      })
    }

    // Predictive timeline analysis
    const activeGoals = goals.filter(goal => goal.status === 'active')
    if (activeGoals.length > 0) {
      const avgProgress = activeGoals.reduce((sum, goal) => {
        const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0
        return sum + progress
      }, 0) / activeGoals.length

      if (avgProgress > 75) {
        generatedInsights.push({
          id: 'goal_completion_prediction',
          type: 'prediction',
          title: 'Goal Completion Forecast',
          description: `Based on current progress (${avgProgress.toFixed(1)}%), you're likely to complete ${Math.ceil(activeGoals.length * 0.8)} of ${activeGoals.length} active goals on time.`,
          confidence: 87,
          priority: 'medium',
          actionable: false,
          data: { avgProgress, totalGoals: activeGoals.length },
          createdAt: new Date()
        })
      }
    }

    setInsights(generatedInsights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }))
    
    setIsGenerating(false)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return Lightbulb
      case 'prediction': return TrendingUp
      case 'correlation': return BarChart3
      case 'warning': return AlertCircle
      case 'achievement': return Award
      default: return Brain
    }
  }

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-[#1B237E]" />
            <CardTitle className="text-[#1B237E]">AI Insights</CardTitle>
          </div>
          <SafeClientButton
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </SafeClientButton>
        </div>
        <CardDescription>
          AI-powered analysis and recommendations for your training
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-8"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mx-auto mb-4"
                >
                  <Brain className="h-8 w-8 text-[#1B237E]" />
                </motion.div>
                <p className="text-sm text-gray-600">Analyzing your training data...</p>
              </div>
            </motion.div>
          ) : insights.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h3>
              <p className="text-gray-600 mb-4">Add more training data to get AI-powered insights</p>
            </motion.div>
          ) : (
            <motion.div
              key="insights"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {insights.slice(0, 5).map((insight, index) => {
                const Icon = getInsightIcon(insight.type)
                
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getInsightColor(insight.priority)}`}
                    onClick={() => setSelectedInsight(insight)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <Icon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">{insight.title}</h4>
                            <Badge className={`text-xs ml-2 ${getPriorityBadgeColor(insight.priority)}`}>
                              {insight.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{insight.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500">Confidence: {insight.confidence}%</span>
                              <Progress value={insight.confidence} className="w-12 h-1 ml-2" />
                            </div>
                            {insight.actionable && (
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              
              {insights.length > 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center pt-2"
                >
                  <SafeClientButton variant="outline" size="sm">
                    View All {insights.length} Insights
                  </SafeClientButton>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
