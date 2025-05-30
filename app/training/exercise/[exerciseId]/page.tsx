"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, Play, Pause, RotateCcw, Timer, Info, Check, ChevronRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { ExerciseAlternatives } from "@/components/training/exercise-alternatives"
import { Exercise } from "@/lib/types/training"

// Datos simulados para los ejercicios (igual que en la página anterior)
const allExercises: Exercise[] = [
  {
    id: "ex-1",
    name: "Sentadilla con barra",
    category: "compound",
    muscleGroup: ["Cuádriceps", "Glúteos"],
    equipment: ["barbell"],
    sets: 4,
    repsMin: 8,
    repsMax: 12,
    rest: 90,
    instructions: "Mantén la espalda recta y las rodillas alineadas con los pies."
  },
  {
    id: "ex-2",
    name: "Prensa de piernas",
    category: "compound",
    muscleGroup: ["Cuádriceps", "Glúteos"],
    equipment: ["machine"],
    sets: 3,
    repsMin: 10,
    repsMax: 15,
    rest: 60,
    instructions: "Ajusta el asiento para que las rodillas formen un ángulo de 90 grados."
  },
  {
    id: "ex-3",
    name: "Extensiones de cuádriceps",
    category: "isolation",
    muscleGroup: ["Cuádriceps"],
    equipment: ["machine"],
    sets: 3,
    repsMin: 12,
    repsMax: 15,
    rest: 60,
    instructions: "Extiende completamente la pierna y contrae el cuádriceps en la parte superior."
  },
  {
    id: "ex-4",
    name: "Curl de isquiotibiales",
    category: "isolation",
    muscleGroup: ["Isquiotibiales"],
    equipment: ["machine"],
    sets: 3,
    repsMin: 12,
    repsMax: 15,
    rest: 60,
    instructions: "Contrae los isquiotibiales al flexionar la rodilla."
  },
  {
    id: "ex-5",
    name: "Hip thrust",
    category: "compound",
    muscleGroup: ["Glúteos"],
    equipment: ["barbell", "bench"],
    sets: 3,
    repsMin: 12,
    repsMax: 15,
    rest: 60,
    instructions: "Apoya los omóplatos en el banco y eleva las caderas contrayendo los glúteos."
  },
  {
    id: "ex-6",
    name: "Sentadilla frontal",
    category: "compound",
    muscleGroup: ["Cuádriceps", "Glúteos"],
    equipment: ["barbell"],
    sets: 4,
    repsMin: 8,
    repsMax: 10,
    rest: 90,
    instructions: "Mantén los codos elevados y la barra apoyada en los deltoides."
  },
  {
    id: "ex-7",
    name: "Sentadilla búlgara",
    category: "compound",
    muscleGroup: ["Cuádriceps", "Glúteos"],
    equipment: ["dumbbell", "bench"],
    sets: 3,
    repsMin: 10,
    repsMax: 12,
    rest: 60,
    instructions: "Mantén el pie trasero elevado sobre un banco y desciende con el pie delantero."
  }
]

export default function ExercisePage({ params }: { params: { exerciseId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [currentSet, setCurrentSet] = useState(1)
  const [timerActive, setTimerActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    // Simular carga de datos
    const loadExerciseData = async () => {
      setIsLoading(true)
      try {
        // En un entorno real, aquí cargaríamos los datos de Supabase
        // Para este ejemplo, usamos datos simulados

        // Obtener información del ejercicio
        const foundExercise = allExercises.find(ex => ex.id === params.exerciseId)
        if (!foundExercise) {
          throw new Error("Ejercicio no encontrado")
        }

        setExercise(foundExercise)
        // Inicializar el temporizador con el tiempo de descanso del ejercicio
        setTimeRemaining(foundExercise.rest || 60)

      } catch (error) {
        console.error("Error al cargar los datos del ejercicio:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del ejercicio.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadExerciseData()
  }, [params.exerciseId, toast])

  // Manejar el temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0) {
      setTimerActive(false)
      toast({
        title: "¡Tiempo de descanso completado!",
        description: "Es hora de comenzar la siguiente serie.",
      })
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timeRemaining, toast])

  // Iniciar/pausar el temporizador
  const toggleTimer = () => {
    setTimerActive(prev => !prev)
  }

  // Reiniciar el temporizador
  const resetTimer = () => {
    setTimerActive(false)
    setTimeRemaining(exercise?.rest || 60)
  }

  // Manejar el cambio de ejercicio por una alternativa
  const handleChangeExercise = (newExerciseId: string) => {
    const newExercise = allExercises.find(ex => ex.id === newExerciseId)
    if (newExercise) {
      setExercise(newExercise)
      setShowAlternatives(false)

      toast({
        title: "Ejercicio cambiado",
        description: `Se ha cambiado a ${newExercise.name}`,
        variant: "default"
      })
    }
  }

  // Avanzar a la siguiente serie
  const nextSet = () => {
    if (exercise && currentSet < (exercise.sets || 1)) {
      setCurrentSet(prev => prev + 1)
      resetTimer()
      setTimerActive(true)
    } else {
      // Si es la última serie, ir al siguiente ejercicio
      toast({
        title: "¡Ejercicio completado!",
        description: "Avanzando al siguiente ejercicio...",
      })

      // Aquí iríamos al siguiente ejercicio
      // Para este ejemplo, volvemos a la página de entrenamiento
      setTimeout(() => {
        router.push("/training")
      }, 1500)
    }
  }

  // Formatear el tiempo restante
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="h-8 w-3/4 animate-pulse rounded-md bg-muted"></div>
        <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted"></div>
        <div className="h-64 animate-pulse rounded-lg bg-muted"></div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Ejercicio no encontrado</h1>
        <p className="mb-4">El ejercicio solicitado no existe.</p>
        <Button onClick={() => router.push("/training")}>
          Volver al inicio
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{exercise.name}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {exercise.category && (
              <Badge variant="outline">{exercise.category}</Badge>
            )}
            {exercise.muscleGroup && exercise.muscleGroup.map(group => (
              <Badge key={group} variant="secondary">{group}</Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/training")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Dialog open={showAlternatives} onOpenChange={setShowAlternatives}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Alternativas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <ExerciseAlternatives
                exercise={exercise}
                availableExercises={allExercises}
                onSelectAlternative={handleChangeExercise}
                currentExerciseId={exercise.id}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2 text-primary" />
              Instrucciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Equipamiento</h4>
                <div className="flex flex-wrap gap-1">
                  {exercise.equipment && exercise.equipment.map(eq => (
                    <Badge key={eq} variant="outline">{eq}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Series y repeticiones</h4>
                <p className="text-lg font-medium">
                  {exercise.sets} × {exercise.repsMin}{exercise.repsMax ? `-${exercise.repsMax}` : ''}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Descanso</h4>
                <p className="text-lg font-medium">{exercise.rest} segundos</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Instrucciones</h4>
                <p className="text-sm">{exercise.instructions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Timer className="h-5 w-5 mr-2 text-primary" />
              Seguimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-1">Serie actual</h3>
                <div className="text-4xl font-bold text-primary">
                  {currentSet} / {exercise.sets}
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium mb-1">Tiempo de descanso</h3>
                <div className="text-4xl font-bold">
                  {formatTime(timeRemaining)}
                </div>

                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="outline" size="icon" onClick={resetTimer}>
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={timerActive ? "destructive" : "default"}
                    size="lg"
                    onClick={toggleTimer}
                  >
                    {timerActive ? (
                      <><Pause className="h-5 w-5 mr-2" /> Pausar</>
                    ) : (
                      <><Play className="h-5 w-5 mr-2" /> Iniciar</>
                    )}
                  </Button>
                </div>
              </div>

              <Button className="w-full" onClick={nextSet}>
                <ChevronRight className="h-5 w-5 mr-2" />
                {currentSet < (exercise.sets || 1) ? "Siguiente serie" : "Completar ejercicio"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2 text-primary" />
            Técnica correcta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Video demostrativo del ejercicio</p>
          </div>

          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Puntos clave:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Mantén la espalda recta durante todo el movimiento</li>
              <li>Respira correctamente: inhala en la fase excéntrica, exhala en la concéntrica</li>
              <li>Mantén la tensión en los músculos objetivo</li>
              <li>Controla el movimiento, evita usar impulso</li>
              <li>Ajusta el peso para mantener la técnica correcta</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
