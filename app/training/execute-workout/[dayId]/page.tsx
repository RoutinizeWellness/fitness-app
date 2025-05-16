"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Play, Dumbbell, Clock, RotateCcw, Check, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ExerciseExecution } from "@/components/training/exercise-execution"
import { Exercise } from "@/lib/types/training"

// Datos simulados para los ejercicios
const mockExercises: Exercise[] = [
  {
    id: "ex-1",
    name: "Sentadilla",
    category: "compound",
    muscleGroup: ["Piernas"],
    equipment: ["barbell"],
    sets: 4,
    repsMin: 8,
    repsMax: 12,
    rest: 90,
    pattern: "squat",
    instructions: "Mantén la espalda recta y las rodillas alineadas con los pies.",
    difficulty: "intermediate",
    isCompound: true,
    videoUrl: "https://example.com/squat.mp4",
    imageUrl: "https://example.com/squat.jpg"
  },
  {
    id: "ex-2",
    name: "Peso Muerto",
    category: "compound",
    muscleGroup: ["Piernas"],
    equipment: ["barbell"],
    sets: 4,
    repsMin: 6,
    repsMax: 10,
    rest: 90,
    pattern: "hinge",
    instructions: "Mantén la espalda recta y empuja con los talones al levantar.",
    difficulty: "advanced",
    isCompound: true,
    videoUrl: "https://example.com/deadlift.mp4",
    imageUrl: "https://example.com/deadlift.jpg"
  },
  {
    id: "ex-3",
    name: "Prensa de Piernas",
    category: "compound",
    muscleGroup: ["Piernas"],
    equipment: ["machine"],
    sets: 3,
    repsMin: 10,
    repsMax: 15,
    rest: 90,
    pattern: "squat",
    instructions: "Ajusta el asiento para que las rodillas formen un ángulo de 90 grados.",
    difficulty: "intermediate",
    isCompound: true,
    videoUrl: "https://example.com/legpress.mp4",
    imageUrl: "https://example.com/legpress.jpg"
  },
  {
    id: "ex-4",
    name: "Extensión de Cuádriceps",
    category: "isolation",
    muscleGroup: ["Piernas"],
    equipment: ["machine"],
    sets: 3,
    repsMin: 10,
    repsMax: 15,
    rest: 90,
    pattern: "knee-extension",
    instructions: "Extiende completamente la pierna y contrae el cuádriceps en la parte superior.",
    difficulty: "beginner",
    isCompound: false,
    videoUrl: "https://example.com/legextension.mp4",
    imageUrl: "https://example.com/legextension.jpg"
  },
  {
    id: "ex-5",
    name: "Curl de Isquiotibiales",
    category: "isolation",
    muscleGroup: ["Piernas"],
    equipment: ["machine"],
    sets: 3,
    repsMin: 10,
    repsMax: 15,
    rest: 90,
    pattern: "knee-flexion",
    instructions: "Contrae los isquiotibiales al flexionar la rodilla.",
    difficulty: "beginner",
    isCompound: false,
    videoUrl: "https://example.com/legcurl.mp4",
    imageUrl: "https://example.com/legcurl.jpg"
  },
  {
    id: "ex-6",
    name: "Sentadilla frontal",
    category: "compound",
    muscleGroup: ["Piernas"],
    equipment: ["barbell"],
    sets: 4,
    repsMin: 8,
    repsMax: 10,
    rest: 90,
    pattern: "squat",
    instructions: "Mantén los codos elevados y la barra apoyada en los deltoides.",
    difficulty: "advanced",
    isCompound: true,
    videoUrl: "https://example.com/frontsquat.mp4",
    imageUrl: "https://example.com/frontsquat.jpg"
  },
  {
    id: "ex-7",
    name: "Sentadilla búlgara",
    category: "compound",
    muscleGroup: ["Piernas"],
    equipment: ["dumbbell"],
    sets: 3,
    repsMin: 10,
    repsMax: 12,
    rest: 60,
    pattern: "squat",
    instructions: "Mantén el pie trasero elevado sobre un banco y desciende con el pie delantero.",
    difficulty: "intermediate",
    isCompound: true,
    videoUrl: "https://example.com/bulgariansquat.mp4",
    imageUrl: "https://example.com/bulgariansquat.jpg"
  },
  {
    id: "ex-8",
    name: "Elevación de pantorrillas",
    category: "isolation",
    muscleGroup: ["Piernas"],
    equipment: ["machine"],
    sets: 4,
    repsMin: 12,
    repsMax: 15,
    rest: 60,
    pattern: "calf-raise",
    instructions: "Elévate sobre la punta de los pies y contrae las pantorrillas.",
    difficulty: "beginner",
    isCompound: false,
    videoUrl: "https://example.com/calfraise.mp4",
    imageUrl: "https://example.com/calfraise.jpg"
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
    name: "Lunes: Piernas",
    description: "Entrenamiento enfocado en piernas con énfasis en cuádriceps y glúteos",
    muscleGroups: ["Piernas", "Glúteos"],
    exercises: ["ex-1", "ex-2", "ex-3", "ex-4", "ex-5"]
  },
  "day-2": {
    id: "day-2",
    name: "Martes: Pecho y Espalda",
    description: "Entrenamiento de empuje y tracción para el tren superior",
    muscleGroups: ["Pecho", "Espalda"],
    exercises: ["ex-6", "ex-7", "ex-8"]
  },
  "day-3": {
    id: "day-3",
    name: "Jueves: Hombros y Brazos",
    description: "Entrenamiento de hombros, bíceps y tríceps",
    muscleGroups: ["Hombros", "Brazos"],
    exercises: ["ex-3", "ex-6", "ex-7"]
  },
  "day-4": {
    id: "day-4",
    name: "Viernes: Piernas",
    description: "Segundo entrenamiento de piernas con énfasis en isquiotibiales y glúteos",
    muscleGroups: ["Piernas"],
    exercises: ["ex-2", "ex-4", "ex-5", "ex-8"]
  }
}

export default function ExecuteWorkoutPage({ params }: { params: { dayId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [workoutDay, setWorkoutDay] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("ejercicio")
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Simular carga de datos
    const loadWorkoutData = async () => {
      setIsLoading(true)
      try {
        // En un entorno real, aquí cargaríamos los datos de Supabase
        // Para este ejemplo, usamos datos simulados

        console.log("Cargando datos para el día:", params.dayId)
        console.log("Días disponibles:", Object.keys(workoutDays))

        // Obtener información del día de entrenamiento
        const day = workoutDays[params.dayId]
        if (!day) {
          console.error("Día no encontrado:", params.dayId)
          throw new Error("Día de entrenamiento no encontrado")
        }

        console.log("Día encontrado:", day)
        setWorkoutDay(day)

        // Obtener ejercicios para este día
        const dayExercises = mockExercises.filter(ex =>
          day.exercises.includes(ex.id)
        )
        console.log("Ejercicios filtrados para este día:", dayExercises)
        setExercises(dayExercises)

        // Inicializar el estado de ejercicios completados
        const initialCompletedState: Record<string, boolean> = {}
        dayExercises.forEach(ex => {
          initialCompletedState[ex.id] = false
        })
        setCompletedExercises(initialCompletedState)

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
  }, [params.dayId, toast])

  // Manejar el cambio de un ejercicio por una alternativa
  const handleChangeExercise = (oldExerciseId: string, newExerciseId: string) => {
    // Encontrar el nuevo ejercicio
    const newExercise = mockExercises.find(ex => ex.id === newExerciseId)
    if (!newExercise) return

    // Actualizar la lista de ejercicios
    setExercises(prevExercises =>
      prevExercises.map(ex =>
        ex.id === oldExerciseId ? newExercise : ex
      )
    )

    // Actualizar el estado de ejercicios completados
    setCompletedExercises(prev => ({
      ...prev,
      [oldExerciseId]: false,
      [newExerciseId]: false
    }))
  }

  // Manejar la finalización de un ejercicio
  const handleCompleteExercise = (exerciseData: {
    exerciseId: string;
    weight: number;
    reps: number;
    rir: number;
    completed: boolean;
  }) => {
    // Guardar los datos del ejercicio completado (en un entorno real, esto se enviaría a Supabase)
    console.log("Ejercicio completado:", exerciseData);

    // Actualizar el estado de ejercicios completados
    setCompletedExercises(prev => ({
      ...prev,
      [exerciseData.exerciseId]: true
    }))

    // Avanzar al siguiente ejercicio si todos los sets están completados
    if (currentSet < (exercises[currentExerciseIndex]?.sets || 1)) {
      // Avanzar al siguiente set
      setCurrentSet(prev => prev + 1)

      // Mostrar mensaje de serie completada
      toast({
        title: "Serie completada",
        description: `Serie ${currentSet} de ${exercises[currentExerciseIndex]?.sets} completada. Descansa antes de la siguiente serie.`,
      })
    } else {
      // Reiniciar el contador de sets
      setCurrentSet(1)

      // Avanzar al siguiente ejercicio
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1)

        // Mostrar mensaje de ejercicio completado
        toast({
          title: "Ejercicio completado",
          description: `¡Bien hecho! Pasando al siguiente ejercicio: ${exercises[currentExerciseIndex + 1]?.name}`,
        })
      } else {
        // Todos los ejercicios completados
        toast({
          title: "¡Entrenamiento completado!",
          description: "Has completado todos los ejercicios para hoy.",
          variant: "success"
        })
      }
    }
  }

  // Verificar si todos los ejercicios están completados
  const allExercisesCompleted = exercises.length > 0 &&
    exercises.every(ex => completedExercises[ex.id])

  if (isLoading) {
    return (
      <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative p-6 space-y-8">
        <div className="h-8 w-3/4 animate-pulse rounded-md bg-muted"></div>
        <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted"></div>
        <div className="h-64 animate-pulse rounded-lg bg-muted"></div>
      </div>
    )
  }

  if (!workoutDay) {
    return (
      <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Entrenamiento no encontrado</h1>
        <p className="mb-4">El día de entrenamiento solicitado no existe.</p>
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
          <button
            className="w-8 h-8 flex items-center justify-center"
            onClick={() => {
              if (currentExerciseIndex > 0) {
                setCurrentExerciseIndex(prev => prev - 1)
                setCurrentSet(1)
              }
            }}
            disabled={currentExerciseIndex === 0}
          >
            <ChevronLeft className={`h-5 w-5 ${currentExerciseIndex === 0 ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          <div className="h-2 bg-gray-200 rounded-full flex-1 mx-2">
            <div
              className="h-full bg-primary rounded-full"
              style={{
                width: `${(currentExerciseIndex / Math.max(1, exercises.length - 1)) * 100}%`
              }}
            ></div>
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center"
            onClick={() => {
              if (currentExerciseIndex < exercises.length - 1) {
                setCurrentExerciseIndex(prev => prev + 1)
                setCurrentSet(1)
              }
            }}
            disabled={currentExerciseIndex === exercises.length - 1}
          >
            <ChevronLeft className={`h-5 w-5 rotate-180 ${currentExerciseIndex === exercises.length - 1 ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-6 pb-20 overflow-y-auto h-[calc(896px-140px)]">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#573353]">{workoutDay.name}</h2>
          <p className="text-sm text-muted-foreground">{workoutDay.description}</p>
        </div>

        <TabsContent value="ejercicio" className="mt-0">
          {exercises.length > 0 ? (
            <div className="space-y-4">
              {/* Instrucciones del ejercicio */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-700 mb-1">Instrucciones</h4>
                      <p className="text-sm text-blue-700">
                        {exercises[currentExerciseIndex]?.instructions ||
                         "Mantén una buena técnica y controla el movimiento durante todo el recorrido."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Componente de ejecución */}
              <ExerciseExecution
                exercise={exercises[currentExerciseIndex]}
                availableExercises={mockExercises}
                onChangeExercise={handleChangeExercise}
                onComplete={handleCompleteExercise}
                currentSet={currentSet}
                totalSets={exercises[currentExerciseIndex]?.sets}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay ejercicios disponibles para este día.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="camara" className="mt-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                <p className="text-muted-foreground">Cámara no disponible</p>
              </div>
              <p className="text-sm text-muted-foreground">
                La funcionalidad de cámara para análisis de postura estará disponible próximamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Progreso del entrenamiento</h3>
          <div className="space-y-2">
            {exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className={`flex items-center p-3 rounded-lg ${
                  index === currentExerciseIndex
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-white'
                }`}
              >
                <div className="mr-3">
                  {completedExercises[exercise.id] ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                      <span className="text-xs">{index + 1}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {exercise.sets} × {exercise.repsMin}-{exercise.repsMax}
                  </p>
                </div>
                <Badge variant={completedExercises[exercise.id] ? "default" : "outline"}>
                  {completedExercises[exercise.id] ? "Completado" : "Pendiente"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {allExercisesCompleted && (
          <div className="mt-6 text-center">
            <h3 className="text-lg font-medium text-green-600 mb-2">
              ¡Entrenamiento completado!
            </h3>
            <Button
              className="w-full"
              onClick={() => router.push("/training")}
            >
              Finalizar entrenamiento
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
