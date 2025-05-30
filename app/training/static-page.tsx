"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dumbbell,
  Calendar,
  PlusCircle,
  Clock,
  Edit,
  Trash2,
  Play,
  Lightbulb,
  Sparkles,
  Info
} from "lucide-react"
import { TrainingDashboard } from "@/components/training/training-dashboard"
import WorkoutCalendar from "@/components/training/workout-calendar"
import { ExecuteWorkout } from "@/components/training/execute-workout"
import { WorkoutRoutine } from "@/lib/types/training"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { useTraining } from "@/lib/contexts/training-context"

// This is a completely static version of the training page without any animations or framer-motion dependencies
export default function StaticTrainingPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { toast } = useToast()
  const router = useRouter()

  // Use our contexts
  const { user } = useAuth()
  const {
    routines,
    logs,
    isLoadingRoutines: isLoading,
    isLoadingLogs,
    refreshRoutines,
    refreshLogs,
    saveRoutine,
    deleteRoutine: deleteWorkoutRoutine
  } = useTraining()

  // Load data when component mounts
  useEffect(() => {
    refreshRoutines()
    refreshLogs()
  }, [refreshRoutines, refreshLogs])

  // Create a new routine - admin only
  const createNewRoutine = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una rutina",
        variant: "destructive"
      })
      return
    }

    // Check if user is admin
    if (user?.email !== "admin@routinize.com") {
      toast({
        title: "Acceso restringido",
        description: "Solo el administrador puede crear rutinas",
        variant: "destructive"
      })
      return
    }

    // Show loading toast
    toast({
      title: "Creando rutina",
      description: "Espera un momento...",
    })

    const newRoutine: WorkoutRoutine = {
      id: uuidv4(),
      userId: user.id,
      name: "Nueva rutina",
      description: "Descripción de la rutina",
      days: [
        {
          id: uuidv4(),
          name: "Día 1",
          exercises: []
        }
      ],
      frequency: "3-4 días por semana",
      goal: "hipertrofia",
      level: "intermedio",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      const { success, error } = await saveRoutine(newRoutine)

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo crear la rutina: " + (error.message || JSON.stringify(error)),
          variant: "destructive"
        })
        return
      }

      if (success) {
        toast({
          title: "Éxito",
          description: "Rutina creada correctamente",
        })

        setTimeout(() => {
          router.push(`/training/edit/${newRoutine.id}`)
        }, 500)
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al crear la rutina",
        variant: "destructive"
      })
    }
  }

  // Delete a routine - admin only
  const handleDeleteRoutine = async (routineId: string) => {
    if (!user) return

    if (user?.email !== "admin@routinize.com") {
      toast({
        title: "Acceso restringido",
        description: "Solo el administrador puede eliminar rutinas",
        variant: "destructive"
      })
      return
    }

    try {
      const { success, error } = await deleteWorkoutRoutine(routineId)

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la rutina",
          variant: "destructive"
        })
        return
      }

      if (success) {
        toast({
          title: "Éxito",
          description: "Rutina eliminada correctamente",
        })
      }
    } catch (error) {
      console.error("Error al eliminar rutina:", error)
    }
  }

  // Start a workout
  const startWorkout = (routineId: string) => {
    try {
      const url = `/training/execute-workout?routineId=${routineId}`;
      router.push(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar el entrenamiento. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  }

  // Edit a routine - admin only
  const editRoutine = (routineId: string) => {
    if (!user || user?.email !== "admin@routinize.com") {
      toast({
        title: "Acceso restringido",
        description: "Solo el administrador puede editar rutinas",
        variant: "destructive"
      })
      return
    }

    router.push(`/training/edit/${routineId}`)
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="execute">Ejecutar</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div>
            {user && <TrainingDashboard userId={user.id} />}
          </div>
        </TabsContent>

        <TabsContent value="plan">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Mi Plan de Entrenamiento</h2>
              {user?.email === "admin@routinize.com" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createNewRoutine}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nueva rutina
                </Button>
              )}
            </div>

            {/* Render routines */}
            {isLoading ? (
              <div className="text-center py-8">
                <p>Cargando rutinas...</p>
              </div>
            ) : routines.length === 0 ? (
              <div className="text-center py-8">
                <p>No tienes rutinas de entrenamiento</p>
                {user?.email === "admin@routinize.com" && (
                  <Button onClick={createNewRoutine} className="mt-4">
                    Crear rutina
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {routines.map(routine => (
                  <div
                    key={routine.id}
                    className="border rounded-lg p-5 hover:shadow-md transition-all duration-300 bg-white relative overflow-hidden"
                    style={{
                      borderLeftWidth: '4px',
                      borderLeftColor:
                        routine.goal === 'hipertrofia' ? '#a855f7' :
                        routine.goal === 'fuerza' ? '#3b82f6' :
                        routine.goal === 'resistencia' ? '#22c55e' :
                        '#6366f1'
                    }}
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold">{routine.name}</h3>
                        <p className="text-sm text-gray-600">{routine.description}</p>
                        <div className="flex mt-2">
                          <Badge>{routine.goal}</Badge>
                          <Badge className="ml-2">{routine.frequency}</Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => startWorkout(routine.id)}>
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar
                        </Button>
                        {user?.email === "admin@routinize.com" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => editRoutine(routine.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteRoutine(routine.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator className="my-8" />
            <WorkoutCalendar />
          </div>
        </TabsContent>

        <TabsContent value="execute">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Ejecutar Entrenamiento</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/training/execute-workout')}
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar rutina
              </Button>
            </div>
            {user && <ExecuteWorkout userId={user.id} setActiveTab={setActiveTab} />}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
