"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Play, Dumbbell, Clock, RotateCcw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { ExerciseItem } from "@/components/training/exercise-item"
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
    instructions: "Mantén la espalda recta y las rodillas alineadas con los pies."
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
    instructions: "Mantén la espalda recta y empuja con los talones al levantar."
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
    instructions: "Ajusta el asiento para que las rodillas formen un ángulo de 90 grados."
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
    instructions: "Extiende completamente la pierna y contrae el cuádriceps en la parte superior."
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
    instructions: "Contrae los isquiotibiales al flexionar la rodilla."
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
    instructions: "Mantén los codos elevados y la barra apoyada en los deltoides."
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
    instructions: "Mantén el pie trasero elevado sobre un banco y desciende con el pie delantero."
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
    instructions: "Elévate sobre la punta de los pies y contrae las pantorrillas."
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
    exercises: ["ex-1", "ex-2", "ex-3"]
  },
  "day-3": {
    id: "day-3",
    name: "Jueves: Hombros y Brazos",
    description: "Entrenamiento de hombros, bíceps y tríceps",
    muscleGroups: ["Hombros", "Brazos"],
    exercises: ["ex-1", "ex-2", "ex-3"]
  },
  "day-4": {
    id: "day-4",
    name: "Viernes: Piernas",
    description: "Segundo entrenamiento de piernas con énfasis en isquiotibiales y glúteos",
    muscleGroups: ["Piernas"],
    exercises: ["ex-1", "ex-2", "ex-3", "ex-4"]
  }
}

export default function WorkoutPage({ params }: { params: { dayId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [workoutDay, setWorkoutDay] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("ejercicios")

  useEffect(() => {
    // Simular carga de datos
    const loadWorkoutData = async () => {
      setIsLoading(true)
      try {
        // En un entorno real, aquí cargaríamos los datos de Supabase
        // Para este ejemplo, usamos datos simulados

        // Obtener información del día de entrenamiento
        const day = workoutDays[params.dayId]
        if (!day) {
          throw new Error("Día de entrenamiento no encontrado")
        }

        setWorkoutDay(day)

        // Obtener ejercicios para este día
        const dayExercises = mockExercises.filter(ex =>
          day.exercises.includes(ex.id)
        )
        setExercises(dayExercises)

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

  // Manejar el inicio de un ejercicio específico
  const handleStartExercise = (exerciseId: string) => {
    router.push(`/training/execute/${exerciseId}`)
  }

  // Manejar el cambio de un ejercicio por una alternativa
  const handleChangeExercise = (oldExerciseId: string, newExerciseId: string) => {
    setExercises(prevExercises =>
      prevExercises.map(ex =>
        ex.id === oldExerciseId
          ? mockExercises.find(newEx => newEx.id === newExerciseId) || ex
          : ex
      )
    )

    // Actualizar el día de entrenamiento
    if (workoutDay) {
      const updatedExercises = workoutDay.exercises.map((id: string) =>
        id === oldExerciseId ? newExerciseId : id
      )
      setWorkoutDay({
        ...workoutDay,
        exercises: updatedExercises
      })
    }
  }

  // Manejar el inicio del entrenamiento completo
  const handleStartWorkout = () => {
    if (exercises.length > 0) {
      router.push(`/training/execute/${exercises[0].id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative p-6 space-y-8">
        <div className="h-8 w-3/4 animate-pulse rounded-md bg-muted"></div>
        <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted"></div>
          ))}
        </div>
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
          <TabsList className="grid grid-cols-3 mb-4 bg-white">
            <TabsTrigger value="dashboard" className="rounded-full">Dashboard</TabsTrigger>
            <TabsTrigger value="mi-plan" className="rounded-full">Mi Plan</TabsTrigger>
            <TabsTrigger value="calendario" className="rounded-full">Calendario</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Contenido principal */}
      <div className="px-6 pb-20 overflow-y-auto h-[calc(896px-140px)]">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#573353]">{workoutDay.name}</h2>
          <p className="text-sm text-muted-foreground">{workoutDay.description}</p>

          <div className="flex flex-wrap gap-2 mt-2">
            {workoutDay.muscleGroups.map((group: string) => (
              <Badge key={group} variant="secondary" className="text-xs">
                {group}
              </Badge>
            ))}
          </div>
        </div>

        <Button className="w-full mb-6" onClick={handleStartWorkout}>
          <Play className="h-4 w-4 mr-2" />
          Iniciar Entrenamiento
        </Button>

        <div className="space-y-4">
          {exercises.map(exercise => (
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              availableExercises={mockExercises}
              onStartExercise={handleStartExercise}
              onChangeExercise={handleChangeExercise}
            />
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Información del Entrenamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Duración estimada</p>
                <p className="font-medium">60-75 minutos</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ejercicios</p>
                <p className="font-medium">{exercises.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Series totales</p>
                <p className="font-medium">
                  {exercises.reduce((total, ex) => total + (ex.sets || 0), 0)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Enfoque</p>
                <p className="font-medium">Hipertrofia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 w-[414px] h-[80px] bg-white border-t border-gray-100 flex justify-around items-center py-3 px-2 z-10 shadow-md">
        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => router.push('/dashboard')}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 22V12H15V22M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                stroke="#573353"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-[#573353]/70">Home</span>
        </button>

        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => router.push('/training')}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 20V10M12 20V4M6 20V14"
                stroke="#573353"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-[#573353]/70">Training</span>
        </button>

        <button
          className="flex flex-col items-center relative w-[20%]"
          onClick={() => router.push('/training/log-workout')}
        >
          <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-r from-[#FDA758] to-[#FE9870] flex items-center justify-center absolute -top-[26px] shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="w-7 h-7 mt-8"></div>
          <span className="text-xs font-medium text-[#573353]/70">Log</span>
        </button>

        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => router.push('/training/calendar')}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                stroke="#573353"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
              <path d="M16 2V6M8 2V6M3 10H21M8 14H8.01M12 14H12.01M16 14H16.01M8 18H8.01M12 18H12.01M16 18H16.01"
                stroke="#573353"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-[#573353]/70">Calendar</span>
        </button>

        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => router.push('/profile')}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                stroke="#573353"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-[#573353]/70">Profile</span>
        </button>
      </div>
    </div>
  )
}
