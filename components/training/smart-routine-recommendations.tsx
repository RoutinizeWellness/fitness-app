"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain, Target, Zap, TrendingUp, Clock, Dumbbell,
  CheckCircle, AlertCircle, Lightbulb, Star, Award,
  RefreshCw, Play, Eye, ChevronRight, Sparkles
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkoutRoutine } from "@/lib/types/training"
import { getUserAdaptiveProfile, SmartRecommendation } from "@/lib/adaptive-routine-engine"
import { getUserFatigue } from "@/lib/adaptive-learning-service"
import { useToast } from "@/components/ui/use-toast"

interface SmartRoutineRecommendationsProps {
  userId: string
  currentRoutines: WorkoutRoutine[]
  onSelectRecommendation: (routine: WorkoutRoutine) => void
  onPreviewRecommendation: (routine: WorkoutRoutine) => void
  className?: string
}

interface AIRecommendation {
  id: string
  type: 'routine_optimization' | 'new_routine' | 'exercise_swap' | 'progression_adjustment'
  title: string
  description: string
  routine?: WorkoutRoutine
  confidence: number
  reasoning: string[]
  benefits: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedImpact: number // 1-10 scale
  timeToSeeResults: string
  difficulty: 'easy' | 'moderate' | 'challenging'
}

interface UserInsights {
  strengthAreas: string[]
  improvementAreas: string[]
  preferredExerciseTypes: string[]
  optimalTrainingFrequency: number
  recoveryNeeds: 'low' | 'moderate' | 'high'
  motivationFactors: string[]
  progressTrend: 'improving' | 'plateauing' | 'declining'
}

export function SmartRoutineRecommendations({
  userId,
  currentRoutines,
  onSelectRecommendation,
  onPreviewRecommendation,
  className = ""
}: SmartRoutineRecommendationsProps) {
  const { toast } = useToast()
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [userInsights, setUserInsights] = useState<UserInsights | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('recommendations')
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null)

  useEffect(() => {
    generateRecommendations()
  }, [userId, currentRoutines])

  const generateRecommendations = async () => {
    try {
      setIsGenerating(true)
      
      // Obtener perfil adaptativo y datos de fatiga
      const [profile, fatigueData] = await Promise.all([
        getUserAdaptiveProfile(userId),
        getUserFatigue(userId)
      ])

      if (!profile) {
        toast({
          title: "Error",
          description: "No se pudo cargar el perfil del usuario",
          variant: "destructive"
        })
        return
      }

      // Generar insights del usuario
      const insights = await generateUserInsights(profile, fatigueData, currentRoutines)
      setUserInsights(insights)

      // Generar recomendaciones de IA
      const aiRecommendations = await generateAIRecommendations(profile, insights, currentRoutines)
      setRecommendations(aiRecommendations)

    } catch (error) {
      console.error('Error generating recommendations:', error)
      toast({
        title: "Error",
        description: "No se pudieron generar las recomendaciones",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateUserInsights = async (
    profile: any,
    fatigueData: any,
    routines: WorkoutRoutine[]
  ): Promise<UserInsights> => {
    // Análisis de fortalezas basado en experiencia y preferencias
    const strengthAreas = []
    if (profile.experienceLevel === 'advanced' || profile.experienceLevel === 'expert') {
      strengthAreas.push('Técnica avanzada', 'Periodización')
    }
    if (profile.preferredExerciseTypes.includes('compound')) {
      strengthAreas.push('Ejercicios compuestos')
    }
    if (profile.recoveryCapacity >= 8) {
      strengthAreas.push('Capacidad de recuperación')
    }

    // Análisis de áreas de mejora
    const improvementAreas = []
    if (profile.timeConstraints.sessionsPerWeek < 3) {
      improvementAreas.push('Frecuencia de entrenamiento')
    }
    if (profile.motivationLevel < 7) {
      improvementAreas.push('Motivación y adherencia')
    }
    if (fatigueData?.currentFatigue > 70) {
      improvementAreas.push('Gestión de fatiga')
    }

    // Determinar tendencia de progreso (simulado)
    const progressTrend = fatigueData?.currentFatigue > 80 ? 'declining' :
                         profile.motivationLevel >= 8 ? 'improving' : 'plateauing'

    return {
      strengthAreas,
      improvementAreas,
      preferredExerciseTypes: profile.preferredExerciseTypes,
      optimalTrainingFrequency: Math.min(profile.timeConstraints.sessionsPerWeek + 1, 6),
      recoveryNeeds: profile.recoveryCapacity < 6 ? 'high' : 
                    profile.recoveryCapacity < 8 ? 'moderate' : 'low',
      motivationFactors: ['Variedad en ejercicios', 'Progreso visible', 'Rutinas eficientes'],
      progressTrend
    }
  }

  const generateAIRecommendations = async (
    profile: any,
    insights: UserInsights,
    routines: WorkoutRoutine[]
  ): Promise<AIRecommendation[]> => {
    const recommendations: AIRecommendation[] = []

    // Recomendación 1: Optimización de rutina actual
    if (routines.length > 0) {
      recommendations.push({
        id: 'optimize_current',
        type: 'routine_optimization',
        title: 'Optimizar Rutina Actual',
        description: 'Mejora tu rutina actual con ajustes personalizados basados en tu progreso',
        confidence: 0.85,
        reasoning: [
          'Tu nivel de experiencia permite mayor complejidad',
          'Patrones de fatiga sugieren ajustes en volumen',
          'Preferencias de ejercicios pueden optimizarse'
        ],
        benefits: [
          'Mejor progreso en fuerza',
          'Reducción de fatiga acumulada',
          'Mayor adherencia al programa'
        ],
        priority: 'high',
        estimatedImpact: 8,
        timeToSeeResults: '2-3 semanas',
        difficulty: 'easy'
      })
    }

    // Recomendación 2: Nueva rutina basada en objetivos
    if (profile.fitnessGoals.includes('hypertrophy')) {
      recommendations.push({
        id: 'hypertrophy_focus',
        type: 'new_routine',
        title: 'Rutina Especializada en Hipertrofia',
        description: 'Programa avanzado diseñado específicamente para maximizar el crecimiento muscular',
        confidence: 0.92,
        reasoning: [
          'Tu objetivo principal es hipertrofia',
          'Nivel de experiencia permite técnicas avanzadas',
          'Capacidad de recuperación es adecuada'
        ],
        benefits: [
          'Crecimiento muscular optimizado',
          'Técnicas avanzadas de intensidad',
          'Periodización científica'
        ],
        priority: 'high',
        estimatedImpact: 9,
        timeToSeeResults: '4-6 semanas',
        difficulty: 'moderate'
      })
    }

    // Recomendación 3: Ajuste por fatiga
    if (insights.recoveryNeeds === 'high') {
      recommendations.push({
        id: 'recovery_focused',
        type: 'routine_optimization',
        title: 'Programa de Recuperación Activa',
        description: 'Rutina adaptada para mejorar tu capacidad de recuperación y reducir fatiga',
        confidence: 0.78,
        reasoning: [
          'Niveles de fatiga elevados detectados',
          'Necesidad de mejorar recuperación',
          'Mantener progreso sin sobreentrenamiento'
        ],
        benefits: [
          'Mejor calidad de sueño',
          'Reducción de fatiga',
          'Sostenibilidad a largo plazo'
        ],
        priority: 'critical',
        estimatedImpact: 7,
        timeToSeeResults: '1-2 semanas',
        difficulty: 'easy'
      })
    }

    // Recomendación 4: Progresión de ejercicios
    recommendations.push({
      id: 'exercise_progression',
      type: 'exercise_swap',
      title: 'Progresión de Ejercicios Avanzados',
      description: 'Incorpora variaciones más desafiantes de tus ejercicios favoritos',
      confidence: 0.73,
      reasoning: [
        'Dominio de ejercicios básicos confirmado',
        'Necesidad de estímulo progresivo',
        'Prevención de estancamiento'
      ],
      benefits: [
        'Nuevos estímulos de crecimiento',
        'Mejora en coordinación',
        'Prevención de aburrimiento'
      ],
      priority: 'medium',
      estimatedImpact: 6,
      timeToSeeResults: '3-4 semanas',
      difficulty: 'challenging'
    })

    // Recomendación 5: Ajuste de frecuencia
    if (insights.optimalTrainingFrequency > profile.timeConstraints.sessionsPerWeek) {
      recommendations.push({
        id: 'frequency_increase',
        type: 'progression_adjustment',
        title: 'Aumentar Frecuencia de Entrenamiento',
        description: `Incrementa a ${insights.optimalTrainingFrequency} sesiones por semana para mejores resultados`,
        confidence: 0.81,
        reasoning: [
          'Tu capacidad de recuperación lo permite',
          'Distribución de volumen más eficiente',
          'Mejor adherencia con sesiones más cortas'
        ],
        benefits: [
          'Mejor distribución del volumen',
          'Recuperación más eficiente',
          'Progreso más consistente'
        ],
        priority: 'medium',
        estimatedImpact: 7,
        timeToSeeResults: '2-3 semanas',
        difficulty: 'moderate'
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'routine_optimization': return TrendingUp
      case 'new_routine': return Target
      case 'exercise_swap': return RefreshCw
      case 'progression_adjustment': return Zap
      default: return Lightbulb
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600'
      case 'moderate': return 'text-yellow-600'
      case 'challenging': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-[#1B237E]" />
              <CardTitle>Recomendaciones Inteligentes</CardTitle>
            </div>
            <SafeClientButton
              variant="outline"
              size="sm"
              onClick={generateRecommendations}
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
            Sugerencias personalizadas basadas en IA para optimizar tu entrenamiento
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          <TabsTrigger value="insights">Análisis Personal</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mx-auto mb-4"
                  >
                    <Brain className="h-8 w-8 text-[#1B237E]" />
                  </motion.div>
                  <p className="text-gray-600">Analizando tu perfil y generando recomendaciones...</p>
                </div>
              </motion.div>
            ) : recommendations.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recomendaciones disponibles</h3>
                <p className="text-gray-600 mb-4">Completa más entrenamientos para obtener sugerencias personalizadas</p>
              </motion.div>
            ) : (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {recommendations.map((recommendation, index) => {
                  const Icon = getRecommendationIcon(recommendation.type)
                  
                  return (
                    <motion.div
                      key={recommendation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <Icon className="h-5 w-5 mr-2 text-[#1B237E]" />
                                <h3 className="font-semibold">{recommendation.title}</h3>
                                <Badge className={`ml-2 text-xs ${getPriorityColor(recommendation.priority)}`}>
                                  {recommendation.priority}
                                </Badge>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-3">
                                {recommendation.description}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                  <span className="text-sm">
                                    Confianza: {Math.round(recommendation.confidence * 100)}%
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                                  <span className="text-sm">
                                    Impacto: {recommendation.estimatedImpact}/10
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1 text-blue-500" />
                                  <span className="text-sm">
                                    Resultados: {recommendation.timeToSeeResults}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <h4 className="text-xs font-medium text-gray-700 mb-1">Razones:</h4>
                                  <ul className="text-xs text-gray-600 space-y-1">
                                    {recommendation.reasoning.map((reason, i) => (
                                      <li key={i} className="flex items-start">
                                        <CheckCircle className="h-3 w-3 mr-1 mt-0.5 text-green-500 flex-shrink-0" />
                                        {reason}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div>
                                  <h4 className="text-xs font-medium text-gray-700 mb-1">Beneficios:</h4>
                                  <ul className="text-xs text-gray-600 space-y-1">
                                    {recommendation.benefits.map((benefit, i) => (
                                      <li key={i} className="flex items-start">
                                        <Zap className="h-3 w-3 mr-1 mt-0.5 text-blue-500 flex-shrink-0" />
                                        {benefit}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col space-y-2 ml-4">
                              <div className="text-right">
                                <div className="text-xs text-gray-500 mb-1">Dificultad</div>
                                <Badge variant="outline" className={`text-xs ${getDifficultyColor(recommendation.difficulty)}`}>
                                  {recommendation.difficulty}
                                </Badge>
                              </div>
                              
                              <SafeClientButton size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver Detalles
                              </SafeClientButton>
                              
                              {recommendation.routine && (
                                <SafeClientButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onSelectRecommendation(recommendation.routine!)}
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  Aplicar
                                </SafeClientButton>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {userInsights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fortalezas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Fortalezas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {userInsights.strengthAreas.map((strength, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Star className="h-4 w-4 mr-2 text-yellow-500" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Áreas de mejora */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-600">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Áreas de Mejora
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {userInsights.improvementAreas.map((area, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Target className="h-4 w-4 mr-2 text-blue-500" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Tendencia de progreso */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Tendencia de Progreso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Estado actual:</span>
                    <Badge className={
                      userInsights.progressTrend === 'improving' ? 'bg-green-100 text-green-800' :
                      userInsights.progressTrend === 'plateauing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {userInsights.progressTrend === 'improving' ? 'Mejorando' :
                       userInsights.progressTrend === 'plateauing' ? 'Estancado' : 'Declinando'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Necesidades de recuperación */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Recuperación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Necesidades:</span>
                    <Badge className={
                      userInsights.recoveryNeeds === 'low' ? 'bg-green-100 text-green-800' :
                      userInsights.recoveryNeeds === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {userInsights.recoveryNeeds === 'low' ? 'Bajas' :
                       userInsights.recoveryNeeds === 'moderate' ? 'Moderadas' : 'Altas'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
