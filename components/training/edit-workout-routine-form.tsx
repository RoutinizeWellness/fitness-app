"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
import { Loader2, Save, ArrowLeft, Plus, Trash2 } from "lucide-react"
import { saveWorkoutRoutine, getUserRoutineById } from "@/lib/training-service"
import { WorkoutRoutine, WorkoutDay } from "@/lib/types/training"
import { v4 as uuidv4 } from "uuid"

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres.",
  }),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
  level: z.enum(["principiante", "intermedio", "avanzado"]),
  goal: z.enum(["hipertrofia", "fuerza", "resistencia", "general"]),
  frequency: z.string().min(3, {
    message: "Debes especificar la frecuencia de entrenamiento.",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface EditWorkoutRoutineFormProps {
  routineId: string
  userId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function EditWorkoutRoutineForm({ routineId, userId, onSuccess, onCancel }: EditWorkoutRoutineFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null)
  const [days, setDays] = useState<WorkoutDay[]>([])

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      level: "intermedio",
      goal: "general",
      frequency: "3-4 días por semana",
    },
  })

  // Load routine data
  useEffect(() => {
    const loadRoutine = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await getUserRoutineById(routineId)
        
        if (error || !data) {
          toast({
            title: "Error",
            description: "No se pudo cargar la rutina. Por favor, inténtalo de nuevo.",
            variant: "destructive",
          })
          if (onCancel) onCancel()
          return
        }

        setRoutine(data)
        setDays(data.days || [])
        
        // Set form values
        form.reset({
          name: data.name,
          description: data.description || "",
          level: (data.level as any) || "intermedio",
          goal: (data.goal as any) || "general",
          frequency: data.frequency || "3-4 días por semana",
        })
      } catch (error) {
        console.error("Error al cargar la rutina:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la rutina. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        })
        if (onCancel) onCancel()
      } finally {
        setIsLoading(false)
      }
    }

    if (routineId) {
      loadRoutine()
    }
  }, [routineId, toast, form, onCancel])

  // Add a new day
  const addDay = () => {
    const newDay: WorkoutDay = {
      id: uuidv4(),
      name: `Día ${days.length + 1}`,
      exercises: []
    }
    setDays([...days, newDay])
  }

  // Remove a day
  const removeDay = (dayId: string) => {
    setDays(days.filter(day => day.id !== dayId))
  }

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!userId || !routine) {
      toast({
        title: "Error",
        description: "Datos incompletos para guardar la rutina",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Update routine object
      const updatedRoutine: WorkoutRoutine = {
        ...routine,
        name: values.name,
        description: values.description,
        level: values.level,
        goal: values.goal,
        frequency: values.frequency,
        days: days,
        updatedAt: new Date().toISOString()
      }

      // Save the routine
      const { data, error } = await saveWorkoutRoutine(updatedRoutine)

      if (error) {
        throw error
      }

      // Show success message
      toast({
        title: "Rutina actualizada",
        description: "La rutina se ha actualizado correctamente.",
        variant: "default",
      })

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error al actualizar rutina:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la rutina. Por favor, inténtalo de nuevo.",
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
          <CardTitle className="text-[#1B237E]">Cargando rutina...</CardTitle>
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
        <CardTitle className="text-[#1B237E]">Editar rutina de entrenamiento</CardTitle>
        <CardDescription>
          Modifica los detalles de tu rutina de entrenamiento.
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
                  <FormLabel>Nombre de la rutina</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Rutina de hipertrofia 4 días" 
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
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe brevemente el objetivo y estructura de la rutina..." 
                      {...field} 
                      className="min-h-[100px] border-[#DDDCFE] focus-visible:ring-[#1B237E]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-[#DDDCFE] focus:ring-[#1B237E]">
                          <SelectValue placeholder="Selecciona un nivel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="principiante">Principiante</SelectItem>
                        <SelectItem value="intermedio">Intermedio</SelectItem>
                        <SelectItem value="avanzado">Avanzado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-[#DDDCFE] focus:ring-[#1B237E]">
                          <SelectValue placeholder="Selecciona un objetivo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                        <SelectItem value="fuerza">Fuerza</SelectItem>
                        <SelectItem value="resistencia">Resistencia</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frecuencia</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-[#DDDCFE] focus:ring-[#1B237E]">
                          <SelectValue placeholder="Selecciona la frecuencia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2-3 días por semana">2-3 días por semana</SelectItem>
                        <SelectItem value="3-4 días por semana">3-4 días por semana</SelectItem>
                        <SelectItem value="4-5 días por semana">4-5 días por semana</SelectItem>
                        <SelectItem value="5-6 días por semana">5-6 días por semana</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-[#573353]">Días de entrenamiento</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addDay}
                  className="border-[#DDDCFE] text-[#1B237E]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir día
                </Button>
              </div>

              {days.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-[#DDDCFE] rounded-md">
                  <p className="text-gray-500">No hay días de entrenamiento. Añade al menos un día.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {days.map((day, index) => (
                    <div key={day.id} className="flex items-center justify-between p-3 border border-[#DDDCFE] rounded-md">
                      <div>
                        <p className="font-medium">{day.name}</p>
                        <p className="text-sm text-gray-500">{day.exercises.length} ejercicios</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/training/edit/${routineId}/day/${day.id}`)}
                          className="border-[#DDDCFE] text-[#1B237E]"
                        >
                          Editar
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeDay(day.id)}
                          className="border-[#DDDCFE] text-red-500"
                          disabled={days.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-[#DDDCFE]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting || days.length === 0}
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
