"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, ArrowLeft, Plus, Trash2, Dumbbell } from "lucide-react"
import { saveWorkoutRoutine, getUserRoutineById, getExercises } from "@/lib/training-service"
import { WorkoutRoutine, WorkoutDay, Exercise, ExerciseSet } from "@/lib/types/training"

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres.",
  }),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EditWorkoutDayFormProps {
  routineId: string
  dayId: string
  userId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function EditWorkoutDayForm({ routineId, dayId, userId, onSuccess, onCancel }: EditWorkoutDayFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null)
  const [day, setDay] = useState<WorkoutDay | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("")

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  // Load routine and exercises data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load routine data
        const { data: routineData, error: routineError } = await getUserRoutineById(routineId)
        
        if (routineError || !routineData) {
          toast({
            title: "Error",
            description: "No se pudo cargar la rutina. Por favor, inténtalo de nuevo.",
            variant: "destructive",
          })
          if (onCancel) onCancel()
          return
        }

        setRoutine(routineData)
        
        // Find the day
        const foundDay = routineData.days.find(d => d.id === dayId)
        if (!foundDay) {
          toast({
            title: "Error",
            description: "No se encontró el día de entrenamiento.",
            variant: "destructive",
          })
          if (onCancel) onCancel()
          return
        }

        setDay(foundDay)
        setExercises(foundDay.exercises || [])
        
        // Set form values
        form.reset({
          name: foundDay.name,
          description: foundDay.description || "",
        })

        // Load available exercises
        const { data: exercisesData, error: exercisesError } = await getExercises()
        
        if (exercisesError || !exercisesData) {
          toast({
            title: "Advertencia",
            description: "No se pudieron cargar los ejercicios disponibles.",
            variant: "destructive",
          })
        } else {
          setAvailableExercises(exercisesData)
          if (exercisesData.length > 0) {
            setSelectedExerciseId(exercisesData[0].id)
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        })
        if (onCancel) onCancel()
      } finally {
        setIsLoading(false)
      }
    }

    if (routineId && dayId) {
      loadData()
    }
  }, [routineId, dayId, toast, form, onCancel])

  // Add a new exercise
  const addExercise = () => {
    if (!selectedExerciseId || !availableExercises.length) return
    
    const selectedExercise = availableExercises.find(ex => ex.id === selectedExerciseId)
    if (!selectedExercise) return
    
    const newExerciseSet: ExerciseSet = {
      id: uuidv4(),
      exerciseId: selectedExerciseId,
      sets: 3,
      reps: 10,
      weight: 0,
      rest: 60,
      notes: ""
    }
    
    setExercises([...exercises, newExerciseSet])
  }

  // Remove an exercise
  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId))
  }

  // Update exercise details
  const updateExercise = (id: string, field: keyof ExerciseSet, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ))
  }

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!userId || !routine || !day) {
      toast({
        title: "Error",
        description: "Datos incompletos para guardar el día de entrenamiento",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Update day
      const updatedDay: WorkoutDay = {
        ...day,
        name: values.name,
        description: values.description || "",
        exercises: exercises
      }

      // Update routine with the updated day
      const updatedDays = routine.days.map(d => 
        d.id === dayId ? updatedDay : d
      )

      const updatedRoutine: WorkoutRoutine = {
        ...routine,
        days: updatedDays,
        updatedAt: new Date().toISOString()
      }

      // Save the routine
      const { data, error } = await saveWorkoutRoutine(updatedRoutine)

      if (error) {
        throw error
      }

      // Show success message
      toast({
        title: "Día actualizado",
        description: "El día de entrenamiento se ha actualizado correctamente.",
        variant: "default",
      })

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/training/edit/${routineId}`)
      }
    } catch (error) {
      console.error("Error al actualizar día de entrenamiento:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el día de entrenamiento. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-[#1B237E]">Cargando día de entrenamiento...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#1B237E]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-[#1B237E]">Editar día de entrenamiento</CardTitle>
        <CardDescription>
          Configura los ejercicios para este día de entrenamiento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del día</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Día 1 - Pecho y Espalda" 
                      {...field} 
                      className="border-[#DDDCFE] focus-visible:ring-[#1B237E]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe brevemente este día de entrenamiento..." 
                      {...field} 
                      className="min-h-[80px] border-[#DDDCFE] focus-visible:ring-[#1B237E]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-[#573353]">Ejercicios</h3>
                <div className="flex space-x-2">
                  <Select 
                    value={selectedExerciseId} 
                    onValueChange={setSelectedExerciseId}
                    disabled={availableExercises.length === 0}
                  >
                    <SelectTrigger className="w-[200px] border-[#DDDCFE]">
                      <SelectValue placeholder="Seleccionar ejercicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableExercises.map(exercise => (
                        <SelectItem key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addExercise}
                    disabled={!selectedExerciseId || availableExercises.length === 0}
                    className="border-[#DDDCFE] text-[#1B237E]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir
                  </Button>
                </div>
              </div>

              {exercises.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-[#DDDCFE] rounded-md">
                  <p className="text-gray-500">No hay ejercicios. Añade al menos un ejercicio.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exercises.map((exercise, index) => {
                    const exerciseDetails = availableExercises.find(ex => ex.id === exercise.exerciseId)
                    return (
                      <div key={exercise.id} className="p-4 border border-[#DDDCFE] rounded-md">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <Dumbbell className="h-5 w-5 mr-2 text-[#1B237E]" />
                            <div>
                              <h4 className="font-medium">{exerciseDetails?.name || "Ejercicio desconocido"}</h4>
                              <p className="text-sm text-gray-500">
                                {exerciseDetails?.muscleGroup?.join(", ") || "Sin grupo muscular"}
                              </p>
                            </div>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeExercise(exercise.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="text-sm font-medium">Series</label>
                            <Input 
                              type="number" 
                              value={exercise.sets} 
                              onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value))}
                              min={1}
                              max={10}
                              className="border-[#DDDCFE]"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Repeticiones</label>
                            <Input 
                              type="number" 
                              value={exercise.reps} 
                              onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value))}
                              min={1}
                              max={100}
                              className="border-[#DDDCFE]"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Peso (kg)</label>
                            <Input 
                              type="number" 
                              value={exercise.weight} 
                              onChange={(e) => updateExercise(exercise.id, 'weight', parseFloat(e.target.value))}
                              min={0}
                              step={2.5}
                              className="border-[#DDDCFE]"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Descanso (seg)</label>
                            <Input 
                              type="number" 
                              value={exercise.rest} 
                              onChange={(e) => updateExercise(exercise.id, 'rest', parseInt(e.target.value))}
                              min={0}
                              step={15}
                              className="border-[#DDDCFE]"
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="text-sm font-medium">Notas (opcional)</label>
                          <Input 
                            value={exercise.notes || ""} 
                            onChange={(e) => updateExercise(exercise.id, 'notes', e.target.value)}
                            placeholder="Notas sobre el ejercicio..."
                            className="border-[#DDDCFE]"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onCancel || (() => router.push(`/training/edit/${routineId}`))}
          disabled={isSubmitting}
          className="border-[#DDDCFE]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting || exercises.length === 0}
          className="bg-[#1B237E] hover:bg-[#1B237E]/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
