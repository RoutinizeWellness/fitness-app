"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { getUserRoutineById, saveWorkoutRoutine } from "@/lib/training-service"

// Componente de servidor
export default function EditExercisePageServer({ params }: { params: { id: string, exerciseId: string } }) {
  // Este componente se ejecuta en el servidor
  // Usar React.use() para desenvolver los parámetros
  const unwrappedParams = use(params);
  const routineId = unwrappedParams.id;
  const exerciseId = unwrappedParams.exerciseId;

  // Renderizar el componente cliente pasando los IDs como props
  return <EditExercisePage routineId={routineId} exerciseId={exerciseId} />;
}

// Componente principal que recibe los IDs como props
function EditExercisePage({ routineId, exerciseId }: { routineId: string, exerciseId: string }) {
  const [routine, setRoutine] = useState<any>(null)
  const [exercise, setExercise] = useState<any>(null)
  const [dayId, setDayId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()

  // Redirigir si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Acceso denegado",
        description: "Debes iniciar sesión para editar ejercicios",
        variant: "destructive"
      })
      router.push("/welcome")
    }
  }, [user, authLoading, router, toast])

  // Cargar la rutina y encontrar el ejercicio
  useEffect(() => {
    if (authLoading || !user) return

    const loadRoutineAndExercise = async () => {
      try {
        console.log("Cargando rutina con ID:", routineId)

        // Obtener la rutina
        const { data, error } = await getUserRoutineById(routineId)

        if (error) {
          console.error("Error al obtener la rutina:", error)
          toast({
            title: "Error",
            description: "No se pudo obtener la rutina",
            variant: "destructive"
          })
          return
        }

        if (!data) {
          console.error("No se encontró la rutina con ID:", routineId)
          toast({
            title: "Error",
            description: "No se encontró la rutina solicitada",
            variant: "destructive"
          })
          return
        }

        setRoutine(data)

        // Buscar el ejercicio en todos los días
        let foundExercise = null
        let foundDayId = ""

        for (const day of data.days) {
          const ex = day.exercises.find((e: any) => e.id === exerciseId)
          if (ex) {
            foundExercise = ex
            foundDayId = day.id
            break
          }
        }

        if (!foundExercise) {
          console.error("No se encontró el ejercicio con ID:", exerciseId)
          toast({
            title: "Error",
            description: "No se encontró el ejercicio solicitado",
            variant: "destructive"
          })
          return
        }

        setExercise(foundExercise)
        setDayId(foundDayId)
      } catch (error) {
        console.error("Error al cargar la rutina y el ejercicio:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el ejercicio",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadRoutineAndExercise()
  }, [routineId, exerciseId, toast, user, authLoading])

  // Actualizar un campo del ejercicio
  const updateExerciseField = (field: string, value: any) => {
    if (!exercise) return

    setExercise({
      ...exercise,
      [field]: value
    })
  }

  // Guardar cambios
  const handleSave = async () => {
    if (!routine || !exercise || !user) return

    setIsSaving(true)

    try {
      // Encontrar el día y actualizar el ejercicio
      const updatedDays = routine.days.map((day: any) => {
        if (day.id === dayId) {
          return {
            ...day,
            exercises: day.exercises.map((ex: any) =>
              ex.id === exercise.id ? exercise : ex
            )
          }
        }
        return day
      })

      // Actualizar la rutina
      const updatedRoutine = {
        ...routine,
        days: updatedDays,
        userId: user.id,
        updatedAt: new Date().toISOString()
      }

      // Guardar en Supabase
      const { error } = await saveWorkoutRoutine(updatedRoutine)

      if (error) {
        console.error("Error al guardar el ejercicio:", error)
        toast({
          title: "Error",
          description: "No se pudieron guardar los cambios",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Ejercicio guardado",
        description: "Los cambios se han guardado correctamente",
      })

      // Redirigir a la página de edición de la rutina
      setTimeout(() => {
        router.push(`/training/edit/${routineId}`)
      }, 500)
    } catch (error) {
      console.error("Error al guardar el ejercicio:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Eliminar ejercicio
  const handleDelete = async () => {
    if (!routine || !exercise || !user) return

    if (!confirm("¿Estás seguro de que deseas eliminar este ejercicio?")) {
      return
    }

    setIsSaving(true)

    try {
      // Encontrar el día y eliminar el ejercicio
      const updatedDays = routine.days.map((day: any) => {
        if (day.id === dayId) {
          return {
            ...day,
            exercises: day.exercises.filter((ex: any) => ex.id !== exercise.id)
          }
        }
        return day
      })

      // Actualizar la rutina
      const updatedRoutine = {
        ...routine,
        days: updatedDays,
        userId: user.id,
        updatedAt: new Date().toISOString()
      }

      // Guardar en Supabase
      const { error } = await saveWorkoutRoutine(updatedRoutine)

      if (error) {
        console.error("Error al eliminar el ejercicio:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el ejercicio",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Ejercicio eliminado",
        description: "El ejercicio se ha eliminado correctamente",
      })

      // Redirigir a la página de edición de la rutina
      router.push(`/training/edit/${routineId}`)
    } catch (error) {
      console.error("Error al eliminar el ejercicio:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el ejercicio",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Mostrar pantalla de carga
  if (isLoading) {
    return (
      <RoutinizeLayout>
        <div className="container max-w-md mx-auto p-4 pt-20 pb-24 flex items-center justify-center min-h-screen">
          <PulseLoader message="Cargando ejercicio..." />
        </div>
      </RoutinizeLayout>
    )
  }

  // Si no se encontró el ejercicio
  if (!exercise) {
    return (
      <RoutinizeLayout>
        <div className="container max-w-md mx-auto p-4 pt-20 pb-24">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Ejercicio no encontrado</h1>
            <p className="text-gray-500 mb-6">No se pudo encontrar el ejercicio solicitado</p>
            <Button onClick={() => router.push(`/training/edit/${routineId}`)}>
              Volver a la rutina
            </Button>
          </div>
        </div>
      </RoutinizeLayout>
    )
  }

  return (
    <RoutinizeLayout>
      <div className="container max-w-md mx-auto p-4 pt-20 pb-24">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => router.push(`/training/edit/${routineId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Editar Ejercicio</h1>
        </div>

        <Card className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl mb-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del ejercicio</Label>
              <Input
                id="name"
                value={exercise.name}
                onChange={(e) => updateExerciseField("name", e.target.value)}
                placeholder="Nombre del ejercicio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sets">Series</Label>
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => updateExerciseField("sets", Math.max(1, (exercise.sets || 1) - 1))}
                >
                  -
                </Button>
                <Input
                  id="sets"
                  type="number"
                  value={exercise.sets || 1}
                  onChange={(e) => updateExerciseField("sets", parseInt(e.target.value) || 1)}
                  min="1"
                  max="20"
                  className="text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => updateExerciseField("sets", Math.min(20, (exercise.sets || 1) + 1))}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reps">Repeticiones</Label>
              <Input
                id="reps"
                value={exercise.reps || ""}
                onChange={(e) => updateExerciseField("reps", e.target.value)}
                placeholder="Ej: 8-10, 12, AMRAP"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="rest">Descanso (segundos)</Label>
                <span className="text-sm font-medium">{exercise.rest || 60}s</span>
              </div>
              <Slider
                id="rest"
                value={[exercise.rest || 60]}
                min={15}
                max={300}
                step={15}
                onValueChange={(value) => updateExerciseField("rest", value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Peso (opcional)</Label>
              <Input
                id="weight"
                value={exercise.weight || ""}
                onChange={(e) => updateExerciseField("weight", e.target.value)}
                placeholder="Ej: 70kg, 70% 1RM"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <textarea
                id="notes"
                value={exercise.notes || ""}
                onChange={(e) => updateExerciseField("notes", e.target.value)}
                className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent"
                placeholder="Añade notas sobre este ejercicio..."
              />
            </div>
          </div>
        </Card>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push(`/training/edit/${routineId}`)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="w-12"
            onClick={handleDelete}
            disabled={isSaving}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </div>
    </RoutinizeLayout>
  )
}
