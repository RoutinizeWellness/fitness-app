"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton as Button } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  Target, 
  TrendingUp,
  Calendar,
  Dumbbell,
  Brain,
  Eye,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Play,
  Settings
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { VolumeLandmarksTracker } from "@/components/training/volume-landmarks-tracker"
import { PeriodizationPlanner } from "@/components/training/advanced/periodization-planner"
import { advancedTrainingSystem, TrainingMetrics, AITrainingRecommendation } from "@/lib/training/advanced-training-system"
import { computerVisionSystem } from "@/lib/admin/computer-vision-system"

interface DashboardStats {
  totalWorkouts: number
  currentStreak: number
  weeklyVolume: number
  averageRPE: number
  completionRate: number
  nextWorkout: string
}

export default function EnhancedTrainingDashboard() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkouts: 45,
    currentStreak: 7,
    weeklyVolume: 1250,
    averageRPE: 7.2,
    completionRate: 89,
    nextWorkout: "Push Day A"
  })
  
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics | null>(null)
  const [aiRecommendations, setAiRecommendations] = useState<AITrainingRecommendation[]>([])
  const [isAdvancedUser, setIsAdvancedUser] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [computerVisionAvailable, setComputerVisionAvailable] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    loadDashboardData()
    checkUserLevel()
    initializeComputerVision()
  }, [user, router])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      if (!user) return

      // Load training metrics
      const metrics = await advancedTrainingSystem.calculateTrainingMetrics(user.id)
      setTrainingMetrics(metrics)

      // Load AI recommendations
      const recommendations = await advancedTrainingSystem.generateExerciseRecommendations(
        user.id,
        { exercises: [] }
      )
      setAiRecommendations(recommendations)

      // Update stats with real data
      setStats(prev => ({
        ...prev,
        weeklyVolume: Object.values(metrics.weeklyVolume).reduce((sum, vol) => sum + vol, 0),
        averageRPE: 7.2, // This would come from recent workouts
        completionRate: metrics.adherenceRate * 100
      }))

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load training data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkUserLevel = async () => {
    try {
      // Check if user is advanced based on profile or workout history
      // For now, we'll simulate this check
      const workoutCount = stats.totalWorkouts
      const isAdvanced = workoutCount > 30 || profile?.experience_level === 'advanced'
      setIsAdvancedUser(isAdvanced)
    } catch (error) {
      console.error('Error checking user level:', error)
    }
  }

  const initializeComputerVision = async () => {
    try {
      const initialized = await computerVisionSystem.initialize()
      setComputerVisionAvailable(initialized)
    } catch (error) {
      console.error('Error initializing computer vision:', error)
      setComputerVisionAvailable(false)
    }
  }

  const startQuickWorkout = () => {
    router.push('/training/execute-workout/quick-start')
  }

  const checkDeloadRequirement = async () => {
    try {
      if (!user) return

      const needsDeload = await advancedTrainingSystem.checkDeloadRequirement(user.id)
      
      if (needsDeload) {
        toast({
          title: "Deload Week Recommended",
          description: "Based on your training metrics, a deload week would be beneficial",
          variant: "destructive"
        })
        
        // Optionally implement deload automatically
        await advancedTrainingSystem.implementDeload(user.id)
      } else {
        toast({
          title: "Training Load Optimal",
          description: "Your current training load is within optimal ranges",
        })
      }
    } catch (error) {
      console.error('Error checking deload requirement:', error)
    }
  }

  if (!user) {
    return (
      <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="mt-4 text-[#573353]">Loading...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="mt-4 text-[#573353]">Loading training data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#573353]">Training Dashboard</h1>
            <p className="text-sm text-gray-600">Enhanced with AI & Analytics</p>
          </div>
          <div className="flex space-x-2">
            {computerVisionAvailable && (
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-[#1B237E]">{stats.totalWorkouts}</div>
            <div className="text-xs text-gray-600">Total Workouts</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#1B237E]">{stats.currentStreak}</div>
            <div className="text-xs text-gray-600">Day Streak</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#1B237E]">{Math.round(stats.completionRate)}%</div>
            <div className="text-xs text-gray-600">Completion</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium">Next Workout: {stats.nextWorkout}</h4>
                    <p className="text-sm text-gray-600">Estimated duration: 45-60 minutes</p>
                  </div>
                  <Button onClick={startQuickWorkout} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Start Workout
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            {aiRecommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiRecommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="p-3 bg-purple-50 rounded-lg border-l-4 border-l-purple-500">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{rec.message}</h4>
                        <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{rec.reasoning}</p>
                      <p className="text-xs text-blue-600 mt-1">{rec.implementation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Training Metrics */}
            {trainingMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Training Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{trainingMetrics.readinessScore}</div>
                      <div className="text-xs text-gray-600">Readiness Score</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">{trainingMetrics.fatigueIndex}</div>
                      <div className="text-xs text-gray-600">Fatigue Index</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{Math.round(trainingMetrics.adherenceRate * 100)}%</div>
                      <div className="text-xs text-gray-600">Adherence</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{Math.round(trainingMetrics.progressionRate * 100)}%</div>
                      <div className="text-xs text-gray-600">Progression</div>
                    </div>
                  </div>
                  
                  {trainingMetrics.fatigueIndex > 7 && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg border-l-4 border-l-red-500">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-sm font-medium text-red-800">High Fatigue Detected</span>
                      </div>
                      <p className="text-xs text-red-700 mt-1">Consider a deload week or reduced training volume</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2"
                        onClick={checkDeloadRequirement}
                      >
                        Check Deload Need
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Weekly Volume Breakdown */}
            {trainingMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Volume by Muscle Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(trainingMetrics.weeklyVolume).map(([muscle, volume]) => (
                      <div key={muscle} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{muscle}</span>
                          <span>{volume} sets</span>
                        </div>
                        <Progress value={(volume / 30) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Intensity Distribution */}
            {trainingMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle>Intensity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Low Intensity (RPE 1-6)</span>
                      <Badge variant="outline">{trainingMetrics.intensityDistribution.low}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Moderate Intensity (RPE 7-8)</span>
                      <Badge variant="outline">{trainingMetrics.intensityDistribution.moderate}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">High Intensity (RPE 9-10)</span>
                      <Badge variant="outline">{trainingMetrics.intensityDistribution.high}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            {/* Volume Landmarks Tracker */}
            <VolumeLandmarksTracker 
              userId={user.id} 
              isAdvancedUser={isAdvancedUser}
            />

            {/* Periodization Planner */}
            <PeriodizationPlanner 
              userId={user.id}
              isAdvancedUser={isAdvancedUser}
            />

            {/* Computer Vision Integration */}
            {computerVisionAvailable && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Form Analysis AI
                  </CardTitle>
                  <CardDescription>
                    Real-time exercise form correction using computer vision
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm font-medium">Computer Vision Ready</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        AI form analysis will be available during your next workout
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Supported exercises: Squats, Push-ups, Deadlifts
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
