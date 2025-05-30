"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { ChevronLeft, ChevronRight, Minus, Plus, Camera, Dumbbell, Timer, RotateCcw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { Exercise } from "@/lib/types/training"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ExerciseAlternatives } from "@/components/training/exercise-alternatives"

// Datos simulados para los ejercicios
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
  }
]

// Datos simulados para los días de entrenamiento
const workoutDays: Record<string, {
  id: string;
  name: string;
  description: string;
  muscleGroups: string[];
  exercises: string[];
}> = {
  "day-1": {
    id: "day-1",
    name: "Día 1: Piernas",
    description: "Entrenamiento enfocado en piernas con énfasis en cuádriceps y glúteos",
    muscleGroups: ["Piernas", "Glúteos"],
    exercises: ["ex-1", "ex-2", "ex-3", "ex-4", "ex-5"]
  }
}

export default function ExecuteExercisePage({ params }: { params: { exerciseId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("ejercicio")
  const [currentSet, setCurrentSet] = useState(1)
  const [weight, setWeight] = useState(0)
  const [reps, setReps] = useState(12)
  const [rir, setRir] = useState(2)
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [dayId, setDayId] = useState("day-1") // Por defecto usamos day-1

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

        // Inicializar valores
        setReps(foundExercise.repsMin || 12)

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

  // Incrementar/decrementar peso
  const adjustWeight = (amount: number) => {
    setWeight(prev => Math.max(0, prev + amount))
  }

  // Incrementar/decrementar repeticiones
  const adjustReps = (amount: number) => {
    setReps(prev => Math.max(1, prev + amount))
  }

  // Avanzar a la siguiente serie
  const nextSet = () => {
    if (exercise && currentSet < (exercise.sets || 1)) {
      // Guardar datos de la serie actual (en un entorno real, esto se enviaría a Supabase)
      console.log(`Serie ${currentSet} completada: ${reps} reps con ${weight}kg, RIR: ${rir}`)

      setCurrentSet(prev => prev + 1)

      toast({
        title: "Serie completada",
        description: `Has completado la serie ${currentSet} de ${exercise.sets}`,
      })
    } else {
      // Si es la última serie, ir al siguiente ejercicio
      completeExercise()
    }
  }

  // Completar el ejercicio actual
  const completeExercise = () => {
    // Guardar datos de la última serie
    console.log(`Serie ${currentSet} completada: ${reps} reps con ${weight}kg, RIR: ${rir}`)

    toast({
      title: "¡Ejercicio completado!",
      description: "Avanzando al siguiente ejercicio...",
    })

    // Encontrar el siguiente ejercicio en el día actual
    const currentDay = workoutDays[dayId]
    if (currentDay) {
      const currentIndex = currentDay.exercises.indexOf(params.exerciseId)
      if (currentIndex >= 0 && currentIndex < currentDay.exercises.length - 1) {
        // Ir al siguiente ejercicio
        const nextExerciseId = currentDay.exercises[currentIndex + 1]
        router.push(`/training/execute/${nextExerciseId}`)
      } else {
        // Si es el último ejercicio, volver a la página de entrenamiento
        toast({
          title: "¡Entrenamiento completado!",
          description: "Has completado todos los ejercicios para hoy.",
        })
        setTimeout(() => {
          router.push("/training")
        }, 1500)
      }
    } else {
      // Si no hay información del día, volver a la página de entrenamiento
      router.push("/training")
    }
  }

  if (isLoading) {
    return (
      <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative p-6 space-y-8">
        <div className="h-8 w-3/4 animate-pulse rounded-md bg-muted"></div>
        <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted"></div>
        <div className="h-64 animate-pulse rounded-lg bg-muted"></div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Ejercicio no encontrado</h1>
        <p className="mb-4">El ejercicio solicitado no existe.</p>
        <Button onClick={() => router.push("/training")}>
          Volver al inicio
        </Button>
      </div>
    )
  }

  return (
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm"
            onClick={() => router.push('/training')}
          >
            <ChevronLeft className="h-5 w-5 text-[#573353]" />
          </button>
          <h1 className="text-xl font-bold text-[#573353]">Training</h1>
          <div className="w-10"></div> {/* Spacer para centrar el título */}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 bg-white">
            <TabsTrigger value="ejercicio" className="rounded-full">Ejercicio</TabsTrigger>
            <TabsTrigger value="camara" className="rounded-full">Cámara</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Slider de navegación */}
        <div className="flex items-center justify-between mb-4">
          <button className="w-8 h-8 flex items-center justify-center">
            <ChevronLeft className="h-5 w-5 text-gray-400" />
          </button>
          <div className="h-2 bg-gray-200 rounded-full flex-1 mx-2">
            <div className="h-full bg-primary rounded-full" style={{ width: '50%' }}></div>
          </div>
          <button className="w-8 h-8 flex items-center justify-center">
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-6 pb-20">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#573353] flex items-center">
            Ejecutar Entrenamiento
          </h2>
          <Dialog open={showAlternatives} onOpenChange={setShowAlternatives}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-2">
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

        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <Badge className="bg-blue-500 text-white">
              {currentSet}/{exercise.sets}
            </Badge>
            <h3 className="text-lg font-bold text-center text-[#573353]">
              {exercise.name}
            </h3>
            <div className="w-10"></div> {/* Spacer para centrar el título */}
          </div>

          <div className="text-center mb-4">
            <Badge variant="outline" className="mb-1">
              {exercise.muscleGroup.join(", ")}
            </Badge>
          </div>

          <div className="space-y-6">
            {/* Peso */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[#573353]">Serie:</span>
                <span className="text-sm font-medium text-[#573353]">{currentSet} de {exercise.sets}</span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[#573353]">Repeticiones:</span>
                <span className="text-sm font-medium text-[#573353]">{exercise.repsMin}-{exercise.repsMax}</span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[#573353]">Descanso:</span>
                <span className="text-sm font-medium text-[#573353]">{exercise.rest}s</span>
              </div>
            </div>

            {/* Peso (kg) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[#573353]">Peso (kg)</span>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => adjustWeight(-2.5)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-4 font-bold text-lg">{weight}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => adjustWeight(2.5)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Repeticiones */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[#573353]">Repeticiones</span>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => adjustReps(-1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-4 font-bold text-lg">{reps}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => adjustReps(1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* RIR (Repeticiones en Reserva) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[#573353]">RIR (Repeticiones en Reserva)</span>
              </div>
              <Slider
                value={[rir]}
                min={0}
                max={5}
                step={1}
                onValueChange={(value) => setRir(value[0])}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>

            <Button className="w-full" onClick={nextSet}>
              {currentSet < (exercise.sets || 1) ? "Completar serie" : "Completar ejercicio"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
