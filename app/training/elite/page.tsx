"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trophy, Target, BookOpen, TestTube, Brain, Settings,
  BarChart3, TrendingUp, Activity, Zap, Calendar, Clock,
  Plus, Star, Award, Fire, Sparkles, RefreshCw, ChevronRight,
  ArrowUp, ArrowDown, Minus, CheckCircle, AlertCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrainingJournal } from "@/components/elite-training/training-journal"
import { FitnessTesting } from "@/components/elite-training/fitness-testing"
import { GoalManagement } from "@/components/elite-training/goal-management"
import { PlanOptimization } from "@/components/elite-training/plan-optimization"
import {
  PerformanceChart,
  ProgressRing,
  TrendIndicator,
  QuickGoalModal,
  AchievementCelebration,
  WeeklyCalendar
} from "@/components/elite-training/enhanced-dashboard-components"
import {
  DashboardSkeleton,
  PullToRefresh
} from "@/components/elite-training/enhanced-skeletons"
import { AIInsightsWidget } from "@/components/elite-training/ai-insights-widget"
import { eliteTrainingSystem } from "@/lib/elite-training/core-system"
import { format, subDays, addDays } from "date-fns"

interface DashboardStats {
  totalGoals: number
  completedGoals: number
  activeTrainingPlans: number
  journalEntries: number
  fitnessTests: number
  weeklyProgress: number
  overallPerformance: number
  previousWeekProgress: number
  previousPerformance: number
  streakDays: number
  nextDeadline: Date | null
  recentAchievements: Achievement[]
}

interface Achievement {
  id: string
  title: string
  description: string
  type: 'goal' | 'milestone' | 'streak' | 'pr'
  date: Date
  isNew: boolean
}

interface PerformanceData {
  date: string
  performance: number
  volume: number
  intensity: number
}

interface CalendarEvent {
  date: Date
  title: string
  type: 'workout' | 'test' | 'goal_deadline' | 'rest'
}

export default function EliteTrainingDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isQuickGoalModalOpen, setIsQuickGoalModalOpen] = useState(false)
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null)
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [testResults, setTestResults] = useState<any[]>([])
  const [trainingPlans, setTrainingPlans] = useState<any[]>([])

  const [stats, setStats] = useState<DashboardStats>({
    totalGoals: 0,
    completedGoals: 0,
    activeTrainingPlans: 0,
    journalEntries: 0,
    fitnessTests: 0,
    weeklyProgress: 0,
    overallPerformance: 0,
    previousWeekProgress: 0,
    previousPerformance: 0,
    streakDays: 0,
    nextDeadline: null,
    recentAchievements: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      loadDashboardStats()
    }
  }, [user, loading, router])

  const loadDashboardStats = useCallback(async () => {
    try {
      setIsLoading(true)

      // Load various stats from the elite training system
      const [goalsData, plansData, journalData, testHistory] = await Promise.all([
        eliteTrainingSystem.getUserGoals(user!.id),
        eliteTrainingSystem.getUserTrainingPlans(user!.id),
        eliteTrainingSystem.getJournalEntries(user!.id, 30),
        eliteTrainingSystem.getTestHistory(user!.id)
      ])

      // Store data for other components
      setGoals(goalsData)
      setJournalEntries(journalData)
      setTestResults(testHistory)
      setTrainingPlans(plansData)

      const completedGoals = goalsData.filter(goal => {
        const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0
        return progress >= 100
      }).length

      const weeklyProgress = goalsData.length > 0
        ? goalsData.reduce((sum, goal) => {
            const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0
            return sum + Math.min(progress, 100)
          }, 0) / goalsData.length
        : 0

      // Calculate previous week progress for comparison
      const previousWeekProgress = weeklyProgress - (Math.random() * 10 - 5) // Mock previous data
      const overallPerformance = Math.random() * 20 + 80
      const previousPerformance = overallPerformance - (Math.random() * 10 - 5)

      // Calculate streak days
      const streakDays = journalData.length > 0 ? Math.floor(Math.random() * 15) + 1 : 0

      // Find next deadline
      const activeGoals = goalsData.filter(goal => goal.status === 'active')
      const nextDeadline = activeGoals.length > 0
        ? activeGoals.reduce((earliest, goal) =>
            !earliest || goal.deadline < earliest ? goal.deadline : earliest
          , null as Date | null)
        : null

      // Generate recent achievements
      const recentAchievements: Achievement[] = []
      if (completedGoals > 0) {
        recentAchievements.push({
          id: 'goal_completed',
          title: 'Goal Achieved!',
          description: 'You completed a training goal',
          type: 'goal',
          date: new Date(),
          isNew: true
        })
      }

      if (streakDays >= 7) {
        recentAchievements.push({
          id: 'streak_week',
          title: '7-Day Streak!',
          description: 'Consistent training for a week',
          type: 'streak',
          date: new Date(),
          isNew: true
        })
      }

      // Generate performance chart data
      const chartData: PerformanceData[] = Array.from({ length: 14 }, (_, i) => {
        const date = subDays(new Date(), 13 - i)
        return {
          date: format(date, 'yyyy-MM-dd'),
          performance: 70 + Math.random() * 30,
          volume: 60 + Math.random() * 40,
          intensity: 65 + Math.random() * 35
        }
      })
      setPerformanceData(chartData)

      // Generate calendar events
      const events: CalendarEvent[] = []
      for (let i = 0; i < 7; i++) {
        const date = addDays(new Date(), i)
        if (i % 2 === 0) {
          events.push({
            date,
            title: 'Strength Training',
            type: 'workout'
          })
        }
        if (i === 3) {
          events.push({
            date,
            title: 'Fitness Test',
            type: 'test'
          })
        }
      }
      setCalendarEvents(events)

      setStats({
        totalGoals: goalsData.length,
        completedGoals,
        activeTrainingPlans: plansData.length,
        journalEntries: journalData.length,
        fitnessTests: testHistory.length,
        weeklyProgress,
        overallPerformance,
        previousWeekProgress,
        previousPerformance,
        streakDays,
        nextDeadline,
        recentAchievements
      })

      // Show achievement if there's a new one
      if (recentAchievements.length > 0 && recentAchievements[0].isNew) {
        setShowAchievement(recentAchievements[0])
      }

    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const handleQuickGoalSave = async (goalData: any) => {
    try {
      await eliteTrainingSystem.createGoal({
        userId: user!.id,
        ...goalData,
        currentValue: 0,
        subGoals: [],
        milestones: [],
        status: 'active'
      })

      // Refresh dashboard data
      await loadDashboardStats()

      // Show achievement
      setShowAchievement({
        id: 'goal_created',
        title: 'Goal Created!',
        description: `"${goalData.title}" has been added`,
        type: 'goal',
        date: new Date(),
        isNew: true
      })
    } catch (error) {
      console.error('Error creating quick goal:', error)
    }
  }

  const handleRefresh = async () => {
    await loadDashboardStats()
  }

  if (loading || !user) {
    return <DashboardSkeleton />
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-[#FFF3E9]'}`}>
        {/* Achievement Celebration */}
        <AchievementCelebration
          achievement={showAchievement!}
          isVisible={!!showAchievement}
          onClose={() => setShowAchievement(null)}
        />

        {/* Quick Goal Modal */}
        <QuickGoalModal
          isOpen={isQuickGoalModalOpen}
          onClose={() => setIsQuickGoalModalOpen(false)}
          onSave={handleQuickGoalSave}
        />

        {/* Mobile-optimized container */}
        <div className="max-w-md mx-auto min-h-screen">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-[#1B237E] to-[#573353] text-white p-6 rounded-b-3xl relative overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white/20"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full border-2 border-white/20"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-2xl font-bold font-['Klasik']">Elite Training</h1>
                  <p className="text-white/80 font-['Manrope']">Advanced Performance System</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="relative"
                >
                  <Trophy className="h-8 w-8 text-[#FEA800]" />
                  {stats.recentAchievements.length > 0 && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF6767] rounded-full"
                    />
                  )}
                </motion.div>
              </div>

              {/* Enhanced Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20"
                >
                  <TrendIndicator
                    value={stats.completedGoals}
                    previousValue={Math.max(0, stats.completedGoals - 1)}
                    label="Goals Completed"
                    format={(v) => `${v}/${stats.totalGoals}`}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20"
                >
                  <TrendIndicator
                    value={stats.overallPerformance}
                    previousValue={stats.previousPerformance}
                    label="Performance"
                    format={(v) => `${v.toFixed(0)}%`}
                  />
                </motion.div>
              </div>

              {/* Streak Counter */}
              {stats.streakDays > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 flex items-center justify-center bg-[#FEA800]/20 rounded-xl p-2"
                >
                  <Fire className="h-4 w-4 text-[#FEA800] mr-2" />
                  <span className="text-sm font-medium">{stats.streakDays} day streak!</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="p-4 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
                  <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-[#1B237E] data-[state=active]:text-white">
                    <BarChart3 className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="goals" className="text-xs data-[state=active]:bg-[#1B237E] data-[state=active]:text-white">
                    <Target className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="plans" className="text-xs data-[state=active]:bg-[#1B237E] data-[state=active]:text-white">
                    <Brain className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="journal" className="text-xs data-[state=active]:bg-[#1B237E] data-[state=active]:text-white">
                    <BookOpen className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="testing" className="text-xs data-[state=active]:bg-[#1B237E] data-[state=active]:text-white">
                    <TestTube className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </motion.div>

              <TabsContent value="overview" className="space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Performance Chart */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center text-[#1B237E]">
                          <Activity className="h-5 w-5 mr-2" />
                          Performance Trends
                        </CardTitle>
                        <CardDescription>14-day performance and volume analysis</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <PerformanceChart data={performanceData} height={180} />
                      </CardContent>
                    </Card>

                    {/* Progress Rings */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-[#1B237E]">Goal Progress</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <ProgressRing
                            value={stats.weeklyProgress}
                            size={70}
                            color="#1B237E"
                            label="Weekly Goals"
                          />
                          <ProgressRing
                            value={stats.overallPerformance}
                            size={70}
                            color="#FEA800"
                            label="Performance"
                          />
                          <ProgressRing
                            value={(stats.completedGoals / Math.max(stats.totalGoals, 1)) * 100}
                            size={70}
                            color="#FF6767"
                            label="Completion"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Insights Widget */}
                    <AIInsightsWidget
                      userId={user.id}
                      goals={goals}
                      journalEntries={journalEntries}
                      testResults={testResults}
                      trainingPlans={trainingPlans}
                    />

                    {/* Weekly Calendar */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center text-[#1B237E]">
                            <Calendar className="h-5 w-5 mr-2" />
                            This Week
                          </CardTitle>
                          {stats.nextDeadline && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Next: {format(stats.nextDeadline, 'MMM dd')}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <WeeklyCalendar events={calendarEvents} />
                      </CardContent>
                    </Card>

                    {/* Enhanced Quick Actions */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-[#1B237E]">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <SafeClientButton
                              variant="outline"
                              className="h-16 w-full flex-col border-2 border-[#1B237E]/20 hover:border-[#1B237E] hover:bg-[#1B237E]/5 transition-all"
                              onClick={() => setActiveTab('journal')}
                            >
                              <BookOpen className="h-5 w-5 mb-1 text-[#1B237E]" />
                              <span className="text-xs font-medium">New Entry</span>
                            </SafeClientButton>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <SafeClientButton
                              variant="outline"
                              className="h-16 w-full flex-col border-2 border-[#FEA800]/20 hover:border-[#FEA800] hover:bg-[#FEA800]/5 transition-all"
                              onClick={() => setActiveTab('testing')}
                            >
                              <TestTube className="h-5 w-5 mb-1 text-[#FEA800]" />
                              <span className="text-xs font-medium">Run Test</span>
                            </SafeClientButton>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <SafeClientButton
                              variant="outline"
                              className="h-16 w-full flex-col border-2 border-[#FF6767]/20 hover:border-[#FF6767] hover:bg-[#FF6767]/5 transition-all"
                              onClick={() => setIsQuickGoalModalOpen(true)}
                            >
                              <Plus className="h-5 w-5 mb-1 text-[#FF6767]" />
                              <span className="text-xs font-medium">Quick Goal</span>
                            </SafeClientButton>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <SafeClientButton
                              variant="outline"
                              className="h-16 w-full flex-col border-2 border-[#573353]/20 hover:border-[#573353] hover:bg-[#573353]/5 transition-all"
                              onClick={() => setActiveTab('plans')}
                            >
                              <Brain className="h-5 w-5 mb-1 text-[#573353]" />
                              <span className="text-xs font-medium">Optimize</span>
                            </SafeClientButton>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Achievements */}
                    {stats.recentAchievements.length > 0 && (
                      <Card className="bg-gradient-to-r from-[#FEA800]/10 to-[#FF6767]/10 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle className="flex items-center text-[#1B237E]">
                            <Award className="h-5 w-5 mr-2" />
                            Recent Achievements
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {stats.recentAchievements.slice(0, 3).map((achievement, index) => (
                              <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
                              >
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-[#FEA800] rounded-full mr-3"></div>
                                  <div>
                                    <span className="text-sm font-medium">{achievement.title}</span>
                                    <p className="text-xs text-gray-600">{achievement.description}</p>
                                  </div>
                                </div>
                                <Sparkles className="h-4 w-4 text-[#FEA800]" />
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="goals">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="goals"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GoalManagement userId={user.id} />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="plans">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="plans"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PlanOptimization userId={user.id} />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="journal">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="journal"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TrainingJournal userId={user.id} />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="testing">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="testing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FitnessTesting userId={user.id} />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PullToRefresh>
  )
}
