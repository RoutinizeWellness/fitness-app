"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import WorkoutLogForm from "@/components/training/workout-log-form"
import { supabase } from "@/lib/supabase-client"

export default function LogWorkoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [routineData, setRoutineData] = useState<{
    id: string;
    name: string;
    exercises: any[];
  } | null>(null)

  // Obtener ID de rutina de los parámetros de búsqueda
  const routineId = searchParams.get('routineId')

  // Cargar datos de la rutina si se proporciona un ID
  useEffect(() => {
    const loadRoutineData = async () => {
      if (!user || !routineId) {
        setIsLoading(false)
        return
      }

      try {
        // Obtener datos de la rutina
        const { data: routineData, error: routineError } = await supabase
          .from('workout_routines')
          .select('id, name, days')
          .eq('id', routineId)
          .eq('user_id', user.id)
          .single()

        if (routineError) {
          console.error('Error al cargar la rutina:', routineError)
          setIsLoading(false)
          return
        }

        if (routineData) {
          // Extraer ejercicios de la rutina
          // Asumimos que days es un array de objetos con ejercicios
          const allExercises: any[] = []

          if (routineData.days && Array.isArray(routineData.days)) {
            routineData.days.forEach((day: any) => {
              if (day.exercises && Array.isArray(day.exercises)) {
                day.exercises.forEach((exercise: any) => {
                  allExercises.push({
                    id: exercise.id || crypto.randomUUID(),
                    name: exercise.name,
                    muscleGroup: exercise.muscleGroup || exercise.muscle_group || '',
                    sets: exercise.sets || 3,
                    repsMin: exercise.repsMin || exercise.reps_min || 8,
                    repsMax: exercise.repsMax || exercise.reps_max || 12,
                    weight: exercise.weight || 0,
                    rir: exercise.rir || 2
                  })
                })
              }
            })
          }

          setRoutineData({
            id: routineData.id,
            name: routineData.name,
            exercises: allExercises
          })
        }
      } catch (error) {
        console.error('Error al cargar los datos de la rutina:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRoutineData()
  }, [user, routineId])

  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  // Manejar cancelación
  const handleCancel = () => {
    router.back()
  }

  // Manejar éxito
  const handleSuccess = () => {
    router.push("/training/history")
  }

  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Registrar Entrenamiento</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        {user && (
          <WorkoutLogForm
            userId={user.id}
            routineId={routineData?.id}
            routineName={routineData?.name || "Entrenamiento personalizado"}
            initialExercises={routineData?.exercises || []}
            onCancel={handleCancel}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  )
}
