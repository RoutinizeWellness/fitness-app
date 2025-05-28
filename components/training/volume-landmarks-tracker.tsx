"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton as Button } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  Activity,
  Zap,
  Brain
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { advancedTrainingSystem, VolumeLandmarks } from "@/lib/training/advanced-training-system"

interface VolumeLandmarksTrackerProps {
  userId: string
  isAdvancedUser?: boolean
}

interface MuscleGroupVolume {
  muscleGroup: string
  landmarks: VolumeLandmarks
  currentWeekVolume: number
  trend: 'increasing' | 'decreasing' | 'stable'
  recommendation: string
  status: 'under' | 'optimal' | 'approaching_mrv' | 'over_mrv'
}

export function VolumeLandmarksTracker({ userId, isAdvancedUser = false }: VolumeLandmarksTrackerProps) {
  const { toast } = useToast()
  
  const [muscleGroupVolumes, setMuscleGroupVolumes] = useState<MuscleGroupVolume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null)
  const [weeklyView, setWeeklyView] = useState(true)

  const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms']

  useEffect(() => {
    loadVolumeLandmarks()
  }, [userId])

  const loadVolumeLandmarks = async () => {
    try {
      setIsLoading(true)
      
      const volumeData: MuscleGroupVolume[] = []
      
      for (const muscleGroup of muscleGroups) {
        const landmarks = await advancedTrainingSystem.calculateVolumeLandmarks(userId, muscleGroup)
        
        // Calculate status based on current volume
        let status: MuscleGroupVolume['status'] = 'optimal'
        if (landmarks.currentVolume < landmarks.MEV) {
          status = 'under'
        } else if (landmarks.currentVolume > landmarks.MRV) {
          status = 'over_mrv'
        } else if (landmarks.currentVolume > landmarks.MAV) {
          status = 'approaching_mrv'
        }

        // Determine trend from weekly progression
        const recentWeeks = landmarks.weeklyProgression.slice(0, 3)
        let trend: MuscleGroupVolume['trend'] = 'stable'
        if (recentWeeks.length >= 2) {
          const avgRecent = recentWeeks.reduce((sum, vol) => sum + vol, 0) / recentWeeks.length
          const avgOlder = landmarks.weeklyProgression.slice(3, 6).reduce((sum, vol) => sum + vol, 0) / 3
          
          if (avgRecent > avgOlder * 1.1) trend = 'increasing'
          else if (avgRecent < avgOlder * 0.9) trend = 'decreasing'
        }

        // Generate recommendation
        let recommendation = ''
        switch (status) {
          case 'under':
            recommendation = `Increase volume by ${Math.ceil((landmarks.MEV - landmarks.currentVolume) / 2)} sets`
            break
          case 'approaching_mrv':
            recommendation = 'Consider deload or maintain current volume'
            break
          case 'over_mrv':
            recommendation = 'Reduce volume immediately - deload recommended'
            break
          default:
            recommendation = 'Volume is optimal - maintain current approach'
        }

        volumeData.push({
          muscleGroup: muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1),
          landmarks,
          currentWeekVolume: landmarks.currentVolume,
          trend,
          recommendation,
          status
        })
      }
      
      setMuscleGroupVolumes(volumeData)
    } catch (error) {
      console.error('Error loading volume landmarks:', error)
      toast({
        title: "Error",
        description: "Failed to load volume landmarks data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: MuscleGroupVolume['status']) => {
    switch (status) {
      case 'under': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'optimal': return 'text-green-600 bg-green-50 border-green-200'
      case 'approaching_mrv': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'over_mrv': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: MuscleGroupVolume['status']) => {
    switch (status) {
      case 'under': return <AlertTriangle className="h-4 w-4" />
      case 'optimal': return <CheckCircle className="h-4 w-4" />
      case 'approaching_mrv': return <Info className="h-4 w-4" />
      case 'over_mrv': return <AlertTriangle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getTrendIcon = (trend: MuscleGroupVolume['trend']) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const calculateVolumePercentage = (current: number, mev: number, mrv: number) => {
    if (current <= mev) return (current / mev) * 30 // 0-30% for under MEV
    if (current <= mrv) return 30 + ((current - mev) / (mrv - mev)) * 70 // 30-100% for MEV to MRV
    return 100 // Over MRV
  }

  if (!isAdvancedUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2">Volume Landmarks</h3>
          <p className="text-gray-600 mb-4">
            Advanced volume tracking is available for intermediate and advanced users.
          </p>
          <Badge variant="outline">Feature locked</Badge>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            <span className="ml-2">Loading volume data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Volume Landmarks Tracking
          </CardTitle>
          <CardDescription>
            Monitor your training volume relative to MEV, MAV, and MRV for optimal progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {muscleGroupVolumes.map((mgv) => (
                  <Card key={mgv.muscleGroup} className={`border-l-4 ${getStatusColor(mgv.status)}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold">{mgv.muscleGroup}</h4>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(mgv.trend)}
                          {getStatusIcon(mgv.status)}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Current Volume</span>
                          <span className="font-medium">{mgv.currentWeekVolume} sets</span>
                        </div>
                        <Progress 
                          value={calculateVolumePercentage(
                            mgv.currentWeekVolume, 
                            mgv.landmarks.MEV, 
                            mgv.landmarks.MRV
                          )} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>MEV: {mgv.landmarks.MEV}</span>
                          <span>MAV: {mgv.landmarks.MAV}</span>
                          <span>MRV: {mgv.landmarks.MRV}</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 mb-2">
                        <strong>Recommendation:</strong> {mgv.recommendation}
                      </div>

                      <Badge variant={
                        mgv.status === 'optimal' ? 'default' :
                        mgv.status === 'under' ? 'secondary' :
                        mgv.status === 'approaching_mrv' ? 'outline' : 'destructive'
                      }>
                        {mgv.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {muscleGroupVolumes.map((mgv) => (
                  <Card key={mgv.muscleGroup}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {mgv.muscleGroup}
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(mgv.trend)}
                          <Badge variant="outline">{mgv.trend}</Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Volume Landmarks */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm text-blue-600 font-medium">MEV</div>
                            <div className="text-xl font-bold text-blue-700">{mgv.landmarks.MEV}</div>
                            <div className="text-xs text-blue-500">Minimum Effective</div>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="text-sm text-green-600 font-medium">MAV</div>
                            <div className="text-xl font-bold text-green-700">{mgv.landmarks.MAV}</div>
                            <div className="text-xs text-green-500">Maximum Adaptive</div>
                          </div>
                          <div className="p-3 bg-red-50 rounded-lg">
                            <div className="text-sm text-red-600 font-medium">MRV</div>
                            <div className="text-xl font-bold text-red-700">{mgv.landmarks.MRV}</div>
                            <div className="text-xs text-red-500">Maximum Recoverable</div>
                          </div>
                        </div>

                        {/* Current Status */}
                        <div className={`p-3 rounded-lg border ${getStatusColor(mgv.status)}`}>
                          <div className="flex items-center mb-2">
                            {getStatusIcon(mgv.status)}
                            <span className="ml-2 font-medium">Current: {mgv.currentWeekVolume} sets/week</span>
                          </div>
                          <p className="text-sm">{mgv.recommendation}</p>
                        </div>

                        {/* Weekly Progression */}
                        <div>
                          <h5 className="font-medium mb-2">Weekly Progression (Last 8 weeks)</h5>
                          <div className="space-y-1">
                            {mgv.landmarks.weeklyProgression.map((volume, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span>Week {index + 1}</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full" 
                                      style={{ 
                                        width: `${Math.min(100, (volume / mgv.landmarks.MRV) * 100)}%` 
                                      }}
                                    />
                                  </div>
                                  <span className="font-medium w-12 text-right">{volume}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI Volume Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {muscleGroupVolumes
              .filter(mgv => mgv.status !== 'optimal')
              .map((mgv) => (
                <div key={mgv.muscleGroup} className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium text-blue-800">{mgv.muscleGroup} Optimization</h5>
                      <p className="text-sm text-blue-700 mt-1">{mgv.recommendation}</p>
                    </div>
                    <Badge variant="outline">
                      <Zap className="h-3 w-3 mr-1" />
                      AI
                    </Badge>
                  </div>
                </div>
              ))}
            
            {muscleGroupVolumes.every(mgv => mgv.status === 'optimal') && (
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-l-green-500 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h5 className="font-medium text-green-800">Optimal Volume Distribution</h5>
                <p className="text-sm text-green-700">All muscle groups are within optimal volume ranges. Great work!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
