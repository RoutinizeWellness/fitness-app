"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Save, Edit } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { WorkoutLogEditor } from "@/components/training/workout-log-editor"
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

// Datos simulados para el registro de entrenamiento
const mockWorkoutLog = {
  id: "log-1",
  date: new Date(),
  duration: 60,
  muscleGroups: 3,
  performance: 4,
  fatigue: 7,
  notes: "Entrenamiento de prueba",
  muscleGroupFatigue: [
    {
      group: "Pecho",
      level: 8,
      status: "Alta" as const
    },
    {
      group: "Espalda",
      level: 6,
      status: "Moderada" as const
    },
    {
      group: "Hombros",
      level: 7,
      status: "Moderada" as const
    }
  ],
  exercises: ["ex-1", "ex-2", "ex-3", "ex-4", "ex-5"]
}

export default function WorkoutLogPage({ params }: { params: { logId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [workoutLog, setWorkoutLog] = useState<any>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Simular carga de datos
    const loadWorkoutLogData = async () => {
      setIsLoading(true)
      try {
        // En un entorno real, aquí cargaríamos los datos de Supabase
        // Para este ejemplo, usamos datos simulados

        setWorkoutLog(mockWorkoutLog)

        // Filtrar ejercicios para este registro
        const logExercises = mockExercises.filter(ex =>
          mockWorkoutLog.exercises.includes(ex.id)
        )
        setExercises(logExercises)

      } catch (error) {
        console.error("Error al cargar los datos del registro:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del registro de entrenamiento.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkoutLogData()
  }, [params.logId, toast])

  // Manejar el cambio de ejercicio por una alternativa
  const handleChangeExercise = (oldExerciseId: string, newExerciseId: string) => {
    // Actualizar la lista de ejercicios
    setExercises(prevExercises =>
      prevExercises.map(ex =>
        ex.id === oldExerciseId
          ? mockExercises.find(newEx => newEx.id === newExerciseId) || ex
          : ex
      )
    )

    // Actualizar el registro de entrenamiento
    setWorkoutLog(prev => ({
      ...prev,
      exercises: prev.exercises.map((id: string) =>
        id === oldExerciseId ? newExerciseId : id
      )
    }))
  }

  // Guardar cambios en el registro
  const saveWorkoutLog = (updatedLog: any) => {
    // En un entorno real, aquí enviaríamos los datos a Supabase
    setWorkoutLog(updatedLog)
    setIsEditing(false)

    toast({
      title: "Registro guardado",
      description: "Los cambios han sido guardados correctamente",
    })
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

  if (!workoutLog) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Registro no encontrado</h1>
        <p className="mb-4">El registro de entrenamiento solicitado no existe.</p>
        <Button onClick={() => router.push("/training")}>
          Volver al inicio
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => router.push("/training")} className="mr-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Registro de Entrenamiento</h1>
      </div>

      <WorkoutLogEditor
        workoutLog={workoutLog}
        onSave={saveWorkoutLog}
        onCancel={() => setIsEditing(false)}
        isEditing={isEditing}
      />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Ejercicios realizados</h2>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? "Cancelar edición" : "Editar ejercicios"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exercises.map((exercise, index) => (
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              availableExercises={mockExercises}
              onChangeExercise={handleChangeExercise}
              showControls={isEditing}
            />
          ))}
        </div>

        {isEditing && (
          <div className="flex justify-end mt-4">
            <Button onClick={() => {
              // Guardar cambios en los ejercicios
              toast({
                title: "Ejercicios actualizados",
                description: "Los cambios en los ejercicios han sido guardados",
              })
              setIsEditing(false)
            }}>
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
