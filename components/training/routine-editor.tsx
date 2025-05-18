"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Dumbbell,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  MoveUp,
  MoveDown,
  Copy,
  Edit,
  AlertCircle
} from "lucide-react"
import { WorkoutRoutine, WorkoutDay, saveWorkoutRoutine, getWorkoutRoutineById } from "@/lib/training-service"
import { v4 as uuidv4 } from "uuid"
import { useRouter } from "next/navigation"

interface RoutineEditorProps {
  routineId?: string
  userId: string
}

export default function RoutineEditor({ routineId, userId }: RoutineEditorProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeDay, setActiveDay] = useState<string | null>(null)
  
  // Estado para la rutina
  const [routine, setRoutine] = useState<WorkoutRoutine>({
    id: routineId || uuidv4(),
    userId: userId,
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
  })

  // Cargar rutina existente si se proporciona un ID
  useEffect(() => {
    const loadRoutine = async () => {
      if (!routineId) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await getWorkoutRoutineById(routineId)

        if (error) {
          throw error
        }

        if (data) {
          setRoutine(data)
          
          // Establecer el primer día como activo por defecto
          if (data.days && data.days.length > 0) {
            setActiveDay(data.days[0].id)
          }
        }
      } catch (error) {
        console.error("Error al cargar la rutina:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la rutina de entrenamiento",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadRoutine()
  }, [routineId, toast])

  // Establecer el primer día como activo cuando se crea una nueva rutina
  useEffect(() => {
    if (!isLoading && !activeDay && routine.days.length > 0) {
      setActiveDay(routine.days[0].id)
    }
  }, [isLoading, activeDay, routine.days])

  // Manejar cambios en los campos de la rutina
  const handleRoutineChange = (field: keyof WorkoutRoutine, value: any) => {
    setRoutine(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }))
  }

  // Añadir un nuevo día
  const addDay = () => {
    const newDay: WorkoutDay = {
      id: uuidv4(),
      name: `Día ${routine.days.length + 1}`,
      exercises: []
    }

    setRoutine(prev => ({
      ...prev,
      days: [...prev.days, newDay],
      updatedAt: new Date().toISOString()
    }))

    // Establecer el nuevo día como activo
    setActiveDay(newDay.id)
  }

  // Eliminar un día
  const removeDay = (dayId: string) => {
    if (routine.days.length <= 1) {
      toast({
        title: "Error",
        description: "La rutina debe tener al menos un día",
        variant: "destructive"
      })
      return
    }

    setRoutine(prev => {
      const updatedDays = prev.days.filter(day => day.id !== dayId)
      
      // Si el día activo es el que se está eliminando, establecer otro día como activo
      if (activeDay === dayId && updatedDays.length > 0) {
        setActiveDay(updatedDays[0].id)
      }
      
      return {
        ...prev,
        days: updatedDays,
        updatedAt: new Date().toISOString()
      }
    })
  }

  // Manejar cambios en los campos de un día
  const handleDayChange = (dayId: string, field: keyof WorkoutDay, value: any) => {
    setRoutine(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId 
          ? { ...day, [field]: value } 
          : day
      ),
      updatedAt: new Date().toISOString()
    }))
  }

  // Añadir un nuevo ejercicio a un día
  const addExercise = (dayId: string) => {
    const newExercise = {
      id: uuidv4(),
      name: "Nuevo ejercicio",
      sets: 3,
      reps: 10,
      weight: 0,
      notes: ""
    }

    setRoutine(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId 
          ? { ...day, exercises: [...day.exercises, newExercise] } 
          : day
      ),
      updatedAt: new Date().toISOString()
    }))
  }

  // Eliminar un ejercicio de un día
  const removeExercise = (dayId: string, exerciseId: string) => {
    setRoutine(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId 
          ? { ...day, exercises: day.exercises.filter(ex => ex.id !== exerciseId) } 
          : day
      ),
      updatedAt: new Date().toISOString()
    }))
  }

  // Manejar cambios en los campos de un ejercicio
  const handleExerciseChange = (dayId: string, exerciseId: string, field: string, value: any) => {
    setRoutine(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId 
          ? { 
              ...day, 
              exercises: day.exercises.map(ex => 
                ex.id === exerciseId 
                  ? { ...ex, [field]: value } 
                  : ex
              ) 
            } 
          : day
      ),
      updatedAt: new Date().toISOString()
    }))
  }

  // Mover un ejercicio hacia arriba
  const moveExerciseUp = (dayId: string, exerciseId: string) => {
    setRoutine(prev => {
      const day = prev.days.find(d => d.id === dayId)
      if (!day) return prev

      const exercises = [...day.exercises]
      const index = exercises.findIndex(ex => ex.id === exerciseId)
      if (index <= 0) return prev

      // Intercambiar posiciones
      [exercises[index - 1], exercises[index]] = [exercises[index], exercises[index - 1]]

      return {
        ...prev,
        days: prev.days.map(d => 
          d.id === dayId 
            ? { ...d, exercises } 
            : d
        ),
        updatedAt: new Date().toISOString()
      }
    })
  }

  // Mover un ejercicio hacia abajo
  const moveExerciseDown = (dayId: string, exerciseId: string) => {
    setRoutine(prev => {
      const day = prev.days.find(d => d.id === dayId)
      if (!day) return prev

      const exercises = [...day.exercises]
      const index = exercises.findIndex(ex => ex.id === exerciseId)
      if (index === -1 || index >= exercises.length - 1) return prev

      // Intercambiar posiciones
      [exercises[index], exercises[index + 1]] = [exercises[index + 1], exercises[index]]

      return {
        ...prev,
        days: prev.days.map(d => 
          d.id === dayId 
            ? { ...d, exercises } 
            : d
        ),
        updatedAt: new Date().toISOString()
      }
    })
  }

  // Duplicar un ejercicio
  const duplicateExercise = (dayId: string, exerciseId: string) => {
    setRoutine(prev => {
      const day = prev.days.find(d => d.id === dayId)
      if (!day) return prev

      const exercise = day.exercises.find(ex => ex.id === exerciseId)
      if (!exercise) return prev

      const newExercise = {
        ...exercise,
        id: uuidv4(),
        name: `${exercise.name} (copia)`
      }

      return {
        ...prev,
        days: prev.days.map(d => 
          d.id === dayId 
            ? { ...d, exercises: [...d.exercises, newExercise] } 
            : d
        ),
        updatedAt: new Date().toISOString()
      }
    })
  }

  // Guardar la rutina
  const saveRoutine = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para guardar la rutina",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)

    try {
      const { data, error } = await saveWorkoutRoutine(routine)

      if (error) {
        throw error
      }

      toast({
        title: "Éxito",
        description: "Rutina guardada correctamente"
      })

      // Redirigir a la página de la rutina
      router.push(`/training/routine/${routine.id}`)
    } catch (error) {
      console.error("Error al guardar la rutina:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la rutina",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Encontrar el día activo
  const currentDay = routine.days.find(day => day.id === activeDay) || routine.days[0]

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <Card className="w-full bg-white rounded-3xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Input
              value={routine.name}
              onChange={(e) => handleRoutineChange("name", e.target.value)}
              className="text-xl font-bold border-none focus-visible:ring-0 px-0 text-[#573353]"
              placeholder="Nombre de la rutina"
            />
            <Textarea
              value={routine.description}
              onChange={(e) => handleRoutineChange("description", e.target.value)}
              className="mt-1 resize-none border-none focus-visible:ring-0 px-0 text-[#573353]/70"
              placeholder="Descripción de la rutina"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm text-[#573353]/70 mb-1 block">Nivel</label>
            <Select
              value={routine.level}
              onValueChange={(value) => handleRoutineChange("level", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="principiante">Principiante</SelectItem>
                <SelectItem value="intermedio">Intermedio</SelectItem>
                <SelectItem value="avanzado">Avanzado</SelectItem>
                <SelectItem value="experto">Experto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-[#573353]/70 mb-1 block">Objetivo</label>
            <Select
              value={routine.goal}
              onValueChange={(value) => handleRoutineChange("goal", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                <SelectItem value="fuerza">Fuerza</SelectItem>
                <SelectItem value="resistencia">Resistencia</SelectItem>
                <SelectItem value="pérdida de grasa">Pérdida de grasa</SelectItem>
                <SelectItem value="tonificación">Tonificación</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-[#573353]/70 mb-1 block">Frecuencia</label>
            <Input
              value={routine.frequency}
              onChange={(e) => handleRoutineChange("frequency", e.target.value)}
              className="w-full"
              placeholder="Ej: 3-4 días por semana"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeDay || ""} onValueChange={setActiveDay} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="flex overflow-x-auto pb-2">
              {routine.days.map((day) => (
                <TabsTrigger 
                  key={day.id} 
                  value={day.id}
                  className="rounded-full data-[state=active]:bg-[#FDA758] data-[state=active]:text-white"
                >
                  {day.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addDay}
              className="rounded-full hover:bg-[#FDA758]/10 border-[#FDA758]/20"
            >
              <Plus className="h-4 w-4 mr-2 text-[#FDA758]" />
              Añadir día
            </Button>
          </div>

          {routine.days.map((day) => (
            <TabsContent key={day.id} value={day.id} className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <Input
                    value={day.name}
                    onChange={(e) => handleDayChange(day.id, "name", e.target.value)}
                    className="text-lg font-medium border-none focus-visible:ring-0 px-0 text-[#573353]"
                    placeholder="Nombre del día"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removeDay(day.id)}
                  className="rounded-full hover:bg-red-50 border-red-200 text-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar día
                </Button>
              </div>

              <div className="space-y-4">
                {day.exercises.length === 0 ? (
                  <div className="text-center py-8 bg-[#F9F9F9] rounded-lg">
                    <Dumbbell className="h-12 w-12 mx-auto text-[#573353]/30 mb-2" />
                    <p className="text-[#573353]/70">No hay ejercicios en este día</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addExercise(day.id)}
                      className="mt-4 rounded-full hover:bg-[#FDA758]/10 border-[#FDA758]/20"
                    >
                      <Plus className="h-4 w-4 mr-2 text-[#FDA758]" />
                      Añadir ejercicio
                    </Button>
                  </div>
                ) : (
                  <>
                    {day.exercises.map((exercise, index) => (
                      <div 
                        key={exercise.id} 
                        className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <Input
                            value={exercise.name}
                            onChange={(e) => handleExerciseChange(day.id, exercise.id, "name", e.target.value)}
                            className="font-medium border-none focus-visible:ring-0 px-0 text-[#573353] w-full max-w-[70%]"
                            placeholder="Nombre del ejercicio"
                          />
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => moveExerciseUp(day.id, exercise.id)}
                              disabled={index === 0}
                              className="h-8 w-8 rounded-full"
                            >
                              <MoveUp className="h-4 w-4 text-[#573353]/70" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => moveExerciseDown(day.id, exercise.id)}
                              disabled={index === day.exercises.length - 1}
                              className="h-8 w-8 rounded-full"
                            >
                              <MoveDown className="h-4 w-4 text-[#573353]/70" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => duplicateExercise(day.id, exercise.id)}
                              className="h-8 w-8 rounded-full"
                            >
                              <Copy className="h-4 w-4 text-[#573353]/70" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeExercise(day.id, exercise.id)}
                              className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <label className="text-xs text-[#573353]/70 mb-1 block">Series</label>
                            <Input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => handleExerciseChange(day.id, exercise.id, "sets", parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-[#573353]/70 mb-1 block">Repeticiones</label>
                            <Input
                              type="number"
                              value={exercise.reps}
                              onChange={(e) => handleExerciseChange(day.id, exercise.id, "reps", parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-[#573353]/70 mb-1 block">Peso (kg)</label>
                            <Input
                              type="number"
                              value={exercise.weight}
                              onChange={(e) => handleExerciseChange(day.id, exercise.id, "weight", parseFloat(e.target.value))}
                              className="w-full"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="text-xs text-[#573353]/70 mb-1 block">Notas</label>
                          <Textarea
                            value={exercise.notes || ""}
                            onChange={(e) => handleExerciseChange(day.id, exercise.id, "notes", e.target.value)}
                            className="w-full resize-none"
                            placeholder="Notas adicionales sobre el ejercicio"
                          />
                        </div>
                      </div>
                    ))}

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addExercise(day.id)}
                      className="w-full mt-2 rounded-full hover:bg-[#FDA758]/10 border-[#FDA758]/20"
                    >
                      <Plus className="h-4 w-4 mr-2 text-[#FDA758]" />
                      Añadir ejercicio
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Button 
          onClick={saveRoutine}
          disabled={isSaving}
          className="rounded-full bg-[#FDA758] hover:bg-[#FDA758]/90"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Guardando..." : "Guardar rutina"}
        </Button>
      </CardFooter>
    </Card>
  )
}
