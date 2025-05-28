"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { AdvancedBodybuildingRoutines } from "@/components/training/AdvancedBodybuildingRoutines"
import { Exercise, WorkoutRoutine } from "@/lib/types/training"
import { searchExercises } from "@/lib/supabase-training"
import { toast } from "@/components/ui/use-toast"
import { Button3D } from "@/components/ui/button-3d"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function AdvancedRoutinesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Cargar ejercicios disponibles
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const { data, error } = await searchExercises({
          limit: 1000 // Cargar un gran número de ejercicios
        })

        if (error) throw error

        if (data) {
          setExercises(data)
        }
      } catch (error) {
        console.error("Error al cargar ejercicios:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los ejercicios",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadExercises()
  }, [])

  // Manejar guardado de rutina
  const handleSaveRoutine = (routine: WorkoutRoutine) => {
    // Aquí se podría hacer algo adicional con la rutina guardada
    router.push("/training")
  }

  // Manejar cancelación
  const handleCancel = () => {
    router.push("/training")
  }

  if (!user) {
    return (
      <RoutinizeLayout activeTab="training" title="Rutinas Avanzadas">
        <div className="container mx-auto p-4">
          <div className="flex items-center mb-6">
            <Button3D
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button3D>
            <h1 className="text-2xl font-bold">Rutinas Avanzadas de Culturismo</h1>
          </div>
          <p>Debes iniciar sesión para acceder a esta funcionalidad.</p>
        </div>
      </RoutinizeLayout>
    )
  }

  if (isLoading) {
    return (
      <RoutinizeLayout activeTab="training" title="Rutinas Avanzadas">
        <div className="container mx-auto p-4">
          <div className="flex items-center mb-6">
            <Button3D
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button3D>
            <h1 className="text-2xl font-bold">Rutinas Avanzadas de Culturismo</h1>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-medium mb-2">Cargando ejercicios...</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Estamos preparando la biblioteca de ejercicios para crear rutinas avanzadas.
            </p>
          </div>
        </div>
      </RoutinizeLayout>
    )
  }

  return (
    <RoutinizeLayout activeTab="training" title="Rutinas Avanzadas">
      <AdvancedBodybuildingRoutines
        userId={user.id}
        availableExercises={exercises}
        onSave={handleSaveRoutine}
        onCancel={handleCancel}
      />
    </RoutinizeLayout>
  )
}
