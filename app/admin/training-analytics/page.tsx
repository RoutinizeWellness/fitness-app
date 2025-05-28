"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton as Button } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Clock,
  Dumbbell,
  BarChart3,
  PieChart,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Zap,
  Brain,
  Eye,
  Shield,
  RefreshCw
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { advancedTrainingSystem, TrainingMetrics } from "@/lib/training/advanced-training-system"
import { aiSystem } from "@/lib/admin/ai-core-system"
import { RealTimeTrainingMonitor } from "@/components/admin/real-time-training-monitor"

interface TrainingAnalytics {
  totalWorkouts: number
  completionRate: number
  averageSessionDuration: number
  totalVolume: number
  activeUsers: number
  adherenceRate: number
  popularExercises: { name: string; count: number }[]
  weeklyTrends: { week: string; workouts: number; completion: number }[]
  userSegments: { segment: string; count: number; avgCompletion: number }[]
  volumeLandmarkStats: { muscleGroup: string; avgMEV: number; avgMAV: number; avgMRV: number }[]
}

interface UserTrainingData {
  userId: string
  userName: string
  email: string
  totalWorkouts: number
  completionRate: number
  lastWorkout: Date
  currentStreak: number
  averageRPE: number
  totalVolume: number
  riskLevel: 'low' | 'medium' | 'high'
  aiRecommendations: string[]
}

export default function TrainingAnalyticsPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [analytics, setAnalytics] = useState<TrainingAnalytics>({
    totalWorkouts: 2847,
    completionRate: 78.3,
    averageSessionDuration: 52,
    totalVolume: 1247500,
    activeUsers: 342,
    adherenceRate: 73.2,
    popularExercises: [
      { name: 'Sentadilla', count: 1250 },
      { name: 'Press de Banca', count: 1180 },
      { name: 'Peso Muerto', count: 980 },
      { name: 'Dominadas', count: 890 },
      { name: 'Press Militar', count: 750 }
    ],
    weeklyTrends: [
      { week: 'Sem 1', workouts: 245, completion: 82 },
      { week: 'Sem 2', workouts: 267, completion: 79 },
      { week: 'Sem 3', workouts: 289, completion: 85 },
      { week: 'Sem 4', workouts: 298, completion: 78 }
    ],
    userSegments: [
      { segment: 'Principiantes', count: 156, avgCompletion: 68 },
      { segment: 'Intermedios', count: 134, avgCompletion: 82 },
      { segment: 'Avanzados', count: 52, avgCompletion: 91 }
    ],
    volumeLandmarkStats: [
      { muscleGroup: 'Pecho', avgMEV: 12, avgMAV: 18, avgMRV: 24 },
      { muscleGroup: 'Espalda', avgMEV: 14, avgMAV: 20, avgMRV: 26 },
      { muscleGroup: 'Piernas', avgMEV: 16, avgMAV: 24, avgMRV: 32 },
      { muscleGroup: 'Hombros', avgMEV: 10, avgMAV: 16, avgMRV: 22 },
      { muscleGroup: 'Brazos', avgMEV: 8, avgMAV: 14, avgMRV: 20 }
    ]
  })

  const [userTrainingData, setUserTrainingData] = useState<UserTrainingData[]>([
    {
      userId: '1',
      userName: 'Carlos Mendoza',
      email: 'carlos@example.com',
      totalWorkouts: 45,
      completionRate: 89,
      lastWorkout: new Date('2024-01-18'),
      currentStreak: 7,
      averageRPE: 7.2,
      totalVolume: 12450,
      riskLevel: 'low',
      aiRecommendations: ['Aumentar volumen de piernas', 'Incluir más cardio']
    },
    {
      userId: '2',
      userName: 'Ana García',
      email: 'ana@example.com',
      totalWorkouts: 23,
      completionRate: 65,
      lastWorkout: new Date('2024-01-15'),
      currentStreak: 2,
      averageRPE: 8.1,
      totalVolume: 8920,
      riskLevel: 'medium',
      aiRecommendations: ['Reducir intensidad', 'Semana de descarga recomendada']
    },
    {
      userId: '3',
      userName: 'Miguel Torres',
      email: 'miguel@example.com',
      totalWorkouts: 12,
      completionRate: 42,
      lastWorkout: new Date('2024-01-10'),
      currentStreak: 0,
      averageRPE: 6.8,
      totalVolume: 4560,
      riskLevel: 'high',
      aiRecommendations: ['Intervención necesaria', 'Revisar plan de entrenamiento']
    }
  ])

  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(false)
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)

  useEffect(() => {
    if (!user || profile?.email !== 'admin@routinize.com') {
      router.push('/dashboard')
      return
    }

    loadTrainingAnalytics()

    if (realTimeUpdates) {
      const interval = setInterval(loadTrainingAnalytics, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [user, profile, router, selectedTimeRange, realTimeUpdates])

  const loadTrainingAnalytics = async () => {
    try {
      setIsLoading(true)

      // In a real implementation, this would fetch data from Supabase
      // For now, we'll simulate real-time updates

      // Simulate real-time data updates
      setAnalytics(prev => ({
        ...prev,
        totalWorkouts: prev.totalWorkouts + Math.floor(Math.random() * 5),
        completionRate: Math.max(70, Math.min(95, prev.completionRate + (Math.random() - 0.5) * 2)),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1
      }))

      // Load AI insights for users
      await loadAIInsights()

    } catch (error) {
      console.error('Error loading training analytics:', error)
      toast({
        title: "Error",
        description: "Failed to load training analytics",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadAIInsights = async () => {
    try {
      // Generate AI insights for each user
      const updatedUserData = await Promise.all(
        userTrainingData.map(async (userData) => {
          const recommendations = await advancedTrainingSystem.generateExerciseRecommendations(
            userData.userId,
            { exercises: [] }
          )

          return {
            ...userData,
            aiRecommendations: recommendations.slice(0, 2).map(rec => rec.message)
          }
        })
      )

      setUserTrainingData(updatedUserData)
    } catch (error) {
      console.error('Error loading AI insights:', error)
    }
  }

  const generateUserReport = async (userId: string) => {
    try {
      const user = userTrainingData.find(u => u.userId === userId)
      if (!user) return

      const metrics = await advancedTrainingSystem.calculateTrainingMetrics(userId)

      const reportData = {
        user: user.userName,
        generatedAt: new Date().toISOString(),
        metrics,
        recommendations: user.aiRecommendations,
        riskAssessment: user.riskLevel,
        summary: {
          totalWorkouts: user.totalWorkouts,
          completionRate: user.completionRate,
          currentStreak: user.currentStreak,
          averageRPE: user.averageRPE
        }
      }

      // Download report
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `training_report_${user.userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Report Generated",
        description: `Training report for ${user.userName} has been downloaded`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate user report",
        variant: "destructive"
      })
    }
  }

  const triggerAIIntervention = async (userId: string) => {
    try {
      const user = userTrainingData.find(u => u.userId === userId)
      if (!user) return

      // Simulate AI intervention
      const interventions = [
        'Personalized workout plan adjustment',
        'Motivational message sent',
        'Coach notification triggered',
        'Recovery week scheduled'
      ]

      const intervention = interventions[Math.floor(Math.random() * interventions.length)]

      toast({
        title: "AI Intervention Triggered",
        description: `${intervention} for ${user.userName}`,
      })

      // Update user risk level
      setUserTrainingData(prev => prev.map(u =>
        u.userId === userId
          ? { ...u, riskLevel: u.riskLevel === 'high' ? 'medium' : 'low' as const }
          : u
      ))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger AI intervention",
        variant: "destructive"
      })
    }
  }

  if (!user || profile?.email !== 'admin@routinize.com') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this area.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Training Analytics</h1>
            <p className="text-gray-600">Real-time training performance and user engagement analytics</p>
          </div>
          <div className="flex space-x-3">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={loadTrainingAnalytics}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Workouts</p>
                  <p className="text-3xl font-bold text-blue-600">{analytics.totalWorkouts.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% vs last month
                  </p>
                </div>
                <Activity className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-green-600">{analytics.completionRate}%</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3.2% vs last month
                  </p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-purple-600">{analytics.activeUsers}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% vs last month
                  </p>
                </div>
                <Users className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Session</p>
                  <p className="text-3xl font-bold text-orange-600">{analytics.averageSessionDuration}m</p>
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -2m vs last month
                  </p>
                </div>
                <Clock className="h-12 w-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="realtime" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="volume">Volume Tracking</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <RealTimeTrainingMonitor />
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Exercises */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Dumbbell className="h-5 w-5 mr-2" />
                  Most Popular Exercises
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.popularExercises.map((exercise, index) => (
                    <div key={exercise.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center mr-3">
                          {index + 1}
                        </span>
                        <span className="font-medium">{exercise.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{exercise.count}</div>
                        <div className="text-xs text-gray-500">sessions</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Weekly Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.weeklyTrends.map((week) => (
                    <div key={week.week} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{week.week}</span>
                        <span>{week.workouts} workouts ({week.completion}% completion)</span>
                      </div>
                      <Progress value={week.completion} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                User Segments Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analytics.userSegments.map((segment) => (
                  <div key={segment.segment} className="text-center p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-lg">{segment.segment}</h3>
                    <p className="text-2xl font-bold text-blue-600 my-2">{segment.count}</p>
                    <p className="text-sm text-gray-600">users</p>
                    <div className="mt-3">
                      <p className="text-sm font-medium">Avg Completion</p>
                      <p className="text-lg font-bold text-green-600">{segment.avgCompletion}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Training Performance</CardTitle>
              <CardDescription>Individual user analytics and AI recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userTrainingData.map((userData) => (
                  <div key={userData.userId} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold">{userData.userName}</h4>
                        <p className="text-sm text-gray-600">{userData.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          userData.riskLevel === 'low' ? 'default' :
                          userData.riskLevel === 'medium' ? 'secondary' : 'destructive'
                        }>
                          {userData.riskLevel} risk
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-600">Workouts</div>
                        <div className="font-bold">{userData.totalWorkouts}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Completion</div>
                        <div className="font-bold">{userData.completionRate}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Streak</div>
                        <div className="font-bold">{userData.currentStreak} days</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Avg RPE</div>
                        <div className="font-bold">{userData.averageRPE}</div>
                      </div>
                    </div>

                    {userData.aiRecommendations.length > 0 && (
                      <div className="mb-3">
                        <h5 className="font-medium text-sm mb-2">AI Recommendations:</h5>
                        <div className="space-y-1">
                          {userData.aiRecommendations.map((rec, index) => (
                            <p key={index} className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                              • {rec}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateUserReport(userData.userId)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Report
                      </Button>
                      {userData.riskLevel === 'high' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => triggerAIIntervention(userData.userId)}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          AI Intervention
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Volume Tracking Tab */}
        <TabsContent value="volume" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Volume Landmarks Analysis
              </CardTitle>
              <CardDescription>
                MEV, MAV, and MRV tracking across muscle groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.volumeLandmarkStats.map((stat) => (
                  <div key={stat.muscleGroup} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-bold mb-3">{stat.muscleGroup}</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">MEV (Average)</div>
                        <div className="text-2xl font-bold text-blue-600">{stat.avgMEV}</div>
                        <div className="text-xs text-gray-500">sets/week</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">MAV (Average)</div>
                        <div className="text-2xl font-bold text-green-600">{stat.avgMAV}</div>
                        <div className="text-xs text-gray-500">sets/week</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">MRV (Average)</div>
                        <div className="text-2xl font-bold text-red-600">{stat.avgMRV}</div>
                        <div className="text-xs text-gray-500">sets/week</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress
                        value={(stat.avgMAV / stat.avgMRV) * 100}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>MEV</span>
                        <span>MAV</span>
                        <span>MRV</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI-Powered Training Insights
              </CardTitle>
              <CardDescription>
                Machine learning insights and automated recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold">Predictive Analytics</h4>
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                    <h5 className="font-medium">Churn Risk Prediction</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      23 users identified as high churn risk. AI intervention recommended for 8 users.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-l-green-500">
                    <h5 className="font-medium">Performance Optimization</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      AI suggests volume adjustments for 45% of users to optimize progress.
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-l-orange-500">
                    <h5 className="font-medium">Deload Recommendations</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      12 users require immediate deload weeks based on fatigue analysis.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold">Automated Actions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Personalized plan adjustments</span>
                      <Badge variant="default">34 today</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Motivational interventions</span>
                      <Badge variant="secondary">12 today</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Coach notifications</span>
                      <Badge variant="outline">8 today</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Recovery weeks scheduled</span>
                      <Badge variant="destructive">5 today</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
