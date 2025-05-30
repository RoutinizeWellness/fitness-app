"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import {
  Sparkles,
  Brain,
  Dumbbell,
  Utensils,
  Moon,
  Heart,
  Activity,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart2
} from "lucide-react"
import { AICoreService } from "@/lib/ai-core-service"
import { useAuth } from "@/lib/auth/auth-context"

interface AICoreRecommendation {
  id: string
  domain: 'workout' | 'nutrition' | 'sleep' | 'wellness'
  title: string
  description: string
  confidence: number
  impact: {
    energy: number
    recovery: number
    performance: number
    health: number
  }
  urgency: 'high' | 'medium' | 'low'
  actionable: boolean
  action?: {
    type: string
    target: string
    params?: any
  }
  tags: string[]
  createdAt: string
}

interface WellnessScore {
  overall: number
  physical: number
  mental: number
  recovery: number
  readiness: number
  trend: 'up' | 'down' | 'stable'
}

export default function AICoreDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [recommendations, setRecommendations] = useState<AICoreRecommendation[]>([])
  const [wellnessScore, setWellnessScore] = useState<WellnessScore | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [aiCoreInitialized, setAiCoreInitialized] = useState(false)
  const [aiCore, setAiCore] = useState<AICoreService | null>(null)

  // Initialize AI Core Service
  useEffect(() => {
    const initializeAICore = async () => {
      if (!user) return

      try {
        const aiCoreService = new AICoreService(user.id, {
          includeWearableData: true,
          includeSleepData: true,
          includeNutritionData: true,
          includeMentalWellnessData: true,
          adaptationSpeed: 'medium',
          personalizationLevel: 'high'
        })

        const initialized = await aiCoreService.initialize()

        if (initialized) {
          setAiCore(aiCoreService)
          setAiCoreInitialized(true)
        } else {
          toast({
            title: "Error",
            description: "No se pudo inicializar el núcleo de IA. Algunas funciones pueden no estar disponibles.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error al inicializar el núcleo de IA:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al inicializar el núcleo de IA.",
          variant: "destructive",
        })
      }
    }

    initializeAICore()
  }, [user, toast])

  // Load recommendations and wellness score
  useEffect(() => {
    const loadData = async () => {
      if (!aiCoreInitialized || !aiCore) return

      setIsLoading(true)

      try {
        // Load recommendations
        const recs = await aiCore.generateHyperpersonalizedRecommendations('all', 10)
        setRecommendations(recs)

        // Generate wellness score (placeholder for now)
        generateWellnessScore()
      } catch (error) {
        console.error("Error al cargar datos del núcleo de IA:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (aiCoreInitialized) {
      loadData()
    }
  }, [aiCoreInitialized, aiCore])

  // Generate a wellness score (placeholder implementation)
  const generateWellnessScore = () => {
    // In a real implementation, this would come from the AI Core Service
    const score: WellnessScore = {
      overall: Math.floor(Math.random() * 30) + 70, // 70-100
      physical: Math.floor(Math.random() * 30) + 70,
      mental: Math.floor(Math.random() * 30) + 70,
      recovery: Math.floor(Math.random() * 30) + 70,
      readiness: Math.floor(Math.random() * 30) + 70,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
    }

    setWellnessScore(score)
  }

  // Refresh data
  const handleRefresh = async () => {
    if (!aiCore) return

    setIsRefreshing(true)

    try {
      // Load recommendations
      const recs = await aiCore.generateHyperpersonalizedRecommendations('all', 10)
      setRecommendations(recs)

      // Generate wellness score
      generateWellnessScore()

      toast({
        title: "Actualizado",
        description: "Los datos se han actualizado correctamente.",
      })
    } catch (error) {
      console.error("Error al actualizar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">IA Hiperpersonalizada</h2>
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>

        <Skeleton className="h-64" />
      </div>
    )
  }

  // Render wellness score card
  const renderWellnessScoreCard = () => {
    if (!wellnessScore) return null

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            Puntuación de Bienestar
          </CardTitle>
          <CardDescription>
            Tu estado general de bienestar basado en todos tus datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{wellnessScore.overall}</span>
              </div>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={wellnessScore.overall >= 80 ? "#10b981" : wellnessScore.overall >= 60 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="10"
                  strokeDasharray={`${wellnessScore.overall * 2.83} 283`}
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>

            <div className="flex items-center space-x-1 mb-4">
              <span className="text-sm font-medium">Tendencia:</span>
              {wellnessScore.trend === 'up' && (
                <span className="flex items-center text-green-500">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Mejorando
                </span>
              )}
              {wellnessScore.trend === 'down' && (
                <span className="flex items-center text-red-500">
                  <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" />
                  Disminuyendo
                </span>
              )}
              {wellnessScore.trend === 'stable' && (
                <span className="flex items-center text-blue-500">
                  <Activity className="h-4 w-4 mr-1" />
                  Estable
                </span>
              )}
            </div>

            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span>Físico</span>
                <span>{wellnessScore.physical}%</span>
              </div>
              <Progress value={wellnessScore.physical} className="h-2" />

              <div className="flex justify-between text-sm">
                <span>Mental</span>
                <span>{wellnessScore.mental}%</span>
              </div>
              <Progress value={wellnessScore.mental} className="h-2" />

              <div className="flex justify-between text-sm">
                <span>Recuperación</span>
                <span>{wellnessScore.recovery}%</span>
              </div>
              <Progress value={wellnessScore.recovery} className="h-2" />

              <div className="flex justify-between text-sm">
                <span>Preparación</span>
                <span>{wellnessScore.readiness}%</span>
              </div>
              <Progress value={wellnessScore.readiness} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render recommendation card
  const renderRecommendationCard = (recommendation: AICoreRecommendation) => {
    // Get icon based on domain
    const getIcon = () => {
      switch (recommendation.domain) {
        case 'workout':
          return <Dumbbell className="h-5 w-5 text-blue-500" />
        case 'nutrition':
          return <Utensils className="h-5 w-5 text-green-500" />
        case 'sleep':
          return <Moon className="h-5 w-5 text-purple-500" />
        case 'wellness':
          return <Heart className="h-5 w-5 text-red-500" />
        default:
          return <Sparkles className="h-5 w-5 text-primary" />
      }
    }

    // Get urgency badge
    const getUrgencyBadge = () => {
      switch (recommendation.urgency) {
        case 'high':
          return <Badge variant="destructive">Alta prioridad</Badge>
        case 'medium':
          return <Badge variant="default">Prioridad media</Badge>
        case 'low':
          return <Badge variant="outline">Baja prioridad</Badge>
        default:
          return null
      }
    }

    return (
      <Card key={recommendation.id}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              {getIcon()}
              <CardTitle className="ml-2 text-lg">{recommendation.title}</CardTitle>
            </div>
            {getUrgencyBadge()}
          </div>
          <CardDescription>
            {recommendation.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Confianza</span>
            <span className="font-medium">{recommendation.confidence}%</span>
          </div>
          <Progress value={recommendation.confidence} className="h-1 mb-4" />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center">
              <Zap className="h-3 w-3 mr-1 text-yellow-500" />
              <span>Energía: +{recommendation.impact.energy}</span>
            </div>
            <div className="flex items-center">
              <Activity className="h-3 w-3 mr-1 text-blue-500" />
              <span>Rendimiento: +{recommendation.impact.performance}</span>
            </div>
            <div className="flex items-center">
              <Moon className="h-3 w-3 mr-1 text-purple-500" />
              <span>Recuperación: +{recommendation.impact.recovery}</span>
            </div>
            <div className="flex items-center">
              <Heart className="h-3 w-3 mr-1 text-red-500" />
              <span>Salud: +{recommendation.impact.health}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {recommendation.actionable && (
            <Button className="w-full">Aplicar recomendación</Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">IA Hiperpersonalizada</h2>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center">
            <Dumbbell className="h-4 w-4 mr-2" />
            Entrenamiento
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center">
            <Utensils className="h-4 w-4 mr-2" />
            Nutrición
          </TabsTrigger>
          <TabsTrigger value="wellness" className="flex items-center">
            <Heart className="h-4 w-4 mr-2" />
            Bienestar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderWellnessScoreCard()}

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-primary" />
                  Recomendaciones Principales
                </CardTitle>
                <CardDescription>
                  Recomendaciones personalizadas basadas en tus datos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.length > 0 ? (
                    recommendations.slice(0, 3).map(recommendation => (
                      <div key={recommendation.id} className="flex items-start space-x-3">
                        {recommendation.domain === 'workout' && <Dumbbell className="h-5 w-5 text-blue-500 mt-0.5" />}
                        {recommendation.domain === 'nutrition' && <Utensils className="h-5 w-5 text-green-500 mt-0.5" />}
                        {recommendation.domain === 'sleep' && <Moon className="h-5 w-5 text-purple-500 mt-0.5" />}
                        {recommendation.domain === 'wellness' && <Heart className="h-5 w-5 text-red-500 mt-0.5" />}
                        <div>
                          <p className="font-medium">{recommendation.title}</p>
                          <p className="text-sm text-gray-500">{recommendation.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">No hay recomendaciones disponibles</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Ver todas las recomendaciones
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Additional overview content will go here */}
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations
              .filter(rec => rec.domain === 'workout')
              .map(recommendation => renderRecommendationCard(recommendation))}
          </div>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations
              .filter(rec => rec.domain === 'nutrition')
              .map(recommendation => renderRecommendationCard(recommendation))}
          </div>
        </TabsContent>

        <TabsContent value="wellness" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations
              .filter(rec => rec.domain === 'sleep' || rec.domain === 'wellness')
              .map(recommendation => renderRecommendationCard(recommendation))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
