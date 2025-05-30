"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Calendar,
  Clock,
  ChevronRight,
  Play,
  CheckCircle,
  Info,
  Award,
  Dumbbell,
  ArrowRight,
  CalendarDays
} from "lucide-react"

// Tipos para el plan de entrenamiento
interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  level: string;
  goal: string;
  duration_weeks: number;
  frequency_per_week: number;
  is_active: boolean;
  created_at: string;
  days: WorkoutDay[];
}

interface WorkoutDay {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  day_number: number;
  is_rest_day: boolean;
}

interface WorkoutExercise {
  id: string;
  exercise_id: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
  order: number;
  exercise_details?: {
    image_url: string;
    video_url?: string;
    instructions: string[];
    primary_muscle_group: string;
  };
}

export function AmateurZeroWorkoutPlan() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([])
  const [currentWeek, setCurrentWeek] = useState(1)

  // Cargar plan de entrenamiento para principiantes absolutos
  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Obtener el plan activo para el usuario
        const { data: planData, error: planError } = await supabase
          .from('workout_plans')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .eq('level', 'amateur_zero')
          .single()

        if (planError) throw planError

        if (!planData) {
          // Si no hay plan activo, crear uno predeterminado
          await createDefaultPlan()
          return
        }

        // Obtener los días del plan
        const { data: daysData, error: daysError } = await supabase
          .from('workout_days')
          .select('*')
          .eq('plan_id', planData.id)
          .order('day_number')

        if (daysError) throw daysError

        // Para cada día, obtener los ejercicios
        const daysWithExercises = await Promise.all(daysData.map(async (day) => {
          const { data: exercisesData, error: exercisesError } = await supabase
            .from('workout_exercises')
            .select('*, exercise:exercise_id(image_url, video_url, instructions, primary_muscle_group)')
            .eq('day_id', day.id)
            .order('order')

          if (exercisesError) throw exercisesError

          // Formatear los ejercicios
          const formattedExercises = exercisesData.map(ex => ({
            id: ex.id,
            exercise_id: ex.exercise_id,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            rest_seconds: ex.rest_seconds,
            notes: ex.notes,
            order: ex.order,
            exercise_details: ex.exercise
          }))

          return {
            ...day,
            exercises: formattedExercises
          }
        }))

        // Obtener entrenamientos completados
        const { data: completedData, error: completedError } = await supabase
          .from('workout_sessions')
          .select('day_id')
          .eq('user_id', user.id)
          .eq('plan_id', planData.id)
          .eq('completed', true)

        if (completedError) throw completedError

        // Establecer el plan completo
        setWorkoutPlan({
          ...planData,
          days: daysWithExercises
        })

        // Establecer el día seleccionado (primer día no completado)
        const completedDayIds = completedData.map(session => session.day_id)
        setCompletedWorkouts(completedDayIds)

        const firstIncompleteDay = daysWithExercises.find(day =>
          !day.is_rest_day && !completedDayIds.includes(day.id)
        )

        setSelectedDay(firstIncompleteDay || daysWithExercises[0])

        // Calcular la semana actual basada en entrenamientos completados
        const nonRestDays = daysWithExercises.filter(day => !day.is_rest_day)
        const completedWorkoutsCount = completedDayIds.length
        const weekProgress = Math.min(
          Math.ceil(completedWorkoutsCount / (planData.frequency_per_week || 3)),
          planData.duration_weeks
        )
        setCurrentWeek(weekProgress || 1)

      } catch (error) {
        console.error("Error al cargar plan de entrenamiento:", error)
        toast({
          title: "Error",
          description: "No pudimos cargar tu plan de entrenamiento. Por favor, intenta de nuevo.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkoutPlan()
  }, [user, toast])

  // Crear un plan predeterminado para principiantes absolutos
  const createDefaultPlan = async () => {
    if (!user) return

    try {
      // Crear el plan
      const { data: planData, error: planError } = await supabase
        .from('workout_plans')
        .insert({
          user_id: user.id,
          name: "Tu Primer Plan de Entrenamiento",
          description: "Un plan diseñado especialmente para comenzar tu viaje fitness desde cero.",
          level: "amateur_zero",
          goal: "introduction",
          duration_weeks: 4,
          frequency_per_week: 3,
          is_active: true,
          is_template: false
        })
        .select()
        .single()

      if (planError) throw planError

      // Obtener ejercicios para principiantes
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .eq('difficulty_level', 'amateur_zero')
        .limit(10)

      if (exercisesError) throw exercisesError

      if (!exercisesData || exercisesData.length < 6) {
        throw new Error("No hay suficientes ejercicios para crear un plan")
      }

      // Crear días de entrenamiento
      const days = [
        {
          name: "Día 1 - Cuerpo Completo",
          description: "Introducción a movimientos básicos",
          day_number: 1,
          is_rest_day: false
        },
        {
          name: "Descanso",
          day_number: 2,
          is_rest_day: true
        },
        {
          name: "Día 2 - Cuerpo Completo",
          description: "Enfoque en técnica y control",
          day_number: 3,
          is_rest_day: false
        },
        {
          name: "Descanso",
          day_number: 4,
          is_rest_day: true
        },
        {
          name: "Día 3 - Cuerpo Completo",
          description: "Consolidación de movimientos",
          day_number: 5,
          is_rest_day: false
        },
        {
          name: "Descanso",
          day_number: 6,
          is_rest_day: true
        },
        {
          name: "Descanso",
          day_number: 7,
          is_rest_day: true
        }
      ]

      // Insertar días
      for (const day of days) {
        const { data: dayData, error: dayError } = await supabase
          .from('workout_days')
          .insert({
            ...day,
            plan_id: planData.id
          })
          .select()
          .single()

        if (dayError) throw dayError

        // Si no es día de descanso, añadir ejercicios
        if (!day.is_rest_day) {
          // Seleccionar ejercicios para este día (diferentes para cada día)
          const dayIndex = Math.floor(day.day_number / 2)
          const startIndex = dayIndex * 2
          const dayExercises = exercisesData.slice(startIndex, startIndex + 4)

          // Insertar ejercicios para este día
          for (let i = 0; i < dayExercises.length; i++) {
            const exercise = dayExercises[i]
            await supabase
              .from('workout_exercises')
              .insert({
                day_id: dayData.id,
                exercise_id: exercise.id,
                name: exercise.name,
                sets: 2, // Principiantes comienzan con pocas series
                reps: "8-10",
                rest_seconds: 90,
                order: i + 1
              })
          }
        }
      }

      // Recargar la página para mostrar el nuevo plan
      window.location.reload()

    } catch (error) {
      console.error("Error al crear plan predeterminado:", error)
      toast({
        title: "Error",
        description: "No pudimos crear un plan de entrenamiento. Por favor, contacta a soporte.",
        variant: "destructive"
      })
    }
  }

  // Iniciar entrenamiento
  const handleStartWorkout = () => {
    if (!selectedDay || !workoutPlan) return

    router.push(`/training/workout/${workoutPlan.id}/${selectedDay.id}`)
  }

  // Seleccionar un día
  const handleSelectDay = (day: WorkoutDay) => {
    setSelectedDay(day)
  }

  // Calcular progreso del plan
  const calculateProgress = () => {
    if (!workoutPlan || !workoutPlan.days) return 0

    const totalWorkoutDays = workoutPlan.days.filter(day => !day.is_rest_day).length
    const completedCount = completedWorkouts.length

    return Math.round((completedCount / totalWorkoutDays) * 100)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!workoutPlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan de Entrenamiento</CardTitle>
          <CardDescription>
            No tienes un plan de entrenamiento activo
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏋️‍♂️</div>
            <h3 className="text-lg font-medium mb-2">¡Comencemos tu viaje fitness!</h3>
            <p className="text-muted-foreground mb-6">
              Vamos a crear un plan personalizado para ti como principiante
            </p>
            <Button onClick={createDefaultPlan}>
              Crear Mi Primer Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <Dumbbell className="h-5 w-5 mr-2 text-primary" />
            {workoutPlan.name}
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            Semana {currentWeek} de {workoutPlan.duration_weeks}
          </Badge>
        </div>
        <CardDescription>{workoutPlan.description}</CardDescription>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span>Progreso del plan</span>
            <span>{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="plan" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="plan" className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span>Plan Semanal</span>
            </TabsTrigger>
            <TabsTrigger value="today" className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              <span>Entrenamiento de Hoy</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="space-y-4">
            <div className="grid gap-2">
              {workoutPlan.days.map((day) => (
                <div
                  key={day.id}
                  className={`border rounded-md p-3 cursor-pointer transition-colors ${
                    selectedDay?.id === day.id ? 'bg-accent border-primary' : ''
                  } ${
                    completedWorkouts.includes(day.id) ? 'bg-green-50 border-green-200' : ''
                  }`}
                  onClick={() => handleSelectDay(day)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {completedWorkouts.includes(day.id) ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : day.is_rest_day ? (
                        <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                      ) : (
                        <Dumbbell className="h-5 w-5 text-primary mr-2" />
                      )}
                      <span className="font-medium">{day.name}</span>
                    </div>
                    {!day.is_rest_day && (
                      <Badge variant="outline">
                        {day.exercises.length} ejercicios
                      </Badge>
                    )}
                  </div>
                  {day.description && (
                    <p className="text-sm text-muted-foreground mt-1 ml-7">
                      {day.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-md p-4 text-sm">
              <div className="flex">
                <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800">Consejo para principiantes</p>
                  <p className="text-blue-700 mt-1">
                    Comienza con 2-3 días de entrenamiento por semana, permitiendo al menos un día de descanso entre sesiones.
                    La consistencia es más importante que la intensidad al principio.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="today" className="space-y-4">
            {selectedDay?.is_rest_day ? (
              <div className="text-center py-6 space-y-4">
                <div className="bg-blue-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium">Día de Descanso</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  El descanso es parte esencial del progreso. Aprovecha para recuperarte,
                  mantenerte hidratado y prepararte para tu próximo entrenamiento.
                </p>
                <div className="bg-blue-50 rounded-md p-4 text-sm text-left max-w-md mx-auto">
                  <p className="font-medium text-blue-800">Actividades recomendadas:</p>
                  <ul className="list-disc list-inside text-blue-700 mt-1 space-y-1">
                    <li>Caminar 15-20 minutos a ritmo suave</li>
                    <li>Estiramientos básicos (5-10 minutos)</li>
                    <li>Hidratación extra (2-3 litros de agua)</li>
                    <li>Asegurar 7-8 horas de sueño</li>
                  </ul>
                </div>
              </div>
            ) : selectedDay ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{selectedDay.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>~30-45 min</span>
                  </div>
                </div>

                {selectedDay.description && (
                  <p className="text-sm text-muted-foreground">{selectedDay.description}</p>
                )}

                <div className="space-y-3">
                  {selectedDay.exercises.map((exercise, index) => (
                    <div key={exercise.id} className="border rounded-md overflow-hidden">
                      <div className="flex items-start">
                        <div className="relative h-16 w-16 flex-shrink-0">
                          <Image
                            src={exercise.exercise_details?.image_url || "/images/exercise-placeholder.jpg"}
                            alt={exercise.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-3 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{exercise.name}</h4>
                            <Badge variant="outline">
                              {exercise.exercise_details?.primary_muscle_group}
                            </Badge>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            <span>{exercise.sets} series</span>
                            <ArrowRight className="h-3 w-3 mx-1" />
                            <span>{exercise.reps} repeticiones</span>
                            <ArrowRight className="h-3 w-3 mx-1" />
                            <span>{exercise.rest_seconds}s descanso</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 rounded-md p-4 text-sm">
                  <div className="flex">
                    <Award className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-800">Objetivo de hoy</p>
                      <p className="text-blue-700 mt-1">
                        Enfócate en aprender la técnica correcta de cada ejercicio.
                        La calidad del movimiento es más importante que el peso o las repeticiones.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleStartWorkout}
                  disabled={completedWorkouts.includes(selectedDay.id)}
                >
                  {completedWorkouts.includes(selectedDay.id) ? (
                    "Entrenamiento Completado"
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Comenzar Entrenamiento
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p>Selecciona un día para ver los detalles</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/training/exercises/amateur-zero')}>
          Ver Biblioteca de Ejercicios
        </Button>
        <Button variant="outline" onClick={() => router.push('/training/progress')}>
          <ChevronRight className="h-4 w-4" />
          Ver Progreso
        </Button>
      </CardFooter>
    </Card>
  )
}
