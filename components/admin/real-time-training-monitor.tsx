"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton as Button } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Activity, 
  Users, 
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Eye,
  Zap,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"

interface ActiveWorkout {
  id: string
  userId: string
  userName: string
  exerciseName: string
  currentSet: number
  totalSets: number
  startTime: Date
  lastActivity: Date
  progress: number
  rpe: number
  formScore?: number
  needsAttention: boolean
}

interface TrainingAlert {
  id: string
  userId: string
  userName: string
  type: 'high_fatigue' | 'poor_form' | 'extended_rest' | 'deload_needed'
  message: string
  severity: 'low' | 'medium' | 'high'
  timestamp: Date
}

interface RealTimeStats {
  activeWorkouts: number
  totalUsersToday: number
  averageSessionDuration: number
  completionRate: number
  alertsCount: number
}

export function RealTimeTrainingMonitor() {
  const { toast } = useToast()
  
  const [activeWorkouts, setActiveWorkouts] = useState<ActiveWorkout[]>([])
  const [trainingAlerts, setTrainingAlerts] = useState<TrainingAlert[]>([])
  const [stats, setStats] = useState<RealTimeStats>({
    activeWorkouts: 0,
    totalUsersToday: 0,
    averageSessionDuration: 0,
    completionRate: 0,
    alertsCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadRealTimeData()
    
    if (autoRefresh) {
      const interval = setInterval(loadRealTimeData, 10000) // Update every 10 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  useEffect(() => {
    // Set up real-time subscription for workout updates
    const channel = supabase.channel('training_progress')
    
    channel
      .on('broadcast', { event: 'set_completed' }, (payload) => {
        handleWorkoutUpdate(payload.payload)
      })
      .on('broadcast', { event: 'workout_started' }, (payload) => {
        handleWorkoutStarted(payload.payload)
      })
      .on('broadcast', { event: 'workout_completed' }, (payload) => {
        handleWorkoutCompleted(payload.payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadRealTimeData = async () => {
    try {
      setIsLoading(true)
      
      // Simulate loading real-time data
      // In a real implementation, this would fetch from Supabase
      
      const mockActiveWorkouts: ActiveWorkout[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Carlos Mendoza',
          exerciseName: 'Sentadilla',
          currentSet: 3,
          totalSets: 4,
          startTime: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
          lastActivity: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
          progress: 75,
          rpe: 8,
          formScore: 85,
          needsAttention: false
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Ana García',
          exerciseName: 'Press de Banca',
          currentSet: 2,
          totalSets: 3,
          startTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          lastActivity: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          progress: 67,
          rpe: 9,
          formScore: 65,
          needsAttention: true
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Miguel Torres',
          exerciseName: 'Peso Muerto',
          currentSet: 1,
          totalSets: 3,
          startTime: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
          lastActivity: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
          progress: 33,
          rpe: 7,
          formScore: 92,
          needsAttention: false
        }
      ]

      const mockAlerts: TrainingAlert[] = [
        {
          id: '1',
          userId: 'user2',
          userName: 'Ana García',
          type: 'poor_form',
          message: 'Form score below 70% - intervention recommended',
          severity: 'high',
          timestamp: new Date(Date.now() - 3 * 60 * 1000)
        },
        {
          id: '2',
          userId: 'user4',
          userName: 'Laura Ruiz',
          type: 'high_fatigue',
          message: 'RPE consistently above 9 - deload suggested',
          severity: 'medium',
          timestamp: new Date(Date.now() - 10 * 60 * 1000)
        },
        {
          id: '3',
          userId: 'user5',
          userName: 'David López',
          type: 'extended_rest',
          message: 'Rest period exceeding 8 minutes',
          severity: 'low',
          timestamp: new Date(Date.now() - 5 * 60 * 1000)
        }
      ]

      setActiveWorkouts(mockActiveWorkouts)
      setTrainingAlerts(mockAlerts)
      
      setStats({
        activeWorkouts: mockActiveWorkouts.length,
        totalUsersToday: 47,
        averageSessionDuration: 52,
        completionRate: 89,
        alertsCount: mockAlerts.length
      })

    } catch (error) {
      console.error('Error loading real-time data:', error)
      toast({
        title: "Error",
        description: "Failed to load real-time training data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWorkoutUpdate = (payload: any) => {
    // Update active workout progress
    setActiveWorkouts(prev => prev.map(workout => 
      workout.id === payload.sessionId 
        ? { 
            ...workout, 
            lastActivity: new Date(),
            currentSet: payload.setData.setNumber,
            progress: (payload.setData.setNumber / workout.totalSets) * 100
          }
        : workout
    ))
  }

  const handleWorkoutStarted = (payload: any) => {
    // Add new active workout
    const newWorkout: ActiveWorkout = {
      id: payload.sessionId,
      userId: payload.userId,
      userName: payload.userName || 'Unknown User',
      exerciseName: payload.exerciseName || 'Unknown Exercise',
      currentSet: 0,
      totalSets: payload.totalSets || 3,
      startTime: new Date(),
      lastActivity: new Date(),
      progress: 0,
      rpe: 0,
      needsAttention: false
    }
    
    setActiveWorkouts(prev => [...prev, newWorkout])
    setStats(prev => ({ ...prev, activeWorkouts: prev.activeWorkouts + 1 }))
  }

  const handleWorkoutCompleted = (payload: any) => {
    // Remove completed workout
    setActiveWorkouts(prev => prev.filter(workout => workout.id !== payload.sessionId))
    setStats(prev => ({ ...prev, activeWorkouts: prev.activeWorkouts - 1 }))
  }

  const sendInterventionMessage = async (userId: string, userName: string) => {
    try {
      // In a real implementation, this would send a message through the app
      toast({
        title: "Intervention Sent",
        description: `Motivational message sent to ${userName}`,
      })
      
      // Remove the alert after intervention
      setTrainingAlerts(prev => prev.filter(alert => alert.userId !== userId))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send intervention message",
        variant: "destructive"
      })
    }
  }

  const getAlertIcon = (type: TrainingAlert['type']) => {
    switch (type) {
      case 'high_fatigue': return <TrendingDown className="h-4 w-4" />
      case 'poor_form': return <AlertTriangle className="h-4 w-4" />
      case 'extended_rest': return <Clock className="h-4 w-4" />
      case 'deload_needed': return <Target className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getAlertColor = (severity: TrainingAlert['severity']) => {
    switch (severity) {
      case 'high': return 'border-l-red-500 bg-red-50'
      case 'medium': return 'border-l-orange-500 bg-orange-50'
      case 'low': return 'border-l-yellow-500 bg-yellow-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const formatDuration = (startTime: Date) => {
    const minutes = Math.floor((Date.now() - startTime.getTime()) / (1000 * 60))
    return `${minutes}m`
  }

  const formatLastActivity = (lastActivity: Date) => {
    const minutes = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60))
    if (minutes === 0) return 'Just now'
    return `${minutes}m ago`
  }

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Workouts</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeWorkouts}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Users Today</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalUsersToday}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageSessionDuration}m</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion</p>
                <p className="text-2xl font-bold text-orange-600">{stats.completionRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alerts</p>
                <p className="text-2xl font-bold text-red-600">{stats.alertsCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Workouts */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Active Workouts
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadRealTimeData}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeWorkouts.map((workout) => (
                <div key={workout.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{workout.userName}</h4>
                      <p className="text-sm text-gray-600">{workout.exerciseName}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Set {workout.currentSet}/{workout.totalSets}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDuration(workout.startTime)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(workout.progress)}%</span>
                    </div>
                    <Progress value={workout.progress} className="h-2" />
                    
                    <div className="flex justify-between items-center text-xs">
                      <span>Last activity: {formatLastActivity(workout.lastActivity)}</span>
                      <div className="flex items-center space-x-2">
                        {workout.formScore && (
                          <Badge variant={workout.formScore > 80 ? 'default' : 'destructive'}>
                            Form: {workout.formScore}%
                          </Badge>
                        )}
                        <Badge variant={workout.rpe > 8 ? 'destructive' : 'outline'}>
                          RPE: {workout.rpe}
                        </Badge>
                        {workout.needsAttention && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {activeWorkouts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No active workouts at the moment
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Training Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Training Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trainingAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 border-l-4 rounded-lg ${getAlertColor(alert.severity)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      {getAlertIcon(alert.type)}
                      <span className="ml-2 font-medium text-sm">{alert.userName}</span>
                    </div>
                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {formatLastActivity(alert.timestamp)}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => sendInterventionMessage(alert.userId, alert.userName)}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Intervene
                    </Button>
                  </div>
                </div>
              ))}
              
              {trainingAlerts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No alerts at the moment
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
