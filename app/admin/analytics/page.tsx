'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton as Button } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Target,
  Brain,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  Zap,
  Shield,
  PieChart,
  LineChart,
  BarChart
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { aiSystem, PredictiveAnalytics } from "@/lib/admin/ai-core-system"

interface AnalyticsData {
  userEngagement: {
    totalSessions: number
    averageSessionDuration: number
    bounceRate: number
    returnUserRate: number
  }
  workoutMetrics: {
    totalWorkouts: number
    completionRate: number
    averageDuration: number
    popularExercises: string[]
  }
  retentionMetrics: {
    day1: number
    day7: number
    day30: number
    day90: number
  }
  churnPrediction: {
    highRisk: number
    mediumRisk: number
    lowRisk: number
    totalPredictions: number
  }
  aiPerformance: {
    recommendationAccuracy: number
    segmentationEfficiency: number
    predictionAccuracy: number
    modelConfidence: number
  }
}

interface RealTimeMetrics {
  activeUsers: number
  ongoingWorkouts: number
  newSignups: number
  systemLoad: number
}

export default function AnalyticsPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userEngagement: {
      totalSessions: 0,
      averageSessionDuration: 0,
      bounceRate: 0,
      returnUserRate: 0
    },
    workoutMetrics: {
      totalWorkouts: 0,
      completionRate: 0,
      averageDuration: 0,
      popularExercises: []
    },
    retentionMetrics: {
      day1: 0,
      day7: 0,
      day30: 0,
      day90: 0
    },
    churnPrediction: {
      highRisk: 0,
      mediumRisk: 0,
      lowRisk: 0,
      totalPredictions: 0
    },
    aiPerformance: {
      recommendationAccuracy: 0,
      segmentationEfficiency: 0,
      predictionAccuracy: 0,
      modelConfidence: 0
    }
  })

  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    activeUsers: 0,
    ongoingWorkouts: 0,
    newSignups: 0,
    systemLoad: 0
  })

  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d")
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<PredictiveAnalytics[]>([])

  useEffect(() => {
    if (!user || profile?.email !== 'admin@routinize.com') {
      router.push('/dashboard')
      return
    }

    loadAnalyticsData()
    loadRealTimeMetrics()
    loadPredictiveAnalytics()

    // Set up real-time updates
    const interval = setInterval(loadRealTimeMetrics, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [user, profile, router, selectedTimeRange])

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true)

      // Load user engagement data
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, created_at, last_active')

      const { data: workoutLogs } = await supabase
        .from('workout_logs')
        .select('*')

      if (profiles && workoutLogs) {
        // Calculate user engagement metrics
        const totalSessions = workoutLogs.length
        const averageSessionDuration = 45 // Mock data - would calculate from actual session data
        const bounceRate = 15 // Mock data
        const returnUserRate = 78 // Mock data

        // Calculate workout metrics
        const totalWorkouts = workoutLogs.length
        const completedWorkouts = workoutLogs.filter(log => log.completed).length
        const completionRate = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0
        const averageDuration = 35 // Mock data

        // Calculate retention metrics (mock data for now)
        const retentionMetrics = {
          day1: 85,
          day7: 72,
          day30: 58,
          day90: 45
        }

        // Generate churn predictions using AI system
        const churnPredictions = await Promise.all(
          profiles.slice(0, 50).map(profile => aiSystem.generatePredictiveAnalytics(profile.id))
        )

        const validPredictions = churnPredictions.filter(p => p !== null) as PredictiveAnalytics[]

        const highRisk = validPredictions.filter(p => p.churnRisk > 0.7).length
        const mediumRisk = validPredictions.filter(p => p.churnRisk > 0.4 && p.churnRisk <= 0.7).length
        const lowRisk = validPredictions.filter(p => p.churnRisk <= 0.4).length

        // AI Performance metrics (mock data)
        const aiPerformance = {
          recommendationAccuracy: 94.2,
          segmentationEfficiency: 87.5,
          predictionAccuracy: 91.8,
          modelConfidence: 89.3
        }

        setAnalyticsData({
          userEngagement: {
            totalSessions,
            averageSessionDuration,
            bounceRate,
            returnUserRate
          },
          workoutMetrics: {
            totalWorkouts,
            completionRate: Math.round(completionRate),
            averageDuration,
            popularExercises: ['Squats', 'Push-ups', 'Deadlifts', 'Planks', 'Lunges']
          },
          retentionMetrics,
          churnPrediction: {
            highRisk,
            mediumRisk,
            lowRisk,
            totalPredictions: validPredictions.length
          },
          aiPerformance
        })
      }

    } catch (error) {
      console.error('Error loading analytics data:', error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadRealTimeMetrics = async () => {
    try {
      // Mock real-time data - in production, this would come from real-time analytics
      setRealTimeMetrics({
        activeUsers: Math.floor(Math.random() * 50) + 20,
        ongoingWorkouts: Math.floor(Math.random() * 15) + 5,
        newSignups: Math.floor(Math.random() * 5) + 1,
        systemLoad: Math.floor(Math.random() * 30) + 40
      })
    } catch (error) {
      console.error('Error loading real-time metrics:', error)
    }
  }

  const loadPredictiveAnalytics = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(20)

      if (profiles) {
        const predictions = await Promise.all(
          profiles.map(profile => aiSystem.generatePredictiveAnalytics(profile.id))
        )

        const validPredictions = predictions.filter(p => p !== null) as PredictiveAnalytics[]
        setPredictiveAnalytics(validPredictions)
      }
    } catch (error) {
      console.error('Error loading predictive analytics:', error)
    }
  }

  const exportAnalyticsReport = async () => {
    try {
      const reportData = {
        generatedAt: new Date().toISOString(),
        timeRange: selectedTimeRange,
        ...analyticsData,
        realTimeMetrics,
        predictiveAnalytics: predictiveAnalytics.length
      }

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Report Exported",
        description: "Analytics report has been downloaded",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export analytics report",
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reporting</h1>
            <p className="text-gray-600">Real-time dashboards and predictive analytics powered by AI</p>
          </div>
          <div className="flex space-x-3">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportAnalyticsReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" onClick={loadAnalyticsData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Real-time Metrics */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Activity className="h-5 w-5 mr-2" />
              Real-time Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{realTimeMetrics.activeUsers}</div>
                <div className="text-xs text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{realTimeMetrics.ongoingWorkouts}</div>
                <div className="text-xs text-gray-600">Ongoing Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{realTimeMetrics.newSignups}</div>
                <div className="text-xs text-gray-600">New Signups</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{realTimeMetrics.systemLoad}%</div>
                <div className="text-xs text-gray-600">System Load</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="predictive">Predictive AI</TabsTrigger>
          <TabsTrigger value="performance">AI Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold">{analyticsData.userEngagement.totalSessions}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12% vs last period
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold">{analyticsData.workoutMetrics.completionRate}%</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +5% vs last period
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">AI Accuracy</p>
                    <p className="text-2xl font-bold">{analyticsData.aiPerformance.recommendationAccuracy}%</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Optimal performance
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">High Churn Risk</p>
                    <p className="text-2xl font-bold">{analyticsData.churnPrediction.highRisk}</p>
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Needs attention
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Metrics</CardTitle>
                <CardDescription>Key engagement indicators over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Session Duration</span>
                    <span className="font-medium">{analyticsData.userEngagement.averageSessionDuration} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bounce Rate</span>
                    <span className="font-medium">{analyticsData.userEngagement.bounceRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Return User Rate</span>
                    <span className="font-medium">{analyticsData.userEngagement.returnUserRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Exercises</CardTitle>
                <CardDescription>Most frequently performed exercises</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.workoutMetrics.popularExercises.map((exercise, index) => (
                    <div key={exercise} className="flex items-center justify-between">
                      <span className="text-sm">{exercise}</span>
                      <Badge variant="secondary">#{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Retention Tab */}
        <TabsContent value="retention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Retention Analysis</CardTitle>
              <CardDescription>User retention rates over different time periods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{analyticsData.retentionMetrics.day1}%</div>
                  <div className="text-sm text-gray-600">Day 1 Retention</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{analyticsData.retentionMetrics.day7}%</div>
                  <div className="text-sm text-gray-600">Day 7 Retention</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{analyticsData.retentionMetrics.day30}%</div>
                  <div className="text-sm text-gray-600">Day 30 Retention</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{analyticsData.retentionMetrics.day90}%</div>
                  <div className="text-sm text-gray-600">Day 90 Retention</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictive AI Tab */}
        <TabsContent value="predictive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Churn Risk Distribution
                </CardTitle>
                <CardDescription>AI-powered churn risk analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Risk (>70%)</span>
                    <div className="flex items-center">
                      <Badge variant="destructive">{analyticsData.churnPrediction.highRisk}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium Risk (40-70%)</span>
                    <div className="flex items-center">
                      <Badge variant="secondary">{analyticsData.churnPrediction.mediumRisk}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low Risk (<40%)</span>
                    <div className="flex items-center">
                      <Badge variant="default">{analyticsData.churnPrediction.lowRisk}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Predictions</CardTitle>
                <CardDescription>Latest AI predictions for user behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {predictiveAnalytics.slice(0, 5).map((prediction, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">User {prediction.userId.slice(0, 8)}...</span>
                        <Badge variant={
                          prediction.churnRisk > 0.7 ? 'destructive' :
                          prediction.churnRisk > 0.4 ? 'secondary' : 'default'
                        }>
                          {Math.round(prediction.churnRisk * 100)}% risk
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        Trend: {prediction.engagementTrend}
                      </div>
                      <div className="text-xs text-gray-600">
                        Next action: {prediction.nextLikelyAction}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                AI Model Performance
              </CardTitle>
              <CardDescription>Performance metrics for all AI models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{analyticsData.aiPerformance.recommendationAccuracy}%</div>
                  <div className="text-sm text-gray-600">Recommendation Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{analyticsData.aiPerformance.segmentationEfficiency}%</div>
                  <div className="text-sm text-gray-600">Segmentation Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{analyticsData.aiPerformance.predictionAccuracy}%</div>
                  <div className="text-sm text-gray-600">Prediction Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{analyticsData.aiPerformance.modelConfidence}%</div>
                  <div className="text-sm text-gray-600">Model Confidence</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
