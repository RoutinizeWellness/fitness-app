"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Dumbbell,
  Calendar,
  Clock,
  ChevronRight,
  Edit,
  Trash2,
  Play,
  Info,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { WorkoutPlan, WorkoutDay, WorkoutExercise } from "@/lib/workout-plan-generator"
import { supabase } from "@/lib/supabase-client"
import { getActiveWorkoutPlan } from "@/lib/workout-plan-service"

/**
 * Traduce el objetivo a español para mostrar en la UI
 */
function translateGoal(goal: string): string {
  const translations: Record<string, string> = {
    'fat_loss': 'Pérdida de Grasa',
    'muscle_gain': 'Ganancia Muscular',
    'strength': 'Fuerza',
    'endurance': 'Resistencia',
    'general_fitness': 'Fitness General',
    'athletic_performance': 'Rendimiento Atlético',
    'mobility': 'Movilidad',
    'toning': 'Tonificación'
  }

  return translations[goal] || 'Fitness General'
}

interface WorkoutPlanDisplayProps {
  userId: string
  onGenerateNewPlan?: () => void
}

export default function WorkoutPlanDisplay({ userId, onGenerateNewPlan }: WorkoutPlanDisplayProps) {
  const { toast } = useToast()
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeDay, setActiveDay] = useState<string | null>(null)

  // Cargar el plan activo
  useEffect(() => {
    const loadActivePlan = async () => {
      if (!userId) return

      setIsLoading(true)

      try {
        console.log('Cargando plan activo para el usuario:', userId)
        const plan = await getActiveWorkoutPlan(userId)

        if (plan) {
          console.log('Plan activo cargado correctamente:', plan)
          setActivePlan(plan)

          // Establecer el primer día como activo por defecto
          if (plan.days && plan.days.length > 0) {
            setActiveDay(plan.days[0].id)
          }
        } else {
          console.log('No se encontró un plan activo')
          setActivePlan(null)

          // Intentar cargar cualquier plan como respaldo
          try {
            const { data, error } = await supabase
              .from('workout_routines')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(1)

            if (!error && data && data.length > 0) {
              console.log('Se encontró un plan no activo, activándolo:', data[0])

              // Activar este plan
              const { error: activateError } = await supabase
                .from('workout_routines')
                .update({ is_active: true })
                .eq('id', data[0].id)

              if (!activateError) {
                // Cargar el plan activado
                const activatedPlan = {
                  id: data[0].id,
                  userId: data[0].user_id,
                  name: data[0].name,
                  description: data[0].description,
                  level: data[0].level,
                  goal: data[0].goal,
                  duration: data[0].duration,
                  daysPerWeek: data[0].days_per_week,
                  createdAt: data[0].created_at,
                  isActive: true,
                  days: data[0].days || []
                }

                setActivePlan(activatedPlan)

                // Establecer el primer día como activo por defecto
                if (data[0].days && data[0].days.length > 0) {
                  setActiveDay(data[0].days[0].id)
                }

                toast({
                  title: "Plan activado",
                  description: "Se ha activado automáticamente un plan de entrenamiento.",
                })
              }
            }
          } catch (backupError) {
            console.error('Error al intentar cargar un plan de respaldo:', backupError)
          }
        }
      } catch (error) {
        console.error('Error al cargar el plan de entrenamiento:', error)
        setActivePlan(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadActivePlan()
  }, [userId, toast])

  // Manejar la generación de un nuevo plan
  const handleGenerateNewPlan = () => {
    if (onGenerateNewPlan) {
      onGenerateNewPlan()
    } else {
      toast({
        title: "Función no disponible",
        description: "La generación de nuevos planes no está disponible en este momento.",
        variant: "destructive"
      })
    }
  }

  // Manejar el inicio de un entrenamiento
  const handleStartWorkout = (dayId: string) => {
    // Navegar a la página de entrenamiento con el día seleccionado
    window.location.href = `/training/workout/${dayId}`
  }

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }

  // Renderizar mensaje si no hay plan activo
  if (!activePlan) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Dumbbell className="h-5 w-5 mr-2 text-primary" />
            Plan de Entrenamiento
          </CardTitle>
          <CardDescription>
            No tienes un plan de entrenamiento activo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Info className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">Sin Plan Activo</h3>
          <p className="text-center text-gray-500 mb-4">
            Para comenzar, genera un plan personalizado basado en tus objetivos y preferencias.
          </p>
          <Button onClick={handleGenerateNewPlan}>
            Generar Plan Personalizado
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Encontrar el día activo
  const currentDay = activePlan.days.find(day => day.id === activeDay) || activePlan.days[0]

  return (
    <Card className="w-full bg-white rounded-3xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center text-[#573353] text-xl">
              <Dumbbell className="h-6 w-6 mr-2 text-[#FDA758]" />
              {activePlan.name}
            </CardTitle>
            <CardDescription className="text-[#573353]/70 mt-1">
              {activePlan.description}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              title="Editar plan"
              className="rounded-full hover:bg-[#FDA758]/10 border-[#FDA758]/20"
              onClick={() => window.location.href = `/training/edit-routine/${activePlan.id}`}
            >
              <Edit className="h-4 w-4 text-[#FDA758]" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Generar nuevo plan"
              onClick={handleGenerateNewPlan}
              className="rounded-full hover:bg-[#FDA758]/10 border-[#FDA758]/20"
            >
              <RotateCcw className="h-4 w-4 text-[#FDA758]" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="capitalize bg-[#FFF3E0] text-[#FDA758] border-[#FDA758]/20 rounded-full px-3">
            {activePlan.level}
          </Badge>
          <Badge variant="outline" className="bg-[#E8F5E9] text-[#5DE292] border-[#5DE292]/20 rounded-full px-3">
            {activePlan.daysPerWeek} días/semana
          </Badge>
          <Badge variant="outline" className="bg-[#E3F2FD] text-[#8C80F8] border-[#8C80F8]/20 rounded-full px-3">
            {activePlan.duration} semanas
          </Badge>
          <Badge variant="secondary" className="bg-[#FDA758] text-white rounded-full px-3">
            {translateGoal(activePlan.goal)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue={currentDay?.id} onValueChange={setActiveDay} className="w-full">
          <TabsList className="grid grid-cols-7 mb-4">
            {activePlan.days.map((day, index) => (
              <TabsTrigger key={day.id} value={day.id} disabled={day.restDay}>
                {`Día ${index + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>

          {activePlan.days.map(day => (
            <TabsContent key={day.id} value={day.id} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{day.name}</h3>
                {!day.restDay && (
                  <Button onClick={() => handleStartWorkout(day.id)}>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Entrenamiento
                  </Button>
                )}
              </div>

              <p className="text-gray-500">{day.description}</p>

              {day.restDay ? (
                <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-md">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Día de Descanso</h3>
                  <p className="text-center text-gray-500">
                    Hoy es un día de descanso. Aprovecha para recuperarte y prepararte para tu próximo entrenamiento.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {day.targetMuscleGroups.map(muscle => (
                      <Badge key={muscle} variant="secondary">
                        {muscle}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {day.exercises.map((exercise, index) => {
                      // Determinar el color según el grupo muscular
                      let color = "#FDA758"; // Color por defecto (naranja)
                      if (exercise.muscleGroup === "Pecho") color = "#FDA758";
                      else if (exercise.muscleGroup === "Espalda") color = "#5DE292";
                      else if (exercise.muscleGroup === "Piernas") color = "#8C80F8";
                      else if (exercise.muscleGroup === "Hombros") color = "#FF7285";
                      else if (exercise.muscleGroup === "Brazos") color = "#5CC2FF";
                      else if (exercise.muscleGroup === "Core") color = "#F7B955";

                      return (
                        <div
                          key={exercise.id}
                          className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white"
                                style={{ backgroundColor: color }}
                              >
                                <Dumbbell className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium text-[#573353]">{exercise.name}</h4>
                                <p className="text-sm text-[#573353]/70">{exercise.muscleGroup}</p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-[#FFF3E0] text-[#FDA758] border-[#FDA758]/20 rounded-full px-3"
                            >
                              {exercise.sets} x {exercise.repsMin}-{exercise.repsMax}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-[#573353]/50" />
                              <span className="text-[#573353]/70">{exercise.rest}s descanso</span>
                            </div>
                            {exercise.weight > 0 && (
                              <div className="flex items-center">
                                <Dumbbell className="h-4 w-4 mr-1 text-[#573353]/50" />
                                <span className="text-[#573353]/70">{exercise.weight}kg</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1 text-[#573353]/50" />
                              <span className="text-[#573353]/70">RIR: {exercise.rir}</span>
                            </div>
                          </div>

                          {exercise.notes && (
                            <p className="text-sm text-[#573353]/70 mt-3 bg-[#F9F9F9] p-2 rounded-lg">{exercise.notes}</p>
                          )}

                          {exercise.superset && (
                            <div className="mt-3 p-3 bg-[#F9F9F9] rounded-lg border-l-2" style={{ borderColor: color }}>
                              <p className="text-sm font-medium text-[#573353]">Superset con:</p>
                              <p className="text-sm text-[#573353]/70">
                                {day.exercises.find(e => e.id === exercise.supersetWith)?.name || 'Ejercicio no encontrado'}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {day.notes && (
                    <div className="p-4 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium">Notas:</p>
                      <p className="text-sm text-gray-600">{day.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          Volver
        </Button>
        <Button variant="outline" onClick={() => window.location.href = "/training/history"}>
          Ver Historial
        </Button>
      </CardFooter>
    </Card>
  )
}
