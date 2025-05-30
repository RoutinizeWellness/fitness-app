"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Zap, 
  Heart, 
  Clock,
  Dumbbell,
  BarChart3,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react'
import { useAuth } from "@/lib/auth/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { AISystem } from '@/lib/ai-core-service'

interface PersonalizationData {
  userLevel: 'beginner' | 'intermediate' | 'advanced'
  primaryGoal: string
  fatigueLevel: number
  readinessScore: number
  weeklyProgress: number
  recommendations: AIRecommendation[]
  adaptiveAdjustments: AdaptiveAdjustment[]
}

interface AIRecommendation {
  id: string
  type: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  confidence: number
  actions: string[]
  reasoning: string
  category: string
}

interface AdaptiveAdjustment {
  type: 'intensity' | 'volume' | 'frequency' | 'exercise_selection'
  adjustment: string
  reason: string
  impact: 'positive' | 'neutral' | 'negative'
}

export function EnhancedTrainingPersonalization() {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user) {
      loadPersonalizationData()
    }
  }, [user])

  const loadPersonalizationData = async () => {
    try {
      setIsLoading(true)
      console.log('🤖 Cargando datos de personalización de entrenamiento...')

      // Initialize AI system
      const aiSystem = new AISystem(user.id)
      
      // Generate personalized recommendations
      const recommendations = await aiSystem.generateHyperpersonalizedRecommendations('workout', 5)
      
      // Mock data for demonstration (in production, this would come from real analytics)
      const mockData: PersonalizationData = {
        userLevel: profile?.experience_level || 'beginner',
        primaryGoal: profile?.goal || 'general_fitness',
        fatigueLevel: Math.floor(Math.random() * 10) + 1,
        readinessScore: Math.floor(Math.random() * 40) + 60,
        weeklyProgress: Math.floor(Math.random() * 30) + 70,
        recommendations: recommendations || [],
        adaptiveAdjustments: [
          {
            type: 'intensity',
            adjustment: 'Reducir intensidad en 15%',
            reason: 'Nivel de fatiga elevado detectado',
            impact: 'positive'
          },
          {
            type: 'volume',
            adjustment: 'Mantener volumen actual',
            reason: 'Progreso constante en las últimas semanas',
            impact: 'neutral'
          }
        ]
      }

      setPersonalizationData(mockData)
      console.log('✅ Datos de personalización cargados:', mockData)

    } catch (error) {
      console.error('❌ Error cargando datos de personalización:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de personalización",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'negative': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!personalizationData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No se pudieron cargar los datos de personalización</p>
          <Button onClick={loadPersonalizationData} className="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1B237E] flex items-center">
            <Brain className="h-6 w-6 mr-2 text-[#FEA800]" />
            Entrenamiento Personalizado
          </h2>
          <p className="text-gray-600 mt-1">
            Recomendaciones adaptadas a tu progreso y objetivos
          </p>
        </div>
        <Badge variant="outline" className="text-[#1B237E] border-[#1B237E]">
          <Sparkles className="h-4 w-4 mr-1" />
          IA Activa
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nivel de Fatiga</p>
                <p className="text-2xl font-bold text-[#1B237E]">{personalizationData.fatigueLevel}/10</p>
              </div>
              <Heart className="h-8 w-8 text-[#FF6767]" />
            </div>
            <Progress value={personalizationData.fatigueLevel * 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Preparación</p>
                <p className="text-2xl font-bold text-[#1B237E]">{personalizationData.readinessScore}%</p>
              </div>
              <Zap className="h-8 w-8 text-[#FEA800]" />
            </div>
            <Progress value={personalizationData.readinessScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progreso Semanal</p>
                <p className="text-2xl font-bold text-[#1B237E]">{personalizationData.weeklyProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#573353]" />
            </div>
            <Progress value={personalizationData.weeklyProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nivel</p>
                <p className="text-lg font-bold text-[#1B237E] capitalize">{personalizationData.userLevel}</p>
              </div>
              <Target className="h-8 w-8 text-[#B1AFE9]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          <TabsTrigger value="adjustments">Ajustes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Análisis de Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Objetivo Principal</span>
                    <Badge variant="secondary">{personalizationData.primaryGoal}</Badge>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Estado de Entrenamiento</span>
                    <span className="text-sm text-gray-600">
                      {personalizationData.readinessScore > 80 ? 'Óptimo' : 
                       personalizationData.readinessScore > 60 ? 'Bueno' : 'Necesita Descanso'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {personalizationData.recommendations.length > 0 ? (
            personalizationData.recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <CardDescription>{rec.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Acciones Recomendadas:</h4>
                      <ul className="space-y-1">
                        {rec.actions.map((action, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <strong>Razonamiento:</strong> {rec.reasoning}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No hay recomendaciones disponibles en este momento</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="adjustments" className="space-y-4">
          {personalizationData.adaptiveAdjustments.map((adjustment, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getImpactIcon(adjustment.impact)}
                      <span className="font-medium ml-2 capitalize">{adjustment.type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{adjustment.adjustment}</p>
                    <p className="text-xs text-gray-500">{adjustment.reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
