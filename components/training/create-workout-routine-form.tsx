"use client"

import { useState } from "react"
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
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { saveWorkoutRoutine } from "@/lib/training-service"

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

interface CreateWorkoutRoutineFormProps {
  userId: string
  onSuccess?: (routineId: string) => void
  onCancel?: () => void
}

export function CreateWorkoutRoutineForm({ userId, onSuccess, onCancel }: CreateWorkoutRoutineFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form with default values
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

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una rutina",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create a new routine object
      const routineId = uuidv4()
      const newRoutine = {
        id: routineId,
        userId: userId,
        name: values.name,
        description: values.description,
        level: values.level,
        goal: values.goal,
        frequency: values.frequency,
        days: [
          {
            id: uuidv4(),
            name: "Día 1",
            exercises: []
          }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save the routine
      const { data, error } = await saveWorkoutRoutine(newRoutine)

      if (error) {
        throw error
      }

      // Show success message
      toast({
        title: "Rutina creada",
        description: "La rutina se ha creado correctamente.",
        variant: "default",
      })

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(routineId)
      } else {
        // Redirect to edit page
        router.push(`/training/edit/${routineId}`)
      }
    } catch (error) {
      console.error("Error al crear rutina:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la rutina. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-[#1B237E]">Crear nueva rutina de entrenamiento</CardTitle>
        <CardDescription>
          Completa el formulario para crear una nueva rutina personalizada.
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
                  <FormDescription>
                    Un nombre descriptivo para identificar tu rutina.
                  </FormDescription>
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
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
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
              Guardar rutina
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
