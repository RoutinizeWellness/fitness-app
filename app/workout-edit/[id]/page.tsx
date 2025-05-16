"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Save } from "lucide-react"
import { format, parseISO } from "date-fns"
import { getWorkoutById, updateWorkout } from "@/lib/supabase-queries"
import { Workout } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export default function WorkoutEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  // Usar React.use() para desenvolver los parámetros
  const unwrappedParams = use(params)
  const workoutId = unwrappedParams.id
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    date: "",
    sets: "",
    reps: "",
    weight: "",
    duration: "",
    distance: "",
    notes: ""
  })

  useEffect(() => {
    const loadWorkout = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await getWorkoutById(workoutId)

        if (error) {
          throw error
        }

        if (data) {
          setWorkout(data)
          setFormData({
            name: data.name,
            type: data.type,
            date: data.date,
            sets: data.sets || "",
            reps: data.reps || "",
            weight: data.weight || "",
            duration: data.duration || "",
            distance: data.distance || "",
            notes: data.notes || ""
          })
        } else {
          toast({
            title: "Error",
            description: "No se encontró el entrenamiento",
            variant: "destructive",
          })
          router.push("/")
        }
      } catch (error) {
        console.error("Error al cargar el entrenamiento:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el entrenamiento",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkout()
  }, [workoutId, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { error } = await updateWorkout(workoutId, {
        name: formData.name,
        type: formData.type,
        date: formData.date,
        sets: formData.sets || null,
        reps: formData.reps || null,
        weight: formData.weight || null,
        duration: formData.duration || null,
        distance: formData.distance || null,
        notes: formData.notes || null
      })

      if (error) {
        throw error
      }

      toast({
        title: "Entrenamiento actualizado",
        description: "El entrenamiento ha sido actualizado correctamente",
      })

      router.push(`/workout-detail/${workoutId}`)
    } catch (error) {
      console.error("Error al actualizar el entrenamiento:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el entrenamiento",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-4xl mx-auto p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-xl">Editar Entrenamiento</h1>
          <div className="w-9"></div> {/* Spacer para centrar el título */}
        </div>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto p-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : workout ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Información básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del entrenamiento</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de entrenamiento</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleSelectChange("type", value)}
                      required
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fuerza">Fuerza</SelectItem>
                        <SelectItem value="Cardio">Cardio</SelectItem>
                        <SelectItem value="Flexibilidad">Flexibilidad</SelectItem>
                        <SelectItem value="HIIT">HIIT</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Detalles del entrenamiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sets">Series</Label>
                    <Input
                      id="sets"
                      name="sets"
                      value={formData.sets}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reps">Repeticiones</Label>
                    <Input
                      id="reps"
                      name="reps"
                      value={formData.reps}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración</Label>
                    <Input
                      id="duration"
                      name="duration"
                      placeholder="Ej: 45 minutos"
                      value={formData.duration}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distance">Distancia</Label>
                    <Input
                      id="distance"
                      name="distance"
                      placeholder="Ej: 5 km"
                      value={formData.distance}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Añade notas sobre tu entrenamiento"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>Guardando...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontró el entrenamiento</p>
            <Button className="mt-4" onClick={() => router.push("/")}>
              Volver al inicio
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
