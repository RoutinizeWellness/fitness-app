"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { useAuth } from "@/lib/auth/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Save, Plus, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { getUserRoutineById, saveWorkoutRoutine } from "@/lib/training-service"
import { v4 as uuidv4 } from "uuid"

// Componente de servidor
export default function AddExercisePageServer({ params }: { params: { id: string, dayId: string } }) {
  // Este componente se ejecuta en el servidor
  // Usar React.use() para desenvolver los parámetros
  const unwrappedParams = use(params);
  const routineId = unwrappedParams.id;
  const dayId = unwrappedParams.dayId;

  // Renderizar el componente cliente pasando los IDs como props
  return <AddExercisePage routineId={routineId} dayId={dayId} />;
}

// Componente principal que recibe los IDs como props
function AddExercisePage({ routineId, dayId }: { routineId: string, dayId: string }) {
  const [routine, setRoutine] = useState<any>(null)
  const [day, setDay] = useState<any>(null)
  const [exercise, setExercise] = useState({
    id: uuidv4(),
    name: "",
    sets: 3,
    reps: "8-10",
    rest: 60,
    weight: "",
    notes: ""
  })
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
        description: "Debes iniciar sesión para añadir ejercicios",
        variant: "destructive"
      })
      router.push("/welcome")
    }
  }, [user, authLoading, router, toast])

  // Cargar la rutina y encontrar el día
  useEffect(() => {
    if (authLoading || !user) return

    const loadRoutineAndDay = async () => {
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

        // Buscar el día
        const foundDay = data.days.find((d: any) => d.id === dayId)

        if (!foundDay) {
          console.error("No se encontró el día con ID:", dayId)
          toast({
            title: "Error",
            description: "No se encontró el día solicitado",
            variant: "destructive"
          })
          return
        }

        setDay(foundDay)
      } catch (error) {
        console.error("Error al cargar la rutina y el día:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el día",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadRoutineAndDay()
  }, [routineId, dayId, toast, user, authLoading])

  // Actualizar un campo del ejercicio
  const updateExerciseField = (field: string, value: any) => {
    setExercise({
      ...exercise,
      [field]: value
    })
  }

  // Guardar ejercicio
  const handleSave = async () => {
    if (!routine || !day || !user) return

    if (!exercise.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del ejercicio es obligatorio",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)

    try {
      // Añadir el ejercicio al día
      const updatedDays = routine.days.map((d: any) => {
        if (d.id === dayId) {
          return {
            ...d,
            exercises: [...d.exercises, exercise]
          }
        }
        return d
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
          description: "No se pudo añadir el ejercicio",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Ejercicio añadido",
        description: "El ejercicio se ha añadido correctamente",
      })

      // Redirigir a la página de edición de la rutina
      setTimeout(() => {
        router.push(`/training/edit/${routineId}`)
      }, 500)
    } catch (error) {
      console.error("Error al añadir el ejercicio:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el ejercicio",
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
          <PulseLoader message="Cargando..." />
        </div>
      </RoutinizeLayout>
    )
  }

  // Si no se encontró el día
  if (!day) {
    return (
      <RoutinizeLayout>
        <div className="container max-w-md mx-auto p-4 pt-20 pb-24">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Día no encontrado</h1>
            <p className="text-gray-500 mb-6">No se pudo encontrar el día solicitado</p>
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
          <div>
            <h1 className="text-2xl font-bold">Añadir Ejercicio</h1>
            <p className="text-gray-500 text-sm">{day.name}</p>
          </div>
        </div>

        <Card className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl mb-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del ejercicio</Label>
              <div className="relative">
                <Input
                  id="name"
                  value={exercise.name}
                  onChange={(e) => updateExerciseField("name", e.target.value)}
                  placeholder="Nombre del ejercicio"
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => {
                    // Aquí iría la funcionalidad para buscar ejercicios
                    toast({
                      title: "Información",
                      description: "Búsqueda de ejercicios en desarrollo",
                    })
                  }}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sets">Series</Label>
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => updateExerciseField("sets", Math.max(1, exercise.sets - 1))}
                >
                  -
                </Button>
                <Input
                  id="sets"
                  type="number"
                  value={exercise.sets}
                  onChange={(e) => updateExerciseField("sets", parseInt(e.target.value) || 1)}
                  min="1"
                  max="20"
                  className="text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => updateExerciseField("sets", Math.min(20, exercise.sets + 1))}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reps">Repeticiones</Label>
              <Input
                id="reps"
                value={exercise.reps}
                onChange={(e) => updateExerciseField("reps", e.target.value)}
                placeholder="Ej: 8-10, 12, AMRAP"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="rest">Descanso (segundos)</Label>
                <span className="text-sm font-medium">{exercise.rest}s</span>
              </div>
              <Slider
                id="rest"
                value={[exercise.rest]}
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
                value={exercise.weight}
                onChange={(e) => updateExerciseField("weight", e.target.value)}
                placeholder="Ej: 70kg, 70% 1RM"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <textarea
                id="notes"
                value={exercise.notes}
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
                <Plus className="mr-2 h-4 w-4" />
                Añadir
              </>
            )}
          </Button>
        </div>
      </div>
    </RoutinizeLayout>
  )
}
