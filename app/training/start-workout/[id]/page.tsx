"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dumbbell, Timer, ArrowLeft, CheckCircle, XCircle, Play, Pause, RotateCcw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { Progress } from "@/components/ui/progress"

export default function StartWorkoutPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("exercises")
  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [restTime, setRestTime] = useState(60) // 60 segundos de descanso
  const [elapsedTime, setElapsedTime] = useState(0)
  const [workoutData, setWorkoutData] = useState<any>(null)

  // Cargar datos del entrenamiento
  useEffect(() => {
    const loadWorkoutData = async () => {
      try {
        // En un entorno real, aquí cargaríamos los datos de Supabase
        // Para este ejemplo, usamos datos simulados

        // Recuperar el día seleccionado de localStorage
        const dayId = params.id as string

        // Datos simulados del plan de fitness general
        const generalFitnessPlan = {
          days: [
            {
              id: "day-1",
              name: "Lunes: Piernas",
              description: "Entrenamiento enfocado en piernas con ejercicios compuestos y aislados.",
              muscleGroups: ["Cuádriceps", "Isquiotibiales", "Glúteos", "Pantorrillas"],
              exercises: [
                { name: "Sentadilla", sets: 4, reps: "8-12", restTime: 90 },
                { name: "Prensa de piernas", sets: 3, reps: "10-15", restTime: 60 },
                { name: "Extensiones de cuádriceps", sets: 3, reps: "12-15", restTime: 60 },
                { name: "Curl de isquiotibiales", sets: 3, reps: "12-15", restTime: 60 },
                { name: "Elevaciones de pantorrillas", sets: 4, reps: "15-20", restTime: 45 }
              ]
            },
            {
              id: "day-2",
              name: "Día 2",
              description: "Entrenamiento de pecho y espalda con enfoque en fuerza y resistencia.",
              muscleGroups: ["Pecho", "Espalda", "Core"],
              exercises: [
                { name: "Press de banca", sets: 4, reps: "8-10", restTime: 90 },
                { name: "Remo con barra", sets: 4, reps: "8-10", restTime: 90 },
                { name: "Aperturas con mancuernas", sets: 3, reps: "12-15", restTime: 60 },
                { name: "Jalones al pecho", sets: 3, reps: "12-15", restTime: 60 },
                { name: "Planchas", sets: 3, reps: "30-60s", restTime: 45 }
              ]
            },
            {
              id: "day-3",
              name: "Día 3",
              description: "Entrenamiento de hombros y brazos para desarrollo completo.",
              muscleGroups: ["Hombros", "Bíceps", "Tríceps"],
              exercises: [
                { name: "Press militar", sets: 4, reps: "8-10", restTime: 90 },
                { name: "Elevaciones laterales", sets: 3, reps: "12-15", restTime: 60 },
                { name: "Curl de bíceps", sets: 3, reps: "10-12", restTime: 60 },
                { name: "Extensiones de tríceps", sets: 3, reps: "10-12", restTime: 60 },
                { name: "Fondos en banco", sets: 3, reps: "12-15", restTime: 45 }
              ]
            },
            {
              id: "day-4",
              name: "Día 4",
              description: "Entrenamiento de piernas con enfoque en glúteos y posterior.",
              muscleGroups: ["Glúteos", "Isquiotibiales", "Cuádriceps", "Core"],
              exercises: [
                { name: "Peso muerto", sets: 4, reps: "8-10", restTime: 120 },
                { name: "Hip thrust", sets: 4, reps: "10-12", restTime: 90 },
                { name: "Zancadas", sets: 3, reps: "12-15 por pierna", restTime: 60 },
                { name: "Abductores", sets: 3, reps: "15-20", restTime: 60 },
                { name: "Crunch abdominal", sets: 3, reps: "15-20", restTime: 45 }
              ]
            },
            {
              id: "day-5",
              name: "Día 5",
              description: "Entrenamiento de cuerpo completo para finalizar la semana.",
              muscleGroups: ["Pecho", "Espalda", "Hombros", "Brazos", "Core"],
              exercises: [
                { name: "Press de banca inclinado", sets: 3, reps: "10-12", restTime: 90 },
                { name: "Dominadas asistidas", sets: 3, reps: "8-10", restTime: 90 },
                { name: "Press de hombros", sets: 3, reps: "10-12", restTime: 60 },
                { name: "Curl de bíceps con barra", sets: 3, reps: "10-12", restTime: 60 },
                { name: "Extensiones de tríceps", sets: 3, reps: "10-12", restTime: 60 }
              ]
            }
          ]
        }

        // Encontrar el día seleccionado
        const selectedDay = generalFitnessPlan.days.find(day => day.id === dayId)

        if (selectedDay) {
          setWorkoutData(selectedDay)
          // Inicializar el tiempo de descanso con el del primer ejercicio
          if (selectedDay.exercises && selectedDay.exercises.length > 0) {
            setRestTime(selectedDay.exercises[0].restTime || 60)
          }
        } else {
          toast({
            title: "Error",
            description: "No se encontró el entrenamiento seleccionado.",
            variant: "destructive"
          })
          router.push("/training/general-fitness")
        }
      } catch (error) {
        console.error("Error al cargar los datos del entrenamiento:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del entrenamiento.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkoutData()
  }, [params.id, router, toast])

  // Manejar el inicio del entrenamiento
  const handleStartWorkout = () => {
    setWorkoutStarted(true)
    setCurrentExerciseIndex(0)
    toast({
      title: "Entrenamiento iniciado",
      description: "¡Comienza con el primer ejercicio!",
    })
  }

  // Manejar el cambio de ejercicio
  const handleNextExercise = () => {
    if (currentExerciseIndex < workoutData.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      // Actualizar el tiempo de descanso para el nuevo ejercicio
      setRestTime(workoutData.exercises[currentExerciseIndex + 1].restTime || 60)
      setElapsedTime(0)
      setTimerRunning(false)
    } else {
      // Finalizar entrenamiento
      toast({
        title: "¡Entrenamiento completado!",
        description: "Has completado todos los ejercicios. ¡Buen trabajo!",
      })
      setWorkoutStarted(false)
    }
  }

  // Manejar el temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => {
          if (prev < restTime) {
            return prev + 1
          } else {
            // Detener el temporizador cuando se alcanza el tiempo de descanso
            setTimerRunning(false)
            toast({
              title: "Descanso completado",
              description: "¡Es hora de continuar con el ejercicio!",
            })
            return prev
          }
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerRunning, restTime, toast])

  // Manejar el inicio/pausa del temporizador
  const toggleTimer = () => {
    if (elapsedTime >= restTime) {
      // Reiniciar el temporizador
      setElapsedTime(0)
    }
    setTimerRunning(!timerRunning)
  }

  // Reiniciar el temporizador
  const resetTimer = () => {
    setElapsedTime(0)
    setTimerRunning(false)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="h-8 w-3/4 animate-pulse rounded-md bg-muted"></div>
        <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted"></div>
        <div className="h-48 animate-pulse rounded-lg bg-muted"></div>
      </div>
    )
  }

  if (!workoutData) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <Button variant="outline" onClick={() => router.push("/training/general-fitness")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-bold mb-2">Entrenamiento no encontrado</h2>
              <p className="text-muted-foreground mb-4">
                No se pudo encontrar el entrenamiento seleccionado.
              </p>
              <Button onClick={() => router.push("/training/general-fitness")}>
                Volver al Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/training/general-fitness")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Plan
        </Button>

        {!workoutStarted && (
          <Button onClick={handleStartWorkout}>
            <Play className="h-4 w-4 mr-2" />
            Iniciar Entrenamiento
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{workoutData.name}</CardTitle>
          <CardDescription>{workoutData.description}</CardDescription>

          <div className="flex flex-wrap gap-2 mt-2">
            {workoutData.muscleGroups?.map((muscle: string) => (
              <Badge key={muscle} variant="secondary">
                {muscle}
              </Badge>
            ))}
          </div>
        </CardHeader>

        {workoutStarted ? (
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">
                  Ejercicio {currentExerciseIndex + 1} de {workoutData.exercises.length}
                </h3>
                <Badge variant="outline">
                  {Math.round((currentExerciseIndex / workoutData.exercises.length) * 100)}% completado
                </Badge>
              </div>

              <Progress value={(currentExerciseIndex / workoutData.exercises.length) * 100} className="mb-4" />

              <div className="bg-card p-4 rounded-lg shadow-sm">
                <h4 className="text-xl font-bold mb-2">
                  {workoutData.exercises[currentExerciseIndex].name}
                </h4>
                <div className="flex flex-wrap gap-4 mb-4">
                  <Badge variant="outline" className="text-base py-1 px-3">
                    {workoutData.exercises[currentExerciseIndex].sets} series
                  </Badge>
                  <Badge variant="outline" className="text-base py-1 px-3">
                    {workoutData.exercises[currentExerciseIndex].reps} repeticiones
                  </Badge>
                  <Badge variant="outline" className="text-base py-1 px-3">
                    {workoutData.exercises[currentExerciseIndex].restTime || 60}s descanso
                  </Badge>
                </div>

                <div className="flex justify-center mt-6">
                  <Button size="lg" onClick={handleNextExercise}>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Completar y Continuar
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Temporizador de Descanso</h3>

              <div className="text-center mb-4">
                <div className="text-4xl font-bold">
                  {Math.floor((restTime - elapsedTime) / 60).toString().padStart(2, '0')}:
                  {((restTime - elapsedTime) % 60).toString().padStart(2, '0')}
                </div>
                <Progress value={(elapsedTime / restTime) * 100} className="mt-2" />
              </div>

              <div className="flex justify-center gap-2">
                <Button variant="outline" size="icon" onClick={toggleTimer}>
                  {timerRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button variant="outline" size="icon" onClick={resetTimer}>
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="exercises" className="flex items-center">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Ejercicios
                </TabsTrigger>
                <TabsTrigger value="timer" className="flex items-center">
                  <Timer className="h-4 w-4 mr-2" />
                  Temporizador
                </TabsTrigger>
              </TabsList>

              <TabsContent value="exercises" className="space-y-4">
                <div className="space-y-4">
                  {workoutData.exercises.map((exercise: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{exercise.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets} series × {exercise.reps}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {exercise.restTime || 60}s descanso
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timer" className="space-y-4">
                <div className="text-center py-8">
                  <Timer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Temporizador disponible durante el entrenamiento</h3>
                  <p className="text-muted-foreground mb-4">
                    Inicia el entrenamiento para utilizar el temporizador
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}

        <CardFooter>
          {!workoutStarted && (
            <Button className="w-full" onClick={handleStartWorkout}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Entrenamiento
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
