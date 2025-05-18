"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Dumbbell,
  Calendar,
  Clock,
  ChevronRight,
  Edit,
  Trash2,
  Play,
  Plus,
  Info,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { getUserRoutines, deleteWorkoutRoutine } from "@/lib/training-service"
import { WorkoutRoutine } from "@/lib/types/training"
import { CreateWorkoutRoutineForm } from "./create-workout-routine-form"

interface MyPlanSectionProps {
  userId: string
}

export function MyPlanSection({ userId }: MyPlanSectionProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null)

  // Cargar las rutinas del usuario
  useEffect(() => {
    const loadRoutines = async () => {
      if (!userId) return

      setIsLoading(true)

      try {
        const { data, error } = await getUserRoutines(userId)

        if (error) {
          throw error
        }

        if (data) {
          setRoutines(data)
          
          // Establecer la rutina activa
          const activeRoutine = data.find(routine => routine.isActive)
          if (activeRoutine) {
            setActiveRoutineId(activeRoutine.id)
          } else if (data.length > 0) {
            setActiveRoutineId(data[0].id)
          }
        }
      } catch (error) {
        console.error('Error al cargar las rutinas:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar tus rutinas de entrenamiento.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadRoutines()
  }, [userId, toast])

  // Manejar la eliminación de una rutina
  const handleDeleteRoutine = async (routineId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta rutina? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const { error } = await deleteWorkoutRoutine(routineId)

      if (error) {
        throw error
      }

      // Actualizar la lista de rutinas
      setRoutines(routines.filter(routine => routine.id !== routineId))

      toast({
        title: "Rutina eliminada",
        description: "La rutina se ha eliminado correctamente.",
      })

      // Si era la rutina activa, establecer otra como activa
      if (activeRoutineId === routineId) {
        const nextRoutine = routines.find(routine => routine.id !== routineId)
        if (nextRoutine) {
          setActiveRoutineId(nextRoutine.id)
        } else {
          setActiveRoutineId(null)
        }
      }
    } catch (error) {
      console.error('Error al eliminar la rutina:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la rutina. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  // Manejar la creación de una nueva rutina
  const handleCreateRoutineSuccess = (routineId: string) => {
    setShowCreateForm(false)
    
    // Recargar las rutinas
    const loadRoutines = async () => {
      try {
        const { data, error } = await getUserRoutines(userId)

        if (error) {
          throw error
        }

        if (data) {
          setRoutines(data)
          setActiveRoutineId(routineId)
        }
      } catch (error) {
        console.error('Error al recargar las rutinas:', error)
      }
    }

    loadRoutines()
  }

  // Manejar el inicio de un entrenamiento
  const handleStartWorkout = (dayId: string) => {
    router.push(`/training/workout-day/${dayId}`)
  }

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="training-card fade-in">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 rounded-full border-2 border-[#1B237E] border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  // Renderizar formulario de creación
  if (showCreateForm) {
    return (
      <div className="fade-in">
        <CreateWorkoutRoutineForm 
          userId={userId} 
          onSuccess={handleCreateRoutineSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    )
  }

  // Renderizar mensaje si no hay rutinas
  if (routines.length === 0) {
    return (
      <Card className="w-full training-card fade-in">
        <CardHeader>
          <CardTitle className="flex items-center text-[#1B237E]">
            <Dumbbell className="h-5 w-5 mr-2" />
            Mi Plan de Entrenamiento
          </CardTitle>
          <CardDescription>
            No tienes ninguna rutina de entrenamiento.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 rounded-full bg-[#DDDCFE] flex items-center justify-center mb-4">
            <Info className="h-8 w-8 text-[#1B237E]" />
          </div>
          <h3 className="text-xl font-medium mb-2 text-[#573353]">Sin Rutinas</h3>
          <p className="text-center text-[#573353]/70 mb-4">
            Para comenzar, crea una rutina personalizada según tus objetivos y preferencias.
          </p>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="training-button-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Nueva Rutina
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Encontrar la rutina activa
  const activeRoutine = routines.find(routine => routine.id === activeRoutineId) || routines[0]

  return (
    <div className="space-y-4 fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#573353]">Mi Plan de Entrenamiento</h2>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="training-button-primary"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Rutina
        </Button>
      </div>

      {/* Selector de rutinas */}
      {routines.length > 1 && (
        <div className="flex overflow-x-auto pb-2 scrollbar-hide space-x-2">
          {routines.map(routine => (
            <button
              key={routine.id}
              onClick={() => setActiveRoutineId(routine.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                activeRoutineId === routine.id
                  ? "bg-[#1B237E] text-white"
                  : "bg-white border border-[#DDDCFE] text-[#573353] hover:bg-[#DDDCFE]/20"
              }`}
            >
              {routine.name}
            </button>
          ))}
        </div>
      )}

      {/* Detalles de la rutina activa */}
      <Card className="w-full training-card">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center text-[#1B237E]">
                <Dumbbell className="h-5 w-5 mr-2" />
                {activeRoutine.name}
              </CardTitle>
              <CardDescription>
                {activeRoutine.description}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                title="Editar rutina"
                onClick={() => router.push(`/training/edit/${activeRoutine.id}`)}
                className="training-button-outline h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                title="Eliminar rutina"
                onClick={() => handleDeleteRoutine(activeRoutine.id)}
                className="text-[#FF6767] border-[#DDDCFE] hover:bg-red-50 h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="capitalize training-badge training-badge-outline">
              {activeRoutine.level}
            </Badge>
            <Badge variant="outline" className="training-badge training-badge-outline">
              {activeRoutine.frequency}
            </Badge>
            <Badge variant="secondary" className="training-badge training-badge-secondary">
              {activeRoutine.goal}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <h3 className="text-lg font-medium mb-3 text-[#573353]">Días de entrenamiento</h3>
          
          {activeRoutine.days && activeRoutine.days.length > 0 ? (
            <div className="space-y-3">
              {activeRoutine.days.map((day, index) => (
                <div 
                  key={day.id} 
                  className="p-4 border border-[#DDDCFE] rounded-lg bg-white hover:border-[#B1AFE9] transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-[#573353]">{day.name}</h4>
                      <p className="text-sm text-[#573353]/70">
                        {day.exercises.length} ejercicios
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/training/edit/${activeRoutine.id}/day/${day.id}`)}
                        className="training-button-outline"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleStartWorkout(day.id)}
                        className="training-button-primary"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Iniciar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-[#DDDCFE] rounded-lg">
              <p className="text-[#573353]/70">
                No hay días de entrenamiento configurados.
              </p>
              <Button 
                variant="link" 
                onClick={() => router.push(`/training/edit/${activeRoutine.id}`)}
                className="text-[#1B237E]"
              >
                Configurar días
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
