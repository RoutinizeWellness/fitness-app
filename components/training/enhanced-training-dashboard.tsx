"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton as Button } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dumbbell, 
  Target, 
  TrendingUp, 
  Zap, 
  Calculator,
  Calendar,
  BarChart3,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  Settings
} from 'lucide-react'
import { useAuth } from "@/lib/auth/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { RMCalculator } from "./rm-calculator"
import { EnhancedTrainingPersonalization } from "./enhanced-training-personalization"
import EnhancedTrainingService, {
  AIRecommendation,
  WorkoutRecommendation
} from "@/lib/services/enhanced-training-service"

interface TrainingDashboardProps {
  userExperienceLevel: 'beginner' | 'intermediate' | 'advanced'
  className?: string
}

interface TrainingStats {
  weeklyWorkouts: number
  targetWorkouts: number
  currentStreak: number
  totalVolume: number
  averageIntensity: number
  nextWorkout: {
    name: string
    type: string
    duration: number
    exercises: number
  } | null
}

export function EnhancedTrainingDashboard({ userExperienceLevel, className }: TrainingDashboardProps) {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showRMCalculator, setShowRMCalculator] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([])
  const [todayWorkout, setTodayWorkout] = useState<WorkoutRecommendation[]>([])
  const [trainingService, setTrainingService] = useState<EnhancedTrainingService | null>(null)

  useEffect(() => {
    if (user) {
      const service = new EnhancedTrainingService(user.id)
      setTrainingService(service)
      loadTrainingStats()
      loadAIRecommendations(service)
    }
  }, [user])

  const loadTrainingStats = async () => {
    try {
      setIsLoading(true)
      console.log('📊 Cargando estadísticas de entrenamiento...')

      // Mock data for demonstration (in production, this would come from Supabase)
      const mockStats: TrainingStats = {
        weeklyWorkouts: 3,
        targetWorkouts: 4,
        currentStreak: 5,
        totalVolume: 12500,
        averageIntensity: 78,
        nextWorkout: {
          name: userExperienceLevel === 'beginner' ? 'Entrenamiento de Cuerpo Completo' : 'Push Day - Pecho y Hombros',
          type: userExperienceLevel === 'beginner' ? 'full_body' : 'push',
          duration: userExperienceLevel === 'beginner' ? 30 : 60,
          exercises: userExperienceLevel === 'beginner' ? 6 : 8
        }
      }

      setTrainingStats(mockStats)
      console.log('✅ Estadísticas de entrenamiento cargadas:', mockStats)

    } catch (error) {
      console.error('❌ Error cargando estadísticas de entrenamiento:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas de entrenamiento",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadAIRecommendations = async (service: EnhancedTrainingService) => {
    try {
      // Cargar recomendaciones de entrenamiento de hoy
      const workout = await service.getTodayWorkoutRecommendations()
      setTodayWorkout(workout)

      // Generar recomendaciones de IA simuladas
      const mockRecommendations: AIRecommendation[] = [
        {
          id: 'ai_rec_1',
          type: 'intensity',
          title: 'Ajustar intensidad de entrenamiento',
          description: 'Basado en tu progreso reciente, considera aumentar la intensidad en un 5%',
          reasoning: 'Tu adherencia ha sido excelente y tus métricas de recuperación son buenas',
          confidence_score: 0.85,
          priority: 'medium',
          created_at: new Date().toISOString()
        },
        {
          id: 'ai_rec_2',
          type: 'exercise',
          title: 'Incluir más trabajo de piernas',
          description: 'Tus entrenamientos de tren superior están bien balanceados, pero necesitas más volumen en piernas',
          reasoning: 'Análisis de tu historial muestra un desbalance en el volumen de entrenamiento',
          confidence_score: 0.92,
          priority: 'high',
          created_at: new Date().toISOString()
        },
        {
          id: 'ai_rec_3',
          type: 'recovery',
          title: 'Optimizar días de descanso',
          description: 'Considera incluir trabajo de movilidad en tus días de descanso activo',
          reasoning: 'Tu tiempo de recuperación podría mejorar con trabajo de movilidad',
          confidence_score: 0.78,
          priority: 'low',
          created_at: new Date().toISOString()
        }
      ]

      setAiRecommendations(mockRecommendations)
    } catch (error) {
      console.error('Error al cargar recomendaciones de IA:', error)
    }
  }

  const handleStartWorkout = () => {
    if (userExperienceLevel === 'beginner') {
      router.push('/training/beginner/workout')
    } else {
      router.push('/training/execute-workout')
    }
  }

  const handleCreateRoutine = () => {
    if (userExperienceLevel === 'beginner') {
      router.push('/training/beginner/create-routine')
    } else {
      router.push('/training/routines/create')
    }
  }

  const handleViewProgress = () => {
    router.push('/training/progress')
  }

  const getExperienceBadgeColor = () => {
    switch (userExperienceLevel) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

  if (!trainingStats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No se pudieron cargar las estadísticas de entrenamiento</p>
          <Button onClick={loadTrainingStats} className="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1B237E] flex items-center">
            <Dumbbell className="h-6 w-6 mr-2 text-[#FEA800]" />
            Dashboard de Entrenamiento
          </h2>
          <p className="text-gray-600 mt-1">
            Gestiona tus entrenamientos y progreso
          </p>
        </div>
        <Badge className={getExperienceBadgeColor()}>
          <Sparkles className="h-4 w-4 mr-1" />
          {userExperienceLevel === 'beginner' ? 'Principiante' : 
           userExperienceLevel === 'intermediate' ? 'Intermedio' : 'Avanzado'}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-[#1B237E]">{trainingStats.weeklyWorkouts}/{trainingStats.targetWorkouts}</p>
              </div>
              <Calendar className="h-8 w-8 text-[#FEA800]" />
            </div>
            <Progress value={(trainingStats.weeklyWorkouts / trainingStats.targetWorkouts) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Racha Actual</p>
                <p className="text-2xl font-bold text-[#1B237E]">{trainingStats.currentStreak}</p>
              </div>
              <Zap className="h-8 w-8 text-[#FF6767]" />
            </div>
            <p className="text-xs text-gray-500 mt-1">días consecutivos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Volumen Total</p>
                <p className="text-2xl font-bold text-[#1B237E]">{trainingStats.totalVolume.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-[#573353]" />
            </div>
            <p className="text-xs text-gray-500 mt-1">kg esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Intensidad</p>
                <p className="text-2xl font-bold text-[#1B237E]">{trainingStats.averageIntensity}%</p>
              </div>
              <Target className="h-8 w-8 text-[#B1AFE9]" />
            </div>
            <Progress value={trainingStats.averageIntensity} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Next Workout Card */}
      {trainingStats.nextWorkout && (
        <Card className="border-[#1B237E] border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-[#1B237E]">Próximo Entrenamiento</span>
              <Badge variant="outline" className="text-[#FEA800] border-[#FEA800]">
                Recomendado
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{trainingStats.nextWorkout.name}</h3>
                <p className="text-gray-600">
                  {trainingStats.nextWorkout.duration} min • {trainingStats.nextWorkout.exercises} ejercicios
                </p>
              </div>
              <Button 
                onClick={handleStartWorkout}
                className="bg-[#FEA800] hover:bg-[#FEA800]/90 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Comenzar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={() => setShowRMCalculator(!showRMCalculator)}
          variant="outline" 
          className="h-16 flex flex-col items-center justify-center border-[#1B237E] text-[#1B237E] hover:bg-[#1B237E]/10"
        >
          <Calculator className="h-6 w-6 mb-1" />
          Calculadora RM
        </Button>

        <Button 
          onClick={handleCreateRoutine}
          variant="outline" 
          className="h-16 flex flex-col items-center justify-center border-[#573353] text-[#573353] hover:bg-[#573353]/10"
        >
          <Settings className="h-6 w-6 mb-1" />
          Crear Rutina
        </Button>

        <Button 
          onClick={handleViewProgress}
          variant="outline" 
          className="h-16 flex flex-col items-center justify-center border-[#FF6767] text-[#FF6767] hover:bg-[#FF6767]/10"
        >
          <TrendingUp className="h-6 w-6 mb-1" />
          Ver Progreso
        </Button>
      </div>

      {/* RM Calculator */}
      {showRMCalculator && (
        <RMCalculator 
          isExpanded={true}
          onSave={(data) => {
            console.log('RM guardado:', data)
            toast({
              title: "RM Guardado",
              description: "Tu registro de fuerza ha sido guardado correctamente"
            })
          }}
        />
      )}

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <Card className="border-[#573353] border-2">
          <CardHeader>
            <CardTitle className="flex items-center text-[#573353]">
              <Sparkles className="h-6 w-6 mr-2" />
              Recomendaciones de IA
            </CardTitle>
            <CardDescription>
              Sugerencias personalizadas basadas en tu progreso y datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiRecommendations.map((recommendation) => (
                <div key={recommendation.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-[#1B237E]">{recommendation.title}</h4>
                    <Badge
                      className={
                        recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                        recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }
                    >
                      {recommendation.priority === 'high' ? 'Alta' :
                       recommendation.priority === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                  <p className="text-xs text-gray-500 mb-2">{recommendation.reasoning}</p>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <Progress value={recommendation.confidence_score * 100} className="h-2" />
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {Math.round(recommendation.confidence_score * 100)}% confianza
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Workout Recommendations */}
      {todayWorkout.length > 0 && (
        <Card className="border-[#FEA800] border-2">
          <CardHeader>
            <CardTitle className="flex items-center text-[#FEA800]">
              <Target className="h-6 w-6 mr-2" />
              Entrenamiento Recomendado para Hoy
            </CardTitle>
            <CardDescription>
              Ejercicios personalizados basados en tu plan y progreso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayWorkout.slice(0, 3).map((exercise, index) => (
                <div key={exercise.exercise_id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-[#1B237E]">{exercise.exercise_name}</h4>
                    <p className="text-sm text-gray-600">
                      {exercise.sets} series × {exercise.reps} reps
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{exercise.notes}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-[#FEA800] border-[#FEA800]">
                      RPE {exercise.intensity_rpe}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {exercise.rest_time}s descanso
                    </p>
                  </div>
                </div>
              ))}
              {todayWorkout.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{todayWorkout.length - 3} ejercicios más
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Personalization */}
      <EnhancedTrainingPersonalization />
    </div>
  )
}
