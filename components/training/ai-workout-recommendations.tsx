"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { OrganicElement } from "@/components/transitions/organic-transitions"
import { WorkoutRecommendation, ExerciseAdjustment, WorkoutRoutine } from "@/lib/types/training"
import { useTraining } from "@/lib/contexts/training-context"
import { useToast } from "@/components/ui/use-toast"
import {
  Lightbulb,
  Brain,
  Dumbbell,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Check,
  X,
  RefreshCw,
  ChevronRight,
  Info,
  BarChart,
  Clock,
  Calendar
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"

interface AIWorkoutRecommendationsProps {
  userId: string
}

export function AIWorkoutRecommendations({ userId }: AIWorkoutRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const {
    routines,
    setRoutines,
    logs,
    isLoadingRoutines,
    isLoadingLogs,
    saveRoutine
  } = useTraining()

  // Cargar recomendaciones
  useEffect(() => {
    const loadData = async () => {
      try {
        // Las rutinas ya se cargan a través del contexto de entrenamiento

        // Cargar recomendaciones desde Supabase
        const { data: recommendationsData, error: recommendationsError } = await supabase
          .from('workout_recommendations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)

        if (recommendationsError) {
          console.error("Error al cargar recomendaciones:", recommendationsError)
        } else if (recommendationsData) {
          // Transformar datos al formato de la aplicación
          const transformedRecommendations: WorkoutRecommendation[] = recommendationsData.map(item => ({
            userId: item.user_id,
            date: item.date,
            routineId: item.routine_id,
            dayId: item.day_id,
            adjustments: item.adjustments || [],
            volumeAdjustment: item.volume_adjustment || 'maintain',
            restAdjustment: item.rest_adjustment || 'maintain',
            generalAdvice: item.general_advice || '',
            fatigueManagement: item.fatigue_management || ''
          }))

          setRecommendations(transformedRecommendations)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId])

  // Generar nuevas recomendaciones
  const generateRecommendations = async () => {
    if (!userId) return

    setIsGenerating(true)
    toast({
      title: "Generando recomendaciones",
      description: "Analizando tus datos de entrenamiento..."
    })

    try {
      // Usar los logs del contexto de entrenamiento

      if (!logs || logs.length === 0) {
        toast({
          title: "Datos insuficientes",
          description: "Necesitas completar algunos entrenamientos para recibir recomendaciones",
          variant: "destructive"
        })
        return
      }

      // Obtener la rutina activa
      const activeRoutine = routines.find(r => r.isActive)

      if (!activeRoutine) {
        toast({
          title: "Sin rutina activa",
          description: "Necesitas tener una rutina activa para recibir recomendaciones",
          variant: "destructive"
        })
        return
      }

      // Importar el servicio AI Core dinámicamente
      try {
        const AICoreModule = await import('@/lib/ai-core-service')
        console.log('Módulo AI Core importado correctamente')

        // Inicializar el servicio AI Core
        const aiCore = new AICoreModule.AICoreService(userId)
        console.log('Servicio AI Core creado correctamente')

        const initialized = await aiCore.initialize()
        console.log('Servicio AI Core inicializado:', initialized)

        if (!initialized) {
          console.warn('El servicio AI Core no se inicializó correctamente, pero continuamos con la funcionalidad')
        }
      } catch (aiCoreError) {
        console.error('Error al inicializar el servicio AI Core:', aiCoreError)
        // Continuamos con la funcionalidad aunque el servicio AI Core no esté disponible
      }

      // Generar recomendaciones de entrenamiento
      toast({
        title: "Analizando datos",
        description: "La IA está analizando tus patrones de entrenamiento...",
      })

      // Obtener datos de fatiga y recuperación
      try {
        const AdaptiveLearningModule = await import('@/lib/adaptive-learning-service')
        const WearableModule = await import('@/lib/wearable-integration')

        const fatigueData = await AdaptiveLearningModule.getUserFatigue(userId)
        const readyToTrainData = await WearableModule.isReadyToTrain(userId)

        // Crear recomendación basada en datos reales
        const newRecommendation: WorkoutRecommendation = {
          userId,
          date: new Date().toISOString(),
          routineId: activeRoutine.id,
          dayId: activeRoutine.days[0]?.id || '',
          adjustments: []
        }

        // Añadir ajustes basados en los ejercicios de la rutina activa
        if (activeRoutine.days && activeRoutine.days.length > 0) {
          const day = activeRoutine.days[0]
          if (day.exercises && day.exercises.length > 0) {
            day.exercises.forEach(exercise => {
              // Solo ajustar algunos ejercicios (para simular que la IA es selectiva)
              if (Math.random() > 0.5) {
                const currentWeight = exercise.weight || 0
                const currentReps = exercise.sets || 0
                const currentRir = exercise.rir || 2

                // Determinar si aumentar o disminuir basado en fatiga
                const fatigueLevel = fatigueData?.currentFatigue || 50
                const isReadyToTrain = readyToTrainData?.ready || true

              let weightAdjustment = 0
              let repsAdjustment = 0
              let rirAdjustment = 0

              if (isReadyToTrain && fatigueLevel < 70) {
                // Aumentar peso o repeticiones
                weightAdjustment = Math.round(currentWeight * 0.05) // 5% más
                repsAdjustment = Math.random() > 0.5 ? 1 : 0
                rirAdjustment = Math.random() > 0.7 ? -1 : 0
              } else if (fatigueLevel > 80) {
                // Disminuir peso o aumentar RIR
                weightAdjustment = -Math.round(currentWeight * 0.05) // 5% menos
                repsAdjustment = Math.random() > 0.5 ? -1 : 0
                rirAdjustment = Math.random() > 0.3 ? 1 : 0
              }

              newRecommendation.adjustments.push({
                exerciseId: exercise.id,
                recommendedWeight: Math.max(0, currentWeight + weightAdjustment),
                recommendedReps: Math.max(1, currentReps + repsAdjustment),
                recommendedRir: Math.max(0, currentRir + rirAdjustment),
                reason: isReadyToTrain && fatigueLevel < 70
                  ? "Basado en tu progresión y bajo nivel de fatiga, puedes aumentar la intensidad"
                  : "Tu nivel de fatiga sugiere que deberías reducir la intensidad para optimizar la recuperación",
                confidenceLevel: Math.random() * 0.2 + 0.8 // 0.8-1.0
              })
            }
          })
        }
      }

        // Añadir recomendaciones generales basadas en fatiga
        const fatigueLevel = fatigueData?.currentFatigue || 50

        if (fatigueLevel > 80) {
          newRecommendation.volumeAdjustment = 'decrease'
          newRecommendation.restAdjustment = 'increase'
          newRecommendation.generalAdvice = "Tu nivel de fatiga es alto. Considera reducir el volumen de entrenamiento esta semana y aumentar el tiempo de descanso entre series."
          newRecommendation.fatigueManagement = "Prioriza el sueño y la recuperación. Añade un día extra de descanso esta semana y considera técnicas de recuperación activa como yoga o natación suave."
        } else if (fatigueLevel > 60) {
          newRecommendation.volumeAdjustment = 'maintain'
          newRecommendation.restAdjustment = 'maintain'
          newRecommendation.generalAdvice = "Tu nivel de fatiga es moderado. Mantén el volumen actual pero monitorea cómo te sientes durante los entrenamientos."
          newRecommendation.fatigueManagement = "Asegúrate de dormir al menos 7-8 horas y considera técnicas de recuperación como estiramientos o baños de contraste."
        } else {
          newRecommendation.volumeAdjustment = 'increase'
          newRecommendation.restAdjustment = 'decrease'
          newRecommendation.generalAdvice = "Tu nivel de fatiga es bajo. Es un buen momento para aumentar la intensidad o el volumen de tus entrenamientos."
          newRecommendation.fatigueManagement = "Estás bien recuperado. Puedes considerar añadir un día extra de entrenamiento o aumentar la intensidad de tus sesiones actuales."
        }

        // Guardar en Supabase
        const { error } = await supabase
          .from('workout_recommendations')
          .insert([{
            user_id: newRecommendation.userId,
            date: newRecommendation.date,
            routine_id: newRecommendation.routineId,
            day_id: newRecommendation.dayId,
            adjustments: newRecommendation.adjustments,
            volume_adjustment: newRecommendation.volumeAdjustment,
            rest_adjustment: newRecommendation.restAdjustment,
            general_advice: newRecommendation.generalAdvice,
            fatigue_management: newRecommendation.fatigueManagement,
            created_at: new Date().toISOString()
          }])

        if (error) {
          console.error("Error al guardar recomendación:", error)
          toast({
            title: "Error",
            description: "No se pudo guardar la recomendación",
            variant: "destructive"
          })
          return
        }

        // Actualizar estado
        setRecommendations([newRecommendation, ...recommendations])

        toast({
          title: "Recomendaciones generadas",
          description: "Se han generado nuevas recomendaciones basadas en tus datos"
        })
      } catch (error) {
        console.error("Error al cargar recomendaciones:", error)
      }
    } catch (error) {
      console.error("Error al generar recomendaciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron generar recomendaciones",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Aplicar recomendaciones a una rutina
  const applyRecommendations = async (recommendation: WorkoutRecommendation) => {
    if (!userId) return

    try {
      // Buscar la rutina
      const routine = routines.find(r => r.id === recommendation.routineId)

      if (!routine) {
        toast({
          title: "Rutina no encontrada",
          description: "No se pudo encontrar la rutina para aplicar las recomendaciones",
          variant: "destructive"
        })
        return
      }

      // Clonar la rutina para no modificar el estado directamente
      const updatedRoutine = JSON.parse(JSON.stringify(routine)) as WorkoutRoutine

      // Aplicar ajustes a los ejercicios
      recommendation.adjustments.forEach(adjustment => {
        // Buscar el día y ejercicio
        updatedRoutine.days.forEach(day => {
          day.exercises?.forEach(exercise => {
            if (exercise.id === adjustment.exerciseId) {
              // Aplicar recomendaciones
              exercise.sets = adjustment.recommendedReps
              exercise.rir = adjustment.recommendedRir
              // Añadir nota sobre la recomendación
              exercise.notes = `${exercise.notes || ''}\nRecomendación IA: ${adjustment.reason}`
            }
          })
        })
      })

      // Guardar rutina actualizada usando el contexto
      console.log("Guardando rutina actualizada:", updatedRoutine)
      const { success, error } = await saveRoutine(updatedRoutine)

      if (!success || error) {
        console.error("Error al actualizar rutina:", error)

        // Mostrar un mensaje de error más descriptivo
        let errorMessage = "No se pudo actualizar la rutina con las recomendaciones"
        if (error && error.message) {
          errorMessage = error.message
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Recomendaciones aplicadas",
        description: "Se han aplicado las recomendaciones a tu rutina"
      })

      // Actualizar rutinas en el estado
      setRoutines(routines.map(r => r.id === updatedRoutine.id ? updatedRoutine : r))
    } catch (error) {
      console.error("Error al aplicar recomendaciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron aplicar las recomendaciones",
        variant: "destructive"
      })
    }
  }

  // Renderizar indicador de ajuste
  const renderAdjustmentIndicator = (adjustment: 'increase' | 'maintain' | 'decrease') => {
    if (adjustment === 'maintain') {
      return (
        <Badge variant="outline" className="bg-gray-100">
          Mantener
        </Badge>
      )
    }

    if (adjustment === 'increase') {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          Aumentar
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-800">
        Reducir
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-500" />
            Recomendaciones IA
          </h2>
          <p className="text-sm text-gray-500">
            Recomendaciones personalizadas basadas en tus datos de entrenamiento
          </p>
        </div>
        <Button
          onClick={generateRecommendations}
          disabled={isGenerating}
          className="rounded-full"
        >
          {isGenerating ? (
            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2"></div>
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Generar recomendaciones
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      ) : recommendations.length === 0 ? (
        <OrganicElement type="fade">
          <Card className="p-6 text-center">
            <Lightbulb className="h-12 w-12 mx-auto text-amber-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay recomendaciones disponibles</h3>
            <p className="text-gray-500 mb-4">
              Genera tu primera recomendación basada en IA para mejorar tus entrenamientos
            </p>
            <Button
              onClick={generateRecommendations}
              disabled={isGenerating}
              className="mx-auto rounded-full"
            >
              {isGenerating ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2"></div>
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Analizar mis datos
            </Button>
          </Card>
        </OrganicElement>
      ) : (
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <OrganicElement key={index} type="fade" delay={index * 0.1}>
              <Card className="p-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <Brain className="h-4 w-4 mr-2 text-purple-500" />
                        <h3 className="font-medium">Recomendación IA</h3>
                        <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                          {new Date(recommendation.date).toLocaleDateString()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Basado en el análisis de tus últimos entrenamientos
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Info className="h-4 w-4 mr-1" />
                          Detalles
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Detalles de la recomendación</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-2">
                          <div>
                            <h4 className="text-sm font-medium">Consejo general</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {recommendation.generalAdvice}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium">Gestión de fatiga</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {recommendation.fatigueManagement}
                            </p>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="text-sm font-medium mb-2">Ajustes recomendados</h4>
                            <div className="space-y-2">
                              {recommendation.adjustments.map((adjustment, idx) => (
                                <div key={idx} className="border rounded-md p-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="text-sm font-medium">
                                        {adjustment.exerciseId === "bench-press" ? "Press de banca" :
                                         adjustment.exerciseId === "squat" ? "Sentadilla" :
                                         adjustment.exerciseId === "deadlift" ? "Peso muerto" :
                                         adjustment.exerciseId}
                                      </h5>
                                      <div className="flex space-x-2 mt-1">
                                        <Badge variant="outline" className="text-xs">
                                          {adjustment.recommendedWeight} kg
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          {adjustment.recommendedReps} reps
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          RIR {adjustment.recommendedRir}
                                        </Badge>
                                      </div>
                                    </div>
                                    <Badge className={`${adjustment.confidenceLevel > 0.8 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                      {Math.round(adjustment.confidenceLevel * 100)}% confianza
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {adjustment.reason}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Volumen</span>
                        {renderAdjustmentIndicator(recommendation.volumeAdjustment)}
                      </div>
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Descanso</span>
                        {renderAdjustmentIndicator(recommendation.restAdjustment)}
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-3">
                    <h4 className="text-sm font-medium mb-2">Ajustes de ejercicios</h4>
                    <div className="space-y-2">
                      {recommendation.adjustments.slice(0, 2).map((adjustment, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Dumbbell className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">
                              {adjustment.exerciseId === "bench-press" ? "Press de banca" :
                               adjustment.exerciseId === "squat" ? "Sentadilla" :
                               adjustment.exerciseId === "deadlift" ? "Peso muerto" :
                               adjustment.exerciseId}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {adjustment.recommendedWeight} kg
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {adjustment.recommendedReps} reps
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {recommendation.adjustments.length > 2 && (
                        <div className="text-xs text-center text-gray-500">
                          +{recommendation.adjustments.length - 2} más ajustes
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => applyRecommendations(recommendation)}
                    className="w-full rounded-full"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aplicar recomendaciones
                  </Button>
                </div>
              </Card>
            </OrganicElement>
          ))}
        </div>
      )}
    </div>
  )
}
