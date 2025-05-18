"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Play, Dumbbell, Clock, RotateCcw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ExerciseCard } from "@/components/training/exercise-card"
import { Exercise } from "@/lib/types/training"

// Datos simulados para los ejercicios
const mockExercises: Exercise[] = [
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

// Datos simulados para todos los ejercicios disponibles (para alternativas)
const allExercises: Exercise[] = [
  ...mockExercises,
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
  },
  {
    id: "ex-8",
    name: "Peso muerto",
    category: "compound",
    muscleGroup: ["Isquiotibiales", "Glúteos", "Espalda baja"],
    equipment: ["barbell"],
    sets: 4,
    repsMin: 6,
    repsMax: 8,
    rest: 120,
    instructions: "Mantén la espalda recta y empuja con los talones al levantar."
  },
  {
    id: "ex-9",
    name: "Peso muerto rumano",
    category: "compound",
    muscleGroup: ["Isquiotibiales", "Glúteos"],
    equipment: ["barbell"],
    sets: 3,
    repsMin: 10,
    repsMax: 12,
    rest: 90,
    instructions: "Mantén las piernas ligeramente flexionadas y baja la barra deslizándola por las piernas."
  },
  {
    id: "ex-10",
    name: "Zancadas",
    category: "compound",
    muscleGroup: ["Cuádriceps", "Glúteos"],
    equipment: ["dumbbell"],
    sets: 3,
    repsMin: 10,
    repsMax: 12,
    rest: 60,
    instructions: "Da un paso adelante y baja hasta que ambas rodillas formen un ángulo de 90 grados."
  },
  {
    id: "ex-11",
    name: "Abductores en máquina",
    category: "isolation",
    muscleGroup: ["Abductores"],
    equipment: ["machine"],
    sets: 3,
    repsMin: 15,
    repsMax: 20,
    rest: 45,
    instructions: "Abre las piernas contra la resistencia de la máquina."
  },
  {
    id: "ex-12",
    name: "Aductores en máquina",
    category: "isolation",
    muscleGroup: ["Aductores"],
    equipment: ["machine"],
    sets: 3,
    repsMin: 15,
    repsMax: 20,
    rest: 45,
    instructions: "Cierra las piernas contra la resistencia de la máquina."
  },
  {
    id: "ex-13",
    name: "Elevación de pantorrillas de pie",
    category: "isolation",
    muscleGroup: ["Pantorrillas"],
    equipment: ["machine"],
    sets: 4,
    repsMin: 15,
    repsMax: 20,
    rest: 45,
    instructions: "Elévate sobre la punta de los pies y contrae las pantorrillas."
  },
  {
    id: "ex-14",
    name: "Elevación de pantorrillas sentado",
    category: "isolation",
    muscleGroup: ["Pantorrillas"],
    equipment: ["machine"],
    sets: 3,
    repsMin: 15,
    repsMax: 20,
    rest: 45,
    instructions: "Con las rodillas a 90 grados, eleva los talones y contrae las pantorrillas."
  }
]

// Datos simulados para los días de entrenamiento
const workoutDays: Record<string, {
  id: string;
  name: string;
  description: string;
  muscleGroups: string[];
}> = {
  "day-1": {
    id: "day-1",
    name: "Día 1: Piernas",
    description: "Entrenamiento enfocado en piernas con énfasis en cuádriceps y glúteos",
    muscleGroups: ["Piernas", "Glúteos"]
  },
  "day-2": {
    id: "day-2",
    name: "Día 2: Pecho y Espalda",
    description: "Entrenamiento de empuje y tracción para el tren superior",
    muscleGroups: ["Pecho", "Espalda"]
  },
  "day-4": {
    id: "day-4",
    name: "Día 4: Hombros y Brazos",
    description: "Entrenamiento de hombros, bíceps y tríceps",
    muscleGroups: ["Hombros", "Brazos"]
  },
  "day-5": {
    id: "day-5",
    name: "Día 5: Piernas",
    description: "Segundo entrenamiento de piernas con énfasis en isquiotibiales y glúteos",
    muscleGroups: ["Piernas"]
  },
  "day-6": {
    id: "day-6",
    name: "Día 6: Pecho y Espalda",
    description: "Segundo entrenamiento de pecho y espalda con variaciones",
    muscleGroups: ["Pecho", "Espalda"]
  }
}

export default function StartWorkoutDayPage({ params }: { params: { dayId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [workoutDay, setWorkoutDay] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

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
        // En un caso real, filtrarías los ejercicios según el día
        setExercises(mockExercises)

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
          ? allExercises.find(newEx => newEx.id === newExerciseId) || ex
          : ex
      )
    )
  }

  // Manejar el inicio del entrenamiento completo
  const handleStartWorkout = () => {
    if (exercises.length > 0) {
      router.push(`/training/exercise/${exercises[0].id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-8">
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
      <div className="container mx-auto py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Entrenamiento no encontrado</h1>
        <p className="mb-4">El día de entrenamiento solicitado no existe.</p>
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
          <h1 className="text-3xl font-bold">{workoutDay.name}</h1>
          <p className="text-muted-foreground">
            {workoutDay.description}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/training")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Button onClick={handleStartWorkout}>
            <Play className="h-4 w-4 mr-2" />
            Iniciar Entrenamiento
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {workoutDay.muscleGroups.map(group => (
          <Badge key={group} variant="secondary" className="text-sm">
            {group}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            availableExercises={allExercises}
            onStartExercise={handleStartExercise}
            onChangeExercise={handleChangeExercise}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Información del Entrenamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Duración estimada</h4>
                <p className="text-lg font-medium">60-75 minutos</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Ejercicios</h4>
                <p className="text-lg font-medium">{exercises.length}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Series totales</h4>
                <p className="text-lg font-medium">
                  {exercises.reduce((total, ex) => total + (ex.sets || 0), 0)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Enfoque</h4>
                <p className="text-lg font-medium">Hipertrofia</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Notas</h4>
              <p className="text-sm">
                Recuerda calentar adecuadamente antes de comenzar. Mantén un RIR (Repeticiones en Reserva) de 1-2 en las series de trabajo. Ajusta los pesos según sea necesario para mantener la técnica correcta.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
