"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton as Button } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Zap,
  Target,
  Eye,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Users,
  Activity,
  Shield,
  Cpu,
  Database,
  Network,
  Monitor
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { aiSystem, AIRecommendation, UserSegment, AIModelMetrics } from "@/lib/admin/ai-core-system"

interface AISystemStatus {
  isOnline: boolean
  lastUpdate: Date
  modelsActive: number
  totalPredictions: number
  systemLoad: number
  memoryUsage: number
  processingQueue: number
}

interface ModelConfiguration {
  id: string
  name: string
  type: 'recommendation' | 'segmentation' | 'prediction' | 'computer_vision'
  isActive: boolean
  confidence: number
  accuracy: number
  lastTrained: Date
  trainingDataSize: number
  parameters: {
    learningRate: number
    batchSize: number
    epochs: number
    regularization: number
  }
}

export default function AIManagementPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [systemStatus, setSystemStatus] = useState<AISystemStatus>({
    isOnline: true,
    lastUpdate: new Date(),
    modelsActive: 8,
    totalPredictions: 15420,
    systemLoad: 65,
    memoryUsage: 78,
    processingQueue: 12
  })

  const [models, setModels] = useState<ModelConfiguration[]>([
    {
      id: 'rec_engine_v2',
      name: 'Recommendation Engine v2.0',
      type: 'recommendation',
      isActive: true,
      confidence: 94.2,
      accuracy: 91.8,
      lastTrained: new Date('2024-01-15'),
      trainingDataSize: 50000,
      parameters: {
        learningRate: 0.001,
        batchSize: 32,
        epochs: 100,
        regularization: 0.01
      }
    },
    {
      id: 'user_seg_v1',
      name: 'User Segmentation Model',
      type: 'segmentation',
      isActive: true,
      confidence: 87.5,
      accuracy: 89.3,
      lastTrained: new Date('2024-01-10'),
      trainingDataSize: 25000,
      parameters: {
        learningRate: 0.002,
        batchSize: 64,
        epochs: 80,
        regularization: 0.005
      }
    },
    {
      id: 'churn_pred_v3',
      name: 'Churn Prediction Model v3.0',
      type: 'prediction',
      isActive: true,
      confidence: 91.8,
      accuracy: 88.7,
      lastTrained: new Date('2024-01-12'),
      trainingDataSize: 35000,
      parameters: {
        learningRate: 0.0015,
        batchSize: 48,
        epochs: 120,
        regularization: 0.008
      }
    },
    {
      id: 'cv_form_check',
      name: 'Computer Vision Form Checker',
      type: 'computer_vision',
      isActive: false,
      confidence: 76.4,
      accuracy: 82.1,
      lastTrained: new Date('2024-01-08'),
      trainingDataSize: 15000,
      parameters: {
        learningRate: 0.0005,
        batchSize: 16,
        epochs: 200,
        regularization: 0.02
      }
    }
  ])

  const [recentRecommendations, setRecentRecommendations] = useState<AIRecommendation[]>([])
  const [userSegments, setUserSegments] = useState<UserSegment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || profile?.email !== 'admin@routinize.com') {
      router.push('/dashboard')
      return
    }

    loadAIData()

    // Set up real-time updates
    const interval = setInterval(updateSystemStatus, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [user, profile, router])

  const loadAIData = async () => {
    try {
      setIsLoading(true)

      // Load user segments
      const segments = await aiSystem.segmentUsers()
      setUserSegments(segments)

      // Load recent recommendations (mock data)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(5)

      if (profiles) {
        const recommendations = await Promise.all(
          profiles.map(async (profile) => {
            const recs = await aiSystem.generateRuleBasedRecommendations(profile.id)
            return recs[0] // Get first recommendation
          })
        )

        setRecentRecommendations(recommendations.filter(rec => rec))
      }

    } catch (error) {
      console.error('Error loading AI data:', error)
      toast({
        title: "Error",
        description: "Failed to load AI system data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateSystemStatus = () => {
    setSystemStatus(prev => ({
      ...prev,
      lastUpdate: new Date(),
      systemLoad: Math.max(30, Math.min(90, prev.systemLoad + (Math.random() - 0.5) * 10)),
      memoryUsage: Math.max(50, Math.min(95, prev.memoryUsage + (Math.random() - 0.5) * 8)),
      processingQueue: Math.max(0, Math.min(50, prev.processingQueue + Math.floor((Math.random() - 0.5) * 6)))
    }))
  }

  const toggleModel = async (modelId: string) => {
    try {
      setModels(prev => prev.map(model =>
        model.id === modelId
          ? { ...model, isActive: !model.isActive }
          : model
      ))

      const model = models.find(m => m.id === modelId)
      toast({
        title: `Model ${model?.isActive ? 'Deactivated' : 'Activated'}`,
        description: `${model?.name} has been ${model?.isActive ? 'deactivated' : 'activated'}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle model status",
        variant: "destructive"
      })
    }
  }

  const retrainModel = async (modelId: string) => {
    try {
      const model = models.find(m => m.id === modelId)
      if (!model) return

      toast({
        title: "Training Started",
        description: `Retraining ${model.name}...`,
      })

      // Simulate training process
      setTimeout(() => {
        setModels(prev => prev.map(m =>
          m.id === modelId
            ? {
                ...m,
                lastTrained: new Date(),
                accuracy: Math.min(95, m.accuracy + Math.random() * 3),
                confidence: Math.min(98, m.confidence + Math.random() * 2)
              }
            : m
        ))

        toast({
          title: "Training Complete",
          description: `${model.name} has been successfully retrained`,
        })
      }, 3000)

    } catch (error) {
      toast({
        title: "Training Failed",
        description: "Failed to retrain model",
        variant: "destructive"
      })
    }
  }

  const exportModelData = async (modelId: string) => {
    try {
      const model = models.find(m => m.id === modelId)
      if (!model) return

      const modelData = {
        ...model,
        exportedAt: new Date().toISOString(),
        systemStatus
      }

      const blob = new Blob([JSON.stringify(modelData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${model.id}_export_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export Complete",
        description: `${model.name} data has been exported`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export model data",
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Engine Management</h1>
            <p className="text-gray-600">Progressive AI learning system and intelligent automation</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={loadAIData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Status */}
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700">
              <Brain className="h-5 w-5 mr-2" />
              AI System Status
              <Badge variant={systemStatus.isOnline ? "default" : "destructive"} className="ml-2">
                {systemStatus.isOnline ? "Online" : "Offline"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{systemStatus.modelsActive}</div>
                <div className="text-xs text-gray-600">Active Models</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{systemStatus.totalPredictions.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Total Predictions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemStatus.systemLoad}%</div>
                <div className="text-xs text-gray-600">System Load</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{systemStatus.memoryUsage}%</div>
                <div className="text-xs text-gray-600">Memory Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{systemStatus.processingQueue}</div>
                <div className="text-xs text-gray-600">Processing Queue</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-gray-600">Last Update</div>
                <div className="text-xs text-gray-600">{systemStatus.lastUpdate.toLocaleTimeString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="segmentation">User Segments</TabsTrigger>
          <TabsTrigger value="computer-vision">Computer Vision</TabsTrigger>
        </TabsList>

        {/* AI Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {models.map((model) => (
              <Card key={model.id} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {model.type === 'recommendation' && <Target className="h-5 w-5 mr-2" />}
                        {model.type === 'segmentation' && <Users className="h-5 w-5 mr-2" />}
                        {model.type === 'prediction' && <TrendingUp className="h-5 w-5 mr-2" />}
                        {model.type === 'computer_vision' && <Eye className="h-5 w-5 mr-2" />}
                        {model.name}
                      </CardTitle>
                      <CardDescription>
                        Last trained: {model.lastTrained.toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={model.isActive}
                        onCheckedChange={() => toggleModel(model.id)}
                      />
                      <Badge variant={model.isActive ? "default" : "secondary"}>
                        {model.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Accuracy</div>
                        <div className="text-2xl font-bold text-green-600">{model.accuracy}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Confidence</div>
                        <div className="text-2xl font-bold text-blue-600">{model.confidence}%</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Training Data Size:</span>
                        <span>{model.trainingDataSize.toLocaleString()} samples</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Learning Rate:</span>
                        <span>{model.parameters.learningRate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Batch Size:</span>
                        <span>{model.parameters.batchSize}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retrainModel(model.id)}
                        disabled={!model.isActive}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retrain
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportModelData(model.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Recent AI Recommendations
              </CardTitle>
              <CardDescription>
                Latest recommendations generated by the AI system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRecommendations.map((rec, index) => (
                  <div key={rec.id || index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {rec.type}
                        </Badge>
                        <div className="text-sm font-medium">{rec.reasoning}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Confidence</div>
                        <div className="font-bold">{Math.round(rec.confidence * 100)}%</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      Created: {rec.createdAt.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      Status: <Badge variant={
                        rec.status === 'accepted' ? 'default' :
                        rec.status === 'rejected' ? 'destructive' : 'secondary'
                      }>{rec.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Segmentation Tab */}
        <TabsContent value="segmentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                AI-Generated User Segments
              </CardTitle>
              <CardDescription>
                Intelligent user segmentation based on behavior patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {userSegments.map((segment) => (
                  <div key={segment.id} className="p-6 border rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-lg">{segment.name}</h3>
                      <Badge variant={
                        segment.id === 'high_performers' ? 'default' :
                        segment.id === 'at_risk' ? 'destructive' : 'secondary'
                      }>
                        {segment.userCount} users
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Engagement Score:</span>
                        <span className="font-medium">{segment.engagementScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Retention Rate:</span>
                        <span className="font-medium">{segment.retentionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Activity Level:</span>
                        <Badge variant="outline">{segment.criteria.activityLevel}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Completion Rate:</span>
                        <span className="font-medium">{segment.criteria.completionRate}%</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="text-xs text-gray-600">
                        Last updated: {segment.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Computer Vision Tab */}
        <TabsContent value="computer-vision" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Computer Vision System
              </CardTitle>
              <CardDescription>
                Real-time posture correction and form analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">System Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Form Detection:</span>
                      <Badge variant="secondary">Inactive</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pose Estimation:</span>
                      <Badge variant="secondary">Inactive</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Real-time Analysis:</span>
                      <Badge variant="secondary">Inactive</Badge>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Activate Computer Vision
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Supported Exercises</h3>
                  <div className="space-y-2">
                    {['Squats', 'Deadlifts', 'Push-ups', 'Planks', 'Lunges'].map((exercise) => (
                      <div key={exercise} className="flex justify-between items-center">
                        <span className="text-sm">{exercise}</span>
                        <Badge variant="outline">Ready</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Computer Vision Module</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      The computer vision system is currently in development. This feature will provide real-time
                      form correction and posture analysis using advanced machine learning models.
                    </p>
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
