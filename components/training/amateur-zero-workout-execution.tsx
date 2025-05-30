"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  CheckCircle,
  Clock,
  Info,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react"

// Tipos para el entrenamiento
interface WorkoutExecution {
  planId: string;
  dayId: string;
  exercises: WorkoutExercise[];
  dayName: string;
  dayDescription?: string;
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
    common_errors?: {
      error: string;
      correction: string;
    }[];
    primary_muscle_group: string;
  };
}

interface ExerciseProgress {
  exerciseId: string;
  completedSets: number;
  totalSets: number;
}

export function AmateurZeroWorkoutExecution({ planId, dayId }: { planId: string, dayId: string }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [workout, setWorkout] = useState<WorkoutExecution | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [isResting, setIsResting] = useState(false)
  const [restTimeRemaining, setRestTimeRemaining] = useState(0)
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([])
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)
  const [workoutCompleted, setWorkoutCompleted] = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Cargar datos del entrenamiento
  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!user || !planId || !dayId) return

      setIsLoading(true)
      try {
        // Obtener información del día de entrenamiento
        const { data: dayData, error: dayError } = await supabase
          .from('workout_days')
          .select('*')
          .eq('id', dayId)
          .single()

        if (dayError) throw dayError

        // Obtener ejercicios para este día
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('workout_exercises')
          .select('*, exercise:exercise_id(image_url, video_url, instructions, common_errors, primary_muscle_group)')
          .eq('day_id', dayId)
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

        // Configurar el entrenamiento
        setWorkout({
          planId,
          dayId,
          exercises: formattedExercises,
          dayName: dayData.name,
          dayDescription: dayData.description
        })

        // Inicializar progreso de ejercicios
        const initialProgress = formattedExercises.map(ex => ({
          exerciseId: ex.id,
          completedSets: 0,
          totalSets: ex.sets
        }))
        setExerciseProgress(initialProgress)

      } catch (error) {
        console.error("Error al cargar datos del entrenamiento:", error)
        toast({
          title: "Error",
          description: "No pudimos cargar los datos del entrenamiento. Por favor, intenta de nuevo.",
          variant: "destructive"
        })
        router.push('/training/plan/amateur-zero')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkoutData()

    // Limpiar timer al desmontar
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [user, planId, dayId, toast, router])

  // Iniciar entrenamiento cuando se carga
  useEffect(() => {
    if (workout && !workoutStartTime && !isLoading) {
      setWorkoutStartTime(new Date())
    }
  }, [workout, workoutStartTime, isLoading])

  // Manejar temporizador de descanso
  useEffect(() => {
    if (isResting && restTimeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setRestTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout)
            setIsResting(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isResting, restTimeRemaining])

  // Obtener ejercicio actual
  const getCurrentExercise = () => {
    if (!workout || workout.exercises.length === 0) return null
    return workout.exercises[currentExerciseIndex]
  }

  // Completar un set
  const completeSet = () => {
    if (!workout) return

    const currentExercise = getCurrentExercise()
    if (!currentExercise) return

    // Actualizar progreso del ejercicio
    setExerciseProgress(prev => {
      const updated = [...prev]
      const exerciseProgressIndex = updated.findIndex(p => p.exerciseId === currentExercise.id)

      if (exerciseProgressIndex !== -1) {
        updated[exerciseProgressIndex].completedSets += 1
      }

      return updated
    })

    // Verificar si quedan más sets en este ejercicio
    if (currentSet < currentExercise.sets) {
      // Iniciar descanso entre series
      setIsResting(true)
      setRestTimeRemaining(currentExercise.rest_seconds)
      setCurrentSet(currentSet + 1)
    } else {
      // Verificar si quedan más ejercicios
      if (currentExerciseIndex < workout.exercises.length - 1) {
        // Pasar al siguiente ejercicio
        setCurrentExerciseIndex(currentExerciseIndex + 1)
        setCurrentSet(1)
        // Descanso más largo entre ejercicios
        setIsResting(true)
        setRestTimeRemaining(90) // 90 segundos entre ejercicios
      } else {
        // Entrenamiento completado
        completeWorkout()
      }
    }
  }

  // Saltar descanso
  const skipRest = () => {
    setIsResting(false)
    setRestTimeRemaining(0)
  }

  // Completar entrenamiento
  const completeWorkout = async () => {
    if (!user || !workout || !workoutStartTime) return

    try {
      // Calcular duración del entrenamiento
      const endTime = new Date()
      const durationMinutes = Math.round((endTime.getTime() - workoutStartTime.getTime()) / 60000)

      // Registrar sesión de entrenamiento
      const { error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          plan_id: workout.planId,
          day_id: workout.dayId,
          date: new Date().toISOString(),
          duration_minutes: durationMinutes,
          completed: true,
          notes: "Entrenamiento para principiantes completado",
          rating: 5 // Valor predeterminado
        })

      if (error) throw error

      setWorkoutCompleted(true)

      toast({
        title: "¡Entrenamiento completado!",
        description: `Has completado tu entrenamiento en ${durationMinutes} minutos.`,
      })
    } catch (error) {
      console.error("Error al guardar entrenamiento:", error)
      toast({
        title: "Error",
        description: "No pudimos guardar tu entrenamiento. Por favor, intenta de nuevo.",
        variant: "destructive"
      })
    }
  }

  // Calcular progreso total del entrenamiento
  const calculateTotalProgress = () => {
    if (!exerciseProgress.length) return 0

    const totalSets = exerciseProgress.reduce((sum, ex) => sum + ex.totalSets, 0)
    const completedSets = exerciseProgress.reduce((sum, ex) => sum + ex.completedSets, 0)

    return Math.round((completedSets / totalSets) * 100)
  }

  // Formatear tiempo restante
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
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

  if (!workout) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Entrenamiento no encontrado</CardTitle>
          <CardDescription>
            No pudimos encontrar los datos del entrenamiento
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Button onClick={() => router.push('/training/plan/amateur-zero')}>
              Volver al Plan de Entrenamiento
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (workoutCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">¡Entrenamiento Completado!</CardTitle>
          <CardDescription className="text-center">
            Has completado con éxito tu sesión de entrenamiento
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8 space-y-6">
            <div className="bg-green-50 rounded-full h-24 w-24 flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-1">{workout.dayName}</h3>
              <p className="text-muted-foreground">
                {workout.exercises.length} ejercicios • {exerciseProgress.reduce((sum, ex) => sum + ex.totalSets, 0)} series totales
              </p>
            </div>

            <div className="bg-blue-50 rounded-md p-4 text-sm text-left max-w-md mx-auto">
              <p className="font-medium text-blue-800">¡Excelente trabajo!</p>
              <p className="text-blue-700 mt-1">
                Cada entrenamiento te acerca más a tus objetivos. Recuerda mantenerte hidratado y
                descansar adecuadamente para una óptima recuperación.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <Button onClick={() => router.push('/training/plan/amateur-zero')}>
                Volver al Plan de Entrenamiento
              </Button>
              <Button variant="outline" onClick={() => router.push('/training/progress')}>
                Ver Mi Progreso
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentExercise = getCurrentExercise()

  // Tutorial para principiantes
  if (showTutorial) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">Guía Rápida de Entrenamiento</CardTitle>
          <CardDescription className="text-center">
            Antes de comenzar, aquí tienes algunos consejos importantes
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6 max-w-md mx-auto">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center mr-3 mt-0.5">
                  <span className="font-medium">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Prioriza la técnica correcta</h3>
                  <p className="text-sm text-muted-foreground">
                    Es mejor hacer menos repeticiones con buena forma que muchas con mala técnica.
                    Sigue las instrucciones visuales cuidadosamente.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center mr-3 mt-0.5">
                  <span className="font-medium">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Respeta los descansos</h3>
                  <p className="text-sm text-muted-foreground">
                    Los períodos de descanso son esenciales para recuperarte entre series.
                    Usa este tiempo para respirar y prepararte para la siguiente serie.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center mr-3 mt-0.5">
                  <span className="font-medium">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Escucha a tu cuerpo</h3>
                  <p className="text-sm text-muted-foreground">
                    Es normal sentir tensión muscular, pero detente si sientes dolor agudo.
                    Adapta los ejercicios según sea necesario.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center mr-3 mt-0.5">
                  <span className="font-medium">4</span>
                </div>
                <div>
                  <h3 className="font-medium">Mantente hidratado</h3>
                  <p className="text-sm text-muted-foreground">
                    Bebe agua regularmente durante tu entrenamiento, especialmente
                    durante los períodos de descanso.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-md p-4 text-sm">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800">Importante</p>
                  <p className="text-amber-700 mt-1">
                    Si tienes alguna condición médica o limitación física, adapta los ejercicios
                    según sea necesario o consulta con un profesional.
                  </p>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => setShowTutorial(false)}
            >
              Entendido, ¡Comencemos!
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
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => router.push('/training/plan/amateur-zero')}
          >
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Button>
          <Badge variant="outline">
            {currentExerciseIndex + 1} de {workout.exercises.length}
          </Badge>
        </div>
        <CardTitle className="text-center text-xl mt-2">{workout.dayName}</CardTitle>
        <CardDescription className="text-center">
          {workout.dayDescription || "Entrenamiento para principiantes"}
        </CardDescription>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span>Progreso total</span>
            <span>{calculateTotalProgress()}%</span>
          </div>
          <Progress value={calculateTotalProgress()} className="h-2" />
        </div>
      </CardHeader>

      <CardContent>
        {currentExercise ? (
          <div className="space-y-6">
            {isResting ? (
              <div className="text-center py-6 space-y-4">
                <div className="bg-blue-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium">Tiempo de Descanso</h3>
                <div className="text-3xl font-bold">{formatTime(restTimeRemaining)}</div>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Aprovecha para respirar profundamente y prepararte para la siguiente serie.
                </p>
                <Button onClick={skipRest}>
                  Saltar Descanso
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-1">{currentExercise.name}</h3>
                  <div className="flex items-center justify-center gap-3">
                    <Badge variant="secondary">Serie {currentSet} de {currentExercise.sets}</Badge>
                    <Badge variant="outline">{currentExercise.reps} repeticiones</Badge>
                  </div>
                </div>

                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                  <Image
                    src={currentExercise.exercise_details?.image_url || "/images/exercise-placeholder.jpg"}
                    alt={currentExercise.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Instrucciones:</h4>
                    <ol className="space-y-2 ml-5 list-decimal text-sm">
                      {currentExercise.exercise_details?.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>

                  {currentExercise.notes && (
                    <div className="bg-blue-50 rounded-md p-3 text-sm">
                      <Info className="h-4 w-4 inline-block mr-1 text-blue-500" />
                      <span>{currentExercise.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      if (currentExerciseIndex > 0) {
                        setCurrentExerciseIndex(currentExerciseIndex - 1)
                        setCurrentSet(1)
                      }
                    }}
                    disabled={currentExerciseIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={completeSet}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completar Serie
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      if (currentExerciseIndex < workout.exercises.length - 1) {
                        setCurrentExerciseIndex(currentExerciseIndex + 1)
                        setCurrentSet(1)
                      }
                    }}
                    disabled={currentExerciseIndex === workout.exercises.length - 1}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No hay ejercicios disponibles</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/training/plan/amateur-zero')}
        >
          <X className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
        <Button
          variant="destructive"
          onClick={completeWorkout}
        >
          Finalizar Entrenamiento
        </Button>
      </CardFooter>
    </Card>
  )
}
