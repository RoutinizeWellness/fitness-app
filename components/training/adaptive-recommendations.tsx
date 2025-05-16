"use client"

import { useState, useEffect } from "react"
import {
  Brain,
  TrendingUp,
  BarChart3,
  Calendar,
  Clock,
  Zap,
  Battery,
  RefreshCw,
  Dumbbell,
  Info,
  ChevronRight,
  Check,
  X,
  TrendingDown,
  AlertTriangle
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress } from "@/components/ui/progress"
import { Progress3D } from "@/components/ui/progress-3d"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  WorkoutRoutine,
  WorkoutLog,
  TrainingAlgorithmData,
  UserTrainingProfile
} from "@/lib/types/training"
import {
  getTrainingAlgorithmData,
  getUserTrainingProfile,
  saveTrainingAlgorithmData
} from "@/lib/supabase-training"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { toast } from "@/components/ui/use-toast"

interface AdaptiveRecommendationsProps {
  userId: string
  routines: WorkoutRoutine[]
  logs: WorkoutLog[]
  className?: string
}

export function AdaptiveRecommendations({
  userId,
  routines,
  logs,
  className
}: AdaptiveRecommendationsProps) {
  const [algorithmData, setAlgorithmData] = useState<TrainingAlgorithmData | null>(null)
  const [userProfile, setUserProfile] = useState<UserTrainingProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const { toast: useToastHook } = useToast()

  // Cargar datos del algoritmo y perfil del usuario
  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        // Cargar datos del algoritmo
        const { data: algData, error: algError } = await getTrainingAlgorithmData(userId)

        if (algError) {
          console.error("Error al cargar datos del algoritmo:", algError)
        } else if (algData) {
          setAlgorithmData(algData)
        }

        // Cargar perfil del usuario
        const { data: profileData, error: profileError } = await getUserTrainingProfile(userId)

        if (profileError) {
          console.error("Error al cargar perfil del usuario:", profileError)
        } else if (profileData) {
          setUserProfile(profileData)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las recomendaciones adaptativas",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      loadData()
    }
  }, [userId])

  // Calcular recomendaciones basadas en los datos
  const getRecommendations = () => {
    if (!algorithmData || !userProfile || logs.length === 0) {
      return []
    }

    const recommendations = []

    // Analizar patrones de entrenamiento
    const recentLogs = logs.slice(0, 10) // Últimos 10 entrenamientos

    // Calcular fatiga acumulada por grupo muscular
    const muscleGroupFatigue: Record<string, number> = {}

    recentLogs.forEach(log => {
      Object.entries(log.muscleGroupFatigue || {}).forEach(([group, fatigue]) => {
        muscleGroupFatigue[group] = (muscleGroupFatigue[group] || 0) + fatigue
      })
    })

    // Verificar si hay grupos musculares con fatiga excesiva
    const highFatigueGroups = Object.entries(muscleGroupFatigue)
      .filter(([_, fatigue]) => fatigue > 20) // Umbral de fatiga
      .map(([group]) => group)

    if (highFatigueGroups.length > 0) {
      recommendations.push({
        type: "recovery",
        title: "Recuperación necesaria",
        description: `Considera dar más descanso a: ${highFatigueGroups.join(", ")}`,
        priority: "high"
      })
    }

    // Verificar consistencia de entrenamiento
    const lastWeekLogs = logs.filter(log => {
      const logDate = new Date(log.date)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return logDate >= oneWeekAgo
    })

    if (lastWeekLogs.length < userProfile.frequency) {
      recommendations.push({
        type: "consistency",
        title: "Consistencia",
        description: `Esta semana has entrenado ${lastWeekLogs.length} de ${userProfile.frequency} días planificados`,
        priority: "medium"
      })
    }

    // Verificar progresión de peso/repeticiones
    const exerciseProgress: Record<string, { improved: boolean, stalled: boolean }> = {}

    // Analizar los últimos entrenamientos para cada ejercicio
    logs.forEach(log => {
      log.completedSets.forEach(set => {
        const exerciseId = set.alternativeExerciseId || set.exerciseId

        if (!exerciseProgress[exerciseId]) {
          exerciseProgress[exerciseId] = { improved: false, stalled: true }
        }

        // Verificar si hay progresión en el algoritmo
        const progression = algorithmData.exerciseProgressions[exerciseId]

        if (progression) {
          const lastWeight = progression.lastWeight
          const lastReps = progression.lastReps

          // Si ha aumentado peso o repeticiones, marcar como mejorado
          if ((set.completedWeight && lastWeight && set.completedWeight > lastWeight) ||
              (set.completedReps && lastReps && set.completedReps > lastReps)) {
            exerciseProgress[exerciseId].improved = true
            exerciseProgress[exerciseId].stalled = false
          }
        }
      })
    })

    // Identificar ejercicios estancados
    const stalledExercises = Object.entries(exerciseProgress)
      .filter(([_, progress]) => progress.stalled)
      .map(([exerciseId]) => exerciseId)

    if (stalledExercises.length > 0) {
      recommendations.push({
        type: "progression",
        title: "Progresión estancada",
        description: `Considera cambiar la estrategia para ${stalledExercises.length} ejercicios`,
        priority: "medium"
      })
    }

    // Verificar tiempo de entrenamiento
    const avgDuration = recentLogs.reduce((acc, log) => acc + log.duration, 0) / recentLogs.length

    if (avgDuration > userProfile.availableTime * 1.2) {
      recommendations.push({
        type: "time",
        title: "Entrenamientos largos",
        description: `Tus entrenamientos duran un promedio de ${Math.round(avgDuration)} minutos`,
        priority: "low"
      })
    }

    // Recomendaciones basadas en preferencias de intensidad detectadas
    if (algorithmData.preferredTrainingStyle?.intensityPreference === 'high') {
      // Para usuarios que prefieren alta intensidad
      recommendations.push({
        type: "intensity",
        title: "Preferencia de alta intensidad",
        description: "Se ha detectado que prefieres entrenar con alta intensidad. Considera usar RIR más bajos (0-1) y periodos de descanso más largos.",
        priority: "medium"
      })

      // Verificar si hay ejercicios que no se están haciendo con suficiente intensidad
      const lowIntensityExercises = Object.entries(algorithmData.exerciseProgressions)
        .filter(([_, prog]) => {
          const history = prog.history || []
          if (history.length === 0) return false

          // Verificar si los últimos entrenamientos tienen RIR alto (baja intensidad)
          const recentRirs = history.slice(0, 3).map(h => h.rir).filter(Boolean)
          if (recentRirs.length === 0) return false

          const avgRir = recentRirs.reduce((sum, rir) => sum + rir, 0) / recentRirs.length
          return avgRir > 2 // RIR mayor a 2 se considera baja intensidad para alguien que prefiere alta intensidad
        })
        .map(([id]) => {
          const exercise = availableExercises.find(ex => ex.id === id)
          return exercise ? exercise.name : id
        })
        .slice(0, 3) // Limitar a 3 ejercicios para no sobrecargar la recomendación

      if (lowIntensityExercises.length > 0) {
        recommendations.push({
          type: "intensity_adjustment",
          title: "Ajuste de intensidad recomendado",
          description: `Considera aumentar la intensidad en: ${lowIntensityExercises.join(", ")}`,
          priority: "medium"
        })
      }
    } else if (algorithmData.preferredTrainingStyle?.intensityPreference === 'low') {
      // Para usuarios que prefieren baja intensidad
      recommendations.push({
        type: "intensity",
        title: "Preferencia de baja intensidad",
        description: "Se ha detectado que prefieres entrenar con menor intensidad y más volumen. Considera usar RIR más altos (3-5) y periodos de descanso más cortos.",
        priority: "medium"
      })

      // Verificar si hay ejercicios que se están haciendo con demasiada intensidad
      const highIntensityExercises = Object.entries(algorithmData.exerciseProgressions)
        .filter(([_, prog]) => {
          const history = prog.history || []
          if (history.length === 0) return false

          // Verificar si los últimos entrenamientos tienen RIR bajo (alta intensidad)
          const recentRirs = history.slice(0, 3).map(h => h.rir).filter(Boolean)
          if (recentRirs.length === 0) return false

          const avgRir = recentRirs.reduce((sum, rir) => sum + rir, 0) / recentRirs.length
          return avgRir < 2 // RIR menor a 2 se considera alta intensidad para alguien que prefiere baja intensidad
        })
        .map(([id]) => {
          const exercise = availableExercises.find(ex => ex.id === id)
          return exercise ? exercise.name : id
        })
        .slice(0, 3) // Limitar a 3 ejercicios para no sobrecargar la recomendación

      if (highIntensityExercises.length > 0) {
        recommendations.push({
          type: "intensity_adjustment",
          title: "Ajuste de intensidad recomendado",
          description: `Considera reducir la intensidad en: ${highIntensityExercises.join(", ")}`,
          priority: "medium"
        })
      }
    }

    // Recomendaciones basadas en patrones de tiempo
    if (algorithmData.trainingPatterns?.preferredTimeOfDay) {
      const preferredTime = algorithmData.trainingPatterns.preferredTimeOfDay
      const timeText = preferredTime === 'morning' ? 'mañana' :
                      preferredTime === 'afternoon' ? 'tarde' : 'noche'

      recommendations.push({
        type: "timing",
        title: "Patrón de tiempo detectado",
        description: `Se ha detectado que prefieres entrenar por la ${timeText}. Considera programar tus entrenamientos en este horario para mejor rendimiento.`,
        priority: "low"
      })
    }

    // Recomendaciones basadas en días preferidos
    if (algorithmData.trainingPatterns?.preferredDaysOfWeek &&
        algorithmData.trainingPatterns.preferredDaysOfWeek.length > 0) {

      const dayTranslations: Record<string, string> = {
        'monday': 'lunes',
        'tuesday': 'martes',
        'wednesday': 'miércoles',
        'thursday': 'jueves',
        'friday': 'viernes',
        'saturday': 'sábado',
        'sunday': 'domingo'
      }

      const preferredDays = algorithmData.trainingPatterns.preferredDaysOfWeek
        .map(day => dayTranslations[day] || day)
        .join(', ')

      recommendations.push({
        type: "schedule",
        title: "Días preferidos detectados",
        description: `Tus días preferidos para entrenar son: ${preferredDays}. Considera ajustar tu rutina a estos días.`,
        priority: "low"
      })
    }

    return recommendations
  }

  // Actualizar el algoritmo con los datos más recientes
  const updateAlgorithm = async () => {
    if (!algorithmData || !userProfile || logs.length === 0) {
      return
    }

    try {
      // Crear una copia del algoritmo actual
      const updatedAlgorithm = { ...algorithmData }

      // Actualizar fecha de última actualización
      updatedAlgorithm.lastUpdated = new Date().toISOString()

      // Actualizar progresiones de ejercicios
      const exerciseProgressions: Record<string, any> = { ...updatedAlgorithm.exerciseProgressions }

      // Obtener el último log
      const lastLog = logs[0]

      // Inicializar preferencias de entrenamiento si no existen
      if (!updatedAlgorithm.preferredTrainingStyle) {
        updatedAlgorithm.preferredTrainingStyle = {
          intensityPreference: 'moderate',
          volumePreference: 'moderate',
          frequencyPreference: 'moderate',
          restPeriodPreference: 'moderate',
          exerciseVarietyPreference: 'moderate'
        }
      }

      // Inicializar patrones de entrenamiento si no existen
      if (!updatedAlgorithm.trainingPatterns) {
        updatedAlgorithm.trainingPatterns = {
          preferredTimeOfDay: 'afternoon',
          averageSessionDuration: 60,
          consistencyScore: 50,
          preferredDaysOfWeek: []
        }
      }

      // Actualizar progresiones basadas en el último entrenamiento
      lastLog.completedSets.forEach(set => {
        const exerciseId = set.alternativeExerciseId || set.exerciseId

        if (!exerciseProgressions[exerciseId]) {
          exerciseProgressions[exerciseId] = {
            lastWeight: 0,
            lastReps: 0,
            bestWeight: 0,
            bestReps: 0,
            history: [],
            preferredIntensity: 'moderate',
            bestPerformanceTime: 'afternoon'
          }
        }

        const progression = exerciseProgressions[exerciseId]

        // Actualizar último peso y repeticiones
        if (set.completedWeight) {
          progression.lastWeight = set.completedWeight
          progression.bestWeight = Math.max(progression.bestWeight || 0, set.completedWeight)
        }

        if (set.completedReps) {
          progression.lastReps = set.completedReps
          progression.bestReps = Math.max(progression.bestReps || 0, set.completedReps)
        }

        // Detectar preferencia de intensidad basada en RIR
        if (set.completedRir !== undefined) {
          // RIR bajo (0-1) indica preferencia por alta intensidad
          if (set.completedRir <= 1) {
            progression.preferredIntensity = 'high'
          }
          // RIR medio (2-3) indica preferencia por intensidad moderada
          else if (set.completedRir <= 3) {
            progression.preferredIntensity = 'moderate'
          }
          // RIR alto (4+) indica preferencia por baja intensidad
          else {
            progression.preferredIntensity = 'low'
          }
        }

        // Añadir a historial
        progression.history = [
          {
            date: lastLog.date,
            weight: set.completedWeight,
            reps: set.completedReps,
            rir: set.completedRir,
            performance: lastLog.performance
          },
          ...(progression.history || []).slice(0, 9) // Mantener solo los últimos 10 registros
        ]

        exerciseProgressions[exerciseId] = progression
      })

      // Actualizar tasas de recuperación basadas en la fatiga reportada
      const muscleGroupRecovery = { ...updatedAlgorithm.muscleGroupRecovery }

      Object.entries(lastLog.muscleGroupFatigue || {}).forEach(([group, fatigue]) => {
        // Ajustar tiempo de recuperación basado en la fatiga
        const currentRecovery = muscleGroupRecovery[group] || 48 // 48 horas por defecto

        // Si la fatiga es alta, aumentar tiempo de recuperación
        if (fatigue > 7) {
          muscleGroupRecovery[group] = Math.min(currentRecovery + 12, 96) // Máximo 96 horas
        }
        // Si la fatiga es baja, reducir tiempo de recuperación
        else if (fatigue < 4) {
          muscleGroupRecovery[group] = Math.max(currentRecovery - 6, 24) // Mínimo 24 horas
        }
      })

      // Analizar patrones de entrenamiento

      // Detectar hora del día preferida
      const logTimes = logs.map(log => {
        const date = new Date(log.date)
        const hour = date.getHours()
        if (hour < 12) return 'morning'
        if (hour < 18) return 'afternoon'
        return 'evening'
      })

      const timeCount = {
        morning: logTimes.filter(t => t === 'morning').length,
        afternoon: logTimes.filter(t => t === 'afternoon').length,
        evening: logTimes.filter(t => t === 'evening').length
      }

      const preferredTime = Object.entries(timeCount)
        .sort((a, b) => b[1] - a[1])[0][0] as 'morning' | 'afternoon' | 'evening'

      updatedAlgorithm.trainingPatterns.preferredTimeOfDay = preferredTime

      // Calcular duración media de sesiones
      const avgDuration = logs.reduce((acc, log) => acc + log.duration, 0) / logs.length
      updatedAlgorithm.trainingPatterns.averageSessionDuration = Math.round(avgDuration)

      // Detectar días de la semana preferidos
      const dayCount: Record<string, number> = {}
      logs.forEach(log => {
        const date = new Date(log.date)
        const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()]
        dayCount[day] = (dayCount[day] || 0) + 1
      })

      const preferredDays = Object.entries(dayCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([day]) => day)

      updatedAlgorithm.trainingPatterns.preferredDaysOfWeek = preferredDays

      // Calcular consistencia
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      const recentLogs = logs.filter(log => new Date(log.date) >= lastMonth)
      const expectedSessions = userProfile.frequency * 4 // 4 semanas
      const consistencyScore = Math.min(100, Math.round((recentLogs.length / expectedSessions) * 100))

      updatedAlgorithm.trainingPatterns.consistencyScore = consistencyScore

      // Detectar preferencias generales de entrenamiento

      // Preferencia de intensidad
      const intensityPreferences = Object.values(exerciseProgressions)
        .map(prog => prog.preferredIntensity)
        .filter(Boolean)

      const intensityCounts = {
        low: intensityPreferences.filter(p => p === 'low').length,
        moderate: intensityPreferences.filter(p => p === 'moderate').length,
        high: intensityPreferences.filter(p => p === 'high').length
      }

      const preferredIntensity = Object.entries(intensityCounts)
        .sort((a, b) => b[1] - a[1])[0][0] as 'low' | 'moderate' | 'high'

      updatedAlgorithm.preferredTrainingStyle.intensityPreference = preferredIntensity

      // Preferencia de volumen (basado en número de series por grupo muscular)
      const avgSetsPerMuscleGroup = logs.reduce((acc, log) => {
        const muscleGroups: Record<string, number> = {}

        log.completedSets.forEach(set => {
          const exercise = availableExercises.find(ex =>
            ex.id === (set.alternativeExerciseId || set.exerciseId)
          )

          if (exercise && exercise.muscleGroup) {
            exercise.muscleGroup.forEach(mg => {
              muscleGroups[mg] = (muscleGroups[mg] || 0) + 1
            })
          }
        })

        const avgSets = Object.values(muscleGroups).reduce((sum, count) => sum + count, 0) /
          Math.max(1, Object.keys(muscleGroups).length)

        return acc + avgSets
      }, 0) / logs.length

      let volumePreference: 'low' | 'moderate' | 'high' = 'moderate'
      if (avgSetsPerMuscleGroup < 8) volumePreference = 'low'
      else if (avgSetsPerMuscleGroup > 12) volumePreference = 'high'

      updatedAlgorithm.preferredTrainingStyle.volumePreference = volumePreference

      // Preferencia de descanso entre series
      const restTimes = logs.flatMap(log =>
        log.completedSets
          .map(set => set.restTime)
          .filter(Boolean) as number[]
      )

      if (restTimes.length > 0) {
        const avgRest = restTimes.reduce((acc, time) => acc + time, 0) / restTimes.length

        let restPreference: 'short' | 'moderate' | 'long' = 'moderate'
        if (avgRest < 60) restPreference = 'short'
        else if (avgRest > 120) restPreference = 'long'

        updatedAlgorithm.preferredTrainingStyle.restPeriodPreference = restPreference
      }

      // Actualizar el algoritmo
      updatedAlgorithm.exerciseProgressions = exerciseProgressions
      updatedAlgorithm.muscleGroupRecovery = muscleGroupRecovery

      // Guardar en Supabase
      const { data, error } = await saveTrainingAlgorithmData(updatedAlgorithm)

      if (error) {
        throw error
      }

      // Actualizar estado local
      setAlgorithmData(updatedAlgorithm)

      toast({
        title: "Algoritmo actualizado",
        description: "El algoritmo de entrenamiento se ha actualizado correctamente",
        variant: "default"
      })
    } catch (error) {
      console.error("Error al actualizar algoritmo:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el algoritmo de entrenamiento",
        variant: "destructive"
      })
    }
  }

  // Obtener recomendaciones
  const recommendations = getRecommendations()

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card3D className={className}>
        <Card3DHeader>
          <Card3DTitle>Recomendaciones inteligentes</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }

  return (
    <Card3D className={className}>
      <Card3DHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Brain className="h-5 w-5 text-primary mr-2" />
            <Card3DTitle>Recomendaciones inteligentes</Card3DTitle>
          </div>

          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button3D variant="ghost" size="icon" onClick={() => setShowInfo(true)}>
                    <Info className="h-4 w-4" />
                  </Button3D>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Información sobre el algoritmo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button3D variant="ghost" size="icon" onClick={updateAlgorithm}>
                    <RefreshCw className="h-4 w-4" />
                  </Button3D>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Actualizar algoritmo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Card3DHeader>

      <Card3DContent>
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`
                  p-2 rounded-full
                  ${rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                    rec.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'}
                `}>
                  {rec.type === 'recovery' ? <Battery className="h-5 w-5" /> :
                   rec.type === 'consistency' ? <Calendar className="h-5 w-5" /> :
                   rec.type === 'progression' ? <TrendingUp className="h-5 w-5" /> :
                   <Clock className="h-5 w-5" />}
                </div>

                <div className="flex-1">
                  <h4 className="font-medium">{rec.title}</h4>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>

                <Badge variant={
                  rec.priority === 'high' ? 'destructive' :
                  rec.priority === 'medium' ? 'default' :
                  'secondary'
                }>
                  {rec.priority === 'high' ? 'Alta' :
                   rec.priority === 'medium' ? 'Media' :
                   'Baja'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay recomendaciones</h3>
            <p className="text-sm text-gray-500">
              Completa más entrenamientos para recibir recomendaciones personalizadas.
            </p>
          </div>
        )}
      </Card3DContent>

      {/* Diálogo de información */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Algoritmo de aprendizaje adaptativo</DialogTitle>
            <DialogDescription>
              El algoritmo analiza tus patrones de entrenamiento para ofrecerte recomendaciones personalizadas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">¿Qué analiza?</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start">
                  <Battery className="h-4 w-4 text-primary mr-2 mt-0.5" />
                  <span>Fatiga acumulada por grupo muscular</span>
                </li>
                <li className="flex items-start">
                  <Calendar className="h-4 w-4 text-primary mr-2 mt-0.5" />
                  <span>Consistencia de entrenamiento</span>
                </li>
                <li className="flex items-start">
                  <TrendingUp className="h-4 w-4 text-primary mr-2 mt-0.5" />
                  <span>Progresión de peso y repeticiones</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-4 w-4 text-primary mr-2 mt-0.5" />
                  <span>Duración de los entrenamientos</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-1">¿Cómo mejora?</h4>
              <p className="text-sm text-gray-600">
                El algoritmo aprende de tus entrenamientos y se adapta a tu progreso.
                Cuantos más entrenamientos registres, más precisas serán las recomendaciones.
              </p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button3D>Entendido</Button3D>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card3D>
  )
}
